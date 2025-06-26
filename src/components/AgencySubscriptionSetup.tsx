
import { useState } from 'react';
import AgencyPackageSelector from './AgencyPackageSelector';

interface AgencySubscriptionSetupProps {
  onSubscriptionCreate: (packageId: string, packageType: number) => void;
  isLoading: boolean;
}

const AgencySubscriptionSetup = ({ onSubscriptionCreate, isLoading }: AgencySubscriptionSetupProps) => {
  const handlePackageSelect = (packageId: string, packageType: number) => {
    onSubscriptionCreate(packageId, packageType);
  };

  return (
    <AgencyPackageSelector
      onPackageSelect={handlePackageSelect}
      isLoading={isLoading}
    />
  );
};

export default AgencySubscriptionSetup;
