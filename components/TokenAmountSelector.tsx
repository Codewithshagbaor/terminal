'use client';

import { useState, useEffect, useCallback } from 'react';
import { DollarSign, ChevronDown, Check, AlertCircle, Shield } from 'lucide-react';
import { formatUnits, parseUnits } from 'viem';
import { useAccount, useChainId } from 'wagmi';
import { useUserERC20Tokens } from '@/hooks/read/useUserERC20Tokens';
import { useAllowance } from '@/hooks/read/useApproveToken';
import { CONTRACT_ADDRESSES } from '@/constants/contracts';
import { TokenData } from '@/types/betting';

// Token logo component
const TokenLogo = ({ token, size = 'w-5 h-5' }: { token: any; size?: string }) => {
    const [imageError, setImageError] = useState(false);

    const getTokenLogo = (token: any) => {
        if (!token) return null;

        const logoPath = `/images/tokens/${token.symbol.toLowerCase()}.svg`;

        if (imageError) {
            return (
                <div className={`${size} bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-full flex items-center justify-center`}>
                    <span className="text-white font-bold text-xs">{token.symbol.charAt(0)}</span>
                </div>
            );
        }

        return (
            <img
                src={logoPath}
                alt={`${token.symbol} logo`}
                className={`${size} rounded-full`}
                onError={() => setImageError(true)}
            />
        );
    };

    return getTokenLogo(token);
};

interface TokenAmountSelectorProps {
    form: any;
    setForm: (form: any) => void;
    isLoading: boolean;
    onTokenDataChange?: (tokenData: TokenData) => void;
}

export default function TokenAmountSelector({
    form,
    setForm,
    isLoading,
    onTokenDataChange
}: TokenAmountSelectorProps) {
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const { address } = useAccount();
    const chainId = useChainId();
    const { tokens } = useUserERC20Tokens();

    // Find selected token details
    const selected = tokens.find(t => t.symbol === form.token);
    const tokenAddress = selected?.address;
    const decimals = selected?.decimals || 18;
    const tokenBalance = selected?.balance || '0';

    // Contract address for approval
    const spender = CONTRACT_ADDRESSES[chainId as keyof typeof CONTRACT_ADDRESSES];

    // For approval, we need the actual token amount (with decimals)
    const actualStakeAmount = form.amount ? parseUnits(form.amount, decimals) : 0n;

    // Get current allowance
    const { data: currentAllowance } = useAllowance(
        tokenAddress as `0x${string}`,
        spender as `0x${string}`
    );

    // Format values for display
    const formattedAllowance =
        typeof decimals === 'number' && typeof currentAllowance === 'bigint'
            ? parseFloat(formatUnits(currentAllowance, decimals)).toFixed(4)
            : '0';

    const formattedBalance = selected
        ? parseFloat(formatUnits(BigInt(tokenBalance), decimals)).toFixed(4)
        : '0';

    // Check if approval is needed
    const needsApproval =
        typeof currentAllowance === 'bigint' && actualStakeAmount > 0n
            ? currentAllowance < actualStakeAmount
            : true;

    // Check if user has sufficient balance
    const hasSufficientBalance = selected
        ? BigInt(tokenBalance) >= actualStakeAmount
        : false;

    const handleTokenSelect = (tokenSymbol: string) => {
        setForm({ ...form, token: tokenSymbol });
        setIsDropdownOpen(false);
    };

    // Memoize token data to prevent infinite re-renders
    const tokenData = useCallback(() => ({
        selected,
        tokenAddress,
        decimals,
        tokenBalance,
        actualStakeAmount, // This is the denormalized amount for approval (500 * 10^18)
        needsApproval,
        hasSufficientBalance,
        formattedBalance,
        formattedAllowance,
        rawAmount: form.amount, // Keep the user-friendly string "500"
        userAmount: BigInt(Math.floor(parseFloat(form.amount || '0'))), // Raw bigint: 500n
    }), [
        selected,
        tokenAddress,
        decimals,
        tokenBalance,
        actualStakeAmount,
        needsApproval,
        hasSufficientBalance,
        formattedBalance,
        formattedAllowance,
        form.amount
    ]);

    // Call onTokenDataChange when data changes
    useEffect(() => {
        if (onTokenDataChange) {
            onTokenDataChange(tokenData() as unknown as TokenData);
        }
    }, [form.token, form.amount, tokenBalance, currentAllowance]);

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h3 className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-widest">Stake_Amount</h3>

                {/* Token Dropdown */}
                <div className="relative">
                    <button
                        onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                        disabled={isLoading}
                        type="button"
                        className="flex items-center space-x-2 bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl px-3 py-2 hover:bg-slate-200 dark:hover:bg-white/10 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {selected ? (
                            <>
                                <TokenLogo token={selected} size="w-4 h-4" />
                                <span className="font-bold text-slate-900 dark:text-white text-sm">{form.token}</span>
                            </>
                        ) : (
                            <span className="font-bold text-slate-900 dark:text-white text-sm">Select token</span>
                        )}
                        <ChevronDown className="w-4 h-4 text-slate-400" />
                    </button>

                    {isDropdownOpen && !isLoading && (
                        <div className="absolute right-0 mt-2 w-72 bg-white dark:bg-[#0D0D12] border border-slate-200 dark:border-white/10 rounded-2xl shadow-lg z-10">
                            <div className="py-2">
                                {tokens.length === 0 ? (
                                    <div className="px-4 py-2 text-slate-400 text-sm font-mono">No tokens available</div>
                                ) : (
                                    tokens.map((token) => (
                                        <button
                                            key={token.address}
                                            onClick={() => handleTokenSelect(token.symbol)}
                                            type="button"
                                            className="w-full px-4 py-3 text-left hover:bg-emerald-500/10 transition-colors"
                                        >
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center space-x-2">
                                                    <TokenLogo token={token} size="w-6 h-6" />
                                                    <span className="font-bold text-slate-900 dark:text-white text-sm">{token.symbol}</span>
                                                </div>
                                                <span className="text-sm text-slate-400 font-mono">
                                                    {parseFloat(formatUnits(BigInt(token.balance), token.decimals)).toFixed(4)}
                                                </span>
                                            </div>
                                        </button>
                                    ))
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </div>

            <div className="bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-2xl p-6">
                <div className="flex items-center justify-between mb-4">
                    <input
                        type="number"
                        step="any"
                        min="0"
                        placeholder="0"
                        value={form.amount}
                        onChange={(e) => setForm({ ...form, amount: e.target.value })}
                        disabled={isLoading}
                        required
                        className="text-4xl font-bold bg-transparent border-0 outline-none text-slate-900 dark:text-white placeholder-slate-400 w-full font-mono"
                    />
                    <div className="flex items-center space-x-2 text-emerald-600 dark:text-emerald-500">
                        {selected && <TokenLogo token={selected} size="w-5 h-5" />}
                        <span className="font-bold text-base">{form.token || 'TOKEN'}</span>
                    </div>
                </div>

                {/* Detailed Token Information Panel */}
                {selected && (
                    <div className="bg-white dark:bg-white/5 p-4 rounded-xl border border-slate-200 dark:border-white/10 text-sm space-y-2">
                        <div className="flex justify-between items-center">
                            <span className="font-mono text-slate-400 text-[10px] uppercase tracking-widest">Token_Balance:</span>
                            <div className="flex items-center space-x-1">
                                <span className="text-slate-900 dark:text-white font-bold">{formattedBalance}</span>
                                <span className="text-slate-500 font-mono text-xs">{selected.symbol}</span>
                            </div>
                        </div>

                        <div className="flex justify-between items-center">
                            <span className="font-mono text-slate-400 text-[10px] uppercase tracking-widest">Current_Allowance:</span>
                            <div className="flex items-center space-x-1">
                                <span className="text-slate-900 dark:text-white font-bold">{formattedAllowance}</span>
                                <span className="text-slate-500 font-mono text-xs">{selected.symbol}</span>
                            </div>
                        </div>

                        <div className="flex justify-between items-center">
                            <span className="font-mono text-slate-400 text-[10px] uppercase tracking-widest">Stake_Amount:</span>
                            <div className="flex items-center space-x-1">
                                <span className="text-slate-900 dark:text-white font-bold">{form.amount || '0'}</span>
                                <span className="text-slate-500 font-mono text-xs">{selected.symbol}</span>
                            </div>
                        </div>

                        {/* Status Messages */}
                        <div className="pt-2 border-t border-slate-200 dark:border-white/10">
                            {!hasSufficientBalance && form.amount && (
                                <p className="text-red-400 text-xs font-mono font-bold">❌ Insufficient balance</p>
                            )}
                            {needsApproval && form.amount && hasSufficientBalance && (
                                <p className="text-amber-500 text-xs font-mono font-bold">⚠️ Token approval required</p>
                            )}
                            {hasSufficientBalance && !needsApproval && form.amount && (
                                <p className="text-emerald-500 text-xs font-mono font-bold">✅ Ready to create wager</p>
                            )}
                            {!form.amount && (
                                <p className="text-slate-400 text-xs font-mono">Enter stake amount to see status</p>
                            )}
                        </div>
                    </div>
                )}

                {/* Token Selection Prompt */}
                {!selected && (
                    <div className="bg-white dark:bg-white/5 p-4 rounded-xl border border-slate-200 dark:border-white/10 text-center">
                        <p className="text-slate-400 text-sm font-mono">Select a token to see balance and status</p>
                    </div>
                )}
            </div>

            {/* Validation Messages */}
            {!form.token && (
                <p className="text-red-400 text-sm font-mono">Please select a token</p>
            )}
        </div>
    );
}

