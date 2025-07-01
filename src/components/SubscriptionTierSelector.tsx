
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, Star, Crown, Shield, Clock, Zap } from "lucide-react";

export interface SubscriptionTier {
  id: string;
  name: string;
  price: number;
  duration: string;
  durationDays: number;
  features: string[];
  recommended?: boolean;
  trial?: boolean;
  recurring?: boolean;
  stripePriceId?: string;
}

const SUBSCRIPTION_TIERS: SubscriptionTier[] = [
  {
    id: "trial",
    name: "7-Day Free Trial",
    price: 0,
    duration: "7 Days",
    durationDays: 7,
    trial: true,
    features: [
      "7 days free access",
      "Same State base locations",
      "Ad positioning below standard ads",
      "6 photos (+ 1 main photo)",
      "Photo verification available",
      "Photo blurring available",
      "Manual boosting available"
    ]
  },
  {
    id: "package_1_weekly",
    name: "Limited Time Package 1",
    price: 15,
    duration: "Weekly",
    durationDays: 7,
    recurring: true,
    stripePriceId: "price_package_1_weekly_aud",
    features: [
      "1 week account period",
      "1 location base (within same area)",
      "Ad positioning below standard ads", 
      "Auto boosting - push ad to top each week",
      "Manual boosting available",
      "10 photos (+ 1 main photo)",
      "Photo verification available",
      "Photo blurring available"
    ]
  },
  {
    id: "package_2_monthly",
    name: "4 Weeks Package 2", 
    price: 79,
    duration: "Monthly",
    durationDays: 30,
    recurring: true,
    recommended: true,
    stripePriceId: "price_package_2_monthly_aud",
    features: [
      "4 week account period",
      "2 locations within 50km of each other",
      "By location ad positioning",
      "Auto boosting - push ad to top each week",
      "Manual boosting available", 
      "5 touring locations (when photo verified)",
      "15 photos (+ 1 main photo)",
      "Photo verification available",
      "Photo blurring available"
    ]
  },
  {
    id: "package_3_quarterly",
    name: "12 Weeks Package 3",
    price: 189,
    duration: "Quarterly", 
    durationDays: 84,
    recurring: true,
    stripePriceId: "price_package_3_quarterly_aud",
    features: [
      "12 weeks account period (or 1 week option)",
      "2 locations within 50km of each other", 
      "By location ad positioning",
      "Auto boosting - push ad to top each week",
      "Manual boosting available",
      "Homepage ad placement",
      "5 touring locations (when photo verified)",
      "30 photos (+ 1 main photo)",
      "Photo verification available", 
      "Photo blurring available"
    ]
  },
  {
    id: "package_4_yearly",
    name: "52 Weeks Package 4",
    price: 399,
    duration: "Yearly",
    durationDays: 365,
    recurring: true,
    stripePriceId: "price_package_4_yearly_aud",
    features: [
      "52 weeks account period",
      "4 locations within 100km of each other",
      "Premium by location ad positioning", 
      "Auto boosting - push ad to top each week",
      "Manual boosting available",
      "Homepage ad placement",
      "5 touring locations (when photo verified)",
      "50 photos (+ 1 main photo)",
      "Photo verification available",
      "Photo blurring available"
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
    if (tier.id === currentTier) return;
    
    setLoading(tier.id);
    try {
      onTierSelect(tier);
    } finally {
      setLoading(null);
    }
  };

  const getTierIcon = (tierId: string) => {
    if (tierId === "trial") return <Clock className="h-6 w-6 text-blue-500" />;
    if (tierId === "package_1_weekly") return <Clock className="h-6 w-6 text-blue-500" />;
    if (tierId === "package_2_monthly") return <Zap className="h-6 w-6 text-purple-500" />;
    if (tierId === "package_3_quarterly") return <Star className="h-6 w-6 text-gold" />;
    return <Crown className="h-6 w-6 text-gold" />;
  };

  const isCurrentTier = (tierId: string) => {
    if (currentTier === 'Trial' && tierId === 'trial') return true;
    if (currentTier === 'Package1' && tierId === 'package_1_weekly') return true;
    if (currentTier === 'Package2' && tierId === 'package_2_monthly') return true;
    if (currentTier === 'Package3' && tierId === 'package_3_quarterly') return true;
    if (currentTier === 'Package4' && tierId === 'package_4_yearly') return true;
    return false;
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-serif font-bold text-foreground mb-2">
          Choose Your Package
        </h2>
        <p className="text-muted-foreground">
          {hasUsedTrial 
            ? "Select a paid plan to continue your advertising." 
            : "Start with a 7-day free trial, then choose a plan that fits your needs."
          }
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {SUBSCRIPTION_TIERS.filter(tier => !(tier.trial && hasUsedTrial)).map((tier) => {
          const isCurrent = isCurrentTier(tier.id);
          
          return (
            <Card 
              key={tier.id} 
              className={`relative transition-all duration-200 hover:shadow-lg min-h-[600px] flex flex-col ${
                selectedTier === tier.id ? 'ring-2 ring-gold' : ''
              } ${tier.recommended ? 'border-gold' : ''} ${
                isCurrent ? 'ring-2 ring-green-500 bg-accent' : ''
              } ${tier.trial ? 'border-blue-500' : ''}`}
            >
              {tier.trial && !hasUsedTrial && (
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
                <CardTitle className="text-foreground text-lg">{tier.name}</CardTitle>
                <CardDescription>
                  <div className="text-2xl font-bold text-foreground">
                    {tier.price === 0 ? "Free" : `$${tier.price} AUD`}
                    {tier.recurring && <span className="text-sm font-normal">/{tier.duration.toLowerCase()}</span>}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {tier.trial ? "7 days free, then choose a plan" : 
                     tier.recurring ? `Billed ${tier.duration.toLowerCase()}` : tier.duration}
                  </div>
                </CardDescription>
              </CardHeader>
              
              <CardContent className="space-y-4 flex-1 flex flex-col">
                <ul className="space-y-2 flex-1">
                  {tier.features.map((feature, index) => (
                    <li key={index} className="flex items-start text-sm">
                      <CheckCircle className="h-4 w-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                      <span className="text-foreground">{feature}</span>  
                    </li>
                  ))}
                </ul>
                
                <Button
                  onClick={() => handleSelectTier(tier)}
                  disabled={loading === tier.id || isCurrent || (tier.trial && hasUsedTrial)}
                  className={`w-full mt-auto ${
                    isCurrent 
                      ? "bg-green-500 hover:bg-green-500 cursor-not-allowed text-white" 
                      : tier.trial 
                        ? "bg-blue-500 hover:bg-blue-600 text-white" 
                        : "btn-gold"
                  }`}
                >
                  {loading === tier.id ? "Processing..." : 
                   isCurrent ? "Your Current Plan" :
                   tier.trial && hasUsedTrial ? "Trial Used" :
                   tier.trial ? "Start Free Trial" : 
                   tier.recurring ? `Subscribe ${tier.duration}` : "Select Package"}
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
