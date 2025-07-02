
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Pause, Play, Clock, AlertTriangle } from 'lucide-react';
import { toast } from 'sonner';

interface ProfilePauseManagerProps {
  packageType: number;
  packageName: string;
  isActive: boolean;
  onPauseToggle: () => void;
}

interface PauseStatus {
  isPaused: boolean;
  pausesUsed: number;
  maxPauses: number;
  currentPauseStart: string | null;
  resumeDate: string | null;
}

const ProfilePauseManager = ({ packageType, packageName, isActive, onPauseToggle }: ProfilePauseManagerProps) => {
  const [pauseStatus, setPauseStatus] = useState<PauseStatus>({
    isPaused: false,
    pausesUsed: 0,
    maxPauses: 3,
    currentPauseStart: null,
    resumeDate: null
  });
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);

  // Only show for packages 3 and 4
  const canUsePauseFeature = packageType >= 3;

  useEffect(() => {
    // Load pause status from localStorage (simulating database)
    const savedStatus = localStorage.getItem(`pause_status_${packageType}`);
    if (savedStatus) {
      setPauseStatus(JSON.parse(savedStatus));
    }
  }, [packageType]);

  const savePauseStatus = (status: PauseStatus) => {
    localStorage.setItem(`pause_status_${packageType}`, JSON.stringify(status));
    setPauseStatus(status);
  };

  const handlePauseProfile = () => {
    if (pauseStatus.pausesUsed >= pauseStatus.maxPauses) {
      toast.error("You've reached the maximum number of pauses for this package period");
      return;
    }

    const now = new Date();
    const resumeDate = new Date(now.getTime() + (7 * 24 * 60 * 60 * 1000)); // 7 days from now

    const newStatus: PauseStatus = {
      ...pauseStatus,
      isPaused: true,
      pausesUsed: pauseStatus.pausesUsed + 1,
      currentPauseStart: now.toISOString(),
      resumeDate: resumeDate.toISOString()
    };

    savePauseStatus(newStatus);
    onPauseToggle();
    setShowConfirmDialog(false);
    toast.success("Profile paused successfully. Billing will resume in 7 days.");
  };

  const handleResumeProfile = () => {
    const newStatus: PauseStatus = {
      ...pauseStatus,
      isPaused: false,
      currentPauseStart: null,
      resumeDate: null
    };

    savePauseStatus(newStatus);
    onPauseToggle();
    toast.success("Profile resumed successfully. Billing has been reactivated.");
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-AU', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (!canUsePauseFeature) {
    return null;
  }

  return (
    <Card className="border-blue-200">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-blue-700">
          <Pause className="h-5 w-5" />
          Profile Pause Control
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-muted-foreground">Current Status:</p>
            <Badge variant={pauseStatus.isPaused ? "secondary" : "default"} 
                   className={pauseStatus.isPaused ? "bg-orange-100 text-orange-800" : "bg-green-100 text-green-800"}>
              {pauseStatus.isPaused ? "Paused" : "Active"}
            </Badge>
          </div>
          <div className="text-right">
            <p className="text-sm text-muted-foreground">Pauses Used:</p>
            <span className="font-medium">{pauseStatus.pausesUsed} / {pauseStatus.maxPauses}</span>
          </div>
        </div>

        {pauseStatus.isPaused && pauseStatus.resumeDate && (
          <div className="bg-orange-50 p-3 rounded-lg border border-orange-200">
            <div className="flex items-center gap-2 text-orange-800 mb-2">
              <Clock className="h-4 w-4" />
              <span className="font-medium">Profile Paused</span>
            </div>
            <p className="text-sm text-orange-700">
              Billing will automatically resume on {formatDate(pauseStatus.resumeDate)}
            </p>
          </div>
        )}

        <div className="flex gap-2">
          {!pauseStatus.isPaused ? (
            <Dialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
              <DialogTrigger asChild>
                <Button 
                  variant="outline" 
                  className="flex-1"
                  disabled={pauseStatus.pausesUsed >= pauseStatus.maxPauses}
                >
                  <Pause className="h-4 w-4 mr-2" />
                  Pause Profile
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Pause Your Profile</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                    <div className="flex items-start gap-3">
                      <AlertTriangle className="h-5 w-5 text-blue-600 mt-0.5" />
                      <div>
                        <h4 className="font-medium text-blue-800 mb-2">Pause Terms</h4>
                        <ul className="text-sm text-blue-700 space-y-1">
                          <li>• Your profile will be hidden from search results</li>
                          <li>• Billing will continue for 7 days, then pause</li>
                          <li>• You can use up to 3 pauses per package period</li>
                          <li>• You can resume anytime during the 7-day period</li>
                          <li>• After 7 days, billing automatically stops</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex gap-3">
                    <Button variant="outline" onClick={() => setShowConfirmDialog(false)} className="flex-1">
                      Cancel
                    </Button>
                    <Button onClick={handlePauseProfile} className="flex-1 bg-orange-600 hover:bg-orange-700">
                      Confirm Pause
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          ) : (
            <Button onClick={handleResumeProfile} className="flex-1 bg-green-600 hover:bg-green-700">
              <Play className="h-4 w-4 mr-2" />
              Resume Profile
            </Button>
          )}
        </div>

        <div className="text-xs text-muted-foreground">
          <p>Available for {packageName} subscribers only</p>
          {pauseStatus.pausesUsed >= pauseStatus.maxPauses && (
            <p className="text-red-600 font-medium">Maximum pauses reached for this package period</p>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default ProfilePauseManager;
