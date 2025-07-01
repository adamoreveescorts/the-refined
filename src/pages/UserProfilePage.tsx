import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import NavBar from "@/components/NavBar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  Edit, 
  Settings, 
  Star, 
  MapPin, 
  Calendar, 
  Eye, 
  Phone, 
  Mail, 
  User as UserIcon,
  Flag
} from "lucide-react";

interface UserProfile {
  id: string;
  email: string;
  username: string | null;
  display_name: string | null;
  role: string | null;
  bio?: string | null;
  age?: string | null;
  location?: string | null;
  profile_picture?: string | null;
  verified?: boolean | null;
  featured?: boolean | null;
  view_count?: number | null;
  rating?: number | null;
  created_at?: string | null;
  phone?: string | null;
  country_code?: string | null;
}

const UserProfilePage = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<UserProfile | null>(null);

  useEffect(() => {
    checkAuthAndFetchProfile();
  }, []);

  const checkAuthAndFetchProfile = async () => {
    try {
      setLoading(true);
      
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        toast.error("Please log in to view your profile");
        navigate("/auth");
        return;
      }
      
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", session.user.id)
        .single();
        
      if (error) {
        console.error("Error fetching profile:", error);
        toast.error("Failed to load profile");
        return;
      }
      
      setProfile({
        id: data.id,
        email: data.email || session.user.email,
        username: data.username || "User",
        display_name: data.display_name || data.username || "User",
        role: data.role || "client",
        bio: data.bio,
        age: data.age,
        location: data.location,
        profile_picture: data.profile_picture,
        verified: data.verified,
        featured: data.featured,
        view_count: data.view_count,
        rating: data.rating,
        created_at: data.created_at,
        phone: data.phone,
        country_code: data.country_code,
      });
    } catch (error) {
      console.error("Profile error:", error);
      toast.error("An error occurred while loading your profile");
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
            <Button className="mt-4" onClick={() => navigate("/user-profile")}>Return to Profile</Button>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

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
                  <Avatar className="h-20 w-20">
                    <AvatarImage src={profile?.profile_picture || ""} alt={profile?.display_name || "Profile"} />
                    <AvatarFallback>
                      <UserIcon className="h-8 w-8" />
                    </AvatarFallback>
                  </Avatar>
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <h1 className="text-2xl font-serif font-bold text-foreground">
                        {profile?.display_name || profile?.username}
                      </h1>
                      {profile?.verified && (
                        <Badge variant="secondary" className="bg-green-100 text-green-800">
                          <Star className="h-3 w-3 mr-1" />
                          Verified
                        </Badge>
                      )}
                      {profile?.featured && (
                        <Badge variant="secondary" className="bg-gold text-white">
                          Featured
                        </Badge>
                      )}
                    </div>
                    <div className="flex items-center text-sm text-muted-foreground space-x-4">
                      <span className="capitalize">{profile?.role}</span>
                      {profile?.rating && (
                        <div className="flex items-center">
                          <Star className="h-4 w-4 fill-current text-gold mr-1" />
                          <span>{profile.rating}</span>
                        </div>
                      )}
                      {profile?.view_count !== null && (
                        <div className="flex items-center">
                          <Eye className="h-4 w-4 mr-1" />
                          <span>{profile.view_count} views</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button
                    onClick={() => navigate("/edit-profile")}
                    variant="outline"
                    size="sm"
                  >
                    <Edit className="h-4 w-4 mr-2" />
                    Edit Profile
                  </Button>
                  <Button
                    onClick={() => navigate("/settings")}
                    variant="outline"
                    size="sm"
                  >
                    <Settings className="h-4 w-4 mr-2" />
                    Settings
                  </Button>
                </div>
              </CardHeader>
            </Card>

            {/* Profile Details */}
            <div className="grid gap-6 md:grid-cols-2">
              {/* Basic Information */}
              <Card>
                <CardHeader>
                  <CardTitle>Basic Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center space-x-3">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">{profile?.email}</span>
                  </div>
                  {profile?.phone && (
                    <div className="flex items-center space-x-3">
                      <Phone className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">{profile.phone}</span>
                      {profile?.country_code && (
                        <Badge variant="outline" className="ml-2">
                          <Flag className="h-3 w-3 mr-1" />
                          {profile.country_code}
                        </Badge>
                      )}
                    </div>
                  )}
                  {profile?.location && (
                    <div className="flex items-center space-x-3">
                      <MapPin className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">{profile.location}</span>
                    </div>
                  )}
                  {profile?.age && (
                    <div className="flex items-center space-x-3">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">{profile.age} years old</span>
                    </div>
                  )}
                  {profile?.created_at && (
                    <div className="flex items-center space-x-3">
                      <UserIcon className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">
                        Member since {new Date(profile.created_at).toLocaleDateString()}
                      </span>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Bio */}
              {profile?.bio && (
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
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default UserProfilePage;
