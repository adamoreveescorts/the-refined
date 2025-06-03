
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
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { MoreHorizontal, Eye, Edit, Star, StarOff, Check, X } from 'lucide-react';
import ProfileDetailsModal from './ProfileDetailsModal';
import ProfileEditModal from './ProfileEditModal';

interface ProfileManagementTableProps {
  profiles: any[];
  onProfileUpdate: () => void;
}

const ProfileManagementTable = ({ profiles, onProfileUpdate }: ProfileManagementTableProps) => {
  const [selectedProfile, setSelectedProfile] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);

  const getStatusBadge = (status: string) => {
    const statusColors = {
      pending: 'bg-orange-100 text-orange-800',
      approved: 'bg-green-100 text-green-800',
      rejected: 'bg-red-100 text-red-800',
      inactive: 'bg-gray-100 text-gray-800'
    };
    
    return (
      <Badge className={statusColors[status as keyof typeof statusColors] || 'bg-gray-100 text-gray-800'}>
        {status}
      </Badge>
    );
  };

  const getRoleBadge = (role: string) => {
    const roleColors = {
      escort: 'bg-purple-100 text-purple-800',
      agency: 'bg-blue-100 text-blue-800',
      client: 'bg-gray-100 text-gray-800',
      admin: 'bg-gold text-white'
    };
    
    return (
      <Badge className={roleColors[role as keyof typeof roleColors] || 'bg-gray-100 text-gray-800'}>
        {role}
      </Badge>
    );
  };

  const updateProfileStatus = async (profileId: string, status: string) => {
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ status })
        .eq('id', profileId);

      if (error) throw error;
      
      toast.success(`Profile ${status} successfully`);
      onProfileUpdate();
    } catch (error) {
      console.error('Error updating profile status:', error);
      toast.error('Error updating profile status');
    }
  };

  const toggleFeatured = async (profileId: string, currentFeatured: boolean) => {
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ featured: !currentFeatured })
        .eq('id', profileId);

      if (error) throw error;
      
      toast.success(`Profile ${!currentFeatured ? 'featured' : 'unfeatured'} successfully`);
      onProfileUpdate();
    } catch (error) {
      console.error('Error updating featured status:', error);
      toast.error('Error updating featured status');
    }
  };

  const toggleVerified = async (profileId: string, currentVerified: boolean) => {
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ verified: !currentVerified })
        .eq('id', profileId);

      if (error) throw error;
      
      toast.success(`Profile ${!currentVerified ? 'verified' : 'unverified'} successfully`);
      onProfileUpdate();
    } catch (error) {
      console.error('Error updating verified status:', error);
      toast.error('Error updating verified status');
    }
  };

  return (
    <>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Location</TableHead>
              <TableHead>Featured</TableHead>
              <TableHead>Verified</TableHead>
              <TableHead>Created</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {profiles.map((profile) => (
              <TableRow key={profile.id}>
                <TableCell className="font-medium">
                  {profile.display_name || profile.username || 'N/A'}
                </TableCell>
                <TableCell>{profile.email}</TableCell>
                <TableCell>{getRoleBadge(profile.role)}</TableCell>
                <TableCell>{getStatusBadge(profile.status)}</TableCell>
                <TableCell>{profile.location || 'N/A'}</TableCell>
                <TableCell>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => toggleFeatured(profile.id, profile.featured)}
                    className={profile.featured ? 'text-gold' : 'text-gray-400'}
                  >
                    <Star className={`h-4 w-4 ${profile.featured ? 'fill-current' : ''}`} />
                  </Button>
                </TableCell>
                <TableCell>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => toggleVerified(profile.id, profile.verified)}
                    className={profile.verified ? 'text-green-600' : 'text-gray-400'}
                  >
                    <Check className={`h-4 w-4 ${profile.verified ? 'fill-current' : ''}`} />
                  </Button>
                </TableCell>
                <TableCell>
                  {new Date(profile.created_at).toLocaleDateString()}
                </TableCell>
                <TableCell className="text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="h-8 w-8 p-0">
                        <span className="sr-only">Open menu</span>
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem
                        onClick={() => {
                          setSelectedProfile(profile);
                          setShowDetailsModal(true);
                        }}
                      >
                        <Eye className="mr-2 h-4 w-4" />
                        View Details
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => {
                          setSelectedProfile(profile);
                          setShowEditModal(true);
                        }}
                      >
                        <Edit className="mr-2 h-4 w-4" />
                        Edit Profile
                      </DropdownMenuItem>
                      {profile.status === 'pending' && (
                        <>
                          <DropdownMenuItem
                            onClick={() => updateProfileStatus(profile.id, 'approved')}
                            className="text-green-600"
                          >
                            <Check className="mr-2 h-4 w-4" />
                            Approve
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => updateProfileStatus(profile.id, 'rejected')}
                            className="text-red-600"
                          >
                            <X className="mr-2 h-4 w-4" />
                            Reject
                          </DropdownMenuItem>
                        </>
                      )}
                      {profile.status === 'approved' && (
                        <DropdownMenuItem
                          onClick={() => updateProfileStatus(profile.id, 'inactive')}
                          className="text-orange-600"
                        >
                          <X className="mr-2 h-4 w-4" />
                          Deactivate
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

      {selectedProfile && (
        <>
          <ProfileDetailsModal
            profile={selectedProfile}
            open={showDetailsModal}
            onOpenChange={setShowDetailsModal}
          />
          <ProfileEditModal
            profile={selectedProfile}
            open={showEditModal}
            onOpenChange={setShowEditModal}
            onProfileUpdate={onProfileUpdate}
          />
        </>
      )}
    </>
  );
};

export default ProfileManagementTable;
