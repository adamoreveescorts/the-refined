
import { useState } from 'react';
import AgencyPackageSelector from './AgencyPackageSelector';

interface AgencySubscriptionSetupProps {
  onSubscriptionCreate: (packageType: number) => void;
  isLoading: boolean;
}

const AgencySubscriptionSetup = ({ onSubscriptionCreate, isLoading }: AgencySubscriptionSetupProps) => {
  const handlePackageSelect = (packageId: number) => {
    onSubscriptionCreate(packageId);
  };

  return (
    <AgencyPackageSelector
      onPackageSelect={handlePackageSelect}
      isLoading={isLoading}
    />
  );
};

export default AgencySubscriptionSetup;
