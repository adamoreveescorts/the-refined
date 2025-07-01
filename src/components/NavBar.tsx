
import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Menu, X, UserRound, Inbox, Building2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import SearchDialog from './SearchDialog';

const NavBar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [unreadCount, setUnreadCount] = useState(0);
  const [hasActiveSubscription, setHasActiveSubscription] = useState(false);

  // Check for user session on component mount
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user || null);
      if (session?.user) {
        fetchUnreadCount(session.user.id);
        fetchUserRole(session.user.id);
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setUser(session?.user || null);
        if (session?.user) {
          fetchUnreadCount(session.user.id);
          fetchUserRole(session.user.id);
        } else {
          setUnreadCount(0);
          setUserRole(null);
          setHasActiveSubscription(false);
        }
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const fetchUserRole = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', userId)
        .single();

      if (!error && data) {
        setUserRole(data.role);
        
        // Check subscription status for agencies
        if (data.role === 'agency') {
          const { data: agencySubscription } = await supabase
            .from('agency_subscriptions')
            .select('status')
            .eq('agency_id', userId)
            .single();
          
          setHasActiveSubscription(agencySubscription?.status === 'active');
        } else {
          setHasActiveSubscription(true); // Non-agencies don't need subscription checks for dashboard access
        }
      }
    } catch (error) {
      console.error('Error fetching user role:', error);
    }
  };

  const fetchUnreadCount = async (userId: string) => {
    try {
      // Get conversations where user is either client or escort
      const { data: conversations } = await supabase
        .from('conversations')
        .select('id')
        .or(`client_id.eq.${userId},escort_id.eq.${userId}`);

      if (!conversations) return;

      let totalUnread = 0;
      
      // Get unread count for each conversation
      for (const conv of conversations) {
        const { count } = await supabase
          .from('messages')
          .select('*', { count: 'exact', head: true })
          .eq('conversation_id', conv.id)
          .neq('sender_id', userId)
          .is('read_at', null);
        
        totalUnread += count || 0;
      }

      setUnreadCount(totalUnread);
    } catch (error) {
      console.error('Error fetching unread count:', error);
    }
  };

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      toast.error(error.message);
    } else {
      toast.success('Logged out successfully');
      navigate('/');
    }
  };

  const handleDashboardClick = (e: React.MouseEvent) => {
    // For agencies without active subscription, redirect to pricing
    if (userRole === 'agency' && !hasActiveSubscription) {
      e.preventDefault();
      navigate('/choose-plan');
      return;
    }
  };

  const getRoleDashboardLink = () => {
    switch (userRole) {
      case 'agency':
        return '/agency/dashboard';
      case 'admin':
        return '/admin';
      default:
        return '/user-profile';
    }
  };

  const getRoleDashboardLabel = () => {
    switch (userRole) {
      case 'agency':
        return hasActiveSubscription ? 'Agency Dashboard' : 'Choose Plan';
      case 'admin':
        return 'Admin Dashboard';
      default:
        return 'My Profile';
    }
  };

  const getRoleDashboardIcon = () => {
    switch (userRole) {
      case 'agency':
        return <Building2 className="h-4 w-4 mr-2" />;
      case 'admin':
        return <UserRound className="h-4 w-4 mr-2" />;
      default:
        return <UserRound className="h-4 w-4 mr-2" />;
    }
  };

  return (
    <nav className="sticky top-0 z-50 bg-background/80 backdrop-blur-md border-b border-border">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <div className="flex items-center">
            <Link to="/">
              <img 
                src="/lovable-uploads/388e8dc8-cfe2-4d20-b02e-1fd5e0f27454.png" 
                alt="Adam or Eve Escorts"
                className="h-25 w-auto"
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
            <SearchDialog />
            
            {user ? (
              <>
                <Link to="/messages">
                  <Button variant="ghost" size="icon" className="relative">
                    <Inbox className="h-5 w-5" />
                    {unreadCount > 0 && (
                      <Badge className="absolute -top-1 -right-1 bg-red-500 text-white text-xs h-5 w-5 rounded-full flex items-center justify-center">
                        {unreadCount > 99 ? '99+' : unreadCount}
                      </Badge>
                    )}
                  </Button>
                </Link>
                <Link to={getRoleDashboardLink()} onClick={handleDashboardClick}>
                  <Button variant="outline" size="sm" className="flex items-center">
                    {getRoleDashboardIcon()}
                    {getRoleDashboardLabel()}
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
                <div className="flex items-center px-3 mb-3">
                  <Link to="/messages" className="w-full">
                    <Button variant="outline" className="w-full relative">
                      <Inbox className="h-4 w-4 mr-2" />
                      Messages
                      {unreadCount > 0 && (
                        <Badge className="ml-2 bg-red-500 text-white">
                          {unreadCount > 99 ? '99+' : unreadCount}
                        </Badge>
                      )}
                    </Button>
                  </Link>
                </div>
                <div className="flex items-center px-3">
                  <Link to={getRoleDashboardLink()} className="w-full" onClick={handleDashboardClick}>
                    <Button variant="outline" className="w-full">
                      {getRoleDashboardIcon()}
                      {getRoleDashboardLabel()}
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
