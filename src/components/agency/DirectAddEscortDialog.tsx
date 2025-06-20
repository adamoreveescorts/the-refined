
import { useState } from 'react';
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
import { UserPlus } from 'lucide-react';

interface DirectAddEscortDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  agencyId: string;
  onEscortAdded: () => void;
  availableSeats: number;
}

const DirectAddEscortDialog = ({ 
  open, 
  onOpenChange, 
  agencyId, 
  onEscortAdded,
  availableSeats 
}: DirectAddEscortDialogProps) => {
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

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (availableSeats <= 0) {
      toast.error('No available seats. Please upgrade your subscription first.');
      return;
    }

    setLoading(true);
    try {
      // Check if email already exists
      const { data: existingProfile, error: checkError } = await supabase
        .from('profiles')
        .select('id, email')
        .eq('email', formData.email.toLowerCase())
        .single();

      if (checkError && checkError.code !== 'PGRST116') {
        throw checkError;
      }

      if (existingProfile) {
        toast.error('A profile with this email already exists');
        return;
      }

      // Generate a UUID for the new escort profile
      const escortId = crypto.randomUUID();

      console.log('Creating escort profile with data:', {
        id: escortId,
        role: 'escort',
        agency_id: agencyId,
        display_name: formData.display_name,
        email: formData.email.toLowerCase(),
        status: 'pending'
      });

      // Create the escort profile directly
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .insert({
          id: escortId,
          role: 'escort',
          agency_id: agencyId,
          display_name: formData.display_name,
          email: formData.email.toLowerCase(),
          bio: formData.bio,
          age: formData.age,
          location: formData.location,
          height: formData.height,
          hourly_rate: formData.hourly_rate,
          services: formData.services,
          status: 'pending', // Will be approved by admin later
          is_active: false,
          verified: false,
          featured: false
        })
        .select();

      if (profileError) {
        console.error('Profile creation error:', profileError);
        throw profileError;
      }

      console.log('Profile created successfully:', profileData);

      // Create the agency-escort relationship
      const { error: relationError } = await supabase
        .from('agency_escorts')
        .insert({
          agency_id: agencyId,
          escort_id: escortId,
          status: 'active',
          joined_at: new Date().toISOString()
        });

      if (relationError) {
        console.error('Agency-escort relationship error:', relationError);
        throw relationError;
      }

      console.log('Agency-escort relationship created successfully');

      toast.success('Escort profile created successfully! Profile pending admin approval.');
      onEscortAdded();
      onOpenChange(false);
      setFormData({
        display_name: '',
        email: '',
        bio: '',
        age: '',
        location: '',
        height: '',
        hourly_rate: '',
        services: ''
      });
    } catch (error) {
      console.error('Error creating escort profile:', error);
      toast.error('Failed to create escort profile');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center">
            <UserPlus className="h-5 w-5 mr-2" />
            Add New Escort
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
              <Label htmlFor="email">Email Address *</Label>
              <Input
                id="email"
                type="email"
                placeholder="escort@example.com"
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                required
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

          <div className="bg-muted p-3 rounded-md">
            <p className="text-sm text-muted-foreground">
              Available seats: <span className="font-medium">{availableSeats}</span>
            </p>
            {availableSeats <= 0 && (
              <p className="text-sm text-red-600 mt-1">
                No available seats. Please upgrade your subscription to add more escorts.
              </p>
            )}
          </div>

          <div className="bg-blue-50 p-3 rounded-md">
            <p className="text-sm text-blue-800">
              The escort profile will be created immediately and will be pending admin approval before going live.
            </p>
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
              disabled={loading || availableSeats <= 0}
              className="bg-secondary hover:bg-secondary/90"
            >
              {loading ? 'Creating...' : 'Create Escort Profile'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default DirectAddEscortDialog;
