'use client';

import React, { useState } from 'react';
import {
    Search,
    ChevronRight,
    Users,
    ShieldCheck,
    ArrowUpRight,
    Clock,
    Dumbbell,
    Heart,
    Activity,
    Brain,
    TrendingUp,
    TrendingDown,
    Cloud,
    Newspaper,
    CircleDot,
    Fingerprint,
    Zap,
    Lock,
    ExternalLink
} from 'lucide-react';

// Types
export enum WagerStatus {
    PENDING = 'PENDING',
    ESCROW = 'ESCROW',
    SETTLED = 'SETTLED'
}

export interface Wager {
    id: string;
    description: string;
    amount: number;
    status: WagerStatus;
    creator: string;
    winner?: string;
    timestamp: number;
    category?: string;
    subCategory?: string;
    participants: string[];
}

interface WagersPageProps {
    wagers: Wager[];
    onSelectWager: (wager: Wager) => void;
}

const CATEGORY_ICONS: Record<string, any> = {
    fitness: Dumbbell,
    health: Heart,
    habit: Activity,
    skill: Brain,
    crypto: TrendingUp,
    stocks: TrendingDown,
    weather: Cloud,
    events: Newspaper
};

export default function WagersPage({ wagers, onSelectWager }: WagersPageProps) {
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState<'ALL' | WagerStatus>('ALL');

    const filteredWagers = wagers.filter(w => {
        const matchesSearch = w.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
            w.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
            w.subCategory?.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus = statusFilter === 'ALL' || w.status === statusFilter;
        return matchesSearch && matchesStatus;
    });

    return (
        <div className="max-w-7xl mx-auto space-y-8 animate-in fade-in duration-700 pb-20">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div className="space-y-2">
                    <h1 className="text-4xl font-black italic tracking-tighter text-slate-900 dark:text-white uppercase leading-none">Global_Ledger</h1>
                    <p className="text-[10px] text-slate-500 dark:text-slate-500 font-mono uppercase tracking-[0.4em]">Non-Custodial Escrow Explorer v1.0.4</p>
                </div>

                <div className="flex items-center gap-3 text-[10px] font-mono font-bold text-emerald-600 dark:text-emerald-500/50 uppercase bg-emerald-500/5 px-3 py-1.5 rounded-lg border border-emerald-500/10">
                    <CircleDot className="w-3 h-3 animate-pulse" />
                    Network Live: {wagers.length} Active Nodes
                </div>
            </div>

            {/* Control Bar */}
            <div className="flex flex-col lg:flex-row gap-4">
                <div className="relative flex-1 group">
                    <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 dark:text-slate-600 group-focus-within:text-emerald-500 transition-colors" />
                    <input
                        type="text"
                        placeholder="Search by ID, Asset, or Description..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-[2rem] pl-14 pr-6 py-5 text-xs font-mono text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-emerald-500/50 shadow-sm transition-all uppercase"
                    />
                </div>

                <div className="flex items-center bg-white dark:bg-white/2 rounded-[2rem] p-1.5 border border-slate-200 dark:border-white/10 shadow-sm overflow-x-auto whitespace-nowrap scrollbar-hide">
                    {(['ALL', WagerStatus.ESCROW, WagerStatus.PENDING, WagerStatus.SETTLED] as const).map((f) => (
                        <button
                            key={f}
                            onClick={() => setStatusFilter(f)}
                            className={`px-6 py-3 text-[10px] font-mono font-bold rounded-full transition-all ${statusFilter === f ? 'bg-emerald-500 text-white dark:text-[#0D0D12] shadow-lg shadow-emerald-500/20' : 'text-slate-400 hover:text-slate-600 dark:text-slate-500 dark:hover:text-slate-300'
                                }`}
                        >
                            {f}
                        </button>
                    ))}
                </div>
            </div>

            {/* Grid Display */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {filteredWagers.length > 0 ? filteredWagers.map((wager) => (
                    <WagerCard key={wager.id} wager={wager} onSelect={() => onSelectWager(wager)} />
                )) : (
                    <div className="col-span-full py-32 text-center space-y-4">
                        <ShieldCheck className="w-16 h-16 text-slate-200 dark:text-white/5 mx-auto" />
                        <div className="text-slate-400 dark:text-slate-600 font-mono text-[10px] uppercase tracking-[0.5em]">No operations found matching filter.</div>
                    </div>
                )}
            </div>
        </div>
    );
}

function WagerCard({ wager, onSelect }: { wager: Wager, onSelect: () => void }) {
    const CategoryIcon = CATEGORY_ICONS[wager.category || 'custom'] || CircleDot;

    return (
        <div
            onClick={onSelect}
            className="obsidian-card group rounded-[2.5rem] p-8 space-y-8 cursor-pointer hover:border-emerald-500/30 hover:shadow-2xl hover:shadow-emerald-500/5 transition-all duration-500 relative overflow-hidden bg-white dark:bg-transparent"
        >
            {/* Visual Accents */}
            <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:opacity-20 transition-opacity">
                <CategoryIcon className="w-20 h-20 -rotate-12" />
            </div>

            {/* Card Header */}
            <div className="flex justify-between items-start relative z-10">
                <div className="space-y-1">
                    <div className="flex items-center gap-2">
                        <div className={`w-2 h-2 rounded-full ${wager.status === WagerStatus.SETTLED ? 'bg-slate-300' : 'bg-emerald-500 terminal-pulse'}`} />
                        <span className="text-[10px] font-mono font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">{wager.id}</span>
                    </div>
                    <div className="text-[9px] font-mono font-bold text-emerald-600 dark:text-emerald-500 uppercase px-2 py-0.5 bg-emerald-500/5 rounded border border-emerald-500/10 inline-block">
                        {wager.status}
                    </div>
                </div>
                <div className="text-right">
                    <div className="text-2xl font-black font-mono text-slate-900 dark:text-white tracking-tighter italic">
                        {wager.amount.toFixed(2)} <span className="text-xs text-slate-400 not-italic">USDC</span>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="space-y-4 relative z-10">
                <div className="space-y-2">
                    <div className="flex items-center gap-2 text-[10px] font-mono text-slate-400 uppercase tracking-widest">
                        <Fingerprint className="w-3 h-3" /> Agreement_Terms
                    </div>
                    <h3 className="text-xl font-bold italic text-slate-800 dark:text-slate-100 leading-tight group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                        "{wager.description}"
                    </h3>
                </div>

                <div className="flex flex-wrap gap-2">
                    {wager.category && (
                        <div className="px-3 py-1.5 bg-slate-50 dark:bg-white/5 rounded-xl border border-slate-100 dark:border-white/5 flex items-center gap-2">
                            <CategoryIcon className="w-3 h-3 text-emerald-500" />
                            <span className="text-[9px] font-mono font-bold text-slate-500 uppercase">{wager.category}</span>
                        </div>
                    )}
                    {wager.subCategory && (
                        <div className="px-3 py-1.5 bg-slate-50 dark:bg-white/5 rounded-xl border border-slate-100 dark:border-white/5 flex items-center gap-2">
                            <Zap className="w-3 h-3 text-amber-500" />
                            <span className="text-[9px] font-mono font-bold text-slate-500 uppercase">{wager.subCategory}</span>
                        </div>
                    )}
                </div>
            </div>

            {/* Card Footer */}
            <div className="pt-6 border-t border-slate-100 dark:border-white/5 flex items-center justify-between relative z-10">
                <div className="flex items-center -space-x-2">
                    <div className="w-8 h-8 rounded-full bg-emerald-500 flex items-center justify-center text-[10px] font-black text-[#0D0D12] border-2 border-white dark:border-[#0D0D12]">
                        {wager.creator[0].toUpperCase()}
                    </div>
                    <div className="w-8 h-8 rounded-full bg-slate-200 dark:bg-white/10 flex items-center justify-center text-[10px] font-bold text-slate-500 border-2 border-white dark:border-[#0D0D12]">
                        {wager.participants.length > 0 ? <Users className="w-3.5 h-3.5" /> : '?'}
                    </div>
                    {wager.participants.length > 1 && (
                        <div className="pl-4 text-[10px] font-mono text-slate-500">
                            +{wager.participants.length} peers
                        </div>
                    )}
                </div>

                <button className="flex items-center gap-2 text-[10px] font-mono font-bold text-slate-400 group-hover:text-emerald-500 transition-all uppercase tracking-widest">
                    Access Terminal <ArrowUpRight className="w-3 h-3 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                </button>
            </div>
        </div>
    );
}