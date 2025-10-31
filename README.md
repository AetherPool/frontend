# AetherPool - Privacy-First JIT Liquidity Protocol

A Next.js web application for AetherPool, a privacy-preserving multi-LP just-in-time liquidity protocol for Uniswap v4, powered by Fhenix FHE encryption and Reown Wallet Connect.

## Quick Start

### Prerequisites

- Node.js 18+
- npm or yarn
- Reown Wallet Connect Project ID

### Installation

1. Clone the repository

2. Install dependencies:
```bash
npm install --legacy-peer-deps
```

> **Important:** Always use `--legacy-peer-deps` flag when installing packages due to React 19 compatibility with some dependencies.

3. Set up environment variables:
```bash
cp .env.local.example .env.local
# Edit .env.local with your configuration
```

4. Run the development server:
```bash
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000) to see the dashboard.

## Project Structure

```
├── app/
│   ├── api/              # Next.js API routes
│   ├── page.tsx          # Main dashboard page
│   └── layout.tsx        # Root layout with Web3Provider
├── components/
│   ├── dashboard/        # Dashboard UI components
│   └── web3/            # Web3-related components
├── lib/
│   ├── web3-config.ts   # Wagmi and Reown setup
│   ├── web3-provider.tsx # Web3Provider component
│   ├── web3-utils.ts    # Web3 utilities and hooks
│   └── contracts.ts     # Contract addresses and ABIs
├── contracts/           # Solidity smart contracts
├── public/             # Static files
└── .npmrc              # npm configuration (legacy-peer-deps)
```

## Features

- **Privacy-First**: FHE-encrypted LP strategies
- **Multi-LP Coordination**: Automatic position overlap detection
- **Dynamic Pricing**: Gas-responsive fee adjustments
- **Dashboard**: Real-time liquidity and earnings tracking
- **Wallet Integration**: Seamless Reown Wallet Connect

## Environment Setup

### Getting a Reown Project ID

1. Go to [cloud.reown.com](https://cloud.reown.com)
2. Create a new project
3. Copy your Project ID
4. Add it to `.env.local` as `NEXT_PUBLIC_PROJECT_ID`

## Smart Contract Deployment

The Solidity contracts are in the `contracts/` directory:

- `ZKJITLiquidityHook.sol` - Main hook implementation

Deploy using Foundry:

```bash
forge create contracts/ZKJITLiquidityHook.sol:ZKJITLiquidityHook \
  --constructor-args <POOL_MANAGER_ADDRESS>
```

## API Documentation

### Get User Positions

```
GET /api/positions?address=<wallet_address>
```

### Create New Position

```
POST /api/positions
{
  "address": "0x...",
  "poolKey": {...},
  "tickLower": -60,
  "tickUpper": 60,
  "liquidityDelta": "1000000000000000000",
  "amount0": "500000000000000000",
  "amount1": "500000000000000000"
}
```

### Get JIT Activity

```
GET /api/jit?address=<wallet_address>
```

### Get Pool Statistics

```
GET /api/stats?address=<wallet_address>
```

## Development

### Build

```bash
npm run build
```

### Lint

```bash
npm run lint
```

## Supported Networks

- Ethereum Mainnet
- Arbitrum One
- Optimism
- Base
- Polygon

## Important Notes for Contributors

### Dependency Management

This project uses React 19, which may have peer dependency conflicts with some packages. To avoid installation issues:

1. **Always use the `--legacy-peer-deps` flag:**
   ```bash
   npm install --legacy-peer-deps
   npm install <package-name> --legacy-peer-deps
   ```

2. **Or set it permanently in your local environment:**
   Create/modify `.npmrc` in the project root:
   ```
   legacy-peer-deps=true
   ```

3. **Affected packages:**
   - `vaul` (drawer component) - only supports React 18 officially but works with React 19

### Troubleshooting

If you encounter `ERESOLVE unable to resolve dependency tree` errors:
- Run `npm install --legacy-peer-deps`
- Or add `legacy-peer-deps=true` to your `.npmrc` file
- Do not use `--force` as it may cause breaking changes

### Low Severity Vulnerabilities

You may see warnings about low severity vulnerabilities after installation. To fix them:
```bash
npm audit fix --legacy-peer-deps
```

These are typically not critical for development but should be reviewed before production deployment.

## Security

- FHE encryption protects all LP parameters
- Access control on all position modifications
- Economic security via EigenLayer-style operator staking
- Regular security audits recommended

## License

MIT

## Support

For support, email support@aetherpool.io or open an issue on GitHub.

---

## Contributing

We welcome contributions! Please ensure you:

1. Use `npm install --legacy-peer-deps` for all package installations
2. Follow the existing code style and conventions
3. Test your changes thoroughly
4. Update documentation as needed
5. Submit pull requests with clear descriptions

For major changes, please open an issue first to discuss what you would like to change.