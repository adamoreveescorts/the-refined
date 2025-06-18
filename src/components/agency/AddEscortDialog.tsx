
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
      // Check if an invitation already exists for this email
      const { data: existingInvitation, error: invitationError } = await supabase
        .from('escort_invitations')
        .select('id, status')
        .eq('agency_id', agencyId)
        .eq('email', email.toLowerCase())
        .single();

      if (invitationError && invitationError.code !== 'PGRST116') {
        throw invitationError;
      }

      if (existingInvitation) {
        if (existingInvitation.status === 'pending') {
          toast.error('An invitation has already been sent to this email address');
          return;
        } else if (existingInvitation.status === 'accepted') {
          toast.error('This escort is already part of your agency');
          return;
        }
      }

      // Check if a profile with this email already exists and is associated with another agency
      const { data: existingProfile, error: profileError } = await supabase
        .from('profiles')
        .select('id, role, agency_id')
        .eq('email', email.toLowerCase())
        .single();

      if (profileError && profileError.code !== 'PGRST116') {
        console.error('Error checking existing profile:', profileError);
      }

      if (existingProfile) {
        if (existingProfile.role !== 'escort') {
          toast.error('This email is associated with a non-escort account');
          return;
        }
        
        if (existingProfile.agency_id && existingProfile.agency_id !== agencyId) {
          toast.error('This escort is already associated with another agency');
          return;
        }
      }

      // Create the invitation
      const { error: createError } = await supabase
        .from('escort_invitations')
        .insert({
          agency_id: agencyId,
          email: email.toLowerCase(),
          display_name: displayName,
          status: 'pending'
        });

      if (createError) throw createError;

      // Send invitation email via edge function
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session) {
          await supabase.functions.invoke('send-escort-invitation', {
            body: {
              email: email.toLowerCase(),
              displayName: displayName,
              agencyId: agencyId
            },
            headers: {
              Authorization: `Bearer ${session.access_token}`,
            },
          });
        }
      } catch (emailError) {
        console.error('Error sending invitation email:', emailError);
        // Don't fail the whole process if email fails
        toast.success('Invitation created successfully! (Email sending failed - please contact the escort directly)');
      }

      toast.success('Invitation sent successfully! The escort will receive an email to join your agency.');
      onEscortAdded();
      onOpenChange(false);
      setEmail('');
      setDisplayName('');
    } catch (error) {
      console.error('Error sending invitation:', error);
      toast.error('Failed to send invitation');
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
            Invite New Escort
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
                No available seats. Please upgrade your subscription to invite more escorts.
              </p>
            )}
          </div>

          <div className="bg-blue-50 p-3 rounded-md">
            <p className="text-sm text-blue-800">
              An invitation email will be sent to the escort. They will need to sign up and accept the invitation to join your agency.
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
              {loading ? 'Sending...' : 'Send Invitation'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AddEscortDialog;
