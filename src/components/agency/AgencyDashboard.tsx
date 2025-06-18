
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Users, Plus, Settings, CreditCard, Crown, Mail, UserPlus } from 'lucide-react';
import EscortManagementTable from './EscortManagementTable';
import InvitationManagementTable from './InvitationManagementTable';
import AddEscortDialog from './AddEscortDialog';
import DirectAddEscortDialog from './DirectAddEscortDialog';
import AgencySubscriptionManager from './AgencySubscriptionManager';

interface AgencyDashboardProps {
  agencyId: string;
}

const AgencyDashboard = ({ agencyId }: AgencyDashboardProps) => {
  const [escorts, setEscorts] = useState([]);
  const [invitations, setInvitations] = useState([]);
  const [subscription, setSubscription] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showAddEscort, setShowAddEscort] = useState(false);
  const [showDirectAddEscort, setShowDirectAddEscort] = useState(false);

  useEffect(() => {
    fetchAgencyData();
  }, [agencyId]);

  const fetchAgencyData = async () => {
    try {
      setLoading(true);
      
      // Fetch agency escorts
      const { data: escortData, error: escortError } = await supabase
        .from('agency_escorts')
        .select(`
          *,
          escort:escort_id (
            id,
            display_name,
            email,
            profile_picture,
            status,
            is_active,
            location,
            created_at
          )
        `)
        .eq('agency_id', agencyId);

      if (escortError) throw escortError;
      setEscorts(escortData || []);

      // Fetch escort invitations
      const { data: invitationData, error: invitationError } = await supabase
        .from('escort_invitations')
        .select('*')
        .eq('agency_id', agencyId)
        .order('invited_at', { ascending: false });

      if (invitationError) throw invitationError;
      setInvitations(invitationData || []);

      // Fetch agency subscription
      const { data: subData, error: subError } = await supabase
        .from('agency_subscriptions')
        .select('*')
        .eq('agency_id', agencyId)
        .single();

      if (subError && subError.code !== 'PGRST116') {
        console.error('Subscription error:', subError);
      } else {
        setSubscription(subData);
      }
    } catch (error) {
      console.error('Error fetching agency data:', error);
      toast.error('Failed to load agency data');
    } finally {
      setLoading(false);
    }
  };

  const getSubscriptionStatus = () => {
    if (!subscription) return { color: 'red', text: 'No Subscription' };
    if (subscription.status === 'active') return { color: 'green', text: 'Active' };
    return { color: 'orange', text: subscription.status };
  };

  const canAddMoreEscorts = () => {
    if (!subscription) return false;
    return subscription.used_seats < subscription.total_seats;
  };

  const pendingInvitations = invitations.filter(inv => inv.status === 'pending').length;

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-secondary"></div>
      </div>
    );
  }

  const statusInfo = getSubscriptionStatus();

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-foreground">Agency Dashboard</h1>
        <div className="flex gap-2">
          <Button
            onClick={() => setShowDirectAddEscort(true)}
            disabled={!canAddMoreEscorts()}
            className="bg-secondary hover:bg-secondary/90"
          >
            <UserPlus className="h-4 w-4 mr-2" />
            Add Escort
          </Button>
          <Button
            onClick={() => setShowAddEscort(true)}
            disabled={!canAddMoreEscorts()}
            variant="outline"
          >
            <Plus className="h-4 w-4 mr-2" />
            Invite Escort
          </Button>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Users className="h-8 w-8 text-secondary" />
              <div className="ml-4">
                <p className="text-sm font-medium text-muted-foreground">Total Escorts</p>
                <p className="text-2xl font-bold">{escorts.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Crown className="h-8 w-8 text-gold" />
              <div className="ml-4">
                <p className="text-sm font-medium text-muted-foreground">Active Escorts</p>
                <p className="text-2xl font-bold">
                  {escorts.filter(e => e.status === 'active').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Mail className="h-8 w-8 text-blue-500" />
              <div className="ml-4">
                <p className="text-sm font-medium text-muted-foreground">Pending Invites</p>
                <p className="text-2xl font-bold">{pendingInvitations}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Settings className="h-8 w-8 text-purple-500" />
              <div className="ml-4">
                <p className="text-sm font-medium text-muted-foreground">Available Seats</p>
                <p className="text-2xl font-bold">
                  {subscription ? subscription.total_seats - subscription.used_seats : 0}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <CreditCard className="h-8 w-8 text-green-500" />
              <div className="ml-4">
                <p className="text-sm font-medium text-muted-foreground">Subscription</p>
                <Badge className={`bg-${statusInfo.color}-500`}>
                  {statusInfo.text}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs defaultValue="escorts" className="space-y-4">
        <TabsList>
          <TabsTrigger value="escorts">Escort Management</TabsTrigger>
          <TabsTrigger value="invitations">
            Invitations {pendingInvitations > 0 && (
              <Badge className="ml-2 bg-blue-500 text-white">{pendingInvitations}</Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="subscription">Subscription & Billing</TabsTrigger>
        </TabsList>

        <TabsContent value="escorts">
          <Card>
            <CardHeader>
              <CardTitle>Manage Your Escorts</CardTitle>
            </CardHeader>
            <CardContent>
              <EscortManagementTable 
                escorts={escorts} 
                onEscortUpdate={fetchAgencyData}
                agencyId={agencyId}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="invitations">
          <Card>
            <CardHeader>
              <CardTitle>Escort Invitations</CardTitle>
            </CardHeader>
            <CardContent>
              <InvitationManagementTable 
                invitations={invitations}
                onInvitationUpdate={fetchAgencyData}
                agencyId={agencyId}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="subscription">
          <AgencySubscriptionManager 
            agencyId={agencyId}
            subscription={subscription}
            onSubscriptionUpdate={fetchAgencyData}
          />
        </TabsContent>
      </Tabs>

      <AddEscortDialog
        open={showAddEscort}
        onOpenChange={setShowAddEscort}
        agencyId={agencyId}
        onEscortAdded={fetchAgencyData}
        availableSeats={subscription ? subscription.total_seats - subscription.used_seats : 0}
      />

      <DirectAddEscortDialog
        open={showDirectAddEscort}
        onOpenChange={setShowDirectAddEscort}
        agencyId={agencyId}
        onEscortAdded={fetchAgencyData}
        availableSeats={subscription ? subscription.total_seats - subscription.used_seats : 0}
      />
    </div>
  );
};

export default AgencyDashboard;
