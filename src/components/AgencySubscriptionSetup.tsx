
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Plus, Minus, Users, Crown } from 'lucide-react';

interface AgencySubscriptionSetupProps {
  onSubscriptionCreate: (seats: number, billingCycle: string) => void;
  onTrialActivate: (seats: number) => void;
  isLoading: boolean;
}

const PRICING = {
  weekly: 15,
  monthly: 79,
  quarterly: 189,
  yearly: 399
};

const AgencySubscriptionSetup = ({ onSubscriptionCreate, onTrialActivate, isLoading }: AgencySubscriptionSetupProps) => {
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
          Start with a free trial or choose your billing cycle and number of escort seats
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
                Up to 5 escort seats included
              </p>
              <p className="text-sm text-muted-foreground mb-4">
                Full access to all premium features • No credit card required
              </p>
              <Button
                onClick={() => onTrialActivate(5)}
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
                <li>• All Platinum features for each escort</li>
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
          <span className="bg-background px-2 text-muted-foreground">Or choose a paid plan</span>
        </div>
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
