import { useReadContract, useChainId } from 'wagmi';
import { CONTRACT_ADDRESSES } from '@/constants/contracts';
import { AMONG_FRIENDS_ABI } from '@/constants/contractABI';

// Bet status enum matching the contract
export enum BetStatus {
    Created = 0,
    Active = 1,
    VotingClosed = 2,
    Resolved = 3,
    Cancelled = 4,
}

// Bet type enum matching the contract
export enum BetType {
    OneVsOne = 0,
    Group = 1,
}

export interface BetDetails {
    creator: `0x${string}`;
    token: `0x${string}`;
    title: string;
    stakeAmount: bigint;
    voteDeadline: bigint;
    category: string;
    metadataCID: string;
    status: BetStatus;
    finalOutcome: `0x${string}`;
    participantCount: bigint;
    betType: BetType;
    maxParticipants: bigint;
}

export function useGetBetDetails(betId: number | undefined) {
    const chainId = useChainId();
    const contractAddress = CONTRACT_ADDRESSES[chainId as keyof typeof CONTRACT_ADDRESSES];

    const { data, isLoading, error, refetch } = useReadContract({
        abi: AMONG_FRIENDS_ABI,
        address: contractAddress as `0x${string}`,
        functionName: 'getBetDetails',
        args: betId !== undefined ? [BigInt(betId)] : undefined,
        query: {
            enabled: betId !== undefined && !!contractAddress,
        },
    });

    // Parse the tuple response into a typed object
    const betDetails: BetDetails | undefined = data ? {
        creator: (data as any)[0],
        token: (data as any)[1],
        title: (data as any)[2],
        stakeAmount: (data as any)[3],
        voteDeadline: (data as any)[4],
        category: (data as any)[5],
        metadataCID: (data as any)[6],
        status: (data as any)[7] as BetStatus,
        finalOutcome: (data as any)[8],
        participantCount: (data as any)[9],
        betType: (data as any)[10] as BetType,
        maxParticipants: (data as any)[11],
    } : undefined;

    return { betDetails, isLoading, error, refetch };
}

export function useGetParticipants(betId: number | undefined) {
    const chainId = useChainId();
    const contractAddress = CONTRACT_ADDRESSES[chainId as keyof typeof CONTRACT_ADDRESSES];

    const { data, isLoading, error, refetch } = useReadContract({
        abi: AMONG_FRIENDS_ABI,
        address: contractAddress as `0x${string}`,
        functionName: 'getParticipants',
        args: betId !== undefined ? [BigInt(betId)] : undefined,
        query: {
            enabled: betId !== undefined && !!contractAddress,
        },
    });

    return {
        participants: data as `0x${string}`[] | undefined,
        isLoading,
        error,
        refetch
    };
}

export function useHasVoted(betId: number | undefined, userAddress: `0x${string}` | undefined) {
    const chainId = useChainId();
    const contractAddress = CONTRACT_ADDRESSES[chainId as keyof typeof CONTRACT_ADDRESSES];

    const { data, isLoading, error, refetch } = useReadContract({
        abi: AMONG_FRIENDS_ABI,
        address: contractAddress as `0x${string}`,
        functionName: 'hasVoted',
        args: betId !== undefined && userAddress ? [BigInt(betId), userAddress] : undefined,
        query: {
            enabled: betId !== undefined && !!userAddress && !!contractAddress,
        },
    });

    return {
        hasVoted: data as boolean | undefined,
        isLoading,
        error,
        refetch
    };
}
