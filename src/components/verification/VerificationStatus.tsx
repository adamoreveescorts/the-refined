
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle, Clock, XCircle, AlertCircle } from 'lucide-react';

interface VerificationData {
  id: string;
  status: 'pending' | 'approved' | 'rejected';
  submitted_at: string;
  reviewed_at?: string;
  admin_notes?: string;
}

interface VerificationStatusProps {
  verification: VerificationData | null;
  loading?: boolean;
}

const VerificationStatus = ({ verification, loading }: VerificationStatusProps) => {
  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gold"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!verification) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <AlertCircle className="h-5 w-5 mr-2 text-amber-500" />
            Photo Verification Required
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            To access premium features, you need to complete photo verification. 
            This helps maintain trust and safety in our community.
          </p>
        </CardContent>
      </Card>
    );
  }

  const getStatusIcon = () => {
    switch (verification.status) {
      case 'approved':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'rejected':
        return <XCircle className="h-5 w-5 text-red-500" />;
      case 'pending':
      default:
        return <Clock className="h-5 w-5 text-amber-500" />;
    }
  };

  const getStatusBadge = () => {
    switch (verification.status) {
      case 'approved':
        return <Badge className="bg-green-500">Verified</Badge>;
      case 'rejected':
        return <Badge variant="destructive">Rejected</Badge>;
      case 'pending':
      default:
        return <Badge className="bg-amber-500">Under Review</Badge>;
    }
  };

  const getStatusMessage = () => {
    switch (verification.status) {
      case 'approved':
        return 'Your photo verification has been approved! You now have access to all premium features.';
      case 'rejected':
        return 'Your photo verification was not approved. Please submit a new verification photo.';
      case 'pending':
      default:
        return 'Your verification photo is being reviewed. This usually takes 24-48 hours.';
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center">
            {getStatusIcon()}
            <span className="ml-2">Photo Verification Status</span>
          </div>
          {getStatusBadge()}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-muted-foreground">{getStatusMessage()}</p>
        
        <div className="text-sm text-muted-foreground">
          <p>Submitted: {new Date(verification.submitted_at).toLocaleDateString()}</p>
          {verification.reviewed_at && (
            <p>Reviewed: {new Date(verification.reviewed_at).toLocaleDateString()}</p>
          )}
        </div>

        {verification.admin_notes && verification.status === 'rejected' && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-md">
            <p className="text-sm text-red-800">
              <strong>Admin Notes:</strong> {verification.admin_notes}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default VerificationStatus;
