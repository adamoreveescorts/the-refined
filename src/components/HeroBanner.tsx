
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Search } from 'lucide-react';
import { Link } from 'react-router-dom';

const locations = ["New York", "London", "Paris", "Tokyo", "Sydney", "Los Angeles", "Berlin", "Madrid", "Toronto", "Dubai"];

// Background slideshow images
const backgroundImages = [
  "/lovable-uploads/25a0dcad-e367-4364-9eab-c61f3ebd5a3b.png", // Original image
  "/lovable-uploads/ceb551e0-7cd8-4fb3-b408-49f0f1f63b47.png", // New image 1
  "/lovable-uploads/b51408b4-50d5-4f23-97f2-8e76ffc6ef45.png", // New image 2
  "/lovable-uploads/85e5faf5-e587-416e-903f-d0bfe577b759.png", // New image 3
];

const SLIDE_DURATION = 3000; // 3 seconds per slide

const HeroBanner = () => {
  const [selectedLocation, setSelectedLocation] = useState("");
  const [isLoaded, setIsLoaded] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [nextImageIndex, setNextImageIndex] = useState(1);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [imagesLoaded, setImagesLoaded] = useState(new Array(backgroundImages.length).fill(false));

  // Preload all images
  useEffect(() => {
    backgroundImages.forEach((src, index) => {
      const img = new Image();
      img.src = src;
      img.onload = () => {
        setImagesLoaded(prev => {
          const newState = [...prev];
          newState[index] = true;
          return newState;
        });
      };
    });
  }, []);

  // Set loaded state after a small delay to trigger animations
  useEffect(() => {
    setTimeout(() => {
      setIsLoaded(true);
    }, 100);
  }, []);

  // Handle slideshow transitions
  useEffect(() => {
    // Only start slideshow when at least first two images are loaded
    if (!imagesLoaded[0] || !imagesLoaded[1]) return;
    
    const slideInterval = setInterval(() => {
      setIsTransitioning(true);
      
      setTimeout(() => {
        setCurrentImageIndex(nextImageIndex);
        setNextImageIndex((nextImageIndex + 1) % backgroundImages.length);
        setIsTransitioning(false);
      }, 1000); // Transition duration
      
    }, SLIDE_DURATION);
    
    return () => clearInterval(slideInterval);
  }, [nextImageIndex, imagesLoaded]);

  // Check if initial image is loaded
  const initialImageLoaded = imagesLoaded[0];

  return (
    <div className="relative h-[80vh] min-h-[500px] max-h-[800px] w-full overflow-hidden">
      {/* Background color placeholder */}
      <div 
        className={`absolute inset-0 bg-navy transition-opacity duration-1000 ${initialImageLoaded ? 'opacity-0' : 'opacity-100'}`}
      ></div>
      
      {/* Current image with zoom effect */}
      <div 
        className={`absolute inset-0 bg-cover bg-center transition-opacity duration-1000 ${
          isTransitioning ? 'opacity-0' : 'opacity-100'
        } ${initialImageLoaded ? '' : 'opacity-0'}`} 
        style={{
          backgroundImage: `url("${backgroundImages[currentImageIndex]}")`,
          animation: 'zoomEffect 6s infinite alternate'
        }}
      >
        {/* Overlay */}
        <div className="absolute inset-0 hero-gradient"></div>
      </div>
      
      {/* Next image preloaded */}
      <div 
        className={`absolute inset-0 bg-cover bg-center transition-opacity duration-1000 ${
          isTransitioning ? 'opacity-100' : 'opacity-0'
        }`}
        style={{
          backgroundImage: `url("${backgroundImages[nextImageIndex]}")`,
          animation: 'zoomEffect 6s infinite alternate'
        }}
      >
        {/* Overlay */}
        <div className="absolute inset-0 hero-gradient"></div>
      </div>
      
      {/* Content */}
      <div className="relative h-full flex flex-col justify-center items-center px-4 sm:px-6 lg:px-8 text-center z-10">
        <h1 className={`text-4xl sm:text-5xl md:text-6xl font-bold text-white mb-4 transition-all duration-700 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}>
          Discover Elite Companionship
        </h1>
        <p className={`text-lg sm:text-xl text-gray-100 max-w-3xl mb-8 transition-all duration-700 delay-100 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}>
          Connect with sophisticated escorts worldwide through our premium directory
        </p>
        
        {/* Search Form */}
        <div className={`w-full max-w-md bg-white/10 backdrop-blur-md p-4 rounded-lg shadow-lg transition-all duration-700 delay-200 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}>
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <select className="w-full p-2 rounded-md bg-white/90 text-charcoal border-0 focus:ring-2 focus:ring-gold" value={selectedLocation} onChange={e => setSelectedLocation(e.target.value)}>
                <option value="">Select Location</option>
                {locations.map(location => <option key={location} value={location}>{location}</option>)}
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
        <div className={`flex flex-col sm:flex-row gap-4 mt-10 transition-all duration-700 delay-300 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}>
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
    </div>
  );
};

export default HeroBanner;
