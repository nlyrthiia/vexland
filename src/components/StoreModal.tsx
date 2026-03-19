import React, { useRef, useState, useEffect } from 'react';
import { useAccount, useWriteContract, usePublicClient } from 'wagmi';
import { SEASON_PASS_PRICE_WEI, SEASON_PASS_PRICE_DISPLAY, CONTRACT_ADDRESS } from '@/constants';
import { parsePlayerData, purchaseSeasonPassConfig, VEXLAND_ABI } from '@/lib/vexlandContract';
import { toast } from 'react-hot-toast';

interface StoreModalProps {
  onClose: () => void;
}

const StoreModal: React.FC<StoreModalProps> = ({ onClose }) => {
  const { address } = useAccount();
  const publicClient = usePublicClient();
  const { writeContract } = useWriteContract();
  const modalRef = useRef<HTMLDivElement>(null);
  const [hasSeasonPass, setHasSeasonPass] = useState<boolean>(false);
  const [isPurchasing, setIsPurchasing] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  useEffect(() => {
    const checkSeasonPass = async () => {
      if (!address || !publicClient) return;
      try {
        setIsLoading(true);
        const result = await publicClient.readContract({
          address: CONTRACT_ADDRESS, abi: VEXLAND_ABI, functionName: 'getPlayerData', args: [address],
        });
        const playerData = parsePlayerData(result as any);
        setHasSeasonPass(playerData?.seasonPassPurchased ?? false);
      } catch (error: any) {
        console.error('Error checking season pass:', error);
        setHasSeasonPass(false);
      } finally {
        setIsLoading(false);
      }
    };
    checkSeasonPass();
  }, [publicClient, address]);

  const handlePurchaseSeasonPass = async () => {
    if (!address) { toast.error('Wallet not connected'); return; }
    try {
      setIsPurchasing(true);
      if (!publicClient) { toast.error('Network not available'); setIsPurchasing(false); return; }
      const result = await publicClient.readContract({
        address: CONTRACT_ADDRESS, abi: VEXLAND_ABI, functionName: 'getPlayerData', args: [address],
      });
      const playerData = parsePlayerData(result as any);
      if (!playerData) { toast.error('Please check in first before purchasing Season Pass', { id: 'purchase' }); setIsPurchasing(false); return; }
      if (playerData.seasonPassPurchased) { toast.error('You already own the Season Pass', { id: 'purchase' }); setHasSeasonPass(true); setIsPurchasing(false); return; }

      writeContract(purchaseSeasonPassConfig(), {
        onSuccess: async () => {
          toast.loading('Confirming transaction…', { id: 'purchase' });
          try {
            await new Promise((resolve) => setTimeout(resolve, 3000));
            const updatedResult = await publicClient.readContract({
              address: CONTRACT_ADDRESS, abi: VEXLAND_ABI, functionName: 'getPlayerData', args: [address],
            });
            const updatedData = parsePlayerData(updatedResult as any);
            if (updatedData?.seasonPassPurchased) {
              toast.success('Season Pass purchased successfully!', { id: 'purchase' });
              setHasSeasonPass(true);
            } else {
              toast.error('Purchase may still be confirming. Please refresh.', { id: 'purchase' });
            }
          } catch (verifyError) {
            console.error('Post-purchase verification failed:', verifyError);
            toast.error('Transaction verification failed. Please refresh.', { id: 'purchase' });
          }
          setIsPurchasing(false);
        },
        onError: (error: Error) => {
          console.error('Purchase failed:', error);
          const errorMsg = error?.message || String(error);
          if (errorMsg.includes('Already has season pass')) {
            toast.error('You already own the Season Pass', { id: 'purchase' });
            setHasSeasonPass(true);
          } else {
            toast.error('Failed to purchase season pass', { id: 'purchase' });
          }
          setIsPurchasing(false);
        },
      });
    } catch (error: any) {
      console.error('Purchase preparation failed:', error);
      toast.error('Failed to prepare purchase transaction', { id: 'purchase' });
      setIsPurchasing(false);
    }
  };

  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(event.target as Node)) onClose();
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [onClose]);

  const bgColor = 'bg-gradient-to-br from-[#232323] via-[#18181a] to-[#2c2c2e]';
  const borderColor = 'border-4 border-[#6b4f1d] shadow-[0_0_24px_#000a]';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-70 p-2 sm:p-4">
      <div ref={modalRef} className={`w-full max-w-md rounded-xl ${bgColor} ${borderColor} p-4 sm:p-6 shadow-xl relative max-h-[90vh] overflow-y-auto`} style={{ fontFamily: 'serif', boxShadow: '0 0 32px #000b' }}>
        <h2 className="text-xl sm:text-2xl font-bold text-[#e0c97f] mb-4 sm:mb-6 text-center">Store</h2>
        <div className="bg-[#18181a] rounded-lg p-3 sm:p-4 border border-[#a88b4a] mb-3">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-12 h-12 bg-[#2c2c2e] rounded-lg flex items-center justify-center border border-yellow-400">
              <img src="/imgs/assets/pass.png" alt="Season Pass" className="w-10 h-10 object-contain" />
            </div>
            <div className="flex-1">
              <h3 className="text-xl font-semibold text-yellow-300">Season Pass</h3>
              <div className="text-base font-bold text-yellow-400">{SEASON_PASS_PRICE_DISPLAY} AVAX</div>
            </div>
          </div>
          <div className="mb-3 space-y-1.5">
            <div className="flex items-center gap-2 text-sm text-[#f3e7c2]"><span className="text-yellow-400">⚡</span><span>3x points on daily check-ins</span></div>
            <div className="flex items-center gap-2 text-sm text-[#f3e7c2]"><span className="text-yellow-400">🎁</span><span>Exclusive airdrop rewards</span></div>
            <div className="flex items-center gap-2 text-sm text-[#f3e7c2]"><span className="text-yellow-400">💎</span><span>2x diamond rewards</span></div>
            <div className="flex items-center gap-2 text-sm text-[#f3e7c2]"><span className="text-yellow-400">🏪</span><span>Store discounts & early access</span></div>
          </div>
          {hasSeasonPass ? (
            <div className="text-center py-2 bg-green-900/30 rounded border border-green-600"><p className="text-green-400 font-semibold text-sm">✓ Owned</p></div>
          ) : (
            <button onClick={handlePurchaseSeasonPass} disabled={isPurchasing || isLoading} className="w-full rounded bg-[#a88b4a] px-3 py-2 text-white font-bold text-sm transition-colors hover:bg-yellow-600 disabled:cursor-not-allowed disabled:opacity-50">
              {isPurchasing ? 'Processing...' : `Buy ${SEASON_PASS_PRICE_DISPLAY} AVAX`}
            </button>
          )}
        </div>
        <div className="bg-[#18181a] rounded-lg p-3 border border-[#a88b4a] mb-3">
          <div className="flex items-center gap-3 mb-3"><div className="w-12 h-12 bg-[#2c2c2e] rounded-lg flex items-center justify-center border border-gray-500"><span className="text-gray-400 text-lg">⚡</span></div><div className="flex-1"><h3 className="text-lg font-semibold text-gray-300">Auto Harvester</h3><p className="text-sm text-gray-400">Automatically collect daily rewards</p></div></div>
          <div className="text-center py-2 bg-gray-800/30 rounded border border-gray-600"><p className="text-gray-400 font-semibold text-sm">Stay Tuned</p></div>
        </div>
        <div className="bg-[#18181a] rounded-lg p-3 border border-[#a88b4a]">
          <div className="flex items-center gap-3 mb-3"><div className="w-12 h-12 bg-[#2c2c2e] rounded-lg flex items-center justify-center border border-gray-500"><span className="text-gray-400 text-lg">💎</span></div><div className="flex-1"><h3 className="text-lg font-semibold text-gray-300">Premium Rewards</h3><p className="text-sm text-gray-400">Exclusive cosmetics & bonuses</p></div></div>
          <div className="text-center py-2 bg-gray-800/30 rounded border border-gray-600"><p className="text-gray-400 font-semibold text-sm">Stay Tuned</p></div>
        </div>
        <div className="text-center text-sm text-[#a88b4a] mb-3 mt-4">— Coming Soon —</div>
        <button onClick={onClose} className="absolute right-2 top-2 sm:right-4 sm:top-4 px-2 py-1 sm:px-4 text-sm sm:text-base rounded bg-[#a88b4a] text-white font-bold shadow hover:bg-yellow-600 transition-all" style={{ letterSpacing: 1 }}>Close</button>
      </div>
    </div>
  );
};

export default StoreModal;
