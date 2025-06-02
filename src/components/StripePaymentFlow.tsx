
import { useState } from "react";
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

  const handleTierSelect = async (tier: SubscriptionTier) => {
    setIsLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const currentSession = userSession || session;
      
      if (!currentSession) {
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

      if (error) throw error;

      if (tier.id === 'basic') {
        // Free tier, no payment needed
        toast.success("Basic plan activated successfully!");
        onPaymentComplete();
      } else {
        // Paid tier, redirect to Stripe
        window.open(data.url, '_blank');
        toast.success("Redirected to Stripe checkout. Complete your payment to activate your plan.");
        onPaymentComplete();
      }
    } catch (error: any) {
      console.error("Payment error:", error);
      toast.error(error.message || "Failed to process subscription");
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
          Select the plan that best fits your {role} business needs
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <SubscriptionTierSelector 
          onTierSelect={handleTierSelect}
          role={role}
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
