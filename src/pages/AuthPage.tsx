
import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/context/AuthContext';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { UserRole } from '@/types/auth';
import NavBar from '@/components/NavBar';
import Footer from '@/components/Footer';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';

interface AuthPageProps {
  mode?: 'login' | 'signup';
}

const AuthPage = ({ mode = 'login' }: AuthPageProps) => {
  const [activeTab, setActiveTab] = useState<'login' | 'signup'>(mode);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<UserRole>('client');
  const [isLoading, setIsLoading] = useState(false);
  const { signIn, signUp } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const { error } = await signUp(email, password, role);
      
      if (error) {
        toast({
          title: "Registration failed",
          description: error.message,
          variant: "destructive",
        });
      } else {
        toast({
          title: "Registration successful",
          description: "Check your email for a confirmation link.",
        });
        navigate('/');
      }
    } catch (error: any) {
      toast({
        title: "Registration error",
        description: error.message || "An unexpected error occurred",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const { error } = await signIn(email, password);
      
      if (error) {
        toast({
          title: "Login failed",
          description: error.message,
          variant: "destructive",
        });
      } else {
        toast({
          title: "Login successful",
          description: "Welcome back!",
        });
        navigate('/');
      }
    } catch (error: any) {
      toast({
        title: "Login error",
        description: error.message || "An unexpected error occurred",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Ensure the tab state is synced with the URL
  useState(() => {
    const path = location.pathname;
    if (path === '/join') {
      setActiveTab('signup');
    } else if (path === '/login') {
      setActiveTab('login');
    }
  });

  const handleTabChange = (value: string) => {
    setActiveTab(value as 'login' | 'signup');
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <NavBar />
      <div className="flex-grow flex items-center justify-center px-4 py-12">
        <Card className="w-full max-w-md">
          <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle className="text-2xl font-serif">
                  {activeTab === 'login' ? 'Sign In' : 'Create Account'}
                </CardTitle>
                <TabsList>
                  <TabsTrigger value="login">Login</TabsTrigger>
                  <TabsTrigger value="signup">Sign Up</TabsTrigger>
                </TabsList>
              </div>
              <CardDescription>
                {activeTab === 'login' 
                  ? 'Enter your credentials to access your account' 
                  : 'Join our exclusive community of refined individuals'}
              </CardDescription>
            </CardHeader>
            
            <CardContent>
              <TabsContent value="login" className="space-y-4">
                <form onSubmit={handleSignIn} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input 
                      id="email" 
                      type="email" 
                      placeholder="you@example.com" 
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="password">Password</Label>
                      <Link to="/forgot-password" className="text-sm text-gold">
                        Forgot password?
                      </Link>
                    </div>
                    <Input 
                      id="password" 
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                    />
                  </div>
                  <Button 
                    type="submit" 
                    className="w-full btn-gold" 
                    disabled={isLoading}
                  >
                    {isLoading ? 'Signing in...' : 'Sign In'}
                  </Button>
                </form>
              </TabsContent>
              
              <TabsContent value="signup" className="space-y-4">
                <form onSubmit={handleSignUp} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="signup-email">Email</Label>
                    <Input 
                      id="signup-email" 
                      type="email" 
                      placeholder="you@example.com" 
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signup-password">Password</Label>
                    <Input 
                      id="signup-password" 
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      minLength={6}
                    />
                    <p className="text-sm text-muted-foreground">
                      Password must be at least 6 characters long
                    </p>
                  </div>
                  <div className="space-y-2">
                    <Label>I am joining as:</Label>
                    <RadioGroup value={role} onValueChange={value => setRole(value as UserRole)} className="grid grid-cols-2 gap-4 pt-2">
                      <div>
                        <RadioGroupItem
                          value="client"
                          id="client"
                          className="peer sr-only"
                        />
                        <Label
                          htmlFor="client"
                          className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-card p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-gold [&:has([data-state=checked])]:border-gold"
                        >
                          <span>Client</span>
                          <span className="text-xs text-muted-foreground">
                            Looking for companionship
                          </span>
                        </Label>
                      </div>
                      <div>
                        <RadioGroupItem
                          value="escort"
                          id="escort"
                          className="peer sr-only"
                        />
                        <Label
                          htmlFor="escort"
                          className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-card p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-gold [&:has([data-state=checked])]:border-gold"
                        >
                          <span>Escort</span>
                          <span className="text-xs text-muted-foreground">
                            Offering companionship
                          </span>
                        </Label>
                      </div>
                    </RadioGroup>
                  </div>
                  <Button 
                    type="submit" 
                    className="w-full btn-gold" 
                    disabled={isLoading}
                  >
                    {isLoading ? 'Creating Account...' : 'Create Account'}
                  </Button>
                </form>
              </TabsContent>
            </CardContent>
            
            <CardFooter className="flex flex-col space-y-4 border-t pt-4">
              <div className="text-sm text-center text-muted-foreground">
                By continuing, you agree to our
                <Link to="/terms" className="text-gold ml-1">Terms of Service</Link>
                <span className="mx-1">and</span>
                <Link to="/privacy" className="text-gold">Privacy Policy</Link>
              </div>
            </CardFooter>
          </Tabs>
        </Card>
      </div>
      <Footer />
    </div>
  );
};

export default AuthPage;
