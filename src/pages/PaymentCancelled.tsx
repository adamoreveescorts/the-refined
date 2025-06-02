
import { useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";

const PaymentCancelled = () => {
  const navigate = useNavigate();

  useEffect(() => {
    toast.info("Payment was cancelled. You can try again anytime.");
  }, []);

  return (
    <div className="min-h-screen bg-background flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      {/* Back to Home Button */}
      <div className="fixed top-4 left-4 z-10">
        <Link to="/">
          <Button variant="ghost" size="sm" className="flex items-center gap-1 text-navy hover:text-gold">
            <ArrowLeft size={16} />
            Back to Home
          </Button>
        </Link>
      </div>
      
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <h2 className="mt-6 text-3xl font-serif font-bold text-navy">
            The Refined Escort
          </h2>
        </div>

        <Card className="w-full">
          <CardHeader className="text-center">
            <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
              <XCircle className="w-8 h-8 text-red-600" />
            </div>
            <CardTitle className="text-xl font-semibold text-red-900">
              Payment Cancelled
            </CardTitle>
            <CardDescription className="text-gray-600">
              Your payment was cancelled and no charges were made to your account.
            </CardDescription>
          </CardHeader>
          
          <CardContent className="space-y-4">
            <div className="text-sm text-gray-600 text-center">
              <p>Don't worry - you can try again at any time. Your registration details have been saved.</p>
            </div>
            
            <div className="space-y-3">
              <Button 
                onClick={() => navigate('/auth?tab=signup')}
                className="w-full btn-gold"
              >
                Try Payment Again
              </Button>
              
              <Button 
                variant="outline"
                onClick={() => navigate('/auth')}
                className="w-full"
              >
                Back to Login
              </Button>
              
              <Button 
                variant="ghost"
                onClick={() => navigate('/')}
                className="w-full text-gray-600"
              >
                Return to Home
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default PaymentCancelled;
