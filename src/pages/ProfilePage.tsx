import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { 
  Star, 
  MapPin, 
  Calendar, 
  Eye, 
  User as UserIcon,
  DollarSign,
  Phone,
  Mail,
  MessageSquare,
  Camera,
  ChevronLeft,
  ChevronRight
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import NavBar from "@/components/NavBar";
import Footer from "@/components/Footer";
import { MessageButton } from "@/components/messaging/MessageButton";
import SocialMediaLinks from "@/components/SocialMediaLinks";
import { ContactRequestDialog } from "@/components/ContactRequestDialog";
import { FollowButton } from "@/components/FollowButton";
import { ImageZoomModal } from "@/components/ImageZoomModal";

interface ProfileData {
  id: string;
  display_name: string | null;
  bio: string | null;
  age: string | null;
  location: string | null;
  profile_picture: string | null;
  verified: boolean | null;
  featured: boolean | null;
  view_count: number | null;
  rating: number | null;
  role: string | null;
  ethnicity: string | null;
  body_type: string | null;
  hair_color: string | null;
  eye_color: string | null;
  height: string | null;
  weight: string | null;
  languages: string | null;
  services: string | null;
  hourly_rate: string | null;
  two_hour_rate: string | null;
  dinner_rate: string | null;
  overnight_rate: string | null;
  incall_hourly_rate: string | null;
  outcall_hourly_rate: string | null;
  incall_two_hour_rate: string | null;
  outcall_two_hour_rate: string | null;
  incall_dinner_rate: string | null;
  outcall_dinner_rate: string | null;
  incall_overnight_rate: string | null;
  outcall_overnight_rate: string | null;
  tags: string | null;
  gallery_images: string[] | null;
  instagram_url?: string | null;
  twitter_url?: string | null;
  facebook_url?: string | null;
  linkedin_url?: string | null;
  youtube_url?: string | null;
}

const ProfilePage = () => {
  const { id } = useParams<{ id: string }>();
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [showContactDialog, setShowContactDialog] = useState(false);
  const [showZoomModal, setShowZoomModal] = useState(false);

  useEffect(() => {
    if (id) {
      fetchProfile();
      getCurrentUser();
    }
  }, [id]);

  const getCurrentUser = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    setCurrentUser(session?.user || null);
  };

  const fetchProfile = async () => {
    try {
      setLoading(true);
      
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", id)
        .eq("status", "approved")
        .single();

      if (error) {
        console.error("Error fetching profile:", error);
        toast.error("Profile not found");
        return;
      }

      setProfile(data);
      
      // Increment view count
      await supabase
        .from("profiles")
        .update({ view_count: (data.view_count || 0) + 1 })
        .eq("id", id);
        
    } catch (error) {
      console.error("Error:", error);
      toast.error("Failed to load profile");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <NavBar />
        <div className="flex-grow flex items-center justify-center">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-secondary border-t-transparent rounded-full animate-spin mx-auto"></div>
            <p className="mt-4 text-foreground">Loading profile...</p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <NavBar />
        <div className="flex-grow flex items-center justify-center">
          <div className="text-center">
            <p className="text-red-500">Profile not found</p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  const tags = profile.tags ? profile.tags.split(',').filter(Boolean) : [];
  const allImages = [profile.profile_picture, ...(profile.gallery_images || [])].filter(Boolean);

  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % allImages.length);
  };

  const prevImage = () => {
    setCurrentImageIndex((prev) => (prev - 1 + allImages.length) % allImages.length);
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <NavBar />
      
      <main className="flex-grow py-8">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Left Side - Image Gallery */}
              <div className="space-y-4">
                {/* Main Image Display */}
                <div className="relative aspect-[3/4] bg-gray-100 rounded-lg overflow-hidden">
                  {allImages.length > 0 ? (
                    <>
                      <img
                        src={allImages[currentImageIndex]}
                        alt={`${profile.display_name || "Profile"} - Image ${currentImageIndex + 1}`}
                        className="w-full h-full object-cover cursor-pointer hover:scale-105 transition-transform"
                        onClick={() => setShowZoomModal(true)}
                      />
                      {allImages.length > 1 && (
                        <>
                          <button
                            onClick={prevImage}
                            className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-black/50 text-white p-2 rounded-full hover:bg-black/70 transition-colors"
                          >
                            <ChevronLeft className="h-5 w-5" />
                          </button>
                          <button
                            onClick={nextImage}
                            className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-black/50 text-white p-2 rounded-full hover:bg-black/70 transition-colors"
                          >
                            <ChevronRight className="h-5 w-5" />
                          </button>
                          <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-black/50 text-white px-3 py-1 rounded-full text-sm">
                            {currentImageIndex + 1} / {allImages.length}
                          </div>
                        </>
                      )}
                    </>
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <UserIcon className="h-24 w-24 text-gray-400" />
                    </div>
                  )}
                </div>

                {/* Thumbnail Strip */}
                {allImages.length > 1 && (
                  <div className="flex space-x-2 overflow-x-auto pb-2">
                    {allImages.map((image, index) => (
                      <button
                        key={index}
                        onClick={() => setCurrentImageIndex(index)}
                        className={`flex-shrink-0 w-20 h-20 rounded-md overflow-hidden border-2 transition-colors ${
                          index === currentImageIndex ? 'border-primary' : 'border-gray-200'
                        }`}
                      >
                        <img
                          src={image}
                          alt={`Thumbnail ${index + 1}`}
                          className="w-full h-full object-cover"
                        />
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Right Side - Profile Information */}
              <div className="space-y-6">
                {/* Header */}
                <div className="space-y-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-3 mb-2">
                        <h1 className="text-4xl font-serif font-bold text-foreground">
                          {profile.display_name || "Anonymous"}
                        </h1>
                        {profile.verified && (
                          <Badge variant="secondary" className="bg-green-100 text-green-800">
                            <Star className="h-3 w-3 mr-1" />
                            Verified
                          </Badge>
                        )}
                        {profile.featured && (
                          <Badge variant="secondary" className="bg-gold text-white">
                            Featured
                          </Badge>
                        )}
                      </div>
                      <div className="flex items-center text-sm text-muted-foreground space-x-4 mb-3">
                        <span className="capitalize">{profile.role}</span>
                        {profile.rating && (
                          <div className="flex items-center">
                            <Star className="h-4 w-4 fill-current text-gold mr-1" />
                            <span>{profile.rating}</span>
                          </div>
                        )}
                        {profile.view_count !== null && (
                          <div className="flex items-center">
                            <Eye className="h-4 w-4 mr-1" />
                            <span>{profile.view_count} views</span>
                          </div>
                        )}
                      </div>
                      
                      {/* Follow Button - Add this right after view count */}
                      {profile.role === 'escort' && (
                        <div className="mb-4">
                          <FollowButton 
                            escortId={profile.id} 
                            escortName={profile.display_name || "Anonymous"} 
                          />
                        </div>
                      )}
                      
                      {/* Social Media Links */}
                      <SocialMediaLinks
                        instagram_url={profile.instagram_url}
                        twitter_url={profile.twitter_url}
                        facebook_url={profile.facebook_url}
                        linkedin_url={profile.linkedin_url}
                        youtube_url={profile.youtube_url}
                      />
                    </div>
                    
                    {/* Contact Buttons */}
                    <div className="flex flex-col gap-2">
                      {currentUser && currentUser.id !== profile.id ? (
                        <MessageButton 
                          escortId={profile.id} 
                          escortName={profile.display_name || "Anonymous"} 
                        />
                      ) : !currentUser ? (
                        <Button 
                          className="btn-gold" 
                          size="lg" 
                          onClick={() => setShowContactDialog(true)}
                        >
                          <MessageSquare className="h-5 w-5 mr-2" />
                          Request Contact Info
                        </Button>
                      ) : null}
                    </div>
                  </div>
                </div>

                {/* About Section */}
                {profile.bio && (
                  <Card>
                    <CardHeader>
                      <CardTitle>About</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-muted-foreground leading-relaxed">
                        {profile.bio}
                      </p>
                    </CardContent>
                  </Card>
                )}

                {/* Basic Information */}
                <Card>
                  <CardHeader>
                    <CardTitle>Basic Information</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {profile.location && (
                      <div className="flex items-center space-x-3">
                        <MapPin className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">{profile.location}</span>
                      </div>
                    )}
                    {profile.age && (
                      <div className="flex items-center space-x-3">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">{profile.age} years old</span>
                      </div>
                    )}
                    {profile.height && (
                      <div className="flex items-center space-x-3">
                        <UserIcon className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">Height: {profile.height}</span>
                      </div>
                    )}
                    {profile.weight && (
                      <div className="flex items-center space-x-3">
                        <UserIcon className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">Weight: {profile.weight}</span>
                      </div>
                    )}
                    {profile.languages && (
                      <div className="flex items-center space-x-3">
                        <UserIcon className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">Languages: {profile.languages}</span>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Appearance Details */}
                {(profile.ethnicity || profile.body_type || profile.hair_color || profile.eye_color) && (
                  <Card>
                    <CardHeader>
                      <CardTitle>Appearance</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 gap-3 text-sm">
                        {profile.ethnicity && (
                          <div className="flex justify-between">
                            <span className="font-medium">Ethnicity:</span>
                            <span className="text-muted-foreground">{profile.ethnicity}</span>
                          </div>
                        )}
                        {profile.body_type && (
                          <div className="flex justify-between">
                            <span className="font-medium">Body Type:</span>
                            <span className="text-muted-foreground">{profile.body_type}</span>
                          </div>
                        )}
                        {profile.hair_color && (
                          <div className="flex justify-between">
                            <span className="font-medium">Hair Color:</span>
                            <span className="text-muted-foreground">{profile.hair_color}</span>
                          </div>
                        )}
                        {profile.eye_color && (
                          <div className="flex justify-between">
                            <span className="font-medium">Eye Color:</span>
                            <span className="text-muted-foreground">{profile.eye_color}</span>
                          </div>
                        )}
                      </div>
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
                      <p className="text-sm text-muted-foreground leading-relaxed">
                        {profile.services}
                      </p>
                    </CardContent>
                  </Card>
                )}

                {/* Rates */}
                {(profile.hourly_rate || profile.incall_hourly_rate || profile.outcall_hourly_rate) && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center">
                        <DollarSign className="h-5 w-5 mr-2" />
                        Rates
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {/* General Rates */}
                        {(profile.hourly_rate || profile.two_hour_rate || profile.dinner_rate || profile.overnight_rate) && (
                          <div>
                            <h4 className="font-medium mb-2 text-sm">General</h4>
                            <div className="space-y-1 text-sm">
                              {profile.hourly_rate && (
                                <div className="flex justify-between">
                                  <span>1 Hour:</span>
                                  <span>${profile.hourly_rate}</span>
                                </div>
                              )}
                              {profile.two_hour_rate && (
                                <div className="flex justify-between">
                                  <span>2 Hours:</span>
                                  <span>${profile.two_hour_rate}</span>
                                </div>
                              )}
                              {profile.dinner_rate && (
                                <div className="flex justify-between">
                                  <span>Dinner:</span>
                                  <span>${profile.dinner_rate}</span>
                                </div>
                              )}
                              {profile.overnight_rate && (
                                <div className="flex justify-between">
                                  <span>Overnight:</span>
                                  <span>${profile.overnight_rate}</span>
                                </div>
                              )}
                            </div>
                          </div>
                        )}

                        {/* Incall Rates */}
                        {(profile.incall_hourly_rate || profile.incall_two_hour_rate || profile.incall_dinner_rate || profile.incall_overnight_rate) && (
                          <div>
                            <h4 className="font-medium mb-2 text-sm">Incall</h4>
                            <div className="space-y-1 text-sm">
                              {profile.incall_hourly_rate && (
                                <div className="flex justify-between">
                                  <span>1 Hour:</span>
                                  <span>${profile.incall_hourly_rate}</span>
                                </div>
                              )}
                              {profile.incall_two_hour_rate && (
                                <div className="flex justify-between">
                                  <span>2 Hours:</span>
                                  <span>${profile.incall_two_hour_rate}</span>
                                </div>
                              )}
                              {profile.incall_dinner_rate && (
                                <div className="flex justify-between">
                                  <span>Dinner:</span>
                                  <span>${profile.incall_dinner_rate}</span>
                                </div>
                              )}
                              {profile.incall_overnight_rate && (
                                <div className="flex justify-between">
                                  <span>Overnight:</span>
                                  <span>${profile.incall_overnight_rate}</span>
                                </div>
                              )}
                            </div>
                          </div>
                        )}

                        {/* Outcall Rates */}
                        {(profile.outcall_hourly_rate || profile.outcall_two_hour_rate || profile.outcall_dinner_rate || profile.outcall_overnight_rate) && (
                          <div>
                            <h4 className="font-medium mb-2 text-sm">Outcall</h4>
                            <div className="space-y-1 text-sm">
                              {profile.outcall_hourly_rate && (
                                <div className="flex justify-between">
                                  <span>1 Hour:</span>
                                  <span>${profile.outcall_hourly_rate}</span>
                                </div>
                              )}
                              {profile.outcall_two_hour_rate && (
                                <div className="flex justify-between">
                                  <span>2 Hours:</span>
                                  <span>${profile.outcall_two_hour_rate}</span>
                                </div>
                              )}
                              {profile.outcall_dinner_rate && (
                                <div className="flex justify-between">
                                  <span>Dinner:</span>
                                  <span>${profile.outcall_dinner_rate}</span>
                                </div>
                              )}
                              {profile.outcall_overnight_rate && (
                                <div className="flex justify-between">
                                  <span>Overnight:</span>
                                  <span>${profile.outcall_overnight_rate}</span>
                                </div>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Tags */}
                {tags.length > 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle>Tags</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex flex-wrap gap-2">
                        {tags.map((tag, index) => (
                          <Badge key={index} variant="outline">
                            {tag.trim()}
                          </Badge>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>
      
      <Footer />

      {/* Contact Request Dialog */}
      <ContactRequestDialog
        isOpen={showContactDialog}
        onClose={() => setShowContactDialog(false)}
        escortId={profile.id}
        escortName={profile.display_name || "Anonymous"}
      />

      {/* Image Zoom Modal */}
      <ImageZoomModal
        isOpen={showZoomModal}
        onClose={() => setShowZoomModal(false)}
        imageUrl={allImages[currentImageIndex] || ''}
        altText={`${profile.display_name || "Profile"} - Image ${currentImageIndex + 1}`}
      />
    </div>
  );
};

export default ProfilePage;
