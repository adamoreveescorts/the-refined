
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Search } from 'lucide-react';
import { Link } from 'react-router-dom';

const locations = [
  "New York", "London", "Paris", "Tokyo", "Sydney", 
  "Los Angeles", "Berlin", "Madrid", "Toronto", "Dubai"
];

const HeroBanner = () => {
  const [selectedLocation, setSelectedLocation] = useState("");
  
  return (
    <div className="relative h-[80vh] min-h-[500px] max-h-[800px] w-full overflow-hidden">
      {/* Background Image */}
      <div 
        className="absolute inset-0 bg-cover bg-center"
        style={{ 
          backgroundImage: 'url("https://images.unsplash.com/photo-1483058712412-4245e9b90334?auto=format&fit=crop&q=80&w=2670&ixlib=rb-4.0.3")', 
        }}
      >
        {/* Overlay */}
        <div className="absolute inset-0 hero-gradient"></div>
      </div>
      
      {/* Content */}
      <div className="relative h-full flex flex-col justify-center items-center px-4 sm:px-6 lg:px-8 text-center z-10">
        <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-white mb-4 animate-fadeIn">
          Discover Elite Companionship
        </h1>
        <p className="text-lg sm:text-xl text-gray-100 max-w-3xl mb-8 animate-fadeIn" style={{animationDelay: '0.2s'}}>
          Connect with sophisticated escorts worldwide through our premium directory
        </p>
        
        {/* Search Form */}
        <div className="w-full max-w-md bg-white/10 backdrop-blur-md p-4 rounded-lg shadow-lg animate-fadeIn" style={{animationDelay: '0.4s'}}>
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <select 
                className="w-full p-2 rounded-md bg-white/90 text-charcoal border-0 focus:ring-2 focus:ring-gold"
                value={selectedLocation}
                onChange={(e) => setSelectedLocation(e.target.value)}
              >
                <option value="">Select Location</option>
                {locations.map((location) => (
                  <option key={location} value={location}>{location}</option>
                ))}
              </select>
            </div>
            <Link to={selectedLocation ? `/directory?location=${selectedLocation}` : '/directory'}>
              <Button className="w-full sm:w-auto btn-gold flex items-center gap-2 px-6">
                <Search className="h-4 w-4" />
                <span>Search</span>
              </Button>
            </Link>
          </div>
        </div>
        
        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 mt-10 animate-fadeIn" style={{animationDelay: '0.6s'}}>
          <Link to="/directory">
            <Button variant="outline" className="text-white border-white hover:bg-white/20">
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
    </div>
  );
};

export default HeroBanner;
