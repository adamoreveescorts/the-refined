
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
import { MoreHorizontal, Eye, Edit, Star, StarOff, Check, X, Shield, User, Camera, Phone, Flag } from 'lucide-react';
import ProfileDetailsModal from './ProfileDetailsModal';
import ProfileEditModal from './ProfileEditModal';
import AdminPhotoGalleryManager from './AdminPhotoGalleryManager';

interface ProfileManagementTableProps {
  profiles: any[];
  onProfileUpdate: () => void;
}

const ProfileManagementTable = ({ profiles, onProfileUpdate }: ProfileManagementTableProps) => {
  const [selectedProfile, setSelectedProfile] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showGalleryModal, setShowGalleryModal] = useState(false);

  const isAdminUser = (profile: any) => {
    return profile.role === 'admin' || profile.email === 'info@eternalsecurity.com.au';
  };

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

  const handleActionClick = (profile: any, action: string) => {
    if (isAdminUser(profile)) {
      toast.error('Cannot perform actions on admin users');
      return;
    }

    switch (action) {
      case 'featured':
        toggleFeatured(profile.id, profile.featured);
        break;
      case 'verified':
        toggleVerified(profile.id, profile.verified);
        break;
    }
  };

  const handleStatusUpdate = (profile: any, status: string) => {
    if (isAdminUser(profile)) {
      toast.error('Cannot modify admin user status');
      return;
    }
    updateProfileStatus(profile.id, status);
  };

  return (
    <>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-16">Photo</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Phone</TableHead>
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
              <TableRow key={profile.id} className={isAdminUser(profile) ? 'bg-gold/5' : ''}>
                <TableCell>
                  <Avatar className="h-10 w-10">
                    <AvatarImage 
                      src={profile.profile_picture} 
                      alt={profile.display_name || profile.username || 'Profile'} 
                    />
                    <AvatarFallback>
                      <User className="h-4 w-4" />
                    </AvatarFallback>
                  </Avatar>
                </TableCell>
                <TableCell className="font-medium">
                  <div className="flex items-center gap-2">
                    {profile.display_name || profile.username || 'N/A'}
                    {isAdminUser(profile) && (
                      <Shield className="h-4 w-4 text-gold" />
                    )}
                  </div>
                </TableCell>
                <TableCell>{profile.email}</TableCell>
                <TableCell>
                  {profile.phone ? (
                    <div className="flex items-center gap-2">
                      <Phone className="h-3 w-3 text-muted-foreground" />
                      <span className="text-sm">{profile.phone}</span>
                      {profile.country_code && (
                        <Badge variant="outline" className="text-xs">
                          <Flag className="h-2 w-2 mr-1" />
                          {profile.country_code}
                        </Badge>
                      )}
                    </div>
                  ) : (
                    <span className="text-muted-foreground text-sm">N/A</span>
                  )}
                </TableCell>
                <TableCell>{getRoleBadge(profile.role)}</TableCell>
                <TableCell>{getStatusBadge(profile.status)}</TableCell>
                <TableCell>{profile.location || 'N/A'}</TableCell>
                <TableCell>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleActionClick(profile, 'featured')}
                    className={profile.featured ? 'text-gold' : 'text-gray-400'}
                    disabled={isAdminUser(profile)}
                  >
                    <Star className={`h-4 w-4 ${profile.featured ? 'fill-current' : ''}`} />
                  </Button>
                </TableCell>
                <TableCell>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleActionClick(profile, 'verified')}
                    className={profile.verified ? 'text-green-600' : 'text-gray-400'}
                    disabled={isAdminUser(profile)}
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
                      {!isAdminUser(profile) && (
                        <>
                          <DropdownMenuItem
                            onClick={() => {
                              setSelectedProfile(profile);
                              setShowGalleryModal(true);
                            }}
                          >
                            <Camera className="mr-2 h-4 w-4" />
                            Manage Gallery
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
                                onClick={() => handleStatusUpdate(profile, 'approved')}
                                className="text-green-600"
                              >
                                <Check className="mr-2 h-4 w-4" />
                                Approve
                              </DropdownMenuItem>
                              <DropdownMenuItem
                               onClick={() => handleStatusUpdate(profile, 'rejected')}
                               className="text-red-600"
                              >
                                <X className="mr-2 h-4 w-4" />
                                Reject
                              </DropdownMenuItem>
                            </>
                          )}
                          {profile.status === 'approved' && (
                            <DropdownMenuItem
                              onClick={() => handleStatusUpdate(profile, 'inactive')}
                              className="text-orange-600"
                            >
                              <X className="mr-2 h-4 w-4" />
                              Deactivate
                            </DropdownMenuItem>
                          )}
                        </>
                      )}
                      {isAdminUser(profile) && (
                        <DropdownMenuItem disabled className="text-gray-400">
                          <Shield className="mr-2 h-4 w-4" />
                          Admin Protected
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
          {!isAdminUser(selectedProfile) && (
            <>
              <ProfileEditModal
                profile={selectedProfile}
                open={showEditModal}
                onOpenChange={setShowEditModal}
                onProfileUpdate={onProfileUpdate}
              />
              <AdminPhotoGalleryManager
                isOpen={showGalleryModal}
                onClose={() => setShowGalleryModal(false)}
                profileId={selectedProfile.id}
                profileName={selectedProfile.display_name || selectedProfile.username || 'Profile'}
                onGalleryUpdate={onProfileUpdate}
              />
            </>
          )}
        </>
      )}
    </>
  );
};

export default ProfileManagementTable;
