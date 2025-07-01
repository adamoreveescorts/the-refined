
import { Shield, Clock, Star, Users } from 'lucide-react';

const features = [
  {
    icon: Shield,
    title: 'Privacy Assured',
    description: 'Your personal information remains confidential with our secure platform and strict privacy protocols.'
  },
  {
    icon: Clock,
    title: 'Instant Connections',
    description: 'Our streamlined booking system allows for quick and efficient appointment scheduling.'
  },
  {
    icon: Star,
    title: 'Premium Companions',
    description: 'Every profile is carefully reviewed to ensure the highest quality of companions on our platform.'
  },
  {
    icon: Users,
    title: 'Global Network',
    description: 'Access a worldwide network of companions across major cities and exclusive destinations.'
  }
];

const FeatureCard = ({ feature }: { feature: any }) => {
  const Icon = feature.icon;
  return (
    <div className="bg-white/90 backdrop-blur-sm p-6 rounded-lg shadow-lg text-center transition-all duration-300 hover:scale-105">
      <div className="mx-auto w-12 h-12 flex items-center justify-center bg-navy/5 rounded-full mb-4">
        <Icon className="h-6 w-6 text-gold" />
      </div>
      <h3 className="font-serif text-xl font-medium mb-2 text-navy">{feature.title}</h3>
      <p className="text-charcoal text-sm">{feature.description}</p>
    </div>
  );
};

const WhyChooseUs = () => {
  return (
    <section className="py-16 px-4 sm:px-6 lg:px-8 relative">
      <div 
        className="absolute inset-0 z-0" 
        style={{
          backgroundImage: "url('/lovable-uploads/8a09e300-5a72-4986-9f48-107f488e28fe.png')",
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
        }}
      />
      <div className="absolute inset-0 bg-black/70 z-0" />
      
      <div className="container mx-auto relative z-10">
        <div className="text-center mb-10">
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">Why Choose Us</h2>
          <p className="text-gray-200 max-w-2xl mx-auto">
            Experience the difference with our premium escort directory platform across Australia and Thailand
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, index) => (
            <FeatureCard key={index} feature={feature} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default WhyChooseUs;
