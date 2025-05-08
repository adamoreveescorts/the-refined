
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { PayPalScriptProvider, PayPalButtons } from "@paypal/react-paypal-js";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";

const ESCORT_SIGNUP_FEE = "0.01"; // Fee in USD - changed from $49.99 to $0.01

interface PaymentFlowProps {
  userId: string;
  onPaymentComplete: () => void;
  onCancel: () => void;
}

const PaymentFlow = ({ userId, onPaymentComplete, onCancel }: PaymentFlowProps) => {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handlePaymentSuccess = async (details: any) => {
    setLoading(true);
    try {
      console.log("Payment successful. Transaction ID:", details.id);
      
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
      
      toast.success("Payment successful! Your account is now active.");
      onPaymentComplete();
    } catch (error: any) {
      console.error("Payment verification error:", error);
      toast.error("There was an error verifying your payment. Please contact support.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-xl font-serif mb-6 text-center">Complete Your Registration</h2>
      
      <div className="mb-6">
        <p className="text-gray-700 mb-4">
          To activate your escort profile, please complete the payment below:
        </p>
        <div className="p-4 bg-gray-50 rounded mb-4">
          <div className="flex justify-between">
            <span>Registration Fee:</span>
            <span className="font-medium">${ESCORT_SIGNUP_FEE} USD</span>
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
            clientId: "AdOTEm2GN9kDNPQfM_LfolEIM3atfnKrezxo60YzK0ldeU4XzkwXSVaNrWSVtFNatIORQ-pDrMDZ9ttt",
            currency: "USD",
            intent: "capture"
          }}>
            <PayPalButtons 
              style={{
                color: "gold",
                shape: "rect",
                label: "pay",
                height: 50
              }}
              createOrder={(data, actions) => {
                return actions.order.create({
                  intent: "CAPTURE",
                  purchase_units: [
                    {
                      amount: {
                        currency_code: "USD",
                        value: ESCORT_SIGNUP_FEE
                      },
                      description: "Escort Profile Registration"
                    }
                  ]
                });
              }}
              onApprove={(data, actions) => {
                return actions.order!.capture().then(handlePaymentSuccess);
              }}
              onCancel={() => {
                toast.info("Payment cancelled. Your account will remain inactive until payment is completed.");
              }}
              onError={(err) => {
                console.error("PayPal Error:", err);
                toast.error("There was an error processing your payment. Please try again.");
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
        By completing payment, you agree to our terms of service and privacy policy.
      </p>
    </div>
  );
};

export default PaymentFlow;
