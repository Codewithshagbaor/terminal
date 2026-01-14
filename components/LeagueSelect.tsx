'use client'

import React, { useState, useEffect } from 'react'
import useSWR from 'swr'
import { Trophy, AlertCircle, Loader2, ChevronDown } from 'lucide-react'

const fetcher = (url: string) => fetch(url).then(res => res.json())

interface LeagueSelectProps {
    sportId: string
    onSelect: (leagueId: string, leagueName: string) => void
    initialValue?: string  // League ID to pre-select
}

export default function LeagueSelect({ sportId, onSelect, initialValue }: LeagueSelectProps) {
    const { data, error, isLoading } = useSWR(
        sportId ? `/api/leagues?sportId=${sportId}` : null,
        fetcher
    )

    const [open, setOpen] = useState(false)
    // Find initial league from data if initialValue is provided
    const initialLeague = data?.find((l: any) => l.id === initialValue || l.name === initialValue)
    const [selected, setSelected] = useState<any>(initialLeague || null)

    // Update selected when data loads and we have an initialValue
    useEffect(() => {
        if (data && initialValue && !selected) {
            const found = data.find((l: any) => l.id === initialValue || l.name === initialValue)
            if (found) setSelected(found)
        }
    }, [data, initialValue])

    if (isLoading) {
        return (
            <div className="flex items-center gap-2 p-4 rounded-2xl bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10">
                <Loader2 className="h-4 w-4 text-slate-400 animate-spin" />
                <p className="text-slate-400 text-sm font-mono">Loading leagues…</p>
            </div>
        )
    }

    if (error) {
        return (
            <div className="flex items-center gap-2 p-4 rounded-2xl bg-red-500/10 border border-red-500/20">
                <AlertCircle className="h-4 w-4 text-red-400" />
                <p className="text-red-400 text-sm font-mono">Failed to load leagues</p>
            </div>
        )
    }

    if (!data || data.length === 0) {
        return (
            <div className="flex items-center gap-2 p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20">
                <Trophy className="h-4 w-4 text-amber-400" />
                <p className="text-amber-400 text-sm font-mono">
                    No leagues available for this sport
                </p>
            </div>
        )
    }

    return (
        <div className="relative">
            {/* Trigger */}
            <button
                onClick={() => setOpen(!open)}
                className="w-full flex items-center justify-between gap-3 px-4 py-4 rounded-2xl bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white font-mono focus:outline-none focus:ring-2 focus:ring-emerald-500/40"
            >
                <div className="flex items-center gap-3">
                    {selected ? (
                        <>
                            {selected.logo_url ? (
                                <img
                                    src={selected.logo_url}
                                    className="w-6 h-6 rounded-sm object-cover"
                                    alt={selected.name}
                                />
                            ) : (
                                <div className="w-6 h-6 bg-white/10 rounded-sm flex items-center justify-center">
                                    <Trophy className="w-3 h-3 text-white/60" />
                                </div>
                            )}
                            <span>{selected.name}</span>
                        </>
                    ) : (
                        <span className="text-slate-400 dark:text-white/50">
                            Choose League…
                        </span>
                    )}
                </div>

                <ChevronDown
                    className={`h-4 w-4 transition-transform ${open ? 'rotate-180' : ''
                        }`}
                />
            </button>

            {/* Dropdown */}
            {open && (
                <div className="w-full bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-2xl px-4 py-4 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/50 text-slate-900 dark:text-white">
                    {data.map((league: any) => (
                        <div
                            key={league.id}
                            onClick={() => {
                                setSelected(league)
                                setOpen(false)
                                onSelect(league.id, league.name)
                            }}
                            className="flex items-center gap-3 px-4 py-3 cursor-pointer hover:bg-slate-200 dark:hover:bg-white/10 transition"
                        >
                            {league.logo_url ? (
                                <img
                                    src={league.logo_url}
                                    className="w-6 h-6 rounded-sm object-cover"
                                    alt={league.name}
                                />
                            ) : (
                                <div className="w-6 h-6 bg-white/10 rounded-sm flex items-center justify-center">
                                    <Trophy className="w-3 h-3 text-white/60" />
                                </div>
                            )}
                            <span className="font-mono text-sm truncate">
                                {league.name}
                            </span>
                        </div>
                    ))}
                </div>
            )}
        </div>
    )
}
