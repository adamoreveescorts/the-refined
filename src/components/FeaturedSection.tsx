
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Heart, Star, Check } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';

// Mock escort data
const featuredEscorts = [
  {
    id: 1,
    name: "Sophia",
    age: 26,
    location: "New York",
    image: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3",
    verified: true,
    featured: true,
    rating: 5.0,
  },
  {
    id: 2,
    name: "Isabella",
    age: 28,
    location: "London",
    image: "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3",
    verified: true,
    featured: true,
    rating: 4.9,
  },
  {
    id: 3,
    name: "Emma",
    age: 25,
    location: "Paris",
    image: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3",
    verified: true,
    featured: true,
    rating: 4.8,
  },
  {
    id: 4,
    name: "Olivia",
    age: 27,
    location: "Los Angeles",
    image: "https://images.unsplash.com/photo-1541823709867-1b206113eafd?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3",
    verified: true,
    featured: true,
    rating: 4.9,
  },
  {
    id: 5,
    name: "Charlotte",
    age: 24,
    location: "Berlin",
    image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3",
    verified: true,
    featured: true,
    rating: 4.7,
  },
  {
    id: 6,
    name: "Amelia",
    age: 29,
    location: "Tokyo",
    image: "https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3",
    verified: true,
    featured: true,
    rating: 5.0,
  },
];

const EscortCard = ({ escort, index }: { escort: any; index: number }) => {
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
  
  return (
    <div 
      className={`group relative bg-white rounded-lg overflow-hidden shadow-md card-hover transition-all duration-500 ease-out ${
        isMobile ? (isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10') : ''
      }`}
    >
      <Link to={`/profile/${escort.id}`}>
        <div className="aspect-[3/4] relative overflow-hidden">
          <img 
            src={escort.image} 
            alt={escort.name} 
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
          {/* Favorites button */}
          <Button 
            variant="ghost" 
            size="icon" 
            className="absolute top-2 right-2 bg-white/50 backdrop-blur-md hover:bg-white/80 rounded-full p-1.5"
          >
            <Heart className="h-5 w-5 text-red-500" />
          </Button>
          
          {/* Featured badge */}
          {escort.featured && (
            <div className="absolute bottom-2 left-2">
              <Badge variant="secondary" className="bg-gold text-white">Featured</Badge>
            </div>
          )}
        </div>
        
        <div className="p-4">
          <div className="flex items-center justify-between">
            <h3 className="font-medium text-lg text-navy">{escort.name}, {escort.age}</h3>
            <div className="flex items-center">
              <Star className="h-4 w-4 text-gold fill-gold mr-1" />
              <span className="text-sm font-medium">{escort.rating}</span>
            </div>
          </div>
          
          <div className="flex items-center mt-1 text-sm text-charcoal">
            <span>{escort.location}</span>
            {escort.verified && (
              <Badge variant="outline" className="ml-2 flex items-center border-green-500 text-green-600 text-xs">
                <Check className="h-3 w-3 mr-1" />
                Verified
              </Badge>
            )}
          </div>
        </div>
      </Link>
    </div>
  );
};

const FeaturedSection = () => {
  return (
    <section className="py-16 px-4 sm:px-6 lg:px-8">
      <div className="container mx-auto">
        <div className="text-center mb-10">
          <h2 className="text-3xl sm:text-4xl font-bold text-navy mb-4">Featured Escorts</h2>
          <p className="text-charcoal max-w-2xl mx-auto">
            Meet our handpicked selection of distinguished companions from around the world
          </p>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-6">
          {featuredEscorts.map((escort, index) => (
            <EscortCard key={escort.id} escort={escort} index={index} />
          ))}
        </div>
        
        <div className="text-center mt-10">
          <Link to="/directory">
            <Button className="btn-gold px-8 py-6">View All Escorts</Button>
          </Link>
        </div>
      </div>
    </section>
  );
};

export default FeaturedSection;
