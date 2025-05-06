
import { useState } from 'react';
import { useParams } from 'react-router-dom';
import NavBar from '@/components/NavBar';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Calendar, Check, Clock, Heart, MapPin, MessageSquare, Star, User } from 'lucide-react';

// Mock escort data
const mockEscort = {
  id: 1,
  name: "Sophia",
  age: 26,
  location: "New York",
  images: [
    "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3",
    "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3",
    "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3",
    "https://images.unsplash.com/photo-1541823709867-1b206113eafd?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3",
  ],
  verified: true,
  featured: true,
  rating: 4.9,
  reviews: 24,
  services: ["Dinner Date", "Travel Companion", "Event Escort"],
  gender: "Female",
  ethnicity: "Caucasian",
  height: 172,
  weight: "55kg",
  hairColor: "Blonde",
  eyeColor: "Blue",
  languages: ["English", "French"],
  rates: {
    hourly: 300,
    twoHours: 550,
    dinner: 800,
    overnight: 2000,
  },
  bio: `I am Sophia, a sophisticated and well-educated companion with a passion for art, culture, and stimulating conversation. My warm personality and genuine approach ensure our time together will be relaxed yet exhilarating.

With a background in fine arts and literature, I can be your perfect companion for gallery openings, theater performances, or simply an intimate dinner. I pride myself on my ability to adapt to any social situation with grace and poise.

I value genuine connections and prioritize quality experiences. My goal is to create memorable moments that leave a lasting impression. I am selective with whom I spend my time, valuing those who appreciate elegance and discretion.`,
  availability: {
    monday: ["evening"],
    tuesday: ["afternoon", "evening"],
    wednesday: ["afternoon", "evening"],
    thursday: ["evening"],
    friday: ["evening", "night"],
    saturday: ["afternoon", "evening", "night"],
    sunday: ["afternoon"]
  }
};

const ProfilePage = () => {
  const { id } = useParams();
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [isFavorite, setIsFavorite] = useState(false);
  
  const escort = mockEscort; // In a real app, you'd fetch data based on the ID
  
  return (
    <div className="min-h-screen flex flex-col">
      <NavBar />
      
      <main className="flex-grow bg-gray-50 py-8">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          {/* Back Button */}
          <div className="mb-6">
            <Button variant="outline" className="text-sm" onClick={() => window.history.back()}>
              ← Back to Directory
            </Button>
          </div>
          
          {/* Profile Content */}
          <div className="flex flex-col lg:flex-row gap-8">
            {/* Gallery Section */}
            <div className="lg:w-1/2 space-y-4">
              {/* Main Image */}
              <div className="relative rounded-lg overflow-hidden shadow-md aspect-[4/5]">
                <img 
                  src={escort.images[activeImageIndex]} 
                  alt={`${escort.name} profile`} 
                  className="w-full h-full object-cover"
                />
              </div>
              
              {/* Thumbnail Gallery */}
              <div className="flex gap-3 overflow-x-auto pb-2">
                {escort.images.map((image, index) => (
                  <button
                    key={index}
                    className={`flex-shrink-0 w-20 h-20 rounded-md overflow-hidden border-2 ${
                      index === activeImageIndex ? 'border-gold' : 'border-transparent'
                    }`}
                    onClick={() => setActiveImageIndex(index)}
                  >
                    <img src={image} alt={`${escort.name} thumbnail ${index + 1}`} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            </div>
            
            {/* Profile Info Section */}
            <div className="lg:w-1/2">
              {/* Header with Name and Actions */}
              <div className="flex justify-between items-start mb-4">
                <div>
                  <div className="flex items-center gap-2">
                    <h1 className="text-3xl font-serif font-bold text-navy">{escort.name}</h1>
                    {escort.verified && (
                      <Badge variant="outline" className="flex items-center border-green-500 text-green-600 text-xs">
                        <Check className="h-3 w-3 mr-1" />
                        Verified
                      </Badge>
                    )}
                  </div>
                  <div className="flex items-center gap-2 text-charcoal mt-1">
                    <span className="flex items-center">
                      <MapPin className="h-4 w-4 mr-1" />
                      {escort.location}
                    </span>
                    <span>•</span>
                    <span>{escort.age} years</span>
                  </div>
                </div>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  onClick={() => setIsFavorite(!isFavorite)}
                  className={`${isFavorite ? 'text-red-500 bg-red-50' : 'text-gray-400'} hover:bg-gray-100`}
                >
                  <Heart className={`h-5 w-5 ${isFavorite ? 'fill-red-500' : ''}`} />
                </Button>
              </div>
              
              {/* Rating */}
              <div className="flex items-center gap-2 mb-4">
                <div className="flex">
                  {[...Array(5)].map((_, i) => (
                    <Star 
                      key={i} 
                      className={`h-4 w-4 ${i < Math.floor(escort.rating) ? 'text-gold fill-gold' : 'text-gray-300'}`} 
                    />
                  ))}
                </div>
                <span className="font-medium">{escort.rating}</span>
                <span className="text-gray-500">({escort.reviews} reviews)</span>
              </div>
              
              <Tabs defaultValue="about" className="w-full">
                <TabsList className="grid grid-cols-3 mb-4">
                  <TabsTrigger value="about">About</TabsTrigger>
                  <TabsTrigger value="details">Details</TabsTrigger>
                  <TabsTrigger value="rates">Rates</TabsTrigger>
                </TabsList>
                
                <TabsContent value="about" className="space-y-4">
                  <div className="prose max-w-none">
                    <p className="text-charcoal whitespace-pre-line">{escort.bio}</p>
                  </div>
                </TabsContent>
                
                <TabsContent value="details">
                  <div className="grid grid-cols-2 gap-y-4 gap-x-8 mb-6">
                    <div>
                      <p className="text-sm text-gray-500">Gender</p>
                      <p className="font-medium">{escort.gender}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Ethnicity</p>
                      <p className="font-medium">{escort.ethnicity}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Height</p>
                      <p className="font-medium">{escort.height}cm</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Weight</p>
                      <p className="font-medium">{escort.weight}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Hair Color</p>
                      <p className="font-medium">{escort.hairColor}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Eye Color</p>
                      <p className="font-medium">{escort.eyeColor}</p>
                    </div>
                  </div>
                  
                  <Separator className="my-4" />
                  
                  <div className="mb-6">
                    <p className="text-sm text-gray-500 mb-2">Languages</p>
                    <div className="flex flex-wrap gap-2">
                      {escort.languages.map((language, index) => (
                        <Badge key={index} variant="outline">{language}</Badge>
                      ))}
                    </div>
                  </div>
                  
                  <div>
                    <p className="text-sm text-gray-500 mb-2">Services Offered</p>
                    <div className="flex flex-wrap gap-2">
                      {escort.services.map((service, index) => (
                        <Badge key={index} variant="secondary">{service}</Badge>
                      ))}
                    </div>
                  </div>
                </TabsContent>
                
                <TabsContent value="rates">
                  <Card>
                    <CardContent className="p-0">
                      <div className="divide-y">
                        <div className="flex justify-between items-center p-4">
                          <div className="flex items-center">
                            <Clock className="h-5 w-5 mr-2 text-gold" />
                            <span>1 Hour</span>
                          </div>
                          <span className="font-medium">${escort.rates.hourly}</span>
                        </div>
                        <div className="flex justify-between items-center p-4">
                          <div className="flex items-center">
                            <Clock className="h-5 w-5 mr-2 text-gold" />
                            <span>2 Hours</span>
                          </div>
                          <span className="font-medium">${escort.rates.twoHours}</span>
                        </div>
                        <div className="flex justify-between items-center p-4">
                          <div className="flex items-center">
                            <Calendar className="h-5 w-5 mr-2 text-gold" />
                            <span>Dinner Date</span>
                          </div>
                          <span className="font-medium">${escort.rates.dinner}</span>
                        </div>
                        <div className="flex justify-between items-center p-4">
                          <div className="flex items-center">
                            <Calendar className="h-5 w-5 mr-2 text-gold" />
                            <span>Overnight</span>
                          </div>
                          <span className="font-medium">${escort.rates.overnight}</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
              
              <div className="mt-6 flex flex-col gap-4">
                <Button className="btn-gold" size="lg">
                  <MessageSquare className="h-5 w-5 mr-2" />
                  Contact {escort.name}
                </Button>
                <Button variant="outline" size="lg">
                  <Calendar className="h-5 w-5 mr-2" />
                  Check Availability
                </Button>
              </div>
            </div>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default ProfilePage;
