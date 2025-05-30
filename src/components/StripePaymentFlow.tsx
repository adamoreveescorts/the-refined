
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CreditCard, ArrowLeft, CheckCircle } from "lucide-react";
import { toast } from "sonner";

interface StripePaymentFlowProps {
  role: "escort" | "agency";
  onPaymentComplete: () => void;
  onCancel: () => void;
  userSession?: any; // Optional session for when user is already logged in
}

const StripePaymentFlow = ({ role, onPaymentComplete, onCancel, userSession }: StripePaymentFlowProps) => {
  const [isLoading, setIsLoading] = useState(false);

  const handlePayment = async () => {
    setIsLoading(true);
    try {
      // Get current session or use the passed userSession
      const { data: { session } } = await supabase.auth.getSession();
      const currentSession = userSession || session;
      
      if (!currentSession) {
        toast.error("Please log in to continue");
        return;
      }

      console.log("Creating checkout with session:", currentSession.access_token);

      const { data, error } = await supabase.functions.invoke('create-checkout', {
        body: { role },
        headers: {
          Authorization: `Bearer ${currentSession.access_token}`,
        },
      });

      if (error) throw error;

      // Open Stripe checkout in a new tab
      window.open(data.url, '_blank');
      
      // Show success message and call completion handler
      toast.success("Redirected to Stripe checkout. Complete your payment to activate your account.");
      onPaymentComplete();
    } catch (error: any) {
      console.error("Payment error:", error);
      toast.error(error.message || "Failed to create checkout session");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center">
          <CreditCard className="h-5 w-5 mr-2 text-gold" />
          Complete Your Subscription
        </CardTitle>
        <CardDescription>
          Subscribe to activate your {role} account
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="p-4 bg-gray-50 rounded-md">
          <h3 className="font-medium mb-2">Subscription Details:</h3>
          <div className="space-y-1 text-sm text-gray-600">
            <div className="flex justify-between">
              <span>Plan:</span>
              <span className="font-medium">{role === "escort" ? "Escort" : "Agency"} Monthly</span>
            </div>
            <div className="flex justify-between">
              <span>Price:</span>
              <span className="font-medium">$0.50/month</span>
            </div>
            <div className="flex justify-between">
              <span>Billing:</span>
              <span className="font-medium">Monthly</span>
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex items-center text-sm text-gray-600">
            <CheckCircle className="h-4 w-4 mr-2 text-green-500" />
            Access to the directory
          </div>
          <div className="flex items-center text-sm text-gray-600">
            <CheckCircle className="h-4 w-4 mr-2 text-green-500" />
            Profile management tools
          </div>
          <div className="flex items-center text-sm text-gray-600">
            <CheckCircle className="h-4 w-4 mr-2 text-green-500" />
            Client messaging system
          </div>
        </div>

        <div className="space-y-3">
          <Button 
            onClick={handlePayment}
            disabled={isLoading}
            className="w-full btn-gold"
          >
            {isLoading ? "Creating checkout..." : "Subscribe with Stripe"}
          </Button>
          
          <Button 
            variant="outline" 
            onClick={onCancel}
            className="w-full"
            disabled={isLoading}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
        </div>

        <p className="text-xs text-gray-500 text-center">
          Secure payment processing by Stripe. You can cancel anytime from your account settings.
        </p>
      </CardContent>
    </Card>
  );
};

export default StripePaymentFlow;
