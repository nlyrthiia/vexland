import React, { useRef, useState, useEffect } from 'react';
import { useVexLandInfoUpgrade } from '@/context/VexLandInfoUpgradeContext';
import { useAccount, usePublicClient } from 'wagmi';
import { parsePlayerData, VEXLAND_ABI } from '@/lib/vexlandContract';
import { CONTRACT_ADDRESS } from '@/constants';

interface BackpackModalProps {
  onClose: () => void;
}

interface InventoryItem {
  id: string;
  name: string;
  description: string;
  image: string;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
}

const INVENTORY_ROWS = 4;
const INVENTORY_COLS = 5;
const INVENTORY_SIZE = INVENTORY_ROWS * INVENTORY_COLS;

// Default inventory items
const DEFAULT_ITEMS: InventoryItem[] = [
  {
    id: 'season-pass',
    name: 'Season Pass',
    description:
      'A prestigious pass that proves your participation in this season of VexLand. This exclusive item represents your dedication to the game and grants you access to special seasonal content. Hold onto it as a badge of honor from your adventures in the dungeon. In the future, this pass will allow you to earn substantial VexLand points.',
    image: '/imgs/assets/pass.png',
    rarity: 'legendary'
  }
];

const BackpackModal: React.FC<BackpackModalProps> = ({ onClose }) => {
  const infoUpgrade = useVexLandInfoUpgrade();
  const { address } = useAccount();
  
  const publicClient = usePublicClient();
  const modalRef = useRef<HTMLDivElement>(null);
  const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(null);
  const [showTooltip, setShowTooltip] = useState(false);
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 });
  const [hasSeasonPass, setHasSeasonPass] = useState<boolean>(false);
  const [isLoadingSeasonPass, setIsLoadingSeasonPass] = useState<boolean>(false);

  useEffect(() => {
    const checkSeasonPass = async () => {
      if (!address) return;

      try {
        setIsLoadingSeasonPass(true);
        const result = await publicClient!.readContract({
          address: CONTRACT_ADDRESS,
          abi: VEXLAND_ABI,
          functionName: 'getPlayerData',
          args: [address as `0x${string}`],
        });
        const playerData = parsePlayerData(result as any);
        setHasSeasonPass(playerData?.seasonPassPurchased ?? false);
      } catch (error) {
        console.error('Error checking season pass:', error);
        setHasSeasonPass(false);
      } finally {
        setIsLoadingSeasonPass(false);
      }
    };

    checkSeasonPass();
  }, [publicClient, address]);

  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
        onClose();
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [onClose]);

  React.useEffect(() => {
    const handleClickOutsideTooltip = (event: MouseEvent) => {
      setShowTooltip(false);
      setSelectedItem(null);
    };

    if (showTooltip) {
      document.addEventListener('mousedown', handleClickOutsideTooltip);
      return () => {
        document.removeEventListener('mousedown', handleClickOutsideTooltip);
      };
    }
  }, [showTooltip]);

  const handleItemClick = (item: InventoryItem | null, event: React.MouseEvent) => {
    if (item) {
      setSelectedItem(item);
      setShowTooltip(true);
      setTooltipPosition({ x: event.clientX, y: event.clientY });
    } else {
      setShowTooltip(false);
      setSelectedItem(null);
    }
  };

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case 'legendary':
        return 'text-yellow-400 border-yellow-400';
      case 'epic':
        return 'text-purple-400 border-purple-400';
      case 'rare':
        return 'text-blue-400 border-blue-400';
      default:
        return 'text-gray-400 border-gray-400';
    }
  };

  const bgColor = 'bg-gradient-to-br from-[#232323] via-[#18181a] to-[#2c2c2e]';
  const borderColor = 'border-4 border-[#6b4f1d] shadow-[0_0_24px_#000a]';
  const slotBorder = 'border-2 border-[#a88b4a]';
  const slotBg = 'bg-[#2c2c2e]';
  const slotHover = 'hover:border-yellow-400 hover:bg-[#3a2e1a] hover:shadow-lg transition-all duration-150';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-70 p-4">
      <div
        ref={modalRef}
        className={`flex flex-col md:flex-row w-full max-w-[700px] h-auto max-h-[90vh] md:h-[420px] rounded-xl ${bgColor} ${borderColor} p-0 overflow-hidden relative`}
        style={{ fontFamily: 'serif', boxShadow: '0 0 32px #000b' }}
      >
        {/* Character Image Section */}
        <div className="flex items-center justify-center w-full md:w-2/5 h-48 md:h-full bg-[#18181a] border-b-2 md:border-b-0 md:border-r-2 border-[#6b4f1d] p-4">
          <img
            src={`/imgs/role/${Math.random() < 0.5 ? 'walk' : 'attack'}.gif`}
            alt="Backpack"
            className="object-contain w-full max-w-xs bg-black h-32 md:h-48 drop-shadow-lg rounded-lg"
            style={{ boxShadow: '0 0 16px #000a' }}
          />
        </div>

        {/* Content Section */}
        <div className="flex-1 flex flex-col h-full p-4 md:p-6">
          {/* Score & Gold */}
          <div className="flex items-center justify-between mb-2">
            <div className="text-yellow-300 text-base md:text-lg font-bold flex items-center gap-1 md:gap-2">
              <span>Score:</span>
              <span>{infoUpgrade ? infoUpgrade.score.toFixed(0) : '0'}</span>
            </div>
            <div className="text-yellow-400 text-base md:text-lg font-bold flex items-center gap-1 md:gap-2">
              <span>Gold:</span>
              <span>{infoUpgrade ? infoUpgrade.goldCoins : '0'}</span>
            </div>
          </div>
          <div className="border-b border-[#a88b4a] my-2 opacity-60" />

          {/* Skills (Meta Upgrades) */}
          <div className="mb-3">
            <div className="text-[#e0c97f] font-semibold mb-1 text-sm md:text-base">Skills</div>
            {infoUpgrade ? (
              <div className="grid grid-cols-2 md:grid-cols-2 gap-x-2 md:gap-x-6 gap-y-1 text-xs md:text-sm text-[#f3e7c2]">
                <div>
                  Health Level: <span className="font-bold">{infoUpgrade.metaUpgrades.healthLevel}</span>
                </div>
                <div>
                  Overall Damage Level: <span className="font-bold">{infoUpgrade.metaUpgrades.overallDamageLevel}</span>
                </div>
                <div>
                  Movement Speed Level: <span className="font-bold">{infoUpgrade.metaUpgrades.movementSpeedLevel}</span>
                </div>
                <div>
                  XP Gatherer Level: <span className="font-bold">{infoUpgrade.metaUpgrades.xpGathererLevel}</span>
                </div>
                <div>
                  Gold Gatherer Level: <span className="font-bold">{infoUpgrade.metaUpgrades.goldGathererLevel}</span>
                </div>
              </div>
            ) : (
              <div className="text-gray-400 text-sm">No data available</div>
            )}
          </div>

          {/* Inventory Grid */}
          <div className="flex-1 flex flex-col justify-end">
            <div className="grid grid-cols-5 gap-1 md:gap-2">
              {Array.from({ length: INVENTORY_SIZE }).map((_, idx) => {
                // Only show Season Pass if user has purchased it
                const item =
                  idx === 0 && hasSeasonPass
                    ? DEFAULT_ITEMS[0]
                    : DEFAULT_ITEMS.find((item) => item.id === `item-${idx}`) || null;

                return (
                  <div
                    key={idx}
                    className={`w-8 h-8 md:w-12 md:h-12 ${slotBg} ${slotBorder} rounded-md flex items-center justify-center cursor-pointer ${slotHover} relative`}
                    style={{ boxShadow: '0 0 6px #0008' }}
                    title={item ? item.name : `Slot ${idx + 1}`}
                    onClick={(e) => handleItemClick(item, e)}
                  >
                    {item && (
                      <>
                        <img src={item.image} alt={item.name} className="w-6 h-6 md:w-8 md:h-8 object-contain" />
                        {/* <div
                          className={`absolute -top-1 -right-1 w-2 h-2 md:w-3 md:h-3 rounded-full border ${getRarityColor(
                            item.rarity
                          )}`}
                        ></div> */}
                      </>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Item Tooltip */}
          {showTooltip && selectedItem && (
            <div
              className="fixed bg-[#1a1a1a] border-2 border-[#6b4f1d] rounded-lg p-3 max-w-xs shadow-2xl"
              style={{
                left: tooltipPosition.x + 10,
                top: tooltipPosition.y - 10,
                transform: 'translateY(-100%)',
                zIndex: 1000
              }}
            >
              <div className={`text-sm font-bold mb-1 ${getRarityColor(selectedItem.rarity)}`}>{selectedItem.name}</div>
              <div className="text-xs text-[#f3e7c2] leading-relaxed">{selectedItem.description}</div>
              <div className={`text-xs mt-2 ${getRarityColor(selectedItem.rarity)}`}>
                {selectedItem.rarity.charAt(0).toUpperCase() + selectedItem.rarity.slice(1)} Item
              </div>
            </div>
          )}

          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute right-2 md:right-4 top-2 md:top-4 px-2 md:px-4 py-1 rounded bg-[#a88b4a] text-white font-bold shadow hover:bg-yellow-600 transition-all text-xs md:text-sm"
            style={{ letterSpacing: 1 }}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default BackpackModal;
