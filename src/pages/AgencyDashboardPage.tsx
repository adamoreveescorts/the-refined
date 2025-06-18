
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import NavBar from "@/components/NavBar";
import Footer from "@/components/Footer";
import AgencyDashboard from "@/components/agency/AgencyDashboard";

const AgencyDashboardPage = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [agencyId, setAgencyId] = useState<string | null>(null);
  
  useEffect(() => {
    checkAgencyAccess();
  }, []);

  const checkAgencyAccess = async () => {
    try {
      setLoading(true);
      
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        toast.error("Please log in to access your agency dashboard");
        navigate("/auth");
        return;
      }
      
      const { data: profile, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", session.user.id)
        .single();
        
      if (error) {
        console.error("Error fetching profile:", error);
        toast.error("Failed to load profile");
        navigate("/");
        return;
      }
      
      if (profile.role !== 'agency') {
        toast.error("Access denied. Agency account required.");
        navigate("/");
        return;
      }

      setAgencyId(profile.id);
    } catch (error) {
      console.error("Agency access error:", error);
      toast.error("An error occurred while loading your dashboard");
      navigate("/");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <NavBar />
        <div className="flex-grow flex items-center justify-center">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-secondary border-t-transparent rounded-full animate-spin mx-auto"></div>
            <p className="mt-4 text-foreground">Loading agency dashboard...</p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }
  
  if (!agencyId) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <NavBar />
        <div className="flex-grow flex items-center justify-center">
          <div className="text-center">
            <p className="text-red-500">Agency not found</p>
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
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <AgencyDashboard agencyId={agencyId} />
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default AgencyDashboardPage;
