
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
    <div className="bg-white p-6 rounded-lg shadow-md text-center">
      <div className="mx-auto w-12 h-12 flex items-center justify-center bg-navy/5 rounded-full mb-4">
        <Icon className="h-6 w-6 text-gold" />
      </div>
      <h3 className="font-serif text-xl font-medium mb-2">{feature.title}</h3>
      <p className="text-charcoal text-sm">{feature.description}</p>
    </div>
  );
};

const WhyChooseUs = () => {
  return (
    <section className="bg-gray-50 py-16 px-4 sm:px-6 lg:px-8">
      <div className="container mx-auto">
        <div className="text-center mb-10">
          <h2 className="text-3xl sm:text-4xl font-bold text-navy mb-4">Why Choose Us</h2>
          <p className="text-charcoal max-w-2xl mx-auto">
            Experience the difference with our premium escort directory platform
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
