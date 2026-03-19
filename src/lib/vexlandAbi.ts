// VexLand Contract ABI — extracted from VexLand.sol
export const VEXLAND_ABI = [
  { name: 'checkIn', type: 'function', stateMutability: 'nonpayable', inputs: [], outputs: [] },
  { name: 'purchaseSeasonPass', type: 'function', stateMutability: 'payable', inputs: [], outputs: [] },
  { name: 'recordWalletSignature', type: 'function', stateMutability: 'nonpayable', inputs: [], outputs: [] },
  { name: 'claimPoints', type: 'function', stateMutability: 'nonpayable', inputs: [], outputs: [] },
  {
    name: 'getPlayerData', type: 'function', stateMutability: 'view',
    inputs: [{ name: 'player', type: 'address' }],
    outputs: [
      { name: 'checkInCount', type: 'uint32' }, { name: 'lastCheckInTimestamp', type: 'uint64' },
      { name: 'totalPoints', type: 'uint32' }, { name: 'seasonPassPurchased_', type: 'bool' },
      { name: 'seasonPassPurchaseDate', type: 'uint64' }, { name: 'gold', type: 'uint32' },
      { name: 'highestScore', type: 'uint32' }, { name: 'highestTime', type: 'uint32' },
      { name: 'walletSignatureCount', type: 'uint32' }, { name: 'lastWalletSignatureTime', type: 'uint64' },
      { name: 'playerLevel', type: 'uint32' }, { name: 'vipLevel', type: 'uint8' },
      { name: 'exists_', type: 'bool' },
    ],
  },
  { name: 'canCheckInNow', type: 'function', stateMutability: 'view', inputs: [{ name: 'player', type: 'address' }], outputs: [{ name: '', type: 'bool' }] },
  { name: 'hasSeasonPass', type: 'function', stateMutability: 'view', inputs: [{ name: 'player', type: 'address' }], outputs: [{ name: '', type: 'bool' }] },
  { name: 'seasonPassPrice', type: 'function', stateMutability: 'view', inputs: [], outputs: [{ name: '', type: 'uint256' }] },
  { name: 'CheckedIn', type: 'event', inputs: [{ name: 'player', type: 'address', indexed: true }, { name: 'checkInCount', type: 'uint32', indexed: false }, { name: 'pointsEarned', type: 'uint32', indexed: false }, { name: 'totalPoints', type: 'uint32', indexed: false }, { name: 'timestamp', type: 'uint64', indexed: false }] },
  { name: 'SeasonPassPurchased', type: 'event', inputs: [{ name: 'player', type: 'address', indexed: true }, { name: 'pricePaid', type: 'uint256', indexed: false }, { name: 'timestamp', type: 'uint64', indexed: false }] },
  { name: 'PointsClaimed', type: 'event', inputs: [{ name: 'player', type: 'address', indexed: true }, { name: 'points', type: 'uint32', indexed: false }, { name: 'timestamp', type: 'uint64', indexed: false }] },
] as const;
