
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  User, 
  Mail, 
  Camera, 
  Star, 
  Edit,
  Settings,
  Shield,
  Bell,
  Megaphone,
  Heart
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import NavBar from "@/components/NavBar";
import Footer from "@/components/Footer";
import { Link } from "react-router-dom";
import { useUserRole } from "@/hooks/useUserRole";
import { AnnouncementManager } from "@/components/AnnouncementManager";
import { AnnouncementFeed } from "@/components/AnnouncementFeed";

const UserProfilePage = () => {
  const { user, profile, loading: userLoading } = useUserRole();
  const [loading, setLoading] = useState(true);
  const [profileData, setProfileData] = useState<any>(null);

  useEffect(() => {
    if (user && !userLoading) {
      fetchProfileData();
    }
  }, [user, userLoading]);

  const fetchProfileData = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();

      if (error) throw error;
      setProfileData(data);
    } catch (error) {
      console.error("Error fetching profile:", error);
      toast.error("Failed to load profile data");
    } finally {
      setLoading(false);
    }
  };

  if (userLoading || loading) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <NavBar />
        <div className="flex-grow flex items-center justify-center">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-secondary border-t-transparent rounded-full animate-spin mx-auto"></div>
            <p className="mt-4 text-foreground">Loading your profile...</p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <NavBar />
        <div className="flex-grow flex items-center justify-center">
          <div className="text-center">
            <p className="text-red-500">Please sign in to view your profile</p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  const completionPercentage = profileData?.profile_completion_percentage || 0;

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <NavBar />
      
      <main className="flex-grow py-8">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-6xl mx-auto">
            {/* Header */}
            <div className="mb-8">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-3xl font-bold">
                    Welcome, {profileData?.display_name || "User"}
                  </h1>
                  <p className="text-muted-foreground mt-1">
                    Manage your profile and account settings
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="capitalize">
                    {profile?.role || "User"}
                  </Badge>
                  {profileData?.verified && (
                    <Badge className="bg-green-100 text-green-800">
                      <Shield className="h-3 w-3 mr-1" />
                      Verified
                    </Badge>
                  )}
                </div>
              </div>
            </div>

            {/* Profile Completion */}
            {(profile?.role === 'escort' || profile?.role === 'agency') && (
              <Card className="mb-6">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <User className="h-5 w-5" />
                    Profile Completion
                  </CardTitle>
                  <CardDescription>
                    Complete your profile to increase visibility and bookings
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Profile completed</span>
                      <span>{completionPercentage}%</span>
                    </div>
                    <Progress value={completionPercentage} className="h-2" />
                    {completionPercentage < 100 && (
                      <p className="text-sm text-muted-foreground">
                        <Link to="/edit-profile" className="text-primary hover:underline">
                          Complete your profile
                        </Link>{" "}
                        to improve your visibility in search results.
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Main Content Tabs */}
            <Tabs defaultValue="overview" className="space-y-6">
              <TabsList className="grid grid-cols-2 lg:grid-cols-4 w-full">
                <TabsTrigger value="overview" className="flex items-center gap-2">
                  <User className="h-4 w-4" />
                  Overview
                </TabsTrigger>
                {profile?.role === 'escort' && (
                  <TabsTrigger value="announcements" className="flex items-center gap-2">
                    <Megaphone className="h-4 w-4" />
                    Announcements
                  </TabsTrigger>
                )}
                {profile?.role === 'client' && (
                  <TabsTrigger value="feed" className="flex items-center gap-2">
                    <Bell className="h-4 w-4" />
                    Feed
                  </TabsTrigger>
                )}
                <TabsTrigger value="settings" className="flex items-center gap-2">
                  <Settings className="h-4 w-4" />
                  Settings
                </TabsTrigger>
              </TabsList>

              {/* Overview Tab */}
              <TabsContent value="overview" className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {/* Profile Info Card */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <User className="h-5 w-5" />
                        Profile Information
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm font-medium">Display Name:</span>
                        <span className="text-sm text-muted-foreground">
                          {profileData?.display_name || "Not set"}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm font-medium">Email:</span>
                        <span className="text-sm text-muted-foreground">
                          {profileData?.email || "Not set"}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm font-medium">Location:</span>
                        <span className="text-sm text-muted-foreground">
                          {profileData?.location || "Not set"}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm font-medium">Status:</span>
                        <Badge variant="outline" className="capitalize">
                          {profileData?.status || "Pending"}
                        </Badge>
                      </div>
                      <div className="pt-4">
                        <Link to="/edit-profile">
                          <Button className="w-full" variant="outline">
                            <Edit className="h-4 w-4 mr-2" />
                            Edit Profile
                          </Button>
                        </Link>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Account Status Card */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Shield className="h-5 w-5" />
                        Account Status
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium">Verification:</span>
                        <Badge className={profileData?.verified ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800"}>
                          {profileData?.verified ? "Verified" : "Pending"}
                        </Badge>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium">Profile Active:</span>
                        <Badge className={profileData?.is_active ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}>
                          {profileData?.is_active ? "Active" : "Inactive"}
                        </Badge>
                      </div>
                      {!profileData?.verified && (
                        <div className="pt-4">
                          <Link to="/photo-verification">
                            <Button className="w-full btn-gold" size="sm">
                              <Camera className="h-4 w-4 mr-2" />
                              Get Verified
                            </Button>
                          </Link>
                        </div>
                      )}
                    </CardContent>
                  </Card>

                  {/* Quick Actions Card */}
                  <Card>
                    <CardHeader>
                      <CardTitle>Quick Actions</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <Link to="/messages">
                        <Button variant="outline" className="w-full justify-start">
                          <Mail className="h-4 w-4 mr-2" />
                          View Messages
                        </Button>
                      </Link>
                      {profile?.role === 'escort' && (
                        <Link to={`/profile/${user.id}`}>
                          <Button variant="outline" className="w-full justify-start">
                            <User className="h-4 w-4 mr-2" />
                            View Public Profile
                          </Button>
                        </Link>
                      )}
                      {profile?.role === 'client' && (
                        <Link to="/directory">
                          <Button variant="outline" className="w-full justify-start">
                            <Heart className="h-4 w-4 mr-2" />
                            Browse Directory
                          </Button>
                        </Link>
                      )}
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              {/* Announcements Tab (Escorts only) */}
              {profile?.role === 'escort' && (
                <TabsContent value="announcements">
                  <AnnouncementManager />
                </TabsContent>
              )}

              {/* Feed Tab (Clients only) */}
              {profile?.role === 'client' && (
                <TabsContent value="feed">
                  <AnnouncementFeed />
                </TabsContent>
              )}

              {/* Settings Tab */}
              <TabsContent value="settings">
                <Card>
                  <CardHeader>
                    <CardTitle>Account Settings</CardTitle>
                    <CardDescription>
                      Manage your account preferences and settings
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <p className="text-sm text-muted-foreground">
                        More settings coming soon...
                      </p>
                      <div className="flex gap-2">
                        <Link to="/edit-profile">
                          <Button variant="outline">
                            <Edit className="h-4 w-4 mr-2" />
                            Edit Profile
                          </Button>
                        </Link>
                        {!profileData?.verified && (
                          <Link to="/photo-verification">
                            <Button className="btn-gold">
                              <Camera className="h-4 w-4 mr-2" />
                              Get Verified
                            </Button>
                          </Link>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default UserProfilePage;
