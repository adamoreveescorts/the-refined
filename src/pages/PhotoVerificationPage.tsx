
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import NavBar from '@/components/NavBar';
import Footer from '@/components/Footer';
import CameraCapture from '@/components/verification/CameraCapture';
import VerificationStatus from '@/components/verification/VerificationStatus';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Shield, ArrowLeft } from 'lucide-react';

const PhotoVerificationPage = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [showCamera, setShowCamera] = useState(false);
  const [userProfile, setUserProfile] = useState<any>(null);
  const [subscription, setSubscription] = useState<any>(null);
  const [verification, setVerification] = useState<any>(null);
  const [canStartVerification, setCanStartVerification] = useState(false);

  useEffect(() => {
    checkAccess();
  }, []);

  const checkAccess = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        toast.error('Please log in to access verification');
        navigate('/auth');
        return;
      }

      // Get user profile
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', session.user.id)
        .single();

      if (profileError) {
        console.error('Error fetching profile:', profileError);
        toast.error('Failed to load profile');
        navigate('/user-profile');
        return;
      }

      setUserProfile(profile);

      // Check if user is escort or agency
      if (profile.role !== 'escort' && profile.role !== 'agency') {
        toast.error('Photo verification is only available for escorts and agencies');
        navigate('/user-profile');
        return;
      }

      // Check subscription status
      const { data: subData, error: subError } = await supabase.functions.invoke('check-subscription', {
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });

      if (subError) {
        console.error('Error checking subscription:', subError);
        toast.error('Failed to check subscription status');
        navigate('/user-profile');
        return;
      }

      setSubscription(subData);

      // Check if user has access to verification (Platinum or Trial)
      const hasAccess = subData.subscription_tier === 'Platinum' || subData.is_trial_active;
      
      if (!hasAccess) {
        toast.error('Photo verification requires a Platinum subscription or active trial');
        navigate('/user-profile');
        return;
      }

      // Check existing verification
      const { data: verificationData } = await supabase
        .from('photo_verifications')
        .select('*')
        .eq('user_id', session.user.id)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      setVerification(verificationData);
      
      // Can start verification if no pending verification exists
      setCanStartVerification(!verificationData || verificationData.status === 'rejected');
      
    } catch (error) {
      console.error('Access check error:', error);
      toast.error('An error occurred');
      navigate('/user-profile');
    } finally {
      setLoading(false);
    }
  };

  const handlePhotoCapture = async (photoBlob: Blob) => {
    setUploading(true);
    
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('No session');

      // Upload photo to storage
      const fileName = `${session.user.id}/${Date.now()}.jpg`;
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('verification-photos')
        .upload(fileName, photoBlob, {
          contentType: 'image/jpeg',
          upsert: false
        });

      if (uploadError) throw uploadError;

      // Save verification record
      const { error: insertError } = await supabase
        .from('photo_verifications')
        .insert({
          user_id: session.user.id,
          verification_photo_url: uploadData.path,
          profile_photo_url: userProfile?.profile_picture || null,
          status: 'pending'
        });

      if (insertError) throw insertError;

      toast.success('Verification photo submitted successfully! Review typically takes 24-48 hours.');
      setShowCamera(false);
      checkAccess(); // Refresh data
      
    } catch (error) {
      console.error('Upload error:', error);
      toast.error('Failed to submit verification photo. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  const startVerification = () => {
    setShowCamera(true);
  };

  const cancelCapture = () => {
    setShowCamera(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <NavBar />
        <div className="flex-grow flex items-center justify-center">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-secondary border-t-transparent rounded-full animate-spin mx-auto"></div>
            <p className="mt-4 text-foreground">Loading...</p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <NavBar />
      
      <main className="flex-grow py-8">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-4xl">
          <div className="mb-6">
            <Button variant="outline" onClick={() => navigate('/user-profile')} className="mb-4">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Profile
            </Button>
            
            <h1 className="text-3xl font-serif font-bold text-foreground mb-2">
              Photo Verification
            </h1>
            <p className="text-muted-foreground">
              Verify your identity to access premium features and build trust with clients
            </p>
          </div>

          {uploading && (
            <Card className="mb-6">
              <CardContent className="p-6">
                <div className="flex items-center justify-center space-x-2">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-gold"></div>
                  <span>Uploading verification photo...</span>
                </div>
              </CardContent>
            </Card>
          )}

          {showCamera ? (
            <CameraCapture 
              onPhotoCapture={handlePhotoCapture}
              onCancel={cancelCapture}
            />
          ) : (
            <div className="space-y-6">
              <VerificationStatus verification={verification} />
              
              {canStartVerification && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Shield className="h-5 w-5 mr-2" />
                      Start Verification Process
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                      <h3 className="font-medium text-blue-900 mb-2">Verification Requirements:</h3>
                      <ul className="text-sm text-blue-800 space-y-1">
                        <li>• Take a clear, well-lit photo of yourself</li>
                        <li>• Face should be clearly visible and match your profile picture</li>
                        <li>• No filters, editing, or covering of face</li>
                        <li>• Hold up a piece of paper with your username written on it (optional but recommended)</li>
                      </ul>
                    </div>
                    
                    {userProfile?.profile_picture && (
                      <div>
                        <p className="text-sm text-muted-foreground mb-2">Your current profile picture:</p>
                        <img 
                          src={userProfile.profile_picture} 
                          alt="Profile" 
                          className="w-32 h-32 rounded-lg object-cover border"
                        />
                      </div>
                    )}
                    
                    <Button onClick={startVerification} size="lg" className="w-full">
                      Start Photo Verification
                    </Button>
                  </CardContent>
                </Card>
              )}
            </div>
          )}
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default PhotoVerificationPage;
