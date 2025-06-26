
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar, Download, FileSpreadsheet } from 'lucide-react';
import { toast } from 'sonner';

const AnalyticsExport = () => {
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [exportType, setExportType] = useState('all');
  const [isExporting, setIsExporting] = useState(false);

  const exportToCSV = (data: any[], filename: string) => {
    if (data.length === 0) {
      toast.error('No data to export');
      return;
    }

    const headers = Object.keys(data[0]);
    const csvContent = [
      headers.join(','),
      ...data.map(row => 
        headers.map(header => {
          const value = row[header];
          // Handle values that might contain commas or quotes
          if (typeof value === 'string' && (value.includes(',') || value.includes('"'))) {
            return `"${value.replace(/"/g, '""')}"`;
          }
          return value || '';
        }).join(',')
      )
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleExport = async () => {
    if (!startDate || !endDate) {
      toast.error('Please select both start and end dates');
      return;
    }

    if (new Date(startDate) > new Date(endDate)) {
      toast.error('Start date must be before end date');
      return;
    }

    setIsExporting(true);

    try {
      const dateFilter = (query: any) => 
        query.gte('created_at', startDate).lte('created_at', endDate);

      let exportData = [];
      const timestamp = new Date().toISOString().split('T')[0];

      switch (exportType) {
        case 'profiles':
          const { data: profiles, error: profilesError } = await supabase
            .from('profiles')
            .select('*')
            .gte('created_at', startDate)
            .lte('created_at', endDate);

          if (profilesError) throw profilesError;
          
          exportData = profiles?.map(profile => ({
            id: profile.id,
            display_name: profile.display_name,
            email: profile.email,
            role: profile.role,
            location: profile.location,
            verified: profile.verified,
            featured: profile.featured,
            is_active: profile.is_active,
            status: profile.status,
            created_at: profile.created_at,
            last_active: profile.last_active,
            view_count: profile.view_count,
            rating: profile.rating
          })) || [];

          exportToCSV(exportData, `profiles_${timestamp}.csv`);
          break;

        case 'messages':
          const { data: messages, error: messagesError } = await supabase
            .from('messages')
            .select('*')
            .gte('created_at', startDate)
            .lte('created_at', endDate);

          if (messagesError) throw messagesError;
          
          exportData = messages?.map(message => ({
            id: message.id,
            conversation_id: message.conversation_id,
            sender_id: message.sender_id,
            content: message.content,
            admin_reply: message.admin_reply,
            created_at: message.created_at,
            read_at: message.read_at
          })) || [];

          exportToCSV(exportData, `messages_${timestamp}.csv`);
          break;

        case 'verifications':
          const { data: verifications, error: verificationsError } = await supabase
            .from('photo_verifications')
            .select('*')
            .gte('created_at', startDate)
            .lte('created_at', endDate);

          if (verificationsError) throw verificationsError;
          
          exportData = verifications?.map(verification => ({
            id: verification.id,
            user_id: verification.user_id,
            status: verification.status,
            submitted_at: verification.submitted_at,
            reviewed_at: verification.reviewed_at,
            reviewed_by: verification.reviewed_by,
            admin_notes: verification.admin_notes
          })) || [];

          exportToCSV(exportData, `verifications_${timestamp}.csv`);
          break;

        case 'subscriptions':
          const { data: subscribers, error: subscribersError } = await supabase
            .from('subscribers')
            .select('*')
            .gte('created_at', startDate)
            .lte('created_at', endDate);

          if (subscribersError) throw subscribersError;
          
          exportData = subscribers?.map(sub => ({
            id: sub.id,
            user_id: sub.user_id,
            email: sub.email,
            subscription_tier: sub.subscription_tier,
            subscription_type: sub.subscription_type,
            subscription_status: sub.subscription_status,
            subscribed: sub.subscribed,
            is_trial_active: sub.is_trial_active,
            trial_start_date: sub.trial_start_date,
            trial_end_date: sub.trial_end_date,
            next_billing_date: sub.next_billing_date,
            expires_at: sub.expires_at,
            created_at: sub.created_at
          })) || [];

          exportToCSV(exportData, `subscriptions_${timestamp}.csv`);
          break;

        case 'all':
          // Export all data types in separate files
          const allQueries = await Promise.all([
            supabase.from('profiles').select('*').gte('created_at', startDate).lte('created_at', endDate),
            supabase.from('messages').select('*').gte('created_at', startDate).lte('created_at', endDate),
            supabase.from('photo_verifications').select('*').gte('created_at', startDate).lte('created_at', endDate),
            supabase.from('subscribers').select('*').gte('created_at', startDate).lte('created_at', endDate)
          ]);

          const [profilesRes, messagesRes, verificationsRes, subscribersRes] = allQueries;

          if (profilesRes.data) {
            const profileData = profilesRes.data.map(p => ({
              id: p.id, display_name: p.display_name, email: p.email, 
              role: p.role, location: p.location, verified: p.verified,
              featured: p.featured, is_active: p.is_active, status: p.status,
              created_at: p.created_at, last_active: p.last_active,
              view_count: p.view_count, rating: p.rating
            }));
            exportToCSV(profileData, `profiles_${timestamp}.csv`);
          }

          if (messagesRes.data) {
            const messageData = messagesRes.data.map(m => ({
              id: m.id, conversation_id: m.conversation_id, sender_id: m.sender_id,
              content: m.content, admin_reply: m.admin_reply, created_at: m.created_at,
              read_at: m.read_at
            }));
            exportToCSV(messageData, `messages_${timestamp}.csv`);
          }

          if (verificationsRes.data) {
            const verificationData = verificationsRes.data.map(v => ({
              id: v.id, user_id: v.user_id, status: v.status,
              submitted_at: v.submitted_at, reviewed_at: v.reviewed_at,
              reviewed_by: v.reviewed_by, admin_notes: v.admin_notes
            }));
            exportToCSV(verificationData, `verifications_${timestamp}.csv`);
          }

          if (subscribersRes.data) {
            const subscriptionData = subscribersRes.data.map(s => ({
              id: s.id, user_id: s.user_id, email: s.email,
              subscription_tier: s.subscription_tier, subscription_type: s.subscription_type,
              subscription_status: s.subscription_status, subscribed: s.subscribed,
              is_trial_active: s.is_trial_active, trial_start_date: s.trial_start_date,
              trial_end_date: s.trial_end_date, next_billing_date: s.next_billing_date,
              expires_at: s.expires_at, created_at: s.created_at
            }));
            exportToCSV(subscriptionData, `subscriptions_${timestamp}.csv`);
          }
          break;

        default:
          toast.error('Invalid export type selected');
          return;
      }

      toast.success('Data exported successfully!');
    } catch (error) {
      console.error('Export error:', error);
      toast.error('Failed to export data');
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <FileSpreadsheet className="h-5 w-5 mr-2" />
          Export Analytics Data
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="start-date">Start Date</Label>
            <Input
              id="start-date"
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="end-date">End Date</Label>
            <Input
              id="end-date"
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="export-type">Data to Export</Label>
          <Select value={exportType} onValueChange={setExportType}>
            <SelectTrigger>
              <SelectValue placeholder="Select data type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Data (Multiple Files)</SelectItem>
              <SelectItem value="profiles">Profiles Only</SelectItem>
              <SelectItem value="messages">Messages Only</SelectItem>
              <SelectItem value="verifications">Verifications Only</SelectItem>
              <SelectItem value="subscriptions">Subscriptions Only</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <Button
          onClick={handleExport}
          disabled={isExporting || !startDate || !endDate}
          className="w-full"
        >
          {isExporting ? (
            'Exporting...'
          ) : (
            <>
              <Download className="h-4 w-4 mr-2" />
              Export to CSV
            </>
          )}
        </Button>

        <div className="text-sm text-muted-foreground">
          <p>• CSV files will be downloaded to your device</p>
          <p>• Large date ranges may take longer to process</p>
          <p>• "All Data" option exports multiple CSV files</p>
        </div>
      </CardContent>
    </Card>
  );
};

export default AnalyticsExport;
