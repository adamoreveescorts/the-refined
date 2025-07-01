import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Eye, EyeOff } from "lucide-react";
import RoleSelectionModal from "@/components/RoleSelectionModal";
import NavBar from "@/components/NavBar";
import Footer from "@/components/Footer";

interface SignupData {
  email: string;
  password: string;
  username: string;
  mobile_number: string;
}

interface LoginData {
  email: string;
  password?: string;
}

const Auth = () => {
  const [loginData, setLoginData] = useState<LoginData>({ email: '', password: '' });
  const [signupData, setSignupData] = useState<SignupData>({ email: '', password: '', username: '', mobile_number: '' });
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showSignupPassword, setShowSignupPassword] = useState(false);
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [showRoleModal, setShowRoleModal] = useState(false);
  const [selectedRole, setSelectedRole] = useState<string | null>(null);

  useEffect(() => {
    const redirectTo = searchParams.get("redirectTo");
    if (redirectTo) {
      toast.info(`Complete authentication to access ${redirectTo}`);
    }
  }, [searchParams]);

  const handleLoginChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setLoginData({ ...loginData, [e.target.name]: e.target.value });
  };

  const handleSignupChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSignupData({ ...signupData, [e.target.name]: e.target.value });
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      const { error } = await supabase.auth.signInWithPassword({
        email: loginData.email,
        password: loginData.password,
      });
      if (error) {
        toast.error(error.message);
      } else {
        toast.success("Login successful!");
        navigate("/user-profile");
      }
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSignupError = (error: any) => {
    if (error.message.includes('duplicate key value violates unique constraint "profiles_username_key"')) {
      toast.error('This username is already taken. Please choose a different one.');
    } else {
      toast.error(error.message);
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedRole) {
      setShowRoleModal(true);
      return;
    }

    if (!signupData.email || !signupData.password || !signupData.username || !signupData.mobile_number) {
      toast.error("Please fill in all fields.");
      return;
    }

    if (signupData.password.length < 6) {
      toast.error("Password must be at least 6 characters long.");
      return;
    }

    try {
      setLoading(true);
      
      console.log('Signup data being sent:', {
        email: signupData.email,
        username: signupData.username,
        mobile_number: signupData.mobile_number, // Log the phone number
        role: selectedRole
      });

      const { data, error } = await supabase.auth.signUp({
        email: signupData.email,
        password: signupData.password,
        options: {
          emailRedirectTo: `${window.location.origin}/`,
          data: {
            username: signupData.username,
            mobile_number: signupData.mobile_number, // Ensure this matches the migration
            role: selectedRole,
          },
        },
      });

      if (error) {
        console.error('Signup error:', error);
        handleSignupError(error);
        return;
      }

      if (data?.user) {
        console.log('Signup successful, user created:', data.user.id);
        console.log('User metadata:', data.user.user_metadata);
        toast.success("Account created! Please check your email to verify your account.");
        
        // Don't redirect immediately, let email verification happen first
        if (selectedRole === 'escort' || selectedRole === 'agency') {
          toast.info("After email verification, you'll be able to choose your subscription plan.");
        }
      }
    } catch (error: any) {
      console.error('Signup error:', error);
      handleSignupError(error);
    } finally {
      setLoading(false);
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

    const toggleSignupPasswordVisibility = () => {
        setShowSignupPassword(!showSignupPassword);
    };

  const handleRoleSelect = (role: string) => {
    setSelectedRole(role);
    setShowRoleModal(false);
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <NavBar />
      <main className="flex-grow flex items-center justify-center">
        <div className="container mx-auto px-4 py-8">
          <Card className="max-w-md w-full mx-auto">
            <CardHeader className="text-center">
              <CardTitle className="text-2xl font-bold">
                Welcome to Adam & Eve Escorts
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="login" className="space-y-4">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="login">Login</TabsTrigger>
                  <TabsTrigger value="signup">Sign Up</TabsTrigger>
                </TabsList>
                <TabsContent value="login" className="space-y-4">
                  <form onSubmit={handleLogin} className="space-y-4">
                    <div>
                      <Label htmlFor="email">Email</Label>
                      <Input
                        type="email"
                        id="email"
                        name="email"
                        value={loginData.email}
                        onChange={handleLoginChange}
                        placeholder="Enter your email"
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="password">Password</Label>
                      <div className="relative">
                        <Input
                          type={showPassword ? "text" : "password"}
                          id="password"
                          name="password"
                          value={loginData.password}
                          onChange={handleLoginChange}
                          placeholder="Enter your password"
                          required
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="absolute right-2 top-1/2 -translate-y-1/2"
                          onClick={togglePasswordVisibility}
                        >
                          {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </Button>
                      </div>
                    </div>
                    <Button disabled={loading} className="w-full">
                      {loading ? "Logging in..." : "Login"}
                    </Button>
                  </form>
                </TabsContent>
                <TabsContent value="signup" className="space-y-4">
                  <form onSubmit={handleSignup} className="space-y-4">
                    <div>
                      <Label htmlFor="signup-email">Email</Label>
                      <Input
                        type="email"
                        id="signup-email"
                        name="email"
                        value={signupData.email}
                        onChange={handleSignupChange}
                        placeholder="Enter your email"
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="signup-username">Username</Label>
                      <Input
                        type="text"
                        id="signup-username"
                        name="username"
                        value={signupData.username}
                        onChange={handleSignupChange}
                        placeholder="Choose a username"
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="signup-mobile_number">Mobile Number</Label>
                      <Input
                        type="tel"
                        id="signup-mobile_number"
                        name="mobile_number"
                        value={signupData.mobile_number}
                        onChange={handleSignupChange}
                        placeholder="Enter your mobile number"
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="signup-password">Password</Label>
                      <div className="relative">
                        <Input
                          type={showSignupPassword ? "text" : "password"}
                          id="signup-password"
                          name="password"
                          value={signupData.password}
                          onChange={handleSignupChange}
                          placeholder="Choose a password"
                          required
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="absolute right-2 top-1/2 -translate-y-1/2"
                          onClick={toggleSignupPasswordVisibility}
                        >
                          {showSignupPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </Button>
                      </div>
                    </div>
                    <Button disabled={loading} className="w-full">
                      {loading ? "Creating account..." : "Sign Up"}
                    </Button>
                  </form>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>
      </main>
      <Footer />
      <RoleSelectionModal
        open={showRoleModal}
        onClose={() => setShowRoleModal(false)}
        onSelect={handleRoleSelect}
      />
    </div>
  );
};

export default Auth;
