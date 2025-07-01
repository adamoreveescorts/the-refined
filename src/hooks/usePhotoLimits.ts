
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { getPhotoLimitsByTier, PhotoLimits } from '@/utils/photoLimits';

interface PhotoUsage {
  totalCount: number;
  videoCount: number;
}

interface UsePhotoLimitsReturn {
  limits: PhotoLimits;
  usage: PhotoUsage;
  canUploadMore: boolean;
  canUploadVideo: boolean;
  subscriptionTier: string | null;
  loading: boolean;
  refresh: () => Promise<void>;
}

export const usePhotoLimits = (userId: string): UsePhotoLimitsReturn => {
  const [limits, setLimits] = useState<PhotoLimits>({ totalPhotos: 1, galleryPhotos: 0, profilePhoto: 1, videos: 1 });
  const [usage, setUsage] = useState<PhotoUsage>({ totalCount: 0, videoCount: 0 });
  const [subscriptionTier, setSubscriptionTier] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchPhotoLimitsAndUsage = useCallback(async () => {
    if (!userId) return;
    
    try {
      setLoading(true);
      
      // Get subscription info
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        const { data: subscriptionData } = await supabase.functions.invoke('check-subscription', {
          headers: {
            Authorization: `Bearer ${session.access_token}`,
          },
        });
        
        if (subscriptionData) {
          setSubscriptionTier(subscriptionData.subscription_tier);
        }
      }

      // Get current photo and video usage
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('gallery_images, gallery_videos')
        .eq('id', userId)
        .single();

      if (error) {
        console.error('Error fetching profile:', error);
        return;
      }

      // Count total photos and videos
      const totalCount = profile?.gallery_images ? profile.gallery_images.length : 0;
      const videoCount = profile?.gallery_videos ? profile.gallery_videos.length : 0;

      setUsage({
        totalCount,
        videoCount
      });

    } catch (error) {
      console.error('Error fetching photo limits:', error);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    fetchPhotoLimitsAndUsage();
  }, [fetchPhotoLimitsAndUsage]);

  useEffect(() => {
    setLimits(getPhotoLimitsByTier(subscriptionTier));
  }, [subscriptionTier]);

  const canUploadMore = usage.totalCount < limits.totalPhotos;
  const canUploadVideo = usage.videoCount < limits.videos;

  return {
    limits,
    usage,
    canUploadMore,
    canUploadVideo,
    subscriptionTier,
    loading,
    refresh: fetchPhotoLimitsAndUsage
  };
};
