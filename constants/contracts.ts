const isTestnetsEnabled = process.env.NEXT_PUBLIC_ENABLE_TESTNETS === 'true';

export const CONTRACT_ADDRESSES = isTestnetsEnabled
  ? {
    5003: '0xb8Fb1E65744B1637154758F261088E35965d951a',
  }
  : {
    5003: process.env.NEXT_PUBLIC_5003_CONTRACT_ADDRESS || '0xb8Fb1E65744B1637154758F261088E35965d951a',
  };

export const COMMON_TOKENS = isTestnetsEnabled
  ? {
    5003: [
      { address: "0x791965fCe1F70358Bc2D12b6A110d8F93cc5F2Cb", symbol: "USDC", name: "USD Coin", decimals: 6, colour: "bg-blue-500", image: "https://cryptologos.cc/logos/usd-coin-usdc-logo.png" },
      { address: "0x7A0C90050B662f4b8546486Ab2ad584bcC2a00Dd", symbol: "FRIENDS", name: "Friends", decimals: 18, colour: "bg-blue-600", image: "https://cryptologos.cc/logos/ethereum-eth-logo.png" },
    ],
  }
  : {
    5003: [ // Mantle Testnet
      { address: "0x791965fCe1F70358Bc2D12b6A110d8F93cc5F2Cb", symbol: "USDC", name: "USD Coin", decimals: 6, colour: "bg-blue-500", image: "https://cryptologos.cc/logos/usd-coin-usdc-logo.png" },
      { address: "0x7A0C90050B662f4b8546486Ab2ad584bcC2a00Dd", symbol: "FRIENDS", name: "Friends", decimals: 18, colour: "bg-blue-600", image: "https://cryptologos.cc/logos/ethereum-eth-logo.png" },
    ],
  };