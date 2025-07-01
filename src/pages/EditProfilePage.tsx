import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import NavBar from "@/components/NavBar";
import Footer from "@/components/Footer";
import EditProfileForm from "@/components/EditProfileForm";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Camera } from "lucide-react";
import PhotoGalleryManager from "@/components/PhotoGalleryManager";

interface UserProfile {
  id: string;
  email: string;
  username: string | null;
  display_name: string | null;
  role: string | null;
  bio?: string | null;
  age?: string | null;
  height?: string | null;
  weight?: string | null;
  ethnicity?: string | null;
  body_type?: string | null;
  hair_color?: string | null;
  eye_color?: string | null;
  cup_size?: string | null;
  nationality?: string | null;
  smoking?: string | null;
  drinking?: string | null;
  languages?: string | null;
  services?: string | null;
  hourly_rate?: string | null;
  two_hour_rate?: string | null;
  dinner_rate?: string | null;
  overnight_rate?: string | null;
  incall_hourly_rate?: string | null;
  outcall_hourly_rate?: string | null;
  incall_two_hour_rate?: string | null;
  outcall_two_hour_rate?: string | null;
  incall_dinner_rate?: string | null;
  outcall_dinner_rate?: string | null;
  incall_overnight_rate?: string | null;
  outcall_overnight_rate?: string | null;
  profile_picture?: string | null;
  tags?: string | null;
  tattoos?: boolean | null;
  piercings?: boolean | null;
  phone?: string | null;
  country_code?: string | null;
  gallery_images?: string[] | null;
  instagram_url?: string | null;
  twitter_url?: string | null;
  facebook_url?: string | null;
  linkedin_url?: string | null;
  youtube_url?: string | null;
}

const EditProfilePage = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [showPhotoGallery, setShowPhotoGallery] = useState(false);

  useEffect(() => {
    checkAuthAndFetchProfile();
  }, []);

  const checkAuthAndFetchProfile = async () => {
    try {
      setLoading(true);
      
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        toast.error("Please log in to edit your profile");
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
        height: data.height,
        weight: data.weight,
        ethnicity: data.ethnicity,
        body_type: data.body_type,
        hair_color: data.hair_color,
        eye_color: data.eye_color,
        cup_size: data.cup_size,
        nationality: data.nationality,
        smoking: data.smoking,
        drinking: data.drinking,
        languages: data.languages,
        services: data.services,
        hourly_rate: data.hourly_rate,
        two_hour_rate: data.two_hour_rate,
        dinner_rate: data.dinner_rate,
        overnight_rate: data.overnight_rate,
        incall_hourly_rate: data.incall_hourly_rate,
        outcall_hourly_rate: data.outcall_hourly_rate,
        incall_two_hour_rate: data.incall_two_hour_rate,
        outcall_two_hour_rate: data.outcall_two_hour_rate,
        incall_dinner_rate: data.incall_dinner_rate,
        outcall_dinner_rate: data.outcall_dinner_rate,
        incall_overnight_rate: data.incall_overnight_rate,
        outcall_overnight_rate: data.outcall_overnight_rate,
        profile_picture: data.profile_picture,
        tags: data.tags,
        tattoos: data.tattoos,
        piercings: data.piercings,
        phone: data.phone,
        country_code: data.country_code,
        gallery_images: data.gallery_images,
        instagram_url: data.instagram_url,
        twitter_url: data.twitter_url,
        facebook_url: data.facebook_url,
        linkedin_url: data.linkedin_url,
        youtube_url: data.youtube_url,
      });
    } catch (error) {
      console.error("Profile error:", error);
      toast.error("An error occurred while loading your profile");
    } finally {
      setLoading(false);
    }
  };

  const handleProfileUpdate = (updatedProfile: any) => {
    setProfile(prev => prev ? { ...prev, ...updatedProfile } : null);
    toast.success("Profile updated successfully!");
    navigate("/user-profile");
  };

  const handleCancel = () => {
    navigate("/user-profile");
  };

  const handleShowUpgrade = () => {
    navigate("/user-profile");
  };

  const handlePhotoGalleryUpdate = (newGallery: string[]) => {
    if (profile) {
      setProfile({ ...profile, gallery_images: newGallery });
    }
  };

  const handleClosePhotoGallery = () => {
    setShowPhotoGallery(false);
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
          <div className="mb-8 flex items-center gap-4">
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={handleCancel}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Profile
            </Button>
            <div>
              <h1 className="text-3xl font-serif font-bold text-foreground">Edit Profile</h1>
              <p className="text-muted-foreground mt-2">Update your profile information and settings</p>
            </div>
          </div>
          
          <div className="max-w-4xl mx-auto space-y-6">
            <EditProfileForm 
              profile={profile}
              onProfileUpdate={handleProfileUpdate}
              onCancel={handleCancel}
            />

            {/* Photo Gallery Section for Escorts */}
            {profile?.role === 'escort' && (
              <div className="mt-8">
                <Button 
                  onClick={() => setShowPhotoGallery(true)}
                  className="bg-secondary hover:bg-secondary/90 text-secondary-foreground"
                >
                  <Camera className="h-4 w-4 mr-2" />
                  Manage Photo Gallery
                </Button>

                <PhotoGalleryManager
                  isOpen={showPhotoGallery}
                  onClose={handleClosePhotoGallery}
                  userId={profile.id}
                  currentGallery={profile.gallery_images || []}
                  onGalleryUpdate={handlePhotoGalleryUpdate}
                  onUpgrade={handleShowUpgrade}
                />
              </div>
            )}
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default EditProfilePage;
