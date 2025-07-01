
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { getPhotoLimitsByTier, PhotoLimits } from '@/utils/photoLimits';

interface PhotoUsage {
  totalCount: number;
}

interface UsePhotoLimitsReturn {
  limits: PhotoLimits;
  usage: PhotoUsage;
  canUploadMore: boolean;
  subscriptionTier: string | null;
  loading: boolean;
}

export const usePhotoLimits = (userId: string): UsePhotoLimitsReturn => {
  const [limits, setLimits] = useState<PhotoLimits>({ totalPhotos: 1, galleryPhotos: 0, profilePhoto: 1 });
  const [usage, setUsage] = useState<PhotoUsage>({ totalCount: 0 });
  const [subscriptionTier, setSubscriptionTier] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId) return;
    
    const fetchPhotoLimitsAndUsage = async () => {
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

        // Get current photo usage - count all photos in gallery_images array
        const { data: profile, error } = await supabase
          .from('profiles')
          .select('gallery_images')
          .eq('id', userId)
          .single();

        if (error) {
          console.error('Error fetching profile:', error);
          return;
        }

        // Count total photos in the unified photo pool
        const totalCount = profile?.gallery_images ? profile.gallery_images.length : 0;

        setUsage({
          totalCount
        });

      } catch (error) {
        console.error('Error fetching photo limits:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchPhotoLimitsAndUsage();
  }, [userId]);

  useEffect(() => {
    setLimits(getPhotoLimitsByTier(subscriptionTier));
  }, [subscriptionTier]);

  const canUploadMore = usage.totalCount < limits.totalPhotos;

  return {
    limits,
    usage,
    canUploadMore,
    subscriptionTier,
    loading
  };
};
