
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, Star, Crown, Shield, Clock } from "lucide-react";

export interface SubscriptionTier {
  id: string;
  name: string;
  price: number;
  duration: string;
  durationDays: number;
  features: string[];
  recommended?: boolean;
  trial?: boolean;
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
      "Basic profile listing",
      "Limited photo uploads (5 photos)",
      "Standard search visibility",
      "Basic messaging",
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
    return <Crown className="h-6 w-6 text-gold" />;
  };

  const isCurrentTier = (tierId: string) => {
    if (currentTier === 'Basic' && tierId === 'basic') return true;
    if (currentTier === 'Trial' && tierId === 'trial') return true;
    if (currentTier === 'Platinum' && tierId.startsWith('platinum_')) return true;
    return false;
  };

  // Filter out trial tier if user has already used it
  const availableTiers = SUBSCRIPTION_TIERS.filter(tier => {
    if (tier.trial && hasUsedTrial) return false;
    return true;
  });

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-serif font-bold text-navy mb-2">
          Choose Your {role === "escort" ? "Escort" : "Agency"} Plan
        </h2>
        <p className="text-gray-600">
          Start with a free trial, then select the plan that best fits your needs.
        </p>
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
              } ${
                isCurrent ? 'ring-2 ring-green-500 bg-green-50' : ''
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
                <CardTitle className="text-navy">{tier.name}</CardTitle>
                <CardDescription>
                  <div className="text-2xl font-bold text-navy">
                    {tier.price === 0 ? "Free" : `$${tier.price} AUD`}
                  </div>
                  <div className="text-sm text-gray-500">{tier.duration}</div>
                </CardDescription>
              </CardHeader>
              
              <CardContent className="space-y-4">
                <ul className="space-y-2">
                  {tier.features.map((feature, index) => (
                    <li key={index} className="flex items-start text-sm">
                      <CheckCircle className="h-4 w-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
                
                <Button
                  onClick={() => handleSelectTier(tier)}
                  disabled={loading === tier.id || isCurrent}
                  className={`w-full ${
                    isCurrent 
                      ? "bg-green-500 hover:bg-green-500 cursor-not-allowed" 
                      : tier.trial
                        ? "bg-blue-500 hover:bg-blue-600"
                        : tier.id === "basic" 
                          ? "bg-gray-600 hover:bg-gray-700" 
                          : "btn-gold"
                  }`}
                >
                  {loading === tier.id ? "Processing..." : 
                   isCurrent ? "Your Current Plan" :
                   tier.trial ? "Start Free Trial" :
                   tier.price === 0 ? "Select Free Plan" : "Upgrade to Platinum"}
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
export { SUBSCRIPTION_TIERS };
