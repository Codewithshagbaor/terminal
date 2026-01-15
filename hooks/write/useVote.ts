import { useChainId, useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { CONTRACT_ADDRESSES } from '@/constants/contracts';
import { AMONG_FRIENDS_ABI } from '@/constants/contractABI';
import { stringToHex, pad, isAddress } from 'viem';

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

        // Convert the outcome to bytes32
        // If outcome is an address, pad it directly; otherwise convert string to hex first
        let outcomeBytes32: `0x${string}`;
        if (isAddress(outcome)) {
            // Outcome is an Ethereum address - pad it directly to 32 bytes
            outcomeBytes32 = pad(outcome as `0x${string}`, { size: 32, dir: 'left' });
        } else {
            // Outcome is a regular string - convert to hex first, then pad
            outcomeBytes32 = pad(stringToHex(outcome), { size: 32, dir: 'left' });
        }

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
