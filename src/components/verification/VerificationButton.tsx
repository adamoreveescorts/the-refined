
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Shield, CheckCircle, Clock, XCircle } from 'lucide-react';

interface VerificationButtonProps {
  userRole: string;
  subscription: any;
  userId: string;
}

const VerificationButton = ({ userRole, subscription, userId }: VerificationButtonProps) => {
  const navigate = useNavigate();
  const [verification, setVerification] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkVerificationStatus();
  }, [userId]);

  const checkVerificationStatus = async () => {
    try {
      const { data } = await supabase
        .from('photo_verifications')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      setVerification(data);
    } catch (error) {
      // No verification found is fine
      setVerification(null);
    } finally {
      setLoading(false);
    }
  };

  // Only show for escorts and agencies
  if (userRole !== 'escort' && userRole !== 'agency') {
    return null;
  }

  // Only show if user has access (Platinum or Trial)
  const hasAccess = subscription?.subscription_tier === 'Platinum' || subscription?.is_trial_active;
  
  if (!hasAccess) {
    return null;
  }

  if (loading) {
    return (
      <div className="flex items-center">
        <div className="w-4 h-4 border-2 border-muted border-t-transparent rounded-full animate-spin mr-2"></div>
        <span className="text-sm text-muted-foreground">Checking verification...</span>
      </div>
    );
  }

  const getVerificationDisplay = () => {
    if (!verification) {
      return (
        <Button 
          onClick={() => navigate('/photo-verification')}
          className="bg-blue-500 hover:bg-blue-600 text-white"
        >
          <Shield className="h-4 w-4 mr-2" />
          Get Verified
        </Button>
      );
    }

    switch (verification.status) {
      case 'approved':
        return (
          <div className="flex items-center space-x-2">
            <Badge className="bg-green-500">
              <CheckCircle className="h-3 w-3 mr-1" />
              Verified
            </Badge>
          </div>
        );
      
      case 'pending':
        return (
          <div className="flex items-center space-x-2">
            <Badge className="bg-amber-500">
              <Clock className="h-3 w-3 mr-1" />
              Under Review
            </Badge>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => navigate('/photo-verification')}
            >
              View Status
            </Button>
          </div>
        );
      
      case 'rejected':
        return (
          <div className="flex items-center space-x-2">
            <Badge variant="destructive">
              <XCircle className="h-3 w-3 mr-1" />
              Rejected
            </Badge>
            <Button 
              onClick={() => navigate('/photo-verification')}
              size="sm"
              className="bg-blue-500 hover:bg-blue-600 text-white"
            >
              Resubmit
            </Button>
          </div>
        );
      
      default:
        return (
          <Button 
            onClick={() => navigate('/photo-verification')}
            className="bg-blue-500 hover:bg-blue-600 text-white"
          >
            <Shield className="h-4 w-4 mr-2" />
            Get Verified
          </Button>
        );
    }
  };

  return (
    <div className="flex items-center">
      {getVerificationDisplay()}
    </div>
  );
};

export default VerificationButton;
