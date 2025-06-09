
import { Link } from 'react-router-dom';
import { Separator } from '@/components/ui/separator';

const Footer = () => {
  return (
    <footer className="bg-card text-card-foreground border-t border-border">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* About Section */}
          <div>
            <h3 className="font-serif text-xl mb-4">Adam or Eve Escorts</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Premium escort directory connecting sophisticated companions with discerning clients worldwide.
            </p>
            {/* Social links hidden as requested */}
          </div>
          
          {/* Quick Links */}
          <div>
            <h3 className="font-serif text-lg mb-4">Quick Links</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <Link to="/directory" className="hover:text-gold transition-colors">Escort Directory</Link>
              </li>
              <li>
                <Link to="/join" className="hover:text-gold transition-colors">Join Our Network</Link>
              </li>
              <li>
                <Link to="/about" className="hover:text-gold transition-colors">About Us</Link>
              </li>
              <li>
                <Link to="/blog" className="hover:text-gold transition-colors">Blog</Link>
              </li>
              <li>
                <Link to="/faq" className="hover:text-gold transition-colors">FAQ</Link>
              </li>
              <li>
                <Link to="/admin" className="hover:text-gold transition-colors">Admin</Link>
              </li>
            </ul>
          </div>
          
          {/* Support */}
          <div>
            <h3 className="font-serif text-lg mb-4">Support</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <Link to="/contact" className="hover:text-gold transition-colors">Contact Us</Link>
              </li>
              <li>
                <Link to="/help" className="hover:text-gold transition-colors">Help Center</Link>
              </li>
              <li>
                <Link to="/privacy" className="hover:text-gold transition-colors">Privacy Policy</Link>
              </li>
              <li>
                <Link to="/terms" className="hover:text-gold transition-colors">Terms of Service</Link>
              </li>
            </ul>
          </div>
          
          {/* Newsletter */}
          <div>
            <h3 className="font-serif text-lg mb-4">Newsletter</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Subscribe to receive updates about new features and exclusive offers.
            </p>
            <form className="flex">
              <input 
                type="email" 
                placeholder="Your email" 
                className="px-3 py-2 bg-background border border-border rounded-l-md focus:outline-none focus:ring-1 focus:ring-gold focus:border-gold text-sm w-full"
              />
              <button 
                type="submit" 
                className="bg-gold hover:bg-gold/90 text-navy font-medium py-2 px-4 rounded-r-md text-sm"
              >
                Subscribe
              </button>
            </form>
          </div>
        </div>
        
        <Separator className="my-8 bg-border" />
        
        {/* Bottom Footer */}
        <div className="flex flex-col md:flex-row justify-between items-center text-sm text-muted-foreground">
          <p>© {new Date().getFullYear()} Adam or Eve Escorts. All rights reserved.</p>
          <div className="flex space-x-6 mt-4 md:mt-0">
            <Link to="/privacy" className="hover:text-gold transition-colors">Privacy</Link>
            <Link to="/terms" className="hover:text-gold transition-colors">Terms</Link>
            <Link to="/cookies" className="hover:text-gold transition-colors">Cookies</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
