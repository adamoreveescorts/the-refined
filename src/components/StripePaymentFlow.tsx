
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import SubscriptionTierSelector, { SubscriptionTier } from "./SubscriptionTierSelector";
import AgencySubscriptionSetup from "./AgencySubscriptionSetup";

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

      // Handle free trial response (no redirect needed)
      if (data?.trial_activated) {
        toast.success("Free trial activated! Your 7-day trial has started.");
        onPaymentComplete();
        return;
      }

      // Handle paid subscriptions (redirect to Stripe)
      if (data?.url) {
        window.open(data.url, '_blank');
        toast.success("Redirected to Stripe checkout. Complete your payment to activate your recurring plan.");
        onPaymentComplete();
      } else {
        throw new Error("No checkout URL received");
      }
    } catch (error: any) {
      console.error("Payment error:", error);
      toast.error(error.message || "Failed to process subscription");
    } finally {
      setIsLoading(false);
    }
  };

  const handleAgencySubscriptionCreate = async (packageId: string, packageType: number) => {
    setIsLoading(true);
    try {
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

      const { data, error } = await supabase.functions.invoke('create-agency-subscription', {
        body: {
          agencyId: currentSession.user.id,
          packageId,
          packageType
        },
        headers: {
          Authorization: `Bearer ${currentSession.access_token}`,
        },
      });

      if (error) throw error;

      if (data?.url) {
        window.open(data.url, '_blank');
        toast.success("Redirected to Stripe checkout. Complete your payment to activate your recurring subscription.");
        onPaymentComplete();
      } else {
        throw new Error("No checkout URL received");
      }
    } catch (error: any) {
      console.error("Agency subscription error:", error);
      toast.error(error.message || "Failed to create agency subscription");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle className="text-center text-foreground">
          Choose Your Subscription Plan
        </CardTitle>
        <CardDescription className="text-center text-muted-foreground">
          {role === 'agency' 
            ? "Select your agency subscription with recurring monthly or yearly billing"
            : "Start with a free trial or choose a recurring plan that fits your needs"
          }
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {role === 'agency' ? (
          <AgencySubscriptionSetup 
            onSubscriptionCreate={handleAgencySubscriptionCreate}
            isLoading={isLoading}
          />
        ) : (
          <SubscriptionTierSelector 
            onTierSelect={handleTierSelect}
            role={role}
            currentTier={subscriptionInfo?.subscription_tier}
            hasUsedTrial={subscriptionInfo?.has_used_trial}
          />
        )}
        
        <div className="flex justify-center">
          <button 
            onClick={onCancel}
            className="flex items-center text-muted-foreground hover:text-foreground"
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
