
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
        
        <div className="p-3">
          <div className="flex items-center justify-between">
            <h3 className="font-medium text-sm text-white">
              {escort.display_name || escort.username || 'Anonymous'}{escort.age && `, ${escort.age}`}
            </h3>
            <div className="flex items-center">
              <Star className="h-3 w-3 text-gold fill-gold mr-1" />
              <span className="text-xs font-medium text-white">{escort.rating?.toFixed(1) || '4.5'}</span>
            </div>
          </div>
          
          <div className="flex items-center mt-1 text-xs text-gray-200">
            <span>{escort.location || 'Location not specified'}</span>
            {escort.verified && (
              <Badge variant="outline" className="ml-2 flex items-center border-green-400 text-green-300 text-xs">
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
        .limit(18); // Increased to show more escorts in 3 rows

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
    <div className="relative h-[100vh] min-h-[700px] w-full overflow-hidden">
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
      <div className="relative h-full flex flex-col justify-center px-4 sm:px-6 lg:px-8 z-10">
        {/* Main Hero Content */}
        <div className="text-center mb-8">
          <h1 className={`text-4xl sm:text-5xl md:text-6xl font-bold text-white mb-4 transition-all duration-700 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}>
            Discover Elite Companionship
          </h1>
          <p className={`text-lg sm:text-xl text-gray-100 max-w-3xl mx-auto mb-6 transition-all duration-700 delay-100 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}>
            Connect with sophisticated escorts worldwide through our premium directory
          </p>
          
          {/* CTA Buttons */}
          <div className={`flex flex-col sm:flex-row gap-4 justify-center transition-all duration-700 delay-200 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}>
            <Link to="/directory">
              <Button variant="outline" className="text-white border-white bg-zinc-500 hover:bg-zinc-400">
                Browse Escorts
              </Button>
            </Link>
            <Link to="/join">
              <Button variant="outline" className="text-gold border-gold hover:bg-gold/20">
                List Your Profile
              </Button>
            </Link>
          </div>
        </div>

        {/* Featured Escorts Grid */}
        {!loading && featuredEscorts.length > 0 && (
          <div className={`transition-all duration-700 delay-300 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}>
            <h2 className="text-2xl sm:text-3xl font-bold text-white text-center mb-8">
              Featured Escorts
            </h2>
            <div className="max-w-7xl mx-auto px-4">
              {/* 3 Rows Grid Layout */}
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4 mb-4">
                {featuredEscorts.slice(0, 6).map((escort) => (
                  <EscortCard key={escort.id} escort={escort} />
                ))}
              </div>
              
              {featuredEscorts.length > 6 && (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4 mb-4">
                  {featuredEscorts.slice(6, 12).map((escort) => (
                    <EscortCard key={escort.id} escort={escort} />
                  ))}
                </div>
              )}
              
              {featuredEscorts.length > 12 && (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                  {featuredEscorts.slice(12, 18).map((escort) => (
                    <EscortCard key={escort.id} escort={escort} />
                  ))}
                </div>
              )}
            </div>
            
            <div className="text-center mt-8">
              <Link to="/directory">
                <Button className="btn-gold px-8 py-3">View All Escorts</Button>
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default HeroBanner;
