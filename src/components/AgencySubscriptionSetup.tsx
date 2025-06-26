
import { useState } from 'react';
import AgencyPackageSelector from './AgencyPackageSelector';

interface AgencySubscriptionSetupProps {
  onSubscriptionCreate: (packageType: number) => void;
  onTrialActivate: () => void;
  isLoading: boolean;
}

const AgencySubscriptionSetup = ({ onSubscriptionCreate, onTrialActivate, isLoading }: AgencySubscriptionSetupProps) => {
  const handlePackageSelect = (packageId: number) => {
    onSubscriptionCreate(packageId);
  };

  return (
    <AgencyPackageSelector
      onPackageSelect={handlePackageSelect}
      onTrialActivate={onTrialActivate}
      isLoading={isLoading}
    />
  );
};

export default AgencySubscriptionSetup;
</tml>

Now I'll update the AgencySubscriptionManager to work with packages instead of seats:

<lov-write file_path="src/components/agency/AgencySubscriptionManager.tsx">
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CreditCard, Settings, Crown, Calendar, Users, Clock } from 'lucide-react';
import AgencyPackageSelector from '../AgencyPackageSelector';

interface AgencySubscriptionManagerProps {
  agencyId: string;
  subscription: any;
  onSubscriptionUpdate: () => void;
}

const AgencySubscriptionManager = ({ 
  agencyId, 
  subscription, 
  onSubscriptionUpdate 
}: AgencySubscriptionManagerProps) => {
  const [loading, setLoading] = useState(false);

  const createOrUpdateSubscription = async (packageType: number) => {
    setLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        toast.error('Please log in first');
        return;
      }

      const { data, error } = await supabase.functions.invoke('create-agency-subscription', {
        body: {
          agencyId,
          packageType
        },
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });

      if (error) throw error;

      if (data?.url) {
        window.open(data.url, '_blank');
        toast.success('Redirected to payment. Complete your purchase to activate.');
      } else {
        toast.success('Package updated successfully');
      }
      
      onSubscriptionUpdate();
    } catch (error: any) {
      console.error('Subscription error:', error);
      toast.error(error.message || 'Failed to update subscription');
    } finally {
      setLoading(false);
    }
  };

  const handleTrialActivate = async () => {
    setLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        toast.error('Please log in first');
        return;
      }

      const trialEnd = new Date();
      trialEnd.setDate(trialEnd.getDate() + 7);

      const { error: subscriptionError } = await supabase
        .from('agency_subscriptions')
        .upsert({
          agency_id: agencyId,
          package_type: 0, // Special trial package type
          package_name: 'Free Trial',
          max_profiles: 5,
          total_seats: 5,
          used_seats: 0,
          price_per_seat: 0,
          subscription_tier: 'trial',
          billing_cycle: '1 week',
          status: 'active',
          current_period_start: new Date().toISOString(),
          current_period_end: trialEnd.toISOString(),
          updated_at: new Date().toISOString(),
        }, { 
          onConflict: 'agency_id' 
        });

      if (subscriptionError) throw subscriptionError;

      const { error: profileError } = await supabase
        .from('profiles')
        .update({ 
          payment_status: 'completed',
          is_active: true,
          status: 'approved'
        })
        .eq('id', agencyId);

      if (profileError) console.error("Profile update error:", profileError);

      toast.success("Free trial activated! You have 7 days to manage up to 5 profiles.");
      onSubscriptionUpdate();
    } catch (error: any) {
      console.error('Trial activation error:', error);
      toast.error(error.message || 'Failed to activate trial');
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

  // Check if this is a trial subscription
  const isTrialSubscription = subscription?.package_type === 0 || subscription?.subscription_tier === 'trial';
  const trialEndDate = subscription?.current_period_end ? new Date(subscription.current_period_end) : null;
  const daysLeft = trialEndDate ? Math.ceil((trialEndDate.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)) : 0;

  const getPackageDisplayInfo = () => {
    if (!subscription) return null;
    
    if (isTrialSubscription) {
      return {
        name: 'Free Trial',
        duration: '7 days',
        maxProfiles: 5,
        price: 'Free'
      };
    }

    const packageMap = {
      1: { name: 'Package 1', price: '$79', duration: '1 week', maxProfiles: 1 },
      2: { name: 'Package 2', price: '$99', duration: '1 week', maxProfiles: 12 },
      3: { name: 'Package 3', price: '$249', duration: '4 weeks', maxProfiles: 18 },
      4: { name: 'Package 4', price: '$499', duration: '12 weeks', maxProfiles: 24 }
    };

    return packageMap[subscription.package_type as keyof typeof packageMap] || {
      name: subscription.package_name || 'Unknown Package',
      price: 'N/A',
      duration: subscription.billing_cycle || 'N/A',
      maxProfiles: subscription.max_profiles || subscription.total_seats || 0
    };
  };

  const packageInfo = getPackageDisplayInfo();

  return (
    <div className="space-y-6">
      {/* Current Subscription Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            {isTrialSubscription ? <Crown className="h-5 w-5 mr-2 text-secondary" /> : <CreditCard className="h-5 w-5 mr-2" />}
            Current Package
          </CardTitle>
        </CardHeader>
        <CardContent>
          {subscription && packageInfo ? (
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
                      Your trial expires soon. Choose a package below to continue.
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
                  <p className="text-sm text-muted-foreground">Package</p>
                  <p className="text-lg font-semibold">{packageInfo.name}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Max Profiles</p>
                  <div className="flex items-center">
                    <Users className="h-4 w-4 mr-1" />
                    <p className="text-lg font-semibold">{packageInfo.maxProfiles}</p>
                  </div>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Duration</p>
                  <div className="flex items-center">
                    <Clock className="h-4 w-4 mr-1" />
                    <p className="text-lg font-semibold">{packageInfo.duration}</p>
                  </div>
                </div>
              </div>

              <div className="bg-muted p-3 rounded-lg">
                <p className="text-sm text-muted-foreground">
                  <strong>Used Profiles:</strong> {subscription.used_seats || 0} of {packageInfo.maxProfiles}
                </p>
                <p className="text-sm text-muted-foreground mt-1">
                  <strong>Ad Positioning:</strong> Top of page 1 by location
                </p>
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
              <p className="text-muted-foreground mb-4">No active package</p>
              <p className="text-sm text-muted-foreground">Choose a package to start managing profiles</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Package Selection */}
      <Card>
        <CardHeader>
          <CardTitle>
            {isTrialSubscription ? 'Upgrade Your Package' : 'Available Packages'}
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            {isTrialSubscription 
              ? 'Choose a package to continue after your trial ends'
              : 'Select a new package or upgrade your current one'
            }
          </p>
        </CardHeader>
        <CardContent>
          <AgencyPackageSelector
            onPackageSelect={createOrUpdateSubscription}
            onTrialActivate={handleTrialActivate}
            isLoading={loading}
          />
        </CardContent>
      </Card>
    </div>
  );
};

export default AgencySubscriptionManager;
