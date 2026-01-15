'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useParams } from 'next/navigation';
import {
    Shield,
    CheckCircle2,
    AlertTriangle,
    Clock,
    UserPlus2,
    Fingerprint,
    Trophy,
    Sparkles,
    Loader2,
    X,
    Share2,
    FileDown,
    ChevronRight,
    ExternalLink,
    Lock,
    ArrowRight,
    Users,
    Vote,
    Wallet,
    Check,
    Copy
} from 'lucide-react';
import { useAccount, useChainId } from 'wagmi';
import { formatUnits, hexToString, pad, stringToHex } from 'viem';
import toast from 'react-hot-toast';
import { useGetBetDetails, useGetParticipants, useHasVoted, BetStatus } from '@/hooks/read/useBetDetails';
import { useVote, useResolve } from '@/hooks/write/useVote';
import { COMMON_TOKENS } from '@/constants/contracts';

export default function TerminalPage() {
    const params = useParams();
    const betId = params?.betId ? Number(params.betId) : undefined;

    const { address, isConnected } = useAccount();
    const chainId = useChainId();

    // Fetch bet details from blockchain
    const { betDetails, isLoading: isLoadingDetails, error: detailsError, refetch: refetchDetails } = useGetBetDetails(betId);
    const { participants, isLoading: isLoadingParticipants, refetch: refetchParticipants } = useGetParticipants(betId);
    const { hasVoted: userHasVoted, refetch: refetchHasVoted } = useHasVoted(betId, address);

    // Voting hook
    const { vote, isPending: isVoting, isSuccess: voteSuccess, error: voteError, reset: resetVote } = useVote();
    const { resolve, isPending: isResolving, isSuccess: resolveSuccess, error: resolveError } = useResolve();

    // UI State
    const [confirmingWinner, setConfirmingWinner] = useState<string | null>(null);
    const [isVerifying, setIsVerifying] = useState(false);
    const [verificationProgress, setVerificationProgress] = useState(0);
    const [pendingOutcome, setPendingOutcome] = useState<string | null>(null);
    const [copied, setCopied] = useState(false);
    const [timeLeft, setTimeLeft] = useState<{ h: number; m: number; s: number } | null>(null);

    // Countdown clock effect - calculate time left from vote deadline
    useEffect(() => {
        if (!betDetails?.voteDeadline) {
            setTimeLeft(null);
            return;
        }

        const deadline = Number(betDetails.voteDeadline) * 1000; // Convert to milliseconds

        const updateTimer = () => {
            const now = Date.now();
            const diff = deadline - now;

            if (diff <= 0) {
                setTimeLeft({ h: 0, m: 0, s: 0 });
                return;
            }

            const hours = Math.floor(diff / (1000 * 60 * 60));
            const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
            const seconds = Math.floor((diff % (1000 * 60)) / 1000);

            setTimeLeft({ h: hours, m: minutes, s: seconds });
        };

        updateTimer(); // Initial call
        const interval = setInterval(updateTimer, 1000);

        return () => clearInterval(interval);
    }, [betDetails?.voteDeadline]);

    // Copy wager ID to clipboard
    const copyWagerId = useCallback(() => {
        const url = `${window.location.origin}/terminal/${betId}`;
        navigator.clipboard.writeText(url).then(() => {
            setCopied(true);
            toast.success('Wager link copied to clipboard!');
            setTimeout(() => setCopied(false), 2000);
        }).catch(() => {
            toast.error('Failed to copy link');
        });
    }, [betId]);

    // Get token info
    const tokens = COMMON_TOKENS[chainId as keyof typeof COMMON_TOKENS] || [];
    const tokenInfo = betDetails ? tokens.find(t => t.address.toLowerCase() === betDetails.token.toLowerCase()) : undefined;
    const tokenDecimals = tokenInfo?.decimals || 18;
    const tokenSymbol = tokenInfo?.symbol || 'TOKEN';

    // Format stake amount
    const formattedAmount = betDetails ? Number(formatUnits(betDetails.stakeAmount, tokenDecimals)).toFixed(2) : '0.00';

    // Convert status to readable string
    const getStatusString = (status: BetStatus) => {
        switch (status) {
            case BetStatus.Created: return 'CREATED';
            case BetStatus.Active: return 'ACTIVE';
            case BetStatus.VotingClosed: return 'VOTING_CLOSED';
            case BetStatus.Resolved: return 'RESOLVED';
            case BetStatus.Cancelled: return 'CANCELLED';
            default: return 'UNKNOWN';
        }
    };

    const isSettled = betDetails?.status === BetStatus.Resolved;
    const isActive = betDetails?.status === BetStatus.Active;


    // Check if user is a participant
    const isParticipant = participants?.some(p => p.toLowerCase() === address?.toLowerCase());
    // Determine current phase
    const now = Math.floor(Date.now() / 1000);
    const isBeforeDeadline = betDetails ? now < Number(betDetails.voteDeadline) : false;
    const isAfterDeadline = betDetails ? now >= Number(betDetails.voteDeadline) : false;

    const isJoiningPhase = betDetails?.status === BetStatus.Created && isBeforeDeadline;
    const isVotingPhase = (betDetails?.status === BetStatus.Created || betDetails?.status === BetStatus.Active) && isAfterDeadline;
    const canVote = isVotingPhase && !userHasVoted && isConnected && isParticipant;

    // Handle vote success
    useEffect(() => {
        if (voteSuccess) {
            toast.dismiss();
            toast.success('Vote submitted successfully!');
            setIsVerifying(false);
            setConfirmingWinner(null);
            refetchHasVoted();
            refetchDetails();
            resetVote();
        }
    }, [voteSuccess, refetchHasVoted, refetchDetails, resetVote]);

    // Handle vote error
    useEffect(() => {
        if (voteError) {
            toast.dismiss();
            toast.error(`Vote failed: ${voteError.message}`);
            setIsVerifying(false);
            setConfirmingWinner(null);
        }
    }, [voteError]);

    // Handle resolve success
    useEffect(() => {
        if (resolveSuccess) {
            toast.dismiss();
            toast.success('Bet resolved successfully!');
            refetchDetails();
        }
    }, [resolveSuccess, refetchDetails]);

    const handleVoteClick = (outcome: string) => {
        if (!canVote || !isParticipant) {
            if (!isConnected) {
                toast.error('Please connect your wallet');
            } else if (!isParticipant) {
                toast.error('Only participants can vote');
            } else if (userHasVoted) {
                toast.error('You have already voted');
            }
            return;
        }
        setPendingOutcome(outcome);
        setConfirmingWinner(outcome);
    };

    const executeVote = () => {
        if (!pendingOutcome || betId === undefined) return;

        setIsVerifying(true);
        setConfirmingWinner(null);

        // Start verification animation
        let progress = 0;
        const interval = setInterval(() => {
            progress += 10;
            setVerificationProgress(progress);
            if (progress >= 50) {
                clearInterval(interval);
                // Execute the actual vote
                toast.loading('Submitting vote to blockchain...');
                vote(betId, pendingOutcome);
            }
        }, 100);
    };

    const handleResolve = () => {
        if (betId === undefined) return;
        toast.loading('Resolving bet...');
        resolve(betId);
    };

    // Decode final outcome
    const decodedOutcome = betDetails?.finalOutcome && betDetails.finalOutcome !== '0x0000000000000000000000000000000000000000000000000000000000000000'
        ? hexToString(betDetails.finalOutcome, { size: 32 }).replace(/\0/g, '')
        : null;

    if (!betId) {
        return (
            <div className="min-h-screen bg-slate-50 dark:bg-[#050508] py-8 px-4 md:px-8 flex items-center justify-center">
                <div className="text-center space-y-4">
                    <AlertTriangle className="w-16 h-16 text-amber-500 mx-auto" />
                    <h2 className="text-2xl font-bold text-slate-900 dark:text-white">No Bet ID Provided</h2>
                    <p className="text-slate-500">Please provide a valid bet ID in the URL.</p>
                </div>
            </div>
        );
    }

    if (isLoadingDetails || isLoadingParticipants) {
        return (
            <div className="min-h-screen bg-slate-50 dark:bg-[#050508] py-8 px-4 md:px-8 flex items-center justify-center">
                <div className="text-center space-y-4">
                    <Loader2 className="w-16 h-16 text-emerald-500 animate-spin mx-auto" />
                    <h2 className="text-xl font-bold text-slate-900 dark:text-white">Loading Terminal...</h2>
                    <p className="text-slate-500 font-mono text-sm">Fetching bet #{betId} from blockchain</p>
                </div>
            </div>
        );
    }

    if (detailsError || !betDetails) {
        return (
            <div className="min-h-screen bg-slate-50 dark:bg-[#050508] py-8 px-4 md:px-8 flex items-center justify-center">
                <div className="text-center space-y-4">
                    <AlertTriangle className="w-16 h-16 text-rose-500 mx-auto" />
                    <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Failed to Load Bet</h2>
                    <p className="text-slate-500">{detailsError?.message || 'Bet not found'}</p>
                    <button
                        onClick={() => refetchDetails()}
                        className="px-6 py-3 bg-emerald-500 text-white rounded-xl font-bold"
                    >
                        Retry
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-4 sm:space-y-6 animate-in fade-in zoom-in-95 duration-300 relative transition-colors">

            {/* Vote Confirmation Modal */}
            {confirmingWinner && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/80 dark:bg-[#050508]/95 backdrop-blur-xl animate-in fade-in duration-300">
                    <div className="w-full max-w-xl bg-white dark:bg-[#0D0D12] border border-slate-200 dark:border-white/10 rounded-[2rem] shadow-2xl dark:shadow-[0_0_100px_rgba(0,0,0,0.8)] overflow-hidden animate-in zoom-in-95 duration-500">
                        {/* Modal Header */}
                        <div className="p-6 border-b border-slate-200 dark:border-white/5 bg-slate-50 dark:bg-white/2 flex justify-between items-center">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center relative">
                                    <Lock className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                                    <div className="absolute -top-1 -right-1 w-3 h-3 bg-emerald-500 rounded-full border-2 border-white dark:border-[#0D0D12] terminal-pulse"></div>
                                </div>
                                <div>
                                    <h3 className="text-sm font-black italic tracking-tighter text-slate-900 dark:text-white uppercase">
                                        Confirm_Vote
                                    </h3>
                                    <p className="text-[10px] font-mono text-slate-400 dark:text-slate-500 uppercase tracking-widest">On-Chain Voting</p>
                                </div>
                            </div>
                            <button
                                onClick={() => {
                                    setConfirmingWinner(null);
                                    setPendingOutcome(null);
                                }}
                                className="p-2 hover:bg-slate-100 dark:hover:bg-white/5 rounded-full transition-colors group"
                            >
                                <X className="w-5 h-5 text-slate-400 group-hover:text-slate-900 dark:group-hover:text-white" />
                            </button>
                        </div>

                        <div className="flex flex-col md:flex-row">
                            <div className="flex-1 p-8 bg-slate-50/50 dark:bg-white/[0.02] border-r border-slate-200 dark:border-white/5 space-y-8">
                                <div className="space-y-4">
                                    <div className="space-y-1">
                                        <span className="text-[9px] font-mono text-slate-400 dark:text-slate-600 uppercase tracking-[0.2em]">Stake_Valuation</span>
                                        <div className="text-4xl font-bold font-mono text-slate-900 dark:text-white tracking-tighter italic">
                                            {formattedAmount} <span className="text-sm text-slate-500 not-italic">{tokenSymbol}</span>
                                        </div>
                                    </div>

                                    <div className="space-y-4 pt-4 border-t border-slate-100 dark:border-white/5">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
                                                <Trophy className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                                            </div>
                                            <div className="space-y-0.5">
                                                <span className="text-[8px] font-mono text-slate-400 dark:text-slate-500 uppercase tracking-widest block">Your_Vote</span>
                                                <span className="text-xs font-bold text-slate-900 dark:text-white uppercase truncate block max-w-[150px]">{confirmingWinner}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="p-4 rounded-xl bg-rose-50 dark:bg-rose-500/5 border border-rose-100 dark:border-rose-500/10 space-y-2">
                                    <div className="flex items-center gap-2 text-rose-600 dark:text-rose-400 text-[10px] font-bold uppercase tracking-wider">
                                        <AlertTriangle className="w-3 h-3" /> On-Chain Transaction
                                    </div>
                                    <p className="text-[9px] text-slate-600 dark:text-slate-500 leading-relaxed uppercase font-mono italic">
                                        This vote will be recorded on the blockchain and cannot be changed.
                                    </p>
                                </div>
                            </div>

                            <div className="flex-1 p-8 space-y-8 flex flex-col justify-center">
                                <div className="space-y-4 text-center md:text-left">
                                    <h4 className="text-lg font-bold italic text-slate-900 dark:text-white tracking-tight leading-snug">
                                        Confirm your vote?
                                    </h4>
                                    <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                                        By confirming, you will submit your vote for "{confirmingWinner}" to the blockchain.
                                    </p>
                                </div>

                                <div className="space-y-3">
                                    <button
                                        onClick={executeVote}
                                        disabled={isVoting}
                                        className="w-full py-5 bg-emerald-500 text-white dark:text-[#0D0D12] font-black italic rounded-2xl flex items-center justify-center gap-3 transition-all btn-tactile shadow-xl shadow-emerald-500/20 group disabled:opacity-50"
                                    >
                                        {isVoting ? (
                                            <>
                                                <Loader2 className="w-5 h-5 animate-spin" />
                                                SUBMITTING...
                                            </>
                                        ) : (
                                            <>
                                                SUBMIT VOTE
                                                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                                            </>
                                        )}
                                    </button>
                                    <button
                                        onClick={() => {
                                            setConfirmingWinner(null);
                                            setPendingOutcome(null);
                                        }}
                                        className="w-full py-4 bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-500 font-bold text-[10px] uppercase tracking-[0.2em] rounded-2xl hover:bg-slate-200 dark:hover:bg-white/10 hover:text-slate-900 dark:hover:text-white transition-all"
                                    >
                                        CANCEL
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Verification Loader */}
            {isVerifying && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/80 dark:bg-[#0D0D12]/80 backdrop-blur-md animate-in fade-in duration-300">
                    <div className="w-full max-sm text-center space-y-8">
                        <div className="relative inline-block">
                            <div className="w-24 h-24 rounded-full border-2 border-emerald-500/10 flex items-center justify-center relative overflow-hidden">
                                <Loader2 className="w-10 h-10 text-emerald-500 animate-spin" />
                                <div className="absolute inset-0 bg-emerald-500/5 animate-pulse"></div>
                            </div>
                            <div className="absolute -top-2 -right-2 w-8 h-8 rounded-full bg-emerald-500 text-white dark:text-[#0D0D12] flex items-center justify-center text-[10px] font-bold border-4 border-slate-900 dark:border-[#0D0D12]">
                                {Math.round(verificationProgress)}%
                            </div>
                        </div>

                        <div className="space-y-4">
                            <div className="space-y-1">
                                <h3 className="text-xl font-bold italic text-white tracking-tight">Submitting Vote...</h3>
                                <p className="text-[10px] font-mono text-slate-400 uppercase tracking-[0.3em]">Transaction in Progress</p>
                            </div>
                            <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden max-w-[200px] mx-auto border border-white/5">
                                <div
                                    className="h-full bg-emerald-500 transition-all duration-300 ease-out shadow-[0_0_10px_rgba(16,185,129,0.5)]"
                                    style={{ width: `${verificationProgress}%` }}
                                ></div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Main Terminal UI */}
            <div className="obsidian-card rounded-[2.5rem] overflow-hidden border-slate-200 dark:border-white/10 shadow-2xl bg-white dark:bg-[#0D0D12]">
                <div className="p-6 border-b border-slate-100 dark:border-white/5 bg-slate-50 dark:bg-white/2 flex justify-between items-center">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center shrink-0">
                            <Shield className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                        </div>
                        <div>
                            <h2 className="font-mono text-sm font-bold text-slate-900 dark:text-slate-200 tracking-tight">WAGER-{betId}</h2>
                            <div className="flex items-center gap-2 mt-0.5">
                                <div className={`w-1.5 h-1.5 rounded-full ${isSettled ? 'bg-slate-400' : 'bg-emerald-500 terminal-pulse'}`} />
                                <span className={`text-[10px] uppercase tracking-widest font-bold ${isSettled ? 'text-slate-400' : 'text-emerald-600 dark:text-emerald-500'}`}>
                                    {getStatusString(betDetails.status)}
                                </span>
                            </div>
                        </div>
                    </div>
                    <div className="flex items-center gap-4">
                        {/* Countdown Clock */}
                        {!isSettled && timeLeft && (
                            <div className={`flex items-center gap-2 px-3 py-1.5 bg-slate-100 dark:bg-white/5 border rounded-xl font-mono transition-colors duration-500 ${timeLeft.h === 0 && timeLeft.m < 15 ? 'border-rose-500/30 text-rose-500 shadow-[0_0_15px_rgba(239,68,68,0.1)]' : 'border-slate-200 dark:border-white/10 text-emerald-500 shadow-sm'
                                }`}>
                                <Clock className="w-3 h-3" />
                                <span className="text-[11px] font-bold tracking-tighter">
                                    {String(timeLeft.h).padStart(2, '0')}:{String(timeLeft.m).padStart(2, '0')}:{String(timeLeft.s).padStart(2, '0')}
                                </span>
                            </div>
                        )}
                        <div className="h-8 w-px bg-slate-200 dark:bg-white/10 mx-1"></div>
                        <button
                            onClick={copyWagerId}
                            className="flex items-center gap-2 px-3 py-1.5 bg-slate-50 dark:bg-transparent hover:bg-emerald-500/10 border border-slate-200 dark:border-transparent hover:border-emerald-500/20 rounded-lg text-[9px] font-mono font-bold text-slate-500 hover:text-emerald-500 transition-all uppercase tracking-widest shadow-sm dark:shadow-none"
                        >
                            {copied ? <Check className="w-3 h-3" /> : <Share2 className="w-3 h-3" />}
                            {copied ? 'Copied' : 'Invite'}
                        </button>
                    </div>
                </div>

                <div className="p-4 sm:p-6 md:p-10">
                    {/* Category & Metadata */}
                    <div className={`mb-12 text-center space-y-12 transition-all duration-700 ${isSettled ? 'opacity-30 blur-[1px]' : 'opacity-100'}`}>
                        <div className="relative inline-block px-4 py-2">
                            <div className="absolute top-0 left-0 w-2 h-2 border-t border-l border-emerald-500/50"></div>
                            <div className="absolute top-0 right-0 w-2 h-2 border-t border-r border-emerald-500/50"></div>
                            <div className="absolute bottom-0 left-0 w-2 h-2 border-b border-l border-emerald-500/50"></div>
                            <div className="absolute bottom-0 right-0 w-2 h-2 border-b border-r border-emerald-500/50"></div>
                            <h3 className="text-lg sm:text-xl md:text-2xl font-medium leading-relaxed max-w-xl mx-auto italic text-slate-800 dark:text-slate-100 px-2 sm:px-4">
                                "{betDetails.title}"
                            </h3>
                        </div>

                        {/* Participants Display */}
                        <div className="flex flex-wrap items-center justify-center gap-6 sm:gap-12 py-4">
                            {participants?.map((participant, idx) => (
                                <Combatant
                                    key={idx}
                                    role={idx === 0 ? 'Creator' : `Peer ${idx}`}
                                    name={`${participant.slice(0, 6)}...${participant.slice(-4)}`}
                                    icon={idx === 0 ? <Fingerprint className="w-8 h-8 md:w-10 md:h-10" /> : <UserPlus2 className="w-8 h-8 md:w-10 md:h-10" />}
                                    color={idx === 0 ? "emerald" : "blue"}
                                    isWinner={isSettled && betDetails.finalOutcome === participant}
                                    isLoser={isSettled && betDetails.finalOutcome !== participant}
                                />
                            ))}
                        </div>
                    </div>

                    {/* RESOLVED STATE */}
                    {isSettled ? (
                        <div className="animate-in fade-in slide-in-from-bottom-8 duration-700 space-y-8">
                            <div className="p-4 sm:p-8 md:p-12 rounded-2xl sm:rounded-3xl bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-100 dark:border-emerald-500/30 text-center relative overflow-hidden group">
                                <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-20 dark:opacity-40">
                                    <div className="absolute top-0 left-1/4 w-[1px] h-full bg-gradient-to-b from-transparent via-emerald-500 to-transparent animate-pulse"></div>
                                    <div className="absolute -top-24 -left-24 w-64 h-64 bg-emerald-500/20 blur-[100px] rounded-full"></div>
                                </div>

                                <div className="relative z-10 space-y-10">
                                    <div className="flex flex-col items-center justify-center gap-6">
                                        <div className="relative">
                                            <div className="inline-flex items-center justify-center w-24 h-24 bg-white dark:bg-emerald-500/20 rounded-full border border-emerald-300 dark:border-emerald-400/40 shadow-sm dark:shadow-[0_0_50px_rgba(16,185,129,0.4)] relative">
                                                <Trophy className="w-12 h-12 text-emerald-600 dark:text-emerald-400 animate-bounce" />
                                                <div className="absolute -top-1 -right-1 w-6 h-6 bg-amber-500 rounded-full flex items-center justify-center border-2 border-white dark:border-[#0D0D12]">
                                                    <Sparkles className="w-3 h-3 text-white dark:text-[#0D0D12]" />
                                                </div>
                                            </div>
                                        </div>
                                        <h4 className="text-emerald-700 dark:text-emerald-500 font-mono font-bold uppercase tracking-[0.6em] text-[10px]">RESOLVED</h4>
                                    </div>

                                    <div className="space-y-4">
                                        <span className="text-[10px] sm:text-[11px] font-mono text-slate-400 dark:text-slate-500 uppercase tracking-widest">Winning_Outcome</span>
                                        <h2 className="text-2xl sm:text-3xl md:text-5xl font-black italic tracking-tighter text-slate-900 dark:text-white uppercase drop-shadow-[0_10px_10px_rgba(0,0,0,0.1)]">
                                            {decodedOutcome || 'No Winner'}
                                        </h2>
                                    </div>

                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 max-w-2xl mx-auto pt-6 sm:pt-8 border-t border-slate-200 dark:border-white/5">
                                        <div className="text-left space-y-1.5 p-4 rounded-2xl bg-white dark:bg-white/[0.02] border border-slate-100 dark:border-white/5">
                                            <div className="text-[9px] font-mono text-slate-500 uppercase tracking-widest">Total_Pool</div>
                                            <div className="text-xl font-bold font-mono text-slate-900 dark:text-white">{formattedAmount} {tokenSymbol}</div>
                                            <div className="text-[8px] font-mono text-emerald-600 dark:text-emerald-500 uppercase">Status: DISTRIBUTED</div>
                                        </div>
                                        <div className="text-left space-y-1.5 p-4 rounded-2xl bg-white dark:bg-white/[0.02] border border-slate-100 dark:border-white/5">
                                            <div className="text-[9px] font-mono text-slate-500 uppercase tracking-widest">Participants</div>
                                            <div className="text-xl font-bold font-mono text-slate-900 dark:text-white">{Number(betDetails.participantCount)} / {Number(betDetails.maxParticipants)}</div>
                                            <div className="text-[8px] font-mono text-emerald-600 dark:text-emerald-500 uppercase">Verified On-Chain</div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <>
                            {/* Progress Stepper */}
                            <div className="space-y-0 max-w-[280px] mx-auto mb-12">
                                <Step
                                    icon={<CheckCircle2 className="w-4 h-4" />}
                                    label="Bet Created"
                                    status="complete"
                                    detail="On-chain"
                                />
                                <Step
                                    icon={isVerifying || isVoting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Clock className="w-4 h-4" />}
                                    label="Voting"
                                    status={isActive ? "active" : "pending"}
                                    detail={`${Number(betDetails.participantCount)} participants`}
                                />
                                <Step
                                    icon={<CheckCircle2 className="w-4 h-4" />}
                                    label="Resolution"
                                    status="pending"
                                    detail="Awaiting votes"
                                    last
                                />
                            </div>

                            {/* Voting Options - Vote for participants */}
                            {isVotingPhase && !isVerifying && (
                                <div className="space-y-4">
                                    <h4 className="text-center text-[10px] font-mono text-slate-400 uppercase tracking-widest mb-6">
                                        Cast Your Vote
                                    </h4>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        {participants?.map((participant, idx) => (
                                            <button
                                                key={idx}
                                                onClick={() => handleVoteClick(participant)}
                                                disabled={!canVote || !isParticipant}
                                                className={`p-6 rounded-2xl bg-slate-50 dark:bg-white/5 border transition-all flex flex-col items-center gap-4 btn-tactile group relative overflow-hidden ${!canVote || !isParticipant
                                                    ? 'opacity-50 cursor-not-allowed border-slate-200 dark:border-white/5'
                                                    : 'border-slate-200 hover:border-emerald-500 dark:hover:border-emerald-500/50 hover:bg-emerald-50/50 dark:hover:bg-emerald-500/5 cursor-pointer'
                                                    }`}
                                            >
                                                <span className="text-[9px] font-mono text-slate-400 dark:text-slate-500 uppercase tracking-widest font-bold">
                                                    VOTE_FOR
                                                </span>
                                                <span className="text-sm font-bold uppercase tracking-tight text-slate-800 dark:text-white group-hover:text-slate-900 dark:group-hover:text-white text-center font-mono">
                                                    {`${participant.slice(0, 6)}...${participant.slice(-4)}`}
                                                </span>
                                                {canVote && isParticipant && (
                                                    <div className="absolute bottom-0 left-0 h-1 bg-emerald-500 w-0 group-hover:w-full transition-all duration-500"></div>
                                                )}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}
                            {/* Show "Voting starts after deadline" message during joining phase */}
                            {isJoiningPhase && (
                                <div className="text-center py-8">
                                    <Clock className="w-12 h-12 text-slate-400 mx-auto mb-4" />
                                    <p className="text-sm text-slate-500">Voting opens after the deadline</p>
                                </div>
                            )}

                            {/* User Status Info */}
                            <div className="mt-12 pt-8 border-t border-slate-100 dark:border-white/5 text-center flex flex-col items-center gap-4">
                                {!isConnected && (
                                    <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-amber-500/10 border border-amber-500/20 text-[10px] font-mono text-amber-600 dark:text-amber-400 uppercase tracking-widest">
                                        <Wallet className="w-3.5 h-3.5" />
                                        Connect wallet to vote
                                    </div>
                                )}
                                {isConnected && !isParticipant && (
                                    <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-[10px] font-mono text-slate-500 uppercase tracking-widest">
                                        <AlertTriangle className="w-3.5 h-3.5" />
                                        You are not a participant
                                    </div>
                                )}
                                {isConnected && isParticipant && userHasVoted && (
                                    <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-[10px] font-mono text-emerald-600 dark:text-emerald-400 uppercase tracking-widest">
                                        <CheckCircle2 className="w-3.5 h-3.5" />
                                        You have voted
                                    </div>
                                )}
                                <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-[9px] font-mono text-slate-500 uppercase tracking-widest">
                                    <Users className="w-3.5 h-3.5" />
                                    {Number(betDetails.participantCount)} / {Number(betDetails.maxParticipants)} Participants
                                </div>

                                {/* Resolve Button - Show when voting is closed or deadline passed */}
                                {(betDetails.status === BetStatus.VotingClosed ||
                                    (isAfterDeadline && (betDetails.status === BetStatus.Created || betDetails.status === BetStatus.Active))) && (
                                        <button
                                            onClick={handleResolve}
                                            disabled={isResolving}
                                            className="mt-4 px-8 py-4 bg-emerald-500 text-white dark:text-[#0D0D12] font-black italic rounded-2xl flex items-center justify-center gap-3 btn-tactile shadow-xl shadow-emerald-500/20 disabled:opacity-50"
                                        >
                                            {isResolving ? (
                                                <>
                                                    <Loader2 className="w-5 h-5 animate-spin" />
                                                    RESOLVING...
                                                </>
                                            ) : (
                                                <>
                                                    RESOLVE BET
                                                    <ArrowRight className="w-5 h-5" />
                                                </>
                                            )}
                                        </button>
                                    )}
                            </div>
                        </>
                    )}
                </div>
            </div>
        </div>

    );
}

// Helper Components
const Combatant = ({ role, name, icon, color, isWinner, isLoser }: {
    role: string;
    name: string;
    icon: React.ReactNode;
    color: 'emerald' | 'blue';
    isWinner?: boolean;
    isLoser?: boolean;
}) => (
    <div className={`flex flex-col items-center gap-4 group transition-all duration-700 ${isLoser ? 'opacity-30 scale-90 grayscale' : 'opacity-100'}`}>
        <div className={`w-16 h-16 md:w-20 md:h-20 rounded-2xl bg-slate-50 dark:bg-[#09090D] border flex items-center justify-center shadow-sm dark:shadow-lg transition-all duration-700 relative ${isWinner ? `border-${color}-500 shadow-[0_0_40px_rgba(16,185,129,0.3)] scale-110` : `border-slate-200 dark:border-${color}-500/20`
            }`}>
            <div className={`transition-colors ${isWinner ? `text-${color}-600 dark:text-${color}-400` : `text-${color}-400 opacity-60`}`}>{icon}</div>
            {isWinner && (
                <div className="absolute -top-3 -right-3 p-1.5 bg-amber-500 rounded-lg shadow-xl animate-bounce">
                    <Trophy className="w-4 h-4 text-white dark:text-[#0D0D12]" />
                </div>
            )}
        </div>
        <div className="text-center">
            <div className="text-[9px] font-mono text-slate-400 uppercase tracking-wider">{role}</div>
            <div className="text-[10px] font-mono text-slate-600 dark:text-slate-500 bg-slate-100 dark:bg-white/5 px-3 py-1 rounded-full border border-slate-200 dark:border-white/5 truncate max-w-[100px]">{name}</div>
        </div>
    </div>
);

const Step = ({ icon, label, detail, status, last }: { icon: React.ReactNode; label: string; detail: string; status: 'complete' | 'active' | 'pending'; last?: boolean }) => (
    <div className="flex items-start gap-5 group/step">
        <div className="flex flex-col items-center">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center z-10 transition-all duration-700 border ${status === 'complete' ? 'bg-emerald-500 border-emerald-400 text-white dark:text-[#0D0D12] shadow-[0_0_20px_rgba(16,185,129,0.4)] scale-100' :
                status === 'active' ? 'bg-white dark:bg-[#0D0D12] border-emerald-500 text-emerald-600 dark:text-emerald-400 terminal-pulse scale-105' :
                    'bg-white dark:bg-[#0D0D12] border-slate-200 dark:border-white/5 text-slate-300 dark:text-slate-700'
                }`}>
                {icon}
            </div>
            {!last && (
                <div className="relative w-[2px] h-12">
                    <div className="absolute inset-0 bg-slate-100 dark:bg-white/5"></div>
                    <div className={`absolute inset-0 transition-all duration-1000 origin-top ${status === 'complete' ? 'bg-emerald-500 scale-y-100' : 'scale-y-0'}`}></div>
                </div>
            )}
        </div>
        <div className="pt-1 space-y-0.5 text-left">
            <div className={`text-[11px] font-bold uppercase tracking-wider transition-all duration-500 ${status === 'pending' ? 'text-slate-300 dark:text-slate-600' :
                status === 'active' ? 'text-emerald-600 dark:text-emerald-400 translate-x-1' : 'text-slate-900 dark:text-slate-100'
                }`}>
                {label}
            </div>
            <div className="text-[9px] font-mono text-slate-400 dark:text-slate-500 uppercase tracking-tight">
                {detail}
            </div>
        </div>
    </div>
);
