
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
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
import { MoreHorizontal, Eye, Edit, UserCheck, UserX, User } from 'lucide-react';

interface EscortManagementTableProps {
  escorts: any[];
  onEscortUpdate: () => void;
  agencyId: string;
}

const EscortManagementTable = ({ escorts, onEscortUpdate, agencyId }: EscortManagementTableProps) => {
  const [loading, setLoading] = useState<string | null>(null);

  const updateEscortStatus = async (escortRelationId: string, status: string) => {
    try {
      setLoading(escortRelationId);
      
      const { error } = await supabase
        .from('agency_escorts')
        .update({ 
          status,
          updated_at: new Date().toISOString()
        })
        .eq('id', escortRelationId);

      if (error) throw error;
      
      toast.success(`Escort ${status === 'active' ? 'activated' : 'deactivated'} successfully`);
      onEscortUpdate();
    } catch (error) {
      console.error('Error updating escort status:', error);
      toast.error('Failed to update escort status');
    } finally {
      setLoading(null);
    }
  };

  const removeEscort = async (escortRelationId: string) => {
    try {
      setLoading(escortRelationId);
      
      const { error } = await supabase
        .from('agency_escorts')
        .delete()
        .eq('id', escortRelationId);

      if (error) throw error;
      
      toast.success('Escort removed from agency');
      onEscortUpdate();
    } catch (error) {
      console.error('Error removing escort:', error);
      toast.error('Failed to remove escort');
    } finally {
      setLoading(null);
    }
  };

  const getStatusBadge = (status: string) => {
    const statusColors = {
      active: 'bg-green-100 text-green-800',
      inactive: 'bg-gray-100 text-gray-800',
      pending: 'bg-orange-100 text-orange-800'
    };
    
    return (
      <Badge className={statusColors[status as keyof typeof statusColors] || 'bg-gray-100 text-gray-800'}>
        {status}
      </Badge>
    );
  };

  if (escorts.length === 0) {
    return (
      <div className="text-center py-8">
        <User className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
        <h3 className="text-lg font-medium text-foreground mb-2">No escorts yet</h3>
        <p className="text-muted-foreground">Add your first escort to get started</p>
      </div>
    );
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-16">Photo</TableHead>
            <TableHead>Name</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Location</TableHead>
            <TableHead>Joined</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {escorts.map((escortRelation) => {
            const escort = escortRelation.escort;
            return (
              <TableRow key={escortRelation.id}>
                <TableCell>
                  <Avatar className="h-10 w-10">
                    <AvatarImage 
                      src={escort?.profile_picture} 
                      alt={escort?.display_name || 'Escort'} 
                    />
                    <AvatarFallback>
                      <User className="h-4 w-4" />
                    </AvatarFallback>
                  </Avatar>
                </TableCell>
                <TableCell className="font-medium">
                  {escort?.display_name || 'N/A'}
                </TableCell>
                <TableCell>{escort?.email || 'N/A'}</TableCell>
                <TableCell>{getStatusBadge(escortRelation.status)}</TableCell>
                <TableCell>{escort?.location || 'N/A'}</TableCell>
                <TableCell>
                  {escortRelation.joined_at 
                    ? new Date(escortRelation.joined_at).toLocaleDateString()
                    : 'Pending'
                  }
                </TableCell>
                <TableCell className="text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button 
                        variant="ghost" 
                        className="h-8 w-8 p-0"
                        disabled={loading === escortRelation.id}
                      >
                        <span className="sr-only">Open menu</span>
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem
                        onClick={() => window.open(`/profile/${escort?.id}`, '_blank')}
                      >
                        <Eye className="mr-2 h-4 w-4" />
                        View Profile
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => window.open(`/profile/${escort?.id}/edit`, '_blank')}
                      >
                        <Edit className="mr-2 h-4 w-4" />
                        Edit Profile
                      </DropdownMenuItem>
                      {escortRelation.status === 'active' ? (
                        <DropdownMenuItem
                          onClick={() => updateEscortStatus(escortRelation.id, 'inactive')}
                          className="text-orange-600"
                        >
                          <UserX className="mr-2 h-4 w-4" />
                          Deactivate
                        </DropdownMenuItem>
                      ) : (
                        <DropdownMenuItem
                          onClick={() => updateEscortStatus(escortRelation.id, 'active')}
                          className="text-green-600"
                        >
                          <UserCheck className="mr-2 h-4 w-4" />
                          Activate
                        </DropdownMenuItem>
                      )}
                      <DropdownMenuItem
                        onClick={() => removeEscort(escortRelation.id)}
                        className="text-red-600"
                      >
                        <UserX className="mr-2 h-4 w-4" />
                        Remove from Agency
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
};

export default EscortManagementTable;
