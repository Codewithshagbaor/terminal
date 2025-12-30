import { useWaitForTransactionReceipt } from 'wagmi';
import { decodeEventLog } from 'viem';
import { AMONG_FRIENDS_ABI } from '@/constants/contractABI';

// Type definition for BetCreated event arguments
type BetCreatedEventArgs = {
  betId: bigint;
  [key: string]: unknown;
};

export function useExtractBetId(txHash: `0x${string}` | undefined) {
  const { data: receipt, isLoading, error } = useWaitForTransactionReceipt({
    hash: txHash,
  });

  const extractBetId = (): number | null => {
    if (!receipt?.logs) return null;

    // Find the BetCreated event log
    for (const log of receipt.logs) {
      try {
        const decoded = decodeEventLog({
          abi: AMONG_FRIENDS_ABI,
          data: log.data,
          topics: log.topics,
        });

        // Assuming your contract emits a BetCreated event with betId
        if (decoded.eventName === 'BetCreated' && decoded.args) {
          const args = decoded.args as unknown as BetCreatedEventArgs;
          return Number(args.betId); // Adjust based on your event's structure
        }
      } catch (e) {
        // Continue to next log if this one can't be decoded
        continue;
      }
    }

    return null;
  };

  return {
    betId: extractBetId(),
    isLoading,
    error,
    receipt,
  };
}