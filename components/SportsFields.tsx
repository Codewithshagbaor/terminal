'use client';

import { useState, useEffect } from 'react';
import { Search, Trophy, Calendar, Filter } from 'lucide-react';
import LeagueSelect from './LeagueSelect';
import TeamSearch from './TeamSearch';

interface SportsFieldsProps {
    onDataChange: (data: {
        sport: string;
        league: string;
        teamA: string;
        teamB: string;
        gameDate?: string;
        venue?: string;
        betType?: string;
    }) => void;
}

const sportsTypes = [
    { id: "basketball", name: "Basketball", icon: "🏀" },
    { id: "football", name: "American Football", icon: "🏈" },
    { id: "soccer", name: "Soccer", icon: "⚽" },
    { id: "baseball", name: "Baseball", icon: "⚾" },
    { id: "hockey", name: "Hockey", icon: "🏒" },
];

export default function SportsFields({ onDataChange }: SportsFieldsProps) {
    const [sport, setSport] = useState('');
    const [league, setLeague] = useState('');
    const [teamA, setTeamA] = useState<any>(null);
    const [teamB, setTeamB] = useState<any>(null);
    const [gameDate, setGameDate] = useState('');
    const [venue, setVenue] = useState('');
    const [betType, setBetType] = useState('');

    const isMatchReady = teamA && teamB;

    // Update parent component whenever data changes
    useEffect(() => {
        onDataChange({
            sport,
            league,
            teamA: teamA?.name || '',
            teamB: teamB?.name || '',
            gameDate,
            venue,
            betType
        });
    }, [sport, league, teamA, teamB, gameDate, venue, betType]);

    return (
        <div className="space-y-6">
            {/* Sport Selector */}
            <div className="space-y-2">
                <label className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-widest">
                    Select_Sport
                </label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {sportsTypes.map((sportType) => (
                        <button
                            key={sportType.id}
                            type="button"
                            onClick={() => {
                                setSport(sportType.id);
                                setLeague('');
                                setTeamA(null);
                                setTeamB(null);
                            }}
                            className={`rounded-2xl border-2 text-slate-900 dark:text-white px-4 py-3 transition-all ${sport === sportType.id
                                    ? 'border-emerald-500 bg-emerald-500/10 shadow-lg'
                                    : 'border-slate-200 dark:border-white/10 bg-slate-100 dark:bg-white/5 hover:border-emerald-500/50'
                                }`}
                        >
                            <div className="text-2xl mb-1">{sportType.icon}</div>
                            <div className="text-xs font-bold uppercase tracking-tight">{sportType.name}</div>
                        </button>
                    ))}
                </div>
            </div>

            {/* League Selector */}
            {sport && (
                <div className="space-y-2">
                    <label className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-widest">
                        Select_League
                    </label>
                    <LeagueSelect sportId={sport} onSelect={setLeague} />
                </div>
            )}

            {/* Team Selectors */}
            {league && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <TeamSearch
                        label="Side_A (Winner)"
                        leagueId={league}
                        sportId={sport}
                        selectedOtherTeam={teamB?.name}
                        selectedTeam={teamA}
                        onSelect={setTeamA}
                    />

                    <TeamSearch
                        label="Side_B (Opponent)"
                        leagueId={league}
                        sportId={sport}
                        selectedOtherTeam={teamA?.name}
                        selectedTeam={teamB}
                        onSelect={setTeamB}
                    />
                </div>
            )}

            {/* Match Info: Date, Venue, Bet Type */}
            {isMatchReady && (
                <>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-widest">
                                Game_Date_&_Time
                            </label>
                            <div className="relative">
                                <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                <input
                                    type="datetime-local"
                                    value={gameDate}
                                    onChange={(e) => setGameDate(e.target.value)}
                                    className="w-full bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-2xl pl-12 pr-4 py-4 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/50 text-slate-900 dark:text-white"
                                />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-widest">
                                Venue (Optional)
                            </label>
                            <input
                                type="text"
                                placeholder="e.g. Madison Square Garden"
                                value={venue}
                                onChange={(e) => setVenue(e.target.value)}
                                className="w-full bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-2xl px-4 py-4 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/50 text-slate-900 dark:text-white"
                            />
                        </div>
                    </div>

                    {/* Bet Type Selection */}
                    <div className="space-y-2">
                        <label className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-widest">
                            What_Are_You_Betting_On?
                        </label>
                        <select
                            value={betType}
                            onChange={(e) => setBetType(e.target.value)}
                            className="w-full bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-2xl px-4 py-4 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/50 appearance-none text-slate-900 dark:text-white cursor-pointer"
                        >
                            <option value="">Select what you're betting on</option>
                            <option value="winner">Match Winner</option>
                            <option value="spread">Point Spread</option>
                            <option value="total">Over/Under Total</option>
                            <option value="player">Player Performance</option>
                        </select>
                    </div>
                </>
            )}

            <div className="p-4 rounded-2xl bg-blue-500/5 border border-blue-500/10 flex items-start gap-4">
                <Filter className="w-4 h-4 text-blue-500 mt-1 shrink-0" />
                <p className="text-[10px] text-slate-400 font-mono leading-relaxed italic">
                    Protocol Tip: Real-time sports wagers rely on subjective consensus. Participants, not centralized APIs, are the final authority.
                </p>
            </div>
        </div>
    );
}
