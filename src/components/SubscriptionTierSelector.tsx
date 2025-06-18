
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, Star, Crown, Shield, Clock, Users } from "lucide-react";

export interface SubscriptionTier {
  id: string;
  name: string;
  price: number;
  duration: string;
  durationDays: number;
  features: string[];
  recommended?: boolean;
  trial?: boolean;
  perSeat?: boolean;
}

const SUBSCRIPTION_TIERS: SubscriptionTier[] = [
  {
    id: "trial",
    name: "Free Trial",
    price: 0,
    duration: "7 Days",
    durationDays: 7,
    trial: true,
    features: [
      "Photo verification",
      "Featured escort status",
      "Enhanced profile visibility",
      "Priority search ranking",
      "Premium messaging features",
      "Unlimited photo uploads",
      "Trial period - 7 days only"
    ]
  },
  {
    id: "basic",
    name: "Basic",
    price: 0,
    duration: "Forever",
    durationDays: 0,
    features: [
      "Basic profile listing",
      "Limited photo uploads (3 photos)",
      "Minimal search visibility",
      "Basic messaging"
    ]
  },
  {
    id: "platinum_weekly",
    name: "Platinum Weekly",
    price: 15,
    duration: "1 Week",
    durationDays: 7,
    features: [
      "Photo verification",
      "Featured escort status",
      "Enhanced profile visibility",
      "Priority search ranking",
      "Premium messaging features",
      "Unlimited photo uploads"
    ]
  },
  {
    id: "platinum_monthly",
    name: "Platinum Monthly",
    price: 79,
    duration: "1 Month",
    durationDays: 30,
    features: [
      "Photo verification",
      "Featured escort status",
      "Enhanced profile visibility",
      "Priority search ranking",
      "Premium messaging features",
      "Unlimited photo uploads"
    ],
    recommended: true
  },
  {
    id: "platinum_quarterly",
    name: "Platinum Quarterly",
    price: 189,
    duration: "3 Months",
    durationDays: 90,
    features: [
      "Photo verification",
      "Featured escort status",
      "Enhanced profile visibility",
      "Priority search ranking",
      "Premium messaging features",
      "Unlimited photo uploads"
    ]
  },
  {
    id: "platinum_yearly",
    name: "Platinum Yearly",
    price: 399,
    duration: "1 Year",
    durationDays: 365,
    features: [
      "Photo verification",
      "Featured escort status",
      "Enhanced profile visibility",
      "Priority search ranking",
      "Premium messaging features",
      "Unlimited photo uploads"
    ]
  }
];

// Agency-specific tiers (per seat pricing)
const AGENCY_SUBSCRIPTION_TIERS: SubscriptionTier[] = [
  {
    id: "agency_weekly",
    name: "Agency Weekly",
    price: 15,
    duration: "1 Week per Escort",
    durationDays: 7,
    perSeat: true,
    features: [
      "Manage multiple escorts",
      "Per-escort billing",
      "All Platinum features per escort",
      "Agency dashboard",
      "Escort profile management",
      "Bulk operations"
    ]
  },
  {
    id: "agency_monthly",
    name: "Agency Monthly",
    price: 79,
    duration: "1 Month per Escort",
    durationDays: 30,
    perSeat: true,
    recommended: true,
    features: [
      "Manage multiple escorts",
      "Per-escort billing",
      "All Platinum features per escort",
      "Agency dashboard",
      "Escort profile management",
      "Bulk operations",
      "Priority support"
    ]
  },
  {
    id: "agency_quarterly",
    name: "Agency Quarterly",
    price: 189,
    duration: "3 Months per Escort",
    durationDays: 90,
    perSeat: true,
    features: [
      "Manage multiple escorts",
      "Per-escort billing",
      "All Platinum features per escort",
      "Agency dashboard",
      "Escort profile management",
      "Bulk operations",
      "Advanced analytics"
    ]
  },
  {
    id: "agency_yearly",
    name: "Agency Yearly",
    price: 399,
    duration: "1 Year per Escort",
    durationDays: 365,
    perSeat: true,
    features: [
      "Manage multiple escorts",
      "Per-escort billing",
      "All Platinum features per escort",
      "Agency dashboard",
      "Escort profile management",
      "Bulk operations",
      "Advanced analytics",
      "Best value"
    ]
  }
];

interface SubscriptionTierSelectorProps {
  onTierSelect: (tier: SubscriptionTier) => void;
  selectedTier?: string;
  currentTier?: string;
  role: "escort" | "agency";
  hasUsedTrial?: boolean;
}

const SubscriptionTierSelector = ({ onTierSelect, selectedTier, currentTier, role, hasUsedTrial = false }: SubscriptionTierSelectorProps) => {
  const [loading, setLoading] = useState<string | null>(null);

  const handleSelectTier = async (tier: SubscriptionTier) => {
    if (tier.id === currentTier) return; // Don't allow selecting current tier
    
    setLoading(tier.id);
    try {
      onTierSelect(tier);
    } finally {
      setLoading(null);
    }
  };

  const getTierIcon = (tierId: string) => {
    if (tierId === "basic") return <Shield className="h-6 w-6" />;
    if (tierId === "trial") return <Clock className="h-6 w-6 text-blue-500" />;
    if (tierId.startsWith("agency_")) return <Users className="h-6 w-6 text-purple-500" />;
    return <Crown className="h-6 w-6 text-gold" />;
  };

  const isCurrentTier = (tierId: string) => {
    if (currentTier === 'Basic' && tierId === 'basic') return true;
    if (currentTier === 'Trial' && tierId === 'trial') return true;
    if (currentTier === 'Platinum' && tierId.startsWith('platinum_')) return true;
    return false;
  };

  // Choose tiers based on role
  const tiers = role === 'agency' ? AGENCY_SUBSCRIPTION_TIERS : SUBSCRIPTION_TIERS;
  
  // Filter out trial tier if user has already used it (except for agencies)
  const availableTiers = tiers.filter(tier => {
    if (tier.trial && hasUsedTrial && role !== 'agency') return false;
    return true;
  });

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-serif font-bold text-foreground mb-2">
          Choose Your {role === "escort" ? "Escort" : "Agency"} Plan
        </h2>
        {role === 'agency' ? (
          <p className="text-muted-foreground">
            Per-escort pricing model. Pay only for active escorts in your agency.
          </p>
        ) : (
          <p className="text-muted-foreground">
            Start with a free trial to experience all premium features, then select the plan that best fits your needs.
          </p>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {availableTiers.map((tier) => {
          const isCurrent = isCurrentTier(tier.id);
          
          return (
            <Card 
              key={tier.id} 
              className={`relative transition-all duration-200 hover:shadow-lg ${
                selectedTier === tier.id ? 'ring-2 ring-gold' : ''
              } ${tier.recommended ? 'border-gold' : ''} ${
                tier.trial ? 'border-blue-500' : ''
              } ${tier.perSeat ? 'border-purple-500' : ''} ${
                isCurrent ? 'ring-2 ring-green-500 bg-accent' : ''
              }`}
            >
              {tier.trial && !hasUsedTrial && !isCurrent && (
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                  <Badge className="bg-blue-500 text-white px-3 py-1">
                    <Clock className="h-3 w-3 mr-1" />
                    Free Trial
                  </Badge>
                </div>
              )}
              
              {tier.recommended && !isCurrent && (
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                  <Badge className="bg-gold text-white px-3 py-1">
                    <Star className="h-3 w-3 mr-1" />
                    Most Popular
                  </Badge>
                </div>
              )}

              {tier.perSeat && !isCurrent && (
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                  <Badge className="bg-purple-500 text-white px-3 py-1">
                    <Users className="h-3 w-3 mr-1" />
                    Per Escort
                  </Badge>
                </div>
              )}
              
              {isCurrent && (
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                  <Badge className="bg-green-500 text-white px-3 py-1">
                    <CheckCircle className="h-3 w-3 mr-1" />
                    Current Plan
                  </Badge>
                </div>
              )}
              
              <CardHeader className="text-center pb-4">
                <div className="flex justify-center mb-2">
                  {getTierIcon(tier.id)}
                </div>
                <CardTitle className="text-foreground">{tier.name}</CardTitle>
                <CardDescription>
                  <div className="text-2xl font-bold text-foreground">
                    {tier.price === 0 ? "Free" : `$${tier.price} AUD`}
                    {tier.perSeat && <span className="text-sm font-normal"> per escort</span>}
                  </div>
                  <div className="text-sm text-muted-foreground">{tier.duration}</div>
                </CardDescription>
              </CardHeader>
              
              <CardContent className="space-y-4">
                <ul className="space-y-2">
                  {tier.features.map((feature, index) => (
                    <li key={index} className="flex items-start text-sm">
                      <CheckCircle className="h-4 w-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                      <span className="text-foreground">{feature}</span>
                    </li>
                  ))}
                </ul>
                
                <Button
                  onClick={() => handleSelectTier(tier)}
                  disabled={loading === tier.id || isCurrent}
                  className={`w-full ${
                    isCurrent 
                      ? "bg-green-500 hover:bg-green-500 cursor-not-allowed text-white" 
                      : tier.trial
                        ? "bg-blue-500 hover:bg-blue-600 text-white"
                        : tier.perSeat
                          ? "bg-purple-500 hover:bg-purple-600 text-white"
                          : tier.id === "basic" 
                            ? "bg-muted hover:bg-muted/80 text-muted-foreground" 
                            : "btn-gold"
                  }`}
                >
                  {loading === tier.id ? "Processing..." : 
                   isCurrent ? "Your Current Plan" :
                   tier.trial ? "Start Free Trial" :
                   tier.price === 0 ? "Select Free Plan" : 
                   tier.perSeat ? "Select Agency Plan" : "Upgrade to Platinum"}
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
};

export default SubscriptionTierSelector;
export { SUBSCRIPTION_TIERS, AGENCY_SUBSCRIPTION_TIERS };
