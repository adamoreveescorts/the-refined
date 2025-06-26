
import { useState } from 'react';
import AgencyPackageSelector from './AgencyPackageSelector';

interface AgencySubscriptionSetupProps {
  onSubscriptionCreate: (packageType: number) => void;
  onTrialActivate: () => void;
  isLoading: boolean;
}

const AgencySubscriptionSetup = ({ onSubscriptionCreate, onTrialActivate, isLoading }: AgencySubscriptionSetupProps) => {
  const handlePackageSelect = (packageId: number) => {
    onSubscriptionCreate(packageId);
  };

  return (
    <AgencyPackageSelector
      onPackageSelect={handlePackageSelect}
      onTrialActivate={onTrialActivate}
      isLoading={isLoading}
    />
  );
};

export default AgencySubscriptionSetup;
