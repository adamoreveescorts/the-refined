
import { useState, useEffect } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { ArrowLeft } from "lucide-react";

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

// Schema for login form
const loginSchema = z.object({
  email: z.string().email({ message: "Please enter a valid email address" }),
  password: z.string().min(6, { message: "Password must be at least 6 characters" }),
});

// Schema for signup form
const signupSchema = z.object({
  username: z.string().min(3, { message: "Username must be at least 3 characters" }),
  email: z.string().email({ message: "Please enter a valid email address" }),
  password: z.string().min(6, { message: "Password must be at least 6 characters" }),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
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
  const [formValues, setFormValues] = useState<SignupFormValues | null>(null);
  const [verificationSent, setVerificationSent] = useState(false);
  const [selectedRole, setSelectedRole] = useState<UserRole | null>(null);

  // Check for tab parameter in URL and payment status
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const tab = params.get("tab");
    const payment = params.get("payment");
    
    if (tab === "signup") {
      setActiveTab("signup");
    } else if (tab === "login") {
      setActiveTab("login");
    }
    
    if (payment === "success") {
      toast.success("Payment successful! Your account is now active.");
      // Check subscription status after successful payment
      checkSubscriptionStatus();
    } else if (payment === "cancelled") {
      toast.info("Payment was cancelled. You can try again anytime.");
    }
  }, [location]);

  // Check if user is already logged in and redirect appropriately
  useEffect(() => {
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        // Check if user needs to choose a plan
        const { data: profile } = await supabase
          .from('profiles')
          .select('role, payment_status')
          .eq('id', session.user.id)
          .single();
        
        if (profile && (profile.role === 'escort' || profile.role === 'agency') && profile.payment_status === 'pending') {
          navigate('/choose-plan');
        } else {
          navigate('/');
        }
      }
    };
    
    checkUser();
  }, [navigate]);

  const checkSubscriptionStatus = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        await supabase.functions.invoke('check-subscription', {
          headers: {
            Authorization: `Bearer ${session.access_token}`,
          },
        });
      }
    } catch (error) {
      console.error("Error checking subscription:", error);
    }
  };

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
      username: "",
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
      const values = signupForm.getValues();
      setFormValues(values);
      setShowRoleModal(true);
    }
  };

  // Function to handle signup errors with specific messages
  const handleSignupError = (error: any) => {
    console.error("Signup error:", error);
    
    // Check for specific error messages
    if (error.message?.includes("duplicate key value violates unique constraint") || 
        error.message?.includes("profiles_username_key") ||
        error.message?.includes("Database error saving new user")) {
      toast.error("This username is already taken. Please choose a different username.");
      signupForm.setError("username", { message: "This username is already taken" });
    } else if (error.message?.includes("User already registered")) {
      toast.error("An account with this email already exists. Please try logging in instead.");
      signupForm.setError("email", { message: "Email already in use" });
    } else if (error.message?.includes("Invalid email")) {
      toast.error("Please enter a valid email address.");
      signupForm.setError("email", { message: "Invalid email format" });
    } else if (error.message?.includes("Password should be at least")) {
      toast.error("Password must be at least 6 characters long.");
      signupForm.setError("password", { message: "Password too short" });
    } else if (error.message?.includes("Email not confirmed")) {
      // Handle email not confirmed error - this means signup was successful but email needs verification
      setVerificationSent(true);
      toast.success("Account created successfully! Please check your email for verification.");
    } else {
      toast.error(error.message || "Failed to create account. Please try again.");
    }
  };

  // After role selection, handle the signup flow based on role
  const handleRoleSelect = async (role: UserRole) => {
    setSelectedRole(role);
    setShowRoleModal(false);
    
    if (!formValues) return;
    
    setIsLoading(true);
    try {
      if (role === 'client') {
        const { data, error } = await supabase.auth.signUp({
          email: formValues.email,
          password: formValues.password,
          options: {
            data: { 
              role: role,
              username: formValues.username 
            },
            emailRedirectTo: "https://adamoreveescorts.com/"
          }
        });
        
        if (error) {
          throw error;
        }
        
        setVerificationSent(true);
        toast.success("Verification email sent! Please check your inbox.");
      } else {
        // For escorts and agencies, create account and redirect to choose-plan after verification
        const { data, error } = await supabase.auth.signUp({
          email: formValues.email,
          password: formValues.password,
          options: {
            data: { 
              role: role,
              username: formValues.username 
            },
            emailRedirectTo: "https://adamoreveescorts.com/choose-plan"
          }
        });
        
        if (error) {
          throw error;
        }
        
        setVerificationSent(true);
        toast.success("Account created! Please check your email for verification, then you'll be able to choose your subscription plan.");
      }
    } catch (error: any) {
      handleSignupError(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleBackToLogin = () => {
    setVerificationSent(false);
    setActiveTab("login");
    setFormValues(null);
    setSelectedRole(null);
    // Clear any form errors
    signupForm.clearErrors();
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      {/* Back to Home Button positioned correctly in the top-left */}
      <div className="fixed top-4 left-4 z-10">
        <Link to="/">
          <Button variant="ghost" size="sm" className="flex items-center gap-1 text-navy hover:text-gold">
            <ArrowLeft size={16} />
            Back to Home
          </Button>
        </Link>
      </div>
      
      <div className="w-full max-w-4xl space-y-8">
        <div className="text-center">
          <h2 className="mt-6 text-3xl font-serif font-bold text-navy">
            The Refined Escort
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Enter your details to access the platform
          </p>
        </div>

        {verificationSent ? (
          <div className="mt-8 bg-white p-6 shadow rounded-lg">
            <h3 className="text-lg font-medium text-center mb-4">
              {selectedRole === 'client' ? 'Verification Email Sent' : 'Account Created Successfully'}
            </h3>
            <p className="text-sm text-gray-600 mb-6">
              {selectedRole === 'client' ? (
                <>
                  We've sent a verification link to <strong>{formValues?.email}</strong>.
                  Please check your email and click the link to complete your registration.
                </>
              ) : (
                <>
                  Your {selectedRole} account has been created! Please check your email and click the verification link.
                  After verification, you'll be redirected to choose your subscription plan.
                  We've sent a verification link to <strong>{formValues?.email}</strong>.
                </>
              )}
            </p>
            
            <div className="space-y-4">
              <Button 
                type="button" 
                className="w-full" 
                onClick={handleBackToLogin}
              >
                Back to Login
              </Button>
              
              <p className="text-xs text-center text-gray-500">
                Didn't receive an email? Check your spam folder or
                <Button 
                  variant="link" 
                  className="p-0 h-auto text-xs underline ml-1"
                  onClick={() => setVerificationSent(false)}
                >
                  try again
                </Button>
              </p>
            </div>
          </div>
        ) : (
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
                      name="username"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Username</FormLabel>
                          <FormControl>
                            <Input placeholder="johndoe" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
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
        )}
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
