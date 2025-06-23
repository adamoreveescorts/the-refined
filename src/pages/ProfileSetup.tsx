
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useUserRole } from '@/hooks/useUserRole';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle, Circle, ArrowLeft, ArrowRight } from 'lucide-react';
import BasicInfoStep from '@/components/profile-setup/BasicInfoStep';
import PhotosStep from '@/components/profile-setup/PhotosStep';
import VerificationStep from '@/components/profile-setup/VerificationStep';
import ServicesRatesStep from '@/components/profile-setup/ServicesRatesStep';
import ReviewPublishStep from '@/components/profile-setup/ReviewPublishStep';

interface ProfileData {
  display_name?: string;
  bio?: string;
  location?: string;
  age?: string;
  height?: string;
  profile_picture?: string;
  gallery_images?: string[];
  services?: string;
  hourly_rate?: string;
  overnight_rate?: string;
  languages?: string;
  availability?: string;
  verified?: boolean;
  profile_completion_percentage?: number;
  setup_step_completed?: any;
}

const STEPS = [
  { id: 1, title: 'Basic Info', description: 'Tell us about yourself' },
  { id: 2, title: 'Photos', description: 'Upload your photos' },
  { id: 3, title: 'Verification', description: 'Verify your identity' },
  { id: 4, title: 'Services & Rates', description: 'Set your offerings' },
  { id: 5, title: 'Review & Publish', description: 'Review and go live' }
];

const ProfileSetup = () => {
  const navigate = useNavigate();
  const { user, profile, loading } = useUserRole();
  const [currentStep, setCurrentStep] = useState(1);
  const [profileData, setProfileData] = useState<ProfileData>({});
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (!loading) {
      if (!user) {
        toast.error("Please log in first");
        navigate("/auth");
        return;
      }

      if (profile?.role !== 'escort') {
        toast.error("This page is only for escorts");
        navigate("/");
        return;
      }

      // Check if setup is already completed
      if (profile?.setup_completed) {
        toast.info("Your profile is already set up!");
        navigate("/");
        return;
      }

      fetchProfileData();
    }
  }, [user, profile, loading, navigate]);

  const fetchProfileData = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (error) {
        console.error('Error fetching profile:', error);
        return;
      }

      setProfileData(data || {});
      
      // Determine completed steps based on existing data
      const completed: number[] = [];
      const stepData = data?.setup_step_completed || {};
      
      Object.keys(stepData).forEach(step => {
        if (stepData[step]) {
          completed.push(parseInt(step));
        }
      });

      setCompletedSteps(completed);
      
      // Set current step to first incomplete step
      const firstIncomplete = STEPS.find(step => !completed.includes(step.id));
      if (firstIncomplete) {
        setCurrentStep(firstIncomplete.id);
      }
    } catch (error) {
      console.error('Error:', error);
      toast.error('Error loading profile data');
    }
  };

  const updateProfileData = async (updates: Partial<ProfileData>) => {
    if (!user) return;

    setIsSaving(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', user.id);

      if (error) throw error;

      setProfileData(prev => ({ ...prev, ...updates }));
      toast.success('Progress saved!');
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error('Error saving changes');
    } finally {
      setIsSaving(false);
    }
  };

  const markStepCompleted = async (stepId: number) => {
    if (!user) return;

    const newCompletedSteps = [...completedSteps];
    if (!newCompletedSteps.includes(stepId)) {
      newCompletedSteps.push(stepId);
      setCompletedSteps(newCompletedSteps);
    }

    // Update step completion in database
    const stepCompletionData = { ...profileData.setup_step_completed };
    stepCompletionData[stepId.toString()] = true;

    await updateProfileData({ 
      setup_step_completed: stepCompletionData 
    });
  };

  const goToNextStep = () => {
    if (currentStep < STEPS.length) {
      setCurrentStep(currentStep + 1);
    }
  };

  const goToPreviousStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <BasicInfoStep
            profileData={profileData}
            onUpdate={updateProfileData}
            onComplete={() => markStepCompleted(1)}
          />
        );
      case 2:
        return (
          <PhotosStep
            profileData={profileData}
            onUpdate={updateProfileData}
            onComplete={() => markStepCompleted(2)}
          />
        );
      case 3:
        return (
          <VerificationStep
            profileData={profileData}
            onUpdate={updateProfileData}
            onComplete={() => markStepCompleted(3)}
          />
        );
      case 4:
        return (
          <ServicesRatesStep
            profileData={profileData}
            onUpdate={updateProfileData}
            onComplete={() => markStepCompleted(4)}
          />
        );
      case 5:
        return (
          <ReviewPublishStep
            profileData={profileData}
            onUpdate={updateProfileData}
            onComplete={() => markStepCompleted(5)}
            onPublish={() => {
              toast.success('Profile published successfully!');
              navigate('/');
            }}
          />
        );
      default:
        return null;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gold mx-auto mb-4"></div>
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  const progressPercentage = (completedSteps.length / STEPS.length) * 100;

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-serif font-bold text-navy mb-2">
            Complete Your Profile Setup
          </h1>
          <p className="text-gray-600">
            Let's get your profile ready to attract clients
          </p>
        </div>

        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium text-gray-700">
              Step {currentStep} of {STEPS.length}
            </span>
            <span className="text-sm font-medium text-gray-700">
              {Math.round(progressPercentage)}% Complete
            </span>
          </div>
          <Progress value={progressPercentage} className="h-2" />
        </div>

        {/* Step Navigation */}
        <div className="flex justify-between items-center mb-8 overflow-x-auto">
          {STEPS.map((step, index) => (
            <div key={step.id} className="flex items-center min-w-0">
              <div className="flex flex-col items-center">
                <div className={`flex items-center justify-center w-10 h-10 rounded-full border-2 ${
                  completedSteps.includes(step.id)
                    ? 'bg-green-500 border-green-500 text-white'
                    : currentStep === step.id
                    ? 'border-gold bg-gold text-white'
                    : 'border-gray-300 text-gray-500'
                }`}>
                  {completedSteps.includes(step.id) ? (
                    <CheckCircle className="h-6 w-6" />
                  ) : (
                    <span className="text-sm font-medium">{step.id}</span>
                  )}
                </div>
                <div className="text-center mt-2">
                  <p className="text-xs font-medium text-gray-900">{step.title}</p>
                  <p className="text-xs text-gray-500 hidden sm:block">{step.description}</p>
                </div>
              </div>
              {index < STEPS.length - 1 && (
                <div className="w-full h-px bg-gray-300 mx-4 hidden sm:block" />
              )}
            </div>
          ))}
        </div>

        {/* Step Content */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="text-xl">
              {STEPS[currentStep - 1]?.title}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {renderStepContent()}
          </CardContent>
        </Card>

        {/* Navigation Buttons */}
        <div className="flex justify-between">
          <Button
            variant="outline"
            onClick={goToPreviousStep}
            disabled={currentStep === 1}
            className="flex items-center"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Previous
          </Button>
          
          <div className="flex gap-2">
            <Button
              variant="ghost"
              onClick={() => navigate('/')}
            >
              Save & Continue Later
            </Button>
            
            {currentStep < STEPS.length && (
              <Button
                onClick={goToNextStep}
                className="flex items-center"
                disabled={isSaving}
              >
                Next
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileSetup;
