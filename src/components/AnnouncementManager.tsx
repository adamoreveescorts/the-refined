
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Trash2, Edit, Plus, MessageSquare } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useUserRole } from '@/hooks/useUserRole';

type AnnouncementType = 'general' | 'availability' | 'special_offer' | 'update';

interface Announcement {
  id: string;
  title: string;
  content: string;
  announcement_type: AnnouncementType;
  created_at: string;
  updated_at: string;
  is_active: boolean;
}

const AnnouncementManager = () => {
  const { user, profile } = useUserRole();
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    announcement_type: 'general' as AnnouncementType
  });

  useEffect(() => {
    if (user && profile?.role === 'escort') {
      fetchAnnouncements();
    }
  }, [user, profile]);

  const fetchAnnouncements = async () => {
    try {
      const { data, error } = await supabase
        .from('announcements')
        .select('*')
        .eq('escort_id', user?.id)
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setAnnouncements(data || []);
    } catch (error) {
      console.error('Error fetching announcements:', error);
      toast.error('Failed to load announcements');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || profile?.role !== 'escort') return;

    setIsLoading(true);
    try {
      if (editingId) {
        // Update existing announcement
        const { error } = await supabase
          .from('announcements')
          .update({
            title: formData.title,
            content: formData.content,
            announcement_type: formData.announcement_type,
            updated_at: new Date().toISOString()
          })
          .eq('id', editingId)
          .eq('escort_id', user.id);

        if (error) throw error;
        toast.success('Announcement updated successfully');
      } else {
        // Create new announcement
        const { error } = await supabase
          .from('announcements')
          .insert({
            escort_id: user.id,
            title: formData.title,
            content: formData.content,
            announcement_type: formData.announcement_type
          });

        if (error) throw error;
        toast.success('Announcement created successfully');
      }

      // Reset form and refresh list
      setFormData({ title: '', content: '', announcement_type: 'general' });
      setShowForm(false);
      setEditingId(null);
      fetchAnnouncements();
    } catch (error) {
      console.error('Error saving announcement:', error);
      toast.error('Failed to save announcement');
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = (announcement: Announcement) => {
    setFormData({
      title: announcement.title,
      content: announcement.content,
      announcement_type: announcement.announcement_type
    });
    setEditingId(announcement.id);
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this announcement?')) return;

    try {
      const { error } = await supabase
        .from('announcements')
        .update({ is_active: false })
        .eq('id', id)
        .eq('escort_id', user?.id);

      if (error) throw error;
      toast.success('Announcement deleted successfully');
      fetchAnnouncements();
    } catch (error) {
      console.error('Error deleting announcement:', error);
      toast.error('Failed to delete announcement');
    }
  };

  const getTypeColor = (type: AnnouncementType) => {
    switch (type) {
      case 'availability': return 'bg-green-100 text-green-800';
      case 'special_offer': return 'bg-purple-100 text-purple-800';
      case 'update': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getTypeLabel = (type: AnnouncementType) => {
    switch (type) {
      case 'availability': return 'Availability';
      case 'special_offer': return 'Special Offer';
      case 'update': return 'Update';
      default: return 'General';
    }
  };

  if (profile?.role !== 'escort') {
    return null;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Manage Announcements</h2>
          <p className="text-muted-foreground">Send updates to your followers</p>
        </div>
        <Button onClick={() => setShowForm(!showForm)} className="btn-gold">
          <Plus className="h-4 w-4 mr-2" />
          New Announcement
        </Button>
      </div>

      {showForm && (
        <Card>
          <CardHeader>
            <CardTitle>{editingId ? 'Edit Announcement' : 'Create New Announcement'}</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Title</label>
                <Input
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="Enter announcement title"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2">Type</label>
                <Select 
                  value={formData.announcement_type} 
                  onValueChange={(value: AnnouncementType) => setFormData({ ...formData, announcement_type: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="general">General</SelectItem>
                    <SelectItem value="availability">Availability</SelectItem>
                    <SelectItem value="special_offer">Special Offer</SelectItem>
                    <SelectItem value="update">Update</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Content</label>
                <Textarea
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  placeholder="Write your announcement content..."
                  rows={4}
                  required
                />
              </div>

              <div className="flex gap-2">
                <Button type="submit" disabled={isLoading} className="btn-gold">
                  {isLoading ? 'Saving...' : editingId ? 'Update' : 'Create'}
                </Button>
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => {
                    setShowForm(false);
                    setEditingId(null);
                    setFormData({ title: '', content: '', announcement_type: 'general' });
                  }}
                >
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      <div className="space-y-4">
        {announcements.length === 0 ? (
          <Card>
            <CardContent className="text-center py-8">
              <MessageSquare className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">No announcements yet. Create your first one to start engaging with your followers!</p>
            </CardContent>
          </Card>
        ) : (
          announcements.map((announcement) => (
            <Card key={announcement.id}>
              <CardContent className="pt-6">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="font-semibold text-foreground">{announcement.title}</h3>
                      <Badge className={getTypeColor(announcement.announcement_type)}>
                        {getTypeLabel(announcement.announcement_type)}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mb-2">
                      {new Date(announcement.created_at).toLocaleDateString()} at {new Date(announcement.created_at).toLocaleTimeString()}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEdit(announcement)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDelete(announcement.id)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                <p className="text-foreground">{announcement.content}</p>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};

export default AnnouncementManager;
