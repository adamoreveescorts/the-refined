import { useState, useEffect, useRef } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import NavBar from '@/components/NavBar';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Check, Search, Filter, Star, X } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';

const EscortCard = ({ escort, index }: { escort: any, index: number }) => {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, index * 100); // Stagger animation by 100ms per card

    return () => clearTimeout(timer);
  }, [index]);

  // Parse rates to get hourly rate if available
  const getHourlyRate = () => {
    if (!escort.rates) return 'Rates available';
    
    // Try to extract hourly rate from the rates string
    const hourlyMatch = escort.rates.match(/\$(\d+)\/hour/);
    if (hourlyMatch) {
      return `$${hourlyMatch[1]}/hour`;
    }
    
    return 'Rates available';
  };

  return (
    <div className={`group relative bg-card rounded-lg overflow-hidden shadow-md card-hover transition-all duration-500 ${
      isVisible ? 'animate-fade-in opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
    }`}>
      <Link to={`/profile/${escort.id}`}>
        <div className="aspect-[3/4] relative overflow-hidden">
          {!imageLoaded && (
            <Skeleton className="w-full h-full absolute inset-0" />
          )}
          <img 
            src={escort.profile_picture || "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3"} 
            alt={escort.display_name || escort.username} 
            className={`w-full h-full object-cover transition-all duration-500 group-hover:scale-105 ${
              imageLoaded ? 'opacity-100' : 'opacity-0'
            }`}
            onLoad={() => setImageLoaded(true)}
            loading="lazy"
          />
          
          {/* Featured badge */}
          {escort.featured && (
            <div className="absolute bottom-2 left-2">
              <Badge variant="secondary" className="bg-secondary text-secondary-foreground">Featured</Badge>
            </div>
          )}
        </div>
        
        <div className="p-4">
          <div className="flex items-center justify-between">
            <h3 className="font-medium text-lg text-foreground">
              {escort.display_name || escort.username || 'Anonymous'}{escort.age && `, ${escort.age}`}
            </h3>
            <div className="flex items-center">
              <Star className="h-4 w-4 text-secondary fill-secondary mr-1" />
              <span className="text-sm font-medium text-foreground">{escort.rating?.toFixed(1) || '4.5'}</span>
            </div>
          </div>
          
          <div className="flex items-center mt-1 text-sm text-muted-foreground">
            <span>{escort.location || 'Location not specified'}</span>
            {escort.verified && (
              <Badge variant="outline" className="ml-2 flex items-center border-green-500 text-green-400 text-xs">
                <Check className="h-3 w-3 mr-1" />
                Verified
              </Badge>
            )}
          </div>
          
          <div className="mt-2 flex flex-wrap gap-1">
            {escort.ethnicity && (
              <Badge variant="secondary" className="bg-muted text-muted-foreground text-xs">
                {escort.ethnicity}
              </Badge>
            )}
            {escort.body_type && (
              <Badge variant="secondary" className="bg-muted text-muted-foreground text-xs">
                {escort.body_type}
              </Badge>
            )}
          </div>
          
          <div className="mt-4 pt-2 border-t border-border flex items-center justify-between">
            <span className="text-secondary font-medium">
              {getHourlyRate()}
            </span>
            <Button size="sm" variant="link" className="text-foreground">View Profile</Button>
          </div>
        </div>
      </Link>
    </div>
  );
};

const FilterSidebar = ({ onFilterChange, filters }: { onFilterChange: any, filters: any }) => {
  const [isVisible, setIsVisible] = useState(false);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, 200);

    return () => clearTimeout(timer);
  }, []);

  const handleFilterChange = (newFilters: any) => {
    // Store current scroll position
    const currentScrollTop = scrollContainerRef.current?.scrollTop || 0;
    
    onFilterChange(newFilters);
    
    // Restore scroll position after a brief delay to allow for re-render
    setTimeout(() => {
      if (scrollContainerRef.current) {
        scrollContainerRef.current.scrollTop = currentScrollTop;
      }
    }, 0);
  };

  const FilterContent = () => (
    <div 
      ref={scrollContainerRef}
      className={`bg-card rounded-lg shadow-md p-4 sticky top-20 transition-all duration-500 max-h-[80vh] overflow-y-auto ${
        isVisible ? 'animate-fade-in opacity-100 translate-x-0' : 'opacity-0 -translate-x-4'
      }`}
    >
      <h3 className="font-medium text-lg mb-4 text-foreground">Filters</h3>
      
      {/* Location */}
      <div className="mb-6">
        <label className="block text-sm font-medium mb-2 text-foreground">Location</label>
        <Input 
          type="text" 
          placeholder="Enter city or region"
          value={filters.location || ''}
          onChange={(e) => handleFilterChange({ ...filters, location: e.target.value })}
          className="bg-background border-border text-foreground"
        />
      </div>
      
      {/* Ethnicity */}
      <div className="mb-6">
        <label className="block text-sm font-medium mb-2 text-foreground">Ethnicity</label>
        <Select value={filters.ethnicity || 'all'} onValueChange={(value) => handleFilterChange({ ...filters, ethnicity: value === 'all' ? '' : value })}>
          <SelectTrigger>
            <SelectValue placeholder="Select ethnicity" />
          </SelectTrigger>
          <SelectContent>
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

      {/* Nationality */}
      <div className="mb-6">
        <label className="block text-sm font-medium mb-2 text-foreground">Nationality</label>
        <Select value={filters.nationality || 'all'} onValueChange={(value) => handleFilterChange({ ...filters, nationality: value === 'all' ? '' : value })}>
          <SelectTrigger>
            <SelectValue placeholder="Select nationality" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All</SelectItem>
            <SelectItem value="American">American</SelectItem>
            <SelectItem value="British">British</SelectItem>
            <SelectItem value="Canadian">Canadian</SelectItem>
            <SelectItem value="Australian">Australian</SelectItem>
            <SelectItem value="French">French</SelectItem>
            <SelectItem value="German">German</SelectItem>
            <SelectItem value="Italian">Italian</SelectItem>
            <SelectItem value="Spanish">Spanish</SelectItem>
            <SelectItem value="Russian">Russian</SelectItem>
            <SelectItem value="Brazilian">Brazilian</SelectItem>
            <SelectItem value="Japanese">Japanese</SelectItem>
            <SelectItem value="Chinese">Chinese</SelectItem>
            <SelectItem value="Korean">Korean</SelectItem>
            <SelectItem value="Thai">Thai</SelectItem>
            <SelectItem value="Indian">Indian</SelectItem>
            <SelectItem value="Other">Other</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Body Type */}
      <div className="mb-6">
        <label className="block text-sm font-medium mb-2 text-foreground">Body Type</label>
        <Select value={filters.body_type || 'all'} onValueChange={(value) => handleFilterChange({ ...filters, body_type: value === 'all' ? '' : value })}>
          <SelectTrigger>
            <SelectValue placeholder="Select body type" />
          </SelectTrigger>
          <SelectContent>
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

      {/* Hair Color */}
      <div className="mb-6">
        <label className="block text-sm font-medium mb-2 text-foreground">Hair Color</label>
        <Select value={filters.hair_color || 'all'} onValueChange={(value) => handleFilterChange({ ...filters, hair_color: value === 'all' ? '' : value })}>
          <SelectTrigger>
            <SelectValue placeholder="Select hair color" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All</SelectItem>
            <SelectItem value="Blonde">Blonde</SelectItem>
            <SelectItem value="Brunette">Brunette</SelectItem>
            <SelectItem value="Black">Black</SelectItem>
            <SelectItem value="Red">Red</SelectItem>
            <SelectItem value="Auburn">Auburn</SelectItem>
            <SelectItem value="Grey">Grey</SelectItem>
            <SelectItem value="Other">Other</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Eye Color */}
      <div className="mb-6">
        <label className="block text-sm font-medium mb-2 text-foreground">Eye Color</label>
        <Select value={filters.eye_color || 'all'} onValueChange={(value) => handleFilterChange({ ...filters, eye_color: value === 'all' ? '' : value })}>
          <SelectTrigger>
            <SelectValue placeholder="Select eye color" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All</SelectItem>
            <SelectItem value="Blue">Blue</SelectItem>
            <SelectItem value="Brown">Brown</SelectItem>
            <SelectItem value="Green">Green</SelectItem>
            <SelectItem value="Hazel">Hazel</SelectItem>
            <SelectItem value="Grey">Grey</SelectItem>
            <SelectItem value="Other">Other</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Cup Size */}
      <div className="mb-6">
        <label className="block text-sm font-medium mb-2 text-foreground">Cup Size</label>
        <Select value={filters.cup_size || 'all'} onValueChange={(value) => handleFilterChange({ ...filters, cup_size: value === 'all' ? '' : value })}>
          <SelectTrigger>
            <SelectValue placeholder="Select cup size" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All</SelectItem>
            <SelectItem value="A">A</SelectItem>
            <SelectItem value="B">B</SelectItem>
            <SelectItem value="C">C</SelectItem>
            <SelectItem value="D">D</SelectItem>
            <SelectItem value="DD">DD</SelectItem>
            <SelectItem value="E">E</SelectItem>
            <SelectItem value="F">F+</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Smoking */}
      <div className="mb-6">
        <label className="block text-sm font-medium mb-2 text-foreground">Smoking</label>
        <Select value={filters.smoking || 'all'} onValueChange={(value) => handleFilterChange({ ...filters, smoking: value === 'all' ? '' : value })}>
          <SelectTrigger>
            <SelectValue placeholder="Select smoking preference" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All</SelectItem>
            <SelectItem value="Yes">Yes</SelectItem>
            <SelectItem value="No">No</SelectItem>
            <SelectItem value="Socially">Socially</SelectItem>
            <SelectItem value="Occasionally">Occasionally</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Drinking */}
      <div className="mb-6">
        <label className="block text-sm font-medium mb-2 text-foreground">Drinking</label>
        <Select value={filters.drinking || 'all'} onValueChange={(value) => handleFilterChange({ ...filters, drinking: value === 'all' ? '' : value })}>
          <SelectTrigger>
            <SelectValue placeholder="Select drinking preference" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All</SelectItem>
            <SelectItem value="Yes">Yes</SelectItem>
            <SelectItem value="No">No</SelectItem>
            <SelectItem value="Socially">Socially</SelectItem>
            <SelectItem value="Occasionally">Occasionally</SelectItem>
          </SelectContent>
        </Select>
      </div>
      
      {/* Age Range */}
      <div className="mb-6">
        <label className="block text-sm font-medium mb-2 text-foreground">Age Range</label>
        <div className="grid grid-cols-2 gap-2">
          <Select value={filters.ageMin?.toString() || 'all'} onValueChange={(value) => handleFilterChange({ ...filters, ageMin: value === 'all' ? null : parseInt(value) })}>
            <SelectTrigger>
              <SelectValue placeholder="Min" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Any</SelectItem>
              {Array.from({ length: 43 }, (_, i) => i + 18).map(age => (
                <SelectItem key={age} value={age.toString()}>{age}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={filters.ageMax?.toString() || 'all'} onValueChange={(value) => handleFilterChange({ ...filters, ageMax: value === 'all' ? null : parseInt(value) })}>
            <SelectTrigger>
              <SelectValue placeholder="Max" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Any</SelectItem>
              {Array.from({ length: 43 }, (_, i) => i + 18).map(age => (
                <SelectItem key={age} value={age.toString()}>{age}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Height Range */}
      <div className="mb-6">
        <label className="block text-sm font-medium mb-2 text-foreground">Height Range (cm)</label>
        <div className="grid grid-cols-2 gap-2">
          <Select value={filters.heightMin?.toString() || 'all'} onValueChange={(value) => handleFilterChange({ ...filters, heightMin: value === 'all' ? null : parseInt(value) })}>
            <SelectTrigger>
              <SelectValue placeholder="Min" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Any</SelectItem>
              {Array.from({ length: 13 }, (_, i) => (i * 5) + 140).map(height => (
                <SelectItem key={height} value={height.toString()}>{height}cm</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={filters.heightMax?.toString() || 'all'} onValueChange={(value) => handleFilterChange({ ...filters, heightMax: value === 'all' ? null : parseInt(value) })}>
            <SelectTrigger>
              <SelectValue placeholder="Max" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Any</SelectItem>
              {Array.from({ length: 13 }, (_, i) => (i * 5) + 140).map(height => (
                <SelectItem key={height} value={height.toString()}>{height}cm</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Weight Range */}
      <div className="mb-6">
        <label className="block text-sm font-medium mb-2 text-foreground">Weight Range (kg)</label>
        <div className="grid grid-cols-2 gap-2">
          <Select value={filters.weightMin?.toString() || 'all'} onValueChange={(value) => handleFilterChange({ ...filters, weightMin: value === 'all' ? null : parseInt(value) })}>
            <SelectTrigger>
              <SelectValue placeholder="Min" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Any</SelectItem>
              {Array.from({ length: 18 }, (_, i) => (i * 5) + 35).map(weight => (
                <SelectItem key={weight} value={weight.toString()}>{weight}kg</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={filters.weightMax?.toString() || 'all'} onValueChange={(value) => handleFilterChange({ ...filters, weightMax: value === 'all' ? null : parseInt(value) })}>
            <SelectTrigger>
              <SelectValue placeholder="Max" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Any</SelectItem>
              {Array.from({ length: 18 }, (_, i) => (i * 5) + 35).map(weight => (
                <SelectItem key={weight} value={weight.toString()}>{weight}kg</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
      
      {/* Price Range */}
      <div className="mb-6">
        <label className="block text-sm font-medium mb-2 text-foreground">Price Range ($)</label>
        <div className="grid grid-cols-2 gap-2">
          <Select value={filters.priceMin?.toString() || 'all'} onValueChange={(value) => handleFilterChange({ ...filters, priceMin: value === 'all' ? null : parseInt(value) })}>
            <SelectTrigger>
              <SelectValue placeholder="Min" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Any</SelectItem>
              {[100, 150, 200, 250, 300, 400, 500, 600, 700, 800, 900, 1000, 1200, 1500, 2000].map(price => (
                <SelectItem key={price} value={price.toString()}>${price}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={filters.priceMax?.toString() || 'all'} onValueChange={(value) => handleFilterChange({ ...filters, priceMax: value === 'all' ? null : parseInt(value) })}>
            <SelectTrigger>
              <SelectValue placeholder="Max" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Any</SelectItem>
              {[100, 150, 200, 250, 300, 400, 500, 600, 700, 800, 900, 1000, 1200, 1500, 2000].map(price => (
                <SelectItem key={price} value={price.toString()}>${price}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
      
      {/* Services */}
      <div className="mb-6">
        <label className="block text-sm font-medium mb-2 text-foreground">Services</label>
        <div className="space-y-2">
          {['Dinner Date', 'Travel Companion', 'Event Escort', 'Overnight', 'GFE', 'PSE', 'Massage'].map((service) => (
            <div key={service} className="flex items-center">
              <Checkbox 
                id={`service-${service}`}
                checked={filters.services?.includes(service)}
                onCheckedChange={(checked) => {
                  const services = filters.services || [];
                  const newServices = checked === true
                    ? [...services, service]
                    : services.filter((s: string) => s !== service);
                  handleFilterChange({ ...filters, services: newServices });
                }}
              />
              <label 
                htmlFor={`service-${service}`} 
                className="ml-2 text-sm text-foreground"
              >
                {service}
              </label>
            </div>
          ))}
        </div>
      </div>

      {/* Languages */}
      <div className="mb-6">
        <label className="block text-sm font-medium mb-2 text-foreground">Languages</label>
        <div className="space-y-2">
          {['English', 'Spanish', 'French', 'German', 'Italian', 'Portuguese', 'Russian', 'Japanese', 'Chinese', 'Arabic'].map((language) => (
            <div key={language} className="flex items-center">
              <Checkbox 
                id={`language-${language}`}
                checked={filters.languages?.includes(language)}
                onCheckedChange={(checked) => {
                  const languages = filters.languages || [];
                  const newLanguages = checked === true
                    ? [...languages, language]
                    : languages.filter((l: string) => l !== language);
                  handleFilterChange({ ...filters, languages: newLanguages });
                }}
              />
              <label 
                htmlFor={`language-${language}`} 
                className="ml-2 text-sm text-foreground"
              >
                {language}
              </label>
            </div>
          ))}
        </div>
      </div>

      {/* Additional Attributes */}
      <div className="mb-6">
        <label className="block text-sm font-medium mb-2 text-foreground">Additional</label>
        <div className="space-y-2">
          <div className="flex items-center">
            <Checkbox 
              id="verified"
              checked={filters.verifiedOnly}
              onCheckedChange={(checked) => handleFilterChange({ ...filters, verifiedOnly: checked === true })}
            />
            <label htmlFor="verified" className="ml-2 text-sm text-foreground">Verified Only</label>
          </div>
          <div className="flex items-center">
            <Checkbox 
              id="featured"
              checked={filters.featuredOnly}
              onCheckedChange={(checked) => handleFilterChange({ ...filters, featuredOnly: checked === true })}
            />
            <label htmlFor="featured" className="ml-2 text-sm text-foreground">Featured Only</label>
          </div>
          <div className="flex items-center">
            <Checkbox 
              id="tattoos"
              checked={filters.tattoos}
              onCheckedChange={(checked) => handleFilterChange({ ...filters, tattoos: checked === true })}
            />
            <label htmlFor="tattoos" className="ml-2 text-sm text-foreground">Has Tattoos</label>
          </div>
          <div className="flex items-center">
            <Checkbox 
              id="piercings"
              checked={filters.piercings}
              onCheckedChange={(checked) => handleFilterChange({ ...filters, piercings: checked === true })}
            />
            <label htmlFor="piercings" className="ml-2 text-sm text-foreground">Has Piercings</label>
          </div>
          <div className="flex items-center">
            <Checkbox 
              id="activeToday"
              checked={filters.activeToday}
              onCheckedChange={(checked) => handleFilterChange({ ...filters, activeToday: checked === true })}
            />
            <label htmlFor="activeToday" className="ml-2 text-sm text-foreground">Active Today</label>
          </div>
        </div>
      </div>
      
      <Button 
        className="w-full btn-gold"
        onClick={() => handleFilterChange({ 
          location: '',
          ethnicity: '',
          nationality: '',
          body_type: '',
          hair_color: '',
          eye_color: '',
          cup_size: '',
          smoking: '',
          drinking: '',
          ageMin: null,
          ageMax: null,
          heightMin: null,
          heightMax: null,
          weightMin: null,
          weightMax: null,
          priceMin: null,
          priceMax: null,
          services: [],
          languages: [],
          verifiedOnly: false,
          featuredOnly: false,
          tattoos: false,
          piercings: false,
          activeToday: false,
          searchQuery: ''
        })}
      >
        Reset Filters
      </Button>
    </div>
  );

  const isMobile = useIsMobile();

  if (isMobile) {
    return (
      <Sheet>
        <SheetTrigger asChild>
          <Button 
            variant="outline"
            className="w-full flex items-center justify-center gap-2 mb-4"
          >
            <Filter className="h-4 w-4" />
            Show Filters
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="w-full sm:max-w-md">
          <SheetHeader>
            <SheetTitle>Filter Escorts</SheetTitle>
          </SheetHeader>
          <div className="mt-4">
            <FilterContent />
          </div>
        </SheetContent>
      </Sheet>
    );
  }

  return <FilterContent />;
};

const Directory = () => {
  const [searchParams] = useSearchParams();
  const initialLocation = searchParams.get('location') || '';
  
  const [escorts, setEscorts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [headerVisible, setHeaderVisible] = useState(false);
  const [searchVisible, setSearchVisible] = useState(false);
  const [filters, setFilters] = useState({
    location: initialLocation,
    ethnicity: '',
    nationality: '',
    body_type: '',
    hair_color: '',
    eye_color: '',
    cup_size: '',
    smoking: '',
    drinking: '',
    ageMin: null,
    ageMax: null,
    heightMin: null,
    heightMax: null,
    weightMin: null,
    weightMax: null,
    priceMin: null,
    priceMax: null,
    services: [],
    languages: [],
    verifiedOnly: false,
    featuredOnly: false,
    tattoos: false,
    piercings: false,
    activeToday: false,
    searchQuery: ''
  });
  
  const [sortBy, setSortBy] = useState('featured');
  const itemsPerPage = 28;

  useEffect(() => {
    const timer1 = setTimeout(() => setHeaderVisible(true), 100);
    const timer2 = setTimeout(() => setSearchVisible(true), 300);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
    };
  }, []);

  // Function to scroll to top
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Function to handle page changes
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    scrollToTop();
  };

  useEffect(() => {
    fetchEscorts();
  }, []);

  const fetchEscorts = async () => {
    try {
      setLoading(true);
      // Simplified visibility: only require profile picture
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .in('role', ['escort', 'agency'])
        .not('profile_picture', 'is', null)
        .neq('profile_picture', '')
        .order('featured', { ascending: false })
        .order('created_at', { ascending: false });

      if (error) throw error;
      console.log('Fetched escorts:', data?.length || 0);
      setEscorts(data || []);
    } catch (error) {
      console.error('Error fetching escorts:', error);
      toast.error('Error loading escorts');
    } finally {
      setLoading(false);
    }
  };
  
  // Apply filters to escorts
  const filteredEscorts = escorts.filter(escort => {
    if (filters.location && !escort.location?.toLowerCase().includes(filters.location.toLowerCase())) {
      return false;
    }
    
    if (filters.ethnicity && escort.ethnicity !== filters.ethnicity) {
      return false;
    }

    if (filters.nationality && escort.nationality !== filters.nationality) {
      return false;
    }
    
    if (filters.body_type && escort.body_type !== filters.body_type) {
      return false;
    }
    
    if (filters.hair_color && escort.hair_color !== filters.hair_color) {
      return false;
    }
    
    if (filters.eye_color && escort.eye_color !== filters.eye_color) {
      return false;
    }
    
    if (filters.cup_size && escort.cup_size !== filters.cup_size) {
      return false;
    }

    if (filters.smoking && escort.smoking !== filters.smoking) {
      return false;
    }

    if (filters.drinking && escort.drinking !== filters.drinking) {
      return false;
    }

    // Age range filtering - only apply if values are set
    if (filters.ageMin !== null || filters.ageMax !== null) {
      const escortAge = escort.age ? parseInt(escort.age.toString()) : null;
      if (escortAge !== null && !isNaN(escortAge)) {
        if (filters.ageMin !== null && escortAge < filters.ageMin) {
          return false;
        }
        if (filters.ageMax !== null && escortAge > filters.ageMax) {
          return false;
        }
      }
    }

    // Height range filtering - only apply if values are set
    if (filters.heightMin !== null || filters.heightMax !== null) {
      let escortHeight = null;
      
      if (escort.height) {
        const heightStr = escort.height.toString();
        // Try to parse as cm first
        if (heightStr.includes('cm')) {
          escortHeight = parseInt(heightStr.replace(/\D/g, ''));
        } else if (heightStr.includes("'") || heightStr.includes('"')) {
          // Parse feet and inches format like 5'6" or 5'6
          const feetMatch = heightStr.match(/(\d+)'/);
          const inchMatch = heightStr.match(/(\d+)"/);
          if (feetMatch) {
            const feet = parseInt(feetMatch[1]);
            const inches = inchMatch ? parseInt(inchMatch[1]) : 0;
            escortHeight = Math.round((feet * 12 + inches) * 2.54); // Convert to cm
          }
        } else {
          // Try direct parsing as number (assume cm)
          escortHeight = parseInt(heightStr);
        }
      }
      
      if (escortHeight !== null && !isNaN(escortHeight)) {
        if (filters.heightMin !== null && escortHeight < filters.heightMin) {
          return false;
        }
        if (filters.heightMax !== null && escortHeight > filters.heightMax) {
          return false;
        }
      }
    }

    // Weight range filtering - only apply if values are set
    if (filters.weightMin !== null || filters.weightMax !== null) {
      let escortWeight = null;
      
      if (escort.weight) {
        const weightStr = escort.weight.toString();
        // Remove "kg" and other non-numeric characters, then parse
        escortWeight = parseInt(weightStr.replace(/\D/g, ''));
      }
      
      if (escortWeight !== null && !isNaN(escortWeight)) {
        if (filters.weightMin !== null && escortWeight < filters.weightMin) {
          return false;
        }
        if (filters.weightMax !== null && escortWeight > filters.weightMax) {
          return false;
        }
      }
    }

    // Price range filtering - only apply if values are set
    if (filters.priceMin !== null || filters.priceMax !== null) {
      let escortPrice = null;
      
      // Try to get price from hourly_rate first
      if (escort.hourly_rate) {
        escortPrice = parseInt(escort.hourly_rate.toString().replace(/\D/g, ''));
      }
      
      // If no hourly_rate, try to extract from rates field
      if (!escortPrice && escort.rates) {
        const hourlyMatch = escort.rates.match(/\$?(\d+)(?:\/hour|\/hr|per hour)/i);
        if (hourlyMatch) {
          escortPrice = parseInt(hourlyMatch[1]);
        }
      }
      
      if (escortPrice !== null && !isNaN(escortPrice)) {
        if (filters.priceMin !== null && escortPrice < filters.priceMin) {
          return false;
        }
        if (filters.priceMax !== null && escortPrice > filters.priceMax) {
          return false;
        }
      }
    }
    
    if (filters.verifiedOnly && !escort.verified) {
      return false;
    }

    if (filters.featuredOnly && !escort.featured) {
      return false;
    }
    
    if (filters.tattoos && !escort.tattoos) {
      return false;
    }
    
    if (filters.piercings && !escort.piercings) {
      return false;
    }

    if (filters.activeToday) {
      const today = new Date();
      const lastActive = new Date(escort.last_active);
      const diffTime = Math.abs(today.getTime() - lastActive.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      if (diffDays > 1) {
        return false;
      }
    }

    // Filter by services
    if (filters.services && filters.services.length > 0) {
      const escortServices = escort.services?.toLowerCase() || '';
      const hasService = filters.services.some((service: string) => 
        escortServices.includes(service.toLowerCase())
      );
      if (!hasService) {
        return false;
      }
    }

    // Filter by languages
    if (filters.languages && filters.languages.length > 0) {
      const escortLanguages = escort.languages?.toLowerCase() || '';
      const hasLanguage = filters.languages.some((language: string) => 
        escortLanguages.includes(language.toLowerCase())
      );
      if (!hasLanguage) {
        return false;
      }
    }
    
    if (filters.searchQuery) {
      const query = filters.searchQuery.toLowerCase();
      return (
        escort.display_name?.toLowerCase().includes(query) ||
        escort.username?.toLowerCase().includes(query) ||
        escort.location?.toLowerCase().includes(query) ||
        escort.services?.toLowerCase().includes(query) ||
        escort.ethnicity?.toLowerCase().includes(query) ||
        escort.body_type?.toLowerCase().includes(query) ||
        escort.nationality?.toLowerCase().includes(query)
      );
    }
    
    return true;
  };
  
  // Sort escorts
  const sortedEscorts = [...filteredEscorts].sort((a, b) => {
    switch (sortBy) {
      case 'featured':
        if (a.featured && !b.featured) return -1;
        if (!a.featured && b.featured) return 1;
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      case 'rating':
        return (b.rating || 0) - (a.rating || 0);
      case 'newest':
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      // ... keep existing code (other sort options) the same ...
      default:
        return 0;
    }
  });

  // Pagination calculations
  const totalPages = Math.ceil(sortedEscorts.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentEscorts = sortedEscorts.slice(startIndex, endIndex);

  // Reset to first page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [filters, sortBy]);

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <NavBar />
        <main className="flex-grow py-8">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-center py-20">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-secondary"></div>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }
  
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <NavBar />
      
      {/* Page Content */}
      <main className="flex-grow py-8">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <header className={`mb-8 transition-all duration-500 ${
            headerVisible ? 'animate-fade-in opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
          }`}>
            <h1 className="text-3xl sm:text-4xl font-bold text-foreground">Escort Directory</h1>
            <p className="text-muted-foreground mt-2">
              Discover premium companions tailored to your preferences
            </p>
          </header>
          
          {/* Search Bar */}
          <div className={`mb-8 flex items-center bg-card rounded-lg shadow-sm p-2 max-w-2xl transition-all duration-500 ${
            searchVisible ? 'animate-fade-in opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
          }`}>
            <Search className="h-5 w-5 text-muted-foreground mx-2" />
            <Input 
              type="text" 
              placeholder="Search by name, location, ethnicity, service, or nationality..."
              className="flex-1 border-0 focus-visible:ring-0 focus-visible:ring-transparent bg-card text-foreground"
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
                <p className="text-sm text-muted-foreground">
                  {filteredEscorts.length} escorts found - Page {currentPage} of {totalPages}
                </p>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">Sort by:</span>
                  <Select value={sortBy} onValueChange={setSortBy}>
                    <SelectTrigger className="w-48">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="featured">Featured</SelectItem>
                      <SelectItem value="rating">Highest Rated</SelectItem>
                      <SelectItem value="newest">Newest</SelectItem>
                      <SelectItem value="last-active">Recently Active</SelectItem>
                      <SelectItem value="view-count">Most Viewed</SelectItem>
                      <SelectItem value="name">Name A-Z</SelectItem>
                      <SelectItem value="age-asc">Age (Youngest)</SelectItem>
                      <SelectItem value="age-desc">Age (Oldest)</SelectItem>
                      <SelectItem value="price-asc">Price (Low to High)</SelectItem>
                      <SelectItem value="price-desc">Price (High to Low)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              {currentEscorts.length > 0 ? (
                <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {currentEscorts.map((escort, index) => (
                    <EscortCard key={escort.id} escort={escort} index={index} />
                  ))}
                </div>
              ) : (
                <div className="bg-card rounded-lg p-8 text-center animate-fade-in">
                  <h3 className="text-lg font-medium mb-2 text-foreground">No escorts found</h3>
                  <p className="text-muted-foreground">Try adjusting your filters or search query</p>
                </div>
              )}
              
              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex justify-center mt-10">
                  <Pagination>
                    <PaginationContent>
                      <PaginationItem>
                        <PaginationPrevious 
                          onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
                          className={currentPage === 1 ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                        />
                      </PaginationItem>
                      
                      {/* Show first page */}
                      {currentPage > 3 && (
                        <>
                          <PaginationItem>
                            <PaginationLink onClick={() => handlePageChange(1)} className="cursor-pointer">
                              1
                            </PaginationLink>
                          </PaginationItem>
                          {currentPage > 4 && (
                            <PaginationItem>
                              <PaginationEllipsis />
                            </PaginationItem>
                          )}
                        </>
                      )}
                      
                      {/* Show current page and surrounding pages */}
                      {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                        const pageNumber = Math.max(1, Math.min(totalPages - 4, currentPage - 2)) + i;
                        if (pageNumber > totalPages) return null;
                        
                        return (
                          <PaginationItem key={pageNumber}>
                            <PaginationLink 
                              onClick={() => handlePageChange(pageNumber)}
                              isActive={currentPage === pageNumber}
                              className="cursor-pointer"
                            >
                              {pageNumber}
                            </PaginationLink>
                          </PaginationItem>
                        );
                      })}
                      
                      {/* Show last page */}
                      {currentPage < totalPages - 2 && (
                        <>
                          {currentPage < totalPages - 3 && (
                            <PaginationItem>
                              <PaginationEllipsis />
                            </PaginationItem>
                          )}
                          <PaginationItem>
                            <PaginationLink onClick={() => handlePageChange(totalPages)} className="cursor-pointer">
                              {totalPages}
                            </PaginationLink>
                          </PaginationItem>
                        </>
                      )}
                      
                      <PaginationItem>
                        <PaginationNext 
                          onClick={() => handlePageChange(Math.min(totalPages, currentPage + 1))}
                          className={currentPage === totalPages ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                        />
                      </PaginationItem>
                    </PaginationContent>
                  </Pagination>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default Directory;
