
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { MapPin, Calendar, Star, Eye, Phone, Mail } from 'lucide-react';

interface ProfileDetailsModalProps {
  profile: any;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const ProfileDetailsModal = ({ profile, open, onOpenChange }: ProfileDetailsModalProps) => {
  if (!profile) return null;

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-4">
            <Avatar className="h-16 w-16">
              <AvatarImage src={profile.profile_picture} />
              <AvatarFallback>
                {profile.display_name?.charAt(0) || profile.username?.charAt(0) || 'U'}
              </AvatarFallback>
            </Avatar>
            <div>
              <h2 className="text-2xl font-bold">
                {profile.display_name || profile.username || 'Unnamed Profile'}
              </h2>
              <div className="flex items-center gap-2 mt-1">
                <Badge variant={profile.role === 'admin' ? 'default' : 'secondary'}>
                  {profile.role}
                </Badge>
                <Badge variant={profile.status === 'approved' ? 'default' : 'secondary'}>
                  {profile.status}
                </Badge>
                {profile.featured && (
                  <Badge className="bg-gold text-white">Featured</Badge>
                )}
                {profile.verified && (
                  <Badge className="bg-green-100 text-green-800">Verified</Badge>
                )}
              </div>
            </div>
          </DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle>Basic Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-gray-500" />
                <span>{profile.email}</span>
              </div>
              {profile.location && (
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-gray-500" />
                  <span>{profile.location}</span>
                </div>
              )}
              {profile.age && (
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-500">Age:</span>
                  <span>{profile.age}</span>
                </div>
              )}
              {profile.height && (
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-500">Height:</span>
                  <span>{profile.height}</span>
                </div>
              )}
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-gray-500" />
                <span>Joined {formatDate(profile.created_at)}</span>
              </div>
            </CardContent>
          </Card>

          {/* Stats */}
          <Card>
            <CardHeader>
              <CardTitle>Profile Stats</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center gap-2">
                <Star className="h-4 w-4 text-gold" />
                <span>Rating: {profile.rating || 'N/A'}</span>
              </div>
              <div className="flex items-center gap-2">
                <Eye className="h-4 w-4 text-gray-500" />
                <span>Views: {profile.view_count || 0}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-500">Payment Status:</span>
                <Badge variant={profile.payment_status === 'completed' ? 'default' : 'secondary'}>
                  {profile.payment_status}
                </Badge>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-500">Active:</span>
                <Badge variant={profile.is_active ? 'default' : 'secondary'}>
                  {profile.is_active ? 'Yes' : 'No'}
                </Badge>
              </div>
              {profile.last_active && (
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-500">Last Active:</span>
                  <span>{formatDate(profile.last_active)}</span>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Bio */}
          {profile.bio && (
            <Card className="md:col-span-2">
              <CardHeader>
                <CardTitle>Biography</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700 whitespace-pre-wrap">{profile.bio}</p>
              </CardContent>
            </Card>
          )}

          {/* Services */}
          {profile.services && (
            <Card>
              <CardHeader>
                <CardTitle>Services</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700">{profile.services}</p>
              </CardContent>
            </Card>
          )}

          {/* Rates */}
          {profile.rates && (
            <Card>
              <CardHeader>
                <CardTitle>Rates</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700">{profile.rates}</p>
              </CardContent>
            </Card>
          )}

          {/* Languages */}
          {profile.languages && (
            <Card>
              <CardHeader>
                <CardTitle>Languages</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700">{profile.languages}</p>
              </CardContent>
            </Card>
          )}

          {/* Availability */}
          {profile.availability && (
            <Card>
              <CardHeader>
                <CardTitle>Availability</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700">{profile.availability}</p>
              </CardContent>
            </Card>
          )}

          {/* Gallery */}
          {profile.gallery_images && profile.gallery_images.length > 0 && (
            <Card className="md:col-span-2">
              <CardHeader>
                <CardTitle>Gallery</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {profile.gallery_images.map((image: string, index: number) => (
                    <img
                      key={index}
                      src={image}
                      alt={`Gallery image ${index + 1}`}
                      className="w-full h-32 object-cover rounded-md"
                    />
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ProfileDetailsModal;
