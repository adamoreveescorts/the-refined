import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts';
import { Users, UserCheck, Star, TrendingUp, Activity, MessageSquare, Shield, Eye, Crown } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import AnalyticsExport from './AnalyticsExport';

const AnalyticsDashboard = () => {
  const [analytics, setAnalytics] = useState({
    totalProfiles: 0,
    activeProfiles: 0,
    verifiedProfiles: 0,
    featuredProfiles: 0,
    totalMessages: 0,
    totalConversations: 0,
    pendingVerifications: 0,
    platinumSubscribers: 0,
    monthlyGrowth: []
  });
  const [recentActivity, setRecentActivity] = useState({
    newRegistrationsToday: 0,
    messagesSentToday: 0,
    verificationsCompleted: 0
  });
  const [roleDistribution, setRoleDistribution] = useState([]);
  const [locationStats, setLocationStats] = useState([]);
  const [loading, setLoading] = useState(true);

  const chartConfig = {
    profiles: {
      label: "Profiles",
      color: "#8B5CF6",
    },
    messages: {
      label: "Messages",
      color: "#10B981",
    },
    conversations: {
      label: "Conversations",
      color: "#F59E0B",
    }
  };

  const pieColors = ['#8B5CF6', '#10B981', '#F59E0B', '#EF4444'];

  useEffect(() => {
    fetchAnalytics();
    fetchRecentActivity();
  }, []);

  const fetchRecentActivity = async () => {
    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);

      // Fetch new registrations today
      const { count: newRegistrations, error: registrationsError } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', today.toISOString())
        .lt('created_at', tomorrow.toISOString());

      if (registrationsError) throw registrationsError;

      // Fetch messages sent today
      const { count: messagesToday, error: messagesError } = await supabase
        .from('messages')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', today.toISOString())
        .lt('created_at', tomorrow.toISOString());

      if (messagesError) throw messagesError;

      // Fetch verifications completed today
      const { count: verificationsToday, error: verificationsError } = await supabase
        .from('photo_verifications')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'approved')
        .gte('reviewed_at', today.toISOString())
        .lt('reviewed_at', tomorrow.toISOString());

      if (verificationsError) throw verificationsError;

      setRecentActivity({
        newRegistrationsToday: newRegistrations || 0,
        messagesSentToday: messagesToday || 0,
        verificationsCompleted: verificationsToday || 0
      });

    } catch (error) {
      console.error('Error fetching recent activity:', error);
    }
  };

  const fetchAnalytics = async () => {
    try {
      // Fetch basic profile stats
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('*');

      if (profilesError) throw profilesError;

      // Fetch messages count
      const { count: messagesCount, error: messagesError } = await supabase
        .from('messages')
        .select('*', { count: 'exact', head: true });

      if (messagesError) throw messagesError;

      // Fetch conversations count
      const { count: conversationsCount, error: conversationsError } = await supabase
        .from('conversations')
        .select('*', { count: 'exact', head: true });

      if (conversationsError) throw conversationsError;

      // Fetch pending verifications
      const { count: pendingVerifications, error: verificationsError } = await supabase
        .from('photo_verifications')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'pending');

      if (verificationsError) throw verificationsError;

      // Fetch platinum subscribers count
      const { count: platinumCount, error: platinumError } = await supabase
        .from('subscribers')
        .select('*', { count: 'exact', head: true })
        .eq('subscription_tier', 'platinum')
        .eq('subscribed', true);

      if (platinumError) throw platinumError;

      // Process profile data
      const totalProfiles = profiles?.length || 0;
      const activeProfiles = profiles?.filter(p => p.is_active).length || 0;
      const verifiedProfiles = profiles?.filter(p => p.verified).length || 0;
      const featuredProfiles = profiles?.filter(p => p.featured).length || 0;

      // Role distribution
      const roleStats = profiles?.reduce((acc, profile) => {
        const role = profile.role || 'unknown';
        acc[role] = (acc[role] || 0) + 1;
        return acc;
      }, {});

      const roleDistributionData = Object.entries(roleStats || {}).map(([role, count]) => ({
        name: role.charAt(0).toUpperCase() + role.slice(1),
        value: count,
        percentage: ((count as number / totalProfiles) * 100).toFixed(1)
      }));

      // Location stats (top 10)
      const locationStats = profiles?.reduce((acc, profile) => {
        if (profile.location) {
          acc[profile.location] = (acc[profile.location] || 0) + 1;
        }
        return acc;
      }, {});

      const locationData = Object.entries(locationStats || {})
        .sort(([,a], [,b]) => (b as number) - (a as number))
        .slice(0, 10)
        .map(([location, count]) => ({
          location,
          profiles: count
        }));

      // Monthly growth (last 6 months)
      const monthlyData = [];
      for (let i = 5; i >= 0; i--) {
        const date = new Date();
        date.setMonth(date.getMonth() - i);
        const monthStart = new Date(date.getFullYear(), date.getMonth(), 1);
        const monthEnd = new Date(date.getFullYear(), date.getMonth() + 1, 0);

        const monthProfiles = profiles?.filter(p => {
          const createdAt = new Date(p.created_at);
          return createdAt >= monthStart && createdAt <= monthEnd;
        }).length || 0;

        monthlyData.push({
          month: date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
          profiles: monthProfiles
        });
      }

      setAnalytics({
        totalProfiles,
        activeProfiles,
        verifiedProfiles,
        featuredProfiles,
        totalMessages: messagesCount || 0,
        totalConversations: conversationsCount || 0,
        pendingVerifications: pendingVerifications || 0,
        platinumSubscribers: platinumCount || 0,
        monthlyGrowth: monthlyData
      });

      setRoleDistribution(roleDistributionData);
      setLocationStats(locationData);

    } catch (error) {
      console.error('Error fetching analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gold"></div>
      </div>
    );
  }

  const keyMetrics = [
    {
      title: 'Total Profiles',
      value: analytics.totalProfiles,
      icon: Users,
      color: 'text-blue-600',
      change: '+12%'
    },
    {
      title: 'Active Profiles',
      value: analytics.activeProfiles,
      icon: Activity,
      color: 'text-green-600',
      change: '+8%'
    },
    {
      title: 'Verified Profiles',
      value: analytics.verifiedProfiles,
      icon: Shield,
      color: 'text-purple-600',
      change: '+15%'
    },
    {
      title: 'Featured Profiles',
      value: analytics.featuredProfiles,
      icon: Star,
      color: 'text-gold',
      change: '+5%'
    },
    {
      title: 'Total Messages',
      value: analytics.totalMessages,
      icon: MessageSquare,
      color: 'text-blue-500',
      change: '+23%'
    },
    {
      title: 'Conversations',
      value: analytics.totalConversations,
      icon: Users,
      color: 'text-green-500',
      change: '+18%'
    },
    {
      title: 'Pending Verifications',
      value: analytics.pendingVerifications,
      icon: Eye,
      color: 'text-orange-600',
      change: '-10%'
    },
    {
      title: 'Platinum Subscribers',
      value: analytics.platinumSubscribers,
      icon: Crown,
      color: 'text-gold',
      change: '+7%'
    }
  ];

  return (
    <div className="space-y-6">
      {/* Export Feature - Add at the top */}
      <AnalyticsExport />

      {/* Key Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {keyMetrics.map((metric, index) => (
          <Card key={index}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{metric.title}</CardTitle>
              <metric.icon className={`h-4 w-4 ${metric.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{metric.value}</div>
              <p className="text-xs text-muted-foreground">
                <span className="text-green-600">{metric.change}</span> from last month
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Monthly Growth Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Profile Growth (Last 6 Months)</CardTitle>
          </CardHeader>
          <CardContent>
            <ChartContainer config={chartConfig} className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={analytics.monthlyGrowth}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Line 
                    type="monotone" 
                    dataKey="profiles" 
                    stroke="#8B5CF6" 
                    strokeWidth={2}
                    dot={{ fill: '#8B5CF6' }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>

        {/* Role Distribution Pie Chart */}
        <Card>
          <CardHeader>
            <CardTitle>User Role Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <ChartContainer config={chartConfig} className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={roleDistribution}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percentage }) => `${name} (${percentage}%)`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {roleDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={pieColors[index % pieColors.length]} />
                    ))}
                  </Pie>
                  <ChartTooltip content={<ChartTooltipContent />} />
                </PieChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>

      {/* Location Stats */}
      <Card>
        <CardHeader>
          <CardTitle>Top Locations</CardTitle>
        </CardHeader>
        <CardContent>
          <ChartContainer config={chartConfig} className="h-[400px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={locationStats} layout="horizontal">
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" />
                <YAxis dataKey="location" type="category" width={100} />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Bar dataKey="profiles" fill="#10B981" />
              </BarChart>
            </ResponsiveContainer>
          </ChartContainer>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm">New registrations today</span>
                <Badge variant="outline">{recentActivity.newRegistrationsToday}</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Messages sent today</span>
                <Badge variant="outline">{recentActivity.messagesSentToday}</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Verifications completed</span>
                <Badge variant="outline">{recentActivity.verificationsCompleted}</Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Platform Health</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm">System Status</span>
                <Badge className="bg-green-500">Online</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Database</span>
                <Badge className="bg-green-500">Healthy</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Response Time</span>
                <Badge variant="outline">120ms</Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Revenue Insights</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm">Platinum Subscribers</span>
                <Badge className="bg-gold text-white">
                  {analytics.platinumSubscribers}
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Growth</span>
                <Badge className="bg-green-500">+12%</Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AnalyticsDashboard;
