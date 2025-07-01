
import { Link } from 'react-router-dom';

const popularLocations = [
  // Australia
  "Sydney", "Melbourne", "Brisbane", "Perth", "Adelaide", 
  "Gold Coast", "Canberra", "Darwin", "Hobart", "Cairns",
  // Thailand
  "Bangkok", "Phuket"
];

const LocationsSection = () => {
  return (
    <section className="py-16 px-4 sm:px-6 lg:px-8 bg-gray-50">
      <div className="container mx-auto">
        <div className="text-center mb-10">
          <h2 className="text-3xl sm:text-4xl font-bold text-navy mb-4">Popular Locations</h2>
          <p className="text-charcoal max-w-2xl mx-auto">
            Find premium companions in Australia and Thailand
          </p>
        </div>
        
        <div className="flex flex-wrap justify-center gap-4">
          {popularLocations.map((location) => (
            <Link 
              key={location} 
              to={`/directory?location=${location}`}
              className="px-6 py-3 bg-white shadow-sm rounded-full text-navy hover:text-gold hover:shadow transition-all duration-300"
            >
              {location}
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
};

export default LocationsSection;
