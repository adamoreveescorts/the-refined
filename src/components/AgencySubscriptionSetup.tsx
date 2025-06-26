
import { useState } from 'react';
import AgencyPackageSelector from './AgencyPackageSelector';

interface AgencySubscriptionSetupProps {
  onSubscriptionCreate: (billingCycle: string, seats: number) => void;
  isLoading: boolean;
}

const AgencySubscriptionSetup = ({ onSubscriptionCreate, isLoading }: AgencySubscriptionSetupProps) => {
  const handlePackageSelect = (billingCycle: string, seats: number) => {
    onSubscriptionCreate(billingCycle, seats);
  };

  return (
    <AgencyPackageSelector
      onPackageSelect={handlePackageSelect}
      isLoading={isLoading}
    />
  );
};

export default AgencySubscriptionSetup;
