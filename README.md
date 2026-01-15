# Among Friends 🎲

> **Trustless Social Terminal for P2P Betting on the Blockchain**

Among Friends is a trustless peer-to-peer betting social terminal built on Mantle that enables friends to create, join, and settle wagers without bookmakers, oracles, or custodians. The platform uses on-chain smart contract escrow to securely lock ERC-20 stakes and resolves outcomes through participant-based consensus voting, ensuring transparent and automatic settlement.

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Next.js](https://img.shields.io/badge/Next.js-16-black)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue)

---

## ✨ Features

- **🏆 Multi-Template Wagers** - Sports, Challenges, Predictions, or fully Custom bets
- **🔐 Non-Custodial Escrow** - Funds secured by smart contracts, not intermediaries
- **⛓️ Chain Support** - Mantle Testnet
- **🗳️ Voting-Based Resolution** - Participants vote on outcomes
- **💰 ERC-20 Staking** - Stake USDC, WETH, DAI, or custom tokens
- **📦 IPFS Metadata** - Bet details stored permanently on IPFS via Pinata

---

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- pnpm (recommended) or npm
- MetaMask or compatible Web3 wallet
- Testnet tokens (Mantle Testnet)

### Installation

```bash
# Clone the repository
git clone https://github.com/codewithshagbaor/terminal-app.git
cd terminal-app

# Install dependencies
pnpm install
# or
npm install

# Set up environment variables
cp .env.example .env.local
```

### Environment Variables

Create a `.env.local` file with:

```env
NEXT_PUBLIC_ENABLE_TESTNETS=true
NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=your_walletconnect_project_id
NEXT_PUBLIC_PINATA_API_KEY=your_pinata_api_key
NEXT_PUBLIC_PINATA_SECRET_API_KEY=your_pinata_secret_key
```

### Run Development Server

```bash
pnpm dev
# or
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 📖 How It Works

### 1. Create a Wager

Choose from 4 templates:

| Template | Description | Example |
|----------|-------------|---------|
| **Sports Clash** | Bet on sports matches | "Lakers vs Celtics - Who wins?" |
| **Skill Check** | Challenge-based bets | "Run 100km in 30 days" |
| **Predictions** | Market/event predictions | "BTC above $100k by March?" |
| **Custom** | Any custom agreement | "First to finish the book" |

### 2. Stake & Escrow

- Select your token (USDC, WETH, etc.)
- Set your stake amount
- Funds are locked in the smart contract

### 3. Invite Participants

- Add friends by wallet address
- Or enable "Open Join" for anyone to join via Bet ID

### 4. Vote & Resolve

- When the event/deadline passes, participants vote on the outcome
- Smart contract automatically distributes winnings to voters of the winning outcome

---

## 🏗️ Project Structure

```
terminal-app/
├── app/                      # Next.js App Router pages
│   ├── page.tsx              # Dashboard (Global Ledger)
│   ├── layout.tsx            # Root layout with providers
│   ├── providers.tsx         # Web3 providers (wagmi, RainbowKit)
│   ├── create/               # Wager creation wizard
│   ├── join/                 # Join existing wager
│   └── terminal/[id]/        # Wager terminal (vote, resolve)
│
├── components/               # Reusable UI components
│   ├── WagersPage.tsx        # Dashboard grid display
│   ├── TokenAmountSelector   # Token selection & staking UI
│   ├── SportsFields.tsx      # Sports template form fields
│   ├── LeagueSelect.tsx      # League dropdown
│   ├── TeamSearch.tsx        # Team autocomplete
│   └── ProgressModal.tsx     # Transaction status modal
│
├── hooks/                    # Custom React hooks
│   ├── read/                 # Blockchain read operations
│   │   ├── useBetDetails.ts  # Fetch bet information
│   │   └── useApproveToken.ts# Token allowance & approval
│   └── write/                # Blockchain write operations
│       ├── useCreateBet.ts   # Create new bet
│       ├── useJoinBet.ts     # Join existing bet
│       └── useVote.ts        # Cast vote on outcome
│
├── constants/                # Configuration & ABIs
│   ├── contracts.ts          # Contract addresses & tokens
│   ├── contractABI.ts        # Smart contract ABI
│   └── erc20ABI.ts           # ERC-20 token ABI
│
├── lib/                      # Utility libraries
├── types/                    # TypeScript type definitions
└── utils/                    # Helper functions
```

---

## ⛓️ Supported Networks

| Network | Chain ID | Status |
|---------|----------|--------|
| Mantle Testnet | 5003 | ✅ Active |

### Contract Addresses

| Network | Contract |
|---------|----------|
| Mantle Testnet | `0xb8Fb1E65744B1637154758F261088E35965d951a` |

### Supported Tokens

**Mantle Testnet:**
- USDC: `0x791965fCe1F70358Bc2D12b6A110d8F93cc5F2Cb`
- FRIENDS: `0x7A0C90050B662f4b8546486Ab2ad584bcC2a00Dd`

---

## 🛠️ Tech Stack

| Category | Technology |
|----------|------------|
| **Framework** | Next.js 16 (App Router) |
| **Language** | TypeScript 5 |
| **UI** | React 19, Tailwind CSS |
| **Web3** | wagmi v3, viem v2.43 |
| **Wallet** | RainbowKit v2 |
| **State** | TanStack Query, Zustand |
| **Storage** | IPFS (Pinata) |
| **Toasts** | react-hot-toast |

---

## 📜 Smart Contract Interface

### Key Functions

```typescript
// Create a new bet
createBet(token, title, stakeAmount, voteDeadline, category, metadataCID, betType, maxParticipants)

// Join an existing bet
joinBet(betId)

// Vote on the outcome
vote(betId, outcome)

// Resolve the bet (distribute winnings)
resolve(betId)

// Cancel a bet (creator only)
cancelBet(betId)
```

### Bet Statuses

| Status | Description |
|--------|-------------|
| `Created (0)` | Awaiting participants |
| `Active (1)` | Bet is live |
| `VotingClosed (2)` | No more votes accepted |
| `Resolved (3)` | Outcome determined, funds distributed |
| `Cancelled (4)` | Bet cancelled |

---

## 🧪 Development

### Available Scripts

```bash
# Start development server
pnpm dev

# Build for production
pnpm build

# Start production server
pnpm start

# Run linting
pnpm lint
```

### Getting Testnet Tokens

1. **Mantle Faucet**: [faucet.mantle.xyz](https://faucet.mantle.xyz)

---

## 🔒 Security

- **Non-Custodial**: All funds are held by the smart contract, never by the platform
- **Approval Pattern**: Only exact amounts are approved for spending
- **Balance Validation**: Pre-flight checks before any transaction
- **Deadline Enforcement**: Minimum 1-hour future deadlines required

---

## 🗺️ Roadmap

- [ ] Mainnet deployment (Base, Arbitrum)
- [ ] Oracle integration for automated sports/price outcomes
- [ ] Social features (friends list, notifications)
- [ ] Bet discovery marketplace
- [ ] Mobile app
- [ ] DAO-based dispute resolution

---

## 🤝 Contributing

Contributions are welcome! Please read our contributing guidelines before submitting PRs.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 🙏 Acknowledgments

- [wagmi](https://wagmi.sh/) - React hooks for Ethereum
- [RainbowKit](https://www.rainbowkit.com/) - Wallet connection UI
- [viem](https://viem.sh/) - TypeScript Ethereum library
- [Pinata](https://pinata.cloud/) - IPFS pinning service

---

<p align="center">
  <strong>Built with ❤️ for trustless social betting</strong>
</p>
