
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { getPhotoLimitsByTier, PhotoLimits } from '@/utils/photoLimits';

interface PhotoUsage {
  profilePictureCount: number;
  galleryCount: number;
  totalCount: number;
}

interface UsePhotoLimitsReturn {
  limits: PhotoLimits;
  usage: PhotoUsage;
  canUploadMore: boolean;
  canUploadGallery: boolean;
  canUploadProfilePicture: boolean;
  subscriptionTier: string | null;
  loading: boolean;
}

export const usePhotoLimits = (userId: string): UsePhotoLimitsReturn => {
  const [limits, setLimits] = useState<PhotoLimits>({ totalPhotos: 1, galleryPhotos: 0, profilePhoto: 1 });
  const [usage, setUsage] = useState<PhotoUsage>({ profilePictureCount: 0, galleryCount: 0, totalCount: 0 });
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

        // Get current photo usage
        const { data: profile, error } = await supabase
          .from('profiles')
          .select('profile_picture, gallery_images')
          .eq('id', userId)
          .single();

        if (error) {
          console.error('Error fetching profile:', error);
          return;
        }

        const profilePictureCount = profile?.profile_picture ? 1 : 0;
        const galleryCount = profile?.gallery_images ? profile.gallery_images.length : 0;
        const totalCount = profilePictureCount + galleryCount;

        setUsage({
          profilePictureCount,
          galleryCount,
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
  const canUploadGallery = usage.galleryCount < limits.galleryPhotos;
  const canUploadProfilePicture = usage.profilePictureCount < limits.profilePhoto;

  return {
    limits,
    usage,
    canUploadMore,
    canUploadGallery,
    canUploadProfilePicture,
    subscriptionTier,
    loading
  };
};
