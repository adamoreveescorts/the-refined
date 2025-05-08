
import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { PayPalScriptProvider, PayPalButtons } from "@paypal/react-paypal-js";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Loader2, ExternalLink } from "lucide-react";

// PayPal subscription plan ID
const SUBSCRIPTION_PLAN_ID = "P-8VS6273020706443GM5VDYVY";
// PayPal client ID
const PAYPAL_CLIENT_ID = "AS5vp9gEblgk1b4G-TwUYzalGa8zAEuli_VMgRqR6obImZdwl99U-39C5gHQjdtBQhcUXUJPkIWgypNw";

interface PaymentFlowProps {
  userId: string;
  onPaymentComplete: () => void;
  onCancel: () => void;
}

const PaymentFlow = ({ userId, onPaymentComplete, onCancel }: PaymentFlowProps) => {
  const [loading, setLoading] = useState(false);
  const [approvalUrl, setApprovalUrl] = useState<string | null>(null);
  const [pendingSubscriptionId, setPendingSubscriptionId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [processingReturn, setProcessingReturn] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  // Store userId in localStorage when component mounts
  useEffect(() => {
    if (userId) {
      localStorage.setItem('pendingUserId', userId);
    }
  }, [userId]);

  // Check for returning from PayPal approval flow
  useEffect(() => {
    const checkForReturnFromPayPal = async () => {
      // Check URL parameters for subscription_id or ba_token (PayPal return params)
      const urlParams = new URLSearchParams(location.search);
      const subscriptionId = urlParams.get('subscription_id') || localStorage.getItem('pendingSubscriptionId');
      const baToken = urlParams.get('ba_token'); // PayPal billing agreement token
      
      console.log("Checking for PayPal return:", { 
        subscriptionId, 
        baToken, 
        urlParams: location.search,
        processingReturn
      });
      
      // Prevent multiple processing attempts
      if ((subscriptionId || baToken) && !loading && !processingReturn) {
        setLoading(true);
        setProcessingReturn(true);
        setError(null);
        
        try {
          if (subscriptionId) {
            setPendingSubscriptionId(subscriptionId);
            console.log("Found subscription ID:", subscriptionId);
          }
          
          if (!userId) {
            const storedUserId = localStorage.getItem('pendingUserId');
            if (!storedUserId) {
              throw new Error("User ID not found. Please try signing up again.");
            }
            console.log("Using stored user ID:", storedUserId);
          }
          
          // Update the user's payment status and activate their account
          const { error } = await supabase
            .from("profiles")
            .update({ 
              payment_status: "completed", 
              is_active: true 
            })
            .eq("id", userId || localStorage.getItem('pendingUserId'));
          
          if (error) {
            throw error;
          }
          
          // Clear the stored subscription ID
          localStorage.removeItem('pendingSubscriptionId');
          
          toast.success("Subscription successful! Your account is now active.");
          onPaymentComplete();
        } catch (error: any) {
          console.error("Error completing subscription after approval:", error);
          setError(error.message || "There was an error activating your account. Please contact support.");
          toast.error(error.message || "There was an error activating your account. Please contact support.");
        } finally {
          setLoading(false);
        }
      }
    };
    
    checkForReturnFromPayPal();
  }, [userId, onPaymentComplete, location.search, loading, processingReturn]);

  const handleSubscriptionCreated = (data: any) => {
    console.log("Subscription created. Full data:", data);
    
    // Extract the approval URL from the links array
    const approvalLink = data.links?.find((link: any) => link.rel === 'approve');
    
    if (approvalLink && approvalLink.href) {
      console.log("Found approval URL:", approvalLink.href);
      
      // Extract and store the subscription ID
      const subscriptionId = data.id;
      if (subscriptionId) {
        console.log("Storing subscription ID for later:", subscriptionId);
        localStorage.setItem('pendingSubscriptionId', subscriptionId);
        setPendingSubscriptionId(subscriptionId);
        
        // Set the approval URL to display a button
        setApprovalUrl(approvalLink.href);
      } else {
        console.error("No subscription ID found in response");
        setError("Could not process subscription. Please try again.");
        toast.error("Could not process subscription. Please try again.");
      }
    } else {
      console.error("No approval URL found in response", data);
      setError("Could not process subscription. Please try again.");
      toast.error("Could not process subscription. Please try again.");
    }
  };

  const redirectToPayPalApproval = () => {
    if (approvalUrl) {
      // Add current URL as return_url parameter to help with redirects
      const returnUrl = `${window.location.origin}/auth`;
      
      // Append return URL to approval URL if not already present
      // Use proper PayPal parameters
      const finalUrl = new URL(approvalUrl);
      finalUrl.searchParams.set('return_url', returnUrl);
      finalUrl.searchParams.set('cancel_url', returnUrl);
      
      console.log("Redirecting to PayPal approval:", finalUrl.toString());
      
      // Before redirecting, make sure we have everything stored
      localStorage.setItem('pendingUserId', userId);
      localStorage.setItem('pendingSubscriptionTime', new Date().toISOString());
      
      window.location.href = finalUrl.toString();
    }
  };

  // Function to try again if there was an error
  const handleTryAgain = () => {
    setError(null);
    setApprovalUrl(null);
    setPendingSubscriptionId(null);
    setProcessingReturn(false);
    setLoading(false);
  };

  // Show error state if there was an error
  if (error) {
    return (
      <div className="max-w-md mx-auto bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-xl font-serif mb-6 text-center">Payment Error</h2>
        <div className="p-4 bg-red-50 border border-red-200 rounded-md mb-6">
          <p className="text-red-700">{error}</p>
        </div>
        <div className="flex flex-col space-y-3">
          <Button onClick={handleTryAgain} className="btn-gold">
            Try Again
          </Button>
          <Button variant="outline" onClick={onCancel}>
            Cancel
          </Button>
        </div>
      </div>
    );
  }

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
          <span className="ml-2">Processing payment...</span>
        </div>
      ) : approvalUrl ? (
        <div className="flex flex-col items-center space-y-4">
          <p className="text-center text-sm text-gray-600">
            Your subscription has been created. Click the button below to complete the approval on PayPal.
          </p>
          <Button 
            onClick={redirectToPayPalApproval} 
            className="w-full btn-gold flex items-center justify-center"
          >
            <ExternalLink className="mr-2 h-4 w-4" />
            Complete Subscription on PayPal
          </Button>
          <Button 
            variant="outline" 
            onClick={onCancel}
            className="mt-2"
          >
            Cancel
          </Button>
        </div>
      ) : (
        <>
          <PayPalScriptProvider options={{ 
            clientId: PAYPAL_CLIENT_ID,
            vault: true,
            intent: "subscription",
            components: "buttons",
            currency: "USD",
            debug: true
          }}>
            <PayPalButtons 
              style={{
                color: "gold",
                shape: "rect",
                layout: "vertical",
                label: "subscribe"
              }}
              createSubscription={(data, actions) => {
                console.log("Creating subscription with plan ID:", SUBSCRIPTION_PLAN_ID);
                return actions.subscription.create({
                  plan_id: SUBSCRIPTION_PLAN_ID,
                  application_context: {
                    return_url: `${window.location.origin}/auth`,
                    cancel_url: `${window.location.origin}/auth`
                  }
                });
              }}
              onApprove={(data, actions) => {
                // Log the full data object to debug what we're getting
                console.log("Subscription approved. Full data:", data);
                
                // For subscriptions, we don't call .capture()
                // We need to get the approval URL
                handleSubscriptionCreated(data);
                
                // Return a resolved promise
                return Promise.resolve();
              }}
              onCancel={(data) => {
                console.log("Subscription cancelled. Data:", data);
                toast.info("Subscription cancelled. Your account will remain inactive until subscription is completed.");
              }}
              onError={(err) => {
                // Detailed error logging
                console.error("PayPal Error:", err);
                
                // Try to extract more error details if available
                if (err && typeof err === 'object') {
                  console.error("Error details:", JSON.stringify(err, null, 2));
                }
                
                setError("There was an error processing your subscription. Please try again or contact support.");
                toast.error("There was an error processing your subscription. Please try again or contact support.");
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
