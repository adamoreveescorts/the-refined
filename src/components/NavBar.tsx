
import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Menu, X, Search, UserRound } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

const NavBar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const navigate = useNavigate();
  const [user, setUser] = useState(null);

  // Check for user session on component mount
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user || null);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setUser(session?.user || null);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      toast.error(error.message);
    } else {
      toast.success('Logged out successfully');
      navigate('/');
    }
  };

  return (
    <nav className="sticky top-0 z-50 bg-background/80 backdrop-blur-md border-b border-border">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center">
            <Link to="/" className="flex items-center">
              <img 
                src="/lovable-uploads/914e2b93-bab1-4461-98df-d6e671f505b9.png" 
                alt="Adam or Eve Escorts"
                className="h-14 w-auto"
              />
            </Link>
          </div>
          
          {/* Desktop Navigation */}
          <div className="hidden md:block">
            <div className="flex items-center space-x-4">
              <Link to="/directory" className="px-3 py-2 text-sm font-medium text-foreground hover:text-gold transition-colors">
                Directory
              </Link>
              <Link to="/about" className="px-3 py-2 text-sm font-medium text-foreground hover:text-gold transition-colors">
                About
              </Link>
              <Link to="/faq" className="px-3 py-2 text-sm font-medium text-foreground hover:text-gold transition-colors">
                FAQ
              </Link>
              <Link to="/contact" className="px-3 py-2 text-sm font-medium text-foreground hover:text-gold transition-colors">
                Contact
              </Link>
            </div>
          </div>

          {/* Right Actions */}
          <div className="hidden md:flex items-center space-x-4">
            <Button variant="ghost" size="icon">
              <Search className="h-5 w-5" />
            </Button>
            
            {user ? (
              <>
                <Link to="/user-profile">
                  <Button variant="outline" size="sm" className="flex items-center">
                    <UserRound className="h-4 w-4 mr-2" />
                    My Profile
                  </Button>
                </Link>
                <Button size="sm" className="btn-gold" onClick={handleLogout}>
                  Sign Out
                </Button>
              </>
            ) : (
              <>
                <Link to="/auth">
                  <Button variant="outline" size="sm" className="flex items-center">
                    <UserRound className="h-4 w-4 mr-2" />
                    Sign In
                  </Button>
                </Link>
                <Link to="/auth?tab=signup">
                  <Button size="sm" className="btn-gold">Join Now</Button>
                </Link>
              </>
            )}
          </div>
          
          {/* Mobile menu button */}
          <div className="flex md:hidden">
            <Button variant="ghost" onClick={() => setIsMenuOpen(!isMenuOpen)} size="icon">
              {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </Button>
          </div>
        </div>
      </div>
      
      {/* Mobile Menu with animation */}
      <div 
        className={`md:hidden bg-background border-t border-border overflow-hidden transition-all duration-300 ease-in-out ${
          isMenuOpen ? 'max-h-[500px] opacity-100' : 'max-h-0 opacity-0'
        }`}
      >
        <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
          <Link to="/directory" className="block px-3 py-2 text-base font-medium text-foreground hover:text-gold transition-colors">
            Directory
          </Link>
          <Link to="/about" className="block px-3 py-2 text-base font-medium text-foreground hover:text-gold transition-colors">
            About
          </Link>
          <Link to="/faq" className="block px-3 py-2 text-base font-medium text-foreground hover:text-gold transition-colors">
            FAQ
          </Link>
          <Link to="/contact" className="block px-3 py-2 text-base font-medium text-foreground hover:text-gold transition-colors">
            Contact
          </Link>
          <div className="pt-4 pb-3 border-t border-border">
            {user ? (
              <>
                <div className="flex items-center px-3">
                  <Link to="/user-profile" className="w-full">
                    <Button variant="outline" className="w-full">
                      <UserRound className="h-4 w-4 mr-2" />
                      My Profile
                    </Button>
                  </Link>
                </div>
                <div className="flex items-center px-3 mt-3">
                  <Button className="w-full btn-gold" onClick={handleLogout}>
                    Sign Out
                  </Button>
                </div>
              </>
            ) : (
              <>
                <div className="flex items-center px-3">
                  <Link to="/auth?tab=signup" className="w-full">
                    <Button className="w-full btn-gold">Join Now</Button>
                  </Link>
                </div>
                <div className="flex items-center px-3 mt-3">
                  <Link to="/auth" className="w-full">
                    <Button variant="outline" className="w-full">Sign In</Button>
                  </Link>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default NavBar;
