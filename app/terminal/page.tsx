'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
    Shield,
    Search,
    ArrowRight,
    AlertTriangle,
    Terminal as TerminalIcon,
    Zap
} from 'lucide-react';

export default function TerminalSearchPage() {
    const router = useRouter();
    const [betId, setBetId] = useState('');
    const [error, setError] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        const id = parseInt(betId.trim());
        if (isNaN(id) || id < 0) {
            setError('Please enter a valid bet ID');
            return;
        }

        setError('');
        router.push(`/terminal/${id}`);
    };

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-[#050508] py-8 px-4 md:px-8 flex items-center justify-center">
            <div className="w-full max-w-xl space-y-8 animate-in fade-in zoom-in-95 duration-500">
                {/* Header */}
                <div className="text-center space-y-4">
                    <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 mx-auto">
                        <TerminalIcon className="w-10 h-10 text-emerald-600 dark:text-emerald-400" />
                    </div>
                    <div>
                        <h1 className="text-4xl md:text-5xl font-black italic tracking-tighter uppercase text-slate-900 dark:text-white">
                            Terminal_Access
                        </h1>
                        <p className="text-sm text-slate-500 font-mono mt-2">
                            Enter a Bet ID to view and participate in voting
                        </p>
                    </div>
                </div>

                {/* Search Form */}
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="obsidian-card rounded-2xl p-8 bg-white dark:bg-transparent border border-slate-200 dark:border-white/10 shadow-lg dark:shadow-2xl space-y-6">
                        <div className="space-y-2">
                            <label className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-widest">
                                Bet_ID
                            </label>
                            <div className="relative">
                                <input
                                    type="text"
                                    value={betId}
                                    onChange={(e) => {
                                        setBetId(e.target.value);
                                        setError('');
                                    }}
                                    placeholder="Enter bet ID (e.g., 1, 42, 100)"
                                    className="w-full bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-2xl px-5 py-5 text-lg font-mono focus:outline-none focus:ring-2 focus:ring-emerald-500/50 text-slate-900 dark:text-white placeholder:text-slate-400"
                                />
                                <div className="absolute right-4 top-1/2 -translate-y-1/2">
                                    <Search className="w-5 h-5 text-slate-400" />
                                </div>
                            </div>
                            {error && (
                                <div className="flex items-center gap-2 text-rose-500 text-sm">
                                    <AlertTriangle className="w-4 h-4" />
                                    {error}
                                </div>
                            )}
                        </div>

                        <button
                            type="submit"
                            className="w-full py-5 bg-emerald-500 text-white dark:text-[#0D0D12] font-black italic rounded-2xl flex items-center justify-center gap-3 transition-all btn-tactile shadow-xl shadow-emerald-500/20 group uppercase tracking-tight"
                        >
                            Access Terminal
                            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                        </button>
                    </div>
                </form>

                {/* Quick Access */}
                <div className="space-y-4">
                    <div className="flex items-center gap-2 justify-center">
                        <Zap className="w-4 h-4 text-amber-500" />
                        <span className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-widest">
                            Quick_Access
                        </span>
                    </div>
                    <div className="grid grid-cols-3 gap-3">
                        {[1, 2, 3].map((id) => (
                            <button
                                key={id}
                                onClick={() => router.push(`/terminal/${id}`)}
                                className="p-4 rounded-xl bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 hover:border-emerald-500/50 transition-all group"
                            >
                                <div className="text-[9px] font-mono text-slate-400 uppercase tracking-widest">BET</div>
                                <div className="text-lg font-bold font-mono text-slate-900 dark:text-white group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                                    #{id}
                                </div>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Info */}
                <div className="text-center text-[10px] font-mono text-slate-400 space-y-1">
                    <p>The Terminal provides access to on-chain wager voting</p>
                    <p className="text-slate-500">All votes are recorded on the blockchain</p>
                </div>
            </div>
        </div>
    );
}
