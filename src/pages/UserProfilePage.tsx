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
import { UserRound, Calendar, Mail, Shield, User, CreditCard, Crown, Clock, AlertCircle, Camera, Phone } from "lucide-react";
import SubscriptionTierSelector from "@/components/SubscriptionTierSelector";
import VerificationButton from "@/components/verification/VerificationButton";
import PhotoGalleryManager from "@/components/PhotoGalleryManager";
import { usePhotoLimits } from "@/hooks/usePhotoLimits";
import PhotoLimitsDisplay from "@/components/PhotoLimitsDisplay";
interface UserProfile {
  id: string;
  email: string;
  username: string | null;
  display_name: string | null;
  role: string | null;
  created_at: string;
  payment_status: string | null;
  is_active: boolean | null;
  profile_picture?: string | null;
  gallery_images?: string[] | null;
  phone?: string | null;
}
interface PhotoVerification {
  id: string;
  status: 'pending' | 'approved' | 'rejected';
  submitted_at: string;
  reviewed_at?: string;
}
const UserProfilePage = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [subscription, setSubscription] = useState<any>(null);
  const [photoVerification, setPhotoVerification] = useState<PhotoVerification | null>(null);
  const [showUpgrade, setShowUpgrade] = useState(false);
  const [showEditProfile, setShowEditProfile] = useState(false);
  const [showPhotoGallery, setShowPhotoGallery] = useState(false);
  const photoLimits = usePhotoLimits(profile?.id || '');
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
      
      console.log('Profile data fetched:', data); // Debug log
      console.log('Phone number from database:', data.phone); // Debug log specifically for phone
      
      setProfile({
        id: data.id,
        email: data.email || session.user.email,
        username: data.username || "User",
        display_name: data.display_name || data.username || "User",
        role: data.role || "client",
        created_at: new Date(session.user.created_at || data.created_at).toLocaleDateString(),
        payment_status: data.payment_status || "pending",
        is_active: data.is_active || false,
        profile_picture: data.profile_picture,
        gallery_images: data.gallery_images,
        phone: data.phone || null // Ensure phone is properly set
      });

      // Check subscription status for paid roles
      if (data.role === 'escort' || data.role === 'agency') {
        await Promise.all([checkSubscriptionStatus(session), checkPhotoVerificationStatus(session.user.id)]);
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
      const {
        data,
        error
      } = await supabase.functions.invoke('check-subscription', {
        headers: {
          Authorization: `Bearer ${session.access_token}`
        }
      });
      if (!error && data) {
        setSubscription(data);
      }
    } catch (error) {
      console.error("Error checking subscription:", error);
    }
  };
  const checkPhotoVerificationStatus = async (userId: string) => {
    try {
      const {
        data
      } = await supabase.from('photo_verifications').select('*').eq('user_id', userId).order('created_at', {
        ascending: false
      }).limit(1).single();
      if (data) {
        setPhotoVerification({
          id: data.id,
          status: data.status as 'pending' | 'approved' | 'rejected',
          submitted_at: data.submitted_at,
          reviewed_at: data.reviewed_at
        });
      }
    } catch (error) {
      setPhotoVerification(null);
    }
  };
  const handleManageSubscription = async () => {
    try {
      const {
        data: {
          session
        }
      } = await supabase.auth.getSession();
      if (!session) {
        toast.error("Please log in first");
        return;
      }
      if (!subscription?.stripe_customer_id) {
        toast.error("No payment method found. Please upgrade to a paid plan first.");
        handleShowUpgrade();
        return;
      }
      const {
        data,
        error
      } = await supabase.functions.invoke('customer-portal', {
        headers: {
          Authorization: `Bearer ${session.access_token}`
        }
      });
      if (error) {
        console.error("Portal error:", error);
        toast.error("Subscription management is not available at the moment. Please contact support or use the upgrade options below.");
        handleShowUpgrade();
        return;
      }
      window.open(data.url, '_blank');
      toast.success("Redirected to subscription management portal.");
    } catch (error: any) {
      console.error("Portal error:", error);
      toast.error("Unable to access subscription management. Please use the upgrade options below.");
      handleShowUpgrade();
    }
  };
  const handleUpgrade = async (tier: any) => {
    try {
      const {
        data: {
          session
        }
      } = await supabase.auth.getSession();
      if (!session) {
        toast.error("Please log in first");
        return;
      }
      const {
        data,
        error
      } = await supabase.functions.invoke('create-checkout', {
        body: {
          role: profile?.role,
          tier: tier.id
        },
        headers: {
          Authorization: `Bearer ${session.access_token}`
        }
      });
      if (error) throw error;

      // Handle free trial response (no redirect needed)
      if (data?.trial_activated) {
        toast.success("Free trial activated! Your 7-day trial has started.");
        await checkSubscriptionStatus(session);
        setShowUpgrade(false);
        return;
      }

      // Handle paid subscriptions (redirect to Stripe)
      if (data?.url) {
        window.open(data.url, '_blank');
        toast.success("Redirected to Stripe checkout.");
      } else {
        throw new Error("No checkout URL received");
      }
    } catch (error: any) {
      console.error("Upgrade error:", error);
      toast.error(error.message || "Failed to process upgrade");
    }
  };
  const handleShowEditProfile = () => {
    navigate("/edit-profile");
  };
  const handleShowUpgrade = () => {
    setShowEditProfile(false);
    setShowUpgrade(true);
  };
  const handleBackToProfile = () => {
    setShowEditProfile(false);
    setShowUpgrade(false);
  };
  const handleShowPhotoGallery = () => {
    setShowPhotoGallery(true);
  };
  const handleClosePhotoGallery = () => {
    setShowPhotoGallery(false);
    // Refresh photo limits when modal closes
    photoLimits.refresh();
  };
  const handlePhotoGalleryUpdate = (newGallery: string[]) => {
    // Update profile state if needed
    console.log('Gallery updated:', newGallery);
    // Refresh photo limits after gallery update
    photoLimits.refresh();
  };
  const getSubscriptionStatusBadge = () => {
    if (!subscription || !subscription.subscription_tier) {
      return <Badge variant="outline" className="text-muted-foreground">No Plan Selected</Badge>;
    }
    if (subscription.is_trial_active) {
      return <Badge className="bg-blue-500 text-white"><Clock className="h-3 w-3 mr-1" />Trial</Badge>;
    }
    if (subscription.subscription_tier.startsWith('Package')) {
      return <Badge className="bg-gold text-white"><Crown className="h-3 w-3 mr-1" />Premium</Badge>;
    }
    return <Badge variant="outline"><Shield className="h-3 w-3 mr-1" />Unknown</Badge>;
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
    if (!subscription || !subscription.subscription_tier) {
      return "No active plan selected";
    }
    if (subscription.is_trial_active) {
      const daysLeft = Math.ceil((new Date(subscription.expires_at).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
      return `Trial: ${daysLeft} days remaining`;
    }
    if (subscription.subscription_type === 'recurring') {
      return subscription.subscription_end ? `Renews on ${new Date(subscription.subscription_end).toLocaleDateString()}` : 'Active subscription';
    } else if (subscription.subscription_type === 'one_time' && subscription.expires_at) {
      return `Valid until ${new Date(subscription.expires_at).toLocaleDateString()}`;
    }
    return 'Active plan';
  };
  const isProfilePublic = () => {
    // For escorts, require both subscription and profile picture
    if (profile?.role === 'escort') {
      const hasValidSubscription = subscription && subscription.subscription_tier && (subscription.subscription_tier.startsWith('Package') || subscription.is_trial_active);
      const hasProfilePicture = profile?.profile_picture;
      return hasValidSubscription && hasProfilePicture;
    }

    // For agencies, only check subscription
    return subscription && subscription.subscription_tier && (subscription.subscription_tier.startsWith('Package') || subscription.is_trial_active);
  };
  const getProfileVisibilityMessage = () => {
    if (profile?.role === 'escort') {
      const hasValidSubscription = subscription && subscription.subscription_tier && (subscription.subscription_tier.startsWith('Package') || subscription.is_trial_active);
      const hasProfilePicture = profile?.profile_picture;
      if (!hasValidSubscription && !hasProfilePicture) {
        return "Choose a subscription plan and upload a profile picture to make your profile visible";
      } else if (!hasValidSubscription) {
        return "Choose a subscription plan to make your profile visible";
      } else if (!hasProfilePicture) {
        return "Upload a profile picture to make your profile visible in the directory";
      }
      return "Your profile is visible in the directory";
    }
    return isProfilePublic() ? "Your profile is visible in the directory" : hasNoActivePlan() ? "Choose a subscription plan to make your profile visible" : "Your profile is not visible until you have an active subscription";
  };
  const isActuallyPhotoVerified = () => {
    return photoVerification?.status === 'approved';
  };
  const isActuallyFeatured = () => {
    return subscription?.subscription_tier?.startsWith('Package') && !subscription?.is_trial_active && profile?.is_active;
  };
  const getCurrentTier = () => {
    if (!subscription || !subscription.subscription_tier) return null;
    if (subscription.is_trial_active) {
      return 'Trial';
    }
    return subscription.subscription_tier;
  };
  const getSelectedTier = () => {
    if (!subscription || !subscription.subscription_tier) return null;
    if (subscription.is_trial_active) {
      return 'free_trial';
    }
    if (subscription.subscription_tier === 'Package1') return 'package_1_weekly';
    if (subscription.subscription_tier === 'Package2') return 'package_2_monthly';
    if (subscription.subscription_tier === 'Package3') return 'package_3_quarterly';
    if (subscription.subscription_tier === 'Package4') return 'package_4_yearly';
    return null;
  };
  const hasNoActivePlan = () => {
    return !subscription || !subscription.subscription_tier || subscription.subscription_tier === null;
  };
  if (loading) {
    return <div className="min-h-screen flex flex-col bg-background">
        <NavBar />
        <div className="flex-grow flex items-center justify-center">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-secondary border-t-transparent rounded-full animate-spin mx-auto"></div>
            <p className="mt-4 text-foreground">Loading profile...</p>
          </div>
        </div>
        <Footer />
      </div>;
  }
  if (!profile) {
    return <div className="min-h-screen flex flex-col bg-background">
        <NavBar />
        <div className="flex-grow flex items-center justify-center">
          <div className="text-center">
            <p className="text-red-500">Profile not found</p>
            <Button className="mt-4" onClick={() => navigate("/")}>Return to Home</Button>
          </div>
        </div>
        <Footer />
      </div>;
  }
  return <div className="min-h-screen flex flex-col bg-background">
      <NavBar />
      
      <main className="flex-grow py-8">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-8">
            <h1 className="text-3xl font-serif font-bold text-foreground">My Profile</h1>
            <p className="text-muted-foreground mt-2">Manage your account settings and subscription</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Profile Summary Card */}
            <Card className="bg-card shadow-sm md:col-span-1 border-border">
              <CardHeader>
                <CardTitle className="text-foreground">Account Details</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col items-center space-y-4 mb-6">
                  <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center">
                    <UserRound className="h-10 w-10 text-foreground" />
                  </div>
                  <h3 className="text-xl font-medium text-foreground">{profile?.display_name}</h3>
                  
                  <Badge className={`${profile?.role === 'escort' || profile?.role === 'agency' ? 'bg-secondary text-secondary-foreground' : 'bg-primary text-primary-foreground'}`}>
                    {profile?.role === 'escort' ? 'Escort' : profile?.role === 'agency' ? 'Agency' : 'Client'}
                  </Badge>
                </div>
                
                <Separator className="my-4" />
                
                <div className="space-y-3">
                  <div className="flex items-start">
                    <User className="h-5 w-5 mr-2 text-muted-foreground" />
                    <div>
                      <p className="text-sm text-muted-foreground">Username</p>
                      <p className="font-medium text-foreground">{profile?.username}</p>
                    </div>
                  </div>

                  <div className="flex items-start">
                    <Mail className="h-5 w-5 mr-2 text-muted-foreground" />
                    <div>
                      <p className="text-sm text-muted-foreground">Email</p>
                      <p className="font-medium text-foreground">{profile?.email}</p>
                    </div>
                  </div>

                  {profile?.phone && <div className="flex items-start">
                      <Phone className="h-5 w-5 mr-2 text-muted-foreground" />
                      <div>
                        <p className="text-sm text-muted-foreground">Phone</p>
                        <p className="font-medium text-foreground">{profile.phone}</p>
                      </div>
                    </div>}
                  
                  <div className="flex items-start">
                    <Calendar className="h-5 w-5 mr-2 text-muted-foreground" />
                    <div>
                      <p className="text-sm text-muted-foreground">Member Since</p>
                      <p className="font-medium text-foreground">{profile?.created_at}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start">
                    <Shield className="h-5 w-5 mr-2 text-muted-foreground" />
                    <div>
                      <p className="text-sm text-muted-foreground">Account Status</p>
                      <Badge variant={profile?.is_active ? "default" : "outline"} className={profile?.is_active ? "bg-green-500" : ""}>
                        {profile?.is_active ? "Active" : "Inactive"}
                      </Badge>
                    </div>
                  </div>

                  {/* Show subscription info for paid roles */}
                  {(profile?.role === 'escort' || profile?.role === 'agency') && <>
                      <div className="flex items-start">
                        <Crown className="h-5 w-5 mr-2 text-muted-foreground" />
                        <div className="w-full">
                          <p className="text-sm text-muted-foreground">Current Plan</p>
                          <div className="flex flex-col gap-1">
                            {getSubscriptionStatusBadge()}
                            {getPlanDurationDisplay() && <span className="text-xs text-muted-foreground">{getPlanDurationDisplay()}</span>}
                            {subscription?.expires_at && <div className="flex items-center">
                                <Clock className="h-3 w-3 mr-1 text-muted-foreground" />
                                <span className="text-xs">{getExpirationInfo()}</span>
                              </div>}
                          </div>
                        </div>
                      </div>

                      {hasNoActivePlan() && <div className="flex items-start">
                          <AlertCircle className="h-5 w-5 mr-2 text-amber-500" />
                          <div className="w-full">
                            <p className="text-sm text-amber-600">No Active Plan</p>
                            <p className="text-xs text-muted-foreground">Choose a plan to access premium features</p>
                          </div>
                        </div>}

                      <div className="flex items-start">
                        <Shield className="h-5 w-5 mr-2 text-muted-foreground" />
                        <div className="w-full">
                          <p className="text-sm text-muted-foreground mb-2">Photo Verification</p>
                          <VerificationButton userRole={profile?.role || ''} subscription={subscription} userId={profile?.id || ''} />
                        </div>
                      </div>

                      {isActuallyFeatured() && <div className="flex items-start">
                          <Crown className="h-5 w-5 mr-2 text-secondary" />
                          <div>
                            <p className="text-sm text-muted-foreground">Featured Status</p>
                            <Badge className="bg-secondary text-secondary-foreground">Featured Profile</Badge>
                          </div>
                        </div>}

                      {isActuallyPhotoVerified() && <div className="flex items-start">
                          <Shield className="h-5 w-5 mr-2 text-green-500" />
                          <div>
                            <p className="text-sm text-muted-foreground">Verification</p>
                            <Badge className="bg-green-500 text-white">Photo Verified</Badge>
                          </div>
                        </div>}
                    </>}
                </div>
                
                <div className="mt-6 space-y-2">
                  <Button className="w-full" variant="outline" onClick={handleShowEditProfile}>
                    Edit Profile
                  </Button>
                  {(profile?.role === 'escort' || profile?.role === 'agency') && <>
                      <Button className="w-full bg-secondary hover:bg-secondary/90 text-secondary-foreground" onClick={handleShowUpgrade}>
                        {hasNoActivePlan() ? 'Choose Plan' : 'Manage Plan'}
                      </Button>
                      {profile?.role === 'escort' && <Button className="w-full" variant="outline" onClick={handleShowPhotoGallery}>
                          <Camera className="h-4 w-4 mr-2" />
                          Manage Photos
                        </Button>}
                    </>}
                </div>
              </CardContent>
            </Card>
            
            {/* Content Section */}
            <div className="md:col-span-2">
              {showUpgrade && (profile?.role === 'escort' || profile?.role === 'agency') ? <Card className="bg-card shadow-sm border-border">
                  <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle className="text-foreground">
                      {hasNoActivePlan() ? 'Choose Your First Plan' : 'Manage Your Plan'}
                    </CardTitle>
                    <Button variant="ghost" size="sm" onClick={handleBackToProfile} className="flex items-center gap-2">
                      Back
                    </Button>
                  </CardHeader>
                  <CardContent>
                    <SubscriptionTierSelector onTierSelect={handleUpgrade} selectedTier={getSelectedTier()} currentTier={getCurrentTier()} role={profile?.role as "escort" | "agency"} hasUsedTrial={subscription?.has_used_trial || false} showNoPlanMessage={hasNoActivePlan()} />
                  </CardContent>
                </Card> : <Tabs defaultValue="dashboard" className="w-full">
                  <TabsList className="mb-6">
                    <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
                    <TabsTrigger value="settings">Settings</TabsTrigger>
                    {(profile?.role === 'escort' || profile?.role === 'agency') && <TabsTrigger value="profile-management">Profile Management</TabsTrigger>}
                  </TabsList>
                  
                  <TabsContent value="dashboard" className="space-y-6">
                    <Card className="bg-card shadow-sm border-border">
                      <CardHeader>
                        <CardTitle className="text-foreground">Account Summary</CardTitle>
                      </CardHeader>
                      <CardContent>
                        {profile?.role === 'escort' || profile?.role === 'agency' ? <div className="space-y-6">
                            {hasNoActivePlan() && <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg">
                                <div className="flex items-start">
                                  <AlertCircle className="h-5 w-5 text-amber-500 mr-3 mt-0.5 flex-shrink-0" />
                                  <div>
                                    <h4 className="font-medium text-amber-800">No Plan Selected</h4>
                                    <p className="text-sm text-amber-700 mt-1">
                                      You need to choose a subscription plan to access premium features and make your profile visible to clients.
                                    </p>
                                    <Button className="mt-3 bg-amber-600 hover:bg-amber-700 text-white" onClick={handleShowUpgrade}>
                                      Choose Your Plan
                                    </Button>
                                  </div>
                                </div>
                              </div>}
                            
                            <div className="flex justify-between items-center">
                              <div>
                                <p className="text-sm text-muted-foreground">Subscription Status</p>
                                <div className="mt-1">
                                  {getSubscriptionStatusBadge()}
                                </div>
                              </div>
                              <div className="space-x-2">
                                {subscription?.subscription_tier && subscription?.stripe_customer_id ? <Button variant="outline" onClick={handleManageSubscription}>
                                    <CreditCard className="h-4 w-4 mr-2" />
                                    Manage Subscription
                                  </Button> : <Button className="bg-secondary hover:bg-secondary/90 text-secondary-foreground" onClick={handleShowUpgrade}>
                                    {hasNoActivePlan() ? 'Choose Plan' : 'Upgrade Plan'}
                                  </Button>}
                              </div>
                            </div>
                            
                            <div>
                              <p className="text-sm text-muted-foreground mb-2">Profile Status</p>
                              <div className="p-4 bg-muted rounded-md">
                                <div className="flex items-center justify-between mb-2">
                                  <span className="text-foreground">Profile Completion</span>
                                  <span className="font-medium text-foreground">65%</span>
                                </div>
                                <div className="w-full bg-border rounded-full h-2">
                                  <div className="bg-secondary h-2 rounded-full" style={{
                              width: '65%'
                            }}></div>
                                </div>
                                <p className="mt-2 text-sm text-muted-foreground">Complete your profile to increase visibility</p>
                              </div>
                            </div>

                            {/* Show subscription benefits */}
                            {subscription?.subscription_tier?.startsWith('Package') && <div>
                                <p className="text-sm text-muted-foreground mb-2">Premium Benefits</p>
                                <div className="p-4 bg-secondary/10 rounded-md border border-secondary/20">
                                  <div className="grid grid-cols-2 gap-2 text-sm">
                                    <div className="flex items-center">
                                      <Crown className="h-4 w-4 mr-2 text-secondary" />
                                      <span className={isActuallyFeatured() ? "text-green-600" : "text-muted-foreground"}>
                                        Featured Profile {isActuallyFeatured() ? "✓" : ""}
                                      </span>
                                    </div>
                                    <div className="flex items-center">
                                      <Shield className="h-4 w-4 mr-2 text-green-500" />
                                      <span className={isActuallyPhotoVerified() ? "text-green-600" : "text-muted-foreground"}>
                                        Photo Verified {isActuallyPhotoVerified() ? "✓" : ""}
                                      </span>
                                    </div>
                                  </div>
                                </div>
                              </div>}
                          </div> : <div className="space-y-6">
                            <div>
                              <h3 className="font-medium mb-2 text-foreground">Welcome to Adam or Eve Escorts</h3>
                              <p className="text-muted-foreground">Browse our directory to find the perfect companion for your next event or evening.</p>
                            </div>
                            
                            <div className="p-4 bg-muted rounded-md">
                              <h4 className="font-medium mb-2 text-foreground">Recent Activity</h4>
                              <p className="text-muted-foreground text-sm">You haven't made any bookings yet.</p>
                              <Button className="bg-secondary hover:bg-secondary/90 text-secondary-foreground mt-4">
                                Browse Directory
                              </Button>
                            </div>
                          </div>}
                      </CardContent>
                    </Card>

                    {/* Photo Management Card for Escorts */}
                    {profile?.role === 'escort' && !photoLimits.loading && <Card className="bg-card shadow-sm border-border">
                        <CardHeader>
                          <CardTitle className="text-foreground">Photo Management</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <PhotoLimitsDisplay usage={photoLimits.usage} limits={photoLimits.limits} subscriptionTier={photoLimits.subscriptionTier} onUpgrade={handleShowUpgrade} />
                          <Button onClick={handleShowPhotoGallery} className="w-full mt-4 bg-secondary hover:bg-secondary/90 text-secondary-foreground">
                            <Camera className="h-4 w-4 mr-2" />
                            Open Photo Gallery
                          </Button>
                        </CardContent>
                      </Card>}
                  </TabsContent>
                  
                  <TabsContent value="settings" className="space-y-6">
                    <Card className="bg-card shadow-sm border-border">
                      <CardHeader>
                        <CardTitle className="text-foreground">Account Settings</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-6">
                          <div>
                            <h3 className="font-medium mb-3 text-foreground">Change Password</h3>
                            <Button variant="outline">Update Password</Button>
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
                  
                  {(profile?.role === 'escort' || profile?.role === 'agency') && <TabsContent value="profile-management" className="space-y-6">
                      <Card className="bg-card shadow-sm border-border">
                        <CardHeader>
                          <CardTitle className="text-foreground">
                            {profile?.role === 'agency' ? 'Agency Profile' : 'Public Profile'}
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-6">
                            <div>
                              <h3 className="font-medium mb-3 text-foreground">Profile Visibility</h3>
                              <Badge className={isProfilePublic() ? "bg-green-500" : "bg-red-500"}>
                                {isProfilePublic() ? "Public" : "Not Visible"}
                              </Badge>
                              <p className="text-sm text-muted-foreground mt-1">
                                {getProfileVisibilityMessage()}
                              </p>
                            </div>
                            
                            <Separator />
                            
                            <div>
                              <h3 className="font-medium mb-3 text-foreground">
                                {profile?.role === 'agency' ? 'Manage Agency Profile' : 'Edit Public Profile'}
                              </h3>
                              <Button className="bg-secondary hover:bg-secondary/90 text-secondary-foreground" onClick={handleShowEditProfile}>
                                Manage Profile
                              </Button>
                            </div>
                            
                            <Separator />
                            
                            
                          </div>
                        </CardContent>
                      </Card>
                    </TabsContent>}
                </Tabs>}
            </div>
          </div>
        </div>
      </main>
      
      {/* Photo Gallery Manager Dialog */}
      {profile?.role === 'escort' && <PhotoGalleryManager isOpen={showPhotoGallery} onClose={handleClosePhotoGallery} userId={profile.id} currentGallery={profile.gallery_images || []} onGalleryUpdate={handlePhotoGalleryUpdate} onUpgrade={handleShowUpgrade} />}
      
      <Footer />
    </div>;
};
export default UserProfilePage;
