const isTestnetsEnabled = process.env.NEXT_PUBLIC_ENABLE_TESTNETS === 'true';

export const CONTRACT_ADDRESSES = isTestnetsEnabled
  ? {
    1: '0xEthereumTestnetAddress',
    137: '0xPolygonTestnetAddress',
    42161: '0xArbitrumTestnetAddress',
    84532: '0x227cBC1033dD32996eb62A8cb72AA57029628e9E',
    5003: '0x731B2e423b8c3EdAdd9dBf3a87Fc3ac43533fACf',
  }
  : {
    1: process.env.NEXT_PUBLIC_ETHEREUM_CONTRACT_ADDRESS || '0xEthereumAddress',
    137: process.env.NEXT_PUBLIC_POLYGON_CONTRACT_ADDRESS || '0xPolygonAddress',
    42161: process.env.NEXT_PUBLIC_ARBITRUM_CONTRACT_ADDRESS || '0xArbitrumAddress',
    5003: process.env.NEXT_PUBLIC_5003_CONTRACT_ADDRESS || '0x731B2e423b8c3EdAdd9dBf3a87Fc3ac43533fACf',
  };

export const COMMON_TOKENS = isTestnetsEnabled
  ? {
    1: [ // Ethereum Testnet
      { address: "0xTestnetUSDCAddress", symbol: "USDC", name: "USD Coin", decimals: 6 },
      { address: "0xTestnetUSDTAddress", symbol: "USDT", name: "Tether USD", decimals: 6 },
      { address: "0xTestnetDAIAddress", symbol: "DAI", name: "Dai Stablecoin" },
    ],
    137: [ // Polygon Testnet
      { address: "0xTestnetUSDCAddress", symbol: "USDC", name: "USD Coin", decimals: 6 },
      { address: "0xTestnetUSDTAddress", symbol: "USDT", name: "Tether USD", decimals: 6 },
    ],
    84532: [
      { address: "0x036CbD53842c5426634e7929541eC2318f3dCF7e", symbol: "USDC", name: "USD Coin", decimals: 6, colour: "bg-blue-500", image: "https://cryptologos.cc/logos/usd-coin-usdc-logo.png" },
      { address: "0x4200000000000000000000000000000000000006", symbol: "WETH", name: "Wrapped Ethereum", decimals: 18, colour: "bg-blue-600", image: "https://cryptologos.cc/logos/ethereum-eth-logo.png" },
      { address: "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913", symbol: "DAI", name: "Dai Stablecoin", decimals: 18, colour: "bg-yellow-500", image: "https://cryptologos.cc/logos/multi-collateral-dai-dai-logo.png" },
    ],
    5003: [
      { address: "0x791965fCe1F70358Bc2D12b6A110d8F93cc5F2Cb", symbol: "USDC", name: "USD Coin", decimals: 6, colour: "bg-blue-500", image: "https://cryptologos.cc/logos/usd-coin-usdc-logo.png" },
      { address: "0x7A0C90050B662f4b8546486Ab2ad584bcC2a00Dd", symbol: "FRIENDS", name: "Friends", decimals: 18, colour: "bg-blue-600", image: "https://cryptologos.cc/logos/ethereum-eth-logo.png" },
    ],
  }
  : {
    1: [ // Ethereum
      { address: "0xA0b86a33E6441b9435B652e9c8e8b95D8C6C5c5F", symbol: "USDC", name: "USD Coin", decimals: 6 },
      { address: "0xdAC17F958D2ee523a2206206994597C13D831ec7", symbol: "USDT", name: "Tether USD", decimals: 6 },
    ],
    137: [ // Polygon
      { address: "0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174", symbol: "USDC", name: "USD Coin", decimals: 6 },
      { address: "0xc2132D05D31c914a87C6611C10748AEb04B58e8F", symbol: "USDT", name: "Tether USD", decimals: 6 },
    ],
  };