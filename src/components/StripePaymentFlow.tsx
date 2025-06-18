
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import SubscriptionTierSelector, { SubscriptionTier } from "./SubscriptionTierSelector";
import FreeTrialConfirmDialog from "./FreeTrialConfirmDialog";
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
  const [showTrialDialog, setShowTrialDialog] = useState(false);

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
    // Handle free trial with confirmation dialog
    if (tier.id === 'trial') {
      setShowTrialDialog(true);
      return;
    }

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
      toast.error(error.message || "Failed to process subscription");
    } finally {
      setIsLoading(false);
    }
  };

  const handleAgencySubscriptionCreate = async (seats: number, billingCycle: string) => {
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
          seats,
          billingCycle,
          pricePerSeat: getPricePerSeat(billingCycle) * 100 // Convert to cents
        },
        headers: {
          Authorization: `Bearer ${currentSession.access_token}`,
        },
      });

      if (error) throw error;

      if (data?.url) {
        window.open(data.url, '_blank');
        toast.success("Redirected to Stripe checkout. Complete your payment to activate your agency subscription.");
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

  const getPricePerSeat = (billingCycle: string) => {
    const pricing = {
      weekly: 15,
      monthly: 79,
      quarterly: 189,
      yearly: 399
    };
    return pricing[billingCycle as keyof typeof pricing] || 79;
  };

  const handleTrialActivated = () => {
    checkSubscriptionStatus();
    onPaymentComplete();
  };

  return (
    <>
      <Card className="w-full max-w-4xl mx-auto">
        <CardHeader>
          <CardTitle className="text-center text-foreground">
            Choose Your Subscription Plan
          </CardTitle>
          <CardDescription className="text-center text-muted-foreground">
            {role === 'agency' 
              ? "Select your agency plan with per-escort pricing that scales with your business"
              : "Start with a free 7-day trial, then select the plan that best fits your escort business needs"
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

      <FreeTrialConfirmDialog
        open={showTrialDialog}
        onOpenChange={setShowTrialDialog}
        role={role}
        onTrialActivated={handleTrialActivated}
      />
    </>
  );
};

export default StripePaymentFlow;
