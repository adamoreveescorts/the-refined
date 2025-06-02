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
import { UserRound, Calendar, Mail, Shield, User, CreditCard, Crown, Clock } from "lucide-react";
import SubscriptionTierSelector from "@/components/SubscriptionTierSelector";

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
  const [subscription, setSubscription] = useState<any>(null);
  const [showUpgrade, setShowUpgrade] = useState(false);
  
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
        created_at: new Date(session.user.created_at || data.created_at).toLocaleDateString(),
        payment_status: data.payment_status || "pending",
        is_active: data.is_active || false
      });

      // Check subscription status for paid roles
      if (data.role === 'escort' || data.role === 'agency') {
        await checkSubscriptionStatus(session);
      }
    } catch (error) {
      console.error("Profile error:", error);
      toast.error("An error occurred while loading your profile");
    } finally {
      setLoading(false);
    }
  };

  const checkSubscriptionStatus = async (session: any) => {
    try {
      const { data, error } = await supabase.functions.invoke('check-subscription', {
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });
      
      if (!error && data) {
        setSubscription(data);
      }
    } catch (error) {
      console.error("Error checking subscription:", error);
    }
  };

  const handleManageSubscription = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        toast.error("Please log in first");
        return;
      }

      // Check if user has a Stripe customer ID first
      if (!subscription?.stripe_customer_id) {
        toast.error("No payment method found. Please upgrade to a paid plan first.");
        setShowUpgrade(true);
        return;
      }

      const { data, error } = await supabase.functions.invoke('customer-portal', {
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });

      if (error) {
        console.error("Portal error:", error);
        // If customer portal fails, offer alternative
        toast.error("Subscription management is not available at the moment. Please contact support or use the upgrade options below.");
        setShowUpgrade(true);
        return;
      }

      window.open(data.url, '_blank');
      toast.success("Redirected to subscription management portal.");
    } catch (error: any) {
      console.error("Portal error:", error);
      toast.error("Unable to access subscription management. Please use the upgrade options below.");
      setShowUpgrade(true);
    }
  };

  const handleUpgrade = async (tier: any) => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        toast.error("Please log in first");
        return;
      }

      const { data, error } = await supabase.functions.invoke('create-checkout', {
        body: { role: profile?.role, tier: tier.id },
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });

      if (error) throw error;

      if (tier.id === 'basic') {
        toast.success("Downgraded to Basic plan");
        await checkSubscriptionStatus(session);
        setShowUpgrade(false);
      } else {
        window.open(data.url, '_blank');
        toast.success("Redirected to Stripe checkout.");
      }
    } catch (error: any) {
      console.error("Upgrade error:", error);
      toast.error(error.message || "Failed to process upgrade");
    }
  };

  const getSubscriptionStatusBadge = () => {
    if (!subscription) return null;
    
    if (subscription.subscription_tier === 'Platinum') {
      return <Badge className="bg-gold text-white"><Crown className="h-3 w-3 mr-1" />Platinum</Badge>;
    }
    return <Badge variant="outline"><Shield className="h-3 w-3 mr-1" />Basic</Badge>;
  };

  const getExpirationInfo = () => {
    if (!subscription?.expires_at) return null;
    
    const expiresAt = new Date(subscription.expires_at);
    const now = new Date();
    const daysLeft = Math.ceil((expiresAt.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    
    if (daysLeft <= 0) {
      return <span className="text-red-600">Expired</span>;
    } else if (daysLeft <= 7) {
      return <span className="text-amber-600">Expires in {daysLeft} days</span>;
    } else {
      return <span className="text-green-600">Expires {expiresAt.toLocaleDateString()}</span>;
    }
  };

  const getPlanDurationDisplay = () => {
    if (!subscription) return null;
    
    if (subscription.subscription_type === 'recurring') {
      return subscription.subscription_end ? 
        `Renews on ${new Date(subscription.subscription_end).toLocaleDateString()}` :
        'Active subscription';
    } else if (subscription.subscription_type === 'one_time' && subscription.expires_at) {
      return `Valid until ${new Date(subscription.expires_at).toLocaleDateString()}`;
    } else if (subscription.subscription_tier === 'Basic') {
      return 'Forever';
    }
    return null;
  };

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
            <p className="text-gray-500 mt-2">Manage your account settings and subscription</p>
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

                  {/* Show subscription info for paid roles */}
                  {(profile?.role === 'escort' || profile?.role === 'agency') && (
                    <>
                      <div className="flex items-start">
                        <Crown className="h-5 w-5 mr-2 text-gray-400" />
                        <div className="w-full">
                          <p className="text-sm text-gray-500">Current Plan</p>
                          <div className="flex flex-col gap-1">
                            {getSubscriptionStatusBadge()}
                            {getPlanDurationDisplay() && (
                              <span className="text-xs text-gray-600">{getPlanDurationDisplay()}</span>
                            )}
                            {subscription?.expires_at && (
                              <div className="flex items-center">
                                <Clock className="h-3 w-3 mr-1 text-gray-400" />
                                <span className="text-xs">{getExpirationInfo()}</span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>

                      {subscription?.is_featured && (
                        <div className="flex items-start">
                          <Crown className="h-5 w-5 mr-2 text-gold" />
                          <div>
                            <p className="text-sm text-gray-500">Featured Status</p>
                            <Badge className="bg-gold text-white">Featured Profile</Badge>
                          </div>
                        </div>
                      )}

                      {subscription?.photo_verified && (
                        <div className="flex items-start">
                          <Shield className="h-5 w-5 mr-2 text-green-500" />
                          <div>
                            <p className="text-sm text-gray-500">Verification</p>
                            <Badge className="bg-green-500 text-white">Photo Verified</Badge>
                          </div>
                        </div>
                      )}
                    </>
                  )}
                </div>
                
                <div className="mt-6 space-y-2">
                  <Button className="w-full" variant="outline">
                    Edit Profile
                  </Button>
                  {(profile?.role === 'escort' || profile?.role === 'agency') && (
                    <Button 
                      className="w-full btn-gold" 
                      onClick={() => setShowUpgrade(!showUpgrade)}
                    >
                      {subscription?.subscription_tier === 'Platinum' ? 'Manage Plan' : 'Upgrade Plan'}
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
            
            {/* Content Section */}
            <div className="md:col-span-2">
              {showUpgrade && (profile?.role === 'escort' || profile?.role === 'agency') ? (
                <Card className="bg-white shadow-sm">
                  <CardHeader>
                    <CardTitle className="text-navy">Choose Your Plan</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <SubscriptionTierSelector 
                      onTierSelect={handleUpgrade}
                      selectedTier={subscription?.subscription_tier === 'Platinum' ? 'platinum_monthly' : 'basic'}
                      currentTier={subscription?.subscription_tier}
                      role={profile?.role as "escort" | "agency"}
                    />
                    <div className="mt-4">
                      <Button 
                        variant="outline" 
                        onClick={() => setShowUpgrade(false)}
                        className="w-full"
                      >
                        Cancel
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ) : (
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
                                <p className="text-sm text-gray-500">Subscription Status</p>
                                <div className="mt-1">
                                  {subscription?.subscription_tier === 'Platinum' ? (
                                    <Badge className="bg-green-500">
                                      {subscription?.subscription_type === 'recurring' ? 'Active Subscription' : 'Active (One-time)'}
                                    </Badge>
                                  ) : (
                                    <Badge className="bg-amber-500">Basic Plan</Badge>
                                  )}
                                </div>
                              </div>
                              <div className="space-x-2">
                                {subscription?.subscription_tier === 'Platinum' && subscription?.stripe_customer_id ? (
                                  <Button variant="outline" onClick={handleManageSubscription}>
                                    <CreditCard className="h-4 w-4 mr-2" />
                                    Manage Subscription
                                  </Button>
                                ) : (
                                  <Button className="btn-gold" onClick={() => setShowUpgrade(true)}>
                                    Upgrade Plan
                                  </Button>
                                )}
                              </div>
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

                            {/* Show subscription benefits */}
                            {subscription?.subscription_tier === 'Platinum' && (
                              <div>
                                <p className="text-sm text-gray-500 mb-2">Platinum Benefits</p>
                                <div className="p-4 bg-gold/10 rounded-md border border-gold/20">
                                  <div className="grid grid-cols-2 gap-2 text-sm">
                                    <div className="flex items-center">
                                      <Crown className="h-4 w-4 mr-2 text-gold" />
                                      <span className={subscription?.is_featured ? "text-green-600" : "text-gray-500"}>
                                        Featured Profile {subscription?.is_featured ? "✓" : ""}
                                      </span>
                                    </div>
                                    <div className="flex items-center">
                                      <Shield className="h-4 w-4 mr-2 text-green-500" />
                                      <span className={subscription?.photo_verified ? "text-green-600" : "text-gray-500"}>
                                        Photo Verified {subscription?.photo_verified ? "✓" : ""}
                                      </span>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            )}
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
                              <Badge className={subscription?.subscription_tier === 'Platinum' ? "bg-green-500" : "bg-red-500"}>
                                {subscription?.subscription_tier === 'Platinum' ? "Public" : "Not Visible"}
                              </Badge>
                              <p className="text-sm text-gray-500 mt-1">
                                {subscription?.subscription_tier === 'Platinum'
                                  ? "Your profile is visible in the directory" 
                                  : "Your profile is not visible until you have an active Platinum subscription"}
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
