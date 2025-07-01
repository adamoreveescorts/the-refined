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
  Camera
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import NavBar from "@/components/NavBar";
import Footer from "@/components/Footer";
import MessageButton from "@/components/messaging/MessageButton";
import SocialMediaLinks from "@/components/SocialMediaLinks";

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
  const galleryImages = profile.gallery_images || [];

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <NavBar />
      
      <main className="flex-grow py-8">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto space-y-6">
            {/* Profile Header */}
            <Card>
              <CardHeader className="flex flex-row items-center space-y-0 pb-2">
                <div className="flex items-center space-x-4 flex-1">
                  <Avatar className="h-24 w-24">
                    <AvatarImage src={profile.profile_picture || ""} alt={profile.display_name || "Profile"} />
                    <AvatarFallback>
                      <UserIcon className="h-12 w-12" />
                    </AvatarFallback>
                  </Avatar>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <h1 className="text-3xl font-serif font-bold text-foreground">
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
                    <div className="flex items-center text-sm text-muted-foreground space-x-4">
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
                    
                    {/* Social Media Links */}
                    <SocialMediaLinks
                      instagram_url={profile.instagram_url}
                      twitter_url={profile.twitter_url}
                      facebook_url={profile.facebook_url}
                      linkedin_url={profile.linkedin_url}
                      youtube_url={profile.youtube_url}
                    />
                  </div>
                </div>
                <div className="flex flex-col gap-2">
                  {currentUser && currentUser.id !== profile.id && (
                    <MessageButton escortId={profile.id} />
                  )}
                </div>
              </CardHeader>
            </Card>

            {/* Profile Content */}
            <div className="grid gap-6 md:grid-cols-2">
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

              {/* About Section */}
              {profile.bio && (
                <Card>
                  <CardHeader>
                    <CardTitle>About</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {profile.bio}
                    </p>
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Appearance Details */}
            {(profile.ethnicity || profile.body_type || profile.hair_color || profile.eye_color) && (
              <Card>
                <CardHeader>
                  <CardTitle>Appearance</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    {profile.ethnicity && (
                      <div>
                        <span className="font-medium">Ethnicity:</span>
                        <p className="text-muted-foreground">{profile.ethnicity}</p>
                      </div>
                    )}
                    {profile.body_type && (
                      <div>
                        <span className="font-medium">Body Type:</span>
                        <p className="text-muted-foreground">{profile.body_type}</p>
                      </div>
                    )}
                    {profile.hair_color && (
                      <div>
                        <span className="font-medium">Hair Color:</span>
                        <p className="text-muted-foreground">{profile.hair_color}</p>
                      </div>
                    )}
                    {profile.eye_color && (
                      <div>
                        <span className="font-medium">Eye Color:</span>
                        <p className="text-muted-foreground">{profile.eye_color}</p>
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
                  <div className="grid gap-4 md:grid-cols-3">
                    {/* General Rates */}
                    {(profile.hourly_rate || profile.two_hour_rate || profile.dinner_rate || profile.overnight_rate) && (
                      <div>
                        <h4 className="font-medium mb-2">General</h4>
                        <div className="space-y-1 text-sm">
                          {profile.hourly_rate && <p>1 Hour: ${profile.hourly_rate}</p>}
                          {profile.two_hour_rate && <p>2 Hours: ${profile.two_hour_rate}</p>}
                          {profile.dinner_rate && <p>Dinner: ${profile.dinner_rate}</p>}
                          {profile.overnight_rate && <p>Overnight: ${profile.overnight_rate}</p>}
                        </div>
                      </div>
                    )}

                    {/* Incall Rates */}
                    {(profile.incall_hourly_rate || profile.incall_two_hour_rate || profile.incall_dinner_rate || profile.incall_overnight_rate) && (
                      <div>
                        <h4 className="font-medium mb-2">Incall</h4>
                        <div className="space-y-1 text-sm">
                          {profile.incall_hourly_rate && <p>1 Hour: ${profile.incall_hourly_rate}</p>}
                          {profile.incall_two_hour_rate && <p>2 Hours: ${profile.incall_two_hour_rate}</p>}
                          {profile.incall_dinner_rate && <p>Dinner: ${profile.incall_dinner_rate}</p>}
                          {profile.incall_overnight_rate && <p>Overnight: ${profile.incall_overnight_rate}</p>}
                        </div>
                      </div>
                    )}

                    {/* Outcall Rates */}
                    {(profile.outcall_hourly_rate || profile.outcall_two_hour_rate || profile.outcall_dinner_rate || profile.outcall_overnight_rate) && (
                      <div>
                        <h4 className="font-medium mb-2">Outcall</h4>
                        <div className="space-y-1 text-sm">
                          {profile.outcall_hourly_rate && <p>1 Hour: ${profile.outcall_hourly_rate}</p>}
                          {profile.outcall_two_hour_rate && <p>2 Hours: ${profile.outcall_two_hour_rate}</p>}
                          {profile.outcall_dinner_rate && <p>Dinner: ${profile.outcall_dinner_rate}</p>}
                          {profile.outcall_overnight_rate && <p>Overnight: ${profile.outcall_overnight_rate}</p>}
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

            {/* Photo Gallery */}
            {galleryImages.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Camera className="h-5 w-5 mr-2" />
                    Photo Gallery
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {galleryImages.map((image, index) => (
                      <div key={index} className="aspect-square overflow-hidden rounded-lg">
                        <img
                          src={image}
                          alt={`Gallery image ${index + 1}`}
                          className="w-full h-full object-cover hover:scale-105 transition-transform cursor-pointer"
                        />
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default ProfilePage;
