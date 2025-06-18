
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { CreditCard, Plus, Minus, Settings, Crown, Calendar } from 'lucide-react';

interface AgencySubscriptionManagerProps {
  agencyId: string;
  subscription: any;
  onSubscriptionUpdate: () => void;
}

const PRICING = {
  weekly: 15,
  monthly: 79,
  quarterly: 189,
  yearly: 399
};

const AgencySubscriptionManager = ({ 
  agencyId, 
  subscription, 
  onSubscriptionUpdate 
}: AgencySubscriptionManagerProps) => {
  const [loading, setLoading] = useState(false);
  const [newSeats, setNewSeats] = useState(subscription?.total_seats || 1);

  useEffect(() => {
    setNewSeats(subscription?.total_seats || 1);
  }, [subscription]);

  const createOrUpdateSubscription = async (seats: number, billingCycle: string) => {
    setLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        toast.error('Please log in first');
        return;
      }

      const pricePerSeat = PRICING[billingCycle as keyof typeof PRICING];
      
      const { data, error } = await supabase.functions.invoke('create-agency-subscription', {
        body: {
          agencyId,
          seats,
          billingCycle,
          pricePerSeat: pricePerSeat * 100 // Convert to cents
        },
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });

      if (error) throw error;

      if (data?.url) {
        window.open(data.url, '_blank');
        toast.success('Redirected to payment. Complete your subscription to activate.');
      } else {
        toast.success('Subscription updated successfully');
      }
      
      onSubscriptionUpdate();
    } catch (error: any) {
      console.error('Subscription error:', error);
      toast.error(error.message || 'Failed to update subscription');
    } finally {
      setLoading(false);
    }
  };

  const handleManageSubscription = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        toast.error('Please log in first');
        return;
      }

      const { data, error } = await supabase.functions.invoke('customer-portal', {
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });

      if (error) throw error;

      window.open(data.url, '_blank');
      toast.success('Redirected to subscription management portal.');
    } catch (error: any) {
      console.error('Portal error:', error);
      toast.error('Unable to access subscription management.');
    }
  };

  const calculateMonthlyTotal = (seats: number, cycle: string) => {
    const basePrice = PRICING[cycle as keyof typeof PRICING];
    const total = basePrice * seats;
    
    if (cycle === 'weekly') return (total * 4.33).toFixed(0);
    if (cycle === 'quarterly') return (total / 3).toFixed(0);
    if (cycle === 'yearly') return (total / 12).toFixed(0);
    return total.toString();
  };

  // Check if this is a trial subscription (price_per_seat = 0 and period end within 7 days of start)
  const isTrialSubscription = subscription?.price_per_seat === 0 && subscription?.current_period_end;
  const trialEndDate = subscription?.current_period_end ? new Date(subscription.current_period_end) : null;
  const daysLeft = trialEndDate ? Math.ceil((trialEndDate.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)) : 0;

  return (
    <div className="space-y-6">
      {/* Current Subscription Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            {isTrialSubscription ? <Crown className="h-5 w-5 mr-2 text-secondary" /> : <CreditCard className="h-5 w-5 mr-2" />}
            Current Subscription
          </CardTitle>
        </CardHeader>
        <CardContent>
          {subscription ? (
            <div className="space-y-4">
              {isTrialSubscription && (
                <div className="bg-secondary/10 border border-secondary/20 rounded-lg p-4 mb-4">
                  <div className="flex items-center mb-2">
                    <Crown className="h-4 w-4 text-secondary mr-2" />
                    <span className="font-semibold text-secondary">Free Trial Active</span>
                  </div>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-muted-foreground">Days Remaining</p>
                      <p className="text-lg font-semibold text-secondary">{Math.max(0, daysLeft)} days</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Trial Ends</p>
                      <p className="text-lg font-semibold">{trialEndDate?.toLocaleDateString()}</p>
                    </div>
                  </div>
                  {daysLeft <= 3 && daysLeft > 0 && (
                    <div className="mt-3 p-2 bg-orange-50 border border-orange-200 rounded text-sm text-orange-800">
                      <Calendar className="h-4 w-4 inline mr-1" />
                      Your trial expires soon. Choose a plan below to continue.
                    </div>
                  )}
                </div>
              )}
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Status</p>
                  <Badge className={subscription.status === 'active' ? 'bg-green-500' : 'bg-orange-500'}>
                    {isTrialSubscription ? 'Free Trial' : subscription.status}
                  </Badge>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Total Seats</p>
                  <p className="text-lg font-semibold">{subscription.total_seats}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Used Seats</p>
                  <p className="text-lg font-semibold">{subscription.used_seats}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Billing Cycle</p>
                  <p className="text-lg font-semibold capitalize">
                    {isTrialSubscription ? 'Trial' : subscription.billing_cycle}
                  </p>
                </div>
              </div>
              
              {!isTrialSubscription && (
                <div className="flex gap-2">
                  <Button onClick={handleManageSubscription} variant="outline">
                    <Settings className="h-4 w-4 mr-2" />
                    Manage Subscription
                  </Button>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-6">
              <p className="text-muted-foreground mb-4">No active subscription</p>
              <p className="text-sm text-muted-foreground">Create a subscription to start managing escorts</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Subscription Plans */}
      <Card>
        <CardHeader>
          <CardTitle>
            {isTrialSubscription ? 'Upgrade Your Plan' : 'Subscription Plans'}
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            {isTrialSubscription 
              ? 'Choose a plan to continue after your trial ends'
              : 'Choose your billing cycle and number of escort seats'
            }
          </p>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {/* Seat Selection */}
            <div className="space-y-2">
              <Label htmlFor="seats">Number of Escort Seats</Label>
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setNewSeats(Math.max(1, newSeats - 1))}
                  disabled={newSeats <= 1}
                >
                  <Minus className="h-4 w-4" />
                </Button>
                <Input
                  id="seats"
                  type="number"
                  min="1"
                  value={newSeats}
                  onChange={(e) => setNewSeats(Math.max(1, parseInt(e.target.value) || 1))}
                  className="w-20 text-center"
                />
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setNewSeats(newSeats + 1)}
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Billing Options */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {Object.entries(PRICING).map(([cycle, price]) => (
                <Card key={cycle} className="relative">
                  <CardContent className="p-4">
                    <div className="text-center">
                      <h3 className="font-semibold capitalize mb-2">{cycle}</h3>
                      <div className="text-2xl font-bold text-secondary mb-2">
                        ${price * newSeats} AUD
                      </div>
                      <p className="text-sm text-muted-foreground mb-2">
                        ${price} per escort
                      </p>
                      <p className="text-xs text-muted-foreground mb-4">
                        ~${calculateMonthlyTotal(newSeats, cycle)}/month
                      </p>
                      <Button
                        onClick={() => createOrUpdateSubscription(newSeats, cycle)}
                        disabled={loading}
                        className="w-full bg-secondary hover:bg-secondary/90"
                      >
                        {loading ? 'Processing...' : 
                         subscription ? 'Update Plan' : 'Select Plan'}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AgencySubscriptionManager;
