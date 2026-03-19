import React, { createContext, useContext, useEffect, useState } from 'react';

export interface MetaUpgrades { healthLevel: number; overallDamageLevel: number; movementSpeedLevel: number; xpGathererLevel: number; goldGathererLevel: number; }
export interface VexLandInfoUpgradeData { vexLandType: string; score: number; goldCoins: number; metaUpgrades: MetaUpgrades; }

const VexLandInfoUpgradeContext = createContext<VexLandInfoUpgradeData | null>(null);

export const VexLandInfoUpgradeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [infoUpgrade, setInfoUpgrade] = useState<VexLandInfoUpgradeData | null>(null);
  useEffect(() => {
    const handler = (event: MessageEvent) => {
      const data = event.data;
      if (data && data.vexLandType === 'infoUpgrade') {
        setInfoUpgrade(data);
      }
    };
    window.addEventListener('message', handler);
    return () => window.removeEventListener('message', handler);
  }, []);
  return <VexLandInfoUpgradeContext.Provider value={infoUpgrade}>{children}</VexLandInfoUpgradeContext.Provider>;
};

export const useVexLandInfoUpgrade = () => useContext(VexLandInfoUpgradeContext);
