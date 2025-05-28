import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import NavBar from "@/components/NavBar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { UserRound, Calendar, MapPin, Mail, Phone, Shield, User } from "lucide-react";

interface UserProfile {
  id: string;
  email: string;
  username: string | null;
  display_name: string | null;
  role: string | null;
  created_at: string;
  payment_status: string | null;
  is_active: boolean | null;
}

const UserProfilePage = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  
  useEffect(() => {
    // Check if user is authenticated
    const checkAuthAndFetchProfile = async () => {
      try {
        setLoading(true);
        
        // Get the current session
        const { data: { session } } = await supabase.auth.getSession();
        
        if (!session) {
          // If no session, redirect to login
          toast.error("Please log in to view your profile");
          navigate("/auth");
          return;
        }
        
        // Fetch user profile from the profiles table
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
        
        // Set profile data
        setProfile({
          id: data.id,
          email: data.email || session.user.email,
          username: data.username || "User",
          display_name: data.display_name || data.username || "User",
          role: data.role || "client",
          created_at: new Date(session.user.created_at || data.created_at).toLocaleDateString(),
          payment_status: data.payment_status || "pending",
          is_active: data.is_active || false
        });
      } catch (error) {
        console.error("Profile error:", error);
        toast.error("An error occurred while loading your profile");
      } finally {
        setLoading(false);
      }
    };
    
    checkAuthAndFetchProfile();
  }, [navigate]);
  
  if (loading) {
    return (
      <div className="min-h-screen flex flex-col">
        <NavBar />
        <div className="flex-grow flex items-center justify-center">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-gold border-t-transparent rounded-full animate-spin mx-auto"></div>
            <p className="mt-4 text-navy">Loading profile...</p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }
  
  if (!profile) {
    return (
      <div className="min-h-screen flex flex-col">
        <NavBar />
        <div className="flex-grow flex items-center justify-center">
          <div className="text-center">
            <p className="text-red-500">Profile not found</p>
            <Button className="mt-4" onClick={() => navigate("/")}>Return to Home</Button>
          </div>
        </div>
        <Footer />
      </div>
    );
  }
  
  return (
    <div className="min-h-screen flex flex-col">
      <NavBar />
      
      <main className="flex-grow bg-gray-50 py-8">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-8">
            <h1 className="text-3xl font-serif font-bold text-navy">My Profile</h1>
            <p className="text-gray-500 mt-2">Manage your account settings and preferences</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Profile Summary Card */}
            <Card className="bg-white shadow-sm md:col-span-1">
              <CardHeader>
                <CardTitle className="text-navy">Account Details</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col items-center space-y-4 mb-6">
                  <div className="w-20 h-20 rounded-full bg-navy/10 flex items-center justify-center">
                    <UserRound className="h-10 w-10 text-navy" />
                  </div>
                  <h3 className="text-xl font-medium">{profile?.display_name}</h3>
                  
                  <Badge className={`${
                    profile?.role === 'escort' || profile?.role === 'agency' 
                      ? 'bg-gold' 
                      : 'bg-navy'
                  }`}>
                    {profile?.role === 'escort' ? 'Escort' : 
                     profile?.role === 'agency' ? 'Agency' : 'Client'}
                  </Badge>
                </div>
                
                <Separator className="my-4" />
                
                <div className="space-y-3">
                  <div className="flex items-start">
                    <User className="h-5 w-5 mr-2 text-gray-400" />
                    <div>
                      <p className="text-sm text-gray-500">Username</p>
                      <p className="font-medium">{profile?.username}</p>
                    </div>
                  </div>

                  <div className="flex items-start">
                    <Mail className="h-5 w-5 mr-2 text-gray-400" />
                    <div>
                      <p className="text-sm text-gray-500">Email</p>
                      <p className="font-medium">{profile?.email}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start">
                    <Calendar className="h-5 w-5 mr-2 text-gray-400" />
                    <div>
                      <p className="text-sm text-gray-500">Member Since</p>
                      <p className="font-medium">{profile?.created_at}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start">
                    <Shield className="h-5 w-5 mr-2 text-gray-400" />
                    <div>
                      <p className="text-sm text-gray-500">Account Status</p>
                      <Badge variant={profile?.is_active ? "default" : "outline"} className={profile?.is_active ? "bg-green-500" : ""}>
                        {profile?.is_active ? "Active" : "Pending Activation"}
                      </Badge>
                    </div>
                  </div>
                </div>
                
                <div className="mt-6">
                  <Button className="w-full" variant="outline">
                    Edit Profile
                  </Button>
                </div>
              </CardContent>
            </Card>
            
            {/* Content Section */}
            <div className="md:col-span-2">
              <Tabs defaultValue="dashboard" className="w-full">
                <TabsList className="mb-6">
                  <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
                  <TabsTrigger value="settings">Settings</TabsTrigger>
                  {(profile?.role === 'escort' || profile?.role === 'agency') && (
                    <TabsTrigger value="profile-management">Profile Management</TabsTrigger>
                  )}
                </TabsList>
                
                <TabsContent value="dashboard" className="space-y-6">
                  <Card className="bg-white shadow-sm">
                    <CardHeader>
                      <CardTitle className="text-navy">Account Summary</CardTitle>
                    </CardHeader>
                    <CardContent>
                      {(profile?.role === 'escort' || profile?.role === 'agency') ? (
                        <div className="space-y-6">
                          <div className="flex justify-between items-center">
                            <div>
                              <p className="text-sm text-gray-500">Payment Status</p>
                              <div className="mt-1">
                                <Badge className={`${profile.payment_status === 'completed' ? 'bg-green-500' : 'bg-amber-500'}`}>
                                  {profile.payment_status === 'completed' ? 'Paid' : 'Payment Required'}
                                </Badge>
                              </div>
                            </div>
                            {profile.payment_status !== 'completed' && (
                              <Button className="btn-gold">Complete Payment</Button>
                            )}
                          </div>
                          
                          <div>
                            <p className="text-sm text-gray-500 mb-2">Profile Status</p>
                            <div className="p-4 bg-gray-50 rounded-md">
                              <div className="flex items-center justify-between mb-2">
                                <span>Profile Completion</span>
                                <span className="font-medium">65%</span>
                              </div>
                              <div className="w-full bg-gray-200 rounded-full h-2">
                                <div className="bg-gold h-2 rounded-full" style={{ width: '65%' }}></div>
                              </div>
                              <p className="mt-2 text-sm text-gray-500">Complete your profile to increase visibility</p>
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div className="space-y-6">
                          <div>
                            <h3 className="font-medium mb-2">Welcome to The Refined Escort</h3>
                            <p className="text-gray-500">Browse our directory to find the perfect companion for your next event or evening.</p>
                          </div>
                          
                          <div className="p-4 bg-gray-50 rounded-md">
                            <h4 className="font-medium mb-2">Recent Activity</h4>
                            <p className="text-gray-500 text-sm">You haven't made any bookings yet.</p>
                            <Button className="btn-gold mt-4">
                              Browse Directory
                            </Button>
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </TabsContent>
                
                <TabsContent value="settings" className="space-y-6">
                  <Card className="bg-white shadow-sm">
                    <CardHeader>
                      <CardTitle className="text-navy">Account Settings</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-6">
                        <div>
                          <h3 className="font-medium mb-3">Change Password</h3>
                          <Button variant="outline">Update Password</Button>
                        </div>
                        
                        <Separator />
                        
                        <div>
                          <h3 className="font-medium mb-3">Notification Preferences</h3>
                          <p className="text-gray-500 mb-3">Coming soon</p>
                        </div>
                        
                        <Separator />
                        
                        <div>
                          <h3 className="font-medium mb-3 text-red-600">Danger Zone</h3>
                          <Button variant="destructive">Delete Account</Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
                
                {(profile?.role === 'escort' || profile?.role === 'agency') && (
                  <TabsContent value="profile-management" className="space-y-6">
                    <Card className="bg-white shadow-sm">
                      <CardHeader>
                        <CardTitle className="text-navy">
                          {profile?.role === 'agency' ? 'Agency Profile' : 'Public Profile'}
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-6">
                          <div>
                            <h3 className="font-medium mb-3">Profile Visibility</h3>
                            <Badge className={profile?.is_active ? "bg-green-500" : "bg-red-500"}>
                              {profile?.is_active ? "Public" : "Not Visible"}
                            </Badge>
                            <p className="text-sm text-gray-500 mt-1">
                              {profile?.is_active 
                                ? "Your profile is visible in the directory" 
                                : "Your profile is not visible until subscription is active"}
                            </p>
                          </div>
                          
                          <Separator />
                          
                          <div>
                            <h3 className="font-medium mb-3">
                              {profile?.role === 'agency' ? 'Manage Agency Profile' : 'Edit Public Profile'}
                            </h3>
                            <Button className="btn-gold">Manage Profile</Button>
                          </div>
                          
                          <Separator />
                          
                          <div>
                            <h3 className="font-medium mb-3">
                              {profile?.role === 'agency' ? 'Manage Photos & Profiles' : 'Upload Photos'}
                            </h3>
                            <Button variant="outline">
                              {profile?.role === 'agency' ? 'Manage Content' : 'Manage Photos'}
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </TabsContent>
                )}
              </Tabs>
            </div>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default UserProfilePage;
