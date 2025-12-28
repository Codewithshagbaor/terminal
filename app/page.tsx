'use client';

import WagersPage, { WagerStatus } from '@/components/WagersPage';

// Mock wager data
const mockWagers = [
  {
    id: 'WGR-2024-001',
    description: 'Bitcoin will reach $100k by end of Q1 2025',
    amount: 500,
    status: WagerStatus.ESCROW,
    creator: '0x1234...5678',
    timestamp: Date.now() - 86400000,
    category: 'crypto',
    subCategory: 'BTC',
    participants: ['0xabcd...efgh'],
  },
  {
    id: 'WGR-2024-002',
    description: 'Ethereum gas fees will drop below 10 gwei',
    amount: 250,
    status: WagerStatus.PENDING,
    creator: '0xabcd...efgh',
    timestamp: Date.now() - 172800000,
    category: 'crypto',
    subCategory: 'ETH',
    participants: [],
  },
  {
    id: 'WGR-2024-003',
    description: 'Next halving will occur before May 2024',
    amount: 1000,
    status: WagerStatus.SETTLED,
    creator: '0x9876...5432',
    winner: '0x1234...5678',
    timestamp: Date.now() - 259200000,
    category: 'crypto',
    subCategory: 'BTC',
    participants: ['0x1234...5678', '0xabcd...efgh'],
  },
  {
    id: 'WGR-2024-004',
    description: 'Complete 100 pushups daily for 30 days',
    amount: 150,
    status: WagerStatus.ESCROW,
    creator: '0xfitness...1234',
    timestamp: Date.now() - 43200000,
    category: 'fitness',
    subCategory: 'Strength',
    participants: ['0xgym...5678'],
  },
  {
    id: 'WGR-2024-005',
    description: 'S&P 500 will hit new ATH this month',
    amount: 750,
    status: WagerStatus.PENDING,
    creator: '0xstock...9999',
    timestamp: Date.now() - 21600000,
    category: 'stocks',
    subCategory: 'SPX',
    participants: ['0xtrader...1111', '0xinvest...2222'],
  },
];

export default function Home() {
  return (
    <WagersPage
      wagers={mockWagers}
      onSelectWager={(wager) => console.log('Selected wager:', wager)}
    />
  );
}
