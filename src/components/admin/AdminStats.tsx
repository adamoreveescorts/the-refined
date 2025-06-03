
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, UserCheck, UserX, Star } from 'lucide-react';

interface AdminStatsProps {
  profiles: any[];
}

const AdminStats = ({ profiles }: AdminStatsProps) => {
  const totalProfiles = profiles.length;
  const pendingProfiles = profiles.filter(p => p.status === 'pending').length;
  const approvedProfiles = profiles.filter(p => p.status === 'approved').length;
  const featuredProfiles = profiles.filter(p => p.featured).length;

  const stats = [
    {
      title: 'Total Profiles',
      value: totalProfiles,
      icon: Users,
      color: 'text-blue-600'
    },
    {
      title: 'Pending Review',
      value: pendingProfiles,
      icon: UserX,
      color: 'text-orange-600'
    },
    {
      title: 'Approved',
      value: approvedProfiles,
      icon: UserCheck,
      color: 'text-green-600'
    },
    {
      title: 'Featured',
      value: featuredProfiles,
      icon: Star,
      color: 'text-gold'
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {stats.map((stat, index) => (
        <Card key={index}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
            <stat.icon className={`h-4 w-4 ${stat.color}`} />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stat.value}</div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default AdminStats;
