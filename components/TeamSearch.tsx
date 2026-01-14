'use client';

import { useState, useEffect } from 'react';
import useSWR from 'swr';
import { X, Loader2, AlertCircle } from 'lucide-react';

const fetcher = (url: string) => fetch(url).then(res => res.json());

interface TeamSearchProps {
    label: string;
    leagueId: string;
    sportId: string;
    selectedOtherTeam: string | null;
    selectedTeam: any;
    onSelect: (team: any | null) => void;
}

export default function TeamSearch({
    label,
    leagueId,
    sportId,
    selectedOtherTeam,
    selectedTeam,
    onSelect
}: TeamSearchProps) {
    const { data: teams, isLoading } = useSWR(
        leagueId ? `/api/teams?leagueId=${leagueId}&sportId=${sportId}` : null,
        fetcher
    );

    // Initialize search with selected team name if available
    const [search, setSearch] = useState(selectedTeam?.name || '');

    // Update search when selectedTeam changes externally
    useEffect(() => {
        if (selectedTeam?.name && search !== selectedTeam.name) {
            setSearch(selectedTeam.name);
        }
    }, [selectedTeam]);

    const filtered = Array.isArray(teams)
        ? teams.filter(t =>
            t.name.toLowerCase().includes(search.toLowerCase()) &&
            t.name !== selectedOtherTeam
        )
        : [];

    const displayTeams = search ? filtered : (teams || []);

    return (
        <div className="space-y-2">
            <label className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-widest flex justify-between items-center">
                <span>{label}</span>
                {selectedTeam && (
                    <button
                        type="button"
                        onClick={() => {
                            setSearch('');
                            onSelect(null);
                        }}
                        className="text-xs text-emerald-500 hover:text-white flex items-center gap-1 transition-colors"
                    >
                        <X size={14} />
                        Clear
                    </button>
                )}
            </label>

            <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-2xl px-4 py-4 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/50 text-slate-900 dark:text-white"
                placeholder="Search team..."
            />

            <div className="bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-2xl mt-2 max-h-60 overflow-y-auto">
                {isLoading && (
                    <div className="p-4 flex items-center gap-2 text-slate-400">
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span className="text-sm font-mono">Loading teams...</span>
                    </div>
                )}

                {!isLoading && displayTeams.length === 0 && (
                    <div className="p-4 flex items-center gap-2 text-slate-400">
                        <AlertCircle className="w-4 h-4" />
                        <span className="text-sm font-mono">No teams found.</span>
                    </div>
                )}

                {!isLoading && displayTeams.map((team: any) => (
                    <button
                        key={team.id}
                        onClick={() => {
                            setSearch(team.name);
                            onSelect(team);
                        }}
                        className="w-full px-4 py-3 text-left text-slate-900 dark:text-white hover:bg-emerald-500/20 flex items-center space-x-3 transition-colors first:rounded-t-2xl last:rounded-b-2xl"
                        disabled={team.name === selectedOtherTeam}
                    >
                        {team.logo_url && (
                            <img src={team.logo_url} alt={team.name} className="w-6 h-6 rounded-sm" />
                        )}
                        <span className="text-sm font-bold">{team.name}</span>
                    </button>
                ))}
            </div>
        </div>
    );
}
