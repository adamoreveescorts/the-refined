
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ArrowLeft, CreditCard, User, Building2, Users } from "lucide-react";
import PaymentFlow from "@/components/PaymentFlow";
import { toast } from "sonner";

const PaymentTest = () => {
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [showPaymentFlow, setShowPaymentFlow] = useState(false);
  const [testRole, setTestRole] = useState<"escort" | "agency">("escort");
  const [loading, setLoading] = useState(true);

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
      }
    } catch (error) {
      console.error("Error checking user:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleTestPayment = (role: "escort" | "agency") => {
    if (!user) {
      toast.error("Please log in first to test the payment flow");
      return;
    }
    setTestRole(role);
    setShowPaymentFlow(true);
  };

  const handlePaymentComplete = () => {
    setShowPaymentFlow(false);
    toast.success("Payment test completed successfully!");
    checkUser(); // Refresh user data
  };

  const handlePaymentCancel = () => {
    setShowPaymentFlow(false);
    toast.info("Payment test cancelled");
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

  if (showPaymentFlow) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <PaymentFlow
          userId={user?.id}
          onPaymentComplete={handlePaymentComplete}
          onCancel={handlePaymentCancel}
        />
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
          <h1 className="text-3xl font-serif text-gray-900 mb-2">Payment Testing</h1>
          <p className="text-gray-600">Test the PayPal subscription flow for escorts and agencies</p>
        </div>

        <div className="grid gap-6">
          {/* User Status Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <User className="h-5 w-5 mr-2" />
                Current User Status
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
                      Test the PayPal subscription flow for escort accounts
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="p-4 bg-gray-50 rounded-md">
                        <p className="text-sm text-gray-600 mb-2">
                          <strong>Test Details:</strong>
                        </p>
                        <ul className="text-sm text-gray-600 space-y-1">
                          <li>• Monthly subscription: $0.01 USD</li>
                          <li>• PayPal test environment</li>
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
                      Test the PayPal subscription flow for agency accounts
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="p-4 bg-gray-50 rounded-md">
                        <p className="text-sm text-gray-600 mb-2">
                          <strong>Test Details:</strong>
                        </p>
                        <ul className="text-sm text-gray-600 space-y-1">
                          <li>• Monthly subscription: $0.01 USD</li>
                          <li>• PayPal test environment</li>
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
                        <li>You'll be redirected to the PayPal payment flow</li>
                        <li>Complete the test payment process</li>
                        <li>Return to see your updated account status</li>
                      </ol>
                    </div>
                    
                    <div>
                      <h4 className="font-medium mb-2">PayPal Test Account:</h4>
                      <p className="text-sm text-gray-600">
                        You can use PayPal's test credit card numbers or create a test PayPal account for testing.
                        This is using PayPal's sandbox environment, so no real money will be charged.
                      </p>
                    </div>

                    <div>
                      <h4 className="font-medium mb-2">Expected Results:</h4>
                      <ul className="list-disc list-inside space-y-1 text-sm text-gray-600">
                        <li>Payment status should change to "completed"</li>
                        <li>Account should become active (is_active: true)</li>
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
