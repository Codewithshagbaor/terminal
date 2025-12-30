export const AMONG_FRIENDS_ABI = [
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "_treasury",
        "type": "address"
      },
      {
        "internalType": "uint256",
        "name": "_initialFeeBps",
        "type": "uint256"
      }
    ],
    "stateMutability": "nonpayable",
    "type": "constructor"
  },
{
  "inputs": [],
  "name": "ReentrancyGuardReentrantCall",
  "type": "error"
},
{
  "anonymous": false,
  "inputs": [
    {
      "indexed": true,
      "internalType": "uint256",
      "name": "betId",
      "type": "uint256"
    }
  ],
  "name": "BetCancelled",
  "type": "event"
},
{
  "anonymous": false,
  "inputs": [
    {
      "indexed": true,
      "internalType": "uint256",
      "name": "betId",
      "type": "uint256"
    },
    {
      "indexed": true,
      "internalType": "address",
      "name": "creator",
      "type": "address"
    },
    {
      "indexed": false,
      "internalType": "address",
      "name": "token",
      "type": "address"
    },
    {
      "indexed": false,
      "internalType": "string",
      "name": "title",
      "type": "string"
    },
    {
      "indexed": false,
      "internalType": "uint256",
      "name": "stakeAmount",
      "type": "uint256"
    },
    {
      "indexed": false,
      "internalType": "uint256",
      "name": "voteDeadline",
      "type": "uint256"
    },
    {
      "indexed": false,
      "internalType": "string",
      "name": "category",
      "type": "string"
    },
    {
      "indexed": false,
      "internalType": "string",
      "name": "metadataCID",
      "type": "string"
    }
  ],
  "name": "BetCreated",
  "type": "event"
},
{
  "anonymous": false,
  "inputs": [
    {
      "indexed": true,
      "internalType": "uint256",
      "name": "betId",
      "type": "uint256"
    },
    {
      "indexed": true,
      "internalType": "address",
      "name": "participant",
      "type": "address"
    }
  ],
  "name": "BetJoined",
  "type": "event"
},
{
  "anonymous": false,
  "inputs": [
    {
      "indexed": true,
      "internalType": "uint256",
      "name": "betId",
      "type": "uint256"
    },
    {
      "indexed": false,
      "internalType": "bytes32",
      "name": "outcome",
      "type": "bytes32"
    },
    {
      "indexed": false,
      "internalType": "bool",
      "name": "hasWinners",
      "type": "bool"
    }
  ],
  "name": "BetResolved",
  "type": "event"
},
{
  "anonymous": false,
  "inputs": [
    {
      "indexed": true,
      "internalType": "uint256",
      "name": "betId",
      "type": "uint256"
    },
    {
      "indexed": true,
      "internalType": "address",
      "name": "recipient",
      "type": "address"
    },
    {
      "indexed": false,
      "internalType": "uint256",
      "name": "amount",
      "type": "uint256"
    }
  ],
  "name": "FundsPayout",
  "type": "event"
},
{
  "anonymous": false,
  "inputs": [],
  "name": "Paused",
  "type": "event"
},
{
  "anonymous": false,
  "inputs": [
    {
      "indexed": false,
      "internalType": "uint256",
      "name": "newFeeBps",
      "type": "uint256"
    }
  ],
  "name": "TreasuryFeeUpdated",
  "type": "event"
},
{
  "anonymous": false,
  "inputs": [
    {
      "indexed": true,
      "internalType": "uint256",
      "name": "betId",
      "type": "uint256"
    },
    {
      "indexed": true,
      "internalType": "address",
      "name": "treasury",
      "type": "address"
    },
    {
      "indexed": false,
      "internalType": "uint256",
      "name": "amount",
      "type": "uint256"
    }
  ],
  "name": "TreasuryPaid",
  "type": "event"
},
{
  "anonymous": false,
  "inputs": [],
  "name": "Unpaused",
  "type": "event"
},
{
  "anonymous": false,
  "inputs": [
    {
      "indexed": true,
      "internalType": "uint256",
      "name": "betId",
      "type": "uint256"
    },
    {
      "indexed": true,
      "internalType": "address",
      "name": "voter",
      "type": "address"
    },
    {
      "indexed": false,
      "internalType": "bytes32",
      "name": "outcome",
      "type": "bytes32"
    }
  ],
  "name": "VoteCast",
  "type": "event"
},
{
  "inputs": [],
  "name": "MAX_TREASURY_FEE_BPS",
  "outputs": [
    {
      "internalType": "uint256",
      "name": "",
      "type": "uint256"
    }
  ],
  "stateMutability": "view",
  "type": "function"
},
{
  "inputs": [],
  "name": "admin",
  "outputs": [
    {
      "internalType": "address",
      "name": "",
      "type": "address"
    }
  ],
  "stateMutability": "view",
  "type": "function"
},
{
  "inputs": [
    {
      "internalType": "uint256",
      "name": "betId",
      "type": "uint256"
    }
  ],
  "name": "cancelBet",
  "outputs": [],
  "stateMutability": "nonpayable",
  "type": "function"
},
{
  "inputs": [
    {
      "internalType": "address",
      "name": "token",
      "type": "address"
    },
    {
      "internalType": "string",
      "name": "title",
      "type": "string"
    },
    {
      "internalType": "uint256",
      "name": "stakeAmount",
      "type": "uint256"
    },
    {
      "internalType": "uint256",
      "name": "voteDeadline",
      "type": "uint256"
    },
    {
      "internalType": "string",
      "name": "category",
      "type": "string"
    },
    {
      "internalType": "string",
      "name": "metadataCID",
      "type": "string"
    }
  ],
  "name": "createBet",
  "outputs": [
    {
      "internalType": "uint256",
      "name": "betId",
      "type": "uint256"
    }
  ],
  "stateMutability": "nonpayable",
  "type": "function"
},
{
  "inputs": [
    {
      "internalType": "uint256",
      "name": "betId",
      "type": "uint256"
    }
  ],
  "name": "getBetDetails",
  "outputs": [
    {
      "internalType": "address",
      "name": "creator",
      "type": "address"
    },
    {
      "internalType": "address",
      "name": "token",
      "type": "address"
    },
    {
      "internalType": "uint256",
      "name": "stakeAmount",
      "type": "uint256"
    },
    {
      "internalType": "uint256",
      "name": "voteDeadline",
      "type": "uint256"
    },
    {
      "internalType": "string",
      "name": "category",
      "type": "string"
    },
    {
      "internalType": "string",
      "name": "metadataCID",
      "type": "string"
    },
    {
      "internalType": "enum AmongFriendsBet.BetStatus",
      "name": "status",
      "type": "uint8"
    },
    {
      "internalType": "bytes32",
      "name": "finalOutcome",
      "type": "bytes32"
    },
    {
      "internalType": "uint256",
      "name": "participantCount",
      "type": "uint256"
    }
  ],
  "stateMutability": "view",
  "type": "function"
},
{
  "inputs": [
    {
      "internalType": "uint256",
      "name": "betId",
      "type": "uint256"
    }
  ],
  "name": "getBetStatus",
  "outputs": [
    {
      "internalType": "enum AmongFriendsBet.BetStatus",
      "name": "",
      "type": "uint8"
    }
  ],
  "stateMutability": "view",
  "type": "function"
},
{
  "inputs": [
    {
      "internalType": "uint256",
      "name": "betId",
      "type": "uint256"
    }
  ],
  "name": "getOutcome",
  "outputs": [
    {
      "internalType": "bytes32",
      "name": "",
      "type": "bytes32"
    }
  ],
  "stateMutability": "view",
  "type": "function"
},
{
  "inputs": [
    {
      "internalType": "uint256",
      "name": "betId",
      "type": "uint256"
    }
  ],
  "name": "getParticipants",
  "outputs": [
    {
      "internalType": "address[]",
      "name": "",
      "type": "address[]"
    }
  ],
  "stateMutability": "view",
  "type": "function"
},
{
  "inputs": [
    {
      "internalType": "address",
      "name": "user",
      "type": "address"
    }
  ],
  "name": "getUserBets",
  "outputs": [
    {
      "internalType": "uint256[]",
      "name": "",
      "type": "uint256[]"
    }
  ],
  "stateMutability": "view",
  "type": "function"
},
{
  "inputs": [
    {
      "internalType": "uint256",
      "name": "betId",
      "type": "uint256"
    },
    {
      "internalType": "address",
      "name": "user",
      "type": "address"
    }
  ],
  "name": "hasVoted",
  "outputs": [
    {
      "internalType": "bool",
      "name": "",
      "type": "bool"
    }
  ],
  "stateMutability": "view",
  "type": "function"
},
{
  "inputs": [
    {
      "internalType": "uint256",
      "name": "betId",
      "type": "uint256"
    }
  ],
  "name": "joinBet",
  "outputs": [],
  "stateMutability": "nonpayable",
  "type": "function"
},
{
  "inputs": [],
  "name": "nextBetId",
  "outputs": [
    {
      "internalType": "uint256",
      "name": "",
      "type": "uint256"
    }
  ],
  "stateMutability": "view",
  "type": "function"
},
{
  "inputs": [],
  "name": "pause",
  "outputs": [],
  "stateMutability": "nonpayable",
  "type": "function"
},
{
  "inputs": [],
  "name": "paused",
  "outputs": [
    {
      "internalType": "bool",
      "name": "",
      "type": "bool"
    }
  ],
  "stateMutability": "view",
  "type": "function"
},
{
  "inputs": [
    {
      "internalType": "address",
      "name": "tokenAddr",
      "type": "address"
    }
  ],
  "name": "recoverStuckTokens",
  "outputs": [],
  "stateMutability": "nonpayable",
  "type": "function"
},
{
  "inputs": [
    {
      "internalType": "uint256",
      "name": "betId",
      "type": "uint256"
    }
  ],
  "name": "resolve",
  "outputs": [],
  "stateMutability": "nonpayable",
  "type": "function"
},
{
  "inputs": [
    {
      "internalType": "uint256",
      "name": "newFeeBps",
      "type": "uint256"
    }
  ],
  "name": "setTreasuryFee",
  "outputs": [],
  "stateMutability": "nonpayable",
  "type": "function"
},
{
  "inputs": [],
  "name": "treasury",
  "outputs": [
    {
      "internalType": "address",
      "name": "",
      "type": "address"
    }
  ],
  "stateMutability": "view",
  "type": "function"
},
{
  "inputs": [],
  "name": "treasuryFeeBps",
  "outputs": [
    {
      "internalType": "uint256",
      "name": "",
      "type": "uint256"
    }
  ],
  "stateMutability": "view",
  "type": "function"
},
{
  "inputs": [],
  "name": "unpause",
  "outputs": [],
  "stateMutability": "nonpayable",
  "type": "function"
},
{
  "inputs": [
    {
      "internalType": "uint256",
      "name": "betId",
      "type": "uint256"
    },
    {
      "internalType": "bytes32",
      "name": "outcome",
      "type": "bytes32"
    }
  ],
  "name": "vote",
  "outputs": [],
  "stateMutability": "nonpayable",
  "type": "function"
}
];
