
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Menu, X, Search, User } from 'lucide-react';

const NavBar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md shadow-sm">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center">
            <Link to="/" className="flex items-center">
              <span className="font-serif text-2xl font-bold text-navy">The Refined Escort</span>
            </Link>
          </div>
          
          {/* Desktop Navigation */}
          <div className="hidden md:block">
            <div className="flex items-center space-x-4">
              <Link to="/directory" className="px-3 py-2 text-sm font-medium text-charcoal hover:text-gold transition-colors">
                Directory
              </Link>
              <Link to="/about" className="px-3 py-2 text-sm font-medium text-charcoal hover:text-gold transition-colors">
                About
              </Link>
              <Link to="/faq" className="px-3 py-2 text-sm font-medium text-charcoal hover:text-gold transition-colors">
                FAQ
              </Link>
              <Link to="/blog" className="px-3 py-2 text-sm font-medium text-charcoal hover:text-gold transition-colors">
                Blog
              </Link>
              <Link to="/contact" className="px-3 py-2 text-sm font-medium text-charcoal hover:text-gold transition-colors">
                Contact
              </Link>
            </div>
          </div>

          {/* Right Actions */}
          <div className="hidden md:flex items-center space-x-4">
            <Button variant="ghost" size="icon">
              <Search className="h-5 w-5" />
            </Button>
            <Link to="/login">
              <Button variant="outline" size="sm" className="flex items-center">
                <User className="h-4 w-4 mr-2" />
                Sign In
              </Button>
            </Link>
            <Link to="/join">
              <Button size="sm" className="btn-gold">Join Now</Button>
            </Link>
          </div>
          
          {/* Mobile menu button */}
          <div className="flex md:hidden">
            <Button variant="ghost" onClick={() => setIsMenuOpen(!isMenuOpen)} size="icon">
              {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </Button>
          </div>
        </div>
      </div>
      
      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="md:hidden bg-white shadow-lg">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            <Link to="/directory" className="block px-3 py-2 text-base font-medium text-charcoal hover:text-gold transition-colors">
              Directory
            </Link>
            <Link to="/about" className="block px-3 py-2 text-base font-medium text-charcoal hover:text-gold transition-colors">
              About
            </Link>
            <Link to="/faq" className="block px-3 py-2 text-base font-medium text-charcoal hover:text-gold transition-colors">
              FAQ
            </Link>
            <Link to="/blog" className="block px-3 py-2 text-base font-medium text-charcoal hover:text-gold transition-colors">
              Blog
            </Link>
            <Link to="/contact" className="block px-3 py-2 text-base font-medium text-charcoal hover:text-gold transition-colors">
              Contact
            </Link>
            <div className="pt-4 pb-3 border-t border-gray-200">
              <div className="flex items-center px-3">
                <Button className="w-full btn-gold">Join Now</Button>
              </div>
              <div className="flex items-center px-3 mt-3">
                <Button variant="outline" className="w-full">Sign In</Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};

export default NavBar;
