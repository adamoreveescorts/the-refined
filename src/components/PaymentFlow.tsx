
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { PayPalScriptProvider, PayPalButtons } from "@paypal/react-paypal-js";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";

// PayPal subscription plan ID
const SUBSCRIPTION_PLAN_ID = "P-8VS6273020706443GM5VDYVY";

interface PaymentFlowProps {
  userId: string;
  onPaymentComplete: () => void;
  onCancel: () => void;
}

const PaymentFlow = ({ userId, onPaymentComplete, onCancel }: PaymentFlowProps) => {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubscriptionSuccess = async (data: any) => {
    setLoading(true);
    try {
      console.log("Subscription successful. Subscription ID:", data.subscriptionID);
      
      // Update the user's payment status and activate their account
      const { error } = await supabase
        .from("profiles")
        .update({ 
          payment_status: "completed", 
          is_active: true 
        })
        .eq("id", userId);
      
      if (error) {
        throw error;
      }
      
      toast.success("Subscription successful! Your account is now active.");
      onPaymentComplete();
    } catch (error: any) {
      console.error("Subscription verification error:", error);
      toast.error("There was an error verifying your subscription. Please contact support.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-xl font-serif mb-6 text-center">Complete Your Registration</h2>
      
      <div className="mb-6">
        <p className="text-gray-700 mb-4">
          To activate your escort profile, please subscribe to our service:
        </p>
        <div className="p-4 bg-gray-50 rounded mb-4">
          <div className="flex justify-between">
            <span>Monthly Subscription:</span>
            <span className="font-medium">$0.01 USD/month</span>
          </div>
        </div>
      </div>
      
      {loading ? (
        <div className="flex justify-center p-4">
          <Loader2 className="h-8 w-8 animate-spin text-gold" />
        </div>
      ) : (
        <>
          <PayPalScriptProvider options={{ 
            clientId: "AS5vp9gEblgk1b4G-TwUYzalGa8zAEuli_VMgRqR6obImZdwl99U-39C5gHQjdtBQhcUXUJPkIWgypNw",
            vault: true,
            intent: "subscription",
            components: "buttons"
          }}>
            <PayPalButtons 
              style={{
                color: "gold",
                shape: "rect",
                layout: "vertical",
                label: "subscribe"
              }}
              createSubscription={(data, actions) => {
                return actions.subscription.create({
                  plan_id: SUBSCRIPTION_PLAN_ID
                });
              }}
              onApprove={(data, actions) => {
                // data.subscriptionID contains the subscription ID
                return handleSubscriptionSuccess(data);
              }}
              onCancel={() => {
                toast.info("Subscription cancelled. Your account will remain inactive until subscription is completed.");
              }}
              onError={(err) => {
                console.error("PayPal Error:", err);
                toast.error("There was an error processing your subscription. Please try again.");
              }}
            />
          </PayPalScriptProvider>
          
          <div className="mt-4 text-center">
            <Button 
              variant="outline" 
              onClick={onCancel}
              className="mt-2"
            >
              Cancel
            </Button>
          </div>
        </>
      )}
      
      <p className="text-xs text-gray-500 mt-6 text-center">
        By subscribing, you agree to our terms of service and privacy policy. Your subscription will automatically renew each month.
      </p>
    </div>
  );
};

export default PaymentFlow;
