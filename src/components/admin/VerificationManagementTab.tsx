
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { CheckCircle, XCircle, Eye, Clock, User } from 'lucide-react';

const VerificationManagementTab = () => {
  const [verifications, setVerifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedVerification, setSelectedVerification] = useState<any>(null);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [adminNotes, setAdminNotes] = useState('');
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    fetchVerifications();
  }, []);

  const fetchVerifications = async () => {
    try {
      // First get verification records
      const { data: verificationsData, error: verificationsError } = await supabase
        .from('photo_verifications')
        .select('*')
        .order('submitted_at', { ascending: false });

      if (verificationsError) throw verificationsError;

      // Then get user profiles separately to avoid foreign key issues
      if (verificationsData && verificationsData.length > 0) {
        const userIds = verificationsData.map(v => v.user_id);
        const { data: profilesData, error: profilesError } = await supabase
          .from('profiles')
          .select('id, display_name, email, username, profile_picture, role')
          .in('id', userIds);

        if (profilesError) {
          console.error('Error fetching profiles:', profilesError);
          // Continue without profile data rather than failing completely
        }

        // Manually join the data
        const verificationsWithProfiles = verificationsData.map(verification => ({
          ...verification,
          profiles: profilesData?.find(profile => profile.id === verification.user_id) || null
        }));

        setVerifications(verificationsWithProfiles);
      } else {
        setVerifications([]);
      }
    } catch (error) {
      console.error('Error fetching verifications:', error);
      toast.error('Error loading verifications');
    } finally {
      setLoading(false);
    }
  };

  const getVerificationPhoto = async (path: string) => {
    try {
      const { data, error } = await supabase.storage
        .from('verification-photos')
        .createSignedUrl(path, 3600); // 1 hour expiry
      
      if (error) {
        console.error('Error creating signed URL:', error);
        return null;
      }
      
      return data?.signedUrl || null;
    } catch (error) {
      console.error('Error getting signed URL:', error);
      return null;
    }
  };

  const openReviewModal = (verification: any) => {
    setSelectedVerification(verification);
    setAdminNotes(verification.admin_notes || '');
    setShowReviewModal(true);
  };

  const updateVerificationStatus = async (status: 'approved' | 'rejected') => {
    if (!selectedVerification) return;

    setUpdating(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('No session');

      const { error } = await supabase
        .from('photo_verifications')
        .update({
          status,
          admin_notes: adminNotes.trim() || null,
          reviewed_at: new Date().toISOString(),
          reviewed_by: session.user.id
        })
        .eq('id', selectedVerification.id);

      if (error) throw error;

      toast.success(`Verification ${status} successfully`);
      setShowReviewModal(false);
      fetchVerifications();
    } catch (error) {
      console.error('Error updating verification:', error);
      toast.error('Error updating verification status');
    } finally {
      setUpdating(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'approved':
        return <Badge className="bg-green-500"><CheckCircle className="h-3 w-3 mr-1" />Approved</Badge>;
      case 'rejected':
        return <Badge variant="destructive"><XCircle className="h-3 w-3 mr-1" />Rejected</Badge>;
      case 'pending':
      default:
        return <Badge className="bg-amber-500"><Clock className="h-3 w-3 mr-1" />Pending</Badge>;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gold"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium">Photo Verifications</h3>
        <Badge variant="outline">
          {verifications.filter(v => v.status === 'pending').length} Pending Review
        </Badge>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>User</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Submitted</TableHead>
              <TableHead>Reviewed</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {verifications.map((verification) => (
              <TableRow key={verification.id}>
                <TableCell>
                  <div className="flex items-center space-x-2">
                    <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center">
                      <User className="h-4 w-4" />
                    </div>
                    <div>
                      <p className="font-medium">
                        {verification.profiles?.display_name || verification.profiles?.username || 'Unknown User'}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {verification.profiles?.email || 'No email'}
                      </p>
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant="outline">
                    {verification.profiles?.role || 'Unknown'}
                  </Badge>
                </TableCell>
                <TableCell>{getStatusBadge(verification.status)}</TableCell>
                <TableCell>
                  {new Date(verification.submitted_at).toLocaleDateString()}
                </TableCell>
                <TableCell>
                  {verification.reviewed_at 
                    ? new Date(verification.reviewed_at).toLocaleDateString()
                    : '-'
                  }
                </TableCell>
                <TableCell className="text-right">
                  <Dialog open={showReviewModal && selectedVerification?.id === verification.id} onOpenChange={setShowReviewModal}>
                    <DialogTrigger asChild>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => openReviewModal(verification)}
                      >
                        <Eye className="h-4 w-4 mr-1" />
                        Review
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-4xl">
                      <DialogHeader>
                        <DialogTitle>Review Photo Verification</DialogTitle>
                      </DialogHeader>
                      
                      <VerificationReviewModal 
                        verification={selectedVerification}
                        adminNotes={adminNotes}
                        setAdminNotes={setAdminNotes}
                        onApprove={() => updateVerificationStatus('approved')}
                        onReject={() => updateVerificationStatus('rejected')}
                        updating={updating}
                        getVerificationPhoto={getVerificationPhoto}
                      />
                    </DialogContent>
                  </Dialog>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {verifications.length === 0 && (
        <div className="text-center py-8">
          <p className="text-muted-foreground">No verifications found</p>
        </div>
      )}
    </div>
  );
};

const VerificationReviewModal = ({ 
  verification, 
  adminNotes, 
  setAdminNotes, 
  onApprove, 
  onReject, 
  updating,
  getVerificationPhoto 
}: any) => {
  const [verificationPhotoUrl, setVerificationPhotoUrl] = useState<string | null>(null);
  const [loadingPhoto, setLoadingPhoto] = useState(true);
  const [photoError, setPhotoError] = useState(false);

  useEffect(() => {
    if (verification?.verification_photo_url) {
      setLoadingPhoto(true);
      setPhotoError(false);
      getVerificationPhoto(verification.verification_photo_url)
        .then(url => {
          if (url) {
            setVerificationPhotoUrl(url);
          } else {
            setPhotoError(true);
          }
        })
        .catch(error => {
          console.error('Error loading verification photo:', error);
          setPhotoError(true);
        })
        .finally(() => {
          setLoadingPhoto(false);
        });
    }
  }, [verification]);

  if (!verification) return null;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Profile Picture</CardTitle>
          </CardHeader>
          <CardContent>
            {verification.profile_photo_url ? (
              <img 
                src={verification.profile_photo_url} 
                alt="Profile" 
                className="w-full aspect-square object-cover rounded-lg border"
                onError={(e) => {
                  console.error('Profile photo failed to load');
                  e.currentTarget.style.display = 'none';
                }}
              />
            ) : (
              <div className="w-full aspect-square bg-muted rounded-lg flex items-center justify-center">
                <p className="text-muted-foreground">No profile picture</p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Verification Photo</CardTitle>
          </CardHeader>
          <CardContent>
            {loadingPhoto ? (
              <div className="w-full aspect-square bg-muted rounded-lg flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gold"></div>
              </div>
            ) : photoError ? (
              <div className="w-full aspect-square bg-muted rounded-lg flex items-center justify-center">
                <p className="text-muted-foreground">Failed to load verification photo</p>
              </div>
            ) : verificationPhotoUrl ? (
              <img 
                src={verificationPhotoUrl} 
                alt="Verification" 
                className="w-full aspect-square object-cover rounded-lg border"
                onError={() => setPhotoError(true)}
              />
            ) : (
              <div className="w-full aspect-square bg-muted rounded-lg flex items-center justify-center">
                <p className="text-muted-foreground">No verification photo</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <div>
        <label className="text-sm font-medium mb-2 block">Admin Notes</label>
        <Textarea
          value={adminNotes}
          onChange={(e) => setAdminNotes(e.target.value)}
          placeholder="Add notes about the verification decision..."
          rows={3}
        />
      </div>

      <div className="flex justify-end space-x-2">
        <Button 
          variant="destructive" 
          onClick={onReject}
          disabled={updating}
        >
          <XCircle className="h-4 w-4 mr-2" />
          {updating ? 'Updating...' : 'Reject'}
        </Button>
        <Button 
          onClick={onApprove}
          disabled={updating}
          className="bg-green-500 hover:bg-green-600"
        >
          <CheckCircle className="h-4 w-4 mr-2" />
          {updating ? 'Updating...' : 'Approve'}
        </Button>
      </div>
    </div>
  );
};

export default VerificationManagementTab;
