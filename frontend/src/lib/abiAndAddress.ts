export const CONTRACT_ADDRESSES = {
  wDAG: "0xA967CE077dD5beEc5aB4019E3714F4f6af5b5c08", // Update after deployment
  feeRouter: "0x8466a63c5b7aF12F110247FD3A2140d90AACd190", // Update after deployment
  cryptoOracle: "0xdB241F81F671106E948cb06A18Cfeb02ed92ba59", // Update after deployment
  sportsOracle: "0xdb5fC9Acd81176099d3d47F1e87310007b5e19D2", // Update after deployment
  trendsOracle: "0x00C10D3D693A6812973ab23F6A8E23E6d36B7E83", // Update after deployment
  binaryFactory: "0x39344f98714558D710C3422AEe38f108f6bA1CFc", // Update after deployment
  multiFactory: "0x5e9D6779D1863F9610f1Db68f0e2618A1c348D6F", // Update after deployment
  scalarFactory: "0xC8c64D1005B99357391543b7B464D8E3F059b4f2", // Update after deployment
  tokenFactory: "0x246b2234d6254DAdE84f8D349C200404f0e058a9",
  curation: "0x10A7F89b4372060bca62dd11f406c37E0b4006f2",
};

export const ABI = {
  wDAG: [
    {
      inputs: [],
      stateMutability: "nonpayable",
      type: "constructor",
    },
    {
      inputs: [
        {
          internalType: "address",
          name: "spender",
          type: "address",
        },
        {
          internalType: "uint256",
          name: "allowance",
          type: "uint256",
        },
        {
          internalType: "uint256",
          name: "needed",
          type: "uint256",
        },
      ],
      name: "ERC20InsufficientAllowance",
      type: "error",
    },
    {
      inputs: [
        {
          internalType: "address",
          name: "sender",
          type: "address",
        },
        {
          internalType: "uint256",
          name: "balance",
          type: "uint256",
        },
        {
          internalType: "uint256",
          name: "needed",
          type: "uint256",
        },
      ],
      name: "ERC20InsufficientBalance",
      type: "error",
    },
    {
      inputs: [
        {
          internalType: "address",
          name: "approver",
          type: "address",
        },
      ],
      name: "ERC20InvalidApprover",
      type: "error",
    },
    {
      inputs: [
        {
          internalType: "address",
          name: "receiver",
          type: "address",
        },
      ],
      name: "ERC20InvalidReceiver",
      type: "error",
    },
    {
      inputs: [
        {
          internalType: "address",
          name: "sender",
          type: "address",
        },
      ],
      name: "ERC20InvalidSender",
      type: "error",
    },
    {
      inputs: [
        {
          internalType: "address",
          name: "spender",
          type: "address",
        },
      ],
      name: "ERC20InvalidSpender",
      type: "error",
    },
    {
      inputs: [
        {
          internalType: "address",
          name: "owner",
          type: "address",
        },
      ],
      name: "OwnableInvalidOwner",
      type: "error",
    },
    {
      inputs: [
        {
          internalType: "address",
          name: "account",
          type: "address",
        },
      ],
      name: "OwnableUnauthorizedAccount",
      type: "error",
    },
    {
      anonymous: false,
      inputs: [
        {
          indexed: true,
          internalType: "address",
          name: "owner",
          type: "address",
        },
        {
          indexed: true,
          internalType: "address",
          name: "spender",
          type: "address",
        },
        {
          indexed: false,
          internalType: "uint256",
          name: "value",
          type: "uint256",
        },
      ],
      name: "Approval",
      type: "event",
    },
    {
      anonymous: false,
      inputs: [
        {
          indexed: true,
          internalType: "address",
          name: "user",
          type: "address",
        },
        {
          indexed: false,
          internalType: "uint256",
          name: "amount",
          type: "uint256",
        },
      ],
      name: "Deposit",
      type: "event",
    },
    {
      anonymous: false,
      inputs: [
        {
          indexed: true,
          internalType: "address",
          name: "minter",
          type: "address",
        },
      ],
      name: "MinterAdded",
      type: "event",
    },
    {
      anonymous: false,
      inputs: [
        {
          indexed: true,
          internalType: "address",
          name: "minter",
          type: "address",
        },
      ],
      name: "MinterRemoved",
      type: "event",
    },
    {
      anonymous: false,
      inputs: [
        {
          indexed: true,
          internalType: "address",
          name: "previousOwner",
          type: "address",
        },
        {
          indexed: true,
          internalType: "address",
          name: "newOwner",
          type: "address",
        },
      ],
      name: "OwnershipTransferred",
      type: "event",
    },
    {
      anonymous: false,
      inputs: [
        {
          indexed: true,
          internalType: "address",
          name: "from",
          type: "address",
        },
        {
          indexed: true,
          internalType: "address",
          name: "to",
          type: "address",
        },
        {
          indexed: false,
          internalType: "uint256",
          name: "value",
          type: "uint256",
        },
      ],
      name: "Transfer",
      type: "event",
    },
    {
      anonymous: false,
      inputs: [
        {
          indexed: true,
          internalType: "address",
          name: "user",
          type: "address",
        },
        {
          indexed: false,
          internalType: "uint256",
          name: "amount",
          type: "uint256",
        },
      ],
      name: "Withdrawal",
      type: "event",
    },
    {
      inputs: [
        {
          internalType: "address",
          name: "minter",
          type: "address",
        },
      ],
      name: "addMinter",
      outputs: [],
      stateMutability: "nonpayable",
      type: "function",
    },
    {
      inputs: [
        {
          internalType: "address",
          name: "owner",
          type: "address",
        },
        {
          internalType: "address",
          name: "spender",
          type: "address",
        },
      ],
      name: "allowance",
      outputs: [
        {
          internalType: "uint256",
          name: "",
          type: "uint256",
        },
      ],
      stateMutability: "view",
      type: "function",
    },
    {
      inputs: [
        {
          internalType: "address",
          name: "spender",
          type: "address",
        },
        {
          internalType: "uint256",
          name: "value",
          type: "uint256",
        },
      ],
      name: "approve",
      outputs: [
        {
          internalType: "bool",
          name: "",
          type: "bool",
        },
      ],
      stateMutability: "nonpayable",
      type: "function",
    },
    {
      inputs: [
        {
          internalType: "address",
          name: "",
          type: "address",
        },
      ],
      name: "authorizedMinters",
      outputs: [
        {
          internalType: "bool",
          name: "",
          type: "bool",
        },
      ],
      stateMutability: "view",
      type: "function",
    },
    {
      inputs: [
        {
          internalType: "address",
          name: "account",
          type: "address",
        },
      ],
      name: "balanceOf",
      outputs: [
        {
          internalType: "uint256",
          name: "",
          type: "uint256",
        },
      ],
      stateMutability: "view",
      type: "function",
    },
    {
      inputs: [
        {
          internalType: "uint256",
          name: "amount",
          type: "uint256",
        },
      ],
      name: "burn",
      outputs: [],
      stateMutability: "nonpayable",
      type: "function",
    },
    {
      inputs: [],
      name: "decimals",
      outputs: [
        {
          internalType: "uint8",
          name: "",
          type: "uint8",
        },
      ],
      stateMutability: "pure",
      type: "function",
    },
    {
      inputs: [],
      name: "deposit",
      outputs: [],
      stateMutability: "payable",
      type: "function",
    },
    {
      inputs: [
        {
          internalType: "address",
          name: "to",
          type: "address",
        },
        {
          internalType: "uint256",
          name: "amount",
          type: "uint256",
        },
      ],
      name: "emergencyWithdraw",
      outputs: [],
      stateMutability: "nonpayable",
      type: "function",
    },
    {
      inputs: [],
      name: "getNativeBalance",
      outputs: [
        {
          internalType: "uint256",
          name: "",
          type: "uint256",
        },
      ],
      stateMutability: "view",
      type: "function",
    },
    {
      inputs: [
        {
          internalType: "address",
          name: "to",
          type: "address",
        },
        {
          internalType: "uint256",
          name: "amount",
          type: "uint256",
        },
      ],
      name: "mint",
      outputs: [],
      stateMutability: "nonpayable",
      type: "function",
    },
    {
      inputs: [
        {
          internalType: "address",
          name: "to",
          type: "address",
        },
        {
          internalType: "uint256",
          name: "amount",
          type: "uint256",
        },
      ],
      name: "mintForRedemption",
      outputs: [],
      stateMutability: "nonpayable",
      type: "function",
    },
    {
      inputs: [],
      name: "name",
      outputs: [
        {
          internalType: "string",
          name: "",
          type: "string",
        },
      ],
      stateMutability: "view",
      type: "function",
    },
    {
      inputs: [],
      name: "owner",
      outputs: [
        {
          internalType: "address",
          name: "",
          type: "address",
        },
      ],
      stateMutability: "view",
      type: "function",
    },
    {
      inputs: [
        {
          internalType: "address",
          name: "minter",
          type: "address",
        },
      ],
      name: "removeMinter",
      outputs: [],
      stateMutability: "nonpayable",
      type: "function",
    },
    {
      inputs: [],
      name: "renounceOwnership",
      outputs: [],
      stateMutability: "nonpayable",
      type: "function",
    },
    {
      inputs: [],
      name: "symbol",
      outputs: [
        {
          internalType: "string",
          name: "",
          type: "string",
        },
      ],
      stateMutability: "view",
      type: "function",
    },
    {
      inputs: [],
      name: "totalSupply",
      outputs: [
        {
          internalType: "uint256",
          name: "",
          type: "uint256",
        },
      ],
      stateMutability: "view",
      type: "function",
    },
    {
      inputs: [
        {
          internalType: "address",
          name: "to",
          type: "address",
        },
        {
          internalType: "uint256",
          name: "value",
          type: "uint256",
        },
      ],
      name: "transfer",
      outputs: [
        {
          internalType: "bool",
          name: "",
          type: "bool",
        },
      ],
      stateMutability: "nonpayable",
      type: "function",
    },
    {
      inputs: [
        {
          internalType: "address",
          name: "from",
          type: "address",
        },
        {
          internalType: "address",
          name: "to",
          type: "address",
        },
        {
          internalType: "uint256",
          name: "value",
          type: "uint256",
        },
      ],
      name: "transferFrom",
      outputs: [
        {
          internalType: "bool",
          name: "",
          type: "bool",
        },
      ],
      stateMutability: "nonpayable",
      type: "function",
    },
    {
      inputs: [
        {
          internalType: "address",
          name: "newOwner",
          type: "address",
        },
      ],
      name: "transferOwnership",
      outputs: [],
      stateMutability: "nonpayable",
      type: "function",
    },
    {
      inputs: [
        {
          internalType: "uint256",
          name: "amount",
          type: "uint256",
        },
      ],
      name: "withdraw",
      outputs: [],
      stateMutability: "nonpayable",
      type: "function",
    },
    {
      stateMutability: "payable",
      type: "receive",
    },
  ],
  feeRouter: [
    {
      inputs: [
        {
          internalType: "address",
          name: "_owner",
          type: "address",
        },
      ],
      stateMutability: "nonpayable",
      type: "constructor",
    },
    {
      inputs: [],
      name: "NotOwner",
      type: "error",
    },
    {
      inputs: [],
      name: "ZeroAddress",
      type: "error",
    },
    {
      anonymous: false,
      inputs: [
        {
          indexed: true,
          internalType: "address",
          name: "market",
          type: "address",
        },
        {
          indexed: false,
          internalType: "uint256",
          name: "protocolFee",
          type: "uint256",
        },
        {
          indexed: false,
          internalType: "uint256",
          name: "creatorFee",
          type: "uint256",
        },
        {
          indexed: false,
          internalType: "uint256",
          name: "lpFee",
          type: "uint256",
        },
      ],
      name: "Accrued",
      type: "event",
    },
    {
      anonymous: false,
      inputs: [
        {
          indexed: true,
          internalType: "address",
          name: "creator",
          type: "address",
        },
        {
          indexed: false,
          internalType: "uint256",
          name: "amount",
          type: "uint256",
        },
      ],
      name: "ClaimedCreator",
      type: "event",
    },
    {
      anonymous: false,
      inputs: [
        {
          indexed: true,
          internalType: "address",
          name: "to",
          type: "address",
        },
        {
          indexed: false,
          internalType: "uint256",
          name: "amount",
          type: "uint256",
        },
      ],
      name: "ClaimedProtocol",
      type: "event",
    },
    {
      anonymous: false,
      inputs: [
        {
          indexed: true,
          internalType: "address",
          name: "market",
          type: "address",
        },
        {
          indexed: true,
          internalType: "address",
          name: "creator",
          type: "address",
        },
      ],
      name: "CreatorSet",
      type: "event",
    },
    {
      anonymous: false,
      inputs: [
        {
          indexed: true,
          internalType: "address",
          name: "market",
          type: "address",
        },
        {
          indexed: false,
          internalType: "uint256",
          name: "amount",
          type: "uint256",
        },
      ],
      name: "LPFeesAccrued",
      type: "event",
    },
    {
      inputs: [
        {
          internalType: "address",
          name: "market",
          type: "address",
        },
        {
          internalType: "uint256",
          name: "protocolFee",
          type: "uint256",
        },
        {
          internalType: "uint256",
          name: "creatorFee",
          type: "uint256",
        },
        {
          internalType: "uint256",
          name: "lpFee",
          type: "uint256",
        },
      ],
      name: "accrue",
      outputs: [],
      stateMutability: "nonpayable",
      type: "function",
    },
    {
      inputs: [
        {
          internalType: "address",
          name: "market",
          type: "address",
        },
        {
          internalType: "address",
          name: "to",
          type: "address",
        },
      ],
      name: "claimCreator",
      outputs: [
        {
          internalType: "uint256",
          name: "",
          type: "uint256",
        },
      ],
      stateMutability: "nonpayable",
      type: "function",
    },
    {
      inputs: [
        {
          internalType: "address",
          name: "to",
          type: "address",
        },
      ],
      name: "claimProtocol",
      outputs: [
        {
          internalType: "uint256",
          name: "",
          type: "uint256",
        },
      ],
      stateMutability: "nonpayable",
      type: "function",
    },
    {
      inputs: [
        {
          internalType: "address",
          name: "",
          type: "address",
        },
      ],
      name: "creatorAccrued",
      outputs: [
        {
          internalType: "uint256",
          name: "",
          type: "uint256",
        },
      ],
      stateMutability: "view",
      type: "function",
    },
    {
      inputs: [
        {
          internalType: "address",
          name: "",
          type: "address",
        },
        {
          internalType: "address",
          name: "",
          type: "address",
        },
      ],
      name: "creatorFeesByMarket",
      outputs: [
        {
          internalType: "uint256",
          name: "",
          type: "uint256",
        },
      ],
      stateMutability: "view",
      type: "function",
    },
    {
      inputs: [
        {
          internalType: "address",
          name: "",
          type: "address",
        },
      ],
      name: "creatorLifetimeFees",
      outputs: [
        {
          internalType: "uint256",
          name: "",
          type: "uint256",
        },
      ],
      stateMutability: "view",
      type: "function",
    },
    {
      inputs: [
        {
          internalType: "address",
          name: "",
          type: "address",
        },
      ],
      name: "creatorOf",
      outputs: [
        {
          internalType: "address",
          name: "",
          type: "address",
        },
      ],
      stateMutability: "view",
      type: "function",
    },
    {
      inputs: [
        {
          internalType: "address",
          name: "market",
          type: "address",
        },
      ],
      name: "getCreator",
      outputs: [
        {
          internalType: "address",
          name: "",
          type: "address",
        },
      ],
      stateMutability: "view",
      type: "function",
    },
    {
      inputs: [
        {
          internalType: "address",
          name: "creator",
          type: "address",
        },
        {
          internalType: "address",
          name: "market",
          type: "address",
        },
      ],
      name: "getCreatorFeesForMarket",
      outputs: [
        {
          internalType: "uint256",
          name: "",
          type: "uint256",
        },
      ],
      stateMutability: "view",
      type: "function",
    },
    {
      inputs: [
        {
          internalType: "address",
          name: "creator",
          type: "address",
        },
      ],
      name: "getCreatorLifetimeFees",
      outputs: [
        {
          internalType: "uint256",
          name: "",
          type: "uint256",
        },
      ],
      stateMutability: "view",
      type: "function",
    },
    {
      inputs: [
        {
          internalType: "address",
          name: "creator",
          type: "address",
        },
      ],
      name: "getCreatorStats",
      outputs: [
        {
          internalType: "uint256",
          name: "_lifetimeFees",
          type: "uint256",
        },
        {
          internalType: "uint256",
          name: "_claimableFees",
          type: "uint256",
        },
        {
          internalType: "uint256",
          name: "_totalMarkets",
          type: "uint256",
        },
      ],
      stateMutability: "view",
      type: "function",
    },
    {
      inputs: [
        {
          internalType: "address",
          name: "market",
          type: "address",
        },
      ],
      name: "getLPFeesForMarket",
      outputs: [
        {
          internalType: "uint256",
          name: "",
          type: "uint256",
        },
      ],
      stateMutability: "view",
      type: "function",
    },
    {
      inputs: [],
      name: "getLPStats",
      outputs: [
        {
          internalType: "uint256",
          name: "_totalLPFees",
          type: "uint256",
        },
        {
          internalType: "uint256",
          name: "_totalMarkets",
          type: "uint256",
        },
      ],
      stateMutability: "view",
      type: "function",
    },
    {
      inputs: [],
      name: "getProtocolStats",
      outputs: [
        {
          internalType: "uint256",
          name: "_totalAccrued",
          type: "uint256",
        },
        {
          internalType: "uint256",
          name: "_claimable",
          type: "uint256",
        },
      ],
      stateMutability: "view",
      type: "function",
    },
    {
      inputs: [],
      name: "getTotalLPFees",
      outputs: [
        {
          internalType: "uint256",
          name: "",
          type: "uint256",
        },
      ],
      stateMutability: "view",
      type: "function",
    },
    {
      inputs: [
        {
          internalType: "address",
          name: "",
          type: "address",
        },
      ],
      name: "lpAccrued",
      outputs: [
        {
          internalType: "uint256",
          name: "",
          type: "uint256",
        },
      ],
      stateMutability: "view",
      type: "function",
    },
    {
      inputs: [],
      name: "owner",
      outputs: [
        {
          internalType: "address",
          name: "",
          type: "address",
        },
      ],
      stateMutability: "view",
      type: "function",
    },
    {
      inputs: [
        {
          internalType: "address",
          name: "",
          type: "address",
        },
      ],
      name: "protocolAccrued",
      outputs: [
        {
          internalType: "uint256",
          name: "",
          type: "uint256",
        },
      ],
      stateMutability: "view",
      type: "function",
    },
    {
      inputs: [
        {
          internalType: "address",
          name: "market",
          type: "address",
        },
        {
          internalType: "address",
          name: "creator",
          type: "address",
        },
      ],
      name: "setCreator",
      outputs: [],
      stateMutability: "nonpayable",
      type: "function",
    },
    {
      inputs: [],
      name: "totalLPFees",
      outputs: [
        {
          internalType: "uint256",
          name: "",
          type: "uint256",
        },
      ],
      stateMutability: "view",
      type: "function",
    },
  ],
  cryptoOracle: [
    {
      inputs: [
        {
          internalType: "address",
          name: "_collateral",
          type: "address",
        },
        {
          internalType: "uint256",
          name: "_reporterBond",
          type: "uint256",
        },
        {
          internalType: "uint256",
          name: "_disputerBond",
          type: "uint256",
        },
        {
          internalType: "uint256",
          name: "_liveness",
          type: "uint256",
        },
        {
          internalType: "address",
          name: "_council",
          type: "address",
        },
      ],
      stateMutability: "nonpayable",
      type: "constructor",
    },
    {
      inputs: [],
      name: "BadState",
      type: "error",
    },
    {
      inputs: [],
      name: "Exists",
      type: "error",
    },
    {
      inputs: [],
      name: "Liveness",
      type: "error",
    },
    {
      inputs: [],
      name: "NotAuthorized",
      type: "error",
    },
    {
      inputs: [],
      name: "NotCouncil",
      type: "error",
    },
    {
      inputs: [],
      name: "NotWhitelisted",
      type: "error",
    },
    {
      inputs: [],
      name: "TooEarly",
      type: "error",
    },
    {
      anonymous: false,
      inputs: [
        {
          indexed: true,
          internalType: "uint256",
          name: "marketId",
          type: "uint256",
        },
        {
          indexed: false,
          internalType: "string",
          name: "evidenceCID",
          type: "string",
        },
      ],
      name: "Disputed",
      type: "event",
    },
    {
      anonymous: false,
      inputs: [
        {
          indexed: false,
          internalType: "address",
          name: "factory",
          type: "address",
        },
        {
          indexed: false,
          internalType: "bool",
          name: "enabled",
          type: "bool",
        },
      ],
      name: "FactoryAuthorized",
      type: "event",
    },
    {
      anonymous: false,
      inputs: [
        {
          indexed: true,
          internalType: "uint256",
          name: "marketId",
          type: "uint256",
        },
        {
          indexed: false,
          internalType: "bytes",
          name: "value",
          type: "bytes",
        },
        {
          indexed: false,
          internalType: "enum IOracleAdapter.Status",
          name: "status",
          type: "uint8",
        },
      ],
      name: "Finalized",
      type: "event",
    },
    {
      anonymous: false,
      inputs: [
        {
          indexed: true,
          internalType: "uint256",
          name: "marketId",
          type: "uint256",
        },
        {
          indexed: false,
          internalType: "bytes",
          name: "payload",
          type: "bytes",
        },
        {
          indexed: false,
          internalType: "string",
          name: "evidenceCID",
          type: "string",
        },
      ],
      name: "Proposed",
      type: "event",
    },
    {
      anonymous: false,
      inputs: [
        {
          indexed: false,
          internalType: "address",
          name: "reporter",
          type: "address",
        },
        {
          indexed: false,
          internalType: "bool",
          name: "enabled",
          type: "bool",
        },
      ],
      name: "ReporterSet",
      type: "event",
    },
    {
      inputs: [
        {
          internalType: "uint256",
          name: "marketId",
          type: "uint256",
        },
        {
          internalType: "bytes",
          name: "value",
          type: "bytes",
        },
        {
          internalType: "bool",
          name: "reporterWins",
          type: "bool",
        },
      ],
      name: "arbitrate",
      outputs: [],
      stateMutability: "nonpayable",
      type: "function",
    },
    {
      inputs: [
        {
          internalType: "address",
          name: "",
          type: "address",
        },
      ],
      name: "authorizedFactories",
      outputs: [
        {
          internalType: "bool",
          name: "",
          type: "bool",
        },
      ],
      stateMutability: "view",
      type: "function",
    },
    {
      inputs: [],
      name: "collateral",
      outputs: [
        {
          internalType: "contract IERC20",
          name: "",
          type: "address",
        },
      ],
      stateMutability: "view",
      type: "function",
    },
    {
      inputs: [],
      name: "council",
      outputs: [
        {
          internalType: "address",
          name: "",
          type: "address",
        },
      ],
      stateMutability: "view",
      type: "function",
    },
    {
      inputs: [
        {
          internalType: "uint256",
          name: "marketId",
          type: "uint256",
        },
        {
          internalType: "string",
          name: "evidenceCID",
          type: "string",
        },
      ],
      name: "dispute",
      outputs: [],
      stateMutability: "payable",
      type: "function",
    },
    {
      inputs: [],
      name: "disputerBond",
      outputs: [
        {
          internalType: "uint256",
          name: "",
          type: "uint256",
        },
      ],
      stateMutability: "view",
      type: "function",
    },
    {
      inputs: [
        {
          internalType: "uint256",
          name: "marketId",
          type: "uint256",
        },
      ],
      name: "finalize",
      outputs: [],
      stateMutability: "nonpayable",
      type: "function",
    },
    {
      inputs: [
        {
          internalType: "uint256",
          name: "marketId",
          type: "uint256",
        },
      ],
      name: "getProposal",
      outputs: [
        {
          internalType: "enum IOracleAdapter.Status",
          name: "status",
          type: "uint8",
        },
        {
          internalType: "address",
          name: "reporter",
          type: "address",
        },
        {
          internalType: "address",
          name: "disputer",
          type: "address",
        },
        {
          internalType: "uint256",
          name: "timestamp",
          type: "uint256",
        },
        {
          internalType: "uint256",
          name: "reporterBondPaid",
          type: "uint256",
        },
        {
          internalType: "uint256",
          name: "disputerBondPaid",
          type: "uint256",
        },
        {
          internalType: "string",
          name: "evidenceCID",
          type: "string",
        },
      ],
      stateMutability: "view",
      type: "function",
    },
    {
      inputs: [
        {
          internalType: "uint256",
          name: "marketId",
          type: "uint256",
        },
      ],
      name: "getResult",
      outputs: [
        {
          internalType: "enum IOracleAdapter.Status",
          name: "",
          type: "uint8",
        },
        {
          internalType: "bytes",
          name: "value",
          type: "bytes",
        },
      ],
      stateMutability: "view",
      type: "function",
    },
    {
      inputs: [
        {
          internalType: "uint256",
          name: "marketId",
          type: "uint256",
        },
      ],
      name: "invalidate",
      outputs: [],
      stateMutability: "nonpayable",
      type: "function",
    },
    {
      inputs: [
        {
          internalType: "address",
          name: "",
          type: "address",
        },
      ],
      name: "isReporter",
      outputs: [
        {
          internalType: "bool",
          name: "",
          type: "bool",
        },
      ],
      stateMutability: "view",
      type: "function",
    },
    {
      inputs: [],
      name: "liveness",
      outputs: [
        {
          internalType: "uint256",
          name: "",
          type: "uint256",
        },
      ],
      stateMutability: "view",
      type: "function",
    },
    {
      inputs: [
        {
          internalType: "uint256",
          name: "",
          type: "uint256",
        },
      ],
      name: "marketAddress",
      outputs: [
        {
          internalType: "address",
          name: "",
          type: "address",
        },
      ],
      stateMutability: "view",
      type: "function",
    },
    {
      inputs: [
        {
          internalType: "uint256",
          name: "",
          type: "uint256",
        },
      ],
      name: "proposals",
      outputs: [
        {
          internalType: "enum IOracleAdapter.Status",
          name: "status",
          type: "uint8",
        },
        {
          internalType: "address",
          name: "reporter",
          type: "address",
        },
        {
          internalType: "address",
          name: "disputer",
          type: "address",
        },
        {
          internalType: "bytes",
          name: "payload",
          type: "bytes",
        },
        {
          internalType: "string",
          name: "evidenceCID",
          type: "string",
        },
        {
          internalType: "uint256",
          name: "timestamp",
          type: "uint256",
        },
        {
          internalType: "uint256",
          name: "reporterBondPaid",
          type: "uint256",
        },
        {
          internalType: "uint256",
          name: "disputerBondPaid",
          type: "uint256",
        },
        {
          internalType: "bytes",
          name: "finalValue",
          type: "bytes",
        },
      ],
      stateMutability: "view",
      type: "function",
    },
    {
      inputs: [
        {
          internalType: "uint256",
          name: "marketId",
          type: "uint256",
        },
        {
          internalType: "bytes",
          name: "payload",
          type: "bytes",
        },
        {
          internalType: "string",
          name: "evidenceCID",
          type: "string",
        },
      ],
      name: "proposeResult",
      outputs: [],
      stateMutability: "payable",
      type: "function",
    },
    {
      inputs: [],
      name: "reporterBond",
      outputs: [
        {
          internalType: "uint256",
          name: "",
          type: "uint256",
        },
      ],
      stateMutability: "view",
      type: "function",
    },
    {
      inputs: [
        {
          internalType: "address",
          name: "factory",
          type: "address",
        },
        {
          internalType: "bool",
          name: "enabled",
          type: "bool",
        },
      ],
      name: "setFactory",
      outputs: [],
      stateMutability: "nonpayable",
      type: "function",
    },
    {
      inputs: [
        {
          internalType: "uint256",
          name: "marketId",
          type: "uint256",
        },
        {
          internalType: "address",
          name: "market",
          type: "address",
        },
      ],
      name: "setMarketAddress",
      outputs: [],
      stateMutability: "nonpayable",
      type: "function",
    },
    {
      inputs: [
        {
          internalType: "address",
          name: "r",
          type: "address",
        },
        {
          internalType: "bool",
          name: "en",
          type: "bool",
        },
      ],
      name: "setReporter",
      outputs: [],
      stateMutability: "nonpayable",
      type: "function",
    },
  ],
  sportsOracle: [
    {
      inputs: [
        {
          internalType: "address",
          name: "_collateral",
          type: "address",
        },
        {
          internalType: "uint256",
          name: "_reporterBond",
          type: "uint256",
        },
        {
          internalType: "uint256",
          name: "_disputerBond",
          type: "uint256",
        },
        {
          internalType: "uint256",
          name: "_liveness",
          type: "uint256",
        },
        {
          internalType: "address",
          name: "_council",
          type: "address",
        },
      ],
      stateMutability: "nonpayable",
      type: "constructor",
    },
    {
      inputs: [],
      name: "BadState",
      type: "error",
    },
    {
      inputs: [],
      name: "Exists",
      type: "error",
    },
    {
      inputs: [],
      name: "Liveness",
      type: "error",
    },
    {
      inputs: [],
      name: "NotAuthorized",
      type: "error",
    },
    {
      inputs: [],
      name: "NotCouncil",
      type: "error",
    },
    {
      inputs: [],
      name: "NotWhitelisted",
      type: "error",
    },
    {
      inputs: [],
      name: "TooEarly",
      type: "error",
    },
    {
      anonymous: false,
      inputs: [
        {
          indexed: true,
          internalType: "uint256",
          name: "marketId",
          type: "uint256",
        },
        {
          indexed: false,
          internalType: "string",
          name: "evidenceCID",
          type: "string",
        },
      ],
      name: "Disputed",
      type: "event",
    },
    {
      anonymous: false,
      inputs: [
        {
          indexed: false,
          internalType: "address",
          name: "factory",
          type: "address",
        },
        {
          indexed: false,
          internalType: "bool",
          name: "enabled",
          type: "bool",
        },
      ],
      name: "FactoryAuthorized",
      type: "event",
    },
    {
      anonymous: false,
      inputs: [
        {
          indexed: true,
          internalType: "uint256",
          name: "marketId",
          type: "uint256",
        },
        {
          indexed: false,
          internalType: "bytes",
          name: "value",
          type: "bytes",
        },
        {
          indexed: false,
          internalType: "enum IOracleAdapter.Status",
          name: "status",
          type: "uint8",
        },
      ],
      name: "Finalized",
      type: "event",
    },
    {
      anonymous: false,
      inputs: [
        {
          indexed: true,
          internalType: "uint256",
          name: "marketId",
          type: "uint256",
        },
        {
          indexed: false,
          internalType: "bytes",
          name: "payload",
          type: "bytes",
        },
        {
          indexed: false,
          internalType: "string",
          name: "evidenceCID",
          type: "string",
        },
      ],
      name: "Proposed",
      type: "event",
    },
    {
      anonymous: false,
      inputs: [
        {
          indexed: false,
          internalType: "address",
          name: "reporter",
          type: "address",
        },
        {
          indexed: false,
          internalType: "bool",
          name: "enabled",
          type: "bool",
        },
      ],
      name: "ReporterSet",
      type: "event",
    },
    {
      inputs: [
        {
          internalType: "uint256",
          name: "marketId",
          type: "uint256",
        },
        {
          internalType: "uint8",
          name: "outcome",
          type: "uint8",
        },
        {
          internalType: "bool",
          name: "reporterWins",
          type: "bool",
        },
      ],
      name: "arbitrate",
      outputs: [],
      stateMutability: "nonpayable",
      type: "function",
    },
    {
      inputs: [
        {
          internalType: "address",
          name: "",
          type: "address",
        },
      ],
      name: "authorizedFactories",
      outputs: [
        {
          internalType: "bool",
          name: "",
          type: "bool",
        },
      ],
      stateMutability: "view",
      type: "function",
    },
    {
      inputs: [],
      name: "collateral",
      outputs: [
        {
          internalType: "contract IERC20",
          name: "",
          type: "address",
        },
      ],
      stateMutability: "view",
      type: "function",
    },
    {
      inputs: [],
      name: "council",
      outputs: [
        {
          internalType: "address",
          name: "",
          type: "address",
        },
      ],
      stateMutability: "view",
      type: "function",
    },
    {
      inputs: [
        {
          internalType: "uint256",
          name: "marketId",
          type: "uint256",
        },
        {
          internalType: "string",
          name: "evidenceCID",
          type: "string",
        },
      ],
      name: "dispute",
      outputs: [],
      stateMutability: "payable",
      type: "function",
    },
    {
      inputs: [],
      name: "disputerBond",
      outputs: [
        {
          internalType: "uint256",
          name: "",
          type: "uint256",
        },
      ],
      stateMutability: "view",
      type: "function",
    },
    {
      inputs: [
        {
          internalType: "uint256",
          name: "marketId",
          type: "uint256",
        },
      ],
      name: "finalize",
      outputs: [],
      stateMutability: "nonpayable",
      type: "function",
    },
    {
      inputs: [
        {
          internalType: "uint256",
          name: "marketId",
          type: "uint256",
        },
      ],
      name: "getResult",
      outputs: [
        {
          internalType: "enum IOracleAdapter.Status",
          name: "",
          type: "uint8",
        },
        {
          internalType: "bytes",
          name: "value",
          type: "bytes",
        },
      ],
      stateMutability: "view",
      type: "function",
    },
    {
      inputs: [
        {
          internalType: "uint256",
          name: "marketId",
          type: "uint256",
        },
      ],
      name: "invalidate",
      outputs: [],
      stateMutability: "nonpayable",
      type: "function",
    },
    {
      inputs: [
        {
          internalType: "address",
          name: "",
          type: "address",
        },
      ],
      name: "isReporter",
      outputs: [
        {
          internalType: "bool",
          name: "",
          type: "bool",
        },
      ],
      stateMutability: "view",
      type: "function",
    },
    {
      inputs: [],
      name: "liveness",
      outputs: [
        {
          internalType: "uint256",
          name: "",
          type: "uint256",
        },
      ],
      stateMutability: "view",
      type: "function",
    },
    {
      inputs: [
        {
          internalType: "uint256",
          name: "",
          type: "uint256",
        },
      ],
      name: "marketAddress",
      outputs: [
        {
          internalType: "address",
          name: "",
          type: "address",
        },
      ],
      stateMutability: "view",
      type: "function",
    },
    {
      inputs: [
        {
          internalType: "uint256",
          name: "",
          type: "uint256",
        },
      ],
      name: "proposals",
      outputs: [
        {
          internalType: "enum IOracleAdapter.Status",
          name: "status",
          type: "uint8",
        },
        {
          internalType: "address",
          name: "reporter",
          type: "address",
        },
        {
          internalType: "address",
          name: "disputer",
          type: "address",
        },
        {
          internalType: "uint8",
          name: "proposedOutcome",
          type: "uint8",
        },
        {
          internalType: "string",
          name: "evidenceCID",
          type: "string",
        },
        {
          internalType: "uint256",
          name: "timestamp",
          type: "uint256",
        },
        {
          internalType: "uint256",
          name: "reporterBondPaid",
          type: "uint256",
        },
        {
          internalType: "uint256",
          name: "disputerBondPaid",
          type: "uint256",
        },
        {
          internalType: "uint8",
          name: "finalOutcome",
          type: "uint8",
        },
      ],
      stateMutability: "view",
      type: "function",
    },
    {
      inputs: [
        {
          internalType: "uint256",
          name: "marketId",
          type: "uint256",
        },
        {
          internalType: "bytes",
          name: "payload",
          type: "bytes",
        },
        {
          internalType: "string",
          name: "evidenceCID",
          type: "string",
        },
      ],
      name: "proposeResult",
      outputs: [],
      stateMutability: "payable",
      type: "function",
    },
    {
      inputs: [],
      name: "reporterBond",
      outputs: [
        {
          internalType: "uint256",
          name: "",
          type: "uint256",
        },
      ],
      stateMutability: "view",
      type: "function",
    },
    {
      inputs: [
        {
          internalType: "address",
          name: "factory",
          type: "address",
        },
        {
          internalType: "bool",
          name: "enabled",
          type: "bool",
        },
      ],
      name: "setFactory",
      outputs: [],
      stateMutability: "nonpayable",
      type: "function",
    },
    {
      inputs: [
        {
          internalType: "uint256",
          name: "marketId",
          type: "uint256",
        },
        {
          internalType: "address",
          name: "market",
          type: "address",
        },
      ],
      name: "setMarketAddress",
      outputs: [],
      stateMutability: "nonpayable",
      type: "function",
    },
    {
      inputs: [
        {
          internalType: "address",
          name: "r",
          type: "address",
        },
        {
          internalType: "bool",
          name: "en",
          type: "bool",
        },
      ],
      name: "setReporter",
      outputs: [],
      stateMutability: "nonpayable",
      type: "function",
    },
  ],
  trendsOracle: [
    {
      inputs: [
        {
          internalType: "address",
          name: "_collateral",
          type: "address",
        },
        {
          internalType: "uint256",
          name: "_reporterBond",
          type: "uint256",
        },
        {
          internalType: "uint256",
          name: "_disputerBond",
          type: "uint256",
        },
        {
          internalType: "uint256",
          name: "_liveness",
          type: "uint256",
        },
        {
          internalType: "address",
          name: "_council",
          type: "address",
        },
      ],
      stateMutability: "nonpayable",
      type: "constructor",
    },
    {
      inputs: [],
      name: "BadState",
      type: "error",
    },
    {
      inputs: [],
      name: "Exists",
      type: "error",
    },
    {
      inputs: [],
      name: "Liveness",
      type: "error",
    },
    {
      inputs: [],
      name: "NotAuthorized",
      type: "error",
    },
    {
      inputs: [],
      name: "NotCouncil",
      type: "error",
    },
    {
      inputs: [],
      name: "NotWhitelisted",
      type: "error",
    },
    {
      inputs: [],
      name: "TooEarly",
      type: "error",
    },
    {
      anonymous: false,
      inputs: [
        {
          indexed: true,
          internalType: "uint256",
          name: "marketId",
          type: "uint256",
        },
        {
          indexed: false,
          internalType: "string",
          name: "evidenceCID",
          type: "string",
        },
      ],
      name: "Disputed",
      type: "event",
    },
    {
      anonymous: false,
      inputs: [
        {
          indexed: false,
          internalType: "address",
          name: "factory",
          type: "address",
        },
        {
          indexed: false,
          internalType: "bool",
          name: "enabled",
          type: "bool",
        },
      ],
      name: "FactoryAuthorized",
      type: "event",
    },
    {
      anonymous: false,
      inputs: [
        {
          indexed: true,
          internalType: "uint256",
          name: "marketId",
          type: "uint256",
        },
        {
          indexed: false,
          internalType: "bytes",
          name: "value",
          type: "bytes",
        },
        {
          indexed: false,
          internalType: "enum IOracleAdapter.Status",
          name: "status",
          type: "uint8",
        },
      ],
      name: "Finalized",
      type: "event",
    },
    {
      anonymous: false,
      inputs: [
        {
          indexed: true,
          internalType: "uint256",
          name: "marketId",
          type: "uint256",
        },
        {
          indexed: false,
          internalType: "bytes",
          name: "payload",
          type: "bytes",
        },
        {
          indexed: false,
          internalType: "string",
          name: "evidenceCID",
          type: "string",
        },
      ],
      name: "Proposed",
      type: "event",
    },
    {
      anonymous: false,
      inputs: [
        {
          indexed: false,
          internalType: "address",
          name: "reporter",
          type: "address",
        },
        {
          indexed: false,
          internalType: "bool",
          name: "enabled",
          type: "bool",
        },
      ],
      name: "ReporterSet",
      type: "event",
    },
    {
      inputs: [
        {
          internalType: "uint256",
          name: "marketId",
          type: "uint256",
        },
        {
          internalType: "uint8",
          name: "outcome",
          type: "uint8",
        },
        {
          internalType: "bool",
          name: "reporterWins",
          type: "bool",
        },
      ],
      name: "arbitrate",
      outputs: [],
      stateMutability: "nonpayable",
      type: "function",
    },
    {
      inputs: [
        {
          internalType: "address",
          name: "",
          type: "address",
        },
      ],
      name: "authorizedFactories",
      outputs: [
        {
          internalType: "bool",
          name: "",
          type: "bool",
        },
      ],
      stateMutability: "view",
      type: "function",
    },
    {
      inputs: [],
      name: "collateral",
      outputs: [
        {
          internalType: "contract IERC20",
          name: "",
          type: "address",
        },
      ],
      stateMutability: "view",
      type: "function",
    },
    {
      inputs: [],
      name: "council",
      outputs: [
        {
          internalType: "address",
          name: "",
          type: "address",
        },
      ],
      stateMutability: "view",
      type: "function",
    },
    {
      inputs: [
        {
          internalType: "uint256",
          name: "marketId",
          type: "uint256",
        },
        {
          internalType: "string",
          name: "evidenceCID",
          type: "string",
        },
      ],
      name: "dispute",
      outputs: [],
      stateMutability: "payable",
      type: "function",
    },
    {
      inputs: [],
      name: "disputerBond",
      outputs: [
        {
          internalType: "uint256",
          name: "",
          type: "uint256",
        },
      ],
      stateMutability: "view",
      type: "function",
    },
    {
      inputs: [
        {
          internalType: "uint256",
          name: "marketId",
          type: "uint256",
        },
      ],
      name: "finalize",
      outputs: [],
      stateMutability: "nonpayable",
      type: "function",
    },
    {
      inputs: [
        {
          internalType: "uint256",
          name: "marketId",
          type: "uint256",
        },
      ],
      name: "getResult",
      outputs: [
        {
          internalType: "enum IOracleAdapter.Status",
          name: "",
          type: "uint8",
        },
        {
          internalType: "bytes",
          name: "value",
          type: "bytes",
        },
      ],
      stateMutability: "view",
      type: "function",
    },
    {
      inputs: [
        {
          internalType: "uint256",
          name: "marketId",
          type: "uint256",
        },
      ],
      name: "invalidate",
      outputs: [],
      stateMutability: "nonpayable",
      type: "function",
    },
    {
      inputs: [
        {
          internalType: "address",
          name: "",
          type: "address",
        },
      ],
      name: "isReporter",
      outputs: [
        {
          internalType: "bool",
          name: "",
          type: "bool",
        },
      ],
      stateMutability: "view",
      type: "function",
    },
    {
      inputs: [],
      name: "liveness",
      outputs: [
        {
          internalType: "uint256",
          name: "",
          type: "uint256",
        },
      ],
      stateMutability: "view",
      type: "function",
    },
    {
      inputs: [
        {
          internalType: "uint256",
          name: "",
          type: "uint256",
        },
      ],
      name: "marketAddress",
      outputs: [
        {
          internalType: "address",
          name: "",
          type: "address",
        },
      ],
      stateMutability: "view",
      type: "function",
    },
    {
      inputs: [
        {
          internalType: "uint256",
          name: "",
          type: "uint256",
        },
      ],
      name: "proposals",
      outputs: [
        {
          internalType: "enum IOracleAdapter.Status",
          name: "status",
          type: "uint8",
        },
        {
          internalType: "address",
          name: "reporter",
          type: "address",
        },
        {
          internalType: "address",
          name: "disputer",
          type: "address",
        },
        {
          internalType: "uint8",
          name: "proposedOutcome",
          type: "uint8",
        },
        {
          internalType: "string",
          name: "evidenceCID",
          type: "string",
        },
        {
          internalType: "uint256",
          name: "timestamp",
          type: "uint256",
        },
        {
          internalType: "uint256",
          name: "reporterBondPaid",
          type: "uint256",
        },
        {
          internalType: "uint256",
          name: "disputerBondPaid",
          type: "uint256",
        },
        {
          internalType: "uint8",
          name: "finalOutcome",
          type: "uint8",
        },
      ],
      stateMutability: "view",
      type: "function",
    },
    {
      inputs: [
        {
          internalType: "uint256",
          name: "marketId",
          type: "uint256",
        },
        {
          internalType: "bytes",
          name: "payload",
          type: "bytes",
        },
        {
          internalType: "string",
          name: "evidenceCID",
          type: "string",
        },
      ],
      name: "proposeResult",
      outputs: [],
      stateMutability: "payable",
      type: "function",
    },
    {
      inputs: [],
      name: "reporterBond",
      outputs: [
        {
          internalType: "uint256",
          name: "",
          type: "uint256",
        },
      ],
      stateMutability: "view",
      type: "function",
    },
    {
      inputs: [
        {
          internalType: "address",
          name: "factory",
          type: "address",
        },
        {
          internalType: "bool",
          name: "enabled",
          type: "bool",
        },
      ],
      name: "setFactory",
      outputs: [],
      stateMutability: "nonpayable",
      type: "function",
    },
    {
      inputs: [
        {
          internalType: "uint256",
          name: "marketId",
          type: "uint256",
        },
        {
          internalType: "address",
          name: "market",
          type: "address",
        },
      ],
      name: "setMarketAddress",
      outputs: [],
      stateMutability: "nonpayable",
      type: "function",
    },
    {
      inputs: [
        {
          internalType: "address",
          name: "r",
          type: "address",
        },
        {
          internalType: "bool",
          name: "en",
          type: "bool",
        },
      ],
      name: "setReporter",
      outputs: [],
      stateMutability: "nonpayable",
      type: "function",
    },
  ],
  binaryFactory: [
    {
      inputs: [],
      name: "InvalidTimeRange",
      type: "error",
    },
    {
      inputs: [],
      name: "ZeroAddress",
      type: "error",
    },
    {
      anonymous: false,
      inputs: [
        {
          indexed: false,
          internalType: "address",
          name: "market",
          type: "address",
        },
        {
          indexed: false,
          internalType: "uint256",
          name: "marketId",
          type: "uint256",
        },
      ],
      name: "MarketCreated",
      type: "event",
    },
    {
      inputs: [
        {
          internalType: "uint256",
          name: "",
          type: "uint256",
        },
      ],
      name: "allMarkets",
      outputs: [
        {
          internalType: "address",
          name: "",
          type: "address",
        },
      ],
      stateMutability: "view",
      type: "function",
    },
    {
      inputs: [
        {
          internalType: "address",
          name: "collateral",
          type: "address",
        },
        {
          internalType: "string",
          name: "question",
          type: "string",
        },
        {
          internalType: "string",
          name: "metadataURI",
          type: "string",
        },
        {
          internalType: "address",
          name: "creator",
          type: "address",
        },
        {
          internalType: "address",
          name: "oracleAdapter",
          type: "address",
        },
        {
          internalType: "address",
          name: "feeRouter",
          type: "address",
        },
        {
          internalType: "address",
          name: "tokenFactory",
          type: "address",
        },
        {
          internalType: "bytes32",
          name: "marketKey",
          type: "bytes32",
        },
        {
          internalType: "uint256",
          name: "feeBps",
          type: "uint256",
        },
        {
          internalType: "uint256",
          name: "startTime",
          type: "uint256",
        },
        {
          internalType: "uint256",
          name: "endTime",
          type: "uint256",
        },
        {
          internalType: "uint256",
          name: "resolutionDeadline",
          type: "uint256",
        },
      ],
      name: "createBinary",
      outputs: [
        {
          internalType: "address",
          name: "market",
          type: "address",
        },
      ],
      stateMutability: "payable",
      type: "function",
    },
    {
      inputs: [],
      name: "getAllMarkets",
      outputs: [
        {
          internalType: "address[]",
          name: "",
          type: "address[]",
        },
      ],
      stateMutability: "view",
      type: "function",
    },
    {
      inputs: [],
      name: "getMarketCount",
      outputs: [
        {
          internalType: "uint256",
          name: "",
          type: "uint256",
        },
      ],
      stateMutability: "view",
      type: "function",
    },
    {
      inputs: [
        {
          internalType: "uint8",
          name: "status",
          type: "uint8",
        },
      ],
      name: "getMarketsByStatus",
      outputs: [
        {
          internalType: "address[]",
          name: "",
          type: "address[]",
        },
      ],
      stateMutability: "view",
      type: "function",
    },
    {
      inputs: [
        {
          internalType: "uint8",
          name: "status",
          type: "uint8",
        },
        {
          internalType: "uint256",
          name: "offset",
          type: "uint256",
        },
        {
          internalType: "uint256",
          name: "limit",
          type: "uint256",
        },
      ],
      name: "getMarketsByStatusPaged",
      outputs: [
        {
          internalType: "address[]",
          name: "",
          type: "address[]",
        },
      ],
      stateMutability: "view",
      type: "function",
    },
    {
      inputs: [
        {
          internalType: "address",
          name: "",
          type: "address",
        },
      ],
      name: "idOf",
      outputs: [
        {
          internalType: "uint256",
          name: "",
          type: "uint256",
        },
      ],
      stateMutability: "view",
      type: "function",
    },
    {
      inputs: [],
      name: "marketCount",
      outputs: [
        {
          internalType: "uint256",
          name: "",
          type: "uint256",
        },
      ],
      stateMutability: "view",
      type: "function",
    },
    {
      inputs: [
        {
          internalType: "uint256",
          name: "",
          type: "uint256",
        },
      ],
      name: "marketOf",
      outputs: [
        {
          internalType: "address",
          name: "",
          type: "address",
        },
      ],
      stateMutability: "view",
      type: "function",
    },
  ],
  multiFactory: [
    {
      inputs: [],
      name: "InvalidTimeRange",
      type: "error",
    },
    {
      inputs: [],
      name: "ZeroAddress",
      type: "error",
    },
    {
      anonymous: false,
      inputs: [
        {
          indexed: false,
          internalType: "address",
          name: "market",
          type: "address",
        },
        {
          indexed: false,
          internalType: "uint256",
          name: "marketId",
          type: "uint256",
        },
      ],
      name: "MarketCreated",
      type: "event",
    },
    {
      inputs: [
        {
          internalType: "uint256",
          name: "",
          type: "uint256",
        },
      ],
      name: "allMarkets",
      outputs: [
        {
          internalType: "address",
          name: "",
          type: "address",
        },
      ],
      stateMutability: "view",
      type: "function",
    },
    {
      inputs: [
        {
          internalType: "address",
          name: "collateral",
          type: "address",
        },
        {
          internalType: "string",
          name: "question",
          type: "string",
        },
        {
          internalType: "string",
          name: "metadataURI",
          type: "string",
        },
        {
          internalType: "address",
          name: "creator",
          type: "address",
        },
        {
          internalType: "address",
          name: "oracleAdapter",
          type: "address",
        },
        {
          internalType: "address",
          name: "feeRouter",
          type: "address",
        },
        {
          internalType: "address",
          name: "tokenFactory",
          type: "address",
        },
        {
          internalType: "bytes32",
          name: "marketKey",
          type: "bytes32",
        },
        {
          internalType: "string[]",
          name: "outcomes",
          type: "string[]",
        },
        {
          internalType: "uint256",
          name: "feeBps",
          type: "uint256",
        },
        {
          internalType: "uint256",
          name: "startTime",
          type: "uint256",
        },
        {
          internalType: "uint256",
          name: "endTime",
          type: "uint256",
        },
        {
          internalType: "uint256",
          name: "resolutionDeadline",
          type: "uint256",
        },
      ],
      name: "createMulti",
      outputs: [
        {
          internalType: "address",
          name: "market",
          type: "address",
        },
      ],
      stateMutability: "payable",
      type: "function",
    },
    {
      inputs: [],
      name: "getAllMarkets",
      outputs: [
        {
          internalType: "address[]",
          name: "",
          type: "address[]",
        },
      ],
      stateMutability: "view",
      type: "function",
    },
    {
      inputs: [],
      name: "getMarketCount",
      outputs: [
        {
          internalType: "uint256",
          name: "",
          type: "uint256",
        },
      ],
      stateMutability: "view",
      type: "function",
    },
    {
      inputs: [
        {
          internalType: "uint8",
          name: "status",
          type: "uint8",
        },
      ],
      name: "getMarketsByStatus",
      outputs: [
        {
          internalType: "address[]",
          name: "",
          type: "address[]",
        },
      ],
      stateMutability: "view",
      type: "function",
    },
    {
      inputs: [
        {
          internalType: "address",
          name: "",
          type: "address",
        },
      ],
      name: "idOf",
      outputs: [
        {
          internalType: "uint256",
          name: "",
          type: "uint256",
        },
      ],
      stateMutability: "view",
      type: "function",
    },
    {
      inputs: [],
      name: "marketCount",
      outputs: [
        {
          internalType: "uint256",
          name: "",
          type: "uint256",
        },
      ],
      stateMutability: "view",
      type: "function",
    },
    {
      inputs: [
        {
          internalType: "uint256",
          name: "",
          type: "uint256",
        },
      ],
      name: "marketOf",
      outputs: [
        {
          internalType: "address",
          name: "",
          type: "address",
        },
      ],
      stateMutability: "view",
      type: "function",
    },
  ],
  scalarFactory: [
    {
      inputs: [],
      name: "InvalidTimeRange",
      type: "error",
    },
    {
      inputs: [],
      name: "ZeroAddress",
      type: "error",
    },
    {
      anonymous: false,
      inputs: [
        {
          indexed: false,
          internalType: "address",
          name: "market",
          type: "address",
        },
        {
          indexed: false,
          internalType: "uint256",
          name: "marketId",
          type: "uint256",
        },
      ],
      name: "MarketCreated",
      type: "event",
    },
    {
      inputs: [
        {
          internalType: "uint256",
          name: "",
          type: "uint256",
        },
      ],
      name: "allMarkets",
      outputs: [
        {
          internalType: "address",
          name: "",
          type: "address",
        },
      ],
      stateMutability: "view",
      type: "function",
    },
    {
      inputs: [
        {
          internalType: "address",
          name: "collateral",
          type: "address",
        },
        {
          internalType: "string",
          name: "question",
          type: "string",
        },
        {
          internalType: "string",
          name: "metadataURI",
          type: "string",
        },
        {
          internalType: "address",
          name: "creator",
          type: "address",
        },
        {
          internalType: "address",
          name: "oracleAdapter",
          type: "address",
        },
        {
          internalType: "address",
          name: "feeRouter",
          type: "address",
        },
        {
          internalType: "address",
          name: "tokenFactory",
          type: "address",
        },
        {
          internalType: "bytes32",
          name: "marketKey",
          type: "bytes32",
        },
        {
          internalType: "uint256",
          name: "feeBps",
          type: "uint256",
        },
        {
          internalType: "uint256",
          name: "startTime",
          type: "uint256",
        },
        {
          internalType: "uint256",
          name: "endTime",
          type: "uint256",
        },
        {
          internalType: "uint256",
          name: "resolutionDeadline",
          type: "uint256",
        },
        {
          internalType: "int256",
          name: "lowerBound",
          type: "int256",
        },
        {
          internalType: "int256",
          name: "upperBound",
          type: "int256",
        },
      ],
      name: "createScalar",
      outputs: [
        {
          internalType: "address",
          name: "market",
          type: "address",
        },
      ],
      stateMutability: "payable",
      type: "function",
    },
    {
      inputs: [],
      name: "getAllMarkets",
      outputs: [
        {
          internalType: "address[]",
          name: "",
          type: "address[]",
        },
      ],
      stateMutability: "view",
      type: "function",
    },
    {
      inputs: [],
      name: "getMarketCount",
      outputs: [
        {
          internalType: "uint256",
          name: "",
          type: "uint256",
        },
      ],
      stateMutability: "view",
      type: "function",
    },
    {
      inputs: [
        {
          internalType: "uint8",
          name: "status",
          type: "uint8",
        },
      ],
      name: "getMarketsByStatus",
      outputs: [
        {
          internalType: "address[]",
          name: "",
          type: "address[]",
        },
      ],
      stateMutability: "view",
      type: "function",
    },
    {
      inputs: [
        {
          internalType: "address",
          name: "",
          type: "address",
        },
      ],
      name: "idOf",
      outputs: [
        {
          internalType: "uint256",
          name: "",
          type: "uint256",
        },
      ],
      stateMutability: "view",
      type: "function",
    },
    {
      inputs: [],
      name: "marketCount",
      outputs: [
        {
          internalType: "uint256",
          name: "",
          type: "uint256",
        },
      ],
      stateMutability: "view",
      type: "function",
    },
    {
      inputs: [
        {
          internalType: "uint256",
          name: "",
          type: "uint256",
        },
      ],
      name: "marketOf",
      outputs: [
        {
          internalType: "address",
          name: "",
          type: "address",
        },
      ],
      stateMutability: "view",
      type: "function",
    },
  ],
  tokenFactory: [
    {
      inputs: [],
      name: "Exists",
      type: "error",
    },
    {
      inputs: [],
      name: "ZeroAddress",
      type: "error",
    },
    {
      anonymous: false,
      inputs: [
        {
          indexed: false,
          internalType: "address",
          name: "token",
          type: "address",
        },
        {
          indexed: false,
          internalType: "address",
          name: "market",
          type: "address",
        },
        {
          indexed: false,
          internalType: "uint8",
          name: "outcomeId",
          type: "uint8",
        },
      ],
      name: "TokenCreated",
      type: "event",
    },
    {
      inputs: [
        {
          internalType: "string",
          name: "name_",
          type: "string",
        },
        {
          internalType: "string",
          name: "symbol_",
          type: "string",
        },
        {
          internalType: "address",
          name: "market_",
          type: "address",
        },
        {
          internalType: "uint8",
          name: "outcomeId_",
          type: "uint8",
        },
        {
          internalType: "bytes32",
          name: "marketKey_",
          type: "bytes32",
        },
      ],
      name: "create",
      outputs: [
        {
          internalType: "address",
          name: "token",
          type: "address",
        },
      ],
      stateMutability: "nonpayable",
      type: "function",
    },
    {
      inputs: [
        {
          internalType: "address",
          name: "market_",
          type: "address",
        },
      ],
      name: "getTokens",
      outputs: [
        {
          internalType: "address[]",
          name: "",
          type: "address[]",
        },
      ],
      stateMutability: "view",
      type: "function",
    },
    {
      inputs: [
        {
          internalType: "address",
          name: "",
          type: "address",
        },
        {
          internalType: "uint8",
          name: "",
          type: "uint8",
        },
      ],
      name: "tokenOf",
      outputs: [
        {
          internalType: "address",
          name: "",
          type: "address",
        },
      ],
      stateMutability: "view",
      type: "function",
    },
    {
      inputs: [
        {
          internalType: "address",
          name: "",
          type: "address",
        },
        {
          internalType: "uint256",
          name: "",
          type: "uint256",
        },
      ],
      name: "tokensByMarket",
      outputs: [
        {
          internalType: "address",
          name: "",
          type: "address",
        },
      ],
      stateMutability: "view",
      type: "function",
    },
  ],
  curation: [
    {
      inputs: [
        {
          internalType: "address",
          name: "_council",
          type: "address",
        },
      ],
      stateMutability: "nonpayable",
      type: "constructor",
    },
    {
      inputs: [],
      name: "NotCouncil",
      type: "error",
    },
    {
      inputs: [],
      name: "NotMember",
      type: "error",
    },
    {
      anonymous: false,
      inputs: [
        {
          indexed: false,
          internalType: "address",
          name: "member",
          type: "address",
        },
        {
          indexed: false,
          internalType: "bool",
          name: "enabled",
          type: "bool",
        },
      ],
      name: "CouncilMemberSet",
      type: "event",
    },
    {
      anonymous: false,
      inputs: [
        {
          indexed: true,
          internalType: "uint256",
          name: "marketId",
          type: "uint256",
        },
        {
          indexed: false,
          internalType: "enum Curation.Status",
          name: "status",
          type: "uint8",
        },
      ],
      name: "StatusChanged",
      type: "event",
    },
    {
      inputs: [
        {
          internalType: "uint256",
          name: "marketId",
          type: "uint256",
        },
      ],
      name: "approveMarket",
      outputs: [],
      stateMutability: "nonpayable",
      type: "function",
    },
    {
      inputs: [],
      name: "council",
      outputs: [
        {
          internalType: "address",
          name: "",
          type: "address",
        },
      ],
      stateMutability: "view",
      type: "function",
    },
    {
      inputs: [
        {
          internalType: "uint256",
          name: "marketId",
          type: "uint256",
        },
      ],
      name: "flagMarket",
      outputs: [],
      stateMutability: "nonpayable",
      type: "function",
    },
    {
      inputs: [
        {
          internalType: "address",
          name: "",
          type: "address",
        },
      ],
      name: "isCouncilMember",
      outputs: [
        {
          internalType: "bool",
          name: "",
          type: "bool",
        },
      ],
      stateMutability: "view",
      type: "function",
    },
    {
      inputs: [
        {
          internalType: "uint256",
          name: "marketId",
          type: "uint256",
        },
      ],
      name: "resetMarket",
      outputs: [],
      stateMutability: "nonpayable",
      type: "function",
    },
    {
      inputs: [
        {
          internalType: "address",
          name: "m",
          type: "address",
        },
        {
          internalType: "bool",
          name: "enabled",
          type: "bool",
        },
      ],
      name: "setCouncilMember",
      outputs: [],
      stateMutability: "nonpayable",
      type: "function",
    },
    {
      inputs: [
        {
          internalType: "uint256",
          name: "",
          type: "uint256",
        },
      ],
      name: "statusOf",
      outputs: [
        {
          internalType: "enum Curation.Status",
          name: "",
          type: "uint8",
        },
      ],
      stateMutability: "view",
      type: "function",
    },
  ],
};
