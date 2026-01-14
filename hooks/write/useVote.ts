import { useChainId, useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { CONTRACT_ADDRESSES } from '@/constants/contracts';
import { AMONG_FRIENDS_ABI } from '@/constants/contractABI';
import { stringToHex, pad } from 'viem';

export function useVote() {
    const chainId = useChainId();
    const {
        writeContract,
        data: hash,
        isPending,
        isSuccess: isWriteSuccess,
        error,
        reset
    } = useWriteContract();

    const {
        isLoading: isConfirming,
        isSuccess: isConfirmed
    } = useWaitForTransactionReceipt({
        hash,
    });

    const vote = (betId: number, outcome: string) => {
        const contractAddress = CONTRACT_ADDRESSES[chainId as keyof typeof CONTRACT_ADDRESSES];
        if (!contractAddress) {
            throw new Error(`Contract address not found for chain ID: ${chainId}`);
        }

        // Convert the outcome string to bytes32
        // Pad to 32 bytes (64 hex characters)
        const outcomeBytes32 = pad(stringToHex(outcome), { size: 32 });

        writeContract({
            abi: AMONG_FRIENDS_ABI,
            address: contractAddress as `0x${string}`,
            functionName: 'vote',
            args: [BigInt(betId), outcomeBytes32],
        });
    };

    return {
        vote,
        hash,
        isPending,
        isConfirming,
        isSuccess: isConfirmed,
        error,
        reset,
    };
}

export function useResolve() {
    const chainId = useChainId();
    const {
        writeContract,
        data: hash,
        isPending,
        isSuccess: isWriteSuccess,
        error,
        reset
    } = useWriteContract();

    const {
        isLoading: isConfirming,
        isSuccess: isConfirmed
    } = useWaitForTransactionReceipt({
        hash,
    });

    const resolve = (betId: number) => {
        const contractAddress = CONTRACT_ADDRESSES[chainId as keyof typeof CONTRACT_ADDRESSES];
        if (!contractAddress) {
            throw new Error(`Contract address not found for chain ID: ${chainId}`);
        }

        writeContract({
            abi: AMONG_FRIENDS_ABI,
            address: contractAddress as `0x${string}`,
            functionName: 'resolve',
            args: [BigInt(betId)],
        });
    };

    return {
        resolve,
        hash,
        isPending,
        isConfirming,
        isSuccess: isConfirmed,
        error,
        reset,
    };
}
