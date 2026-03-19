// Avalanche contract constants
export const CONTRACT_ADDRESS = (import.meta.env.VITE_CONTRACT_ADDRESS ?? '0x0000000000000000000000000000000000000000') as `0x${string}`;
export const SEASON_PASS_PRICE_WEI = 1_000_000_000_000_000_000n; // 1 AVAX
export const SEASON_PASS_PRICE_DISPLAY = 1; // 1 AVAX
export const AVAX_CHAIN_ID = 43113; // Fuji testnet
