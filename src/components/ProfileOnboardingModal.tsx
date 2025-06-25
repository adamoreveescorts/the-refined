
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, Circle, Camera, User, Phone, Mail, DollarSign, Star } from "lucide-react";

interface ProfileOnboardingModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentProgress: number;
  userRole: string;
}

const ProfileOnboardingModal = ({ 
  isOpen, 
  onClose, 
  currentProgress,
  userRole 
}: ProfileOnboardingModalProps) => {
  const [currentStep, setCurrentStep] = useState(0);

  const onboardingSteps = [
    {
      icon: <User className="h-6 w-6 text-secondary" />,
      title: "Complete Basic Information",
      description: "Add your display name, bio, age, and location",
      isComplete: currentProgress >= 20
    },
    {
      icon: <Camera className="h-6 w-6 text-secondary" />,
      title: "Upload Profile Photos",
      description: "Add a profile picture and gallery images to showcase yourself",
      isComplete: currentProgress >= 40
    },
    {
      icon: <Phone className="h-6 w-6 text-secondary" />,
      title: "Add Contact Information",
      description: "Include your phone number and email for client communication",
      isComplete: currentProgress >= 60
    },
    {
      icon: <DollarSign className="h-6 w-6 text-secondary" />,
      title: "Set Your Rates",
      description: "Configure your pricing for different services and durations",
      isComplete: currentProgress >= 80
    },
    {
      icon: <Star className="h-6 w-6 text-secondary" />,
      title: "Finalize Profile",
      description: "Review your profile and make it visible to clients",
      isComplete: currentProgress >= 100
    }
  ];

  const completedSteps = onboardingSteps.filter(step => step.isComplete).length;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="text-2xl font-serif text-center">
            🎉 Welcome to Adam or Eve Escorts!
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          <div className="text-center">
            <Badge className="bg-green-500 text-white mb-4">
              Plan Activated Successfully
            </Badge>
            <p className="text-muted-foreground">
              {userRole === 'agency' 
                ? "Your agency subscription is now active! Let's set up your profile to start managing escorts."
                : "Your subscription is now active! Let's complete your profile to start attracting clients."
              }
            </p>
          </div>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold">Profile Completion</h3>
                <span className="text-sm text-muted-foreground">
                  {completedSteps}/{onboardingSteps.length} steps completed
                </span>
              </div>
              <Progress value={currentProgress} className="mb-4" />
              
              <div className="space-y-4">
                {onboardingSteps.map((step, index) => (
                  <div key={index} className="flex items-start gap-3">
                    <div className="mt-1">
                      {step.isComplete ? (
                        <CheckCircle className="h-5 w-5 text-green-500" />
                      ) : (
                        <Circle className="h-5 w-5 text-muted-foreground" />
                      )}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        {step.icon}
                        <h4 className={`font-medium ${step.isComplete ? 'text-green-600' : 'text-foreground'}`}>
                          {step.title}
                        </h4>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {step.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h4 className="font-medium text-blue-900 mb-2">💡 Pro Tips</h4>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• Profiles with photos get 3x more views</li>
              <li>• Complete profiles rank higher in search results</li>
              <li>• Verified profiles build more trust with clients</li>
            </ul>
          </div>

          <div className="flex gap-3">
            <Button 
              className="flex-1 bg-secondary hover:bg-secondary/90 text-secondary-foreground"
              onClick={onClose}
            >
              Get Started Now
            </Button>
            <Button 
              variant="outline" 
              onClick={onClose}
              className="px-6"
            >
              Skip for Now
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ProfileOnboardingModal;
