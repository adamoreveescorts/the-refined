import { useState, useEffect } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { ArrowLeft, Eye, EyeOff } from "lucide-react";

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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import RoleSelectionModal, { UserRole } from "@/components/RoleSelectionModal";

// Country codes with their phone number formats
const countries = [
  { code: "US", name: "United States", dialCode: "+1", flag: "🇺🇸", format: "(XXX) XXX-XXXX" },
  { code: "CA", name: "Canada", dialCode: "+1", flag: "🇨🇦", format: "(XXX) XXX-XXXX" },
  { code: "GB", name: "United Kingdom", dialCode: "+44", flag: "🇬🇧", format: "XXXX XXX XXXX" },
  { code: "AU", name: "Australia", dialCode: "+61", flag: "🇦🇺", format: "XXX XXX XXX" },
  { code: "DE", name: "Germany", dialCode: "+49", flag: "🇩🇪", format: "XXX XXXXXXX" },
  { code: "FR", name: "France", dialCode: "+33", flag: "🇫🇷", format: "X XX XX XX XX" },
  { code: "TH", name: "Thailand", dialCode: "+66", flag: "🇹🇭", format: "XX XXX XXXX" },
  { code: "SG", name: "Singapore", dialCode: "+65", flag: "🇸🇬", format: "XXXX XXXX" },
  { code: "MY", name: "Malaysia", dialCode: "+60", flag: "🇲🇾", format: "XX XXX XXXX" },
  { code: "PH", name: "Philippines", dialCode: "+63", flag: "🇵🇭", format: "XXX XXX XXXX" },
  { code: "IN", name: "India", dialCode: "+91", flag: "🇮🇳", format: "XXXXX XXXXX" },
  { code: "CN", name: "China", dialCode: "+86", flag: "🇨🇳", format: "XXX XXXX XXXX" },
  { code: "JP", name: "Japan", dialCode: "+81", flag: "🇯🇵", format: "XX XXXX XXXX" },
  { code: "KR", name: "South Korea", dialCode: "+82", flag: "🇰🇷", format: "XX XXXX XXXX" },
  { code: "HK", name: "Hong Kong", dialCode: "+852", flag: "🇭🇰", format: "XXXX XXXX" },
];

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
  countryCode: z.string({ required_error: "Please select a country" }),
  mobileNumber: z.string().min(6, { message: "Please enter a valid mobile number" }),
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
  const [selectedRole, setSelectedRole] = useState<UserRole | null>(null);
  const [showSignupForm, setShowSignupForm] = useState(false);
  const [verificationSent, setVerificationSent] = useState(false);
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [showSignupPassword, setShowSignupPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

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
      countryCode: "",
      mobileNumber: "",
    },
  });

  const selectedCountry = countries.find(c => c.code === signupForm.watch("countryCode"));

  // Format mobile number based on selected country
  const formatMobileNumber = (value: string, countryCode: string) => {
    const country = countries.find(c => c.code === countryCode);
    if (!country) return value;
    
    // Remove all non-digits
    const digits = value.replace(/\D/g, '');
    
    // Apply formatting based on country format
    let formatted = digits;
    const format = country.format;
    let digitIndex = 0;
    
    formatted = format.replace(/X/g, () => {
      return digitIndex < digits.length ? digits[digitIndex++] : '';
    });
    
    return formatted.slice(0, formatted.lastIndexOf('X') + 1 >= 0 ? formatted.lastIndexOf(digits[digits.length - 1]) + 1 : formatted.length);
  };

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

  // Handle role selection for signup
  const handleRoleSelect = (role: UserRole) => {
    setSelectedRole(role);
    setShowSignupForm(true);
  };

  // Handle signup form submission
  const handleSignup = async (values: SignupFormValues) => {
    if (!selectedRole) return;
    
    const selectedCountryData = countries.find(c => c.code === values.countryCode);
    const fullMobileNumber = selectedCountryData 
      ? `${selectedCountryData.dialCode}${values.mobileNumber.replace(/\D/g, '')}`
      : values.mobileNumber;
    
    setIsLoading(true);
    try {
      if (selectedRole === 'client') {
        const { data, error } = await supabase.auth.signUp({
          email: values.email,
          password: values.password,
          options: {
            data: { 
              role: selectedRole,
              username: values.username,
              mobile_number: fullMobileNumber,
              country_code: values.countryCode
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
          email: values.email,
          password: values.password,
          options: {
            data: { 
              role: selectedRole,
              username: values.username,
              mobile_number: fullMobileNumber,
              country_code: values.countryCode
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
    setSelectedRole(null);
    setShowSignupForm(false);
    // Clear any form errors
    signupForm.clearErrors();
  };

  const handleBackToRoleSelection = () => {
    setShowSignupForm(false);
    setSelectedRole(null);
    signupForm.reset();
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      {/* Back to Home Button positioned correctly in the top-left */}
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
            Adam or Eve Escorts
          </h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Enter your details to access the platform
          </p>
        </div>

        {verificationSent ? (
          <div className="mt-8 bg-card p-6 shadow rounded-lg border border-border">
            <h3 className="text-lg font-medium text-center mb-4 text-foreground">
              {selectedRole === 'client' ? 'Verification Email Sent' : 'Account Created Successfully'}
            </h3>
            <p className="text-sm text-muted-foreground mb-6">
              {selectedRole === 'client' ? (
                <>
                  We've sent a verification link to <strong className="text-foreground">{signupForm.getValues().email}</strong>.
                  Please check your email and click the link to complete your registration.
                </>
              ) : (
                <>
                  Your {selectedRole} account has been created! Please check your email and click the verification link.
                  After verification, you'll be redirected to choose your subscription plan.
                  We've sent a verification link to <strong className="text-foreground">{signupForm.getValues().email}</strong>.
                </>
              )}
            </p>
            
            <div className="space-y-4">
              <Button 
                type="button" 
                className="w-full bg-secondary hover:bg-secondary/90 text-secondary-foreground" 
                onClick={handleBackToLogin}
              >
                Back to Login
              </Button>
              
              <p className="text-xs text-center text-muted-foreground">
                Didn't receive an email? Check your spam folder or
                <Button 
                  variant="link" 
                  className="p-0 h-auto text-xs underline ml-1 text-secondary"
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
              <div className="mt-8 bg-card p-6 shadow rounded-lg border border-border">
                <Form {...loginForm}>
                  <form onSubmit={loginForm.handleSubmit(handleLogin)} className="space-y-6">
                    <FormField
                      control={loginForm.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-foreground">Email</FormLabel>
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
                          <FormLabel className="text-foreground">Password</FormLabel>
                          <FormControl>
                            <div className="relative">
                              <Input 
                                type={showLoginPassword ? "text" : "password"} 
                                placeholder="••••••••" 
                                {...field} 
                              />
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                                onClick={() => setShowLoginPassword(!showLoginPassword)}
                              >
                                {showLoginPassword ? (
                                  <EyeOff className="h-4 w-4" />
                                ) : (
                                  <Eye className="h-4 w-4" />
                                )}
                              </Button>
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <Button 
                      type="submit" 
                      className="w-full bg-secondary hover:bg-secondary/90 text-secondary-foreground" 
                      disabled={isLoading}
                    >
                      {isLoading ? "Logging in..." : "Log In"}
                    </Button>
                  </form>
                </Form>
              </div>
            </TabsContent>
            
            <TabsContent value="signup">
              <div className="mt-8 bg-card p-6 shadow rounded-lg border border-border">
                {!showSignupForm ? (
                  <RoleSelectionModal 
                    isOpen={false} 
                    onRoleSelect={handleRoleSelect} 
                    onClose={() => {}} 
                    inline={true}
                  />
                ) : (
                  <>
                    <div className="mb-6 flex items-center justify-between">
                      <div>
                        <h3 className="text-lg font-medium text-foreground">
                          Create {selectedRole} Account
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          You selected: {selectedRole}
                        </p>
                      </div>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={handleBackToRoleSelection}
                      >
                        Change Role
                      </Button>
                    </div>
                    
                    <Form {...signupForm}>
                      <form onSubmit={signupForm.handleSubmit(handleSignup)} className="space-y-6">
                        <FormField
                          control={signupForm.control}
                          name="username"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-foreground">Username</FormLabel>
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
                              <FormLabel className="text-foreground">Email</FormLabel>
                              <FormControl>
                                <Input placeholder="you@example.com" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={signupForm.control}
                          name="countryCode"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-foreground">Country</FormLabel>
                              <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select your country" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent className="bg-background border border-border shadow-lg z-50">
                                  {countries.map((country) => (
                                    <SelectItem key={country.code} value={country.code}>
                                      <div className="flex items-center gap-2">
                                        <span>{country.flag}</span>
                                        <span>{country.name}</span>
                                        <span className="text-muted-foreground">({country.dialCode})</span>
                                      </div>
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={signupForm.control}
                          name="mobileNumber"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-foreground">Mobile Number</FormLabel>
                              <FormControl>
                                <div className="flex">
                                  {selectedCountry && (
                                    <div className="flex items-center px-3 border border-r-0 border-input bg-muted rounded-l-md">
                                      <span className="text-sm text-muted-foreground">
                                        {selectedCountry.flag} {selectedCountry.dialCode}
                                      </span>
                                    </div>
                                  )}
                                  <Input 
                                    placeholder={selectedCountry ? selectedCountry.format.replace(/X/g, '0') : "Enter mobile number"}
                                    className={selectedCountry ? "rounded-l-none" : ""}
                                    {...field}
                                    onChange={(e) => {
                                      const formatted = signupForm.watch("countryCode") 
                                        ? formatMobileNumber(e.target.value, signupForm.watch("countryCode"))
                                        : e.target.value;
                                      field.onChange(formatted);
                                    }}
                                  />
                                </div>
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
                              <FormLabel className="text-foreground">Password</FormLabel>
                              <FormControl>
                                <div className="relative">
                                  <Input 
                                    type={showSignupPassword ? "text" : "password"} 
                                    placeholder="••••••••" 
                                    {...field} 
                                  />
                                  <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                                    onClick={() => setShowSignupPassword(!showSignupPassword)}
                                  >
                                    {showSignupPassword ? (
                                      <EyeOff className="h-4 w-4" />
                                    ) : (
                                      <Eye className="h-4 w-4" />
                                    )}
                                  </Button>
                                </div>
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
                              <FormLabel className="text-foreground">Confirm Password</FormLabel>
                              <FormControl>
                                <div className="relative">
                                  <Input 
                                    type={showConfirmPassword ? "text" : "password"} 
                                    placeholder="••••••••" 
                                    {...field} 
                                  />
                                  <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                  >
                                    {showConfirmPassword ? (
                                      <EyeOff className="h-4 w-4" />
                                    ) : (
                                      <Eye className="h-4 w-4" />
                                    )}
                                  </Button>
                                </div>
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <Button 
                          type="submit" 
                          className="w-full bg-secondary hover:bg-secondary/90 text-secondary-foreground" 
                          disabled={isLoading}
                        >
                          {isLoading ? "Creating Account..." : "Create Account"}
                        </Button>
                      </form>
                    </Form>
                  </>
                )}
              </div>
            </TabsContent>
          </Tabs>
        )}
      </div>
    </div>
  );
};

export default Auth;
