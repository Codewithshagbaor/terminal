import { useWriteContract, useReadContract, useAccount, useChainId } from 'wagmi';
import { erc20Abi } from 'viem';
import { CONTRACT_ADDRESSES } from '@/constants/contracts';

export function useApproveToken(tokenAddress?: `0x${string}`, amount?: bigint) {
  const { address } = useAccount();
  const chainId = useChainId();
  const contractAddress = CONTRACT_ADDRESSES[chainId as keyof typeof CONTRACT_ADDRESSES] as `0x${string}`;

  const { writeContract, data, isPending, isSuccess, error } = useWriteContract();

  const approveToken = () => {
    if (!tokenAddress || !amount || !contractAddress) {
      console.error('Missing required params for approval:', {
        tokenAddress,
        amount: amount?.toString(),
        contractAddress
      });
      return;
    }

    console.log('Approving token:', {
      token: tokenAddress,
      spender: contractAddress,
      amount: amount.toString()
    });

    writeContract({
      address: tokenAddress,
      abi: erc20Abi,
      functionName: 'approve',
      args: [contractAddress, amount],
    });
  };

  return {
    approveToken,
    data,
    isPending,
    isSuccess,
    error,
  };
}

export function useAllowance(tokenAddress?: `0x${string}`, spender?: `0x${string}`) {
  const { address } = useAccount();

  const { data, refetch, ...rest } = useReadContract({
    address: tokenAddress,
    abi: erc20Abi,
    functionName: 'allowance',
    args: address && spender ? [address, spender] : undefined,
    query: {
      enabled: !!address && !!tokenAddress && !!spender,
    },
  });

  return {
    data: data as bigint | undefined,
    refetch,
    ...rest,
  };
}