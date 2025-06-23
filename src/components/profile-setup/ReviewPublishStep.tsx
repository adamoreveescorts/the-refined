
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, Clock, XCircle, User, MapPin, Camera, Shield, DollarSign, Globe } from 'lucide-react';
import { toast } from 'sonner';

interface ReviewPublishStepProps {
  profileData: any;
  onUpdate: (data: any) => Promise<void>;
  onComplete: () => void;
  onPublish: () => void;
}

const ReviewPublishStep = ({ profileData, onUpdate, onComplete, onPublish }: ReviewPublishStepProps) => {
  const [isPublishing, setIsPublishing] = useState(false);

  const handlePublish = async () => {
    setIsPublishing(true);
    try {
      await onUpdate({ 
        setup_completed: true,
        status: 'approved',
        is_active: true
      });
      onComplete();
      onPublish();
    } catch (error) {
      console.error('Error publishing profile:', error);
      toast.error('Error publishing profile');
    } finally {
      setIsPublishing(false);
    }
  };

  const getCompletionItems = () => {
    return [
      {
        icon: <User className="h-5 w-5" />,
        title: 'Basic Information',
        completed: !!(profileData.display_name && profileData.bio && profileData.location && profileData.age),
        details: profileData.display_name ? `${profileData.display_name}, ${profileData.age}` : 'Not completed'
      },
      {
        icon: <Camera className="h-5 w-5" />,
        title: 'Photos',
        completed: !!(profileData.profile_picture || (profileData.gallery_images && profileData.gallery_images.length > 0)),
        details: profileData.profile_picture ? 'Profile picture uploaded' : 'No photos uploaded'
      },
      {
        icon: <Shield className="h-5 w-5" />,
        title: 'Verification',
        completed: !!profileData.verified,
        details: profileData.verified ? 'Photo verified' : 'Not verified (optional)'
      },
      {
        icon: <DollarSign className="h-5 w-5" />,
        title: 'Services & Rates',
        completed: !!(profileData.services && profileData.hourly_rate),
        details: profileData.hourly_rate ? `Starting at ${profileData.hourly_rate}` : 'Not set'
      }
    ];
  };

  const completionItems = getCompletionItems();
  const completedCount = completionItems.filter(item => item.completed).length;
  const completionPercentage = Math.round((completedCount / completionItems.length) * 100);

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h3 className="text-2xl font-semibold mb-2">Review Your Profile</h3>
        <p className="text-gray-600">
          Review your information before publishing your profile to go live
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Profile Completion</span>
            <Badge className={completionPercentage >= 70 ? 'bg-green-500' : 'bg-amber-500'}>
              {completionPercentage}% Complete
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {completionItems.map((item, index) => (
            <div key={index} className="flex items-start space-x-3">
              <div className={`p-2 rounded-full ${item.completed ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-400'}`}>
                {item.completed ? <CheckCircle className="h-4 w-4" /> : item.icon}
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <h4 className="font-medium">{item.title}</h4>
                  {item.completed ? (
                    <CheckCircle className="h-5 w-5 text-green-500" />
                  ) : (
                    <XCircle className="h-5 w-5 text-gray-400" />
                  )}
                </div>
                <p className="text-sm text-gray-600">{item.details}</p>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {profileData.display_name && (
        <Card>
          <CardHeader>
            <CardTitle>Profile Preview</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center space-x-4">
              {profileData.profile_picture ? (
                <img
                  src={profileData.profile_picture}
                  alt="Profile"
                  className="w-16 h-16 rounded-full object-cover"
                />
              ) : (
                <div className="w-16 h-16 rounded-full bg-gray-200 flex items-center justify-center">
                  <User className="h-8 w-8 text-gray-400" />
                </div>
              )}
              <div>
                <h3 className="text-xl font-semibold">{profileData.display_name}</h3>
                <div className="flex items-center text-gray-600">
                  <MapPin className="h-4 w-4 mr-1" />
                  {profileData.location}
                  {profileData.age && <span className="ml-2">• {profileData.age} years old</span>}
                </div>
              </div>
            </div>
            
            {profileData.bio && (
              <div>
                <h4 className="font-medium mb-1">About</h4>
                <p className="text-gray-600 text-sm">{profileData.bio.substring(0, 150)}...</p>
              </div>
            )}

            {profileData.hourly_rate && (
              <div>
                <h4 className="font-medium mb-1">Starting Rate</h4>
                <p className="text-green-600 font-semibold">{profileData.hourly_rate} per hour</p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {completionPercentage < 70 && (
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
          <h4 className="font-semibold text-amber-900 mb-2">Profile Incomplete</h4>
          <p className="text-sm text-amber-800">
            Your profile is {completionPercentage}% complete. We recommend completing at least 70% 
            of your profile before publishing to attract more clients.
          </p>
        </div>
      )}

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h4 className="font-semibold text-blue-900 mb-2">What happens when you publish?</h4>
        <ul className="text-sm text-blue-800 space-y-1">
          <li>• Your profile becomes visible to clients</li>
          <li>• You'll appear in search results</li>
          <li>• Clients can contact you through the platform</li>
          <li>• You can continue editing your profile anytime</li>
        </ul>
      </div>

      <div className="flex justify-center">
        <Button
          onClick={handlePublish}
          disabled={isPublishing}
          size="lg"
          className="px-12 bg-green-600 hover:bg-green-700"
        >
          {isPublishing ? 'Publishing...' : 'Publish Profile & Go Live'}
        </Button>
      </div>
    </div>
  );
};

export default ReviewPublishStep;
