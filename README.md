# VexLand — Web3 Roguelike Dungeon Crawler on Avalanche

A roguelike dungeon crawler on Avalanche that combines classic gameplay with blockchain features. Explore dungeons, battle monsters, and compete with players worldwide through daily leaderboards.

Submitted for the Avalanche Build Games 2026.

## Features

- Procedurally generated dungeons with monsters and treasures
- Dynamic 24-hour leaderboards with area-based matchmaking
- Daily check-in rewards with 24h cooldown
- Season Pass (1 AVAX) for 3x point multiplier
- Achievement system with special rewards
- Cross-platform: desktop and mobile

## Tech Stack

- React 18, TypeScript, Vite, TailwindCSS
- Cocos Creator (game engine)
- Avalanche C-Chain with Solidity smart contracts
- wagmi, viem, @rainbow-me/rainbowkit

## Getting Started

```bash
cd vexland
npm install
npm run dev
```

Open http://localhost:5173 to play.

### Prerequisites

- Node.js >= 18
- npm >= 9
- Hardhat (for contract deployment): `npm install` in `contracts/`

### Environment Variables

Copy `.env` and fill in your deployed contract address:

```
VITE_CONTRACT_ADDRESS=0x_YOUR_CONTRACT_ADDRESS
VITE_CHAIN_ID=43113
VITE_WALLETCONNECT_PROJECT_ID=your_project_id
```

## Smart Contracts

Solidity contracts live in `contracts/src/`. Main contract:

| Contract     | Purpose                                           |
| ------------ | ------------------------------------------------- |
| VexLand.sol  | Core logic: check-in, season pass, rewards, admin |

Key patterns:

- OpenZeppelin Ownable for admin-only functions
- `mapping(address => PlayerData)` for player state
- Native AVAX payments for season pass
- wagmi/viem for frontend reads and writes

## Smart Contract Deployment

```bash
cd contracts

# Install dependencies
npm install

# Compile
npx hardhat compile

# Deploy to Fuji testnet
npx hardhat run scripts/deploy.ts --network fuji
```

After deployment, update `VITE_CONTRACT_ADDRESS` in `.env` with the deployed contract address.

## Project Structure

```
vexland/
├── src/
│   ├── components/      # React components + game integration
│   ├── constants/       # Contract addresses, config
│   ├── lib/             # Contract ABI and helpers
│   └── pages/           # Routes
├── public/              # Static assets + game resources
└── contracts/           # Hardhat + Solidity smart contracts
    ├── src/             # .sol files
    └── scripts/         # Deployment scripts
```

## Wallet Support

Connect with any EVM-compatible wallet via RainbowKit:

- MetaMask
- Core Wallet
- Rabby
- WalletConnect

## Hackathon

This project is a submission for the **Avalanche Build Games 2026**. Originally built as a Telegram Mini App, VexLand has been migrated to a full web platform with Avalanche blockchain integration.

- **Network**: Avalanche Fuji Testnet (C-Chain)
- **Contract**: Solidity with OpenZeppelin
- **SDK**: wagmi, viem, @rainbow-me/rainbowkit
- **Open Source**: Yes (this repository)

## Live Demo

[vexland.xyz](https://vexland.xyz)

## License

MIT
