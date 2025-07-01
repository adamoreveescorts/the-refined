import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import NavBar from '@/components/NavBar';
import Footer from '@/components/Footer';
import { Badge } from '@/components/ui/badge';
import { Check, Star } from 'lucide-react';
import { ImageZoomModal } from '@/components/ImageZoomModal';
import { ContactRequestDialog } from '@/components/ContactRequestDialog';
import { MessageButton } from '@/components/MessageButton';
import { FollowButton } from '@/components/FollowButton';

interface Profile {
  id: string;
  username: string;
  display_name: string;
  email: string;
  phone: string;
  role: string;
  bio: string;
  age: number;
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
  hourly_rate: number;
  two_hour_rate: number;
  dinner_rate: number;
  overnight_rate: number;
	incall_hourly_rate: number;
	outcall_hourly_rate: number;
	incall_two_hour_rate: number;
	outcall_two_hour_rate: number;
	incall_dinner_rate: number;
	outcall_dinner_rate: number;
	incall_overnight_rate: number;
	outcall_overnight_rate: number;
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

interface Image {
  url: string;
  alt: string;
}

const UserProfilePage = () => {
  const { id } = useParams<{ id: string }>();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [isZoomModalOpen, setIsZoomModalOpen] = useState(false);
  const [selectedImage, setSelectedImage] = useState<Image | null>(null);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setLoading(true);
        if (!id) {
          throw new Error("No user ID provided");
        }
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', id)
          .single();

        if (error) {
          throw error;
        }

        setProfile(data);
      } catch (error: any) {
        console.error('Error fetching profile:', error);
        toast.error(`Failed to load profile: ${error.message}`);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [id]);

  const handleImageClick = (imageUrl: string, altText: string) => {
    setSelectedImage({ url: imageUrl, alt: altText });
    setIsZoomModalOpen(true);
  };

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
                <div className="flex-shrink-0">
                  <img 
                    src={profile.profile_picture || "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3"} 
                    alt={profile.display_name || profile.username || 'Profile'}
                    className="w-48 h-48 object-cover rounded-lg cursor-pointer transition-transform hover:scale-105"
                    onClick={() => handleImageClick(
                      profile.profile_picture || "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3",
                      profile.display_name || profile.username || 'Profile'
                    )}
                  />
                </div>
                
                <div className="flex-grow">
                  <div className="flex items-center gap-3 mb-4">
                    <h1 className="text-3xl font-bold text-foreground">
                      {profile.display_name || profile.username || 'Anonymous'}
                    </h1>
                    {profile.verified && (
                      <Badge variant="outline" className="flex items-center border-green-500 text-green-400">
                        <Check className="h-4 w-4 mr-1" />
                        Verified
                      </Badge>
                    )}
                    {profile.featured && (
                      <Badge variant="secondary">Featured</Badge>
                    )}
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
                    {profile.age && (
                      <div>
                        <span className="text-muted-foreground">Age:</span>
                        <span className="ml-2 text-foreground">{profile.age}</span>
                      </div>
                    )}
                    {profile.location && (
                      <div>
                        <span className="text-muted-foreground">Location:</span>
                        <span className="ml-2 text-foreground">{profile.location}</span>
                      </div>
                    )}
                    {profile.height && (
                      <div>
                        <span className="text-muted-foreground">Height:</span>
                        <span className="ml-2 text-foreground">{profile.height}</span>
                      </div>
                    )}
                    {profile.ethnicity && (
                      <div>
                        <span className="text-muted-foreground">Ethnicity:</span>
                        <span className="ml-2 text-foreground">{profile.ethnicity}</span>
                      </div>
                    )}
                    {profile.body_type && (
                      <div>
                        <span className="text-muted-foreground">Body Type:</span>
                        <span className="ml-2 text-foreground">{profile.body_type}</span>
                      </div>
                    )}
                    {profile.hair_color && (
                      <div>
                        <span className="text-muted-foreground">Hair:</span>
                        <span className="ml-2 text-foreground">{profile.hair_color}</span>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-4 mt-4">
                    <div className="flex items-center">
                      <Star className="h-5 w-5 text-secondary fill-secondary mr-1" />
                      <span className="font-medium text-foreground">{profile.rating?.toFixed(1) || '4.5'}</span>
                    </div>
                    <span className="text-muted-foreground">•</span>
                    <span className="text-muted-foreground">{profile.view_count || 0} views</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Bio Section */}
            {profile.bio && (
              <div className="bg-card rounded-lg shadow-md p-6 mb-6">
                <h2 className="text-xl font-semibold text-foreground mb-4">About</h2>
                <p className="text-foreground leading-relaxed">{profile.bio}</p>
              </div>
            )}

            {/* Gallery Section */}
            {profile.gallery_images && profile.gallery_images.length > 0 && (
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

            {/* Services and Rates */}
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

            {/* Contact Section */}
            <div className="mt-6 bg-card rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold text-foreground mb-4">Contact</h2>
              <div className="flex flex-col sm:flex-row gap-4">
                <ContactRequestDialog 
                  escort={{
                    id: profile.id,
                    username: profile.username || 'Anonymous',
                    display_name: profile.display_name || profile.username || 'Anonymous',
                    email: profile.email || '',
                    phone: profile.phone,
                    role: profile.role || 'escort',
                    bio: profile.bio,
                    age: profile.age,
                    height: profile.height,
                    weight: profile.weight,
                    ethnicity: profile.ethnicity,
                    body_type: profile.body_type,
                    hair_color: profile.hair_color,
                    eye_color: profile.eye_color,
                    cup_size: profile.cup_size,
                    nationality: profile.nationality,
                    smoking: profile.smoking,
                    drinking: profile.drinking,
                    location: profile.location,
                    languages: profile.languages,
                    services: profile.services,
                    rates: profile.rates,
                    availability: profile.availability,
                    tags: profile.tags,
                    profile_picture: profile.profile_picture,
                    gallery_images: profile.gallery_images,
                    gallery_videos: profile.gallery_videos,
                    hourly_rate: profile.hourly_rate,
                    two_hour_rate: profile.two_hour_rate,
                    dinner_rate: profile.dinner_rate,
                    overnight_rate: profile.overnight_rate,
                    incall_hourly_rate: profile.incall_hourly_rate,
                    outcall_hourly_rate: profile.outcall_hourly_rate,
                    incall_two_hour_rate: profile.incall_two_hour_rate,
                    outcall_two_hour_rate: profile.outcall_two_hour_rate,
                    incall_dinner_rate: profile.incall_dinner_rate,
                    outcall_dinner_rate: profile.outcall_dinner_rate,
                    incall_overnight_rate: profile.incall_overnight_rate,
                    outcall_overnight_rate: profile.outcall_overnight_rate,
                    country_code: profile.country_code,
                    instagram_url: profile.instagram_url,
                    twitter_url: profile.twitter_url,
                    facebook_url: profile.facebook_url,
                    linkedin_url: profile.linkedin_url,
                    youtube_url: profile.youtube_url
                  }}
                />
                <MessageButton escortId={profile.id} />
                <FollowButton escortId={profile.id} />
              </div>
            </div>
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
