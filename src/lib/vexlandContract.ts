import { CONTRACT_ADDRESS, SEASON_PASS_PRICE_WEI } from '@/constants';
import { VEXLAND_ABI } from './vexlandAbi';
export { VEXLAND_ABI };

export interface PlayerData {
  checkInCount: number; lastCheckInTimestamp: number; totalPoints: number;
  seasonPassPurchased: boolean; seasonPassPurchaseDate: number; gold: number;
  highestScore: number; highestTime: number; walletSignatureCount: number;
  lastWalletSignatureTime: number; playerLevel: number; vipLevel: number;
}

const SECONDS_PER_DAY = 86400;

export function parsePlayerData(raw: readonly [number, bigint, number, boolean, bigint, number, number, number, number, bigint, number, number, boolean]): PlayerData | null {
  const [checkInCount, lastCheckInTimestamp, totalPoints, seasonPassPurchased, seasonPassPurchaseDate, gold, highestScore, highestTime, walletSignatureCount, lastWalletSignatureTime, playerLevel, vipLevel, exists] = raw;
  if (!exists) return null;
  return {
    checkInCount: Number(checkInCount), lastCheckInTimestamp: Number(lastCheckInTimestamp),
    totalPoints: Number(totalPoints), seasonPassPurchased, seasonPassPurchaseDate: Number(seasonPassPurchaseDate),
    gold: Number(gold), highestScore: Number(highestScore), highestTime: Number(highestTime),
    walletSignatureCount: Number(walletSignatureCount), lastWalletSignatureTime: Number(lastWalletSignatureTime),
    playerLevel: Number(playerLevel), vipLevel: Number(vipLevel),
  };
}

export function canCheckIn(player: PlayerData | null): boolean {
  if (!player) return true;
  return Math.floor(Date.now() / 1000) - player.lastCheckInTimestamp >= SECONDS_PER_DAY;
}

export function getPlayerDataConfig(address: `0x${string}`) {
  return { address: CONTRACT_ADDRESS, abi: VEXLAND_ABI, functionName: 'getPlayerData' as const, args: [address] as const };
}
export function checkInConfig() {
  return { address: CONTRACT_ADDRESS, abi: VEXLAND_ABI, functionName: 'checkIn' as const };
}
export function purchaseSeasonPassConfig() {
  return { address: CONTRACT_ADDRESS, abi: VEXLAND_ABI, functionName: 'purchaseSeasonPass' as const, value: SEASON_PASS_PRICE_WEI };
}
export function recordWalletSignatureConfig() {
  return { address: CONTRACT_ADDRESS, abi: VEXLAND_ABI, functionName: 'recordWalletSignature' as const };
}
export function claimPointsConfig() {
  return { address: CONTRACT_ADDRESS, abi: VEXLAND_ABI, functionName: 'claimPoints' as const };
}
export function seasonPassPriceConfig() {
  return { address: CONTRACT_ADDRESS, abi: VEXLAND_ABI, functionName: 'seasonPassPrice' as const };
}
