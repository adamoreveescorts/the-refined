
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Camera, Video, Crown, AlertCircle } from 'lucide-react';
import { getSubscriptionTierName } from '@/utils/photoLimits';

interface PhotoLimitsDisplayProps {
  usage: {
    totalCount: number;
    videoCount?: number;
  };
  limits: {
    totalPhotos: number;
    videos?: number;
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
  const photoPercentage = (usage.totalCount / limits.totalPhotos) * 100;
  const videoPercentage = limits.videos ? ((usage.videoCount || 0) / limits.videos) * 100 : 0;
  const isPhotoLimitReached = usage.totalCount >= limits.totalPhotos;
  const isVideoLimitReached = limits.videos ? (usage.videoCount || 0) >= limits.videos : false;

  return (
    <Card className="bg-card shadow-sm border-border">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg text-foreground">Media Limits</CardTitle>
          <Badge variant="outline" className="text-xs">
            {getSubscriptionTierName(subscriptionTier)}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Photo Usage */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2">
              <Camera className="h-4 w-4 text-muted-foreground" />
              <span className="text-foreground">Photos</span>
            </div>
            <span className={`font-medium ${isPhotoLimitReached ? 'text-red-600' : 'text-muted-foreground'}`}>
              {usage.totalCount} / {limits.totalPhotos}
            </span>
          </div>
          <Progress value={photoPercentage} className="h-2" />
        </div>

        {/* Video Usage */}
        {limits.videos && (
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2">
                <Video className="h-4 w-4 text-muted-foreground" />
                <span className="text-foreground">Videos</span>
              </div>
              <span className={`font-medium ${isVideoLimitReached ? 'text-red-600' : 'text-muted-foreground'}`}>
                {usage.videoCount || 0} / {limits.videos}
              </span>
            </div>
            <Progress value={videoPercentage} className="h-2" />
          </div>
        )}

        {/* Upgrade prompt if limits reached */}
        {(isPhotoLimitReached || isVideoLimitReached) && showUpgradeButton && onUpgrade && (
          <div className="p-3 bg-amber-50 border border-amber-200 rounded-md">
            <div className="flex items-start gap-2">
              <AlertCircle className="h-4 w-4 text-amber-600 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-sm text-amber-800 font-medium">
                  {isPhotoLimitReached && isVideoLimitReached 
                    ? "Photo and video limits reached"
                    : isPhotoLimitReached 
                    ? "Photo limit reached"
                    : "Video limit reached"}
                </p>
                <p className="text-xs text-amber-700 mt-1">
                  Upgrade your plan to upload more content
                </p>
                <Button 
                  onClick={onUpgrade}
                  size="sm"
                  className="mt-2 bg-gold hover:bg-gold/90 text-white"
                >
                  <Crown className="h-3 w-3 mr-1" />
                  Upgrade Plan
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Info about video limits */}
        {limits.videos && (
          <div className="text-xs text-muted-foreground">
            <p>• Videos must be under 1 minute and 50MB max</p>
            <p>• Supported formats: MP4, MOV, AVI</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default PhotoLimitsDisplay;
