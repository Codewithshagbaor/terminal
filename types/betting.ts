export interface TokenData {
  selected: any;
  tokenAddress: `0x${string}`;
  decimals: number;
  tokenBalance: string;
  actualStakeAmount: bigint;
  needsApproval: boolean;
  hasSufficientBalance: boolean;
  formattedBalance: string;
  formattedAllowance: string;
  stakeAmount: bigint;
}
  
export interface BetForm {
    token: string;
    amount: string;
    deadline: string;
    category: string;
    description: string;
    rules: string;
    tags: string;
    externalLink: string;
  }
  
export interface TokenAmountSelectorProps {
    form: BetForm;
    setForm: (form: BetForm) => void;
    isLoading: boolean;
    onTokenDataChange?: (tokenData: TokenData) => void;
  }
  