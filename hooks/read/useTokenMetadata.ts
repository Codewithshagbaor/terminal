import { useReadContract } from 'wagmi';
import { ERC20_ABI } from '@/constants/erc20ABI';

export function useTokenDecimals(token: `0x${string}`) {
  return useReadContract({
    address: token,
    abi: ERC20_ABI,
    functionName: 'decimals',
  });
}