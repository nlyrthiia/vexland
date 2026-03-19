import { AVAX_CHAIN_ID } from '@/constants';

export const isFujiTestnet = () => AVAX_CHAIN_ID === 43113;
export const isMainnet = () => AVAX_CHAIN_ID === (43114 as number);
