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
import { Search, Users, UserCheck, UserX, Star, Eye, MessageSquare, Shield } from 'lucide-react';
import ProfileManagementTable from '@/components/admin/ProfileManagementTable';
import AdminStats from '@/components/admin/AdminStats';
import AdminMessagingTab from '@/components/admin/AdminMessagingTab';
import VerificationManagementTab from '@/components/admin/VerificationManagementTab';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [profiles, setProfiles] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

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

  const filteredProfiles = profiles.filter(profile => {
    const matchesSearch = profile.display_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         profile.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         profile.location?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || profile.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gold"></div>
      </div>
    );
  }

  if (!isAdmin) {
    return null;
  }

  return (
    <div className="min-h-screen flex flex-col">
      <NavBar />
      
      <main className="flex-grow bg-background py-8">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-foreground mb-2">Admin Dashboard</h1>
            <p className="text-muted-foreground">Manage escort profiles and platform content</p>
          </div>

          <AdminStats profiles={profiles} />

          <Tabs defaultValue="profiles" className="mt-8">
            <TabsList className="grid w-full grid-cols-5">
              <TabsTrigger value="profiles">Profile Management</TabsTrigger>
              <TabsTrigger value="verifications">Verifications</TabsTrigger>
              <TabsTrigger value="messaging">Messaging</TabsTrigger>
              <TabsTrigger value="content">Content Management</TabsTrigger>
              <TabsTrigger value="analytics">Analytics</TabsTrigger>
            </TabsList>
            
            <TabsContent value="profiles" className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span>Profile Management</span>
                    <div className="flex gap-2">
                      <div className="relative">
                        <Search className="h-4 w-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
                        <Input
                          placeholder="Search profiles..."
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                          className="pl-10 w-64"
                        />
                      </div>
                      <select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        className="px-3 py-2 border border-border rounded-md bg-background"
                      >
                        <option value="all">All Status</option>
                        <option value="pending">Pending</option>
                        <option value="approved">Approved</option>
                        <option value="rejected">Rejected</option>
                        <option value="inactive">Inactive</option>
                      </select>
                    </div>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ProfileManagementTable 
                    profiles={filteredProfiles}
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
            
            <TabsContent value="content" className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle>Content Management</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-8">
                    <p className="text-muted-foreground">Content management features coming soon...</p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="analytics" className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle>Analytics</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-8">
                    <p className="text-muted-foreground">Analytics dashboard coming soon...</p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default AdminDashboard;
