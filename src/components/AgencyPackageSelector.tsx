
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Users, Star, Plus, Minus } from 'lucide-react';
import { useState } from 'react';

interface Package {
  id: string;
  name: string;
  price: number;
  billingCycle: string;
  description: string;
  popular?: boolean;
}

const PACKAGES: Package[] = [
  {
    id: "monthly",
    name: "Monthly Plan",
    price: 79,
    billingCycle: "monthly",
    description: "Flexible monthly billing for your agency",
    popular: true
  },
  {
    id: "yearly",
    name: "Yearly Plan", 
    price: 799,
    billingCycle: "yearly",
    description: "Save $150 per escort with yearly billing"
  }
];

interface AgencyPackageSelectorProps {
  onPackageSelect: (billingCycle: string, seats: number) => void;
  isLoading: boolean;
}

const AgencyPackageSelector = ({ onPackageSelect, isLoading }: AgencyPackageSelectorProps) => {
  const [seats, setSeats] = useState(1);

  const calculateYearlySavings = (seats: number) => {
    const monthlyTotal = 79 * 12 * seats; // $79 * 12 months * seats
    const yearlyTotal = 799 * seats; // $799 * seats
    return monthlyTotal - yearlyTotal;
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-serif font-bold text-foreground mb-2">
          Choose Your Agency Plan
        </h2>
        <p className="text-muted-foreground">
          Recurring billing per escort seat with top page 1 ad positioning and full profile management
        </p>
      </div>

      {/* Seat Selection */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Users className="h-5 w-5 mr-2" />
            Number of Escort Seats
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-4">
            <Label htmlFor="seats" className="text-sm font-medium">
              Escort Seats:
            </Label>
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSeats(Math.max(1, seats - 1))}
                disabled={seats <= 1}
              >
                <Minus className="h-4 w-4" />
              </Button>
              <Input
                id="seats"
                type="number"
                min="1"
                value={seats}
                onChange={(e) => setSeats(Math.max(1, parseInt(e.target.value) || 1))}
                className="w-20 text-center"
              />
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSeats(seats + 1)}
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            <p className="text-sm text-muted-foreground">
              Each seat allows you to manage one escort profile
            </p>
          </div>
        </CardContent>
      </Card>

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
                ${pkg.price * seats} AUD
              </div>
              <div className="text-sm text-muted-foreground mb-2">
                ${pkg.price} per escort per {pkg.billingCycle}
              </div>
              <div className="text-sm text-muted-foreground">
                For {seats} escort seat{seats > 1 ? 's' : ''}
              </div>
              {pkg.billingCycle === 'yearly' && (
                <div className="text-sm text-green-600 font-medium">
                  Save ${calculateYearlySavings(seats)} per year
                </div>
              )}
            </CardHeader>
            
            <CardContent className="space-y-4">
              <p className="text-sm text-center text-muted-foreground">
                {pkg.description}
              </p>
              
              <div className="bg-muted p-3 rounded-lg">
                <h4 className="font-medium mb-2 text-sm">Included features per escort:</h4>
                <ul className="text-xs text-muted-foreground space-y-1">
                  <li>• Top page 1 ad positioning by location</li>
                  <li>• Full profile management access</li>
                  <li>• Photo verification and featured status</li>
                  <li>• Premium messaging features</li>
                  <li>• Agency dashboard with analytics</li>
                  <li>• Bulk operations and management tools</li>
                  <li>• Priority support</li>
                  <li>• Recurring {pkg.billingCycle} billing</li>
                </ul>
              </div>
              
              <Button
                onClick={() => onPackageSelect(pkg.billingCycle, seats)}
                disabled={isLoading}
                className={`w-full ${
                  pkg.popular 
                    ? "bg-gold hover:bg-gold/90 text-white" 
                    : "bg-secondary hover:bg-secondary/90 text-white"
                }`}
              >
                {isLoading ? 'Processing...' : `Subscribe ${pkg.name}`}
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="bg-muted p-4 rounded-lg">
        <h4 className="font-medium mb-2">All plans include:</h4>
        <ul className="text-sm text-muted-foreground space-y-1">
          <li>• Recurring billing - cancel anytime</li>
          <li>• Premium ad positioning at top of page 1 by location</li>
          <li>• Full access to agency management dashboard</li>
          <li>• Profile creation and management tools for all escorts</li>
          <li>• Analytics and reporting features</li>
          <li>• Priority customer support</li>
          <li>• Automatic subscription renewal</li>
        </ul>
      </div>
    </div>
  );
};

export default AgencyPackageSelector;
