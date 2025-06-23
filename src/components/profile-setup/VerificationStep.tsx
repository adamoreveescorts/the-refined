
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, Clock, XCircle, AlertCircle, Shield } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';

interface VerificationStepProps {
  profileData: any;
  onUpdate: (data: any) => Promise<void>;
  onComplete: () => void;
}

const VerificationStep = ({ profileData, onUpdate, onComplete }: VerificationStepProps) => {
  const navigate = useNavigate();
  const [verification, setVerification] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkVerificationStatus();
  }, []);

  const checkVerificationStatus = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data } = await supabase
        .from('photo_verifications')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      setVerification(data);
    } catch (error) {
      // No verification found is fine
      setVerification(null);
    } finally {
      setLoading(false);
    }
  };

  const handleStartVerification = () => {
    navigate('/photo-verification');
  };

  const handleSkip = async () => {
    try {
      await onUpdate({ verified: false });
      onComplete();
    } catch (error) {
      console.error('Error skipping verification:', error);
      toast.error('Error saving progress');
    }
  };

  const handleContinue = async () => {
    try {
      await onUpdate({ verified: verification?.status === 'approved' });
      onComplete();
    } catch (error) {
      console.error('Error saving verification status:', error);
      toast.error('Error saving progress');
    }
  };

  const getStatusDisplay = () => {
    if (!verification) {
      return {
        icon: <AlertCircle className="h-8 w-8 text-amber-500" />,
        badge: <Badge className="bg-amber-500">Not Started</Badge>,
        message: "Photo verification helps build trust with clients and increases your visibility in search results.",
        canContinue: true
      };
    }

    switch (verification.status) {
      case 'approved':
        return {
          icon: <CheckCircle className="h-8 w-8 text-green-500" />,
          badge: <Badge className="bg-green-500">Verified</Badge>,
          message: "Your photo verification has been approved! This will help increase client trust.",
          canContinue: true
        };
      
      case 'pending':
        return {
          icon: <Clock className="h-8 w-8 text-amber-500" />,
          badge: <Badge className="bg-amber-500">Under Review</Badge>,
          message: "Your verification is being reviewed. This usually takes 24-48 hours.",
          canContinue: true
        };
      
      case 'rejected':
        return {
          icon: <XCircle className="h-8 w-8 text-red-500" />,
          badge: <Badge variant="destructive">Rejected</Badge>,
          message: "Your verification was not approved. Please submit a new verification photo.",
          canContinue: true
        };
      
      default:
        return {
          icon: <AlertCircle className="h-8 w-8 text-amber-500" />,
          badge: <Badge className="bg-amber-500">Pending</Badge>,
          message: "Complete photo verification to build client trust.",
          canContinue: true
        };
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gold"></div>
      </div>
    );
  }

  const status = getStatusDisplay();

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center">
              {status.icon}
              <span className="ml-3">Photo Verification</span>
            </div>
            {status.badge}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-muted-foreground">{status.message}</p>
          
          {verification?.submitted_at && (
            <div className="text-sm text-muted-foreground">
              <p>Submitted: {new Date(verification.submitted_at).toLocaleDateString()}</p>
              {verification.reviewed_at && (
                <p>Reviewed: {new Date(verification.reviewed_at).toLocaleDateString()}</p>
              )}
            </div>
          )}

          {verification?.admin_notes && verification.status === 'rejected' && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-md">
              <p className="text-sm text-red-800">
                <strong>Admin Notes:</strong> {verification.admin_notes}
              </p>
            </div>
          )}

          <div className="flex gap-3">
            {!verification || verification.status === 'rejected' ? (
              <Button onClick={handleStartVerification} className="bg-blue-500 hover:bg-blue-600">
                <Shield className="h-4 w-4 mr-2" />
                Start Verification
              </Button>
            ) : verification.status === 'pending' ? (
              <Button variant="outline" onClick={() => navigate('/photo-verification')}>
                View Status
              </Button>
            ) : null}
          </div>
        </CardContent>
      </Card>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h4 className="font-semibold text-blue-900 mb-2">Why Get Verified?</h4>
        <ul className="text-sm text-blue-800 space-y-1">
          <li>• Builds trust with potential clients</li>
          <li>• Increases visibility in search results</li>
          <li>• Shows you're a legitimate escort</li>
          <li>• May be required for premium features</li>
        </ul>
      </div>

      <div className="flex justify-between">
        <Button variant="outline" onClick={handleSkip}>
          Skip for Now
        </Button>
        <Button 
          onClick={handleContinue}
          disabled={!status.canContinue}
          className="px-8"
        >
          Continue
        </Button>
      </div>
    </div>
  );
};

export default VerificationStep;
