import { useAccount, useChainId, useReadContract } from 'wagmi';import { ERC20_ABI } from '@/constants/erc20ABI';
import { COMMON_TOKENS } from '@/constants/contracts';

export function useUserERC20Tokens() {
  const { address } = useAccount();
  const chainId = useChainId();
  const tokens = COMMON_TOKENS[chainId as keyof typeof COMMON_TOKENS] || [];


  // Get balances for all tokens
  const tokenBalances = tokens.map((token: any) => {
    const { data: balance } = useReadContract({
      address: token.address as `0x${string}`,
      abi: ERC20_ABI,
      functionName: 'balanceOf',
      args: [address!],
    });

    return {
      ...token,
      balance: balance?.toString() || '0',
    };
  });

  return {
    tokens: tokenBalances,
    isTokenLoading: false, // You can add loading state logic here
  };
}
