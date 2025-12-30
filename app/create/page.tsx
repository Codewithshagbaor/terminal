'use client';

import React, { useState } from 'react';
import {
    DollarSign,
    UserPlus,
    Send,
    Flame,
    ChevronRight,
    Trophy,
    Target,
    Sparkles,
    Settings2,
    Users,
    Clock,
    Trash2,
    Plus,
    Globe,
    UserCheck,
    ShieldCheck,
    Zap,
    Fingerprint
} from 'lucide-react';

// Types
enum WagerStatus {
    PENDING = 'PENDING',
    ESCROW = 'ESCROW',
    SETTLED = 'SETTLED',
    DISPUTED = 'DISPUTED'
}

interface WagerParticipant {
    name: string;
    address: string;
    hasJoined?: boolean;
}

interface Wager {
    id?: string;
    creator: string;
    opponent: string;
    participants: WagerParticipant[];
    amount: number;
    description: string;
    status?: WagerStatus;
    winner?: string;
    timestamp?: number;
    isOpenJoin?: boolean;
}
import TokenAmountSelector from '@/components/TokenAmountSelector';
import SportsFields from '@/components/SportsFields';
import ProgressModal from '@/components/ProgressModal';
import { useAccount, useChainId } from 'wagmi';
import { useCreateBet } from '@/hooks/write/useCreateBet';
import { useJoinBet } from '@/hooks/write/useJoinBet';
import { useApproveToken } from '@/hooks/read/useApproveToken';
import { uploadMetadataToPinata } from '@/hooks/write/uploadToIPFS';
import { useExtractBetId } from '@/hooks/utils/extractBetId';
import toast from 'react-hot-toast';

type TemplateType = 'SPORTS' | 'CHALLENGE' | 'PREDICTION' | 'CUSTOM';


export default function WagerBuilder() {
    const [step, setStep] = useState(1);
    const [template, setTemplate] = useState<TemplateType | null>(null);
    const [isExecuting, setIsExecuting] = useState(false);
    const [executionStage, setExecutionStage] = useState(0);
    const [hasError, setHasError] = useState(false);
    const [metadataCid, setMetadataCid] = useState<string>('');
    const [txHash, setTxHash] = useState<`0x${string}` | undefined>();
    const [createdWagerId, setCreatedWagerId] = useState<number | null>(null);
    const [tokenData, setTokenData] = useState<any>(null);

    const [formData, setFormData] = useState({
        description: '',
        participants: [] as WagerParticipant[],
        isOpenJoin: true,
        amount: 0,
        token: '',
        endDate: '',
        maxParticipants: 5,
        categoryData: {} as any
    });

    // Wagmi hooks
    const { address } = useAccount();
    const chainId = useChainId();
    const { createBet, data: createData, isPending: isCreating, isSuccess: createSuccess, error: createError } = useCreateBet();
    const { joinBet, isPending: isJoining, isSuccess: joinSuccess, error: joinError } = useJoinBet();
    const { approveToken, isPending: isApproving, isSuccess: approveSuccess, error: approveError } = useApproveToken(
        tokenData?.tokenAddress as `0x${string}`,
        tokenData?.actualStakeAmount || 0n
    );
    const { betId, isLoading: extracting } = useExtractBetId(txHash);

    const [newParticipant, setNewParticipant] = useState({ name: '', address: '' });

    const nextStep = () => setStep(prev => prev + 1);
    const prevStep = () => setStep(prev => prev - 1);

    const addParticipant = () => {
        if (newParticipant.name && newParticipant.address) {
            setFormData({
                ...formData,
                participants: [...formData.participants, { ...newParticipant, hasJoined: false }]
            });
            setNewParticipant({ name: '', address: '' });
        }
    };

    const removeParticipant = (index: number) => {
        const updated = [...formData.participants];
        updated.splice(index, 1);
        setFormData({ ...formData, participants: updated });
    };

    const handleCreateBet = async () => {
        try {
            // Validation
            if (!address) {
                toast.error('Please connect your wallet');
                return;
            }

            if (!tokenData || !tokenData.hasSufficientBalance) {
                toast.error('Insufficient token balance');
                return;
            }

            setIsExecuting(true);
            setHasError(false);
            setExecutionStage(1);

            // Stage 1: Upload metadata to IPFS
            toast.loading('Uploading metadata to IPFS...');
            const metadata = {
                template,
                description: formData.description,
                categoryData: formData.categoryData,
                participants: formData.participants,
                isOpenJoin: formData.isOpenJoin,
                maxParticipants: formData.maxParticipants,
                endDate: formData.endDate,
                createdAt: Date.now(),
            };

            const cid = await uploadMetadataToPinata(metadata);
            setMetadataCid(cid);
            toast.dismiss();
            toast.success('Metadata uploaded!');

            // Stage 2: Create wager on blockchain
            setExecutionStage(2);
            toast.loading('Creating wager on blockchain...');

            const opponent = formData.participants.length > 0
                ? formData.participants[0].address as `0x${string}`
                : '0x0000000000000000000000000000000000000000' as `0x${string}`;

            createBet([
                opponent,
                tokenData.tokenAddress,
                tokenData.actualStakeAmount,
                cid
            ]);

        } catch (error: any) {
            console.error('Error creating wager:', error);
            toast.dismiss();
            toast.error(error.message || 'Failed to create wager');
            setHasError(true);
            setIsExecuting(false);
        }
    };

    // Monitor wager creation success
    React.useEffect(() => {
        if (createSuccess && createData) {
            toast.dismiss();
            toast.success('Wager created!');
            setTxHash(createData);
        }
        if (createError) {
            toast.dismiss();
            toast.error('Failed to create wager');
            setHasError(true);
            setIsExecuting(false);
        }
    }, [createSuccess, createData, createError]);

    // Extract wager ID from transaction
    React.useEffect(() => {
        if (betId !== null && betId !== undefined) {
            setCreatedWagerId(betId);

            // Stage 3: Check if approval needed
            if (tokenData?.needsApproval) {
                setExecutionStage(3);
                toast.loading('Approving tokens...');
                approveToken();
            } else {
                // Skip to auto-join
                setExecutionStage(4);
                toast.loading('Joining wager...');
                joinBet(betId);
            }
        }
    }, [betId]);

    // Monitor approval success
    React.useEffect(() => {
        if (approveSuccess && createdWagerId !== null) {
            toast.dismiss();
            toast.success('Tokens approved!');

            // Stage 4: Auto-join the wager
            setExecutionStage(4);
            toast.loading('Joining wager...');
            joinBet(createdWagerId);
        }
        if (approveError) {
            toast.dismiss();
            toast.error('Failed to approve tokens');
            setHasError(true);
            setIsExecuting(false);
        }
    }, [approveSuccess, approveError, createdWagerId]);

    // Monitor join success
    React.useEffect(() => {
        if (joinSuccess) {
            toast.dismiss();
            toast.success('Successfully joined wager!');

            // Stage 5: Complete
            setExecutionStage(5);
            setTimeout(() => {
                setIsExecuting(false);
                // Reset form or redirect
            }, 2000);
        }
        if (joinError) {
            toast.dismiss();
            toast.error('Failed to join wager');
            setHasError(true);
            setIsExecuting(false);
        }
    }, [joinSuccess, joinError]);

    const renderStep = () => {
        switch (step) {
            case 1:
                return (
                    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-8 duration-700">
                        <div className="text-center space-y-3">
                            <h3 className="text-[10px] font-mono font-bold text-emerald-500 uppercase tracking-[0.5em]">PHASE_01</h3>
                            <h2 className="text-4xl md:text-5xl font-black italic tracking-tighter uppercase text-slate-900 dark:text-white leading-none">Choose_Logic</h2>
                            <p className="text-sm text-slate-500 font-mono">Select the consensus framework for your wager.</p>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <TemplateCard type="SPORTS" icon={<Trophy />} title="Sports Clash" desc="Leagues & Teams" active={template === 'SPORTS'} onClick={() => { setTemplate('SPORTS'); nextStep(); }} />
                            <TemplateCard type="CHALLENGE" icon={<Target />} title="Skill Check" desc="Proof-of-Work" active={template === 'CHALLENGE'} onClick={() => { setTemplate('CHALLENGE'); nextStep(); }} />
                            <TemplateCard type="PREDICTION" icon={<Sparkles />} title="Predictions" desc="Global Events" active={template === 'PREDICTION'} onClick={() => { setTemplate('PREDICTION'); nextStep(); }} />
                            <TemplateCard type="CUSTOM" icon={<Settings2 />} title="Custom Circle" desc="P2P Agreements" active={template === 'CUSTOM'} onClick={() => { setTemplate('CUSTOM'); nextStep(); }} />
                        </div>
                    </div>
                );

            case 2:
                return (
                    <div className="space-y-8 animate-in fade-in slide-in-from-right-8 duration-500">
                        <div className="text-center space-y-3">
                            <h3 className="text-[10px] font-mono font-bold text-emerald-500 uppercase tracking-[0.5em]">PHASE_02</h3>
                            <h2 className="text-4xl md:text-5xl font-black italic tracking-tighter uppercase text-slate-900 dark:text-white">The_Agreement</h2>
                        </div>

                        {/* SPORTS Category */}
                        {template === 'SPORTS' && SportsFields && (
                            <SportsFields onDataChange={(data: any) => setFormData({ ...formData, categoryData: data })} />
                        )}

                        {/* CHALLENGE Category */}
                        {template === 'CHALLENGE' && (
                            <div className="space-y-6">
                                {/* Challenge Category Selection */}
                                <div className="space-y-2">
                                    <label className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-widest">Challenge_Category</label>
                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                        {['Fitness', 'Health', 'Habit', 'Skill'].map((cat) => (
                                            <button
                                                key={cat}
                                                type="button"
                                                onClick={() => setFormData({ ...formData, categoryData: { ...formData.categoryData, challengeCategory: cat } })}
                                                className={`p-4 rounded-2xl border-2 transition-all ${formData.categoryData?.challengeCategory === cat
                                                    ? 'border-emerald-500 bg-emerald-500/10 shadow-lg'
                                                    : 'border-slate-200 dark:border-white/10 bg-slate-100 dark:bg-white/5'
                                                    }`}
                                            >
                                                <h4 className="font-bold text-slate-900 dark:text-white text-sm">{cat}</h4>
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Challenge Type */}
                                <div className="space-y-2">
                                    <label className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-widest">Challenge_Type</label>
                                    <input
                                        type="text"
                                        placeholder="e.g., Running, Weight Loss, Reading..."
                                        value={formData.categoryData?.challengeType || ''}
                                        onChange={(e) => setFormData({ ...formData, categoryData: { ...formData.categoryData, challengeType: e.target.value } })}
                                        className="w-full bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-2xl px-4 py-4 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/50 text-slate-900 dark:text-white"
                                    />
                                </div>

                                {/* Target Value and Unit */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-widest">Target_Value</label>
                                        <input
                                            type="number"
                                            placeholder="e.g., 10, 45, 100"
                                            value={formData.categoryData?.targetValue || ''}
                                            onChange={(e) => setFormData({ ...formData, categoryData: { ...formData.categoryData, targetValue: e.target.value } })}
                                            className="w-full bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-2xl px-4 py-4 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/50 text-slate-900 dark:text-white"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-widest">Unit</label>
                                        <select
                                            value={formData.categoryData?.targetUnit || ''}
                                            onChange={(e) => setFormData({ ...formData, categoryData: { ...formData.categoryData, targetUnit: e.target.value } })}
                                            className="w-full bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-2xl px-4 py-4 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/50 appearance-none text-slate-900 dark:text-white cursor-pointer"
                                        >
                                            <option value="">Select unit</option>
                                            <option value="km">Kilometers</option>
                                            <option value="miles">Miles</option>
                                            <option value="minutes">Minutes</option>
                                            <option value="hours">Hours</option>
                                            <option value="days">Days</option>
                                            <option value="kg">Kilograms</option>
                                            <option value="lbs">Pounds</option>
                                            <option value="reps">Repetitions</option>
                                            <option value="pages">Pages</option>
                                            <option value="sessions">Sessions</option>
                                        </select>
                                    </div>
                                </div>

                                {/* Deadline and Verification */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-widest">Challenge_Deadline</label>
                                        <input
                                            type="datetime-local"
                                            value={formData.categoryData?.deadline || ''}
                                            onChange={(e) => setFormData({ ...formData, categoryData: { ...formData.categoryData, deadline: e.target.value } })}
                                            className="w-full bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-2xl px-4 py-4 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/50 text-slate-900 dark:text-white"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-widest">Verification_Method</label>
                                        <select
                                            value={formData.categoryData?.verificationMethod || ''}
                                            onChange={(e) => setFormData({ ...formData, categoryData: { ...formData.categoryData, verificationMethod: e.target.value } })}
                                            className="w-full bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-2xl px-4 py-4 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/50 appearance-none text-slate-900 dark:text-white cursor-pointer"
                                        >
                                            <option value="">How will this be verified?</option>
                                            <option value="photo">Photo Evidence</option>
                                            <option value="video">Video Evidence</option>
                                            <option value="app">Fitness App Data</option>
                                            <option value="witness">Witness Confirmation</option>
                                            <option value="screenshot">Screenshot</option>
                                            <option value="certificate">Certificate/Badge</option>
                                        </select>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* PREDICTION Category */}
                        {template === 'PREDICTION' && (
                            <div className="space-y-6">
                                {/* Prediction Category Selection */}
                                <div className="space-y-2">
                                    <label className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-widest">Prediction_Category</label>
                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                        {['Cryptocurrency', 'Stock Market', 'Weather', 'Future Events'].map((cat) => (
                                            <button
                                                key={cat}
                                                type="button"
                                                onClick={() => setFormData({ ...formData, categoryData: { ...formData.categoryData, predictionCategory: cat } })}
                                                className={`p-4 rounded-2xl border-2 transition-all ${formData.categoryData?.predictionCategory === cat
                                                    ? 'border-emerald-500 bg-emerald-500/10 shadow-lg'
                                                    : 'border-slate-200 dark:border-white/10 bg-slate-100 dark:bg-white/5'
                                                    }`}
                                            >
                                                <h4 className="font-bold text-slate-900 dark:text-white text-sm">{cat}</h4>
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Asset Selection */}
                                <div className="space-y-2">
                                    <label className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-widest">Asset/Subject</label>
                                    <input
                                        type="text"
                                        placeholder="e.g., Bitcoin (BTC), Apple (AAPL), Temperature..."
                                        value={formData.categoryData?.predictionAsset || ''}
                                        onChange={(e) => setFormData({ ...formData, categoryData: { ...formData.categoryData, predictionAsset: e.target.value } })}
                                        className="w-full bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-2xl px-4 py-4 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/50 text-slate-900 dark:text-white"
                                    />
                                </div>

                                {/* Target Price and Direction */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-widest">Target_Value/Outcome</label>
                                        <input
                                            type="text"
                                            placeholder="e.g., $50,000 or specific outcome"
                                            value={formData.categoryData?.targetPrice || ''}
                                            onChange={(e) => setFormData({ ...formData, categoryData: { ...formData.categoryData, targetPrice: e.target.value } })}
                                            className="w-full bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-2xl px-4 py-4 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/50 text-slate-900 dark:text-white"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-widest">Prediction_Direction</label>
                                        <select
                                            value={formData.categoryData?.direction || ''}
                                            onChange={(e) => setFormData({ ...formData, categoryData: { ...formData.categoryData, direction: e.target.value } })}
                                            className="w-full bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-2xl px-4 py-4 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/50 appearance-none text-slate-900 dark:text-white cursor-pointer"
                                        >
                                            <option value="">Will it go up or down?</option>
                                            <option value="above">Above Target</option>
                                            <option value="below">Below Target</option>
                                            <option value="exactly">Exactly Target</option>
                                            <option value="between">Between Range</option>
                                        </select>
                                    </div>
                                </div>

                                {/* Data Source */}
                                <div className="space-y-2">
                                    <label className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-widest">Data_Source_For_Verification</label>
                                    <select
                                        value={formData.categoryData?.source || ''}
                                        onChange={(e) => setFormData({ ...formData, categoryData: { ...formData.categoryData, source: e.target.value } })}
                                        className="w-full bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-2xl px-4 py-4 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/50 appearance-none text-slate-900 dark:text-white cursor-pointer"
                                    >
                                        <option value="">Where will the outcome be verified?</option>
                                        <option value="coinmarketcap">CoinMarketCap</option>
                                        <option value="coingecko">CoinGecko</option>
                                        <option value="yahoo">Yahoo Finance</option>
                                        <option value="bloomberg">Bloomberg</option>
                                        <option value="weather">Weather.com</option>
                                        <option value="noaa">NOAA Weather</option>
                                        <option value="reuters">Reuters</option>
                                        <option value="ap">Associated Press</option>
                                        <option value="official">Official Announcement</option>
                                    </select>
                                </div>
                            </div>
                        )}

                        {/* CUSTOM Category */}
                        {template === 'CUSTOM' && (
                            <div className="space-y-6">
                                {/* Custom Template Selection */}
                                <div className="space-y-2">
                                    <label className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-widest">Choose_Template (Optional)</label>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {[
                                            { id: 'social', name: 'Social Challenge', desc: 'Social media milestones' },
                                            { id: 'business', name: 'Business Outcome', desc: 'Company performance' },
                                            { id: 'personal', name: 'Personal Achievement', desc: 'Individual goals' },
                                            { id: 'entertainment', name: 'Entertainment', desc: 'Movie/TV ratings' }
                                        ].map((tmpl) => (
                                            <button
                                                key={tmpl.id}
                                                type="button"
                                                onClick={() => setFormData({ ...formData, categoryData: { ...formData.categoryData, customTemplate: tmpl.id } })}
                                                className={`p-4 rounded-2xl border-2 transition-all text-left ${formData.categoryData?.customTemplate === tmpl.id
                                                    ? 'border-emerald-500 bg-emerald-500/10 shadow-lg'
                                                    : 'border-slate-200 dark:border-white/10 bg-slate-100 dark:bg-white/5'
                                                    }`}
                                            >
                                                <h4 className="font-bold text-slate-900 dark:text-white text-sm mb-1">{tmpl.name}</h4>
                                                <p className="text-xs text-slate-500">{tmpl.desc}</p>
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Custom Title */}
                                <div className="space-y-2">
                                    <label className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-widest">Custom_Wager_Title</label>
                                    <input
                                        type="text"
                                        placeholder="Give your wager a catchy title"
                                        value={formData.categoryData?.customTitle || ''}
                                        onChange={(e) => setFormData({ ...formData, categoryData: { ...formData.categoryData, customTitle: e.target.value } })}
                                        className="w-full bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-2xl px-4 py-4 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/50 text-slate-900 dark:text-white"
                                    />
                                </div>

                                {/* Custom Description */}
                                <div className="space-y-2">
                                    <label className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-widest">Detailed_Description</label>
                                    <textarea
                                        placeholder="Describe what you're wagering on in detail..."
                                        rows={3}
                                        value={formData.categoryData?.customDescription || ''}
                                        onChange={(e) => setFormData({ ...formData, categoryData: { ...formData.categoryData, customDescription: e.target.value } })}
                                        className="w-full bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-2xl px-4 py-4 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/50 text-slate-900 dark:text-white resize-none"
                                    />
                                </div>

                                {/* Custom Rules */}
                                <div className="space-y-2">
                                    <label className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-widest">Rules_&_Winning_Conditions</label>
                                    <textarea
                                        placeholder="Define the rules, winning conditions, and how disputes will be resolved..."
                                        rows={3}
                                        value={formData.categoryData?.customRules || ''}
                                        onChange={(e) => setFormData({ ...formData, categoryData: { ...formData.categoryData, customRules: e.target.value } })}
                                        className="w-full bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-2xl px-4 py-4 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/50 text-slate-900 dark:text-white resize-none"
                                    />
                                </div>

                                {/* Custom Deadline */}
                                <div className="space-y-2">
                                    <label className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-widest">Resolution_Deadline</label>
                                    <input
                                        type="datetime-local"
                                        value={formData.categoryData?.customDeadline || ''}
                                        onChange={(e) => setFormData({ ...formData, categoryData: { ...formData.categoryData, customDeadline: e.target.value } })}
                                        className="w-full bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-2xl px-4 py-4 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/50 text-slate-900 dark:text-white"
                                    />
                                </div>
                            </div>
                        )}

                        <div className="flex gap-4 pt-4">
                            <button onClick={prevStep} className="flex-1 py-5 bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-2xl font-bold text-slate-500 hover:text-slate-900 dark:hover:text-white transition-all uppercase text-[10px] tracking-widest font-mono">Back</button>
                            <button onClick={nextStep} className="flex-[2] py-5 bg-emerald-500 text-white dark:text-[#0D0D12] font-black italic rounded-2xl flex items-center justify-center gap-2 btn-tactile shadow-xl shadow-emerald-500/20 uppercase tracking-tight">Assemble Circle <ChevronRight className="w-4 h-4" /></button>
                        </div>
                    </div>
                );

            case 3:
                return (
                    <div className="space-y-8 animate-in fade-in slide-in-from-right-8 duration-500">
                        <div className="text-center space-y-3">
                            <h3 className="text-[10px] font-mono font-bold text-emerald-500 uppercase tracking-[0.5em]">PHASE_03</h3>
                            <h2 className="text-4xl md:text-5xl font-black italic tracking-tighter uppercase text-slate-900 dark:text-white">Build_The_Circle</h2>
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
                            <div className="lg:col-span-3 space-y-6">
                                {/* Invite Controls */}
                                <div className="p-8 rounded-[2.5rem] border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/2 space-y-6 shadow-sm">
                                    <div className="flex items-center justify-between border-b border-slate-200 dark:border-white/5 pb-4">
                                        <div className="flex items-center gap-3">
                                            <UserPlus className="w-5 h-5 text-emerald-500" />
                                            <h4 className="text-[11px] font-mono font-bold text-slate-500 uppercase tracking-widest">Manual_Invitation</h4>
                                        </div>
                                    </div>

                                    <div className="space-y-4">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div className="space-y-1.5">
                                                <label className="text-[9px] font-mono font-bold text-slate-400 uppercase tracking-widest">Alias</label>
                                                <input
                                                    type="text"
                                                    placeholder="E.g. Alice"
                                                    value={newParticipant.name}
                                                    onChange={(e) => setNewParticipant({ ...newParticipant, name: e.target.value })}
                                                    className="w-full bg-white dark:bg-[#09090D] border border-slate-200 dark:border-white/10 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-emerald-500/30 transition-all dark:text-white"
                                                />
                                            </div>
                                            <div className="space-y-1.5">
                                                <label className="text-[9px] font-mono font-bold text-slate-400 uppercase tracking-widest">Wallet_Address</label>
                                                <input
                                                    type="text"
                                                    placeholder="0x... or ENS"
                                                    value={newParticipant.address}
                                                    onChange={(e) => setNewParticipant({ ...newParticipant, address: e.target.value })}
                                                    className="w-full bg-white dark:bg-[#09090D] border border-slate-200 dark:border-white/10 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-emerald-500/30 transition-all dark:text-white font-mono"
                                                />
                                            </div>
                                        </div>
                                        <button
                                            onClick={addParticipant}
                                            disabled={!newParticipant.name || !newParticipant.address}
                                            className="w-full py-4 bg-slate-900 dark:bg-white text-white dark:text-[#0D0D12] rounded-2xl font-black italic uppercase tracking-tighter flex items-center justify-center gap-2 hover:opacity-90 disabled:opacity-30 transition-all"
                                        >
                                            <Plus className="w-5 h-5" /> Add To Circle
                                        </button>
                                    </div>
                                </div>

                                {/* Open Join Mode */}
                                <div className={`p-8 rounded-[2.5rem] border transition-all duration-500 ${formData.isOpenJoin ? 'bg-emerald-500/5 border-emerald-500/20' : 'bg-slate-50 dark:bg-white/2 border-slate-200 dark:border-white/10'}`}>
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-4">
                                            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-colors ${formData.isOpenJoin ? 'bg-emerald-500 text-white' : 'bg-slate-200 dark:bg-white/10 text-slate-400'}`}>
                                                <Globe className="w-6 h-6" />
                                            </div>
                                            <div className="space-y-1">
                                                <h4 className="text-sm font-bold italic uppercase text-slate-900 dark:text-white">Terminal_Open_Join</h4>
                                                <p className="text-[10px] text-slate-500 font-mono tracking-tighter">Allow peers to join via Terminal ID</p>
                                            </div>
                                        </div>
                                        <button
                                            onClick={() => setFormData({ ...formData, isOpenJoin: !formData.isOpenJoin })}
                                            className={`w-14 h-7 rounded-full transition-all relative p-1 ${formData.isOpenJoin ? 'bg-emerald-500' : 'bg-slate-300 dark:bg-white/20'}`}
                                        >
                                            <div className={`w-5 h-5 bg-white rounded-full shadow-lg transition-all transform ${formData.isOpenJoin ? 'translate-x-7' : 'translate-x-0'}`} />
                                        </button>
                                    </div>
                                </div>
                            </div>

                            {/* The Circle Visualizer */}
                            <div className="lg:col-span-2 space-y-4">
                                <div className="flex items-center justify-between px-4">
                                    <h4 className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-widest">Active_Members</h4>
                                    <div className="flex items-center gap-1.5 text-[10px] font-mono font-bold text-emerald-500">
                                        <Users className="w-3 h-3" />
                                        {formData.participants.length + 1} / {formData.maxParticipants}
                                    </div>
                                </div>

                                <div className="obsidian-card rounded-[2.5rem] p-6 space-y-3 bg-white/50 dark:bg-transparent min-h-[360px] flex flex-col">
                                    {/* Self Slot */}
                                    <div className="p-4 rounded-2xl bg-emerald-500 dark:bg-emerald-600 text-[#0D0D12] flex items-center justify-between shadow-xl shadow-emerald-500/20">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
                                                <UserCheck className="w-5 h-5" />
                                            </div>
                                            <div>
                                                <div className="text-xs font-black uppercase italic">You (Initiator)</div>
                                                <div className="text-[9px] font-mono opacity-60">Connected Signature</div>
                                            </div>
                                        </div>
                                        <div className="w-2 h-2 rounded-full bg-white animate-pulse" />
                                    </div>

                                    <div className="flex-1 space-y-2 overflow-y-auto pr-1 scrollbar-hide">
                                        {formData.participants.map((p, i) => (
                                            <div key={i} className="p-4 rounded-2xl bg-white dark:bg-white/5 border border-slate-200 dark:border-white/5 flex items-center justify-between group animate-in slide-in-from-right-4 duration-300">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-white/10 flex items-center justify-center text-xs font-bold text-slate-500">
                                                        {p.name[0]}
                                                    </div>
                                                    <div className="space-y-0.5">
                                                        <div className="text-xs font-bold uppercase text-slate-900 dark:text-white">{p.name}</div>
                                                        <div className="text-[9px] font-mono text-slate-400 truncate max-w-[120px]">{p.address}</div>
                                                    </div>
                                                </div>
                                                <button onClick={() => removeParticipant(i)} className="p-2 opacity-0 group-hover:opacity-100 hover:bg-rose-500/10 text-rose-500 rounded-lg transition-all">
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        ))}

                                        {/* Placeholder slots */}
                                        {Array.from({ length: Math.max(0, formData.maxParticipants - formData.participants.length - 1) }).map((_, i) => (
                                            <div key={`empty-${i}`} className="p-4 rounded-2xl border border-dashed border-slate-200 dark:border-white/5 flex items-center gap-3 opacity-30">
                                                <div className="w-10 h-10 rounded-full border border-dashed border-slate-300 dark:border-white/10 flex items-center justify-center">
                                                    <Plus className="w-4 h-4" />
                                                </div>
                                                <div className="text-[10px] font-mono uppercase tracking-tighter">Empty_Slot</div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="flex gap-4">
                            <button onClick={prevStep} className="flex-1 py-5 bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-2xl font-bold text-slate-500 hover:text-slate-900 dark:hover:text-white transition-all uppercase text-[10px] tracking-widest font-mono">Back</button>
                            <button onClick={nextStep} className="flex-[2] py-5 bg-emerald-500 text-white dark:text-[#0D0D12] font-black italic rounded-2xl flex items-center justify-center gap-2 btn-tactile shadow-xl shadow-emerald-500/20 uppercase tracking-tight">Financial_Setup <ChevronRight className="w-4 h-4" /></button>
                        </div>
                    </div>
                );

            case 4:
                return (
                    <div className="space-y-8 animate-in fade-in slide-in-from-right-8 duration-500">
                        <div className="text-center space-y-3">
                            <h3 className="text-[10px] font-mono font-bold text-emerald-500 uppercase tracking-[0.5em]">PHASE_04</h3>
                            <h2 className="text-4xl md:text-5xl font-black italic tracking-tighter uppercase text-slate-900 dark:text-white">Escrow_Rules</h2>
                        </div>

                        {TokenAmountSelector && (
                            <TokenAmountSelector
                                form={formData}
                                setForm={setFormData}
                                isLoading={isExecuting}
                                onTokenDataChange={(data: any) => {
                                    setTokenData(data);
                                    setFormData({ ...formData, amount: Number(data.rawAmount) / (10 ** data.decimals) });
                                }}
                            />
                        )}

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
                            <div className="space-y-2">
                                <label className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                                    <Clock className="w-3.5 h-3.5" /> Expiration_Target
                                </label>
                                <input
                                    type="date"
                                    value={formData.endDate}
                                    onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                                    className="w-full bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-2xl p-5 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all text-slate-900 dark:text-white"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                                    <ShieldCheck className="w-3.5 h-3.5" /> Circle_Capacity
                                </label>
                                <select
                                    value={formData.maxParticipants}
                                    onChange={(e) => setFormData({ ...formData, maxParticipants: parseInt(e.target.value) })}
                                    className="w-full bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-2xl p-5 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all text-slate-900 dark:text-white appearance-none cursor-pointer"
                                >
                                    <option value={2}>Duel (2 Slots)</option>
                                    <option value={5}>Squad (5 Slots)</option>
                                    <option value={10}>Circle (10 Slots)</option>
                                    <option value={50}>Open Room (50 Slots)</option>
                                </select>
                            </div>
                        </div>

                        <div className="flex gap-4 pt-4">
                            <button onClick={prevStep} className="flex-1 py-5 bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-2xl font-bold text-slate-500 hover:text-slate-900 dark:hover:text-white transition-all uppercase text-[10px] tracking-widest font-mono">Back</button>
                            <button onClick={nextStep} className="flex-[2] py-5 bg-emerald-500 text-white dark:text-[#0D0D12] font-black italic rounded-2xl flex items-center justify-center gap-2 btn-tactile shadow-xl shadow-emerald-500/20 uppercase tracking-tight">Final Summary <ChevronRight className="w-4 h-4" /></button>
                        </div>
                    </div>
                );

            case 5:
                return (
                    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-8 duration-700">
                        <div className="text-center space-y-3">
                            <h3 className="text-[10px] font-mono font-bold text-emerald-500 uppercase tracking-[0.5em]">PHASE_05</h3>
                            <h2 className="text-4xl md:text-5xl font-black italic tracking-tighter uppercase text-slate-900 dark:text-white">Review_Consensus</h2>
                        </div>

                        <div className="obsidian-card p-10 md:p-14 rounded-[3.5rem] border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/2 space-y-10 shadow-3xl relative overflow-hidden">
                            <div className="absolute top-0 right-0 p-8">
                                <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-[10px] font-mono font-bold text-emerald-500 uppercase">
                                    <Zap className="w-3 h-3" /> Ready_To_Deploy
                                </div>
                            </div>

                            <div className="flex flex-col md:flex-row justify-between items-start md:items-center border-b border-slate-200 dark:border-white/5 pb-10 gap-8">
                                <div className="space-y-2">
                                    <span className="text-[10px] font-mono text-slate-400 uppercase tracking-[0.3em]">Protocol_Template</span>
                                    <div className="font-black italic text-3xl md:text-4xl uppercase text-slate-900 dark:text-white flex items-center gap-4">
                                        {template} <span className="text-xs not-italic text-emerald-500 font-mono bg-emerald-500/5 px-2 py-0.5 rounded">v1.0.4-AF</span>
                                    </div>
                                </div>
                                <div className="space-y-2 md:text-right">
                                    <span className="text-[10px] font-mono text-slate-400 uppercase tracking-[0.3em]">Total_Stake</span>
                                    <div className="font-mono font-bold text-4xl md:text-5xl text-emerald-600 dark:text-emerald-500 tracking-tighter italic">${formData.amount.toFixed(2)} USDC</div>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                                <div className="space-y-4">
                                    <div className="space-y-1">
                                        <span className="text-[10px] font-mono text-slate-400 uppercase tracking-[0.3em]">Objective_Statement</span>
                                        <p className="text-2xl font-bold italic text-slate-800 dark:text-slate-100 leading-tight">
                                            "{formData.description || 'Outcome verification based on custom peer agreement...'}"
                                        </p>
                                    </div>

                                    <div className="pt-6 flex flex-col gap-3">
                                        <div className="flex items-center gap-3 text-slate-500">
                                            <Clock className="w-4 h-4" />
                                            <span className="text-xs font-mono uppercase tracking-widest">Expires: {formData.endDate || 'NO_LIMIT'}</span>
                                        </div>
                                        <div className="flex items-center gap-3 text-slate-500">
                                            <Fingerprint className="w-4 h-4" />
                                            <span className="text-xs font-mono uppercase tracking-widest">Type: Non-Custodial Escrow</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-6">
                                    <span className="text-[10px] font-mono text-slate-400 uppercase tracking-[0.3em]">Circle_Composition</span>
                                    <div className="flex flex-wrap gap-3">
                                        <div className="px-4 py-2 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-[11px] font-black text-emerald-600 dark:text-emerald-400 uppercase italic">Me (Host)</div>
                                        {formData.participants.map((p, i) => (
                                            <div key={i} className="px-4 py-2 rounded-2xl bg-slate-200 dark:bg-white/5 border border-slate-300 dark:border-white/10 text-[11px] font-bold text-slate-600 dark:text-slate-400 uppercase tracking-tight">{p.name}</div>
                                        ))}
                                        {formData.isOpenJoin && (
                                            <div className="px-4 py-2 rounded-2xl bg-blue-500/10 border border-blue-500/30 text-[11px] font-bold text-blue-600 dark:text-blue-400 uppercase flex items-center gap-2">
                                                <Globe className="w-3 h-3" /> Terminal_Open
                                            </div>
                                        )}
                                    </div>
                                    <p className="text-[10px] font-mono text-slate-400 leading-relaxed italic">
                                        Warning: Consensus failure triggers the 30% Burn Penalty. Honesty is the Nash Equilibrium of this protocol.
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="flex gap-4">
                            <button onClick={prevStep} className="flex-1 py-5 bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-2xl font-bold text-slate-500 hover:text-slate-900 dark:hover:text-white transition-all uppercase text-[10px] tracking-widest font-mono">Edit</button>
                            <button onClick={handleCreateBet} className="flex-[3] py-7 bg-emerald-500 text-white dark:text-[#0D0D12] font-black italic rounded-[2.5rem] flex items-center justify-center gap-5 btn-tactile shadow-2xl shadow-emerald-500/40 uppercase tracking-tighter text-2xl group transition-all">
                                Execute_Escrow_Contract <Send className="w-7 h-7 group-hover:translate-x-1.5 group-hover:-translate-y-1.5 transition-transform" />
                            </button>
                        </div>
                    </div>
                );

            default:
                return null;
        }
    };

    return (
        <div className="max-w-5xl mx-auto pb-32 pt-8">
            {/* Stepper HUD */}
            <div className="mb-16 flex justify-center items-center gap-4 px-4">
                {[1, 2, 3, 4, 5].map(s => (
                    <div key={s} className="flex items-center">
                        <div className={`w-4 h-4 rounded-full border-2 transition-all duration-700 flex items-center justify-center ${step >= s
                            ? 'bg-emerald-500 border-emerald-400 shadow-[0_0_20px_rgba(16,185,129,0.5)] scale-125'
                            : 'bg-transparent border-slate-300 dark:border-white/10'
                            }`}>
                            {step > s && <div className="w-1.5 h-1.5 bg-white rounded-full animate-in zoom-in" />}
                        </div>
                        {s < 5 && <div className={`w-12 md:w-20 h-0.5 transition-all duration-700 ${step > s ? 'bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.3)]' : 'bg-slate-200 dark:bg-white/5'}`}></div>}
                    </div>
                ))}
            </div>

            <div className="obsidian-card p-10 md:p-20 rounded-[4rem] border-slate-200 dark:border-white/5 shadow-2xl bg-white dark:bg-transparent transition-all relative overflow-hidden backdrop-blur-3xl">
                {renderStep()}

                {/* Subtle dynamic flair elements */}
                <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-emerald-500/5 blur-[150px] rounded-full pointer-events-none -z-10 translate-x-1/2 -translate-y-1/2"></div>
                <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-blue-500/5 blur-[120px] rounded-full pointer-events-none -z-10 -translate-x-1/2 translate-y-1/2"></div>
            </div>

            {isExecuting && ProgressModal && (
                <ProgressModal
                    isOpen={isExecuting}
                    stage={executionStage}
                    hasError={hasError}
                    onClose={() => {
                        setIsExecuting(false);
                        setHasError(false);
                    }}
                />
            )}
        </div>
    );
}

function TemplateCard({ type, icon, title, desc, active, onClick }: { type: TemplateType, icon: React.ReactElement, title: string, desc: string, active: boolean, onClick: () => void }) {
    return (
        <button
            onClick={onClick}
            className={`p-10 rounded-[3rem] text-left transition-all border group relative overflow-hidden ${active
                ? 'bg-emerald-500 border-emerald-400 shadow-2xl shadow-emerald-500/30 -translate-y-1.5 scale-[1.02]'
                : 'bg-slate-50 dark:bg-white/2 border-slate-200 dark:border-white/10 hover:border-emerald-500/40 hover:bg-emerald-500/[0.04]'
                }`}
        >
            <div className={`w-16 h-16 rounded-[1.5rem] flex items-center justify-center mb-10 transition-all group-hover:scale-110 duration-500 ${active ? 'bg-white/20 text-white shadow-inner' : 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 shadow-sm'
                }`}>
                {React.cloneElement(icon, { className: 'w-8 h-8' } as any)}
            </div>
            <div className="space-y-2 relative z-10">
                <h4 className={`text-2xl font-black italic tracking-tighter uppercase leading-none ${active ? 'text-white' : 'text-slate-900 dark:text-white'}`}>{title}</h4>
                <p className={`text-xs font-mono font-bold tracking-tight uppercase ${active ? 'text-white/70' : 'text-slate-500'}`}>{desc}</p>
            </div>
            <div className={`absolute -right-8 -bottom-8 w-40 h-40 blur-[100px] rounded-full transition-opacity duration-1000 ${active ? 'bg-white/40' : 'bg-emerald-500/20 opacity-0 group-hover:opacity-100'}`}></div>
        </button>
    );
}