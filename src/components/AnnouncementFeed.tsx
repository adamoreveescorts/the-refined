
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Bell, Calendar, User, RefreshCw } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useUserRole } from '@/hooks/useUserRole';
import { Link } from 'react-router-dom';

interface AnnouncementWithProfile {
  id: string;
  title: string;
  content: string;
  announcement_type: 'general' | 'availability' | 'special_offer' | 'update';
  created_at: string;
  escort_id: string;
  escort_name: string;
  escort_avatar: string | null;
  is_read: boolean;
}

export const AnnouncementFeed = () => {
  const { user, profile } = useUserRole();
  const [announcements, setAnnouncements] = useState<AnnouncementWithProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    if (user && profile?.role === 'client') {
      fetchAnnouncements();
      
      // Set up real-time subscription
      const channel = supabase
        .channel('announcement-updates')
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'announcements'
          },
          () => fetchAnnouncements()
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [user, profile]);

  const fetchAnnouncements = async () => {
    if (!user) return;

    try {
      // Get announcements from followed escorts
      const { data, error } = await supabase
        .from('user_follows')
        .select(`
          followed_id,
          profiles!user_follows_followed_id_fkey (
            id,
            display_name,
            profile_picture,
            announcements!announcements_escort_id_fkey (
              id,
              title,
              content,
              announcement_type,
              created_at,
              escort_id
            )
          )
        `)
        .eq('follower_id', user.id)
        .eq('is_active', true);

      if (error) throw error;

      // Flatten the data and check read status
      const flatAnnouncements: AnnouncementWithProfile[] = [];
      
      for (const follow of data || []) {
        const profile = follow.profiles;
        if (profile?.announcements) {
          for (const announcement of profile.announcements) {
            // Check if announcement is read
            const { data: readData } = await supabase
              .from('announcement_reads')
              .select('id')
              .eq('announcement_id', announcement.id)
              .eq('user_id', user.id)
              .single();

            flatAnnouncements.push({
              ...announcement,
              escort_name: profile.display_name || 'Anonymous',
              escort_avatar: profile.profile_picture,
              is_read: !!readData
            });
          }
        }
      }

      // Sort by creation date (newest first)
      flatAnnouncements.sort((a, b) => 
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );

      setAnnouncements(flatAnnouncements);
    } catch (error) {
      console.error('Error fetching announcements:', error);
      toast.error('Failed to load announcements');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const markAsRead = async (announcementId: string) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('announcement_reads')
        .upsert({
          announcement_id: announcementId,
          user_id: user.id
        });

      if (error) throw error;

      // Update local state
      setAnnouncements(prev =>
        prev.map(ann =>
          ann.id === announcementId ? { ...ann, is_read: true } : ann
        )
      );
    } catch (error) {
      console.error('Error marking announcement as read:', error);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    fetchAnnouncements();
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'availability': return 'bg-green-100 text-green-800';
      case 'special_offer': return 'bg-purple-100 text-purple-800';
      case 'update': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'availability': return 'Availability';
      case 'special_offer': return 'Special Offer';
      case 'update': return 'Update';
      default: return 'General';
    }
  };

  if (profile?.role !== 'client') {
    return null;
  }

  const unreadCount = announcements.filter(a => !a.is_read).length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Bell className="h-5 w-5" />
          <h2 className="text-xl font-semibold">Announcements</h2>
          {unreadCount > 0 && (
            <Badge className="bg-red-100 text-red-800">
              {unreadCount} new
            </Badge>
          )}
        </div>
        <Button
          onClick={handleRefresh}
          variant="outline"
          size="sm"
          disabled={refreshing}
        >
          <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      <ScrollArea className="h-[600px]">
        <div className="space-y-4">
          {loading ? (
            <div className="text-center py-8">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              <p className="mt-2 text-muted-foreground">Loading announcements...</p>
            </div>
          ) : announcements.length === 0 ? (
            <Card>
              <CardContent className="text-center py-8">
                <Bell className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">No announcements yet</p>
                <p className="text-sm text-muted-foreground">
                  Follow some escorts to see their announcements here
                </p>
                <Link to="/directory">
                  <Button className="mt-4 btn-gold">
                    Browse Directory
                  </Button>
                </Link>
              </CardContent>
            </Card>
          ) : (
            announcements.map((announcement) => (
              <Card 
                key={announcement.id} 
                className={`cursor-pointer transition-colors ${
                  !announcement.is_read ? 'border-l-4 border-l-primary bg-blue-50/30' : ''
                }`}
                onClick={() => !announcement.is_read && markAsRead(announcement.id)}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <Link to={`/profile/${announcement.escort_id}`}>
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={announcement.escort_avatar || ''} />
                          <AvatarFallback>
                            <User className="h-4 w-4" />
                          </AvatarFallback>
                        </Avatar>
                      </Link>
                      <div>
                        <Link 
                          to={`/profile/${announcement.escort_id}`}
                          className="font-medium hover:underline"
                        >
                          {announcement.escort_name}
                        </Link>
                        <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
                          <Calendar className="h-3 w-3" />
                          {new Date(announcement.created_at).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge className={getTypeColor(announcement.announcement_type)}>
                        {getTypeLabel(announcement.announcement_type)}
                      </Badge>
                      {!announcement.is_read && (
                        <div className="w-2 h-2 bg-primary rounded-full"></div>
                      )}
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <CardTitle className="text-base mb-2">
                    {announcement.title}
                  </CardTitle>
                  <p className="text-muted-foreground text-sm whitespace-pre-wrap">
                    {announcement.content}
                  </p>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </ScrollArea>
    </div>
  );
};
