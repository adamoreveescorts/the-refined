
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Plus, Minus, Users } from 'lucide-react';

interface AgencySubscriptionSetupProps {
  onSubscriptionCreate: (seats: number, billingCycle: string) => void;
  isLoading: boolean;
}

const PRICING = {
  weekly: 15,
  monthly: 79,
  quarterly: 189,
  yearly: 399
};

const AgencySubscriptionSetup = ({ onSubscriptionCreate, isLoading }: AgencySubscriptionSetupProps) => {
  const [seats, setSeats] = useState(1);

  const calculateMonthlyTotal = (seats: number, cycle: string) => {
    const basePrice = PRICING[cycle as keyof typeof PRICING];
    const total = basePrice * seats;
    
    if (cycle === 'weekly') return (total * 4.33).toFixed(0);
    if (cycle === 'quarterly') return (total / 3).toFixed(0);
    if (cycle === 'yearly') return (total / 12).toFixed(0);
    return total.toString();
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-serif font-bold text-foreground mb-2">
          Agency Subscription Setup
        </h2>
        <p className="text-muted-foreground">
          Choose your billing cycle and number of escort seats to get started
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
          <div className="space-y-2">
            <Label htmlFor="seats">How many escorts will you manage?</Label>
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSeats(Math.max(1, seats - 1))}
                disabled={seats <= 1 || isLoading}
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
                disabled={isLoading}
              />
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSeats(seats + 1)}
                disabled={isLoading}
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            <p className="text-sm text-muted-foreground">
              You can always add or remove seats later from your agency dashboard
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Billing Options */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {Object.entries(PRICING).map(([cycle, price]) => (
          <Card key={cycle} className="relative">
            <CardContent className="p-4">
              <div className="text-center">
                <h3 className="font-semibold capitalize mb-2">{cycle}</h3>
                <div className="text-2xl font-bold text-secondary mb-2">
                  ${price * seats} AUD
                </div>
                <p className="text-sm text-muted-foreground mb-2">
                  ${price} per escort
                </p>
                <p className="text-xs text-muted-foreground mb-4">
                  ~${calculateMonthlyTotal(seats, cycle)}/month
                </p>
                <Button
                  onClick={() => onSubscriptionCreate(seats, cycle)}
                  disabled={isLoading}
                  className="w-full bg-secondary hover:bg-secondary/90"
                >
                  {isLoading ? 'Processing...' : `Start ${cycle} Plan`}
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="bg-muted p-4 rounded-lg">
        <h4 className="font-medium mb-2">What's included with every plan:</h4>
        <ul className="text-sm text-muted-foreground space-y-1">
          <li>• Manage multiple escort profiles</li>
          <li>• All Platinum features for each escort</li>
          <li>• Agency dashboard with analytics</li>
          <li>• Bulk operations and management tools</li>
          <li>• Priority support</li>
        </ul>
      </div>
    </div>
  );
};

export default AgencySubscriptionSetup;
