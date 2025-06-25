import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Star, Check, Search, Filter } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { useIsMobile } from '@/hooks/use-mobile';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';

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

const FilterSheet = ({ onFilterChange, filters }: { onFilterChange: any, filters: any }) => {
  const isMobile = useIsMobile();

  const FilterContent = () => (
    <div className="space-y-4 p-4">
      {/* Location */}
      <div>
        <label className="block text-sm font-medium mb-2 text-white">Location</label>
        <Input 
          type="text" 
          placeholder="Enter city or region"
          value={filters.location || ''}
          onChange={(e) => onFilterChange({ ...filters, location: e.target.value })}
          className="bg-white/20 border-white/30 text-white placeholder:text-white/70"
        />
      </div>
      
      {/* Ethnicity */}
      <div>
        <label className="block text-sm font-medium mb-2 text-white">Ethnicity</label>
        <Select value={filters.ethnicity || 'all'} onValueChange={(value) => onFilterChange({ ...filters, ethnicity: value === 'all' ? '' : value })}>
          <SelectTrigger className="bg-white/20 border-white/30 text-white">
            <SelectValue placeholder="Select ethnicity" />
          </SelectTrigger>
          <SelectContent className="bg-white border border-gray-200 text-gray-900 z-50">
            <SelectItem value="all">All</SelectItem>
            <SelectItem value="Asian">Asian</SelectItem>
            <SelectItem value="Black">Black</SelectItem>
            <SelectItem value="Caucasian">Caucasian</SelectItem>
            <SelectItem value="Hispanic">Hispanic</SelectItem>
            <SelectItem value="Indian">Indian</SelectItem>
            <SelectItem value="Middle Eastern">Middle Eastern</SelectItem>
            <SelectItem value="Mixed">Mixed</SelectItem>
            <SelectItem value="Other">Other</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Body Type */}
      <div>
        <label className="block text-sm font-medium mb-2 text-white">Body Type</label>
        <Select value={filters.body_type || 'all'} onValueChange={(value) => onFilterChange({ ...filters, body_type: value === 'all' ? '' : value })}>
          <SelectTrigger className="bg-white/20 border-white/30 text-white">
            <SelectValue placeholder="Select body type" />
          </SelectTrigger>
          <SelectContent className="bg-white border border-gray-200 text-gray-900 z-50">
            <SelectItem value="all">All</SelectItem>
            <SelectItem value="Petite">Petite</SelectItem>
            <SelectItem value="Slim">Slim</SelectItem>
            <SelectItem value="Athletic">Athletic</SelectItem>
            <SelectItem value="Average">Average</SelectItem>
            <SelectItem value="Curvy">Curvy</SelectItem>
            <SelectItem value="Full Figured">Full Figured</SelectItem>
            <SelectItem value="BBW">BBW</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Sort */}
      <div>
        <label className="block text-sm font-medium mb-2 text-white">Sort By</label>
        <Select value={filters.sortBy || 'featured'} onValueChange={(value) => onFilterChange({ ...filters, sortBy: value })}>
          <SelectTrigger className="bg-white/20 border-white/30 text-white">
            <SelectValue placeholder="Sort by" />
          </SelectTrigger>
          <SelectContent className="bg-white border border-gray-200 text-gray-900 z-50">
            <SelectItem value="featured">Featured</SelectItem>
            <SelectItem value="rating">Rating</SelectItem>
            <SelectItem value="newest">Newest</SelectItem>
            <SelectItem value="name">Name A-Z</SelectItem>
            <SelectItem value="age-asc">Age (Youngest)</SelectItem>
            <SelectItem value="age-desc">Age (Oldest)</SelectItem>
          </SelectContent>
        </Select>
      </div>
      
      <Button 
        className="w-full bg-white/20 text-white border-white/30 hover:bg-white/30"
        variant="outline"
        onClick={() => onFilterChange({ 
          location: '',
          ethnicity: '',
          body_type: '',
          searchQuery: '',
          sortBy: 'featured'
        })}
      >
        Reset Filters
      </Button>
    </div>
  );

  if (isMobile) {
    return (
      <Sheet>
        <SheetTrigger asChild>
          <Button 
            variant="outline"
            className="bg-white/20 text-white border-white/30 hover:bg-white/30"
            size="sm"
          >
            <Filter className="h-4 w-4 mr-2" />
            Filters
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="w-full sm:max-w-md bg-gradient-to-b from-navy/95 to-gray-900/95 backdrop-blur">
          <SheetHeader>
            <SheetTitle className="text-white">Filter Featured Escorts</SheetTitle>
          </SheetHeader>
          <FilterContent />
        </SheetContent>
      </Sheet>
    );
  }

  return null; // Desktop filters are now handled separately
};

const DesktopFilters = ({ onFilterChange, filters }: { onFilterChange: any, filters: any }) => {
  return (
    <div className="hidden md:flex items-center gap-4 mb-4 p-4 bg-white/10 backdrop-blur-md rounded-lg">
      {/* Location */}
      <div className="flex-1">
        <Input 
          type="text" 
          placeholder="Enter city or region"
          value={filters.location || ''}
          onChange={(e) => onFilterChange({ ...filters, location: e.target.value })}
          className="bg-white/20 border-white/30 text-white placeholder:text-white/70"
        />
      </div>
      
      {/* Ethnicity */}
      <div className="flex-1">
        <Select value={filters.ethnicity || 'all'} onValueChange={(value) => onFilterChange({ ...filters, ethnicity: value === 'all' ? '' : value })}>
          <SelectTrigger className="bg-white/20 border-white/30 text-white">
            <SelectValue placeholder="Select ethnicity" />
          </SelectTrigger>
          <SelectContent className="bg-white border border-gray-200 text-gray-900 z-50">
            <SelectItem value="all">All Ethnicities</SelectItem>
            <SelectItem value="Asian">Asian</SelectItem>
            <SelectItem value="Black">Black</SelectItem>
            <SelectItem value="Caucasian">Caucasian</SelectItem>
            <SelectItem value="Hispanic">Hispanic</SelectItem>
            <SelectItem value="Indian">Indian</SelectItem>
            <SelectItem value="Middle Eastern">Middle Eastern</SelectItem>
            <SelectItem value="Mixed">Mixed</SelectItem>
            <SelectItem value="Other">Other</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Body Type */}
      <div className="flex-1">
        <Select value={filters.body_type || 'all'} onValueChange={(value) => onFilterChange({ ...filters, body_type: value === 'all' ? '' : value })}>
          <SelectTrigger className="bg-white/20 border-white/30 text-white">
            <SelectValue placeholder="Select body type" />
          </SelectTrigger>
          <SelectContent className="bg-white border border-gray-200 text-gray-900 z-50">
            <SelectItem value="all">All Body Types</SelectItem>
            <SelectItem value="Petite">Petite</SelectItem>
            <SelectItem value="Slim">Slim</SelectItem>
            <SelectItem value="Athletic">Athletic</SelectItem>
            <SelectItem value="Average">Average</SelectItem>
            <SelectItem value="Curvy">Curvy</SelectItem>
            <SelectItem value="Full Figured">Full Figured</SelectItem>
            <SelectItem value="BBW">BBW</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Sort */}
      <div className="flex-1">
        <Select value={filters.sortBy || 'featured'} onValueChange={(value) => onFilterChange({ ...filters, sortBy: value })}>
          <SelectTrigger className="bg-white/20 border-white/30 text-white">
            <SelectValue placeholder="Sort by" />
          </SelectTrigger>
          <SelectContent className="bg-white border border-gray-200 text-gray-900 z-50">
            <SelectItem value="featured">Featured</SelectItem>
            <SelectItem value="rating">Rating</SelectItem>
            <SelectItem value="newest">Newest</SelectItem>
            <SelectItem value="name">Name A-Z</SelectItem>
            <SelectItem value="age-asc">Age (Youngest)</SelectItem>
            <SelectItem value="age-desc">Age (Oldest)</SelectItem>
          </SelectContent>
        </Select>
      </div>
      
      <Button 
        className="bg-white/20 text-white border-white/30 hover:bg-white/30"
        variant="outline"
        onClick={() => onFilterChange({ 
          location: '',
          ethnicity: '',
          body_type: '',
          searchQuery: '',
          sortBy: 'featured'
        })}
      >
        Reset
      </Button>
    </div>
  );
};

const HeroBanner = () => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [bgLoaded, setBgLoaded] = useState(false);
  const [featuredEscorts, setFeaturedEscorts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    location: '',
    ethnicity: '',
    body_type: '',
    searchQuery: '',
    sortBy: 'featured'
  });
  const isMobile = useIsMobile();
  
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
        .limit(24); // Increased to 24 for more filtering options

      if (error) throw error;
      setFeaturedEscorts(data || []);
    } catch (error) {
      console.error('Error fetching featured escorts:', error);
      setFeaturedEscorts([]);
    } finally {
      setLoading(false);
    }
  };

  // Apply filters to escorts
  const filteredEscorts = featuredEscorts.filter(escort => {
    if (filters.location && !escort.location?.toLowerCase().includes(filters.location.toLowerCase())) {
      return false;
    }
    
    if (filters.ethnicity && escort.ethnicity !== filters.ethnicity) {
      return false;
    }
    
    if (filters.body_type && escort.body_type !== filters.body_type) {
      return false;
    }
    
    if (filters.searchQuery) {
      const query = filters.searchQuery.toLowerCase();
      return (
        escort.display_name?.toLowerCase().includes(query) ||
        escort.username?.toLowerCase().includes(query) ||
        escort.location?.toLowerCase().includes(query) ||
        escort.services?.toLowerCase().includes(query) ||
        escort.ethnicity?.toLowerCase().includes(query) ||
        escort.body_type?.toLowerCase().includes(query)
      );
    }
    
    return true;
  });

  // Sort escorts
  const sortedEscorts = [...filteredEscorts].sort((a, b) => {
    switch (filters.sortBy) {
      case 'featured':
        if (a.featured && !b.featured) return -1;
        if (!a.featured && b.featured) return 1;
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      case 'rating':
        return (b.rating || 0) - (a.rating || 0);
      case 'newest':
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      case 'age-asc':
        return (parseInt(a.age) || 0) - (parseInt(b.age) || 0);
      case 'age-desc':
        return (parseInt(b.age) || 0) - (parseInt(a.age) || 0);
      case 'name':
        const aName = a.display_name || a.username || '';
        const bName = b.display_name || b.username || '';
        return aName.localeCompare(bName);
      default:
        return 0;
    }
  });

  // Take only first 18 for display
  const displayEscorts = sortedEscorts.slice(0, 18);

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
      <div className="relative flex-1 flex flex-col z-10 py-0 sm:py-8">
        {/* Main Hero Content - Top section with no mobile padding */}
        <div className="flex-none text-center px-0 sm:px-6 lg:px-8 pt-4 sm:pt-16 pb-2 sm:pb-8">
          <h1 className={`text-3xl sm:text-5xl md:text-6xl font-bold text-white mb-2 sm:mb-4 transition-all duration-700 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}>
            Discover Elite Companionship
          </h1>
          <p className={`text-base sm:text-xl text-gray-100 max-w-3xl mx-auto mb-3 sm:mb-6 px-2 sm:px-0 transition-all duration-700 delay-100 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}>
            Connect with sophisticated escorts worldwide through our premium directory
          </p>
          
          {/* CTA Buttons */}
          <div className={`flex flex-col sm:flex-row gap-2 sm:gap-4 justify-center px-2 sm:px-0 transition-all duration-700 delay-200 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}>
            <Link to="/directory">
              <Button variant="outline" className="text-white border-white bg-zinc-500 hover:bg-zinc-400 text-sm sm:text-base px-4 py-2 sm:px-6 sm:py-3">
                Browse Escorts
              </Button>
            </Link>
            <Link to="/auth?tab=signup">
              <Button variant="outline" className="text-gold border-gold hover:bg-gold/20 text-sm sm:text-base px-4 py-2 sm:px-6 sm:py-3">
                List Your Profile
              </Button>
            </Link>
          </div>
        </div>

        {/* Featured Escorts Grid - Bottom section with no mobile padding */}
        {!loading && featuredEscorts.length > 0 && (
          <div className={`flex-1 flex flex-col justify-end px-0 sm:px-6 lg:px-8 pb-2 sm:pb-8 transition-all duration-700 delay-300 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}>
            <div className="max-w-7xl mx-auto w-full">
              <div className="flex items-center justify-between mb-3 sm:mb-6 px-2 sm:px-0">
                <h2 className="text-lg sm:text-2xl font-bold text-white">
                  Featured Escorts
                </h2>
                
                {/* Search and Filter Controls - Mobile Only */}
                <div className="flex items-center gap-2 md:hidden">
                  {/* Search Input */}
                  <div className="relative">
                    <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-white/70" />
                    <Input 
                      type="text" 
                      placeholder="Search..."
                      className="pl-8 w-32 sm:w-48 bg-white/20 border-white/30 text-white placeholder:text-white/70 text-sm"
                      value={filters.searchQuery}
                      onChange={(e) => setFilters({ ...filters, searchQuery: e.target.value })}
                    />
                  </div>
                  
                  {/* Filter Button */}
                  <FilterSheet onFilterChange={setFilters} filters={filters} />
                </div>
              </div>
              
              {/* Desktop Search Bar */}
              <div className="hidden md:flex items-center gap-4 mb-4 px-2 sm:px-0">
                <div className="relative flex-1 max-w-md">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-white/70" />
                  <Input 
                    type="text" 
                    placeholder="Search escorts..."
                    className="pl-10 bg-white/20 border-white/30 text-white placeholder:text-white/70"
                    value={filters.searchQuery}
                    onChange={(e) => setFilters({ ...filters, searchQuery: e.target.value })}
                  />
                </div>
              </div>

              {/* Desktop Filters */}
              <div className="px-2 sm:px-0">
                <DesktopFilters onFilterChange={setFilters} filters={filters} />
              </div>
              
              {/* Results count */}
              <div className="text-center mb-2 px-2 sm:px-0">
                <p className="text-sm text-white/80">
                  {displayEscorts.length} of {sortedEscorts.length} featured escorts
                </p>
              </div>
              
              {/* 3 Rows Grid Layout */}
              <div className="space-y-2 sm:space-y-3 px-1 sm:px-0">
                {displayEscorts.length > 0 ? (
                  <>
                    {/* Row 1 */}
                    <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2">
                      {displayEscorts.slice(0, 6).map((escort) => (
                        <EscortCard key={escort.id} escort={escort} />
                      ))}
                    </div>
                    
                    {/* Row 2 */}
                    {displayEscorts.length > 6 && (
                      <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2">
                        {displayEscorts.slice(6, 12).map((escort) => (
                          <EscortCard key={escort.id} escort={escort} />
                        ))}
                      </div>
                    )}
                    
                    {/* Row 3 */}
                    {displayEscorts.length > 12 && (
                      <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2">
                        {displayEscorts.slice(12, 18).map((escort) => (
                          <EscortCard key={escort.id} escort={escort} />
                        ))}
                      </div>
                    )}
                  </>
                ) : (
                  <div className="text-center py-8">
                    <p className="text-white/80">No escorts match your current filters</p>
                    <Button 
                      onClick={() => setFilters({
                        location: '',
                        ethnicity: '',
                        body_type: '',
                        searchQuery: '',
                        sortBy: 'featured'
                      })}
                      variant="outline"
                      className="mt-2 bg-white/20 text-white border-white/30 hover:bg-white/30"
                      size="sm"
                    >
                      Reset Filters
                    </Button>
                  </div>
                )}
              </div>
              
              <div className="text-center mt-3 sm:mt-6 px-2 sm:px-0">
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
