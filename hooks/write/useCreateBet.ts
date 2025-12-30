import { useState } from 'react';
import { useWriteContract, useChainId } from 'wagmi';
import { CONTRACT_ADDRESSES } from '@/constants/contracts'
import { AMONG_FRIENDS_ABI } from '@/constants/contractABI';

export function useCreateBet() {
  const chainId = useChainId();
  const { writeContract, ...rest } = useWriteContract();

  const createBet = (args: any[]) => {
    const contractAddress = CONTRACT_ADDRESSES[chainId as keyof typeof CONTRACT_ADDRESSES];
    
    if (!contractAddress) {
      throw new Error(`Contract address not found for chain ID: ${chainId}`);
    }

    if (!args || args.length !== 6) {
      throw new Error(`Expected 6 arguments for createBet, got ${args?.length || 0}`);
    }

    console.log('Creating bet with args:', args); // Debug log

    writeContract({
      abi: AMONG_FRIENDS_ABI,
      address: contractAddress as `0x${string}`,
      functionName: 'createBet',
      args: args,
    });
  };

  return {
    createBet,
    ...rest
  };
}