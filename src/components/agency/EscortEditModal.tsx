
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Edit } from 'lucide-react';

interface EscortEditModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  escort: any;
  onEscortUpdated: () => void;
}

const EscortEditModal = ({ 
  open, 
  onOpenChange, 
  escort,
  onEscortUpdated 
}: EscortEditModalProps) => {
  const [formData, setFormData] = useState({
    display_name: '',
    email: '',
    bio: '',
    age: '',
    location: '',
    height: '',
    hourly_rate: '',
    services: ''
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (escort) {
      setFormData({
        display_name: escort.display_name || '',
        email: escort.email || '',
        bio: escort.bio || '',
        age: escort.age || '',
        location: escort.location || '',
        height: escort.height || '',
        hourly_rate: escort.hourly_rate || '',
        services: escort.services || ''
      });
    }
  }, [escort]);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!escort?.id) return;

    setLoading(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          display_name: formData.display_name,
          email: formData.email.toLowerCase(),
          bio: formData.bio,
          age: formData.age,
          location: formData.location,
          height: formData.height,
          hourly_rate: formData.hourly_rate,
          services: formData.services,
          updated_at: new Date().toISOString()
        })
        .eq('id', escort.id);

      if (error) {
        console.error('Error updating escort profile:', error);
        throw error;
      }

      toast.success('Escort profile updated successfully');
      onEscortUpdated();
      onOpenChange(false);
    } catch (error) {
      console.error('Error updating escort profile:', error);
      toast.error('Failed to update escort profile');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center">
            <Edit className="h-5 w-5 mr-2" />
            Edit Escort Profile
          </DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="display_name">Display Name *</Label>
              <Input
                id="display_name"
                placeholder="Escort display name"
                value={formData.display_name}
                onChange={(e) => handleInputChange('display_name', e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <Input
                id="email"
                type="email"
                placeholder="escort@example.com"
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="bio">Bio</Label>
            <Textarea
              id="bio"
              placeholder="Brief description about the escort..."
              value={formData.bio}
              onChange={(e) => handleInputChange('bio', e.target.value)}
              rows={3}
            />
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="age">Age</Label>
              <Input
                id="age"
                placeholder="25"
                value={formData.age}
                onChange={(e) => handleInputChange('age', e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="location">Location</Label>
              <Input
                id="location"
                placeholder="City, State"
                value={formData.location}
                onChange={(e) => handleInputChange('location', e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="height">Height</Label>
              <Input
                id="height"
                placeholder="5'6"
                value={formData.height}
                onChange={(e) => handleInputChange('height', e.target.value)}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="hourly_rate">Hourly Rate</Label>
              <Input
                id="hourly_rate"
                placeholder="$200"
                value={formData.hourly_rate}
                onChange={(e) => handleInputChange('hourly_rate', e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="services">Services</Label>
              <Input
                id="services"
                placeholder="Companionship, Dinner dates"
                value={formData.services}
                onChange={(e) => handleInputChange('services', e.target.value)}
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={loading}
              className="bg-secondary hover:bg-secondary/90"
            >
              {loading ? 'Updating...' : 'Update Profile'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default EscortEditModal;
