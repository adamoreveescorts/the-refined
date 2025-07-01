
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { Camera, Crown, AlertCircle } from 'lucide-react';
import { getSubscriptionTierName } from '@/utils/photoLimits';

interface PhotoLimitsDisplayProps {
  usage: {
    profilePictureCount: number;
    galleryCount: number;
    totalCount: number;
  };
  limits: {
    totalPhotos: number;
    galleryPhotos: number;
    profilePhoto: number;
  };
  subscriptionTier: string | null;
  onUpgrade?: () => void;
  showUpgradeButton?: boolean;
}

const PhotoLimitsDisplay = ({ 
  usage, 
  limits, 
  subscriptionTier, 
  onUpgrade,
  showUpgradeButton = true 
}: PhotoLimitsDisplayProps) => {
  const progressPercentage = (usage.totalCount / limits.totalPhotos) * 100;
  const isNearLimit = progressPercentage >= 80;
  const isAtLimit = usage.totalCount >= limits.totalPhotos;

  return (
    <div className="space-y-4 p-4 border rounded-lg bg-card">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Camera className="h-4 w-4 text-muted-foreground" />
          <span className="font-medium">Photo Usage</span>
        </div>
        <Badge variant={subscriptionTier ? "default" : "outline"}>
          {getSubscriptionTierName(subscriptionTier)}
        </Badge>
      </div>

      <div className="space-y-2">
        <div className="flex justify-between text-sm">
          <span>Photos Used</span>
          <span className={isAtLimit ? "text-red-600" : isNearLimit ? "text-amber-600" : "text-foreground"}>
            {usage.totalCount} / {limits.totalPhotos}
          </span>
        </div>
        <Progress 
          value={progressPercentage} 
          className={`h-2 ${
            isAtLimit ? "[&>div]:bg-red-500" : 
            isNearLimit ? "[&>div]:bg-amber-500" : 
            "[&>div]:bg-green-500"
          }`}
        />
      </div>

      <div className="grid grid-cols-2 gap-4 text-sm">
        <div>
          <span className="text-muted-foreground">Profile Picture</span>
          <div className="font-medium">{usage.profilePictureCount} / {limits.profilePhoto}</div>
        </div>
        <div>
          <span className="text-muted-foreground">Gallery Photos</span>
          <div className="font-medium">{usage.galleryCount} / {limits.galleryPhotos}</div>
        </div>
      </div>

      {isAtLimit && (
        <div className="flex items-start gap-2 p-3 bg-amber-50 border border-amber-200 rounded-md">
          <AlertCircle className="h-4 w-4 text-amber-600 mt-0.5 flex-shrink-0" />
          <div className="flex-1">
            <p className="text-sm text-amber-800 font-medium">Photo limit reached</p>
            <p className="text-xs text-amber-700 mt-1">
              Upgrade your plan to upload more photos and unlock additional features.
            </p>
          </div>
        </div>
      )}

      {isNearLimit && !isAtLimit && (
        <div className="flex items-start gap-2 p-3 bg-blue-50 border border-blue-200 rounded-md">
          <AlertCircle className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
          <div className="flex-1">
            <p className="text-sm text-blue-800 font-medium">Approaching photo limit</p>
            <p className="text-xs text-blue-700 mt-1">
              Consider upgrading for more photos and premium features.
            </p>
          </div>
        </div>
      )}

      {showUpgradeButton && (isAtLimit || isNearLimit) && onUpgrade && (
        <Button 
          onClick={onUpgrade}
          className="w-full bg-gold hover:bg-gold/90 text-white"
          size="sm"
        >
          <Crown className="h-4 w-4 mr-2" />
          Upgrade Plan
        </Button>
      )}
    </div>
  );
};

export default PhotoLimitsDisplay;
