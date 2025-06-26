
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Crown, Users, Clock, Star } from 'lucide-react';

interface Package {
  id: number;
  name: string;
  price: number;
  duration: string;
  maxProfiles: number;
  description: string;
  popular?: boolean;
}

const PACKAGES: Package[] = [
  {
    id: 1,
    name: "Package 1",
    price: 79,
    duration: "1 week",
    maxProfiles: 1,
    description: "Perfect for individual escorts starting out"
  },
  {
    id: 2,
    name: "Package 2", 
    price: 99,
    duration: "1 week",
    maxProfiles: 12,
    description: "Great for small agencies",
    popular: true
  },
  {
    id: 3,
    name: "Package 3",
    price: 249,
    duration: "4 weeks", 
    maxProfiles: 18,
    description: "Best value for growing agencies"
  },
  {
    id: 4,
    name: "Package 4",
    price: 499,
    duration: "12 weeks",
    maxProfiles: 24,
    description: "Premium solution for established agencies"
  }
];

interface AgencyPackageSelectorProps {
  onPackageSelect: (packageId: number) => void;
  onTrialActivate: () => void;
  isLoading: boolean;
}

const AgencyPackageSelector = ({ onPackageSelect, onTrialActivate, isLoading }: AgencyPackageSelectorProps) => {
  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-serif font-bold text-foreground mb-2">
          Choose Your Agency Package
        </h2>
        <p className="text-muted-foreground">
          Each package includes top page 1 ad positioning by location and full profile management
        </p>
      </div>

      {/* Free Trial Option */}
      <Card className="border-secondary bg-secondary/5">
        <CardHeader>
          <CardTitle className="flex items-center text-secondary">
            <Crown className="h-5 w-5 mr-2" />
            Free 7-Day Trial
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="text-center">
              <div className="text-3xl font-bold text-secondary mb-2">
                FREE for 7 days
              </div>
              <p className="text-lg font-semibold mb-2">
                Up to 5 profiles included
              </p>
              <p className="text-sm text-muted-foreground mb-4">
                Full access to all premium features • No credit card required
              </p>
              <Button
                onClick={onTrialActivate}
                disabled={isLoading}
                className="w-full bg-secondary hover:bg-secondary/90 text-white"
                size="lg"
              >
                {isLoading ? 'Activating...' : 'Start Free Trial'}
              </Button>
            </div>
            <div className="bg-muted p-3 rounded-lg">
              <h4 className="font-medium mb-2 text-sm">Trial includes:</h4>
              <ul className="text-xs text-muted-foreground space-y-1">
                <li>• Manage up to 5 escort profiles</li>
                <li>• Top page 1 ad positioning</li>
                <li>• Agency dashboard with analytics</li>
                <li>• Full 7 days of premium access</li>
                <li>• No automatic billing after trial</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Divider */}
      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-background px-2 text-muted-foreground">Or choose a package</span>
        </div>
      </div>

      {/* Package Selection */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {PACKAGES.map((pkg) => (
          <Card key={pkg.id} className={`relative transition-all duration-200 hover:shadow-lg ${
            pkg.popular ? 'border-gold ring-1 ring-gold' : ''
          }`}>
            {pkg.popular && (
              <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                <Badge className="bg-gold text-white px-3 py-1">
                  <Star className="h-3 w-3 mr-1" />
                  Most Popular
                </Badge>
              </div>
            )}
            
            <CardHeader className="text-center pb-4">
              <CardTitle className="text-foreground">{pkg.name}</CardTitle>
              <div className="text-3xl font-bold text-secondary mb-2">
                ${pkg.price} AUD
              </div>
              <div className="flex items-center justify-center text-sm text-muted-foreground mb-2">
                <Clock className="h-4 w-4 mr-1" />
                {pkg.duration}
              </div>
              <div className="flex items-center justify-center text-sm text-muted-foreground">
                <Users className="h-4 w-4 mr-1" />
                Up to {pkg.maxProfiles} profile{pkg.maxProfiles > 1 ? 's' : ''}
              </div>
            </CardHeader>
            
            <CardContent className="space-y-4">
              <p className="text-sm text-center text-muted-foreground">
                {pkg.description}
              </p>
              
              <div className="bg-muted p-3 rounded-lg">
                <h4 className="font-medium mb-2 text-sm">Included features:</h4>
                <ul className="text-xs text-muted-foreground space-y-1">
                  <li>• Top page 1 ad positioning by location</li>
                  <li>• Full profile management access</li>
                  <li>• Agency dashboard with analytics</li>
                  <li>• Bulk operations and management tools</li>
                  <li>• Priority support</li>
                </ul>
              </div>
              
              <Button
                onClick={() => onPackageSelect(pkg.id)}
                disabled={isLoading}
                className={`w-full ${
                  pkg.popular 
                    ? "bg-gold hover:bg-gold/90 text-white" 
                    : "bg-secondary hover:bg-secondary/90 text-white"
                }`}
              >
                {isLoading ? 'Processing...' : `Select ${pkg.name}`}
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="bg-muted p-4 rounded-lg">
        <h4 className="font-medium mb-2">All packages include:</h4>
        <ul className="text-sm text-muted-foreground space-y-1">
          <li>• Premium ad positioning at top of page 1 by location</li>
          <li>• Full access to agency management dashboard</li>
          <li>• Profile creation and management tools</li>
          <li>• Analytics and reporting features</li>
          <li>• Priority customer support</li>
          <li>• One-time payment, no recurring fees</li>
        </ul>
      </div>
    </div>
  );
};

export default AgencyPackageSelector;
