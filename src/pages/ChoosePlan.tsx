
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";

import { Button } from "@/components/ui/button";
import StripePaymentFlow from "@/components/StripePaymentFlow";
import { UserRole } from "@/components/RoleSelectionModal";

const ChoosePlan = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);
  const [userRole, setUserRole] = useState<UserRole | null>(null);
  const [showPaymentFlow, setShowPaymentFlow] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    checkUserAndRole();
  }, [navigate]);

  const checkUserAndRole = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        toast.error("Please log in first");
        navigate("/auth");
        return;
      }

      setUser(session.user);

      // Get user profile to check role
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('role, payment_status')
        .eq('id', session.user.id)
        .single();

      if (error) {
        console.error("Error fetching profile:", error);
        toast.error("Error loading profile");
        return;
      }

      if (!profile) {
        toast.error("Profile not found");
        navigate("/auth");
        return;
      }

      setUserRole(profile.role as UserRole);

      // Handle different user roles
      if (profile.role === 'client') {
        // Clients don't need subscriptions, redirect to home
        navigate("/");
        return;
      }

      if (profile.role === 'agency') {
        // For agencies, check if they have an active subscription
        const { data: agencySubscription } = await supabase
          .from('agency_subscriptions')
          .select('status, billing_cycle')
          .eq('agency_id', session.user.id)
          .single();

        if (agencySubscription?.status === 'active') {
          // Agency has active subscription, redirect to dashboard
          navigate("/agency/dashboard");
          return;
        } else {
          // Agency needs subscription, show payment flow
          setShowPaymentFlow(true);
        }
      } else if (profile.role === 'escort') {
        // For escorts, they need to choose a paid plan (no free trial)
        setShowPaymentFlow(true);
      }

    } catch (error) {
      console.error("Error checking user:", error);
      toast.error("Error loading page");
      navigate("/auth");
    } finally {
      setIsLoading(false);
    }
  };

  const handlePaymentComplete = async () => {
    setShowPaymentFlow(false);
    toast.success("Plan selected successfully! Welcome to Adam or Eve Escorts.");
    
    // Redirect based on user role
    if (userRole === 'agency') {
      navigate("/agency/dashboard");
    } else {
      navigate("/edit-profile");
    }
  };

  const handlePaymentCancel = () => {
    setShowPaymentFlow(false);
    toast.info("Plan selection cancelled. You can choose a plan anytime from your profile.");
    navigate("/user-profile");
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-secondary mx-auto mb-4"></div>
          <p className="text-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      {/* Back to Home Button */}
      <div className="fixed top-4 left-4 z-10">
        <Link to="/">
          <Button variant="ghost" size="sm" className="flex items-center gap-1 text-foreground hover:text-secondary">
            <ArrowLeft size={16} />
            Back to Home
          </Button>
        </Link>
      </div>
      
      <div className="w-full max-w-4xl space-y-8">
        <div className="text-center">
          <h2 className="mt-6 text-3xl font-serif font-bold text-foreground">
            Welcome to Adam or Eve Escorts!
          </h2>
          <p className="mt-2 text-sm text-muted-foreground">
            {userRole === 'agency' 
              ? "Choose your agency subscription plan to start managing escorts."
              : "Your email has been verified. Now choose your subscription plan to get started."
            }
          </p>
        </div>

        {showPaymentFlow && userRole && (userRole === 'escort' || userRole === 'agency') ? (
          <StripePaymentFlow 
            role={userRole as "escort" | "agency"}
            onPaymentComplete={handlePaymentComplete}
            onCancel={handlePaymentCancel}
            userSession={user}
          />
        ) : (
          <div className="text-center">
            <p className="text-muted-foreground mb-4">Setting up your account...</p>
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-secondary mx-auto"></div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ChoosePlan;
