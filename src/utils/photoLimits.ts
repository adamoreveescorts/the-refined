
export interface PhotoLimits {
  totalPhotos: number;
  galleryPhotos: number;
  profilePhoto: number;
}

export const getPhotoLimitsByTier = (subscriptionTier: string | null): PhotoLimits => {
  // Default limits for free/no subscription
  const defaultLimits: PhotoLimits = {
    totalPhotos: 1,
    galleryPhotos: 0,
    profilePhoto: 1
  };

  if (!subscriptionTier) return defaultLimits;

  switch (subscriptionTier) {
    case 'Trial': // Active trial from check-subscription function
    case 'Basic': // Free trial
    case 'Package1': // Limited Time Package 1
      return {
        totalPhotos: 11,
        galleryPhotos: 10,
        profilePhoto: 1
      };
    
    case 'Package2': // 4 Weeks Package 2
      return {
        totalPhotos: 16,
        galleryPhotos: 15,
        profilePhoto: 1
      };
    
    case 'Package3': // 12 Weeks Package 3
      return {
        totalPhotos: 31,
        galleryPhotos: 30,
        profilePhoto: 1
      };
    
    case 'Package4': // 52 Weeks Package 4
      return {
        totalPhotos: 51,
        galleryPhotos: 50,
        profilePhoto: 1
      };
    
    default:
      return defaultLimits;
  }
};

export const getSubscriptionTierName = (tier: string | null): string => {
  switch (tier) {
    case 'Trial':
    case 'Basic':
      return 'Free Trial';
    case 'Package1':
      return 'Package 1';
    case 'Package2':
      return 'Package 2';
    case 'Package3':
      return 'Package 3';
    case 'Package4':
      return 'Package 4';
    default:
      return 'No Plan';
  }
};
