
import { useWaitForTransactionReceipt } from 'wagmi';
import { decodeEventLog } from 'viem';
import { AMONG_FRIENDS_ABI } from '@/constants/contractABI';
import { useEffect, useState } from 'react';

// Type definition for BetCreated event arguments
type BetCreatedEventArgs = {
  betId: bigint;
  [key: string]: unknown;
};

export function useExtractBetId(txHash: `0x${string}` | undefined) {
  const { data: receipt, isLoading, error } = useWaitForTransactionReceipt({
    hash: txHash,
  });

  const [betId, setBetId] = useState<number | null>(null);

  useEffect(() => {
    if (receipt) {
      for (const log of receipt.logs) {
        try {
          const decoded = decodeEventLog({
            abi: AMONG_FRIENDS_ABI,
            data: log.data,
            topics: log.topics,
          });
          if (decoded.eventName === 'BetCreated' && decoded.args) {
            const args = decoded.args as unknown as BetCreatedEventArgs;
            setBetId(Number(args.betId));
          }
        } catch (e) {
          continue;
        }
      }
    }
  }, [receipt]);

  return { betId, isLoading, error, receipt };
}