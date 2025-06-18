
import { supabase } from '@/integrations/supabase/client';

export const testVerificationWorkflow = async () => {
  console.log('🧪 Starting Photo Verification Workflow Test');
  
  try {
    // 1. Check if user is authenticated
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      console.error('❌ Test failed: No authenticated user');
      return { success: false, error: 'No authenticated user' };
    }
    console.log('✅ User authenticated:', session.user.id);

    // 2. Check user profile and role
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', session.user.id)
      .single();

    if (profileError) {
      console.error('❌ Profile fetch error:', profileError);
      return { success: false, error: 'Profile fetch failed' };
    }
    console.log('✅ Profile loaded, role:', profile.role);

    // 3. Check subscription status
    const { data: subData, error: subError } = await supabase.functions.invoke('check-subscription', {
      headers: {
        Authorization: `Bearer ${session.access_token}`,
      },
    });

    if (subError) {
      console.error('❌ Subscription check error:', subError);
      return { success: false, error: 'Subscription check failed' };
    }
    console.log('✅ Subscription checked, tier:', subData.subscription_tier);

    // 4. Check storage bucket accessibility
    const { data: buckets, error: bucketError } = await supabase.storage.listBuckets();
    if (bucketError) {
      console.error('❌ Storage bucket check error:', bucketError);
      return { success: false, error: 'Storage access failed' };
    }
    
    const verificationBucket = buckets.find(bucket => bucket.id === 'verification-photos');
    if (!verificationBucket) {
      console.error('❌ Verification photos bucket not found');
      return { success: false, error: 'Storage bucket missing' };
    }
    console.log('✅ Storage bucket accessible');

    // 5. Check existing verification status
    const { data: existingVerification, error: verificationError } = await supabase
      .from('photo_verifications')
      .select('*')
      .eq('user_id', session.user.id)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (verificationError) {
      console.error('❌ Verification fetch error:', verificationError);
      return { success: false, error: 'Verification status check failed' };
    }
    console.log('✅ Verification status checked:', existingVerification?.status || 'none');

    // 6. Test admin function access (if admin)
    if (profile.role === 'admin') {
      const { data: adminVerifications, error: adminError } = await supabase
        .from('photo_verifications')
        .select(`
          *,
          profiles!inner(
            id,
            display_name,
            username,
            email,
            profile_picture
          )
        `)
        .order('created_at', { ascending: false })
        .limit(5);

      if (adminError) {
        console.error('❌ Admin verification access error:', adminError);
        return { success: false, error: 'Admin access failed' };
      }
      console.log('✅ Admin verification access working, found:', adminVerifications.length, 'records');
    }

    console.log('🎉 All tests passed! Photo verification workflow is ready.');
    return { 
      success: true, 
      data: {
        user: profile,
        subscription: subData,
        existingVerification,
        canVerify: (profile.role === 'escort' || profile.role === 'agency') && 
                   (subData.subscription_tier === 'Platinum' || subData.is_trial_active) &&
                   (!existingVerification || existingVerification.status === 'rejected')
      }
    };

  } catch (error) {
    console.error('❌ Test workflow error:', error);
    return { success: false, error: error.message };
  }
};

export const createTestPhoto = (): Blob => {
  // Create a small test image blob for testing
  const canvas = document.createElement('canvas');
  canvas.width = 400;
  canvas.height = 400;
  const ctx = canvas.getContext('2d');
  
  if (ctx) {
    // Draw a simple test pattern
    ctx.fillStyle = '#4F46E5';
    ctx.fillRect(0, 0, 400, 400);
    ctx.fillStyle = '#FFFFFF';
    ctx.font = '20px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('Test Verification Photo', 200, 180);
    ctx.fillText(new Date().toISOString(), 200, 220);
  }
  
  return new Promise<Blob>((resolve) => {
    canvas.toBlob((blob) => {
      resolve(blob || new Blob());
    }, 'image/jpeg', 0.8);
  }) as any;
};
