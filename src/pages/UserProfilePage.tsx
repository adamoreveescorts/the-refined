import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import NavBar from '@/components/NavBar';
import Footer from '@/components/Footer';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Check, Star, Upload, User, Edit, Save, X } from 'lucide-react';
import { ImageZoomModal } from '@/components/ImageZoomModal';
import { ContactRequestDialog } from '@/components/ContactRequestDialog';
import { MessageButton } from '@/components/messaging/MessageButton';
import { FollowButton } from '@/components/FollowButton';

interface Profile {
  id: string;
  username: string;
  display_name: string;
  email: string;
  phone: string;
  role: string;
  bio: string;
  age: string;
  height: string;
  weight: string;
  ethnicity: string;
  body_type: string;
  hair_color: string;
  eye_color: string;
  cup_size: string;
  nationality: string;
  smoking: string;
  drinking: string;
  location: string;
  languages: string;
  services: string;
  rates: string;
  availability: string;
  tags: string;
  profile_picture: string;
  gallery_images: string[];
  gallery_videos: string[];
  hourly_rate: string;
  two_hour_rate: string;
  dinner_rate: string;
  overnight_rate: string;
  incall_hourly_rate: string;
  outcall_hourly_rate: string;
  incall_two_hour_rate: string;
  outcall_two_hour_rate: string;
  incall_dinner_rate: string;
  outcall_dinner_rate: string;
  incall_overnight_rate: string;
  outcall_overnight_rate: string;
  country_code: string;
  instagram_url: string;
  twitter_url: string;
  facebook_url: string;
  linkedin_url: string;
  youtube_url: string;
  verified: boolean;
  featured: boolean;
  rating: number;
  view_count: number;
}

interface FollowedUser {
  id: string;
  display_name: string;
  profile_picture: string;
  location: string;
  verified: boolean;
}

interface Image {
  url: string;
  alt: string;
}

const UserProfilePage = () => {
  const { id } = useParams<{ id: string }>();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [followedUsers, setFollowedUsers] = useState<FollowedUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [isZoomModalOpen, setIsZoomModalOpen] = useState(false);
  const [selectedImage, setSelectedImage] = useState<Image | null>(null);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [showContactDialog, setShowContactDialog] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [editData, setEditData] = useState({
    display_name: '',
    email: '',
    phone: '',
  });

  useEffect(() => {
    // Get current user
    const getCurrentUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setCurrentUser(user);
      return user;
    };

    const fetchProfile = async () => {
      try {
        setLoading(true);
        let profileId = id;
        
        // If no ID in URL, get current user's profile
        if (!id) {
          const user = await getCurrentUser();
          if (!user) {
            toast.error("Please log in to view your profile");
            return;
          }
          profileId = user.id;
        }

        if (!profileId) {
          throw new Error("No user ID provided");
        }

        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', profileId)
          .single();

        if (error) {
          throw error;
        }

        setProfile(data as Profile);
        setEditData({
          display_name: data.display_name || '',
          email: data.email || '',
          phone: data.phone || '',
        });

        // If this is the current user's profile and they're a client, fetch followed users
        if (!id && data.role === 'client') {
          await fetchFollowedUsers(profileId);
        }
      } catch (error: any) {
        console.error('Error fetching profile:', error);
        toast.error(`Failed to load profile: ${error.message}`);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [id]);

  const fetchFollowedUsers = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('user_follows')
        .select(`
          followed_id,
          profiles!user_follows_followed_id_fkey (
            id,
            display_name,
            profile_picture,
            location,
            verified
          )
        `)
        .eq('follower_id', userId)
        .eq('is_active', true);

      if (error) {
        console.error('Error fetching followed users:', error);
        return;
      }

      const followedUsers = data.map((follow: any) => follow.profiles).filter(Boolean);
      setFollowedUsers(followedUsers);
    } catch (error) {
      console.error('Error fetching followed users:', error);
    }
  };

  const handleImageClick = (imageUrl: string, altText: string) => {
    setSelectedImage({ url: imageUrl, alt: altText });
    setIsZoomModalOpen(true);
  };

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !profile) return;

    if (!file.type.startsWith('image/')) {
      toast.error("Please select an image file");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image must be less than 5MB");
      return;
    }

    try {
      setUploadingImage(true);
      
      const fileExt = file.name.split('.').pop();
      const fileName = `${profile.id}/profile-${Date.now()}.${fileExt}`;

      const { data, error } = await supabase.storage
        .from('profile-pictures')
        .upload(fileName, file);

      if (error) {
        console.error("Storage upload error:", error);
        toast.error("Failed to upload image");
        return;
      }

      const { data: { publicUrl } } = supabase.storage
        .from('profile-pictures')
        .getPublicUrl(fileName);

      // Update profile with new image
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ profile_picture: publicUrl })
        .eq('id', profile.id);

      if (updateError) {
        toast.error("Failed to update profile picture");
        return;
      }

      setProfile({ ...profile, profile_picture: publicUrl });
      toast.success("Profile picture updated successfully");
    } catch (error) {
      console.error("Error uploading image:", error);
      toast.error("Failed to upload image");
    } finally {
      setUploadingImage(false);
    }
  };

  const handleSaveProfile = async () => {
    if (!profile) return;

    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          display_name: editData.display_name,
          email: editData.email,
          phone: editData.phone,
        })
        .eq('id', profile.id);

      if (error) {
        toast.error("Failed to update profile");
        return;
      }

      setProfile({
        ...profile,
        display_name: editData.display_name,
        email: editData.email,
        phone: editData.phone,
      });
      setIsEditing(false);
      toast.success("Profile updated successfully");
    } catch (error) {
      console.error("Error updating profile:", error);
      toast.error("Failed to update profile");
    }
  };

  const isOwnProfile = currentUser && profile && currentUser.id === profile.id;
  const isClient = profile?.role === 'client';

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <NavBar />
        <main className="flex-grow flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-secondary"></div>
        </main>
        <Footer />
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <NavBar />
        <main className="flex-grow flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-foreground mb-4">Profile Not Found</h1>
            <p className="text-muted-foreground">The profile you're looking for doesn't exist.</p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <NavBar />
      
      <main className="flex-grow py-8">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto">
            {/* Profile Header */}
            <div className="bg-card rounded-lg shadow-md p-6 mb-6">
              <div className="flex flex-col md:flex-row gap-6">
                <div className="flex-shrink-0 relative">
                  {profile.profile_picture ? (
                    <img 
                      src={profile.profile_picture} 
                      alt={profile.display_name || profile.username || 'Profile'}
                      className="w-48 h-48 object-cover rounded-lg cursor-pointer transition-transform hover:scale-105"
                      onClick={() => handleImageClick(profile.profile_picture, profile.display_name || profile.username || 'Profile')}
                    />
                  ) : (
                    <div className="w-48 h-48 bg-muted rounded-lg flex items-center justify-center">
                      <User className="h-24 w-24 text-muted-foreground" />
                    </div>
                  )}
                  {isOwnProfile && (
                    <div className="absolute bottom-2 right-2">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageUpload}
                        className="hidden"
                        id="profile-picture-upload"
                      />
                      <label htmlFor="profile-picture-upload">
                        <Button
                          size="sm"
                          variant="secondary"
                          disabled={uploadingImage}
                          asChild
                        >
                          <span className="cursor-pointer">
                            <Upload className="h-4 w-4" />
                          </span>
                        </Button>
                      </label>
                    </div>
                  )}
                </div>
                
                <div className="flex-grow">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <h1 className="text-3xl font-bold text-foreground">
                        {profile.display_name || profile.username || 'Anonymous'}
                      </h1>
                      {profile.verified && !isClient && (
                        <Badge variant="outline" className="border-green-500 text-green-400">
                          <Check className="h-4 w-4 mr-1" />
                          Verified
                        </Badge>
                      )}
                    </div>
                    {isOwnProfile && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setIsEditing(!isEditing)}
                      >
                        {isEditing ? <X className="h-4 w-4" /> : <Edit className="h-4 w-4" />}
                      </Button>
                    )}
                  </div>

                  {isEditing && isOwnProfile ? (
                    <div className="space-y-4">
                      <div>
                        <label className="text-sm font-medium text-foreground">Display Name</label>
                        <Input
                          value={editData.display_name}
                          onChange={(e) => setEditData({ ...editData, display_name: e.target.value })}
                          placeholder="Enter your display name"
                        />
                      </div>
                      <div>
                        <label className="text-sm font-medium text-foreground">Email</label>
                        <Input
                          value={editData.email}
                          onChange={(e) => setEditData({ ...editData, email: e.target.value })}
                          placeholder="Enter your email"
                          type="email"
                        />
                      </div>
                      <div>
                        <label className="text-sm font-medium text-foreground">Phone</label>
                        <Input
                          value={editData.phone}
                          onChange={(e) => setEditData({ ...editData, phone: e.target.value })}
                          placeholder="Enter your phone number"
                          type="tel"
                        />
                      </div>
                      <Button onClick={handleSaveProfile} className="btn-gold">
                        <Save className="h-4 w-4 mr-2" />
                        Save Changes
                      </Button>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-muted-foreground">Email:</span>
                        <span className="ml-2 text-foreground">{profile.email || 'Not provided'}</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Phone:</span>
                        <span className="ml-2 text-foreground">{profile.phone || 'Not provided'}</span>
                      </div>
                      {profile.location && (
                        <div>
                          <span className="text-muted-foreground">Location:</span>
                          <span className="ml-2 text-foreground">{profile.location}</span>
                        </div>
                      )}
                      <div>
                        <span className="text-muted-foreground">Role:</span>
                        <span className="ml-2 text-foreground capitalize">{profile.role}</span>
                      </div>
                    </div>
                  )}

                  {/* Only show rating for non-clients */}
                  {!isClient && (
                    <div className="flex items-center gap-4 mt-4">
                      <div className="flex items-center">
                        <Star className="h-5 w-5 text-secondary fill-secondary mr-1" />
                        <span className="font-medium text-foreground">{profile.rating?.toFixed(1) || '4.5'}</span>
                      </div>
                      <span className="text-muted-foreground">•</span>
                      <span className="text-muted-foreground">{profile.view_count || 0} views</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Followed Users Section - Only for clients viewing their own profile */}
            {isClient && isOwnProfile && followedUsers.length > 0 && (
              <div className="bg-card rounded-lg shadow-md p-6 mb-6">
                <h2 className="text-xl font-semibold text-foreground mb-4">Following ({followedUsers.length})</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {followedUsers.map((user) => (
                    <div key={user.id} className="flex items-center space-x-3 p-3 border rounded-lg hover:bg-muted/50 transition-colors">
                      <div className="flex-shrink-0">
                        {user.profile_picture ? (
                          <img
                            src={user.profile_picture}
                            alt={user.display_name}
                            className="w-12 h-12 object-cover rounded-full"
                          />
                        ) : (
                          <div className="w-12 h-12 bg-muted rounded-full flex items-center justify-center">
                            <User className="h-6 w-6 text-muted-foreground" />
                          </div>
                        )}
                      </div>
                      <div className="flex-grow min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="font-medium text-foreground truncate">{user.display_name}</p>
                          {user.verified && (
                            <Badge variant="outline" className="border-green-500 text-green-400 text-xs">
                              <Check className="h-3 w-3" />
                            </Badge>
                          )}
                        </div>
                        {user.location && (
                          <p className="text-sm text-muted-foreground truncate">{user.location}</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Bio Section - Only for non-clients or if bio exists */}
            {profile.bio && !isClient && (
              <div className="bg-card rounded-lg shadow-md p-6 mb-6">
                <h2 className="text-xl font-semibold text-foreground mb-4">About</h2>
                <p className="text-foreground leading-relaxed">{profile.bio}</p>
              </div>
            )}

            {/* Gallery Section - Only for non-clients */}
            {!isClient && profile.gallery_images && profile.gallery_images.length > 0 && (
              <div className="bg-card rounded-lg shadow-md p-6 mb-6">
                <h2 className="text-xl font-semibold text-foreground mb-4">Gallery</h2>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {profile.gallery_images.map((image, index) => (
                    <img 
                      key={index}
                      src={image} 
                      alt={`Gallery ${index + 1}`}
                      className="w-full h-40 object-cover rounded-lg cursor-pointer transition-transform hover:scale-105"
                      onClick={() => handleImageClick(image, `Gallery ${index + 1}`)}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Services and Rates - Only for non-clients */}
            {!isClient && (
              <div className="grid md:grid-cols-2 gap-6">
                {profile.services && (
                  <div className="bg-card rounded-lg shadow-md p-6">
                    <h2 className="text-xl font-semibold text-foreground mb-4">Services</h2>
                    <p className="text-foreground">{profile.services}</p>
                  </div>
                )}

                {(profile.rates || profile.incall_hourly_rate || profile.outcall_hourly_rate) && (
                  <div className="bg-card rounded-lg shadow-md p-6">
                    <h2 className="text-xl font-semibold text-foreground mb-4">Rates</h2>
                    <div className="space-y-2">
                      {profile.incall_hourly_rate && (
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Incall (hourly):</span>
                          <span className="text-foreground font-medium">${profile.incall_hourly_rate}</span>
                        </div>
                      )}
                      {profile.outcall_hourly_rate && (
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Outcall (hourly):</span>
                          <span className="text-foreground font-medium">${profile.outcall_hourly_rate}</span>
                        </div>
                      )}
                      {profile.rates && !profile.incall_hourly_rate && !profile.outcall_hourly_rate && (
                        <p className="text-foreground">{profile.rates}</p>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Contact Section - Only show for other users' profiles and non-clients */}
            {!isOwnProfile && !isClient && (
              <div className="mt-6 bg-card rounded-lg shadow-md p-6">
                <h2 className="text-xl font-semibold text-foreground mb-4">Contact</h2>
                <div className="flex flex-col sm:flex-row gap-4">
                  <ContactRequestDialog 
                    escortId={profile.id}
                    escortName={profile.display_name || profile.username || 'Anonymous'}
                    isOpen={showContactDialog}
                    onClose={() => setShowContactDialog(false)}
                  />
                  <MessageButton 
                    escortId={profile.id} 
                    escortName={profile.display_name || profile.username || 'Anonymous'}
                  />
                  <FollowButton 
                    escortId={profile.id}
                    escortName={profile.display_name || profile.username || 'Anonymous'}
                  />
                </div>
              </div>
            )}
          </div>
        </div>
      </main>

      <Footer />

      {/* Image Zoom Modal */}
      <ImageZoomModal
        isOpen={isZoomModalOpen}
        onClose={() => setIsZoomModalOpen(false)}
        imageUrl={selectedImage?.url || ''}
        altText={selectedImage?.alt || ''}
      />
    </div>
  );
};

export default UserProfilePage;
