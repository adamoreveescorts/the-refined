import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { User, Settings, CreditCard, MessageSquare, Users, Bell } from "lucide-react";
import { toast } from "sonner";
import { useUserRole } from "@/hooks/useUserRole";
import EditProfileForm from "@/components/EditProfileForm";
import PhotoGalleryManager from "@/components/PhotoGalleryManager";
import AnnouncementManager from "@/components/AnnouncementManager";
import { AnnouncementFeed } from "@/components/AnnouncementFeed";
import { ImageZoomModal } from "@/components/ImageZoomModal";

const UserProfilePage = () => {
  const navigate = useNavigate();
  const { user, profile, isLoading, refreshProfile } = useUserRole();
  const [activeTab, setActiveTab] = useState("profile");
  const [showGalleryManager, setShowGalleryManager] = useState(false);
  const [showZoomModal, setShowZoomModal] = useState(false);

  useEffect(() => {
    if (!isLoading && !user) {
      navigate("/auth");
    }
  }, [user, isLoading, navigate]);

  const handleGalleryUpdate = (newGallery: string[]) => {
    // Handle gallery update
    refreshProfile();
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-secondary mx-auto mb-4"></div>
          <p className="text-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user || !profile) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Authentication Required</CardTitle>
            <CardDescription>Please sign in to view your profile.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4">
            <Button onClick={() => navigate("/auth")}>Go to Sign In</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background py-6">
      <div className="container max-w-5xl mx-auto space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-4">
              <div 
                className="cursor-pointer transition-transform hover:scale-105"
                onClick={() => setShowZoomModal(true)}
              >
                <Avatar>
                  <AvatarImage src={profile?.avatar_url} alt={profile?.display_name || profile?.username} />
                  <AvatarFallback>{(profile?.display_name || profile?.username || 'U')?.charAt(0).toUpperCase()}</AvatarFallback>
                </Avatar>
              </div>
              <span>{profile?.display_name || profile?.username}</span>
              {profile?.role && (
                <Badge variant="secondary">{profile?.role}</Badge>
              )}
            </CardTitle>
            <CardDescription>
              Manage your profile information, settings, and subscription.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue={activeTab} className="w-full">
              <TabsList>
                <TabsTrigger value="profile" onClick={() => setActiveTab("profile")}>
                  <User className="h-4 w-4 mr-2" />
                  Profile
                </TabsTrigger>
                {profile?.role === 'escort' && (
                  <TabsTrigger value="announcements" onClick={() => setActiveTab("announcements")}>
                    <Bell className="h-4 w-4 mr-2" />
                    Announcements
                  </TabsTrigger>
                )}
                {profile?.role === 'escort' && (
                  <TabsTrigger value="gallery" onClick={() => setActiveTab("gallery")}>
                    <Users className="h-4 w-4 mr-2" />
                    Gallery
                  </TabsTrigger>
                )}
                <TabsTrigger value="settings" onClick={() => setActiveTab("settings")}>
                  <Settings className="h-4 w-4 mr-2" />
                  Settings
                </TabsTrigger>
              </TabsList>
              <TabsContent value="profile">
                <EditProfileForm 
                  profile={profile}
                  onProfileUpdate={refreshProfile}
                  onCancel={() => {}}
                />
              </TabsContent>
              <TabsContent value="announcements">
                <AnnouncementManager />
                <AnnouncementFeed />
              </TabsContent>
              <TabsContent value="gallery">
                <Button onClick={() => setShowGalleryManager(true)}>
                  Manage Photo Gallery
                </Button>
              </TabsContent>
              <TabsContent value="settings">
                <div>
                  <h3 className="text-lg font-semibold mb-4">Account Settings</h3>
                  <p className="text-muted-foreground">Manage your account preferences.</p>
                  <Button onClick={() => supabase.auth.signOut()} variant="destructive" className="mt-4">
                    Sign Out
                  </Button>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>

      {/* Photo Gallery Manager Dialog */}
      {showGalleryManager && user && (
        <PhotoGalleryManager
          isOpen={showGalleryManager}
          onClose={() => setShowGalleryManager(false)}
          userId={user.id}
          currentGallery={[]}
          onGalleryUpdate={handleGalleryUpdate}
        />
      )}

      {/* Image Zoom Modal */}
      <ImageZoomModal
        isOpen={showZoomModal}
        onClose={() => setShowZoomModal(false)}
        imageUrl={profile?.avatar_url || ''}
        altText={`${profile?.display_name || profile?.username || 'User'} profile picture`}
      />
    </div>
  );
};

export default UserProfilePage;
