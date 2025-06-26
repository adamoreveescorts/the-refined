
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import NavBar from '@/components/NavBar';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, Users, UserCheck, UserX, Star, Eye, MessageSquare, Shield, Filter, SortAsc, SortDesc } from 'lucide-react';
import ProfileManagementTable from '@/components/admin/ProfileManagementTable';
import AdminStats from '@/components/admin/AdminStats';
import AdminMessagingTab from '@/components/admin/AdminMessagingTab';
import VerificationManagementTab from '@/components/admin/VerificationManagementTab';
import AnalyticsDashboard from '@/components/admin/AnalyticsDashboard';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [profiles, setProfiles] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [roleFilter, setRoleFilter] = useState('all');
  const [locationFilter, setLocationFilter] = useState('');
  const [sortBy, setSortBy] = useState('created_at');
  const [sortOrder, setSortOrder] = useState('desc');

  useEffect(() => {
    checkAdminAccess();
  }, []);

  const checkAdminAccess = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        toast.error('Please log in to access admin dashboard');
        navigate('/auth');
        return;
      }

      const { data: profile, error } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', session.user.id)
        .single();

      if (error || !profile || profile.role !== 'admin') {
        toast.error('Access denied. Admin privileges required.');
        navigate('/');
        return;
      }

      setIsAdmin(true);
      fetchProfiles();
    } catch (error) {
      console.error('Error checking admin access:', error);
      toast.error('Error checking permissions');
      navigate('/');
    } finally {
      setLoading(false);
    }
  };

  const fetchProfiles = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setProfiles(data || []);
    } catch (error) {
      console.error('Error fetching profiles:', error);
      toast.error('Error loading profiles');
    }
  };

  const filteredAndSortedProfiles = profiles
    .filter(profile => {
      const matchesSearch = profile.display_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           profile.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           profile.username?.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesStatus = statusFilter === 'all' || profile.status === statusFilter;
      const matchesRole = roleFilter === 'all' || profile.role === roleFilter;
      const matchesLocation = !locationFilter || 
                             profile.location?.toLowerCase().includes(locationFilter.toLowerCase());
      
      return matchesSearch && matchesStatus && matchesRole && matchesLocation;
    })
    .sort((a, b) => {
      let aValue, bValue;
      
      switch (sortBy) {
        case 'created_at':
          aValue = new Date(a.created_at).getTime();
          bValue = new Date(b.created_at).getTime();
          break;
        case 'last_active':
          aValue = a.last_active ? new Date(a.last_active).getTime() : 0;
          bValue = b.last_active ? new Date(b.last_active).getTime() : 0;
          break;
        case 'display_name':
          aValue = (a.display_name || a.username || '').toLowerCase();
          bValue = (b.display_name || b.username || '').toLowerCase();
          break;
        case 'location':
          aValue = (a.location || '').toLowerCase();
          bValue = (b.location || '').toLowerCase();
          break;
        case 'view_count':
          aValue = a.view_count || 0;
          bValue = b.view_count || 0;
          break;
        case 'rating':
          aValue = a.rating || 0;
          bValue = b.rating || 0;
          break;
        default:
          aValue = a[sortBy];
          bValue = b[sortBy];
      }
      
      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

  const clearFilters = () => {
    setSearchTerm('');
    setStatusFilter('all');
    setRoleFilter('all');
    setLocationFilter('');
    setSortBy('created_at');
    setSortOrder('desc');
  };

  const toggleSortOrder = () => {
    setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-secondary"></div>
      </div>
    );
  }

  if (!isAdmin) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      <NavBar />
      
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">Admin Dashboard</h1>
          <p className="text-muted-foreground">Manage profiles, verifications, and platform statistics</p>
        </div>

        {/* Stats Overview */}
        <div className="mb-8">
          <AdminStats profiles={profiles} />
        </div>

        {/* Management Tabs */}
        <Tabs defaultValue="profiles" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="profiles">Profile Management</TabsTrigger>
            <TabsTrigger value="verifications">Verifications</TabsTrigger>
            <TabsTrigger value="messaging">Messaging</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
          </TabsList>
          
          <TabsContent value="profiles" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>Profile Management</span>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    Showing {filteredAndSortedProfiles.length} of {profiles.length} profiles
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {/* Enhanced Filters */}
                <div className="space-y-4 mb-6">
                  {/* Search and Quick Actions Row */}
                  <div className="flex flex-wrap items-center gap-3">
                    <div className="relative flex-1 min-w-64">
                      <Search className="h-4 w-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
                      <Input
                        placeholder="Search by name, email, or username..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={clearFilters}
                      className="flex items-center gap-1"
                    >
                      <Filter className="h-4 w-4" />
                      Clear Filters
                    </Button>
                  </div>

                  {/* Filter Controls Row */}
                  <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
                    <Select value={statusFilter} onValueChange={setStatusFilter}>
                      <SelectTrigger>
                        <SelectValue placeholder="Status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Status</SelectItem>
                        <SelectItem value="pending">Pending</SelectItem>
                        <SelectItem value="approved">Approved</SelectItem>
                        <SelectItem value="rejected">Rejected</SelectItem>
                        <SelectItem value="inactive">Inactive</SelectItem>
                      </SelectContent>
                    </Select>

                    <Select value={roleFilter} onValueChange={setRoleFilter}>
                      <SelectTrigger>
                        <SelectValue placeholder="Role" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Roles</SelectItem>
                        <SelectItem value="escort">Escort</SelectItem>
                        <SelectItem value="agency">Agency</SelectItem>
                        <SelectItem value="client">Client</SelectItem>
                        <SelectItem value="admin">Admin</SelectItem>
                      </SelectContent>
                    </Select>

                    <Input
                      placeholder="Filter by location..."
                      value={locationFilter}
                      onChange={(e) => setLocationFilter(e.target.value)}
                    />

                    <Select value={sortBy} onValueChange={setSortBy}>
                      <SelectTrigger>
                        <SelectValue placeholder="Sort by" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="created_at">Creation Date</SelectItem>
                        <SelectItem value="last_active">Last Active</SelectItem>
                        <SelectItem value="display_name">Name</SelectItem>
                        <SelectItem value="location">Location</SelectItem>
                        <SelectItem value="view_count">View Count</SelectItem>
                        <SelectItem value="rating">Rating</SelectItem>
                      </SelectContent>
                    </Select>

                    <Button
                      variant="outline"
                      size="sm"
                      onClick={toggleSortOrder}
                      className="flex items-center gap-1"
                    >
                      {sortOrder === 'asc' ? (
                        <SortAsc className="h-4 w-4" />
                      ) : (
                        <SortDesc className="h-4 w-4" />
                      )}
                      {sortOrder === 'asc' ? 'Asc' : 'Desc'}
                    </Button>

                    <div className="flex items-center text-sm text-muted-foreground">
                      {filteredAndSortedProfiles.length !== profiles.length && (
                        <span className="text-primary font-medium">
                          Filtered
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <ProfileManagementTable 
                  profiles={filteredAndSortedProfiles}
                  onProfileUpdate={fetchProfiles}
                />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="verifications" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Shield className="h-5 w-5 mr-2" />
                  Photo Verification Management
                </CardTitle>
                <p className="text-sm text-muted-foreground">
                  Review and approve photo verifications from escorts and agencies
                </p>
              </CardHeader>
              <CardContent>
                <VerificationManagementTab />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="messaging" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <MessageSquare className="h-5 w-5 mr-2" />
                  Message Management
                </CardTitle>
                <p className="text-sm text-muted-foreground">
                  View and respond to conversations as escorts
                </p>
              </CardHeader>
              <CardContent>
                <AdminMessagingTab />
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="analytics" className="mt-6">
            <AnalyticsDashboard />
          </TabsContent>
        </Tabs>
      </main>
      
      <Footer />
    </div>
  );
};

export default AdminDashboard;
