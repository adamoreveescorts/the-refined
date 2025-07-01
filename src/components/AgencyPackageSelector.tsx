import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Users, Star, Crown } from 'lucide-react';
import { useState } from 'react';
interface Package {
  id: string;
  name: string;
  price: number;
  period: string;
  periodWeeks: number;
  maxProfiles: number;
  description: string;
  popular?: boolean;
  stripePriceId: string;
}
const PACKAGES: Package[] = [{
  id: "package_1",
  name: "Package 1",
  price: 79,
  period: "1 week",
  periodWeeks: 1,
  maxProfiles: 12,
  description: "Up to 12 contained profiles accessed within agency profile",
  stripePriceId: "price_package_1_weekly_aud"
}, {
  id: "package_2",
  name: "Package 2",
  price: 99,
  period: "1 week",
  periodWeeks: 1,
  maxProfiles: 18,
  description: "Up to 18 contained profiles accessed within agency profile",
  popular: true,
  stripePriceId: "price_package_2_weekly_aud"
}, {
  id: "package_3",
  name: "Package 3",
  price: 249,
  period: "4 weeks",
  periodWeeks: 4,
  maxProfiles: 24,
  description: "Up to 24 contained profiles accessed within agency profile",
  stripePriceId: "price_package_3_monthly_aud"
}, {
  id: "package_4",
  name: "Package 4",
  price: 499,
  period: "12 weeks",
  periodWeeks: 12,
  maxProfiles: 24,
  description: "Up to 24 contained profiles accessed within agency profile",
  stripePriceId: "price_package_4_quarterly_aud"
}];
interface AgencyPackageSelectorProps {
  onPackageSelect: (packageId: string, packageType: number) => void;
  isLoading: boolean;
}
const AgencyPackageSelector = ({
  onPackageSelect,
  isLoading
}: AgencyPackageSelectorProps) => {
  return <div className="space-y-6">
      

      {/* Package Selection */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {PACKAGES.map((pkg, index) => <Card key={pkg.id} className={`relative transition-all duration-200 hover:shadow-lg ${pkg.popular ? 'border-gold ring-1 ring-gold' : ''}`}>
            {pkg.popular && <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                <Badge className="bg-gold text-white px-3 py-1">
                  <Star className="h-3 w-3 mr-1" />
                  Most Popular
                </Badge>
              </div>}
            
            <CardHeader className="text-center pb-4">
              <CardTitle className="text-foreground">{pkg.name}</CardTitle>
              <div className="text-3xl font-bold text-secondary mb-2">
                From ${pkg.price} AUD
              </div>
              <div className="text-sm text-muted-foreground mb-2">
                Account period: {pkg.period}
              </div>
              <div className="text-sm text-muted-foreground">
                Recurring every {pkg.period}
              </div>
            </CardHeader>
            
            <CardContent className="space-y-4">
              <p className="text-sm text-center text-muted-foreground">
                {pkg.description}
              </p>
              
              <div className="bg-muted p-3 rounded-lg">
                <h4 className="font-medium mb-2 text-sm">Package Features:</h4>
                <ul className="text-xs text-muted-foreground space-y-1">
                  <li>• Agency ad starts at top of page 1 by location</li>
                  <li>• Up to {pkg.maxProfiles} contained profiles</li>
                  <li>• Pop out profiles available</li>
                  <li>• Upgrade pop out to featured available</li>
                  <li>• Full agency management dashboard</li>
                  <li>• Analytics and reporting features</li>
                  <li>• Priority customer support</li>
                  <li>• Recurring {pkg.period} billing</li>
                </ul>
              </div>
              
              <Button onClick={() => onPackageSelect(pkg.id, index + 1)} disabled={isLoading} className={`w-full ${pkg.popular ? "bg-gold hover:bg-gold/90 text-white" : "bg-secondary hover:bg-secondary/90 text-white"}`}>
                {isLoading ? 'Processing...' : `Subscribe to ${pkg.name}`}
              </Button>
            </CardContent>
          </Card>)}
      </div>

      <div className="bg-muted p-4 rounded-lg">
        <h4 className="font-medium mb-2">All packages include:</h4>
        <ul className="text-sm text-muted-foreground space-y-1">
          <li>• Recurring billing - cancel anytime</li>
          <li>• Agency ad starts at top of page 1 by location</li>
          <li>• Full access to agency management dashboard</li>
          <li>• Profile creation and management tools</li>
          <li>• Pop out profiles in search results</li>
          <li>• Upgrade pop out to featured results</li>
          <li>• Analytics and reporting features</li>
          <li>• Priority customer support</li>
          <li>• Automatic subscription renewal</li>
        </ul>
      </div>
    </div>;
};
export default AgencyPackageSelector;