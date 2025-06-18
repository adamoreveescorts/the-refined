
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { UserPlus, Mail } from 'lucide-react';

interface AddEscortDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  agencyId: string;
  onEscortAdded: () => void;
  availableSeats: number;
}

const AddEscortDialog = ({ 
  open, 
  onOpenChange, 
  agencyId, 
  onEscortAdded,
  availableSeats 
}: AddEscortDialogProps) => {
  const [email, setEmail] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (availableSeats <= 0) {
      toast.error('No available seats. Please upgrade your subscription first.');
      return;
    }

    setLoading(true);
    try {
      // First, check if a profile with this email already exists
      const { data: existingProfile, error: profileError } = await supabase
        .from('profiles')
        .select('id, role, agency_id')
        .eq('email', email.toLowerCase())
        .single();

      let escortId: string;

      if (existingProfile) {
        // Profile exists, check if it's available
        if (existingProfile.role !== 'escort') {
          toast.error('This email is associated with a non-escort account');
          return;
        }
        
        if (existingProfile.agency_id) {
          toast.error('This escort is already associated with another agency');
          return;
        }

        escortId = existingProfile.id;
        
        // Update the existing profile to link to this agency
        const { error: updateError } = await supabase
          .from('profiles')
          .update({ agency_id: agencyId })
          .eq('id', escortId);

        if (updateError) throw updateError;
      } else {
        // Create new escort profile
        const { data: newProfile, error: createError } = await supabase
          .from('profiles')
          .insert({
            email: email.toLowerCase(),
            display_name: displayName,
            role: 'escort',
            agency_id: agencyId,
            status: 'pending',
            is_active: false
          })
          .select('id')
          .single();

        if (createError) throw createError;
        escortId = newProfile.id;
      }

      // Create the agency-escort relationship
      const { error: relationError } = await supabase
        .from('agency_escorts')
        .insert({
          agency_id: agencyId,
          escort_id: escortId,
          status: 'pending'
        });

      if (relationError) throw relationError;

      toast.success('Escort added successfully! They will receive an invitation to complete their profile.');
      onEscortAdded();
      onOpenChange(false);
      setEmail('');
      setDisplayName('');
    } catch (error) {
      console.error('Error adding escort:', error);
      toast.error('Failed to add escort');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center">
            <UserPlus className="h-5 w-5 mr-2" />
            Add New Escort
          </DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email Address</Label>
            <div className="relative">
              <Mail className="h-4 w-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
              <Input
                id="email"
                type="email"
                placeholder="escort@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="pl-10"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="displayName">Display Name</Label>
            <Input
              id="displayName"
              placeholder="Escort display name"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              required
            />
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
              {loading ? 'Adding...' : 'Add Escort'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AddEscortDialog;
