'use client';

import useSWR from 'swr';
import { Trophy, AlertCircle, Loader2 } from 'lucide-react';

const fetcher = (url: string) => fetch(url).then(res => res.json());

interface LeagueSelectProps {
    sportId: string;
    onSelect: (id: string) => void;
}

export default function LeagueSelect({ sportId, onSelect }: LeagueSelectProps) {
    const { data, error, isLoading } = useSWR(
        sportId ? `/api/leagues?sportId=${sportId}` : null,
        fetcher
    );

    if (isLoading) {
        return (
            <div className="space-y-2">
                <div className="flex items-center gap-2 p-4 rounded-2xl bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10">
                    <Loader2 className="h-4 w-4 text-slate-400 animate-spin" />
                    <p className="text-slate-400 text-sm font-mono">Loading leagues...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex items-center gap-2 p-4 rounded-2xl bg-red-500/10 border border-red-500/20">
                <AlertCircle className="h-4 w-4 text-red-400" />
                <p className="text-red-400 text-sm font-mono">Failed to load leagues</p>
            </div>
        );
    }

    if (!data || data.length === 0) {
        return (
            <div className="flex items-center gap-2 p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20">
                <Trophy className="h-4 w-4 text-amber-400" />
                <p className="text-amber-400 text-sm font-mono">No leagues available for this sport</p>
            </div>
        );
    }

    return (
        <div className="space-y-2">
            <select
                onChange={(e) => onSelect(e.target.value)}
                className="w-full bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-2xl px-4 py-4 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/50 appearance-none text-slate-900 dark:text-white font-mono cursor-pointer"
            >
                <option value="">Choose League...</option>
                {data.map((league: any) => (
                    <option key={league.id} value={league.id}>
                        {league.name}
                    </option>
                ))}
            </select>
        </div>
    );
}
