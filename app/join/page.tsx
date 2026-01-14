'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
    Search,
    Terminal,
    AlertCircle,
    Loader2,
    ArrowRight,
    ShieldCheck,
    Trophy,
    User,
    Coins,
    ChevronLeft,
    Zap,
    Fingerprint,
    Wallet,
    CheckCircle2
} from 'lucide-react';
import { useAccount, useChainId } from 'wagmi';
import { formatUnits } from 'viem';
import toast from 'react-hot-toast';
import { useGetBetDetails, useGetParticipants, BetStatus } from '@/hooks/read/useBetDetails';
import { useJoinBet } from '@/hooks/write/useJoinBet';
import { useApproveToken, useAllowance } from '@/hooks/read/useApproveToken';
import { CONTRACT_ADDRESSES, COMMON_TOKENS } from '@/constants/contracts';

export default function JoinPage() {
    const router = useRouter();
    const { address, isConnected } = useAccount();
    const chainId = useChainId();

    const [betIdInput, setBetIdInput] = useState('');
    const [searchedBetId, setSearchedBetId] = useState<number | undefined>(undefined);
    const [status, setStatus] = useState<'idle' | 'searching' | 'preview' | 'error' | 'joining' | 'success'>('idle');
    const [errorMessage, setErrorMessage] = useState('');
    const [executionStep, setExecutionStep] = useState<'idle' | 'approving' | 'joining' | 'done'>('idle');

    // Fetch bet details when we have a searched bet ID
    const { betDetails, isLoading: isLoadingDetails, error: detailsError, refetch: refetchDetails } = useGetBetDetails(searchedBetId);
    const { participants, isLoading: isLoadingParticipants } = useGetParticipants(searchedBetId);

    // Get token info
    const tokens = COMMON_TOKENS[chainId as keyof typeof COMMON_TOKENS] || [];
    const tokenInfo = betDetails ? tokens.find(t => t.address.toLowerCase() === betDetails.token.toLowerCase()) : undefined;
    const tokenDecimals = tokenInfo?.decimals || 18;
    const tokenSymbol = tokenInfo?.symbol || 'TOKEN';

    // Format stake amount
    const formattedAmount = betDetails ? Number(formatUnits(betDetails.stakeAmount, tokenDecimals)).toFixed(2) : '0.00';

    // Contract address for approval
    const contractAddress = CONTRACT_ADDRESSES[chainId as keyof typeof CONTRACT_ADDRESSES] as `0x${string}`;

    // Allowance check
    const { data: currentAllowance, refetch: refetchAllowance } = useAllowance(
        betDetails?.token as `0x${string}`,
        contractAddress
    );

    // Approval hook
    const { approveToken, isPending: isApproving, isSuccess: approveSuccess, error: approveError } = useApproveToken(
        betDetails?.token as `0x${string}`,
        betDetails?.stakeAmount
    );

    // Join bet hook
    const { joinBet, isPending: isJoining, isConfirming, isSuccess: joinSuccess, error: joinError, hash: joinHash } = useJoinBet();

    // Check if user is already a participant
    const isAlreadyParticipant = participants?.some(p => p.toLowerCase() === address?.toLowerCase());

    // Check if approval is needed
    const needsApproval = betDetails && currentAllowance !== undefined && currentAllowance < betDetails.stakeAmount;

    // Handle search
    const handleSearch = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!betIdInput.trim()) return;

        const id = parseInt(betIdInput.trim());
        if (isNaN(id) || id < 0) {
            setStatus('error');
            setErrorMessage('INVALID_BET_ID: Please enter a valid numeric bet ID.');
            return;
        }

        setStatus('searching');
        setErrorMessage('');
        setSearchedBetId(id);
    };

    // Handle bet details loaded
    useEffect(() => {
        if (searchedBetId !== undefined && !isLoadingDetails && !isLoadingParticipants) {
            if (detailsError || !betDetails) {
                setStatus('error');
                setErrorMessage('BET_NOT_FOUND: No active bet found with this ID on the blockchain.');
            } else if (betDetails.status !== BetStatus.Created && betDetails.status !== BetStatus.Active) {
                setStatus('error');
                setErrorMessage('BET_CLOSED: This bet is no longer accepting participants.');
            } else if (Number(betDetails.participantCount) >= Number(betDetails.maxParticipants)) {
                setStatus('error');
                setErrorMessage('BET_FULL: This bet has reached maximum participants.');
            } else {
                setStatus('preview');
            }
        }
    }, [searchedBetId, isLoadingDetails, isLoadingParticipants, detailsError, betDetails]);

    // Ref to prevent double join call
    const hasTriggeredJoin = React.useRef(false);

    // Handle approval success
    useEffect(() => {
        if (approveSuccess && executionStep === 'approving' && !hasTriggeredJoin.current) {
            hasTriggeredJoin.current = true;
            toast.dismiss();
            toast.success('Token approved!');

            // Wait and refetch allowance, then join
            setTimeout(() => {
                refetchAllowance().then(() => {
                    setExecutionStep('joining');
                    toast.loading('Joining bet...');
                    if (searchedBetId !== undefined) {
                        joinBet(searchedBetId);
                    }
                });
            }, 1000);
        }
    }, [approveSuccess, executionStep, refetchAllowance, searchedBetId, joinBet]);

    // Handle approval error
    useEffect(() => {
        if (approveError && executionStep === 'approving') {
            toast.dismiss();
            toast.error(`Approval failed: ${approveError.message}`);
            setExecutionStep('idle');
            setStatus('preview');
        }
    }, [approveError, executionStep]);

    // Handle join success
    useEffect(() => {
        if (joinSuccess) {
            toast.dismiss();
            toast.success('Successfully joined the bet!');
            setExecutionStep('done');
            setStatus('success');

            // Redirect to terminal after a delay
            setTimeout(() => {
                router.push(`/terminal/${searchedBetId}`);
            }, 2000);
        }
    }, [joinSuccess, searchedBetId, router]);

    // Handle join error
    useEffect(() => {
        if (joinError && executionStep === 'joining') {
            toast.dismiss();
            toast.error(`Join failed: ${joinError.message}`);
            setExecutionStep('idle');
            setStatus('preview');
        }
    }, [joinError, executionStep]);

    // Handle confirm join
    const handleConfirmJoin = async () => {
        if (!isConnected) {
            toast.error('Please connect your wallet');
            return;
        }

        if (!betDetails || searchedBetId === undefined) return;

        if (isAlreadyParticipant) {
            toast.success('You are already a participant!');
            router.push(`/terminal/${searchedBetId}`);
            return;
        }

        setStatus('joining');

        // Check if approval is needed
        const hasEnoughAllowance = currentAllowance && currentAllowance >= betDetails.stakeAmount;

        if (hasEnoughAllowance) {
            // Skip approval, go straight to join
            setExecutionStep('joining');
            toast.loading('Joining bet...');
            joinBet(searchedBetId);
        } else {
            // Need approval first
            setExecutionStep('approving');
            toast.loading('Approving tokens...');
            approveToken();
        }
    };

    const reset = () => {
        setStatus('idle');
        setSearchedBetId(undefined);
        setErrorMessage('');
        setBetIdInput('');
        setExecutionStep('idle');
        hasTriggeredJoin.current = false;
    };

    const getStatusString = (status: BetStatus) => {
        switch (status) {
            case BetStatus.Created: return 'OPEN';
            case BetStatus.Active: return 'ACTIVE';
            case BetStatus.VotingClosed: return 'VOTING_CLOSED';
            case BetStatus.Resolved: return 'RESOLVED';
            case BetStatus.Cancelled: return 'CANCELLED';
            default: return 'UNKNOWN';
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-[#050508] py-4 sm:py-8 px-0 sm:px-4 md:px-8 flex items-center justify-center">
            <div className="w-full sm:max-w-2xl mx-auto space-y-4 sm:space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="obsidian-card rounded-none sm:rounded-[2.5rem] overflow-hidden shadow-2xl border-white/10 bg-white dark:bg-transparent">
                    {/* Header */}
                    <div className="p-6 border-b border-slate-100 dark:border-white/5 bg-slate-50 dark:bg-white/5 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-emerald-500/10 rounded-lg border border-emerald-500/20">
                                <Terminal className="w-5 h-5 text-emerald-500" />
                            </div>
                            <div>
                                <h2 className="text-xl font-bold italic tracking-tighter uppercase text-slate-900 dark:text-white">Join_Wager</h2>
                                <p className="text-[10px] font-mono text-slate-500 uppercase tracking-widest mt-1">On-Chain Participation</p>
                            </div>
                        </div>
                        <div className="px-3 py-1 bg-emerald-500/10 border border-emerald-500/20 rounded-md">
                            <span className="text-[9px] font-mono text-emerald-500 font-bold uppercase tracking-widest">LIVE</span>
                        </div>
                    </div>

                    <div className="p-4 sm:p-8 md:p-12">
                        {/* SUCCESS STATE */}
                        {status === 'success' ? (
                            <div className="text-center space-y-6 animate-in zoom-in-95 duration-500">
                                <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-emerald-500/10 border border-emerald-500/20">
                                    <CheckCircle2 className="w-12 h-12 text-emerald-500" />
                                </div>
                                <div className="space-y-2">
                                    <h3 className="text-2xl font-black italic uppercase tracking-tighter text-slate-900 dark:text-white">Successfully_Joined</h3>
                                    <p className="text-sm text-slate-500">Redirecting to terminal...</p>
                                </div>
                                <Loader2 className="w-6 h-6 text-emerald-500 animate-spin mx-auto" />
                            </div>
                        ) : (status === 'preview' || status === 'joining') && betDetails ? (
                            /* PREVIEW STATE */
                            <div className="space-y-8 animate-in zoom-in-95 duration-500">
                                <div className="text-center space-y-2">
                                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-[9px] font-mono text-emerald-500 font-bold uppercase tracking-widest mb-4">
                                        <ShieldCheck className="w-3 h-3" /> Bet_Found
                                    </div>
                                    <h3 className="text-2xl font-black italic uppercase tracking-tighter text-slate-900 dark:text-white">On-Chain_Escrow</h3>
                                </div>

                                <div className="p-4 sm:p-8 rounded-2xl sm:rounded-3xl bg-slate-50 dark:bg-white/[0.03] border border-slate-200 dark:border-white/10 space-y-6 sm:space-y-8 shadow-inner">
                                    <div className="flex justify-between items-start border-b border-slate-200 dark:border-white/5 pb-6">
                                        <div className="space-y-1">
                                            <span className="text-[9px] font-mono text-slate-400 uppercase tracking-widest">Bet_ID</span>
                                            <div className="text-xl font-bold font-mono text-slate-900 dark:text-white">#{searchedBetId}</div>
                                        </div>
                                        <div className="text-right space-y-1">
                                            <span className="text-[9px] font-mono text-slate-400 uppercase tracking-widest">Stake_Required</span>
                                            <div className="text-xl sm:text-2xl font-black font-mono text-emerald-600 dark:text-emerald-500 italic">{formattedAmount} {tokenSymbol}</div>
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <span className="text-[9px] font-mono text-slate-400 uppercase tracking-widest">Category</span>
                                        <p className="text-lg font-bold italic text-slate-800 dark:text-slate-200 leading-tight">
                                            "{betDetails.category}"
                                        </p>
                                    </div>

                                    <div className="flex flex-wrap items-center gap-6 pt-4 border-t border-slate-200 dark:border-white/5">
                                        <div className="flex items-center gap-2">
                                            <div className="w-8 h-8 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
                                                <User className="w-4 h-4 text-emerald-500" />
                                            </div>
                                            <div>
                                                <span className="text-[8px] font-mono text-slate-400 uppercase block">Participants</span>
                                                <span className="text-[10px] font-bold text-slate-700 dark:text-slate-300 uppercase">
                                                    {Number(betDetails.participantCount)} / {Number(betDetails.maxParticipants)}
                                                </span>
                                            </div>
                                        </div>
                                        <div className="w-px h-8 bg-slate-200 dark:bg-white/10"></div>
                                        <div className="flex items-center gap-2">
                                            <div className={`w-2 h-2 rounded-full ${betDetails.status === BetStatus.Active ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'}`} />
                                            <div>
                                                <span className="text-[8px] font-mono text-slate-400 uppercase block">Status</span>
                                                <span className="text-[10px] font-bold text-slate-700 dark:text-slate-300 uppercase">
                                                    {getStatusString(betDetails.status)}
                                                </span>
                                            </div>
                                        </div>
                                        <div className="w-px h-8 bg-slate-200 dark:bg-white/10"></div>
                                        <div className="flex items-center gap-2">
                                            <Coins className="w-4 h-4 text-amber-500" />
                                            <div>
                                                <span className="text-[8px] font-mono text-slate-400 uppercase block">Token</span>
                                                <span className="text-[10px] font-bold text-slate-700 dark:text-slate-300 uppercase">{tokenSymbol}</span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Already participant notice */}
                                    {isAlreadyParticipant && (
                                        <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center gap-3">
                                            <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                                            <p className="text-sm font-bold text-emerald-600 dark:text-emerald-400">You are already a participant!</p>
                                        </div>
                                    )}

                                    {/* Wallet not connected notice */}
                                    {!isConnected && (
                                        <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center gap-3">
                                            <Wallet className="w-5 h-5 text-amber-500" />
                                            <p className="text-sm font-bold text-amber-600 dark:text-amber-400">Connect your wallet to join</p>
                                        </div>
                                    )}
                                </div>

                                <div className="flex gap-4">
                                    <button
                                        onClick={reset}
                                        className="flex-1 py-5 bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-500 font-bold text-[10px] uppercase tracking-widest rounded-2xl hover:text-slate-900 dark:hover:text-white transition-all flex items-center justify-center gap-2"
                                    >
                                        <ChevronLeft className="w-4 h-4" /> Go Back
                                    </button>
                                    <button
                                        onClick={isAlreadyParticipant ? () => router.push(`/terminal/${searchedBetId}`) : handleConfirmJoin}
                                        disabled={!isConnected || executionStep !== 'idle'}
                                        className="flex-[2] py-5 bg-emerald-500 text-white dark:text-[#0D0D12] font-black italic rounded-2xl flex items-center justify-center gap-3 btn-tactile shadow-xl shadow-emerald-500/20 uppercase tracking-tight group disabled:opacity-50"
                                    >
                                        {status === 'joining' ? (
                                            <>
                                                <Loader2 className="w-5 h-5 animate-spin" />
                                                {executionStep === 'approving' ? 'APPROVING...' : isConfirming ? 'CONFIRMING...' : 'JOINING...'}
                                            </>
                                        ) : isAlreadyParticipant ? (
                                            <>
                                                Go to Terminal
                                                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                                            </>
                                        ) : (
                                            <>
                                                Join & Stake {formattedAmount} {tokenSymbol}
                                                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                                            </>
                                        )}
                                    </button>
                                </div>
                            </div>
                        ) : (
                            /* SEARCH STATE */
                            <div className="space-y-10">
                                <div className="text-center space-y-2">
                                    <p className="text-sm text-slate-500 dark:text-slate-400">Enter a bet ID to join an existing on-chain wager.</p>
                                </div>

                                <form onSubmit={handleSearch} className="space-y-6">
                                    <div className="relative group">
                                        <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none">
                                            <Fingerprint className={`w-6 h-6 transition-colors ${status === 'error' ? 'text-rose-500' : 'text-slate-400 dark:text-slate-600 group-focus-within:text-emerald-500'}`} />
                                        </div>
                                        <input
                                            type="text"
                                            value={betIdInput}
                                            onChange={(e) => {
                                                setBetIdInput(e.target.value);
                                                if (status === 'error') setStatus('idle');
                                            }}
                                            placeholder="Enter Bet ID (e.g., 1, 42)"
                                            disabled={status === 'searching'}
                                            className={`w-full bg-slate-50 dark:bg-[#09090D] border rounded-xl sm:rounded-[2rem] py-5 sm:py-8 pl-14 sm:pl-16 pr-4 sm:pr-6 text-xl sm:text-3xl font-mono tracking-[0.1em] focus:outline-none transition-all placeholder:text-slate-300 dark:placeholder:text-slate-700 ${status === 'error' ? 'border-rose-500/50 text-rose-400' : 'border-slate-200 dark:border-white/10 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/50 text-slate-900 dark:text-white'
                                                }`}
                                        />

                                        {status === 'searching' && (
                                            <div className="absolute inset-0 bg-emerald-500/5 rounded-[2rem] flex items-center justify-center backdrop-blur-[2px] z-20">
                                                <div className="flex flex-col items-center gap-3">
                                                    <Loader2 className="w-8 h-8 text-emerald-500 animate-spin" />
                                                    <span className="text-[10px] font-mono text-emerald-500 font-bold uppercase tracking-[0.4em]">Querying_Blockchain...</span>
                                                </div>
                                            </div>
                                        )}
                                    </div>

                                    {status === 'error' && (
                                        <div className="p-5 bg-rose-500/5 border border-rose-500/20 rounded-2xl flex gap-4 items-center animate-in fade-in slide-in-from-top-2">
                                            <div className="w-10 h-10 rounded-full bg-rose-500/10 flex items-center justify-center shrink-0">
                                                <AlertCircle className="w-5 h-5 text-rose-500" />
                                            </div>
                                            <p className="text-[10px] font-mono text-rose-500 font-bold uppercase tracking-tight leading-relaxed">{errorMessage}</p>
                                        </div>
                                    )}

                                    <button
                                        type="submit"
                                        disabled={status === 'searching' || !betIdInput.trim()}
                                        className="w-full py-4 sm:py-6 bg-slate-900 dark:bg-white text-white dark:text-[#0D0D12] font-black italic rounded-xl sm:rounded-[2rem] flex items-center justify-center gap-3 sm:gap-4 transition-all btn-tactile shadow-xl dark:shadow-white/5 text-lg sm:text-xl group disabled:opacity-50"
                                    >
                                        {status === 'searching' ? 'SEARCHING...' : (
                                            <>
                                                FIND BET
                                                <Search className="w-6 h-6 group-hover:scale-110 transition-transform" />
                                            </>
                                        )}
                                    </button>
                                </form>

                                {/* Connection status */}
                                {!isConnected && (
                                    <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center gap-3">
                                        <Wallet className="w-4 h-4 text-amber-500" />
                                        <p className="text-[10px] font-mono text-amber-600 dark:text-amber-400 font-bold uppercase tracking-widest">Connect wallet to join bets</p>
                                    </div>
                                )}

                                {/* Quick access */}
                                <div className="p-6 rounded-2xl bg-emerald-500/5 border border-emerald-500/10 flex flex-col items-center gap-3">
                                    <div className="flex items-center gap-2 text-[10px] font-mono font-bold text-emerald-600 dark:text-emerald-500 uppercase tracking-widest">
                                        <Zap className="w-3 h-3" /> Quick_Access
                                    </div>
                                    <div className="flex gap-3">
                                        {[1, 2, 3].map((id) => (
                                            <button
                                                key={id}
                                                onClick={() => {
                                                    setBetIdInput(id.toString());
                                                    setSearchedBetId(id);
                                                    setStatus('searching');
                                                }}
                                                className="px-4 py-2 rounded-lg bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 hover:border-emerald-500/50 transition-all"
                                            >
                                                <span className="text-sm font-bold font-mono text-slate-900 dark:text-white">#{id}</span>
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                <div className="text-center opacity-40">
                    <p className="text-[9px] font-mono text-slate-500 uppercase tracking-[0.5em]">All transactions verified on-chain</p>
                </div>
            </div>
        </div>
    );
}
