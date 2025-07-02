import { Link } from 'react-router-dom';
import { Separator } from '@/components/ui/separator';
import { Twitter } from 'lucide-react';
const Footer = () => {
  return <footer className="bg-card text-card-foreground border-t border-border">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* About Section */}
          <div>
            <h3 className="font-serif text-xl mb-4">Adam or Eve Escorts</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Premium escort directory connecting sophisticated companions with discerning clients worldwide.
            </p>
            <div className="flex space-x-4">
              <a 
                href="https://x.com/SauceyEva87" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-muted-foreground hover:text-gold transition-colors"
                aria-label="Follow us on X (Twitter)"
              >
                <Twitter size={20} />
              </a>
              <a 
                href="https://www.reddit.com/user/AdamorEveescorts/" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-muted-foreground hover:text-gold transition-colors"
                aria-label="Follow us on Reddit"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0zm5.01 4.744c.688 0 1.25.561 1.25 1.249a1.25 1.25 0 0 1-2.498.056l-2.597-.547-.8 3.747c1.824.07 3.48.632 4.674 1.488.308-.309.73-.491 1.207-.491.968 0 1.754.786 1.754 1.754 0 .716-.435 1.333-1.01 1.614a3.111 3.111 0 0 1 .042.52c0 2.694-3.13 4.87-7.004 4.87-3.874 0-7.004-2.176-7.004-4.87 0-.183.015-.366.043-.534A1.748 1.748 0 0 1 4.028 12c0-.968.786-1.754 1.754-1.754.463 0 .898.196 1.207.49 1.207-.883 2.878-1.43 4.744-1.487l.885-4.182a.342.342 0 0 1 .14-.197.35.35 0 0 1 .238-.042l2.906.617a1.214 1.214 0 0 1 1.108-.701zM9.25 12C8.561 12 8 12.562 8 13.25c0 .687.561 1.248 1.25 1.248.687 0 1.248-.561 1.248-1.249 0-.688-.561-1.249-1.249-1.249zm5.5 0c-.687 0-1.248.561-1.248 1.25 0 .687.561 1.248 1.249 1.248.688 0 1.249-.561 1.249-1.249 0-.687-.562-1.249-1.25-1.249zm-5.466 3.99a.327.327 0 0 0-.231.094.33.33 0 0 0 0 .463c.842.842 2.484.913 2.961.913.477 0 2.105-.056 2.961-.913a.361.361 0 0 0 .029-.463.33.33 0 0 0-.464 0c-.547.533-1.684.73-2.512.73-.828 0-1.979-.196-2.512-.73a.326.326 0 0 0-.232-.095z"/>
                </svg>
              </a>
            </div>
          </div>
          
          {/* Quick Links */}
          <div>
            <h3 className="font-serif text-lg mb-4">Quick Links</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <Link to="/directory" className="hover:text-gold transition-colors">Escort Directory</Link>
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
              <input type="email" placeholder="Your email" className="px-3 py-2 bg-background border border-border rounded-l-md focus:outline-none focus:ring-1 focus:ring-gold focus:border-gold text-sm w-full" />
              <button type="submit" className="bg-gold hover:bg-gold/90 text-navy font-medium py-2 px-4 rounded-r-md text-sm">
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
    </footer>;
};
export default Footer;