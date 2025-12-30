import { useAccount, useChainId, useReadContract, useWriteContract } from 'wagmi';
import { CONTRACT_ADDRESSES } from '@/constants/contracts'
import { ERC20_ABI } from '@/constants/erc20ABI';

export function useAllowance(token: `0x${string}`, spender: `0x${string}`) {
  const { address } = useAccount();
  
  return useReadContract({
    address: token,
    abi: ERC20_ABI,
    functionName: 'allowance',
    args: [address!, spender],
  });
}

export function useApproveToken(token: `0x${string}`, amount: bigint) {
  const chainId = useChainId();
  const { writeContract, ...rest } = useWriteContract();
  
  const approveToken = () => {
    const spender = CONTRACT_ADDRESSES[chainId as keyof typeof CONTRACT_ADDRESSES];
    
    if (!spender) {
      throw new Error(`Contract address not found for chain ID: ${chainId}`);
    }
    
    if (!token || !amount) {
      throw new Error('Token address and amount are required');
    }
    
    console.log('Approving token:', { token, spender, amount: amount.toString() });
    
    writeContract({
      abi: ERC20_ABI,
      address: token,
      functionName: 'approve',
      args: [spender as `0x${string}`, amount],
    });
  };
  
  return {
    approveToken,
    ...rest
  };
}