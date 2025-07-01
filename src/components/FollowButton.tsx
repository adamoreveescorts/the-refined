
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Heart, HeartHandshake } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useUserRole } from '@/hooks/useUserRole';

interface FollowButtonProps {
  escortId: string;
  escortName: string;
  initialFollowerCount?: number;
}

export const FollowButton = ({ escortId, escortName, initialFollowerCount = 0 }: FollowButtonProps) => {
  const { user, profile } = useUserRole();
  const [isFollowing, setIsFollowing] = useState(false);
  const [followerCount, setFollowerCount] = useState(initialFollowerCount);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user && profile?.role === 'client') {
      checkFollowStatus();
      fetchFollowerCount();
    }
  }, [user, escortId]);

  const checkFollowStatus = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .rpc('is_following', {
          follower_profile_id: user.id,
          followed_profile_id: escortId
        });

      if (error) throw error;
      setIsFollowing(data || false);
    } catch (error) {
      console.error('Error checking follow status:', error);
    }
  };

  const fetchFollowerCount = async () => {
    try {
      const { data, error } = await supabase
        .rpc('get_follower_count', {
          escort_profile_id: escortId
        });

      if (error) throw error;
      setFollowerCount(data || 0);
    } catch (error) {
      console.error('Error fetching follower count:', error);
    }
  };

  const handleFollow = async () => {
    if (!user || profile?.role !== 'client') {
      toast.error('Only clients can follow escorts');
      return;
    }

    setLoading(true);

    try {
      if (isFollowing) {
        // Unfollow
        const { error } = await supabase
          .from('user_follows')
          .update({ is_active: false })
          .eq('follower_id', user.id)
          .eq('followed_id', escortId);

        if (error) throw error;

        setIsFollowing(false);
        setFollowerCount(prev => Math.max(0, prev - 1));
        toast.success(`Unfollowed ${escortName}`);
      } else {
        // Follow
        const { error } = await supabase
          .from('user_follows')
          .upsert({
            follower_id: user.id,
            followed_id: escortId,
            is_active: true
          });

        if (error) throw error;

        setIsFollowing(true);
        setFollowerCount(prev => prev + 1);
        toast.success(`Now following ${escortName}`);
      }
    } catch (error) {
      console.error('Error updating follow status:', error);
      toast.error('Failed to update follow status');
    } finally {
      setLoading(false);
    }
  };

  // Don't show follow button to non-clients or if viewing own profile
  if (!user || profile?.role !== 'client' || user.id === escortId) {
    return (
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <HeartHandshake className="h-4 w-4" />
        <span>{followerCount} follower{followerCount !== 1 ? 's' : ''}</span>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-3">
      <Button
        onClick={handleFollow}
        disabled={loading}
        variant={isFollowing ? "outline" : "default"}
        size="sm"
        className={isFollowing ? "border-red-200 text-red-600 hover:bg-red-50" : "btn-gold"}
      >
        <Heart className={`h-4 w-4 mr-2 ${isFollowing ? 'fill-red-500 text-red-500' : ''}`} />
        {loading ? 'Loading...' : isFollowing ? 'Following' : 'Follow'}
      </Button>
      <div className="flex items-center gap-1 text-sm text-muted-foreground">
        <HeartHandshake className="h-4 w-4" />
        <span>{followerCount}</span>
      </div>
    </div>
  );
};
