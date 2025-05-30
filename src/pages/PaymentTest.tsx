
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ArrowLeft, CreditCard, User, Building2, RefreshCw } from "lucide-react";
import { toast } from "sonner";

const PaymentTest = () => {
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [subscription, setSubscription] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

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
        
        // Check subscription status
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

  const handleTestPayment = async (role: "escort" | "agency") => {
    if (!user) {
      toast.error("Please log in first to test the payment flow");
      return;
    }

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        toast.error("Please log in first");
        return;
      }

      const { data, error } = await supabase.functions.invoke('create-checkout', {
        body: { role },
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });

      if (error) throw error;

      // Open Stripe checkout in a new tab
      window.open(data.url, '_blank');
      toast.success("Redirected to Stripe checkout. Complete your payment to test the flow.");
    } catch (error: any) {
      console.error("Payment error:", error);
      toast.error(error.message || "Failed to create checkout session");
    }
  };

  const handleManageSubscription = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        toast.error("Please log in first");
        return;
      }

      const { data, error } = await supabase.functions.invoke('customer-portal', {
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });

      if (error) throw error;

      // Open Stripe customer portal in a new tab
      window.open(data.url, '_blank');
      toast.success("Redirected to Stripe customer portal.");
    } catch (error: any) {
      console.error("Portal error:", error);
      toast.error(error.message || "Failed to open customer portal");
    }
  };

  const refreshSubscriptionStatus = async () => {
    setRefreshing(true);
    await checkSubscriptionStatus();
    setRefreshing(false);
    toast.success("Subscription status refreshed");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gold mx-auto mb-4"></div>
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <Link to="/" className="inline-flex items-center text-gold hover:text-gold/80 mb-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Home
          </Link>
          <h1 className="text-3xl font-serif text-gray-900 mb-2">Stripe Payment Testing</h1>
          <p className="text-gray-600">Test the Stripe subscription flow for escorts and agencies</p>
        </div>

        <div className="grid gap-6">
          {/* User Status Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
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
                    <span>Email:</span>
                    <span className="font-medium">{user.email}</span>
                  </div>
                  {profile && (
                    <>
                      <div className="flex items-center justify-between">
                        <span>Role:</span>
                        <Badge variant="outline">{profile.role}</Badge>
                      </div>
                      <div className="flex items-center justify-between">
                        <span>Payment Status:</span>
                        <Badge variant={profile.payment_status === "completed" ? "default" : "secondary"}>
                          {profile.payment_status}
                        </Badge>
                      </div>
                      <div className="flex items-center justify-between">
                        <span>Account Active:</span>
                        <Badge variant={profile.is_active ? "default" : "destructive"}>
                          {profile.is_active ? "Yes" : "No"}
                        </Badge>
                      </div>
                    </>
                  )}
                  {subscription && (
                    <>
                      <div className="flex items-center justify-between">
                        <span>Stripe Subscription:</span>
                        <Badge variant={subscription.subscribed ? "default" : "secondary"}>
                          {subscription.subscribed ? "Active" : "Inactive"}
                        </Badge>
                      </div>
                      {subscription.subscription_tier && (
                        <div className="flex items-center justify-between">
                          <span>Subscription Tier:</span>
                          <Badge variant="outline">{subscription.subscription_tier}</Badge>
                        </div>
                      )}
                      {subscription.subscription_end && (
                        <div className="flex items-center justify-between">
                          <span>Next Billing:</span>
                          <span className="text-sm">{new Date(subscription.subscription_end).toLocaleDateString()}</span>
                        </div>
                      )}
                    </>
                  )}
                </div>
              ) : (
                <div className="text-center py-4">
                  <p className="text-gray-600 mb-4">You need to be logged in to test payments</p>
                  <Link to="/auth">
                    <Button>Go to Login</Button>
                  </Link>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Payment Test Cards */}
          {user && (
            <>
              <Separator />
              
              <div className="grid md:grid-cols-2 gap-6">
                {/* Escort Payment Test */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <User className="h-5 w-5 mr-2 text-gold" />
                      Test Escort Payment
                    </CardTitle>
                    <CardDescription>
                      Test the Stripe subscription flow for escort accounts
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="p-4 bg-gray-50 rounded-md">
                        <p className="text-sm text-gray-600 mb-2">
                          <strong>Test Details:</strong>
                        </p>
                        <ul className="text-sm text-gray-600 space-y-1">
                          <li>• Monthly subscription: $0.50 USD</li>
                          <li>• Stripe test environment</li>
                          <li>• Account activation on payment</li>
                        </ul>
                      </div>
                      <Button 
                        onClick={() => handleTestPayment("escort")}
                        className="w-full btn-gold"
                      >
                        <CreditCard className="h-4 w-4 mr-2" />
                        Test Escort Payment Flow
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                {/* Agency Payment Test */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Building2 className="h-5 w-5 mr-2 text-gold" />
                      Test Agency Payment
                    </CardTitle>
                    <CardDescription>
                      Test the Stripe subscription flow for agency accounts
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="p-4 bg-gray-50 rounded-md">
                        <p className="text-sm text-gray-600 mb-2">
                          <strong>Test Details:</strong>
                        </p>
                        <ul className="text-sm text-gray-600 space-y-1">
                          <li>• Monthly subscription: $0.50 USD</li>
                          <li>• Stripe test environment</li>
                          <li>• Account activation on payment</li>
                        </ul>
                      </div>
                      <Button 
                        onClick={() => handleTestPayment("agency")}
                        className="w-full btn-gold"
                      >
                        <CreditCard className="h-4 w-4 mr-2" />
                        Test Agency Payment Flow
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Subscription Management */}
              {subscription?.subscribed && (
                <>
                  <Separator />
                  <Card>
                    <CardHeader>
                      <CardTitle>Subscription Management</CardTitle>
                      <CardDescription>
                        Manage your active subscription through Stripe Customer Portal
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <Button 
                        onClick={handleManageSubscription}
                        className="btn-gold"
                      >
                        <CreditCard className="h-4 w-4 mr-2" />
                        Manage Subscription
                      </Button>
                    </CardContent>
                  </Card>
                </>
              )}

              <Separator />

              {/* Instructions Card */}
              <Card>
                <CardHeader>
                  <CardTitle>Testing Instructions</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-medium mb-2">How to test:</h4>
                      <ol className="list-decimal list-inside space-y-2 text-sm text-gray-600">
                        <li>Click one of the test payment buttons above</li>
                        <li>You'll be redirected to Stripe checkout in a new tab</li>
                        <li>Use test card number: 4242 4242 4242 4242</li>
                        <li>Use any future expiry date and any CVC</li>
                        <li>Complete the payment process</li>
                        <li>Return here and click "Refresh" to see updated status</li>
                      </ol>
                    </div>
                    
                    <div>
                      <h4 className="font-medium mb-2">Stripe Test Cards:</h4>
                      <ul className="list-disc list-inside space-y-1 text-sm text-gray-600">
                        <li>Success: 4242 4242 4242 4242</li>
                        <li>Decline: 4000 0000 0000 0002</li>
                        <li>Requires 3D Secure: 4000 0027 6000 3184</li>
                      </ul>
                    </div>

                    <div>
                      <h4 className="font-medium mb-2">Expected Results:</h4>
                      <ul className="list-disc list-inside space-y-1 text-sm text-gray-600">
                        <li>Payment status should change to "completed"</li>
                        <li>Account should become active (is_active: true)</li>
                        <li>Stripe subscription should show as "Active"</li>
                        <li>User should be able to access paid features</li>
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default PaymentTest;
