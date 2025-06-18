
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Heart, Star, Check } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';

const EscortCard = ({ escort }: { escort: any }) => {
  return (
    <div className="group relative bg-white/10 backdrop-blur-md rounded-lg overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300">
      <Link to={`/profile/${escort.id}`}>
        <div className="aspect-[3/4] relative overflow-hidden">
          <img 
            src={escort.profile_picture || "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3"} 
            alt={escort.display_name || escort.username} 
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
          {/* Favorites button */}
          <Button 
            variant="ghost" 
            size="icon" 
            className="absolute top-2 right-2 bg-white/20 backdrop-blur-md hover:bg-white/30 rounded-full p-1.5"
          >
            <Heart className="h-4 w-4 text-white" />
          </Button>
          
          {/* Featured badge */}
          {escort.featured && (
            <div className="absolute bottom-2 left-2">
              <Badge variant="secondary" className="bg-gold text-white text-xs">Featured</Badge>
            </div>
          )}
        </div>
        
        <div className="p-2">
          <div className="flex items-center justify-between">
            <h3 className="font-medium text-xs text-white truncate">
              {escort.display_name || escort.username || 'Anonymous'}{escort.age && `, ${escort.age}`}
            </h3>
            <div className="flex items-center">
              <Star className="h-3 w-3 text-gold fill-gold mr-1" />
              <span className="text-xs font-medium text-white">{escort.rating?.toFixed(1) || '4.5'}</span>
            </div>
          </div>
          
          <div className="flex items-center mt-1 text-xs text-gray-200">
            <span className="truncate">{escort.location || 'Location not specified'}</span>
            {escort.verified && (
              <Badge variant="outline" className="ml-1 flex items-center border-green-400 text-green-300 text-xs">
                <Check className="h-2 w-2 mr-1" />
                Verified
              </Badge>
            )}
          </div>
        </div>
      </Link>
    </div>
  );
};

const HeroBanner = () => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [bgLoaded, setBgLoaded] = useState(false);
  const [featuredEscorts, setFeaturedEscorts] = useState([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    // Set loaded state after a small delay to trigger animations
    setTimeout(() => {
      setIsLoaded(true);
    }, 100);
    
    // Preload the background image
    const img = new Image();
    img.src = "/lovable-uploads/25a0dcad-e367-4364-9eab-c61f3ebd5a3b.png";
    img.onload = () => setBgLoaded(true);

    // Fetch featured escorts
    fetchFeaturedEscorts();
  }, []);

  const fetchFeaturedEscorts = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .in('role', ['escort', 'agency'])
        .eq('status', 'approved')
        .eq('is_active', true)
        .eq('featured', true)
        .order('rating', { ascending: false })
        .limit(18); // Increased to 18 for 3 rows of 6

      if (error) throw error;
      setFeaturedEscorts(data || []);
    } catch (error) {
      console.error('Error fetching featured escorts:', error);
      setFeaturedEscorts([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen w-full overflow-hidden flex flex-col">
      {/* Background with color placeholder while image loads */}
      <div 
        className={`absolute inset-0 bg-navy transition-opacity duration-500 ${bgLoaded ? 'opacity-0' : 'opacity-100'}`}
      ></div>
      
      {/* Background Image with fade-in effect */}
      <div 
        className={`absolute inset-0 bg-cover bg-center transition-opacity duration-500 ${bgLoaded ? 'opacity-100' : 'opacity-0'}`} 
        style={{
          backgroundImage: 'url("/lovable-uploads/25a0dcad-e367-4364-9eab-c61f3ebd5a3b.png")'
        }}
      >
        {/* Overlay */}
        <div className="absolute inset-0 hero-gradient"></div>
      </div>
      
      {/* Content */}
      <div className="relative flex-1 flex flex-col z-10 py-4 sm:py-8">
        {/* Main Hero Content - Top section with reduced mobile padding */}
        <div className="flex-none text-center px-4 sm:px-6 lg:px-8 pt-8 sm:pt-16 pb-4 sm:pb-8">
          <h1 className={`text-3xl sm:text-5xl md:text-6xl font-bold text-white mb-3 sm:mb-4 transition-all duration-700 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}>
            Discover Elite Companionship
          </h1>
          <p className={`text-base sm:text-xl text-gray-100 max-w-3xl mx-auto mb-4 sm:mb-6 transition-all duration-700 delay-100 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}>
            Connect with sophisticated escorts worldwide through our premium directory
          </p>
          
          {/* CTA Buttons */}
          <div className={`flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center transition-all duration-700 delay-200 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}>
            <Link to="/directory">
              <Button variant="outline" className="text-white border-white bg-zinc-500 hover:bg-zinc-400 text-sm sm:text-base px-4 py-2 sm:px-6 sm:py-3">
                Browse Escorts
              </Button>
            </Link>
            <Link to="/join">
              <Button variant="outline" className="text-gold border-gold hover:bg-gold/20 text-sm sm:text-base px-4 py-2 sm:px-6 sm:py-3">
                List Your Profile
              </Button>
            </Link>
          </div>
        </div>

        {/* Featured Escorts Grid - Bottom section with reduced mobile spacing */}
        {!loading && featuredEscorts.length > 0 && (
          <div className={`flex-1 flex flex-col justify-end px-4 sm:px-6 lg:px-8 pb-4 sm:pb-8 transition-all duration-700 delay-300 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}>
            <div className="max-w-7xl mx-auto w-full">
              <h2 className="text-lg sm:text-2xl font-bold text-white text-center mb-4 sm:mb-6">
                Featured Escorts
              </h2>
              
              {/* 3 Rows Grid Layout */}
              <div className="space-y-2 sm:space-y-3">
                {/* Row 1 */}
                <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2">
                  {featuredEscorts.slice(0, 6).map((escort) => (
                    <EscortCard key={escort.id} escort={escort} />
                  ))}
                </div>
                
                {/* Row 2 */}
                {featuredEscorts.length > 6 && (
                  <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2">
                    {featuredEscorts.slice(6, 12).map((escort) => (
                      <EscortCard key={escort.id} escort={escort} />
                    ))}
                  </div>
                )}
                
                {/* Row 3 */}
                {featuredEscorts.length > 12 && (
                  <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2">
                    {featuredEscorts.slice(12, 18).map((escort) => (
                      <EscortCard key={escort.id} escort={escort} />
                    ))}
                  </div>
                )}
              </div>
              
              <div className="text-center mt-4 sm:mt-6">
                <Link to="/directory">
                  <Button className="btn-gold px-4 py-2 sm:px-6 sm:py-2 text-sm sm:text-base">View All Escorts</Button>
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default HeroBanner;
