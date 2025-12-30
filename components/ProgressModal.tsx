'use client';

import { Loader2, CheckCircle2, Shield, Lock, FileCode, Check, Send, X } from 'lucide-react';

interface ProgressModalProps {
    isOpen: boolean;
    stage: number;
    hasError?: boolean;
    onClose: () => void;
}

export default function ProgressModal({ isOpen, stage, hasError = false, onClose }: ProgressModalProps) {
    const stages = [
        {
            label: 'Metadata_Upload',
            detail: 'Uploading wager metadata to IPFS via Pinata',
            icon: <FileCode className="w-4 h-4" />,
        },
        {
            label: 'Wager_Creation',
            detail: 'Broadcasting contract creation to blockchain',
            icon: <Lock className="w-4 h-4" />,
        },
        {
            label: 'Token_Approval',
            detail: 'Updating token allowance for contract',
            icon: <Send className="w-4 h-4" />,
        },
        {
            label: 'Auto_Join',
            detail: 'Finalizing peer connection and staking',
            icon: <Shield className="w-4 h-4" />,
        },
        {
            label: 'Protocol_Complete',
            detail: 'Wager successfully created and joined',
            icon: <CheckCircle2 className="w-4 h-4" />,
        },
    ];

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-slate-900/80 dark:bg-[#050508]/95 backdrop-blur-xl animate-in fade-in duration-300">
            <div className="w-full max-w-lg bg-white dark:bg-[#0D0D12] border border-slate-200 dark:border-white/10 rounded-[3rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-500">
                <div className="p-8 space-y-8">
                    {/* Header */}
                    <div className="text-center space-y-2">
                        <div className="flex items-center justify-between">
                            <div className="flex-1" />
                            <h3 className="text-sm font-black italic tracking-tighter text-slate-900 dark:text-white uppercase">
                                {hasError ? 'Execution_Failed' : 'Execution_Terminal'}
                            </h3>
                            {(stage === 5 || hasError) && (
                                <button
                                    onClick={onClose}
                                    className="flex-1 flex justify-end text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            )}
                            {stage < 5 && !hasError && <div className="flex-1" />}
                        </div>
                        <p className="text-[10px] font-mono text-slate-400 dark:text-slate-500 uppercase tracking-widest">
                            {hasError ? 'Transaction encountered an error' : 'Synchronizing blockchain state...'}
                        </p>
                    </div>

                    {/* Error Display */}
                    {hasError && (
                        <div className="p-4 rounded-2xl bg-red-500/10 border border-red-500/20 text-center">
                            <p className="text-sm text-red-500 font-mono">
                                Something went wrong. Please try again.
                            </p>
                        </div>
                    )}

                    {/* Progress Stages */}
                    {!hasError && (
                        <div className="space-y-4">
                            {stages.map((s, idx) => {
                                const current = idx + 1;
                                const status =
                                    stage > current ? 'complete' : stage === current ? 'active' : 'pending';

                                return (
                                    <div
                                        key={s.label}
                                        className={`flex items-start gap-4 transition-all duration-500 ${status === 'pending' ? 'opacity-30 blur-[0.5px]' : 'opacity-100'
                                            }`}
                                    >
                                        <div
                                            className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 border transition-all duration-700 ${status === 'complete'
                                                    ? 'bg-emerald-500 border-emerald-400 text-white'
                                                    : status === 'active'
                                                        ? 'bg-white dark:bg-[#0D0D12] border-emerald-500 text-emerald-600 terminal-pulse scale-110'
                                                        : 'bg-slate-100 dark:bg-white/5 border-slate-200 dark:border-white/10 text-slate-400'
                                                }`}
                                        >
                                            {status === 'complete' ? <Check className="w-4 h-4" /> : s.icon}
                                        </div>

                                        <div className="space-y-0.5 pt-1">
                                            <div
                                                className={`text-[11px] font-bold uppercase tracking-widest ${status === 'active'
                                                        ? 'text-emerald-600 dark:text-emerald-400'
                                                        : 'text-slate-900 dark:text-white'
                                                    }`}
                                            >
                                                {s.label}
                                            </div>
                                            <div className="text-[9px] font-mono text-slate-400 dark:text-slate-500 leading-tight">
                                                {s.detail}
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}

                    {/* Success State */}
                    {stage === 5 && !hasError && (
                        <div className="pt-4 animate-in fade-in duration-1000">
                            <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-center space-y-3">
                                <p className="text-[10px] font-mono text-emerald-600 dark:text-emerald-400 font-bold uppercase tracking-widest">
                                    Protocol Operational
                                </p>
                                <button
                                    onClick={onClose}
                                    className="w-full py-4 bg-emerald-500 text-white dark:text-[#0D0D12] font-black italic rounded-xl btn-tactile shadow-xl shadow-emerald-500/20 uppercase"
                                >
                                    Create Another Wager
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Error State Button */}
                    {hasError && (
                        <button
                            onClick={onClose}
                            className="w-full py-4 bg-slate-900 dark:bg-white text-white dark:text-[#0D0D12] font-black italic rounded-xl btn-tactile shadow-xl uppercase"
                        >
                            Try Again
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}
