
import { useMemo } from 'react';

interface ProfileData {
  display_name?: string;
  bio?: string;
  location?: string;
  age?: string;
  profile_picture?: string;
  gallery_images?: string[];
  email?: string;
  phone?: string;
  incall_hourly_rate?: string;
  outcall_hourly_rate?: string;
  services?: string;
  verified?: boolean;
}

export const useProfileCompletion = (profile: ProfileData | null) => {
  return useMemo(() => {
    if (!profile) return 0;

    let score = 0;
    const maxScore = 100;

    // Basic info (40 points total)
    if (profile.display_name?.trim()) score += 10;
    if (profile.bio?.trim()) score += 10;
    if (profile.location?.trim()) score += 10;
    if (profile.age?.trim()) score += 10;

    // Photos (30 points total)
    if (profile.profile_picture?.trim()) score += 20;
    if (profile.gallery_images && profile.gallery_images.length > 0) score += 10;

    // Contact info (20 points total)
    if (profile.email?.trim()) score += 10;
    if (profile.phone?.trim()) score += 10;

    // Rates/Services (10 points total)
    if (profile.incall_hourly_rate?.trim() || profile.outcall_hourly_rate?.trim()) score += 5;
    if (profile.services?.trim()) score += 5;

    return Math.min(score, maxScore);
  }, [profile]);
};
