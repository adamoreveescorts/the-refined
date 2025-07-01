
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
  Flag,
  Crown,
  CreditCard,
  Shield,
  CheckCircle,
  XCircle,
  Clock,
  DollarSign,
  Camera,
  AlertCircle
} from "lucide-react";
import SocialMediaLinks from "@/components/SocialMediaLinks";

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
  is_active?: boolean | null;
  profile_completion_percentage?: number | null;
  setup_completed?: boolean | null;
  services?: string | null;
  hourly_rate?: string | null;
  gallery_images?: string[] | null;
  ethnicity?: string | null;
  body_type?: string | null;
  hair_color?: string | null;
  eye_color?: string | null;
  height?: string | null;
  weight?: string | null;
  languages?: string | null;
  tags?: string | null;
  instagram_url?: string | null;
  twitter_url?: string | null;
  facebook_url?: string | null;
  linkedin_url?: string | null;
  youtube_url?: string | null;
}

interface SubscriptionInfo {
  subscribed: boolean;
  subscription_tier: string | null;
  subscription_end: string | null;
  expires_at: string | null;
  is_featured: boolean;
  photo_verified: boolean;
  subscription_type: string | null;
  is_trial_active: boolean;
  profile_visible: boolean;
  trial_days_remaining?: number;
}

const UserProfilePage = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [subscriptionInfo, setSubscriptionInfo] = useState<SubscriptionInfo | null>(null);

  useEffect(() => {
    checkAuthAndFetchProfile();
    if (profile?.role === 'escort') {
      checkSubscription();
    }
  }, [profile?.role]);

  const checkSubscription = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const response = await supabase.functions.invoke('check-subscription');
      if (response.data) {
        setSubscriptionInfo(response.data);
      }
    } catch (error) {
      console.error('Error checking subscription:', error);
    }
  };

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
        is_active: data.is_active,
        profile_completion_percentage: data.profile_completion_percentage,
        setup_completed: data.setup_completed,
        services: data.services,
        hourly_rate: data.hourly_rate,
        gallery_images: data.gallery_images,
        ethnicity: data.ethnicity,
        body_type: data.body_type,
        hair_color: data.hair_color,
        eye_color: data.eye_color,
        height: data.height,
        weight: data.weight,
        languages: data.languages,
        tags: data.tags,
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

  const getVisibilityStatus = () => {
    if (profile?.role !== 'escort') return null;
    
    if (!subscriptionInfo) return { status: 'loading', text: 'Checking...', color: 'text-gray-500' };
    
    if (subscriptionInfo.profile_visible) {
      return { status: 'visible', text: 'Profile is Live', color: 'text-green-600' };
    } else {
      return { status: 'hidden', text: 'Profile Hidden', color: 'text-red-600' };
    }
  };

  const getSubscriptionStatus = () => {
    if (!subscriptionInfo) return null;
    
    if (subscriptionInfo.is_trial_active) {
      return {
        tier: 'Trial',
        status: 'Active',
        expires: subscriptionInfo.expires_at,
        color: 'bg-blue-100 text-blue-800'
      };
    } else if (subscriptionInfo.subscribed) {
      return {
        tier: subscriptionInfo.subscription_tier || 'Unknown',
        status: 'Active',
        expires: subscriptionInfo.expires_at,
        color: 'bg-green-100 text-green-800'
      };
    } else {
      return {
        tier: 'None',
        status: 'Inactive',
        expires: null,
        color: 'bg-red-100 text-red-800'
      };
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

  const visibilityStatus = getVisibilityStatus();
  const subscriptionStatus = getSubscriptionStatus();
  const tags = profile.tags ? profile.tags.split(',').filter(Boolean) : [];
  const galleryImages = profile.gallery_images || [];

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <NavBar />
      
      <main className="flex-grow py-8">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-6xl mx-auto space-y-6">
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
                  <div className="space-y-2">
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
                          <Crown className="h-3 w-3 mr-1" />
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
                      {visibilityStatus && (
                        <div className={`flex items-center ${visibilityStatus.color}`}>
                          {visibilityStatus.status === 'visible' ? 
                            <CheckCircle className="h-4 w-4 mr-1" /> : 
                            <XCircle className="h-4 w-4 mr-1" />
                          }
                          <span>{visibilityStatus.text}</span>
                        </div>
                      )}
                    </div>
                    
                    {/* Profile Completion for Escorts */}
                    {profile?.role === 'escort' && profile.profile_completion_percentage !== null && (
                      <div className="flex items-center space-x-2">
                        <span className="text-sm text-muted-foreground">Profile completion:</span>
                        <div className="flex-1 bg-gray-200 rounded-full h-2 max-w-32">
                          <div 
                            className="bg-blue-600 h-2 rounded-full" 
                            style={{ width: `${profile.profile_completion_percentage}%` }}
                          ></div>
                        </div>
                        <span className="text-sm font-medium">{profile.profile_completion_percentage}%</span>
                      </div>
                    )}
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

            <div className="grid gap-6 lg:grid-cols-3">
              {/* Main Profile Information */}
              <div className="lg:col-span-2 space-y-6">
                {/* Basic Information */}
                <Card>
                  <CardHeader>
                    <CardTitle>Profile Information</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid gap-4 md:grid-cols-2">
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
                    </div>
                    
                    {/* Social Media Links */}
                    {(profile?.instagram_url || profile?.twitter_url || profile?.facebook_url || profile?.linkedin_url || profile?.youtube_url) && (
                      <div className="pt-2">
                        <h4 className="text-sm font-medium mb-2">Social Media</h4>
                        <SocialMediaLinks
                          instagram_url={profile.instagram_url}
                          twitter_url={profile.twitter_url}
                          facebook_url={profile.facebook_url}
                          linkedin_url={profile.linkedin_url}
                          youtube_url={profile.youtube_url}
                        />
                      </div>
                    )}
                    
                    {profile?.created_at && (
                      <div className="flex items-center space-x-3 pt-2 border-t">
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

                {/* Escort-specific information */}
                {profile?.role === 'escort' && (
                  <>
                    {/* Physical Details */}
                    {(profile.height || profile.weight || profile.ethnicity || profile.body_type || profile.hair_color || profile.eye_color) && (
                      <Card>
                        <CardHeader>
                          <CardTitle>Physical Details</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
                            {profile.height && (
                              <div>
                                <span className="font-medium">Height:</span>
                                <p className="text-muted-foreground">{profile.height}</p>
                              </div>
                            )}
                            {profile.weight && (
                              <div>
                                <span className="font-medium">Weight:</span>
                                <p className="text-muted-foreground">{profile.weight}</p>
                              </div>
                            )}
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
                                <span className="font-medium">Hair:</span>
                                <p className="text-muted-foreground">{profile.hair_color}</p>
                              </div>
                            )}
                            {profile.eye_color && (
                              <div>
                                <span className="font-medium">Eyes:</span>
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
                    {profile.hourly_rate && (
                      <Card>
                        <CardHeader>
                          <CardTitle className="flex items-center">
                            <DollarSign className="h-5 w-5 mr-2" />
                            Rates
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="text-sm">
                            <p>Hourly Rate: ${profile.hourly_rate}</p>
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
                            Photo Gallery ({galleryImages.length} photos)
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="grid grid-cols-3 md:grid-cols-4 gap-2">
                            {galleryImages.slice(0, 8).map((image, index) => (
                              <div key={index} className="aspect-square overflow-hidden rounded-lg">
                                <img
                                  src={image}
                                  alt={`Gallery ${index + 1}`}
                                  className="w-full h-full object-cover"
                                />
                              </div>
                            ))}
                            {galleryImages.length > 8 && (
                              <div className="aspect-square bg-gray-100 rounded-lg flex items-center justify-center">
                                <span className="text-sm text-gray-600">+{galleryImages.length - 8} more</span>
                              </div>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    )}
                  </>
                )}
              </div>

              {/* Sidebar - Account Status & Plan Management */}
              <div className="space-y-6">
                {/* Account Status for Escorts */}
                {profile?.role === 'escort' && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center">
                        <Shield className="h-5 w-5 mr-2" />
                        Account Status
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-sm">Profile Status:</span>
                          {visibilityStatus && (
                            <Badge variant={visibilityStatus.status === 'visible' ? 'default' : 'secondary'}>
                              {visibilityStatus.text}
                            </Badge>
                          )}
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <span className="text-sm">Verification:</span>
                          <Badge variant={profile.verified ? 'default' : 'secondary'}>
                            {profile.verified ? 'Verified' : 'Unverified'}
                          </Badge>
                        </div>
                        
                        {profile.featured && (
                          <div className="flex items-center justify-between">
                            <span className="text-sm">Featured:</span>
                            <Badge className="bg-gold text-white">
                              <Crown className="h-3 w-3 mr-1" />
                              Featured
                            </Badge>
                          </div>
                        )}
                      </div>
                      
                      {!profile.verified && (
                        <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                          <div className="flex items-start space-x-2">
                            <AlertCircle className="h-4 w-4 text-yellow-600 mt-0.5" />
                            <div className="text-sm text-yellow-800">
                              <p className="font-medium">Verification Required</p>
                              <p>Complete photo verification to boost your profile visibility.</p>
                            </div>
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                )}

                {/* Subscription Management for Escorts */}
                {profile?.role === 'escort' && subscriptionStatus && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center">
                        <CreditCard className="h-5 w-5 mr-2" />
                        Subscription Plan
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-sm">Current Plan:</span>
                          <Badge className={subscriptionStatus.color}>
                            {subscriptionStatus.tier}
                          </Badge>
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <span className="text-sm">Status:</span>
                          <Badge variant={subscriptionStatus.status === 'Active' ? 'default' : 'secondary'}>
                            {subscriptionStatus.status}
                          </Badge>
                        </div>
                        
                        {subscriptionStatus.expires && (
                          <div className="flex items-center justify-between">
                            <span className="text-sm">Expires:</span>
                            <span className="text-sm text-muted-foreground">
                              {new Date(subscriptionStatus.expires).toLocaleDateString()}
                            </span>
                          </div>
                        )}
                        
                        {subscriptionInfo?.trial_days_remaining && (
                          <div className="flex items-center justify-between">
                            <span className="text-sm">Trial Days Left:</span>
                            <Badge variant="outline" className="bg-blue-50">
                              <Clock className="h-3 w-3 mr-1" />
                              {subscriptionInfo.trial_days_remaining} days
                            </Badge>
                          </div>
                        )}
                      </div>
                      
                      <div className="pt-2 space-y-2">
                        <Button 
                          className="w-full" 
                          onClick={() => navigate('/choose-plan')}
                          variant={subscriptionStatus.status === 'Active' ? 'outline' : 'default'}
                        >
                          {subscriptionStatus.status === 'Active' ? 'Manage Plan' : 'Choose Plan'}
                        </Button>
                        
                        {!subscriptionInfo?.subscribed && (
                          <p className="text-xs text-muted-foreground text-center">
                            Upgrade to make your profile visible to clients
                          </p>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Quick Actions */}
                <Card>
                  <CardHeader>
                    <CardTitle>Quick Actions</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <Button variant="outline" className="w-full justify-start" onClick={() => navigate('/edit-profile')}>
                      <Edit className="h-4 w-4 mr-2" />
                      Edit Profile
                    </Button>
                    
                    {profile?.role === 'escort' && (
                      <>
                        <Button variant="outline" className="w-full justify-start" onClick={() => navigate('/photo-verification')}>
                          <Shield className="h-4 w-4 mr-2" />
                          Photo Verification
                        </Button>
                        
                        <Button variant="outline" className="w-full justify-start" onClick={() => navigate('/messages')}>
                          <Mail className="h-4 w-4 mr-2" />
                          Messages
                        </Button>
                      </>
                    )}
                    
                    <Button variant="outline" className="w-full justify-start" onClick={() => navigate('/settings')}>
                      <Settings className="h-4 w-4 mr-2" />
                      Account Settings
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default UserProfilePage;
