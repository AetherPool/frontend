# AetherPool Documentation

## Overview
AetherPool is a privacy-preserving multi-LP JIT (Just-In-Time) liquidity protocol for Uniswap v4, powered by Fhenix FHE encryption.

## Key Features

### Privacy-First Design
- FHE-encrypted LP strategy parameters
- Private threshold evaluation
- Strategy protection from competitors

### Multi-LP Coordination
- Automatic overlap detection
- Proportional participation
- Coordinated execution

### Dynamic Fee Pricing
- Gas-responsive adjustments
- Incentive alignment
- LP optimization

### Automated Risk Management
- Auto-hedging
- Profit compounding
- Batch operations

## Smart Contract Deployment

### Prerequisites
- Solidity ^0.8.26
- Uniswap v4 dependencies
- Fhenix FHE protocol

### Deployment Steps
1. Install dependencies: `forge install`
2. Configure network in `foundry.toml`
3. Deploy: `forge create src/ZKJITLiquidityHook.sol:ZKJITLiquidityHook --constructor-args <POOL_MANAGER_ADDRESS>`

## Frontend Integration

### Setup
1. Install dependencies from package.json
2. Set `NEXT_PUBLIC_PROJECT_ID` in environment variables
3. Run `npm run dev`

### Wallet Connection
- Uses Reown Wallet Connect
- Supports multiple chains (Ethereum, Arbitrum, Optimism, Base, Polygon)
- Automatic provider detection

### API Endpoints
- `GET /api/positions?address=<address>` - Fetch LP positions
- `POST /api/positions` - Create new position
- `GET /api/jit?address=<address>` - Fetch JIT activity
- `GET /api/stats?address=<address>` - Fetch pool statistics
- `GET /api/health` - Health check

## Configuration

### Environment Variables
\`\`\`
NEXT_PUBLIC_PROJECT_ID=your_project_id
NEXT_PUBLIC_CONTRACT_ADDRESS=0x...
NEXT_PUBLIC_RPC_URL=https://...
NEXT_PUBLIC_CHAIN_ID=1
\`\`\`

## Smart Contract Interactions

### Configure LP Settings
```solidity
configureLPSettings(
    poolKey,
    minSwapSize,      // encrypted
    maxLiquidity,     // encrypted
    profitThreshold,  // encrypted
    hedgePercentage,  // encrypted
    autoHedgeEnabled  // bool
)
