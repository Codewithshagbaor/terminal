import { useState } from 'react';
import { useChainId, useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { CONTRACT_ADDRESSES } from '@/constants/contracts';
import { AMONG_FRIENDS_ABI } from '@/constants/contractABI';

export function useJoinBet(initialBetId: number = 0) {
  const chainId = useChainId();
  const {
    writeContract,
    data: hash,
    isPending,
    isSuccess: isWriteSuccess,
    error,
    reset
  } = useWriteContract();

  const [betId, setBetId] = useState(initialBetId);

  const {
    isLoading: isConfirming,
    isSuccess: isConfirmed
  } = useWaitForTransactionReceipt({
    hash,
  });

  const joinBet = (newBetId?: number) => {
    const contractAddress = CONTRACT_ADDRESSES[chainId as keyof typeof CONTRACT_ADDRESSES];
    if (!contractAddress) {
      throw new Error(`Contract address not found for chain ID: ${chainId}`);
    }

    const finalBetId = newBetId !== undefined ? newBetId : betId;
    setBetId(finalBetId);

    writeContract({
      abi: AMONG_FRIENDS_ABI,
      address: contractAddress as `0x${string}`,
      functionName: 'joinBet',
      args: [BigInt(finalBetId)],
    });
  };

  return {
    joinBet,
    setBetId,
    hash,
    isPending,
    isConfirming,
    isSuccess: isConfirmed,
    error,
    reset,
  };
}