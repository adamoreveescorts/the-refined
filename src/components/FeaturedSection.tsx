import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Heart, Star, Check } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';
const EscortCard = ({
  escort,
  index
}: {
  escort: any;
  index: number;
}) => {
  const isMobile = useIsMobile();
  const [isVisible, setIsVisible] = useState(!isMobile);
  useEffect(() => {
    if (isMobile) {
      const timer = setTimeout(() => {
        setIsVisible(true);
      }, 100 + index * 150); // Staggered delay based on card index

      return () => clearTimeout(timer);
    }
  }, [isMobile, index]);
  return <div className={`group relative bg-white rounded-lg overflow-hidden shadow-md card-hover transition-all duration-500 ease-out ${isMobile ? isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10' : ''}`}>
      <Link to={`/profile/${escort.id}`}>
        <div className="aspect-[3/4] relative overflow-hidden">
          <img src={escort.profile_picture || "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3"} alt={escort.display_name || escort.username} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
          {/* Favorites button */}
          <Button variant="ghost" size="icon" className="absolute top-2 right-2 bg-white/50 backdrop-blur-md hover:bg-white/80 rounded-full p-1.5">
            <Heart className="h-5 w-5 text-red-500" />
          </Button>
          
          {/* Featured badge */}
          {escort.featured && <div className="absolute bottom-2 left-2">
              <Badge variant="secondary" className="bg-gold text-white">Featured</Badge>
            </div>}
        </div>
        
        <div className="p-4">
          <div className="flex items-center justify-between">
            <h3 className="font-medium text-lg text-navy">
              {escort.display_name || escort.username || 'Anonymous'}{escort.age && `, ${escort.age}`}
            </h3>
            <div className="flex items-center">
              <Star className="h-4 w-4 text-gold fill-gold mr-1" />
              <span className="text-sm font-medium">{escort.rating?.toFixed(1) || '4.5'}</span>
            </div>
          </div>
          
          <div className="flex items-center mt-1 text-sm text-charcoal">
            <span>{escort.location || 'Location not specified'}</span>
            {escort.verified && <Badge variant="outline" className="ml-2 flex items-center border-green-500 text-green-600 text-xs">
                <Check className="h-3 w-3 mr-1" />
                Verified
              </Badge>}
          </div>
        </div>
      </Link>
    </div>;
};
const FeaturedSection = () => {
  const [featuredEscorts, setFeaturedEscorts] = useState([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    fetchFeaturedEscorts();
  }, []);
  const fetchFeaturedEscorts = async () => {
    try {
      // First try to get featured escorts
      let {
        data: featured,
        error: featuredError
      } = await supabase.from('profiles').select('*').in('role', ['escort', 'agency']).eq('is_active', true).eq('featured', true).order('rating', {
        ascending: false
      }).limit(6);
      if (featuredError) throw featuredError;

      // If no featured escorts, fallback to top-rated active profiles
      if (!featured || featured.length === 0) {
        console.log('No featured escorts found, falling back to top-rated profiles');
        const {
          data: fallback,
          error: fallbackError
        } = await supabase.from('profiles').select('*').in('role', ['escort', 'agency']).or('is_active.eq.true,and(display_name.not.is.null,location.not.is.null)') // Show active OR profiles with basic info
        .in('status', ['pending', 'approved']).order('rating', {
          ascending: false
        }).order('profile_completion_percentage', {
          ascending: false
        }).limit(6);
        if (fallbackError) throw fallbackError;
        setFeaturedEscorts(fallback || []);
      } else {
        setFeaturedEscorts(featured);
      }
    } catch (error) {
      console.error('Error fetching featured escorts:', error);
      // Fallback to showing no escorts instead of breaking the page
      setFeaturedEscorts([]);
    } finally {
      setLoading(false);
    }
  };
  if (loading) {
    return;
  }
  if (featuredEscorts.length === 0) {
    return <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="container mx-auto">
          <div className="text-center mb-10">
            <h2 className="text-3xl sm:text-4xl font-bold text-navy mb-4">Featured Escorts</h2>
            <p className="text-charcoal max-w-2xl mx-auto">
              Meet our handpicked selection of distinguished companions from around the world
            </p>
          </div>
          <div className="text-center">
            <p className="text-charcoal mb-6">No featured escorts available at the moment.</p>
            <Link to="/directory">
              <Button className="btn-gold px-8 py-6">Browse All Escorts</Button>
            </Link>
          </div>
        </div>
      </section>;
  }
  return <section className="py-16 px-4 sm:px-6 lg:px-8">
      <div className="container mx-auto">
        <div className="text-center mb-10">
          <h2 className="text-3xl sm:text-4xl font-bold text-navy mb-4">Featured Escorts</h2>
          <p className="text-charcoal max-w-2xl mx-auto">
            Meet our handpicked selection of distinguished companions from around the world
          </p>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {featuredEscorts.map((escort, index) => <EscortCard key={escort.id} escort={escort} index={index} />)}
        </div>
        
        <div className="text-center mt-12">
          <Link to="/directory">
            <Button className="btn-gold px-8 py-6">View All Escorts</Button>
          </Link>
        </div>
      </div>
    </section>;
};
export default FeaturedSection;