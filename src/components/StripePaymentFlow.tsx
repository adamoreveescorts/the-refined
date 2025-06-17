
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import SubscriptionTierSelector, { SubscriptionTier } from "./SubscriptionTierSelector";

interface StripePaymentFlowProps {
  role: "escort" | "agency";
  onPaymentComplete: () => void;
  onCancel: () => void;
  userSession?: any;
}

const StripePaymentFlow = ({ role, onPaymentComplete, onCancel, userSession }: StripePaymentFlowProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const [subscriptionInfo, setSubscriptionInfo] = useState<any>(null);

  useEffect(() => {
    checkSubscriptionStatus();
  }, []);

  const checkSubscriptionStatus = async () => {
    try {
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError) {
        console.error("Session error:", sessionError);
        return;
      }
      
      const currentSession = session || userSession;
      
      if (!currentSession?.access_token) {
        return;
      }

      const { data, error } = await supabase.functions.invoke('check-subscription', {
        headers: {
          Authorization: `Bearer ${currentSession.access_token}`,
        },
      });

      if (!error && data) {
        setSubscriptionInfo(data);
      }
    } catch (error) {
      console.error("Error checking subscription:", error);
    }
  };

  const handleTierSelect = async (tier: SubscriptionTier) => {
    setIsLoading(true);
    try {
      // Get the current session more reliably
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError) {
        console.error("Session error:", sessionError);
        throw new Error("Failed to get authentication session");
      }
      
      const currentSession = session || userSession;
      
      if (!currentSession?.access_token) {
        console.error("No session or access token found");
        toast.error("Please log in to continue");
        return;
      }

      console.log("Creating checkout with tier:", tier);

      const { data, error } = await supabase.functions.invoke('create-checkout', {
        body: { role, tier: tier.id },
        headers: {
          Authorization: `Bearer ${currentSession.access_token}`,
        },
      });

      if (error) {
        console.error("Edge function error:", error);
        throw error;
      }

      if (tier.id === 'basic') {
        // Free tier, no payment needed
        toast.success("Basic plan activated successfully!");
        onPaymentComplete();
      } else if (tier.id === 'trial') {
        // Free trial, no payment needed
        toast.success("Free trial activated successfully! You have 7 days to explore premium features.");
        onPaymentComplete();
      } else {
        // Paid tier, redirect to Stripe
        if (data?.url) {
          window.open(data.url, '_blank');
          toast.success("Redirected to Stripe checkout. Complete your payment to activate your plan.");
          onPaymentComplete();
        } else {
          throw new Error("No checkout URL received");
        }
      }
    } catch (error: any) {
      console.error("Payment error:", error);
      if (error.message === "Trial already used") {
        toast.error("You have already used your free trial. Please select a different plan.");
      } else {
        toast.error(error.message || "Failed to process subscription");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle className="text-center">
          Choose Your Subscription Plan
        </CardTitle>
        <CardDescription className="text-center">
          Start with a free 7-day trial, then select the plan that best fits your {role} business needs
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <SubscriptionTierSelector 
          onTierSelect={handleTierSelect}
          role={role}
          currentTier={subscriptionInfo?.subscription_tier}
          hasUsedTrial={subscriptionInfo?.has_used_trial}
        />
        
        <div className="flex justify-center">
          <button 
            onClick={onCancel}
            className="flex items-center text-gray-600 hover:text-gray-800"
            disabled={isLoading}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Registration
          </button>
        </div>
      </CardContent>
    </Card>
  );
};

export default StripePaymentFlow;
