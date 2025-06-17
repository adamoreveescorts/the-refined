import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ArrowLeft, CreditCard, User, Building2, RefreshCw, Crown, Shield, Clock } from "lucide-react";
import { toast } from "sonner";
import SubscriptionTierSelector from "@/components/SubscriptionTierSelector";
import FreeTrialConfirmDialog from "@/components/FreeTrialConfirmDialog";

const PaymentTest = () => {
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [subscription, setSubscription] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showTierSelector, setShowTierSelector] = useState(false);
  const [showTrialDialog, setShowTrialDialog] = useState(false);

  useEffect(() => {
    checkUser();
  }, []);

  const checkUser = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
      
      if (user) {
        const { data: profile } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", user.id)
          .single();
        setProfile(profile);
        
        await checkSubscriptionStatus();
      }
    } catch (error) {
      console.error("Error checking user:", error);
    } finally {
      setLoading(false);
    }
  };

  const checkSubscriptionStatus = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        const { data, error } = await supabase.functions.invoke('check-subscription', {
          headers: {
            Authorization: `Bearer ${session.access_token}`,
          },
        });
        
        if (!error && data) {
          setSubscription(data);
        }
      }
    } catch (error) {
      console.error("Error checking subscription:", error);
    }
  };

  const handleTierSelect = async (tier: any) => {
    if (!user) {
      toast.error("Please log in first to test the payment flow");
      return;
    }

    // Handle free trial with confirmation dialog
    if (tier.id === 'trial') {
      setShowTrialDialog(true);
      return;
    }

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        toast.error("Please log in first");
        return;
      }

      const { data, error } = await supabase.functions.invoke('create-checkout', {
        body: { role: profile?.role || 'escort', tier: tier.id },
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });

      if (error) throw error;

      if (tier.id === 'basic') {
        toast.success("Basic plan activated");
        await checkSubscriptionStatus();
      } else {
        window.open(data.url, '_blank');
        toast.success("Redirected to Stripe checkout.");
      }
    } catch (error: any) {
      console.error("Payment error:", error);
      toast.error(error.message || "Failed to create checkout session");
    }
  };

  const handleTrialActivated = () => {
    checkSubscriptionStatus();
  };

  const refreshSubscriptionStatus = async () => {
    setRefreshing(true);
    await checkSubscriptionStatus();
    setRefreshing(false);
    toast.success("Subscription status refreshed");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gold mx-auto mb-4"></div>
          <p className="text-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8">
          <div className="mb-6">
            <Link to="/" className="inline-flex items-center text-gold hover:text-gold/80 mb-4">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Home
            </Link>
            <h1 className="text-3xl font-serif text-foreground mb-2">Subscription Testing</h1>
            <p className="text-muted-foreground">Test the multi-tier subscription system with free trial</p>
          </div>

          <div className="grid gap-6">
            {/* User Status Card */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between text-foreground">
                  <div className="flex items-center">
                    <User className="h-5 w-5 mr-2" />
                    Current User Status
                  </div>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={refreshSubscriptionStatus}
                    disabled={refreshing}
                  >
                    <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
                    Refresh
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {user ? (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-foreground">Email:</span>
                      <span className="font-medium text-foreground">{user.email}</span>
                    </div>
                    {profile && (
                      <>
                        <div className="flex items-center justify-between">
                          <span className="text-foreground">Role:</span>
                          <Badge variant="outline">{profile.role}</Badge>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-foreground">Account Active:</span>
                          <Badge variant={profile.is_active ? "default" : "destructive"}>
                            {profile.is_active ? "Yes" : "No"}
                          </Badge>
                        </div>
                      </>
                    )}
                    {subscription && (
                      <>
                        <div className="flex items-center justify-between">
                          <span className="text-foreground">Subscription Tier:</span>
                          <Badge 
                            variant={subscription.subscription_tier === 'Platinum' || subscription.subscription_tier === 'Trial' ? "default" : "outline"}
                            className={subscription.subscription_tier === 'Platinum' ? "bg-gold text-white" : subscription.subscription_tier === 'Trial' ? "bg-blue-500 text-white" : ""}
                          >
                            {subscription.subscription_tier === 'Platinum' && <Crown className="h-3 w-3 mr-1" />}
                            {subscription.subscription_tier === 'Trial' && <Clock className="h-3 w-3 mr-1" />}
                            {subscription.subscription_tier === 'Basic' && <Shield className="h-3 w-3 mr-1" />}
                            {subscription.subscription_tier}
                          </Badge>
                        </div>
                        {subscription.is_trial_active && subscription.trial_days_remaining && (
                          <div className="flex items-center justify-between">
                            <span className="text-foreground">Trial Days Remaining:</span>
                            <Badge className="bg-blue-500 text-white">{subscription.trial_days_remaining} days</Badge>
                          </div>
                        )}
                        {subscription.expires_at && (
                          <div className="flex items-center justify-between">
                            <span className="text-foreground">Expires:</span>
                            <span className="text-sm text-muted-foreground">{new Date(subscription.expires_at).toLocaleDateString()}</span>
                          </div>
                        )}
                        {subscription.has_used_trial && (
                          <div className="flex items-center justify-between">
                            <span className="text-foreground">Trial Used:</span>
                            <Badge variant="outline">Yes</Badge>
                          </div>
                        )}
                        {subscription.is_featured && (
                          <div className="flex items-center justify-between">
                            <span className="text-foreground">Featured Status:</span>
                            <Badge className="bg-gold text-white">Featured</Badge>
                          </div>
                        )}
                        {subscription.photo_verified && (
                          <div className="flex items-center justify-between">
                            <span className="text-foreground">Photo Verified:</span>
                            <Badge className="bg-green-500 text-white">Verified</Badge>
                          </div>
                        )}
                      </>
                    )}
                  </div>
                ) : (
                  <div className="text-center py-4">
                    <p className="text-muted-foreground mb-4">You need to be logged in to test subscriptions</p>
                    <Link to="/auth">
                      <Button>Go to Login</Button>
                    </Link>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Subscription Testing */}
            {user && (
              <>
                <Separator />
                
                <Card>
                  <CardHeader>
                    <CardTitle className="text-foreground">Test Subscription Plans</CardTitle>
                    <CardDescription>
                      Test the different subscription tiers including the new free trial
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <Button 
                        onClick={() => setShowTierSelector(!showTierSelector)}
                        className="btn-gold"
                      >
                        {showTierSelector ? 'Hide' : 'Show'} Tier Selector
                      </Button>
                      
                      {showTierSelector && (
                        <div className="mt-6">
                          <SubscriptionTierSelector 
                            onTierSelect={handleTierSelect}
                            selectedTier={subscription?.subscription_tier === 'Platinum' ? 'platinum_monthly' : subscription?.subscription_tier === 'Trial' ? 'trial' : 'basic'}
                            currentTier={subscription?.subscription_tier}
                            role={profile?.role || 'escort'}
                            hasUsedTrial={subscription?.has_used_trial}
                          />
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>

                {/* Instructions Card */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-foreground">Testing Instructions</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div>
                        <h4 className="font-medium mb-2 text-foreground">Available Plans:</h4>
                        <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                          <li><strong>Free Trial:</strong> 7 days with FULL premium features (one-time only)</li>
                          <li><strong>Basic (Free):</strong> Default plan with basic features</li>
                          <li><strong>Platinum Weekly:</strong> $15 for 1 week with premium features</li>
                          <li><strong>Platinum Monthly:</strong> $79 for 1 month with premium features</li>
                          <li><strong>Platinum Quarterly:</strong> $189 for 3 months with premium features</li>
                          <li><strong>Platinum Yearly:</strong> $399 for 1 year with premium features</li>
                        </ul>
                      </div>
                      
                      <div>
                        <h4 className="font-medium mb-2 text-foreground">Trial vs Premium Features:</h4>
                        <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                          <li><strong>Trial:</strong> FULL premium features - photo verification, featured status, priority ranking, unlimited photos</li>
                          <li><strong>Premium:</strong> Same as trial - photo verification, featured status, priority ranking, unlimited photos</li>
                          <li><strong>Basic:</strong> Very limited features (3 photos), minimal visibility</li>
                        </ul>
                      </div>

                      <div>
                        <h4 className="font-medium mb-2 text-foreground">How to test:</h4>
                        <ol className="list-decimal list-inside space-y-2 text-sm text-muted-foreground">
                          <li>Click "Show Tier Selector" above</li>
                          <li>Start with the Free Trial (if not used before) - now shows a confirmation dialog</li>
                          <li>For paid plans, use Stripe test card: 4242 4242 4242 4242</li>
                          <li>Use any future date and CVC for test payments</li>
                          <li>Return here and refresh to see updated status</li>
                          <li>Trial will automatically expire after 7 days</li>
                        </ol>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </>
            )}
          </div>
        </div>
      </div>

      <FreeTrialConfirmDialog
        open={showTrialDialog}
        onOpenChange={setShowTrialDialog}
        role={profile?.role || 'escort'}
        onTrialActivated={handleTrialActivated}
      />
    </>
  );
};

export default PaymentTest;
