
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Clock, Crown, Shield, AlertCircle } from "lucide-react";
import { toast } from "sonner";

interface FreeTrialConfirmDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  role: "escort" | "agency";
  onTrialActivated: () => void;
}

const FreeTrialConfirmDialog = ({ open, onOpenChange, role, onTrialActivated }: FreeTrialConfirmDialogProps) => {
  const [isActivating, setIsActivating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleActivateTrial = async () => {
    setIsActivating(true);
    setError(null);
    
    try {
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError || !session?.access_token) {
        throw new Error("Please log in to start your free trial");
      }

      console.log("Activating free trial for role:", role);

      const { data, error } = await supabase.functions.invoke('create-checkout', {
        body: { role, tier: 'trial' },
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });

      if (error) {
        console.error("Trial activation error:", error);
        
        // Handle specific error cases
        if (error.message?.includes("already been used")) {
          throw new Error("You have already used your free trial. Please select a different plan.");
        } else if (error.message?.includes("constraint")) {
          throw new Error("There was a database error. Please try again in a moment.");
        } else {
          throw new Error(error.message || "Failed to activate trial. Please try again.");
        }
      }

      if (data?.error) {
        throw new Error(data.error);
      }

      console.log("Trial activation successful:", data);
      toast.success("Free trial activated! You now have 7 days of premium features.");
      onTrialActivated();
      onOpenChange(false);
      
    } catch (error: any) {
      console.error("Trial activation error:", error);
      const errorMessage = error.message || "Failed to activate trial. Please try again.";
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsActivating(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center text-foreground">
            <Clock className="h-5 w-5 mr-2 text-blue-500" />
            Start Your Free Trial
          </DialogTitle>
          <DialogDescription className="text-muted-foreground">
            Unlock all premium features for 7 days, completely free!
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          <div className="space-y-3">
            <div className="flex items-center text-sm text-foreground">
              <Crown className="h-4 w-4 mr-2 text-gold" />
              Featured listing status
            </div>
            <div className="flex items-center text-sm text-foreground">
              <Shield className="h-4 w-4 mr-2 text-green-500" />
              Photo verification badge
            </div>
            <div className="flex items-center text-sm text-foreground">
              <Crown className="h-4 w-4 mr-2 text-gold" />
              Priority in search results
            </div>
            <div className="flex items-center text-sm text-foreground">
              <Shield className="h-4 w-4 mr-2 text-blue-500" />
              Unlimited photo uploads
            </div>
          </div>
          
          <div className="bg-muted/50 p-3 rounded-lg">
            <div className="text-sm text-muted-foreground">
              <strong>Note:</strong> This is a one-time offer. After 7 days, you can upgrade to a paid plan to continue enjoying premium features.
            </div>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3">
              <div className="flex items-start">
                <AlertCircle className="h-4 w-4 text-red-500 mr-2 mt-0.5 flex-shrink-0" />
                <div className="text-sm text-red-700">{error}</div>
              </div>
            </div>
          )}
        </div>

        <DialogFooter className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isActivating}
          >
            Cancel
          </Button>
          <Button
            onClick={handleActivateTrial}
            disabled={isActivating}
            className="bg-blue-500 hover:bg-blue-600 text-white"
          >
            {isActivating ? (
              <div className="flex items-center">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Activating...
              </div>
            ) : (
              "Start Free Trial"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default FreeTrialConfirmDialog;
