import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import NavBar from '@/components/NavBar';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Calendar, Check, Clock, Heart, MapPin, Star, Mail, Phone } from 'lucide-react';
import { MessageButton } from '@/components/messaging/MessageButton';

interface RatesData {
  hourly?: string;
  twoHours?: string;
  dinner?: string;
  overnight?: string;
}

const ProfilePage = () => {
  const { id } = useParams();
  const [escort, setEscort] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [isFavorite, setIsFavorite] = useState(false);
  const [requestingContact, setRequestingContact] = useState<'email' | 'phone' | null>(null);

  useEffect(() => {
    const fetchProfile = async () => {
      if (!id) return;
      try {
        const {
          data,
          error
        } = await supabase.from('profiles').select('*').eq('id', id).eq('status', 'approved').eq('is_active', true).single();
        if (error) {
          console.error('Error fetching profile:', error);
          toast.error('Profile not found');
          return;
        }
        setEscort(data);

        // Increment view count
        await supabase.from('profiles').update({
          view_count: (data.view_count || 0) + 1
        }).eq('id', id);
      } catch (error) {
        console.error('Error:', error);
        toast.error('Error loading profile');
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, [id]);

  const handleContactRequest = async (type: 'email' | 'phone') => {
    setRequestingContact(type);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        toast.error('Please log in to request contact information');
        return;
      }

      // Get or create conversation
      let { data: conversation } = await supabase
        .from('conversations')
        .select('id')
        .eq('client_id', user.id)
        .eq('escort_id', escort.id)
        .single();

      if (!conversation) {
        const { data: newConversation, error } = await supabase
          .from('conversations')
          .insert({
            client_id: user.id,
            escort_id: escort.id
          })
          .select('id')
          .single();

        if (error) {
          console.error('Error creating conversation:', error);
          toast.error('Failed to send request');
          return;
        }
        conversation = newConversation;
      }

      // Send the contact request message
      const message = type === 'email' 
        ? `Hi ${escort.display_name || escort.username}, I would like to request your email address for further communication. Thank you!`
        : `Hi ${escort.display_name || escort.username}, I would like to request your phone number for further communication. Thank you!`;

      const { error } = await supabase
        .from('messages')
        .insert({
          conversation_id: conversation.id,
          sender_id: user.id,
          content: message
        });

      if (error) {
        console.error('Error sending contact request:', error);
        toast.error('Failed to send request');
        return;
      }

      toast.success(`${type === 'email' ? 'Email' : 'Phone number'} request sent successfully!`);
    } catch (error) {
      console.error('Error:', error);
      toast.error('Failed to send request');
    } finally {
      setRequestingContact(null);
    }
  };

  // Generate rating count based on rating and some randomness
  const generateRatingCount = (rating: number) => {
    const baseCount = Math.floor(rating * 20); // Higher ratings get more reviews
    const randomVariation = Math.floor(Math.random() * 15) + 5; // Add 5-20 random reviews
    return baseCount + randomVariation;
  };

  // Parse rates from text format like "$420/hour, $2100/overnight"
  const parseRatesFromText = (ratesText: string): RatesData => {
    if (!ratesText) return {};
    const rates: RatesData = {};

    // Extract hourly rate
    const hourlyMatch = ratesText.match(/\$(\d+)\/hour/i);
    if (hourlyMatch) {
      rates.hourly = hourlyMatch[1];
    }

    // Extract overnight rate
    const overnightMatch = ratesText.match(/\$(\d+)\/overnight/i);
    if (overnightMatch) {
      rates.overnight = overnightMatch[1];
    }

    // Extract dinner rate (if mentioned)
    const dinnerMatch = ratesText.match(/\$(\d+)\/dinner/i);
    if (dinnerMatch) {
      rates.dinner = dinnerMatch[1];
    }

    // Extract 2-hour rate (if mentioned)
    const twoHourMatch = ratesText.match(/\$(\d+)\/2\s*hours?/i);
    if (twoHourMatch) {
      rates.twoHours = twoHourMatch[1];
    }
    return rates;
  };

  if (loading) {
    return <div className="min-h-screen flex flex-col">
        <NavBar />
        <main className="flex-grow bg-gray-50 py-8 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gold mx-auto mb-4"></div>
            <p>Loading profile...</p>
          </div>
        </main>
        <Footer />
      </div>;
  }

  if (!escort) {
    return <div className="min-h-screen flex flex-col">
        <NavBar />
        <main className="flex-grow bg-gray-50 py-8 flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Profile Not Found</h1>
            <p className="text-gray-600 mb-6">The profile you're looking for doesn't exist or is not available.</p>
            <Button onClick={() => window.history.back()}>← Go Back</Button>
          </div>
        </main>
        <Footer />
      </div>;
  }

  // Parse data from database with error handling
  const images = escort.gallery_images && escort.gallery_images.length > 0 ? escort.gallery_images : escort.profile_picture ? [escort.profile_picture] : ["https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3"];
  const services = escort.services ? escort.services.split(',').map((s: string) => s.trim()) : [];
  const languages = escort.languages ? escort.languages.split(',').map((l: string) => l.trim()) : [];

  // Parse rates from text format instead of JSON
  const rates = parseRatesFromText(escort.rates || '');
  const ratingCount = generateRatingCount(escort.rating || 4.5);

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
                <img src={images[activeImageIndex]} alt={`${escort.display_name || escort.username} profile`} className="w-full h-full object-cover" />
              </div>
              
              {/* Thumbnail Gallery */}
              {images.length > 1 && (
                <div className="flex gap-3 overflow-x-auto pb-2">
                  {images.map((image: string, index: number) => (
                    <button 
                      key={index} 
                      className={`flex-shrink-0 w-20 h-20 rounded-md overflow-hidden border-2 ${index === activeImageIndex ? 'border-gold' : 'border-transparent'}`} 
                      onClick={() => setActiveImageIndex(index)}
                    >
                      <img src={image} alt={`${escort.display_name || escort.username} thumbnail ${index + 1}`} className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              )}
            </div>
            
            {/* Profile Info Section */}
            <div className="lg:w-1/2 space-y-6">
              {/* Header with Name and Actions */}
              <div className="flex justify-between items-start">
                <div>
                  <div className="flex items-center gap-2">
                    <h1 className="text-3xl font-serif font-bold text-navy">{escort.display_name || escort.username}</h1>
                    {escort.verified && (
                      <Badge variant="outline" className="flex items-center border-green-500 text-green-600 text-xs">
                        <Check className="h-3 w-3 mr-1" />
                        Verified
                      </Badge>
                    )}
                    {escort.featured && (
                      <Badge variant="outline" className="flex items-center border-gold text-gold text-xs">
                        <Star className="h-3 w-3 mr-1" />
                        Featured
                      </Badge>
                    )}
                  </div>
                  <div className="flex items-center gap-2 text-charcoal mt-1">
                    <span className="flex items-center">
                      <MapPin className="h-4 w-4 mr-1" />
                      {escort.location || 'Location not specified'}
                    </span>
                    {escort.age && (
                      <>
                        <span>•</span>
                        <span>{escort.age} years</span>
                      </>
                    )}
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
              <div className="flex items-center gap-2">
                <div className="flex">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className={`h-4 w-4 ${i < Math.floor(escort.rating || 4.5) ? 'text-gold fill-gold' : 'text-gray-300'}`} />
                  ))}
                </div>
                <span className="font-medium">{escort.rating || 4.5}</span>
                <span className="text-gray-500">({ratingCount} ratings)</span>
              </div>
              
              {/* About Section */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">About</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="prose max-w-none">
                    <p className="text-charcoal whitespace-pre-line">
                      {escort.bio || 'No biography available.'}
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* Details Section */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-y-4 gap-x-8">
                    <div>
                      <p className="text-sm text-gray-600 font-medium">Height</p>
                      <p className="text-gray-900 font-medium">{escort.height || 'Not specified'}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 font-medium">Age</p>
                      <p className="text-gray-900 font-medium">{escort.age || 'Not specified'}</p>
                    </div>
                  </div>
                  
                  {languages.length > 0 && (
                    <>
                      <Separator />
                      <div>
                        <p className="text-sm text-gray-600 font-medium mb-2">Languages</p>
                        <div className="flex flex-wrap gap-2">
                          {languages.map((language, index) => (
                            <Badge key={index} variant="outline" className="bg-zinc-900">
                              {language}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </>
                  )}
                  
                  {services.length > 0 && (
                    <>
                      <Separator />
                      <div>
                        <p className="text-sm text-gray-600 font-medium mb-2">Services Offered</p>
                        <div className="flex flex-wrap gap-2">
                          {services.map((service, index) => (
                            <Badge key={index} variant="secondary">
                              {service}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </>
                  )}
                  
                  {escort.availability && (
                    <>
                      <Separator />
                      <div>
                        <p className="text-sm text-gray-600 font-medium mb-2">Availability</p>
                        <p className="text-gray-900">{escort.availability}</p>
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>

              {/* Rates Section */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Rates</CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  <div className="divide-y">
                    {rates.hourly && (
                      <div className="flex justify-between items-center p-4">
                        <div className="flex items-center">
                          <Clock className="h-5 w-5 mr-2 text-gold" />
                          <span>1 Hour</span>
                        </div>
                        <span className="font-medium">${rates.hourly}</span>
                      </div>
                    )}
                    {rates.twoHours && (
                      <div className="flex justify-between items-center p-4">
                        <div className="flex items-center">
                          <Clock className="h-5 w-5 mr-2 text-gold" />
                          <span>2 Hours</span>
                        </div>
                        <span className="font-medium">${rates.twoHours}</span>
                      </div>
                    )}
                    {rates.dinner && (
                      <div className="flex justify-between items-center p-4">
                        <div className="flex items-center">
                          <Calendar className="h-5 w-5 mr-2 text-gold" />
                          <span>Dinner Date</span>
                        </div>
                        <span className="font-medium">${rates.dinner}</span>
                      </div>
                    )}
                    {rates.overnight && (
                      <div className="flex justify-between items-center p-4">
                        <div className="flex items-center">
                          <Calendar className="h-5 w-5 mr-2 text-gold" />
                          <span>Overnight</span>
                        </div>
                        <span className="font-medium">${rates.overnight}</span>
                      </div>
                    )}
                    {!rates.hourly && !rates.twoHours && !rates.dinner && !rates.overnight && (
                      <div className="p-4 text-center text-gray-500">
                        <p>Rates not specified. Please contact for pricing.</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
              
              {/* Contact Actions */}
              <div className="flex flex-col gap-4">
                <MessageButton escortId={escort.id} escortName={escort.display_name || escort.username} />
                
                <div className="grid grid-cols-2 gap-3">
                  <Button 
                    variant="outline" 
                    size="lg"
                    onClick={() => handleContactRequest('email')}
                    disabled={requestingContact === 'email'}
                    className="flex items-center justify-center"
                  >
                    <Mail className="h-4 w-4 mr-2" />
                    {requestingContact === 'email' ? 'Sending...' : 'Request Email'}
                  </Button>
                  
                  <Button 
                    variant="outline" 
                    size="lg"
                    onClick={() => handleContactRequest('phone')}
                    disabled={requestingContact === 'phone'}
                    className="flex items-center justify-center"
                  >
                    <Phone className="h-4 w-4 mr-2" />
                    {requestingContact === 'phone' ? 'Sending...' : 'Request Phone'}
                  </Button>
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

export default ProfilePage;
