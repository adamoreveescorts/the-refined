import { useState, useEffect } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Loader2, ArrowLeft } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import RoleSelectionModal, { UserRole } from "@/components/RoleSelectionModal";
import PaymentFlow from "@/components/PaymentFlow";

// Schema for login form
const loginSchema = z.object({
  email: z.string().email({ message: "Please enter a valid email address" }),
  password: z.string().min(6, { message: "Password must be at least 6 characters" }),
});

// Schema for signup form - separate for each role
const baseSignupSchema = {
  email: z.string().email({ message: "Please enter a valid email address" }),
  password: z.string().min(6, { message: "Password must be at least 6 characters" }),
  confirmPassword: z.string(),
};

const signupSchema = z.object(baseSignupSchema)
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });

type LoginFormValues = z.infer<typeof loginSchema>;
type SignupFormValues = z.infer<typeof signupSchema>;

const Auth = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [activeTab, setActiveTab] = useState<"login" | "signup">("login");
  const [isLoading, setIsLoading] = useState(false);
  const [showRoleModal, setShowRoleModal] = useState(false);
  const [showPaymentFlow, setShowPaymentFlow] = useState(false);
  const [newUserId, setNewUserId] = useState<string | null>(null);
  const [selectedRole, setSelectedRole] = useState<UserRole | null>(null);
  const [formValues, setFormValues] = useState<SignupFormValues | null>(null);

  // Check for tab parameter in URL
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const tab = params.get("tab");
    if (tab === "signup") {
      setActiveTab("signup");
    } else if (tab === "login") {
      setActiveTab("login");
    }
    
    // Try to restore form values if they exist in localStorage
    const savedFormValues = localStorage.getItem('signupFormValues');
    if (savedFormValues) {
      try {
        const parsedValues = JSON.parse(savedFormValues);
        setFormValues(parsedValues);
        if (signupForm) {
          signupForm.reset(parsedValues);
        }
      } catch (e) {
        console.error("Failed to parse saved form values:", e);
      }
    }

    // Check for PayPal return parameters
    const subscriptionId = params.get('subscription_id');
    const baToken = params.get('ba_token');
    const userId = localStorage.getItem('pendingUserId');
    
    if ((subscriptionId || baToken) && userId) {
      console.log("Detected PayPal return params:", { subscriptionId, baToken, userId });
      // If we have PayPal return parameters and stored user ID, show payment flow
      setNewUserId(userId);
      setShowPaymentFlow(true);
    } else if (subscriptionId || baToken) {
      // If we only have PayPal params but no userId
      console.log("PayPal params found but no userId:", { subscriptionId, baToken });
      toast.error("Session expired. Please try signing up again.");
    }
  }, [location, activeTab]);

  // Check if user is already logged in
  useEffect(() => {
    const checkUser = async () => {
      // First check for any PayPal return params
      const params = new URLSearchParams(location.search);
      const hasPayPalParams = params.get('subscription_id') || params.get('ba_token');
      
      // If we have PayPal params, we don't want to redirect away yet
      if (hasPayPalParams) {
        console.log("Found PayPal return parameters, skipping redirect check");
        return;
      }
      
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        navigate('/');
      }
    };
    
    checkUser();
  }, [navigate, location.search]);

  // Login form
  const loginForm = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  // Signup form
  const signupForm = useForm<SignupFormValues>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      email: "",
      password: "",
      confirmPassword: "",
    },
  });

  const handleLogin = async (values: LoginFormValues) => {
    setIsLoading(true);
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: values.email,
        password: values.password,
      });

      if (error) {
        throw error;
      }

      toast.success("Successfully logged in");
      navigate("/");
    } catch (error: any) {
      toast.error(error.message || "Failed to login");
    } finally {
      setIsLoading(false);
    }
  };

  // This function initiates the signup process by showing the role selection modal
  const initiateSignup = async () => {
    const valid = await signupForm.trigger();
    if (valid) {
      // Store form values in localStorage to persist during redirects
      const values = signupForm.getValues();
      localStorage.setItem('signupFormValues', JSON.stringify(values));
      setFormValues(values);
      setShowRoleModal(true);
    }
  };

  // After role selection, handle the actual signup
  const handleRoleSelect = async (role: UserRole) => {
    setSelectedRole(role);
    setIsLoading(true);
    try {
      // Get form values from state or form
      const values = formValues || signupForm.getValues();
      
      console.log("Selected role:", role);
      console.log("Form values:", values);
      
      // Create the user with the selected role
      const { data, error } = await supabase.auth.signUp({
        email: values.email,
        password: values.password,
        options: {
          data: {
            role
          }
        }
      });

      if (error) {
        throw error;
      }

      const userId = data.user?.id;
      setNewUserId(userId || null);
      
      // Store userId in localStorage for persistence during PayPal redirect
      if (userId) {
        localStorage.setItem('pendingUserId', userId);
      }
      
      setShowRoleModal(false);
      
      // If escort role was selected, show payment flow instead of redirecting
      if (role === "escort" && userId) {
        setShowPaymentFlow(true);
      } else {
        toast.success("Registration successful! Please check your email for verification.");
        navigate("/");
      }
    } catch (error: any) {
      console.error("Signup error:", error);
      toast.error(error.message || "Failed to register");
      setShowRoleModal(false);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePaymentComplete = () => {
    // Clear form data and user ID from localStorage
    localStorage.removeItem('signupFormValues');
    localStorage.removeItem('pendingUserId');
    setShowPaymentFlow(false);
    navigate("/");
  };

  const handlePaymentCancel = async () => {
    // If they cancel payment, we'll keep their account but it will remain inactive
    toast.info("You can complete payment later from your profile page.");
    localStorage.removeItem('signupFormValues');
    setShowPaymentFlow(false);
    navigate("/");
  };

  // If payment flow is active, show the payment component
  if (showPaymentFlow && newUserId) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <PaymentFlow 
          userId={newUserId} 
          onPaymentComplete={handlePaymentComplete} 
          onCancel={handlePaymentCancel} 
        />
      </div>
    );
  }

  // Check for PayPal return parameters without active payment flow
  const params = new URLSearchParams(location.search);
  const hasPayPalParams = params.get('subscription_id') || params.get('ba_token');
  const storedSubId = localStorage.getItem('pendingSubscriptionId');
  
  if (hasPayPalParams && storedSubId && !showPaymentFlow) {
    // We have PayPal params but no active payment flow, try to resume
    const userId = localStorage.getItem('pendingUserId');
    if (userId) {
      setNewUserId(userId);
      setShowPaymentFlow(true);
      return (
        <div className="min-h-screen bg-background flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <Loader2 className="mx-auto h-12 w-12 animate-spin text-gold" />
            <p className="mt-4 text-lg">Processing your payment...</p>
          </div>
        </div>
      );
    }
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center relative">
          {/* Add Back to Home Button */}
          <Link to="/" className="absolute left-0 top-1/2 -translate-y-1/2">
            <Button variant="ghost" size="sm" className="flex items-center gap-1 text-navy hover:text-gold">
              <ArrowLeft size={16} />
              Back to Home
            </Button>
          </Link>
          
          <h2 className="mt-6 text-3xl font-serif font-bold text-navy">
            The Refined Escort
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Enter your details to access the platform
          </p>
        </div>

        <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as "login" | "signup")} className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="login">Login</TabsTrigger>
            <TabsTrigger value="signup">Sign Up</TabsTrigger>
          </TabsList>
          
          <TabsContent value="login">
            <div className="mt-8 bg-white p-6 shadow rounded-lg">
              <Form {...loginForm}>
                <form onSubmit={loginForm.handleSubmit(handleLogin)} className="space-y-6">
                  <FormField
                    control={loginForm.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email</FormLabel>
                        <FormControl>
                          <Input placeholder="you@example.com" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={loginForm.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Password</FormLabel>
                        <FormControl>
                          <Input type="password" placeholder="••••••••" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <Button 
                    type="submit" 
                    className="btn-gold w-full" 
                    disabled={isLoading}
                  >
                    {isLoading ? "Logging in..." : "Log In"}
                  </Button>
                </form>
              </Form>
            </div>
          </TabsContent>
          
          <TabsContent value="signup">
            <div className="mt-8 bg-white p-6 shadow rounded-lg">
              <Form {...signupForm}>
                <form onSubmit={(e) => { e.preventDefault(); initiateSignup(); }} className="space-y-6">
                  <FormField
                    control={signupForm.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email</FormLabel>
                        <FormControl>
                          <Input placeholder="you@example.com" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={signupForm.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Password</FormLabel>
                        <FormControl>
                          <Input type="password" placeholder="••••••••" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={signupForm.control}
                    name="confirmPassword"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Confirm Password</FormLabel>
                        <FormControl>
                          <Input type="password" placeholder="••••••••" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <Button 
                    type="submit" 
                    className="btn-gold w-full" 
                    disabled={isLoading}
                  >
                    {isLoading ? "Creating Account..." : "Create Account"}
                  </Button>
                </form>
              </Form>
            </div>
          </TabsContent>
        </Tabs>
      </div>

      <RoleSelectionModal 
        isOpen={showRoleModal} 
        onRoleSelect={handleRoleSelect} 
        onClose={() => setShowRoleModal(false)} 
      />
    </div>
  );
};

export default Auth;
