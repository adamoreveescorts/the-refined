import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import NavBar from '@/components/NavBar';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import { Check, Heart, Search, Filter, Star } from 'lucide-react';

// Mock data for escorts
const mockEscorts = Array(24).fill(null).map((_, index) => {
  const id = index + 1;
  const names = ["Sophia", "Isabella", "Emma", "Olivia", "Charlotte", "Amelia", "Mia", "Harper", "Evelyn", "Abigail"];
  const locations = ["New York", "London", "Paris", "Tokyo", "Sydney", "Los Angeles", "Berlin", "Madrid", "Toronto", "Dubai"];
  const imageUrls = [
    "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3",
    "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3",
    "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3",
    "https://images.unsplash.com/photo-1541823709867-1b206113eafd?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3",
    "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3",
    "https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3"
  ];
  
  return {
    id,
    name: names[id % names.length],
    age: 20 + (id % 15),
    location: locations[id % locations.length],
    image: imageUrls[id % imageUrls.length],
    verified: id % 3 === 0,
    featured: id % 5 === 0,
    rating: 4 + (id % 11) / 10,
    services: ["Dinner Date", "Travel Companion", "Event Escort"].slice(0, 1 + (id % 3)),
    gender: id % 4 === 0 ? "Male" : "Female",
    ethnicity: ["Caucasian", "Asian", "African", "Hispanic", "Middle Eastern"][id % 5],
    height: 160 + (id % 30),
    rate: 200 + (id % 10) * 50
  };
});

const EscortCard = ({ escort }: { escort: any }) => {
  return (
    <div className="group relative bg-white rounded-lg overflow-hidden shadow-md card-hover">
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
            <span className="text-sm font-medium">{escort.rating.toFixed(1)}</span>
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
        
        <div className="mt-2 flex flex-wrap gap-1">
          {escort.services.map((service: string, idx: number) => (
            <Badge key={idx} variant="secondary" className="bg-gray-100 text-charcoal text-xs">
              {service}
            </Badge>
          ))}
        </div>
        
        <div className="mt-4 pt-2 border-t border-gray-100 flex items-center justify-between">
          <span className="text-gold font-medium">${escort.rate}/hr</span>
          <Button size="sm" variant="link" className="text-navy">View Profile</Button>
        </div>
      </div>
    </div>
  );
};

const FilterSidebar = ({ onFilterChange, filters }: { onFilterChange: any, filters: any }) => {
  const [ageRange, setAgeRange] = useState<number[]>([18, 50]);
  const [priceRange, setPriceRange] = useState<number[]>([100, 1000]);
  
  const handleAgeChange = (value: number[]) => {
    setAgeRange(value);
    onFilterChange({ ...filters, ageMin: value[0], ageMax: value[1] });
  };
  
  const handlePriceChange = (value: number[]) => {
    setPriceRange(value);
    onFilterChange({ ...filters, priceMin: value[0], priceMax: value[1] });
  };
  
  return (
    <>
      {/* Mobile Filter Button - Keep it for mobile users to hide/show filters if needed */}
      <div className="md:hidden mb-4">
        <Button 
          onClick={() => {}} // We'll keep this button but it won't toggle anything now
          variant="outline"
          className="w-full flex items-center justify-center gap-2"
        >
          <Filter className="h-4 w-4" />
          Hide Filters
        </Button>
      </div>
      
      {/* Always show the filters regardless of screen size */}
      <div className="md:block bg-white rounded-lg shadow-md p-4 sticky top-20">
        <h3 className="font-medium text-lg mb-4">Filters</h3>
        
        {/* Location */}
        <div className="mb-6">
          <label className="block text-sm font-medium mb-2">Location</label>
          <Input 
            type="text" 
            placeholder="Enter city or region"
            value={filters.location || ''}
            onChange={(e) => onFilterChange({ ...filters, location: e.target.value })}
          />
        </div>
        
        {/* Gender */}
        <div className="mb-6">
          <label className="block text-sm font-medium mb-2">Gender</label>
          <div className="space-y-2">
            {['Female', 'Male', 'Non-Binary'].map((gender) => (
              <div key={gender} className="flex items-center">
                <Checkbox 
                  id={`gender-${gender}`}
                  checked={filters.gender === gender}
                  onCheckedChange={() => onFilterChange({ ...filters, gender })}
                />
                <label 
                  htmlFor={`gender-${gender}`} 
                  className="ml-2 text-sm"
                >
                  {gender}
                </label>
              </div>
            ))}
          </div>
        </div>
        
        {/* Age Range */}
        <div className="mb-6">
          <label className="block text-sm font-medium mb-2">
            Age Range: {ageRange[0]} - {ageRange[1]}
          </label>
          <Slider 
            defaultValue={[18, 50]} 
            min={18} 
            max={60} 
            step={1}
            value={ageRange}
            onValueChange={handleAgeChange}
            className="mt-2"
          />
        </div>
        
        {/* Price Range */}
        <div className="mb-6">
          <label className="block text-sm font-medium mb-2">
            Price Range: ${priceRange[0]} - ${priceRange[1]}
          </label>
          <Slider 
            defaultValue={[100, 1000]} 
            min={100} 
            max={2000} 
            step={50}
            value={priceRange}
            onValueChange={handlePriceChange}
            className="mt-2"
          />
        </div>
        
        {/* Services */}
        <div className="mb-6">
          <label className="block text-sm font-medium mb-2">Services</label>
          <div className="space-y-2">
            {['Dinner Date', 'Travel Companion', 'Event Escort', 'Overnight'].map((service) => (
              <div key={service} className="flex items-center">
                <Checkbox 
                  id={`service-${service}`}
                  checked={filters.services?.includes(service)}
                  onCheckedChange={(checked) => {
                    const services = filters.services || [];
                    const newServices = checked 
                      ? [...services, service]
                      : services.filter((s: string) => s !== service);
                    onFilterChange({ ...filters, services: newServices });
                  }}
                />
                <label 
                  htmlFor={`service-${service}`} 
                  className="ml-2 text-sm"
                >
                  {service}
                </label>
              </div>
            ))}
          </div>
        </div>
        
        {/* Verified Only */}
        <div className="mb-6">
          <div className="flex items-center">
            <Checkbox 
              id="verified"
              checked={filters.verifiedOnly}
              onCheckedChange={(checked) => onFilterChange({ ...filters, verifiedOnly: !!checked })}
            />
            <label htmlFor="verified" className="ml-2 text-sm">Verified Only</label>
          </div>
        </div>
        
        <Button 
          className="w-full btn-gold"
          onClick={() => onFilterChange({ 
            location: '',
            gender: '',
            ageMin: 18,
            ageMax: 50,
            priceMin: 100,
            priceMax: 1000,
            services: [],
            verifiedOnly: false
          })}
        >
          Reset Filters
        </Button>
      </div>
    </>
  );
};

const Directory = () => {
  const [searchParams] = useSearchParams();
  const initialLocation = searchParams.get('location') || '';
  
  const [filters, setFilters] = useState({
    location: initialLocation,
    gender: '',
    ageMin: 18,
    ageMax: 50,
    priceMin: 100,
    priceMax: 1000,
    services: [],
    verifiedOnly: false,
    searchQuery: ''
  });
  
  const [sortBy, setSortBy] = useState('featured');
  
  // Apply filters to escorts
  const filteredEscorts = mockEscorts.filter(escort => {
    if (filters.location && !escort.location.toLowerCase().includes(filters.location.toLowerCase())) {
      return false;
    }
    
    if (filters.gender && escort.gender !== filters.gender) {
      return false;
    }
    
    if (escort.age < filters.ageMin || escort.age > filters.ageMax) {
      return false;
    }
    
    if (escort.rate < filters.priceMin || escort.rate > filters.priceMax) {
      return false;
    }
    
    if (filters.services && filters.services.length > 0) {
      const hasService = filters.services.some((service: string) => 
        escort.services.includes(service)
      );
      if (!hasService) return false;
    }
    
    if (filters.verifiedOnly && !escort.verified) {
      return false;
    }
    
    if (filters.searchQuery) {
      const query = filters.searchQuery.toLowerCase();
      return (
        escort.name.toLowerCase().includes(query) ||
        escort.location.toLowerCase().includes(query) ||
        escort.services.some((service: string) => service.toLowerCase().includes(query))
      );
    }
    
    return true;
  });
  
  // Sort escorts
  const sortedEscorts = [...filteredEscorts].sort((a, b) => {
    switch (sortBy) {
      case 'featured':
        return b.featured ? 1 : -1;
      case 'price_low':
        return a.rate - b.rate;
      case 'price_high':
        return b.rate - a.rate;
      case 'rating':
        return b.rating - a.rating;
      default:
        return 0;
    }
  });
  
  return (
    <div className="min-h-screen flex flex-col">
      <NavBar />
      
      {/* Page Content */}
      <main className="flex-grow bg-gray-50 py-8">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <header className="mb-8">
            <h1 className="text-3xl sm:text-4xl font-bold text-navy">Escort Directory</h1>
            <p className="text-charcoal mt-2">
              Discover premium companions tailored to your preferences
            </p>
          </header>
          
          {/* Search Bar */}
          <div className="mb-8 flex items-center bg-white rounded-lg shadow-sm p-2 max-w-2xl">
            <Search className="h-5 w-5 text-gray-400 mx-2" />
            <Input 
              type="text" 
              placeholder="Search by name, location, or service..."
              className="flex-1 border-0 focus-visible:ring-0 focus-visible:ring-transparent"
              value={filters.searchQuery}
              onChange={(e) => setFilters({ ...filters, searchQuery: e.target.value })}
            />
          </div>
          
          <div className="flex flex-col md:flex-row gap-6">
            {/* Filter Sidebar */}
            <aside className="md:w-64 flex-shrink-0">
              <FilterSidebar onFilterChange={setFilters} filters={filters} />
            </aside>
            
            {/* Escort Grid */}
            <div className="flex-1">
              <div className="flex items-center justify-between mb-6">
                <p className="text-sm text-charcoal">
                  {filteredEscorts.length} escorts found
                </p>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-charcoal">Sort by:</span>
                  <select 
                    className="text-sm border rounded-md p-1 bg-white"
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                  >
                    <option value="featured">Featured</option>
                    <option value="price_low">Price: Low to High</option>
                    <option value="price_high">Price: High to Low</option>
                    <option value="rating">Rating</option>
                  </select>
                </div>
              </div>
              
              {filteredEscorts.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {sortedEscorts.map(escort => (
                    <EscortCard key={escort.id} escort={escort} />
                  ))}
                </div>
              ) : (
                <div className="bg-white rounded-lg p-8 text-center">
                  <h3 className="text-lg font-medium mb-2">No escorts found</h3>
                  <p className="text-charcoal">Try adjusting your filters or search query</p>
                </div>
              )}
              
              {/* Pagination */}
              <div className="flex justify-center mt-10">
                <div className="flex space-x-1">
                  <Button variant="outline" size="sm" disabled>Previous</Button>
                  <Button variant="outline" size="sm" className="bg-navy text-white">1</Button>
                  <Button variant="outline" size="sm">2</Button>
                  <Button variant="outline" size="sm">3</Button>
                  <Button variant="outline" size="sm">Next</Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default Directory;
