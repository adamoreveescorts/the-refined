
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { MoreHorizontal, Mail, X, RefreshCw, UserPlus } from 'lucide-react';

interface InvitationManagementTableProps {
  invitations: any[];
  onInvitationUpdate: () => void;
  agencyId: string;
}

const InvitationManagementTable = ({ invitations, onInvitationUpdate, agencyId }: InvitationManagementTableProps) => {
  const [loading, setLoading] = useState<string | null>(null);

  const cancelInvitation = async (invitationId: string) => {
    try {
      setLoading(invitationId);
      
      const { error } = await supabase
        .from('escort_invitations')
        .update({ 
          status: 'cancelled',
          updated_at: new Date().toISOString()
        })
        .eq('id', invitationId);

      if (error) throw error;
      
      toast.success('Invitation cancelled successfully');
      onInvitationUpdate();
    } catch (error) {
      console.error('Error cancelling invitation:', error);
      toast.error('Failed to cancel invitation');
    } finally {
      setLoading(null);
    }
  };

  const resendInvitation = async (invitation: any) => {
    try {
      setLoading(invitation.id);
      
      // Update the invitation to extend expiry
      const newExpiryDate = new Date();
      newExpiryDate.setDate(newExpiryDate.getDate() + 7);
      
      const { error } = await supabase
        .from('escort_invitations')
        .update({ 
          expires_at: newExpiryDate.toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq('id', invitation.id);

      if (error) throw error;

      // Send invitation email again
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session) {
          await supabase.functions.invoke('send-escort-invitation', {
            body: {
              email: invitation.email,
              displayName: invitation.display_name,
              agencyId: agencyId
            },
            headers: {
              Authorization: `Bearer ${session.access_token}`,
            },
          });
        }
      } catch (emailError) {
        console.error('Error resending invitation email:', emailError);
        toast.success('Invitation updated! (Email sending failed - please contact the escort directly)');
        onInvitationUpdate();
        return;
      }
      
      toast.success('Invitation resent successfully');
      onInvitationUpdate();
    } catch (error) {
      console.error('Error resending invitation:', error);
      toast.error('Failed to resend invitation');
    } finally {
      setLoading(null);
    }
  };

  const getStatusBadge = (status: string) => {
    const statusColors = {
      pending: 'bg-orange-100 text-orange-800',
      accepted: 'bg-green-100 text-green-800',
      expired: 'bg-red-100 text-red-800',
      cancelled: 'bg-gray-100 text-gray-800'
    };
    
    return (
      <Badge className={statusColors[status as keyof typeof statusColors] || 'bg-gray-100 text-gray-800'}>
        {status}
      </Badge>
    );
  };

  const isExpired = (expiresAt: string) => {
    return new Date(expiresAt) < new Date();
  };

  if (invitations.length === 0) {
    return (
      <div className="text-center py-8">
        <UserPlus className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
        <h3 className="text-lg font-medium text-foreground mb-2">No invitations sent</h3>
        <p className="text-muted-foreground">Send your first invitation to get started</p>
      </div>
    );
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Email</TableHead>
            <TableHead>Display Name</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Sent</TableHead>
            <TableHead>Expires</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {invitations.map((invitation) => (
            <TableRow key={invitation.id}>
              <TableCell className="font-medium">{invitation.email}</TableCell>
              <TableCell>{invitation.display_name || 'N/A'}</TableCell>
              <TableCell>
                {getStatusBadge(
                  invitation.status === 'pending' && isExpired(invitation.expires_at) 
                    ? 'expired' 
                    : invitation.status
                )}
              </TableCell>
              <TableCell>
                {new Date(invitation.invited_at).toLocaleDateString()}
              </TableCell>
              <TableCell>
                {new Date(invitation.expires_at).toLocaleDateString()}
              </TableCell>
              <TableCell className="text-right">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button 
                      variant="ghost" 
                      className="h-8 w-8 p-0"
                      disabled={loading === invitation.id}
                    >
                      <span className="sr-only">Open menu</span>
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    {(invitation.status === 'pending' || isExpired(invitation.expires_at)) && (
                      <DropdownMenuItem
                        onClick={() => resendInvitation(invitation)}
                        className="text-blue-600"
                      >
                        <RefreshCw className="mr-2 h-4 w-4" />
                        Resend Invitation
                      </DropdownMenuItem>
                    )}
                    {invitation.status === 'pending' && (
                      <DropdownMenuItem
                        onClick={() => cancelInvitation(invitation.id)}
                        className="text-red-600"
                      >
                        <X className="mr-2 h-4 w-4" />
                        Cancel Invitation
                      </DropdownMenuItem>
                    )}
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default InvitationManagementTable;
