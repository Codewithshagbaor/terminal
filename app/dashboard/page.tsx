'use client';

import React, { useState } from 'react';
import {
    Users,
    Zap,
    ChevronRight,
    Target,
    Cpu,
    PlusCircle,
    Search,
    Activity,
    Coins,
    User,
    Vote,
    Share2,
    Calendar,
    Trophy
} from 'lucide-react';
import { Wager, WagerStatus } from '@/types/Wager';

const MOCK_WAGERS: Wager[] = [
    {
        id: 'TX-8921-AF',
        creator: 'alex.eth',
        opponent: 'dave.sol',
        participants: [],
        amount: 50,
        description: 'First to finish the marathon wins the stake.',
        status: WagerStatus.PENDING,
        timestamp: Date.now() - 3600000
    },
    {
        id: 'TX-4402-AF',
        creator: 'sarah.lens',
        opponent: 'mike.eth',
        participants: [],
        amount: 100,
        description: 'Polymarket hits $1B volume by June 2025.',
        status: WagerStatus.ESCROW,
        timestamp: Date.now() - 86400000
    },
    {
        id: 'TX-1029-AF',
        creator: 'josh.eth',
        opponent: 'clara.sol',
        participants: [],
        amount: 250,
        description: 'Bitcoin monthly close above $100k.',
        status: WagerStatus.SETTLED,
        winner: 'josh.eth',
        timestamp: Date.now() - 172800000
    }
];
interface DashboardProps {
    wagers?: Wager[];
    onSelectWager: (wager: Wager) => void;
    onJoinClick?: () => void;
    onCreateClick?: () => void;
}
export default function Dashboard({ wagers = [], onSelectWager, onJoinClick, onCreateClick }: DashboardProps) {
    const [filter, setFilter] = useState<'ALL' | 'ESCROW' | 'PENDING'>('ALL');

    const stats = [
        { label: 'TOTAL_WAGERS', value: '1,284', change: '+12%', color: 'text-emerald-600 dark:text-emerald-400' },
        { label: 'ACTIVE_OPS', value: wagers.filter(w => w.status !== WagerStatus.SETTLED).length, change: 'LIVE', color: 'text-amber-600 dark:text-amber-400' },
        { label: 'AWAITING_RES', value: '14', change: 'PENDING', color: 'text-rose-600 dark:text-rose-400' },
        { label: 'TOTAL_STAKED', value: '$42.8k', change: '+3.2%', color: 'text-emerald-700 dark:text-emerald-500' },
        { label: 'WIN_RATE', value: '64%', change: 'OPTIMAL', color: 'text-blue-600 dark:text-blue-400' },
    ];

    const quickWagers = [
        {
            id: 'QW-1',
            title: 'ETH > $3500 (End of Week)',
            category: 'CRYPTO',
            sideA: 'YES',
            sideB: 'NO',
            time: '23h 12m',
            odds: '2.1x',
            logos: ['ETH'],
            type: 'single'
        },
        {
            id: 'QW-2',
            title: 'Lakers vs Warriors',
            category: 'SPORTS',
            sideA: 'LAL',
            sideB: 'GSW',
            time: '2h 45m',
            odds: '1.8x',
            logos: ['LAL', 'GSW'],
            type: 'versus'
        },
        {
            id: 'QW-3',
            title: 'BTC Hits New ATH by Sunday',
            category: 'CRYPTO',
            sideA: 'LONG',
            sideB: 'SHORT',
            time: '4d 02h',
            odds: '3.4x',
            logos: ['BTC'],
            type: 'single'
        },
        {
            id: 'QW-4',
            title: 'Man City vs Arsenal',
            category: 'SPORTS',
            sideA: 'MCI',
            sideB: 'ARS',
            time: '1h 12m',
            odds: '2.0x',
            logos: ['MCI', 'ARS'],
            type: 'versus'
        },
    ];

    const categories = [
        { label: 'Sports', icon: <Activity className="w-5 h-5" />, count: 142 },
        { label: 'Crypto', icon: <Coins className="w-5 h-5" />, count: 89 },
        { label: 'P2P/Social', icon: <User className="w-5 h-5" />, count: 215 },
        { label: 'Custom', icon: <PlusCircle className="w-5 h-5" />, count: 42 },
    ];

    const renderLogo = (logo: string, size: 'sm' | 'md' = 'md') => {
        const sizeClasses = size === 'sm' ? 'w-8 h-8 text-[8px]' : 'w-10 h-10 text-[10px]';

        const logoMap: Record<string, React.ReactNode> = {
            'ETH': <span className="text-[#627EEA] font-bold">Ξ</span>,
            'BTC': <Coins className="w-5 h-5 text-[#F7931A]" />,
            'LAL': <span className="text-[#FDB927] font-black italic">LAL</span>,
            'GSW': <span className="text-[#1D428A] font-black italic">GSW</span>,
            'MCI': <span className="text-[#6CABDD] font-black italic">MCI</span>,
            'ARS': <span className="text-[#EF0107] font-black italic">ARS</span>,
        };

        return (
            <div className={`${sizeClasses} rounded-full bg-slate-100 dark:bg-[#0D0D12] border border-slate-200 dark:border-white/10 flex items-center justify-center shadow-sm dark:shadow-lg group-hover:border-emerald-500/50 transition-all duration-500`}>
                {logoMap[logo] || logo}
            </div>
        );
    };

    return (
        <div className="space-y-10 animate-in fade-in duration-700 pb-10">

            {/* Primary Action Bar */}
            <div className="flex flex-col sm:flex-row gap-4">
                <button
                    onClick={onCreateClick}
                    className="flex-1 p-5 md:p-6 bg-emerald-500 dark:bg-emerald-600 rounded-2xl flex items-center justify-between group btn-tactile overflow-hidden relative"
                >
                    <div className="relative z-10 text-left">
                        <h3 className="text-white dark:text-[#0D0D12] text-lg md:text-xl font-bold italic tracking-tighter uppercase">Initiate_New_Wager</h3>
                        <p className="text-white/70 dark:text-[#0D0D12]/60 text-[9px] font-mono font-bold uppercase mt-1">Deploy New Escrow Contract</p>
                    </div>
                    <PlusCircle className="w-8 h-8 md:w-10 md:h-10 text-white dark:text-[#0D0D12] relative z-10 group-hover:rotate-90 transition-transform duration-500" />
                    <div className="absolute top-0 right-0 w-32 h-full bg-white/10 -skew-x-12 translate-x-16 group-hover:translate-x-8 transition-transform"></div>
                </button>
                <button
                    onClick={onJoinClick}
                    className="flex-1 p-5 md:p-6 bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-2xl flex items-center justify-between group btn-tactile shadow-sm"
                >
                    <div className="text-left">
                        <h3 className="text-slate-900 dark:text-white text-lg md:text-xl font-bold italic tracking-tighter uppercase">Join_Existing_Wager</h3>
                        <p className="text-slate-500 text-[9px] font-mono font-bold uppercase mt-1">Enter Terminal ID to Access</p>
                    </div>
                    <Search className="w-8 h-8 md:w-10 md:h-10 text-slate-400 dark:text-slate-500 group-hover:scale-110 transition-transform" />
                </button>
            </div>

            {/* Dashboard Overview (HUD) */}
            <div className="grid grid-cols-2 lg:grid-cols-5 gap-[1px] bg-slate-200 dark:bg-white/5 border border-slate-200 dark:border-white/5 rounded-2xl overflow-hidden shadow-sm dark:shadow-xl">
                {stats.map((stat, idx) => (
                    <div key={stat.label} className={`bg-white dark:bg-[#0D0D12] p-4 md:p-5 ${idx === 4 ? 'col-span-2 lg:col-span-1' : ''}`}>
                        <div className="flex justify-between items-start mb-1">
                            <span className="text-[8px] md:text-[9px] font-mono font-bold text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em]">{stat.label}</span>
                        </div>
                        <div className="text-xl md:text-2xl font-bold font-mono tracking-tighter text-slate-900 dark:text-white">
                            {stat.value}
                        </div>
                        <span className={`text-[8px] font-mono font-bold ${stat.color}`}>{stat.change}</span>
                    </div>
                ))}
            </div>

            {/* Quick Wager Section - Full Width */}
            <section className="space-y-4">
                <div className="flex items-center gap-2 px-2">
                    <Zap className="w-4 h-4 text-amber-500" />
                    <h3 className="text-xs font-mono font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">Quick_Wagers</h3>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    {quickWagers.map(qw => (
                        <div key={qw.id} className="obsidian-card p-5 md:p-6 rounded-2xl group hover:border-emerald-500/30 transition-all flex flex-col justify-between min-h-[220px] relative overflow-hidden bg-white dark:bg-white/5 shadow-sm">
                            <div className="relative z-10">
                                <div className="flex justify-between items-start">
                                    <span className="text-[9px] font-mono font-bold text-emerald-600 dark:text-emerald-500 bg-emerald-500/10 px-2 py-0.5 rounded uppercase tracking-tighter">{qw.category}</span>

                                    <div className="relative">
                                        {qw.type === 'versus' ? (
                                            <div className="flex items-center -space-x-4">
                                                <div className="relative z-20 transform group-hover:-translate-x-1 transition-transform">
                                                    {renderLogo(qw.logos[0])}
                                                </div>
                                                <div className="relative z-10 opacity-60 group-hover:opacity-100 transform group-hover:translate-x-1 transition-all">
                                                    {renderLogo(qw.logos[1])}
                                                </div>
                                                <div className="absolute -bottom-1 -right-1 bg-emerald-500 dark:bg-emerald-500 text-white dark:text-[#0D0D12] text-[7px] font-black px-1 rounded-sm z-30 shadow-md uppercase">VS</div>
                                            </div>
                                        ) : (
                                            <div className="relative">
                                                <div className="absolute inset-0 bg-emerald-400/20 blur-xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity"></div>
                                                <div className="relative z-10 transform group-hover:scale-110 transition-transform">
                                                    {renderLogo(qw.logos[0])}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <h4 className="text-base md:text-lg font-bold italic mt-6 text-slate-900 dark:text-white group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors line-clamp-2 leading-snug">{qw.title}</h4>

                                <div className="flex items-center gap-2 mt-3">
                                    <span className="text-[9px] font-mono text-slate-500 flex items-center gap-1 uppercase bg-slate-100 dark:bg-white/5 px-2 py-0.5 rounded border border-slate-200 dark:border-white/5">
                                        <Activity className="w-3 h-3 text-emerald-600 dark:text-emerald-500" /> {qw.time}
                                    </span>
                                    <span className="text-[9px] font-mono text-amber-600 dark:text-amber-500 font-bold uppercase bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
                                        {qw.odds} ODDS
                                    </span>
                                </div>

                                <div className="flex gap-2 mt-5">
                                    <button className="flex-1 py-2.5 bg-slate-50 dark:bg-[#0D0D12] border border-slate-200 dark:border-white/5 rounded-xl text-[10px] font-mono font-bold text-slate-500 hover:bg-emerald-500/10 hover:text-emerald-600 dark:hover:text-emerald-400 hover:border-emerald-500/30 transition-all uppercase tracking-widest uppercase">Vote {qw.sideA}</button>
                                    <button className="flex-1 py-2.5 bg-slate-50 dark:bg-[#0D0D12] border border-slate-200 dark:border-white/5 rounded-xl text-[10px] font-mono font-bold text-slate-500 hover:bg-emerald-500/10 hover:text-emerald-600 dark:hover:text-emerald-400 hover:border-emerald-500/30 transition-all uppercase tracking-widest uppercase">Vote {qw.sideB}</button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </section>

            {/* My Wagers & Categories Grid */}
            <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
                {/* My Wagers */}
                <section className="xl:col-span-8 space-y-4">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 px-2">
                        <div className="flex items-center gap-2">
                            <Target className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                            <h3 className="text-xs font-mono font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">Terminal_Operations</h3>
                        </div>
                        <div className="flex items-center bg-slate-100 dark:bg-white/5 rounded-lg p-1 border border-slate-200 dark:border-white/10 self-start sm:self-auto transition-colors">
                            {(['ALL', 'ESCROW', 'PENDING'] as const).map((f) => (
                                <button
                                    key={f}
                                    onClick={() => setFilter(f)}
                                    className={`px-3 py-1 text-[9px] font-mono font-bold rounded-md transition-all ${filter === f ? 'bg-emerald-500 dark:bg-emerald-500 text-white dark:text-[#0D0D12]' : 'text-slate-400 hover:text-slate-600 dark:text-slate-500 dark:hover:text-slate-300'
                                        }`}
                                >
                                    {f}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="obsidian-card rounded-2xl overflow-hidden border-slate-200 dark:border-white/10 shadow-sm dark:shadow-xl bg-white dark:bg-[#0D0D12]">
                        {/* Desktop Header */}
                        <div className="hidden md:grid grid-cols-12 gap-4 px-6 py-4 bg-slate-50 dark:bg-[#0D0D12]/2 border-b border-slate-200 dark:border-white/5 text-[9px] font-mono font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">
                            <div className="col-span-1">ST</div>
                            <div className="col-span-4">WAGER_TITLE</div>
                            <div className="col-span-2 text-center">PLAYERS</div>
                            <div className="col-span-2 text-right">STAKE</div>
                            <div className="col-span-3 text-right">ACTIONS</div>
                        </div>

                        <div className="divide-y divide-slate-100 dark:divide-white/5">
                            {wagers.filter(w => filter === 'ALL' || w.status === filter).map((wager) => (
                                <React.Fragment key={wager.id}>
                                    <div className="hidden md:grid grid-cols-12 gap-4 px-6 py-5 items-center hover:bg-emerald-500/[0.03] transition-all group cursor-pointer" onClick={() => onSelectWager(wager)}>
                                        <div className="col-span-1">
                                            <div className={`w-2 h-2 rounded-full ${wager.status === WagerStatus.ESCROW ? 'bg-emerald-500 terminal-pulse' : 'bg-amber-500'}`} />
                                        </div>
                                        <div className="col-span-4">
                                            <div className="text-sm font-bold text-slate-900 dark:text-white group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors line-clamp-1">{wager.description}</div>
                                            <div className="flex items-center gap-2 mt-0.5">
                                                <span className="text-[9px] font-mono text-slate-400 dark:text-slate-700">{wager.id}</span>
                                            </div>
                                        </div>
                                        <div className="col-span-2 text-center">
                                            <div className="inline-flex items-center gap-1.5 px-2 py-1 bg-slate-50 dark:bg-white/5 rounded-md border border-slate-200 dark:border-white/5">
                                                <Users className="w-3 h-3 text-slate-400 dark:text-slate-500" />
                                                <span className="text-[10px] font-mono text-slate-600 dark:text-slate-300">2 / 2</span>
                                            </div>
                                        </div>
                                        <div className="col-span-2 text-right">
                                            <div className="text-sm font-bold font-mono text-slate-900 dark:text-white tracking-tighter">${wager.amount.toFixed(2)}</div>
                                        </div>
                                        <div className="col-span-3 text-right flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-all">
                                            <button className="p-1.5 bg-emerald-500/10 border border-emerald-500/20 rounded hover:bg-emerald-500 transition-colors group/btn">
                                                <Vote className="w-3 h-3 text-emerald-600 group-hover/btn:text-white dark:group-hover/btn:text-[#0D0D12]" />
                                            </button>
                                            <ChevronRight className="w-4 h-4 text-slate-400" />
                                        </div>
                                    </div>

                                    <div
                                        className="md:hidden p-5 space-y-4 active:bg-slate-50 dark:active:bg-white/5 transition-colors"
                                        onClick={() => onSelectWager(wager)}
                                    >
                                        <div className="flex justify-between items-start">
                                            <div className="flex items-center gap-2">
                                                <div className={`w-2 h-2 rounded-full ${wager.status === WagerStatus.ESCROW ? 'bg-emerald-500 terminal-pulse' : 'bg-amber-500'}`} />
                                                <span className="text-[10px] font-mono text-slate-400">{wager.id}</span>
                                            </div>
                                            <div className="text-sm font-bold font-mono text-emerald-600">${wager.amount.toFixed(2)}</div>
                                        </div>
                                        <h4 className="text-sm font-bold text-slate-900 dark:text-white leading-tight">{wager.description}</h4>
                                    </div>
                                </React.Fragment>
                            ))}
                        </div>
                    </div>
                </section>

            <aside className="xl:col-span-4 space-y-4">
                    <h3 className="text-xs font-mono font-bold text-slate-400 px-2 uppercase tracking-widest">Categories</h3>
                    <div className="grid grid-cols-2 gap-3">
                        {categories.map(cat => (
                            <button key={cat.label} className="obsidian-card p-4 rounded-xl flex flex-col items-center gap-3 bg-white dark:bg-transparent border-slate-200 dark:border-white/5 hover:border-emerald-500/20 hover:bg-slate-50 dark:hover:bg-white/5 transition-all group shadow-sm">
                                <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-white/5 flex items-center justify-center text-slate-400 dark:text-slate-500 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                                    {cat.icon}
                                </div>
                                <div className="text-center">
                                    <div className="text-[10px] font-bold uppercase tracking-widest text-slate-500 group-hover:text-slate-900 dark:group-hover:text-white transition-colors">{cat.label}</div>
                                    <div className="text-[8px] font-mono text-slate-400 dark:text-slate-600 mt-0.5">{cat.count} LIVE</div>
                                </div>
                            </button>
                        ))}
                    </div>
            </aside>
            </div>
        </div>
    );
}
