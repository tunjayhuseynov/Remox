import { AbiItem } from "rpcHooks/ABI/AbiItem";
import { CoinsURL } from "types/coins";

export type BlockchainType = {
  name:
    | "celo"
    | "solana"
    | "ethereum_evm"
    | "arbitrum_evm"
    | "avalanche_evm"
    | "binance_evm"
    | "fantom_evm"
    | "gnosis_evm"
    | "optimism_evm"
    | "polygon_evm";
  displayName:
    | "Celo"
    | "Solana"
    | "Ethereum"
    | "Arbitrum"
    | "Avalanche"
    | "Binance Smart Chain"
    | "Fantom"
    | "Gnosis Smart Chain"
    | "Optimism"
    | "Polygon";
  currencyCollectionName: string;
  nativeToken: string;
  chainId?: number;
  rpcUrl: string;
  explorerUrl: string;
  logoUrl: string;
  multisigProviders: {
    name: string;
    txServiceUrl?: string;
  }[];
  swapProtocols: {
    name: string;
    contractAddress: string;
    abi: AbiItem[];
  }[];
  lendingProtocols: {
    name: string;
    contractAddress: string;
    uiAddress?: string;
    protocolDataProviderAddress?: string;
    tokensProvider?: string;
    wethGatewayAddress?: string;
    ethGatewayAddress?: string;
    ethGatewayABI?: AbiItem[];
    abi: AbiItem[];
  }[];
  streamingProtocols: {
    name: string;
    contractAddress: string;
    abi: AbiItem[];
  }[];
  batchPaymentProtocols: {
    name: string;
    contractAddress: string;
    abi: AbiItem[];
  }[];
  recurringPaymentProtocols: {
    name: string;
    contractAddress: string;
    abi: AbiItem[];
  }[];
};

export const Blockchains: BlockchainType[] = [
  {
    name: "celo",
    displayName: "Celo",
    rpcUrl: "https://forno.celo.org",
    explorerUrl: "https://explorer.celo.org/api",
    currencyCollectionName: "celoCurrency",
    logoUrl: CoinsURL.CELO,
    multisigProviders: [
      {
        name: "Celo Terminal",
      },
    ],
    swapProtocols: [
      {
        name: "Ubeswap",
        contractAddress: "0x8d12A197cB00D4747a1fe03395095ce2A5CC6819",
        abi: [],
      },
    ],
    lendingProtocols: [
      {
        name: "Moola",
        contractAddress: "0x8d12A197cB00D4747a1fe03395095ce2A5CC6819",
        abi: [],
      },
    ],
    streamingProtocols: [],
    batchPaymentProtocols: [
      {
        name: "Remox Batch Payment",
        contractAddress: "0x8d12A197cB00D4747a1fe03395095ce2A5CC6819",
        abi: [],
      },
    ],
    recurringPaymentProtocols: [
      {
        name: "CeloRecurringPayment",
        contractAddress: "0x8d12A197cB00D4747a1fe03395095ce2A5CC6819",
        abi: [],
      },
    ],
  },
  {
    name: "solana",
    displayName: "Solana",
    nativeToken: "So11111111111111111111111111111111111111112",
    rpcUrl: "https://solana-api.projectserum.com",
    explorerUrl: "https://explorer-api.mainnet-beta.solana.com/",
    logoUrl: CoinsURL.SOL,
    currencyCollectionName: "solanaCurrency",
    multisigProviders: [
      {
        name: "Goki",
      },
    ],
    swapProtocols: [
      {
        name: "Jupiter",
        contractAddress: "0x8d12A197cB00D4747a1fe03395095ce2A5CC6819",
        abi: [],
      },
    ],
    lendingProtocols: [
      {
        name: "Castle Finance",
        contractAddress: "0x8d12A197cB00D4747a1fe03395095ce2A5CC6819",
        abi: [],
      },
    ],
    streamingProtocols: [
      {
        name: "Zebec",
        contractAddress: "0x8d12A197cB00D4747a1fe03395095ce2A5CC6819",
        abi: [],
      },
    ],
    batchPaymentProtocols: [
      {
        name: "Solana",
        contractAddress: "0x8d12A197cB00D4747a1fe03395095ce2A5CC6819",
        abi: [],
      },
    ],
    recurringPaymentProtocols: [],
  },
  {
    name: "ethereum_evm",
    displayName: "Ethereum",
    nativeToken: "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2",
    rpcUrl: "https://rpc.ankr.com/eth",
    explorerUrl: "https://blockscout.com/eth/mainnet/api",
    currencyCollectionName: "ethereumCurrency",
    logoUrl: CoinsURL.ETH,
    chainId: 1,
    multisigProviders: [
      {
        name: "GnosisSafe",
        txServiceUrl: "https://safe-transaction.mainnet.gnosis.io/",
      },
    ],
    swapProtocols: [
      {
        name: "1inch",
        contractAddress: "",
        abi: [
          {
            constant: false,
            inputs: [],
            name: "renounceOwnership",
            outputs: [],
            payable: false,
            stateMutability: "nonpayable",
            type: "function",
          },
          {
            constant: true,
            inputs: [
              {
                internalType: "contract IERC20",
                name: "token",
                type: "address",
              },
              {
                internalType: "contract IZrxExchange",
                name: "zrx",
                type: "address",
              },
              {
                internalType: "address",
                name: "zrxTokenProxy",
                type: "address",
              },
              {
                components: [
                  {
                    internalType: "address",
                    name: "makerAddress",
                    type: "address",
                  },
                  {
                    internalType: "address",
                    name: "takerAddress",
                    type: "address",
                  },
                  {
                    internalType: "address",
                    name: "feeRecipientAddress",
                    type: "address",
                  },
                  {
                    internalType: "address",
                    name: "senderAddress",
                    type: "address",
                  },
                  {
                    internalType: "uint256",
                    name: "makerAssetAmount",
                    type: "uint256",
                  },
                  {
                    internalType: "uint256",
                    name: "takerAssetAmount",
                    type: "uint256",
                  },
                  {
                    internalType: "uint256",
                    name: "makerFee",
                    type: "uint256",
                  },
                  {
                    internalType: "uint256",
                    name: "takerFee",
                    type: "uint256",
                  },
                  {
                    internalType: "uint256",
                    name: "expirationTimeSeconds",
                    type: "uint256",
                  },
                  { internalType: "uint256", name: "salt", type: "uint256" },
                  {
                    internalType: "bytes",
                    name: "makerAssetData",
                    type: "bytes",
                  },
                  {
                    internalType: "bytes",
                    name: "takerAssetData",
                    type: "bytes",
                  },
                ],
                internalType: "struct IZrxExchange.Order[]",
                name: "orders",
                type: "tuple[]",
              },
            ],
            name: "getOrdersInfoRespectingBalancesAndAllowances",
            outputs: [
              {
                components: [
                  { internalType: "uint8", name: "orderStatus", type: "uint8" },
                  {
                    internalType: "bytes32",
                    name: "orderHash",
                    type: "bytes32",
                  },
                  {
                    internalType: "uint256",
                    name: "orderTakerAssetFilledAmount",
                    type: "uint256",
                  },
                ],
                internalType: "struct IZrxExchange.OrderInfo[]",
                name: "ordersInfo",
                type: "tuple[]",
              },
            ],
            payable: false,
            stateMutability: "view",
            type: "function",
          },
          {
            constant: true,
            inputs: [],
            name: "owner",
            outputs: [{ internalType: "address", name: "", type: "address" }],
            payable: false,
            stateMutability: "view",
            type: "function",
          },
          {
            constant: true,
            inputs: [],
            name: "isOwner",
            outputs: [{ internalType: "bool", name: "", type: "bool" }],
            payable: false,
            stateMutability: "view",
            type: "function",
          },
          {
            constant: false,
            inputs: [
              {
                internalType: "contract IERC20",
                name: "tokenSell",
                type: "address",
              },
              { internalType: "address", name: "tokenBuy", type: "address" },
              { internalType: "address", name: "zrxExchange", type: "address" },
              {
                internalType: "address",
                name: "zrxTokenProxy",
                type: "address",
              },
              {
                components: [
                  {
                    internalType: "address",
                    name: "makerAddress",
                    type: "address",
                  },
                  {
                    internalType: "address",
                    name: "takerAddress",
                    type: "address",
                  },
                  {
                    internalType: "address",
                    name: "feeRecipientAddress",
                    type: "address",
                  },
                  {
                    internalType: "address",
                    name: "senderAddress",
                    type: "address",
                  },
                  {
                    internalType: "uint256",
                    name: "makerAssetAmount",
                    type: "uint256",
                  },
                  {
                    internalType: "uint256",
                    name: "takerAssetAmount",
                    type: "uint256",
                  },
                  {
                    internalType: "uint256",
                    name: "makerFee",
                    type: "uint256",
                  },
                  {
                    internalType: "uint256",
                    name: "takerFee",
                    type: "uint256",
                  },
                  {
                    internalType: "uint256",
                    name: "expirationTimeSeconds",
                    type: "uint256",
                  },
                  { internalType: "uint256", name: "salt", type: "uint256" },
                  {
                    internalType: "bytes",
                    name: "makerAssetData",
                    type: "bytes",
                  },
                  {
                    internalType: "bytes",
                    name: "takerAssetData",
                    type: "bytes",
                  },
                ],
                internalType: "struct IZrxExchange.Order[]",
                name: "orders",
                type: "tuple[]",
              },
              { internalType: "bytes[]", name: "signatures", type: "bytes[]" },
              { internalType: "uint256", name: "mul", type: "uint256" },
              { internalType: "uint256", name: "div", type: "uint256" },
            ],
            name: "marketSellOrdersProportion",
            outputs: [],
            payable: false,
            stateMutability: "nonpayable",
            type: "function",
          },
          {
            constant: false,
            inputs: [
              {
                internalType: "contract IWETH",
                name: "token",
                type: "address",
              },
            ],
            name: "withdrawAllToken",
            outputs: [],
            payable: false,
            stateMutability: "nonpayable",
            type: "function",
          },
          {
            constant: true,
            inputs: [],
            name: "isShutdown",
            outputs: [{ internalType: "bool", name: "", type: "bool" }],
            payable: false,
            stateMutability: "view",
            type: "function",
          },
          {
            constant: false,
            inputs: [
              {
                internalType: "contract IERC20",
                name: "token",
                type: "address",
              },
              { internalType: "address", name: "to", type: "address" },
            ],
            name: "infiniteApproveIfNeeded",
            outputs: [],
            payable: false,
            stateMutability: "nonpayable",
            type: "function",
          },
          {
            constant: true,
            inputs: [],
            name: "spender",
            outputs: [
              {
                internalType: "contract TokenSpender",
                name: "",
                type: "address",
              },
            ],
            payable: false,
            stateMutability: "view",
            type: "function",
          },
          {
            constant: false,
            inputs: [
              { internalType: "address", name: "newOwner", type: "address" },
            ],
            name: "transferOwnership",
            outputs: [],
            payable: false,
            stateMutability: "nonpayable",
            type: "function",
          },
          {
            constant: false,
            inputs: [
              {
                internalType: "contract IERC20",
                name: "fromToken",
                type: "address",
              },
              {
                internalType: "contract IERC20",
                name: "toToken",
                type: "address",
              },
              {
                internalType: "uint256",
                name: "fromTokenAmount",
                type: "uint256",
              },
              {
                internalType: "uint256",
                name: "minReturnAmount",
                type: "uint256",
              },
              {
                internalType: "uint256",
                name: "guaranteedAmount",
                type: "uint256",
              },
              {
                internalType: "address payable",
                name: "referrer",
                type: "address",
              },
              {
                internalType: "address[]",
                name: "callAddresses",
                type: "address[]",
              },
              { internalType: "bytes", name: "callDataConcat", type: "bytes" },
              { internalType: "uint256[]", name: "starts", type: "uint256[]" },
              {
                internalType: "uint256[]",
                name: "gasLimitsAndValues",
                type: "uint256[]",
              },
            ],
            name: "swap",
            outputs: [
              {
                internalType: "uint256",
                name: "returnAmount",
                type: "uint256",
              },
            ],
            payable: true,
            stateMutability: "payable",
            type: "function",
          },
          {
            constant: false,
            inputs: [],
            name: "shutdown",
            outputs: [],
            payable: false,
            stateMutability: "nonpayable",
            type: "function",
          },
          {
            constant: false,
            inputs: [
              { internalType: "address", name: "makerAsset", type: "address" },
              { internalType: "address", name: "zrxExchange", type: "address" },
              {
                internalType: "address",
                name: "zrxTokenProxy",
                type: "address",
              },
              {
                internalType: "uint256",
                name: "takerAssetFillAmount",
                type: "uint256",
              },
              {
                components: [
                  {
                    internalType: "address",
                    name: "makerAddress",
                    type: "address",
                  },
                  {
                    internalType: "address",
                    name: "takerAddress",
                    type: "address",
                  },
                  {
                    internalType: "address",
                    name: "feeRecipientAddress",
                    type: "address",
                  },
                  {
                    internalType: "address",
                    name: "senderAddress",
                    type: "address",
                  },
                  {
                    internalType: "uint256",
                    name: "makerAssetAmount",
                    type: "uint256",
                  },
                  {
                    internalType: "uint256",
                    name: "takerAssetAmount",
                    type: "uint256",
                  },
                  {
                    internalType: "uint256",
                    name: "makerFee",
                    type: "uint256",
                  },
                  {
                    internalType: "uint256",
                    name: "takerFee",
                    type: "uint256",
                  },
                  {
                    internalType: "uint256",
                    name: "expirationTimeSeconds",
                    type: "uint256",
                  },
                  { internalType: "uint256", name: "salt", type: "uint256" },
                  {
                    internalType: "bytes",
                    name: "makerAssetData",
                    type: "bytes",
                  },
                  {
                    internalType: "bytes",
                    name: "takerAssetData",
                    type: "bytes",
                  },
                ],
                internalType: "struct IZrxExchange.Order[]",
                name: "orders",
                type: "tuple[]",
              },
              { internalType: "bytes[]", name: "signatures", type: "bytes[]" },
            ],
            name: "marketSellOrders",
            outputs: [
              {
                components: [
                  {
                    internalType: "uint256",
                    name: "makerAssetFilledAmount",
                    type: "uint256",
                  },
                  {
                    internalType: "uint256",
                    name: "takerAssetFilledAmount",
                    type: "uint256",
                  },
                  {
                    internalType: "uint256",
                    name: "makerFeePaid",
                    type: "uint256",
                  },
                  {
                    internalType: "uint256",
                    name: "takerFeePaid",
                    type: "uint256",
                  },
                ],
                internalType: "struct IZrxExchange.FillResults",
                name: "totalFillResults",
                type: "tuple",
              },
            ],
            payable: false,
            stateMutability: "nonpayable",
            type: "function",
          },
          {
            inputs: [
              { internalType: "address", name: "_owner", type: "address" },
              {
                internalType: "contract IGST2",
                name: "_gasToken",
                type: "address",
              },
              { internalType: "uint256", name: "_fee", type: "uint256" },
            ],
            payable: false,
            stateMutability: "nonpayable",
            type: "constructor",
          },
          { payable: true, stateMutability: "payable", type: "fallback" },
          {
            anonymous: false,
            inputs: [
              {
                indexed: true,
                internalType: "address",
                name: "sender",
                type: "address",
              },
              {
                indexed: false,
                internalType: "contract IERC20",
                name: "fromToken",
                type: "address",
              },
              {
                indexed: false,
                internalType: "contract IERC20",
                name: "toToken",
                type: "address",
              },
              {
                indexed: false,
                internalType: "uint256",
                name: "fromAmount",
                type: "uint256",
              },
              {
                indexed: false,
                internalType: "uint256",
                name: "toAmount",
                type: "uint256",
              },
            ],
            name: "History",
            type: "event",
          },
          {
            anonymous: false,
            inputs: [
              {
                indexed: true,
                internalType: "contract IERC20",
                name: "fromToken",
                type: "address",
              },
              {
                indexed: true,
                internalType: "contract IERC20",
                name: "toToken",
                type: "address",
              },
              {
                indexed: true,
                internalType: "address",
                name: "referrer",
                type: "address",
              },
              {
                indexed: false,
                internalType: "uint256",
                name: "fromAmount",
                type: "uint256",
              },
              {
                indexed: false,
                internalType: "uint256",
                name: "toAmount",
                type: "uint256",
              },
              {
                indexed: false,
                internalType: "uint256",
                name: "referrerFee",
                type: "uint256",
              },
              {
                indexed: false,
                internalType: "uint256",
                name: "fee",
                type: "uint256",
              },
            ],
            name: "Swapped",
            type: "event",
          },
          { anonymous: false, inputs: [], name: "Shutdown", type: "event" },
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
        ],
      },
    ],
    lendingProtocols: [
      {
        name: "Aave V2",
        contractAddress: "0x7d2768dE32b0b80b7a3454c06BdAc94A69DDc7A9",
        uiAddress: "0x548e95Ce38B8cb1D91FD82A9F094F26295840277",
        protocolDataProviderAddress:
          "0x057835Ad21a177dbdd3090bB1CAE03EaCF78Fc6d",
        ethGatewayAddress: "0xcc9a0B7c43DC2a5F023Bb9b738E45B0Ef6B06E04",
        ethGatewayABI: [
          {
            inputs: [
              { internalType: "address", name: "weth", type: "address" },
            ],
            stateMutability: "nonpayable",
            type: "constructor",
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
          { stateMutability: "payable", type: "fallback" },
          {
            inputs: [
              { internalType: "address", name: "lendingPool", type: "address" },
            ],
            name: "authorizeLendingPool",
            outputs: [],
            stateMutability: "nonpayable",
            type: "function",
          },
          {
            inputs: [
              { internalType: "address", name: "lendingPool", type: "address" },
              { internalType: "uint256", name: "amount", type: "uint256" },
              {
                internalType: "uint256",
                name: "interesRateMode",
                type: "uint256",
              },
              { internalType: "uint16", name: "referralCode", type: "uint16" },
            ],
            name: "borrowETH",
            outputs: [],
            stateMutability: "nonpayable",
            type: "function",
          },
          {
            inputs: [
              { internalType: "address", name: "lendingPool", type: "address" },
              { internalType: "address", name: "onBehalfOf", type: "address" },
              { internalType: "uint16", name: "referralCode", type: "uint16" },
            ],
            name: "depositETH",
            outputs: [],
            stateMutability: "payable",
            type: "function",
          },
          {
            inputs: [
              { internalType: "address", name: "to", type: "address" },
              { internalType: "uint256", name: "amount", type: "uint256" },
            ],
            name: "emergencyEtherTransfer",
            outputs: [],
            stateMutability: "nonpayable",
            type: "function",
          },
          {
            inputs: [
              { internalType: "address", name: "token", type: "address" },
              { internalType: "address", name: "to", type: "address" },
              { internalType: "uint256", name: "amount", type: "uint256" },
            ],
            name: "emergencyTokenTransfer",
            outputs: [],
            stateMutability: "nonpayable",
            type: "function",
          },
          {
            inputs: [],
            name: "getWETHAddress",
            outputs: [{ internalType: "address", name: "", type: "address" }],
            stateMutability: "view",
            type: "function",
          },
          {
            inputs: [],
            name: "owner",
            outputs: [{ internalType: "address", name: "", type: "address" }],
            stateMutability: "view",
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
            inputs: [
              { internalType: "address", name: "lendingPool", type: "address" },
              { internalType: "uint256", name: "amount", type: "uint256" },
              { internalType: "uint256", name: "rateMode", type: "uint256" },
              { internalType: "address", name: "onBehalfOf", type: "address" },
            ],
            name: "repayETH",
            outputs: [],
            stateMutability: "payable",
            type: "function",
          },
          {
            inputs: [
              { internalType: "address", name: "newOwner", type: "address" },
            ],
            name: "transferOwnership",
            outputs: [],
            stateMutability: "nonpayable",
            type: "function",
          },
          {
            inputs: [
              { internalType: "address", name: "lendingPool", type: "address" },
              { internalType: "uint256", name: "amount", type: "uint256" },
              { internalType: "address", name: "to", type: "address" },
            ],
            name: "withdrawETH",
            outputs: [],
            stateMutability: "nonpayable",
            type: "function",
          },
        ],
        abi: [
          {
            anonymous: false,
            inputs: [
              {
                indexed: true,
                internalType: "address",
                name: "reserve",
                type: "address",
              },
              {
                indexed: false,
                internalType: "address",
                name: "user",
                type: "address",
              },
              {
                indexed: true,
                internalType: "address",
                name: "onBehalfOf",
                type: "address",
              },
              {
                indexed: false,
                internalType: "uint256",
                name: "amount",
                type: "uint256",
              },
              {
                indexed: false,
                internalType: "uint256",
                name: "borrowRateMode",
                type: "uint256",
              },
              {
                indexed: false,
                internalType: "uint256",
                name: "borrowRate",
                type: "uint256",
              },
              {
                indexed: true,
                internalType: "uint16",
                name: "referral",
                type: "uint16",
              },
            ],
            name: "Borrow",
            type: "event",
          },
          {
            anonymous: false,
            inputs: [
              {
                indexed: true,
                internalType: "address",
                name: "reserve",
                type: "address",
              },
              {
                indexed: false,
                internalType: "address",
                name: "user",
                type: "address",
              },
              {
                indexed: true,
                internalType: "address",
                name: "onBehalfOf",
                type: "address",
              },
              {
                indexed: false,
                internalType: "uint256",
                name: "amount",
                type: "uint256",
              },
              {
                indexed: true,
                internalType: "uint16",
                name: "referral",
                type: "uint16",
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
                name: "target",
                type: "address",
              },
              {
                indexed: true,
                internalType: "address",
                name: "initiator",
                type: "address",
              },
              {
                indexed: true,
                internalType: "address",
                name: "asset",
                type: "address",
              },
              {
                indexed: false,
                internalType: "uint256",
                name: "amount",
                type: "uint256",
              },
              {
                indexed: false,
                internalType: "uint256",
                name: "premium",
                type: "uint256",
              },
              {
                indexed: false,
                internalType: "uint16",
                name: "referralCode",
                type: "uint16",
              },
            ],
            name: "FlashLoan",
            type: "event",
          },
          {
            anonymous: false,
            inputs: [
              {
                indexed: true,
                internalType: "address",
                name: "collateralAsset",
                type: "address",
              },
              {
                indexed: true,
                internalType: "address",
                name: "debtAsset",
                type: "address",
              },
              {
                indexed: true,
                internalType: "address",
                name: "user",
                type: "address",
              },
              {
                indexed: false,
                internalType: "uint256",
                name: "debtToCover",
                type: "uint256",
              },
              {
                indexed: false,
                internalType: "uint256",
                name: "liquidatedCollateralAmount",
                type: "uint256",
              },
              {
                indexed: false,
                internalType: "address",
                name: "liquidator",
                type: "address",
              },
              {
                indexed: false,
                internalType: "bool",
                name: "receiveAToken",
                type: "bool",
              },
            ],
            name: "LiquidationCall",
            type: "event",
          },
          { anonymous: false, inputs: [], name: "Paused", type: "event" },
          {
            anonymous: false,
            inputs: [
              {
                indexed: true,
                internalType: "address",
                name: "reserve",
                type: "address",
              },
              {
                indexed: true,
                internalType: "address",
                name: "user",
                type: "address",
              },
            ],
            name: "RebalanceStableBorrowRate",
            type: "event",
          },
          {
            anonymous: false,
            inputs: [
              {
                indexed: true,
                internalType: "address",
                name: "reserve",
                type: "address",
              },
              {
                indexed: true,
                internalType: "address",
                name: "user",
                type: "address",
              },
              {
                indexed: true,
                internalType: "address",
                name: "repayer",
                type: "address",
              },
              {
                indexed: false,
                internalType: "uint256",
                name: "amount",
                type: "uint256",
              },
            ],
            name: "Repay",
            type: "event",
          },
          {
            anonymous: false,
            inputs: [
              {
                indexed: true,
                internalType: "address",
                name: "reserve",
                type: "address",
              },
              {
                indexed: false,
                internalType: "uint256",
                name: "liquidityRate",
                type: "uint256",
              },
              {
                indexed: false,
                internalType: "uint256",
                name: "stableBorrowRate",
                type: "uint256",
              },
              {
                indexed: false,
                internalType: "uint256",
                name: "variableBorrowRate",
                type: "uint256",
              },
              {
                indexed: false,
                internalType: "uint256",
                name: "liquidityIndex",
                type: "uint256",
              },
              {
                indexed: false,
                internalType: "uint256",
                name: "variableBorrowIndex",
                type: "uint256",
              },
            ],
            name: "ReserveDataUpdated",
            type: "event",
          },
          {
            anonymous: false,
            inputs: [
              {
                indexed: true,
                internalType: "address",
                name: "reserve",
                type: "address",
              },
              {
                indexed: true,
                internalType: "address",
                name: "user",
                type: "address",
              },
            ],
            name: "ReserveUsedAsCollateralDisabled",
            type: "event",
          },
          {
            anonymous: false,
            inputs: [
              {
                indexed: true,
                internalType: "address",
                name: "reserve",
                type: "address",
              },
              {
                indexed: true,
                internalType: "address",
                name: "user",
                type: "address",
              },
            ],
            name: "ReserveUsedAsCollateralEnabled",
            type: "event",
          },
          {
            anonymous: false,
            inputs: [
              {
                indexed: true,
                internalType: "address",
                name: "reserve",
                type: "address",
              },
              {
                indexed: true,
                internalType: "address",
                name: "user",
                type: "address",
              },
              {
                indexed: false,
                internalType: "uint256",
                name: "rateMode",
                type: "uint256",
              },
            ],
            name: "Swap",
            type: "event",
          },
          { anonymous: false, inputs: [], name: "Unpaused", type: "event" },
          {
            anonymous: false,
            inputs: [
              {
                indexed: true,
                internalType: "address",
                name: "reserve",
                type: "address",
              },
              {
                indexed: true,
                internalType: "address",
                name: "user",
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
                name: "amount",
                type: "uint256",
              },
            ],
            name: "Withdraw",
            type: "event",
          },
          {
            inputs: [],
            name: "FLASHLOAN_PREMIUM_TOTAL",
            outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
            stateMutability: "view",
            type: "function",
          },
          {
            inputs: [],
            name: "LENDINGPOOL_REVISION",
            outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
            stateMutability: "view",
            type: "function",
          },
          {
            inputs: [],
            name: "MAX_NUMBER_RESERVES",
            outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
            stateMutability: "view",
            type: "function",
          },
          {
            inputs: [],
            name: "MAX_STABLE_RATE_BORROW_SIZE_PERCENT",
            outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
            stateMutability: "view",
            type: "function",
          },
          {
            inputs: [
              { internalType: "address", name: "asset", type: "address" },
              { internalType: "uint256", name: "amount", type: "uint256" },
              {
                internalType: "uint256",
                name: "interestRateMode",
                type: "uint256",
              },
              { internalType: "uint16", name: "referralCode", type: "uint16" },
              { internalType: "address", name: "onBehalfOf", type: "address" },
            ],
            name: "borrow",
            outputs: [],
            stateMutability: "nonpayable",
            type: "function",
          },
          {
            inputs: [
              { internalType: "address", name: "asset", type: "address" },
              { internalType: "uint256", name: "amount", type: "uint256" },
              { internalType: "address", name: "onBehalfOf", type: "address" },
              { internalType: "uint16", name: "referralCode", type: "uint16" },
            ],
            name: "deposit",
            outputs: [],
            stateMutability: "nonpayable",
            type: "function",
          },
          {
            inputs: [
              { internalType: "address", name: "asset", type: "address" },
              { internalType: "address", name: "from", type: "address" },
              { internalType: "address", name: "to", type: "address" },
              { internalType: "uint256", name: "amount", type: "uint256" },
              {
                internalType: "uint256",
                name: "balanceFromBefore",
                type: "uint256",
              },
              {
                internalType: "uint256",
                name: "balanceToBefore",
                type: "uint256",
              },
            ],
            name: "finalizeTransfer",
            outputs: [],
            stateMutability: "nonpayable",
            type: "function",
          },
          {
            inputs: [
              {
                internalType: "address",
                name: "receiverAddress",
                type: "address",
              },
              { internalType: "address[]", name: "assets", type: "address[]" },
              { internalType: "uint256[]", name: "amounts", type: "uint256[]" },
              { internalType: "uint256[]", name: "modes", type: "uint256[]" },
              { internalType: "address", name: "onBehalfOf", type: "address" },
              { internalType: "bytes", name: "params", type: "bytes" },
              { internalType: "uint16", name: "referralCode", type: "uint16" },
            ],
            name: "flashLoan",
            outputs: [],
            stateMutability: "nonpayable",
            type: "function",
          },
          {
            inputs: [],
            name: "getAddressesProvider",
            outputs: [
              {
                internalType: "contract ILendingPoolAddressesProvider",
                name: "",
                type: "address",
              },
            ],
            stateMutability: "view",
            type: "function",
          },
          {
            inputs: [
              { internalType: "address", name: "asset", type: "address" },
            ],
            name: "getConfiguration",
            outputs: [
              {
                components: [
                  { internalType: "uint256", name: "data", type: "uint256" },
                ],
                internalType: "struct DataTypes.ReserveConfigurationMap",
                name: "",
                type: "tuple",
              },
            ],
            stateMutability: "view",
            type: "function",
          },
          {
            inputs: [
              { internalType: "address", name: "asset", type: "address" },
            ],
            name: "getReserveData",
            outputs: [
              {
                components: [
                  {
                    components: [
                      {
                        internalType: "uint256",
                        name: "data",
                        type: "uint256",
                      },
                    ],
                    internalType: "struct DataTypes.ReserveConfigurationMap",
                    name: "configuration",
                    type: "tuple",
                  },
                  {
                    internalType: "uint128",
                    name: "liquidityIndex",
                    type: "uint128",
                  },
                  {
                    internalType: "uint128",
                    name: "variableBorrowIndex",
                    type: "uint128",
                  },
                  {
                    internalType: "uint128",
                    name: "currentLiquidityRate",
                    type: "uint128",
                  },
                  {
                    internalType: "uint128",
                    name: "currentVariableBorrowRate",
                    type: "uint128",
                  },
                  {
                    internalType: "uint128",
                    name: "currentStableBorrowRate",
                    type: "uint128",
                  },
                  {
                    internalType: "uint40",
                    name: "lastUpdateTimestamp",
                    type: "uint40",
                  },
                  {
                    internalType: "address",
                    name: "aTokenAddress",
                    type: "address",
                  },
                  {
                    internalType: "address",
                    name: "stableDebtTokenAddress",
                    type: "address",
                  },
                  {
                    internalType: "address",
                    name: "variableDebtTokenAddress",
                    type: "address",
                  },
                  {
                    internalType: "address",
                    name: "interestRateStrategyAddress",
                    type: "address",
                  },
                  { internalType: "uint8", name: "id", type: "uint8" },
                ],
                internalType: "struct DataTypes.ReserveData",
                name: "",
                type: "tuple",
              },
            ],
            stateMutability: "view",
            type: "function",
          },
          {
            inputs: [
              { internalType: "address", name: "asset", type: "address" },
            ],
            name: "getReserveNormalizedIncome",
            outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
            stateMutability: "view",
            type: "function",
          },
          {
            inputs: [
              { internalType: "address", name: "asset", type: "address" },
            ],
            name: "getReserveNormalizedVariableDebt",
            outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
            stateMutability: "view",
            type: "function",
          },
          {
            inputs: [],
            name: "getReservesList",
            outputs: [
              { internalType: "address[]", name: "", type: "address[]" },
            ],
            stateMutability: "view",
            type: "function",
          },
          {
            inputs: [
              { internalType: "address", name: "user", type: "address" },
            ],
            name: "getUserAccountData",
            outputs: [
              {
                internalType: "uint256",
                name: "totalCollateralETH",
                type: "uint256",
              },
              {
                internalType: "uint256",
                name: "totalDebtETH",
                type: "uint256",
              },
              {
                internalType: "uint256",
                name: "availableBorrowsETH",
                type: "uint256",
              },
              {
                internalType: "uint256",
                name: "currentLiquidationThreshold",
                type: "uint256",
              },
              { internalType: "uint256", name: "ltv", type: "uint256" },
              {
                internalType: "uint256",
                name: "healthFactor",
                type: "uint256",
              },
            ],
            stateMutability: "view",
            type: "function",
          },
          {
            inputs: [
              { internalType: "address", name: "user", type: "address" },
            ],
            name: "getUserConfiguration",
            outputs: [
              {
                components: [
                  { internalType: "uint256", name: "data", type: "uint256" },
                ],
                internalType: "struct DataTypes.UserConfigurationMap",
                name: "",
                type: "tuple",
              },
            ],
            stateMutability: "view",
            type: "function",
          },
          {
            inputs: [
              { internalType: "address", name: "asset", type: "address" },
              {
                internalType: "address",
                name: "aTokenAddress",
                type: "address",
              },
              {
                internalType: "address",
                name: "stableDebtAddress",
                type: "address",
              },
              {
                internalType: "address",
                name: "variableDebtAddress",
                type: "address",
              },
              {
                internalType: "address",
                name: "interestRateStrategyAddress",
                type: "address",
              },
            ],
            name: "initReserve",
            outputs: [],
            stateMutability: "nonpayable",
            type: "function",
          },
          {
            inputs: [
              {
                internalType: "contract ILendingPoolAddressesProvider",
                name: "provider",
                type: "address",
              },
            ],
            name: "initialize",
            outputs: [],
            stateMutability: "nonpayable",
            type: "function",
          },
          {
            inputs: [
              {
                internalType: "address",
                name: "collateralAsset",
                type: "address",
              },
              { internalType: "address", name: "debtAsset", type: "address" },
              { internalType: "address", name: "user", type: "address" },
              { internalType: "uint256", name: "debtToCover", type: "uint256" },
              { internalType: "bool", name: "receiveAToken", type: "bool" },
            ],
            name: "liquidationCall",
            outputs: [],
            stateMutability: "nonpayable",
            type: "function",
          },
          {
            inputs: [],
            name: "paused",
            outputs: [{ internalType: "bool", name: "", type: "bool" }],
            stateMutability: "view",
            type: "function",
          },
          {
            inputs: [
              { internalType: "address", name: "asset", type: "address" },
              { internalType: "address", name: "user", type: "address" },
            ],
            name: "rebalanceStableBorrowRate",
            outputs: [],
            stateMutability: "nonpayable",
            type: "function",
          },
          {
            inputs: [
              { internalType: "address", name: "asset", type: "address" },
              { internalType: "uint256", name: "amount", type: "uint256" },
              { internalType: "uint256", name: "rateMode", type: "uint256" },
              { internalType: "address", name: "onBehalfOf", type: "address" },
            ],
            name: "repay",
            outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
            stateMutability: "nonpayable",
            type: "function",
          },
          {
            inputs: [
              { internalType: "address", name: "asset", type: "address" },
              {
                internalType: "uint256",
                name: "configuration",
                type: "uint256",
              },
            ],
            name: "setConfiguration",
            outputs: [],
            stateMutability: "nonpayable",
            type: "function",
          },
          {
            inputs: [{ internalType: "bool", name: "val", type: "bool" }],
            name: "setPause",
            outputs: [],
            stateMutability: "nonpayable",
            type: "function",
          },
          {
            inputs: [
              { internalType: "address", name: "asset", type: "address" },
              {
                internalType: "address",
                name: "rateStrategyAddress",
                type: "address",
              },
            ],
            name: "setReserveInterestRateStrategyAddress",
            outputs: [],
            stateMutability: "nonpayable",
            type: "function",
          },
          {
            inputs: [
              { internalType: "address", name: "asset", type: "address" },
              { internalType: "bool", name: "useAsCollateral", type: "bool" },
            ],
            name: "setUserUseReserveAsCollateral",
            outputs: [],
            stateMutability: "nonpayable",
            type: "function",
          },
          {
            inputs: [
              { internalType: "address", name: "asset", type: "address" },
              { internalType: "uint256", name: "rateMode", type: "uint256" },
            ],
            name: "swapBorrowRateMode",
            outputs: [],
            stateMutability: "nonpayable",
            type: "function",
          },
          {
            inputs: [
              { internalType: "address", name: "asset", type: "address" },
              { internalType: "uint256", name: "amount", type: "uint256" },
              { internalType: "address", name: "to", type: "address" },
            ],
            name: "withdraw",
            outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
            stateMutability: "nonpayable",
            type: "function",
          },
        ],
      },
    ],
    streamingProtocols: [],
    batchPaymentProtocols: [],
    recurringPaymentProtocols: [
      {
        name: "Sablier",
        contractAddress: "0xCD18eAa163733Da39c232722cBC4E8940b1D8888",
        abi: [
          {
            inputs: [],
            payable: false,
            stateMutability: "nonpayable",
            type: "constructor",
          },
          {
            anonymous: false,
            inputs: [
              {
                indexed: true,
                internalType: "uint256",
                name: "streamId",
                type: "uint256",
              },
              {
                indexed: true,
                internalType: "address",
                name: "sender",
                type: "address",
              },
              {
                indexed: true,
                internalType: "address",
                name: "recipient",
                type: "address",
              },
              {
                indexed: false,
                internalType: "uint256",
                name: "senderBalance",
                type: "uint256",
              },
              {
                indexed: false,
                internalType: "uint256",
                name: "recipientBalance",
                type: "uint256",
              },
            ],
            name: "CancelStream",
            type: "event",
          },
          {
            anonymous: false,
            inputs: [
              {
                indexed: true,
                internalType: "uint256",
                name: "streamId",
                type: "uint256",
              },
              {
                indexed: true,
                internalType: "address",
                name: "sender",
                type: "address",
              },
              {
                indexed: true,
                internalType: "address",
                name: "recipient",
                type: "address",
              },
              {
                indexed: false,
                internalType: "uint256",
                name: "deposit",
                type: "uint256",
              },
              {
                indexed: false,
                internalType: "address",
                name: "tokenAddress",
                type: "address",
              },
              {
                indexed: false,
                internalType: "uint256",
                name: "startTime",
                type: "uint256",
              },
              {
                indexed: false,
                internalType: "uint256",
                name: "stopTime",
                type: "uint256",
              },
            ],
            name: "CreateStream",
            type: "event",
          },
          {
            anonymous: false,
            inputs: [
              {
                indexed: true,
                internalType: "uint256",
                name: "streamId",
                type: "uint256",
              },
              {
                indexed: true,
                internalType: "address",
                name: "recipient",
                type: "address",
              },
              {
                indexed: false,
                internalType: "uint256",
                name: "amount",
                type: "uint256",
              },
            ],
            name: "WithdrawFromStream",
            type: "event",
          },
          {
            constant: true,
            inputs: [
              { internalType: "uint256", name: "streamId", type: "uint256" },
              { internalType: "address", name: "who", type: "address" },
            ],
            name: "balanceOf",
            outputs: [
              { internalType: "uint256", name: "balance", type: "uint256" },
            ],
            payable: false,
            stateMutability: "view",
            type: "function",
          },
          {
            constant: false,
            inputs: [
              { internalType: "uint256", name: "streamId", type: "uint256" },
            ],
            name: "cancelStream",
            outputs: [{ internalType: "bool", name: "", type: "bool" }],
            payable: false,
            stateMutability: "nonpayable",
            type: "function",
          },
          {
            constant: false,
            inputs: [
              { internalType: "address", name: "recipient", type: "address" },
              { internalType: "uint256", name: "deposit", type: "uint256" },
              {
                internalType: "address",
                name: "tokenAddress",
                type: "address",
              },
              { internalType: "uint256", name: "startTime", type: "uint256" },
              { internalType: "uint256", name: "stopTime", type: "uint256" },
            ],
            name: "createStream",
            outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
            payable: false,
            stateMutability: "nonpayable",
            type: "function",
          },
          {
            constant: true,
            inputs: [
              { internalType: "uint256", name: "streamId", type: "uint256" },
            ],
            name: "deltaOf",
            outputs: [
              { internalType: "uint256", name: "delta", type: "uint256" },
            ],
            payable: false,
            stateMutability: "view",
            type: "function",
          },
          {
            constant: true,
            inputs: [
              { internalType: "uint256", name: "streamId", type: "uint256" },
            ],
            name: "getStream",
            outputs: [
              { internalType: "address", name: "sender", type: "address" },
              { internalType: "address", name: "recipient", type: "address" },
              { internalType: "uint256", name: "deposit", type: "uint256" },
              {
                internalType: "address",
                name: "tokenAddress",
                type: "address",
              },
              { internalType: "uint256", name: "startTime", type: "uint256" },
              { internalType: "uint256", name: "stopTime", type: "uint256" },
              {
                internalType: "uint256",
                name: "remainingBalance",
                type: "uint256",
              },
              {
                internalType: "uint256",
                name: "ratePerSecond",
                type: "uint256",
              },
            ],
            payable: false,
            stateMutability: "view",
            type: "function",
          },
          {
            constant: true,
            inputs: [],
            name: "nextStreamId",
            outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
            payable: false,
            stateMutability: "view",
            type: "function",
          },
          {
            constant: false,
            inputs: [
              { internalType: "uint256", name: "streamId", type: "uint256" },
              { internalType: "uint256", name: "amount", type: "uint256" },
            ],
            name: "withdrawFromStream",
            outputs: [{ internalType: "bool", name: "", type: "bool" }],
            payable: false,
            stateMutability: "nonpayable",
            type: "function",
          },
        ],
      },
    ],
  },
  {
    name: "polygon_evm",
    displayName: "Polygon",
    rpcUrl: "https://polygon-rpc.com",
    nativeToken: "0x0d500B1d8E8eF31E21C99d1Db9A6444d3ADf1270",
    explorerUrl: "https://api.polygonscan.com/api",
    currencyCollectionName: "polygonCurrency",
    chainId: 137,
    logoUrl: CoinsURL.MATIC,
    multisigProviders: [
      {
        name: "GnosisSafe",
        txServiceUrl: "https://safe-transaction.polygon.gnosis.io",
      },
    ],
    swapProtocols: [
      {
        name: "1inch",
        contractAddress: "0x1111111254fb6c44bac0bed2854e76f90643097d",
        abi: [
          {
            inputs: [
              { internalType: "address", name: "weth", type: "address" },
            ],
            stateMutability: "nonpayable",
            type: "constructor",
          },
          {
            anonymous: false,
            inputs: [
              {
                indexed: false,
                internalType: "bytes32",
                name: "orderHash",
                type: "bytes32",
              },
              {
                indexed: false,
                internalType: "uint256",
                name: "makingAmount",
                type: "uint256",
              },
            ],
            name: "OrderFilledRFQ",
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
                indexed: false,
                internalType: "address",
                name: "sender",
                type: "address",
              },
              {
                indexed: false,
                internalType: "contract IERC20",
                name: "srcToken",
                type: "address",
              },
              {
                indexed: false,
                internalType: "contract IERC20",
                name: "dstToken",
                type: "address",
              },
              {
                indexed: false,
                internalType: "address",
                name: "dstReceiver",
                type: "address",
              },
              {
                indexed: false,
                internalType: "uint256",
                name: "spentAmount",
                type: "uint256",
              },
              {
                indexed: false,
                internalType: "uint256",
                name: "returnAmount",
                type: "uint256",
              },
            ],
            name: "Swapped",
            type: "event",
          },
          {
            inputs: [],
            name: "DOMAIN_SEPARATOR",
            outputs: [{ internalType: "bytes32", name: "", type: "bytes32" }],
            stateMutability: "view",
            type: "function",
          },
          {
            inputs: [],
            name: "LIMIT_ORDER_RFQ_TYPEHASH",
            outputs: [{ internalType: "bytes32", name: "", type: "bytes32" }],
            stateMutability: "view",
            type: "function",
          },
          {
            inputs: [
              { internalType: "uint256", name: "orderInfo", type: "uint256" },
            ],
            name: "cancelOrderRFQ",
            outputs: [],
            stateMutability: "nonpayable",
            type: "function",
          },
          {
            inputs: [],
            name: "destroy",
            outputs: [],
            stateMutability: "nonpayable",
            type: "function",
          },
          {
            inputs: [
              {
                internalType: "contract IAggregationExecutor",
                name: "caller",
                type: "address",
              },
              {
                components: [
                  {
                    internalType: "contract IERC20",
                    name: "srcToken",
                    type: "address",
                  },
                  {
                    internalType: "contract IERC20",
                    name: "dstToken",
                    type: "address",
                  },
                  {
                    internalType: "address payable",
                    name: "srcReceiver",
                    type: "address",
                  },
                  {
                    internalType: "address payable",
                    name: "dstReceiver",
                    type: "address",
                  },
                  { internalType: "uint256", name: "amount", type: "uint256" },
                  {
                    internalType: "uint256",
                    name: "minReturnAmount",
                    type: "uint256",
                  },
                  { internalType: "uint256", name: "flags", type: "uint256" },
                  { internalType: "bytes", name: "permit", type: "bytes" },
                ],
                internalType: "struct AggregationRouterV4.SwapDescription",
                name: "desc",
                type: "tuple",
              },
              { internalType: "bytes", name: "data", type: "bytes" },
            ],
            name: "discountedSwap",
            outputs: [
              {
                internalType: "uint256",
                name: "returnAmount",
                type: "uint256",
              },
              { internalType: "uint256", name: "gasLeft", type: "uint256" },
              { internalType: "uint256", name: "chiSpent", type: "uint256" },
            ],
            stateMutability: "payable",
            type: "function",
          },
          {
            inputs: [
              {
                components: [
                  { internalType: "uint256", name: "info", type: "uint256" },
                  {
                    internalType: "contract IERC20",
                    name: "makerAsset",
                    type: "address",
                  },
                  {
                    internalType: "contract IERC20",
                    name: "takerAsset",
                    type: "address",
                  },
                  { internalType: "address", name: "maker", type: "address" },
                  {
                    internalType: "address",
                    name: "allowedSender",
                    type: "address",
                  },
                  {
                    internalType: "uint256",
                    name: "makingAmount",
                    type: "uint256",
                  },
                  {
                    internalType: "uint256",
                    name: "takingAmount",
                    type: "uint256",
                  },
                ],
                internalType: "struct LimitOrderProtocolRFQ.OrderRFQ",
                name: "order",
                type: "tuple",
              },
              { internalType: "bytes", name: "signature", type: "bytes" },
              {
                internalType: "uint256",
                name: "makingAmount",
                type: "uint256",
              },
              {
                internalType: "uint256",
                name: "takingAmount",
                type: "uint256",
              },
            ],
            name: "fillOrderRFQ",
            outputs: [
              { internalType: "uint256", name: "", type: "uint256" },
              { internalType: "uint256", name: "", type: "uint256" },
            ],
            stateMutability: "payable",
            type: "function",
          },
          {
            inputs: [
              {
                components: [
                  { internalType: "uint256", name: "info", type: "uint256" },
                  {
                    internalType: "contract IERC20",
                    name: "makerAsset",
                    type: "address",
                  },
                  {
                    internalType: "contract IERC20",
                    name: "takerAsset",
                    type: "address",
                  },
                  { internalType: "address", name: "maker", type: "address" },
                  {
                    internalType: "address",
                    name: "allowedSender",
                    type: "address",
                  },
                  {
                    internalType: "uint256",
                    name: "makingAmount",
                    type: "uint256",
                  },
                  {
                    internalType: "uint256",
                    name: "takingAmount",
                    type: "uint256",
                  },
                ],
                internalType: "struct LimitOrderProtocolRFQ.OrderRFQ",
                name: "order",
                type: "tuple",
              },
              { internalType: "bytes", name: "signature", type: "bytes" },
              {
                internalType: "uint256",
                name: "makingAmount",
                type: "uint256",
              },
              {
                internalType: "uint256",
                name: "takingAmount",
                type: "uint256",
              },
              {
                internalType: "address payable",
                name: "target",
                type: "address",
              },
            ],
            name: "fillOrderRFQTo",
            outputs: [
              { internalType: "uint256", name: "", type: "uint256" },
              { internalType: "uint256", name: "", type: "uint256" },
            ],
            stateMutability: "payable",
            type: "function",
          },
          {
            inputs: [
              {
                components: [
                  { internalType: "uint256", name: "info", type: "uint256" },
                  {
                    internalType: "contract IERC20",
                    name: "makerAsset",
                    type: "address",
                  },
                  {
                    internalType: "contract IERC20",
                    name: "takerAsset",
                    type: "address",
                  },
                  { internalType: "address", name: "maker", type: "address" },
                  {
                    internalType: "address",
                    name: "allowedSender",
                    type: "address",
                  },
                  {
                    internalType: "uint256",
                    name: "makingAmount",
                    type: "uint256",
                  },
                  {
                    internalType: "uint256",
                    name: "takingAmount",
                    type: "uint256",
                  },
                ],
                internalType: "struct LimitOrderProtocolRFQ.OrderRFQ",
                name: "order",
                type: "tuple",
              },
              { internalType: "bytes", name: "signature", type: "bytes" },
              {
                internalType: "uint256",
                name: "makingAmount",
                type: "uint256",
              },
              {
                internalType: "uint256",
                name: "takingAmount",
                type: "uint256",
              },
              {
                internalType: "address payable",
                name: "target",
                type: "address",
              },
              { internalType: "bytes", name: "permit", type: "bytes" },
            ],
            name: "fillOrderRFQToWithPermit",
            outputs: [
              { internalType: "uint256", name: "", type: "uint256" },
              { internalType: "uint256", name: "", type: "uint256" },
            ],
            stateMutability: "nonpayable",
            type: "function",
          },
          {
            inputs: [
              { internalType: "address", name: "maker", type: "address" },
              { internalType: "uint256", name: "slot", type: "uint256" },
            ],
            name: "invalidatorForOrderRFQ",
            outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
            stateMutability: "view",
            type: "function",
          },
          {
            inputs: [],
            name: "owner",
            outputs: [{ internalType: "address", name: "", type: "address" }],
            stateMutability: "view",
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
            inputs: [
              {
                internalType: "contract IERC20",
                name: "token",
                type: "address",
              },
              { internalType: "uint256", name: "amount", type: "uint256" },
            ],
            name: "rescueFunds",
            outputs: [],
            stateMutability: "nonpayable",
            type: "function",
          },
          {
            inputs: [
              {
                internalType: "contract IAggregationExecutor",
                name: "caller",
                type: "address",
              },
              {
                components: [
                  {
                    internalType: "contract IERC20",
                    name: "srcToken",
                    type: "address",
                  },
                  {
                    internalType: "contract IERC20",
                    name: "dstToken",
                    type: "address",
                  },
                  {
                    internalType: "address payable",
                    name: "srcReceiver",
                    type: "address",
                  },
                  {
                    internalType: "address payable",
                    name: "dstReceiver",
                    type: "address",
                  },
                  { internalType: "uint256", name: "amount", type: "uint256" },
                  {
                    internalType: "uint256",
                    name: "minReturnAmount",
                    type: "uint256",
                  },
                  { internalType: "uint256", name: "flags", type: "uint256" },
                  { internalType: "bytes", name: "permit", type: "bytes" },
                ],
                internalType: "struct AggregationRouterV4.SwapDescription",
                name: "desc",
                type: "tuple",
              },
              { internalType: "bytes", name: "data", type: "bytes" },
            ],
            name: "swap",
            outputs: [
              {
                internalType: "uint256",
                name: "returnAmount",
                type: "uint256",
              },
              { internalType: "uint256", name: "gasLeft", type: "uint256" },
            ],
            stateMutability: "payable",
            type: "function",
          },
          {
            inputs: [
              { internalType: "address", name: "newOwner", type: "address" },
            ],
            name: "transferOwnership",
            outputs: [],
            stateMutability: "nonpayable",
            type: "function",
          },
          {
            inputs: [
              { internalType: "uint256", name: "amount", type: "uint256" },
              { internalType: "uint256", name: "minReturn", type: "uint256" },
              { internalType: "uint256[]", name: "pools", type: "uint256[]" },
            ],
            name: "uniswapV3Swap",
            outputs: [
              {
                internalType: "uint256",
                name: "returnAmount",
                type: "uint256",
              },
            ],
            stateMutability: "payable",
            type: "function",
          },
          {
            inputs: [
              { internalType: "int256", name: "amount0Delta", type: "int256" },
              { internalType: "int256", name: "amount1Delta", type: "int256" },
              { internalType: "bytes", name: "", type: "bytes" },
            ],
            name: "uniswapV3SwapCallback",
            outputs: [],
            stateMutability: "nonpayable",
            type: "function",
          },
          {
            inputs: [
              {
                internalType: "address payable",
                name: "recipient",
                type: "address",
              },
              { internalType: "uint256", name: "amount", type: "uint256" },
              { internalType: "uint256", name: "minReturn", type: "uint256" },
              { internalType: "uint256[]", name: "pools", type: "uint256[]" },
            ],
            name: "uniswapV3SwapTo",
            outputs: [
              {
                internalType: "uint256",
                name: "returnAmount",
                type: "uint256",
              },
            ],
            stateMutability: "payable",
            type: "function",
          },
          {
            inputs: [
              {
                internalType: "address payable",
                name: "recipient",
                type: "address",
              },
              {
                internalType: "contract IERC20",
                name: "srcToken",
                type: "address",
              },
              { internalType: "uint256", name: "amount", type: "uint256" },
              { internalType: "uint256", name: "minReturn", type: "uint256" },
              { internalType: "uint256[]", name: "pools", type: "uint256[]" },
              { internalType: "bytes", name: "permit", type: "bytes" },
            ],
            name: "uniswapV3SwapToWithPermit",
            outputs: [
              {
                internalType: "uint256",
                name: "returnAmount",
                type: "uint256",
              },
            ],
            stateMutability: "nonpayable",
            type: "function",
          },
          {
            inputs: [
              {
                internalType: "contract IERC20",
                name: "srcToken",
                type: "address",
              },
              { internalType: "uint256", name: "amount", type: "uint256" },
              { internalType: "uint256", name: "minReturn", type: "uint256" },
              { internalType: "bytes32[]", name: "pools", type: "bytes32[]" },
            ],
            name: "unoswap",
            outputs: [
              {
                internalType: "uint256",
                name: "returnAmount",
                type: "uint256",
              },
            ],
            stateMutability: "payable",
            type: "function",
          },
          {
            inputs: [
              {
                internalType: "contract IERC20",
                name: "srcToken",
                type: "address",
              },
              { internalType: "uint256", name: "amount", type: "uint256" },
              { internalType: "uint256", name: "minReturn", type: "uint256" },
              { internalType: "bytes32[]", name: "pools", type: "bytes32[]" },
              { internalType: "bytes", name: "permit", type: "bytes" },
            ],
            name: "unoswapWithPermit",
            outputs: [
              {
                internalType: "uint256",
                name: "returnAmount",
                type: "uint256",
              },
            ],
            stateMutability: "nonpayable",
            type: "function",
          },
        ],
      },
    ],
    lendingProtocols: [
      {
        name: "Aave V3",
        contractAddress: "0x794a61358D6845594F94dc1DB02A252b5b4814aD",
        uiAddress: "0x8F1AD487C9413d7e81aB5B4E88B024Ae3b5637D0",
        protocolDataProviderAddress:
          "0x69FA688f1Dc47d4B5d8029D5a35FB7a548310654",
        ethGatewayAddress: "0x9BdB5fcc80A49640c7872ac089Cc0e00A98451B6",
        ethGatewayABI: [
          {
            "inputs": [
              { "internalType": "address", "name": "weth", "type": "address" },
              { "internalType": "address", "name": "owner", "type": "address" }
            ],
            "stateMutability": "nonpayable",
            "type": "constructor"
          },
          {
            "anonymous": false,
            "inputs": [
              {
                "indexed": true,
                "internalType": "address",
                "name": "previousOwner",
                "type": "address"
              },
              {
                "indexed": true,
                "internalType": "address",
                "name": "newOwner",
                "type": "address"
              }
            ],
            "name": "OwnershipTransferred",
            "type": "event"
          },
          { "stateMutability": "payable", "type": "fallback" },
          {
            "inputs": [
              { "internalType": "address", "name": "pool", "type": "address" }
            ],
            "name": "authorizePool",
            "outputs": [],
            "stateMutability": "nonpayable",
            "type": "function"
          },
          {
            "inputs": [
              { "internalType": "address", "name": "pool", "type": "address" },
              { "internalType": "uint256", "name": "amount", "type": "uint256" },
              {
                "internalType": "uint256",
                "name": "interesRateMode",
                "type": "uint256"
              },
              { "internalType": "uint16", "name": "referralCode", "type": "uint16" }
            ],
            "name": "borrowETH",
            "outputs": [],
            "stateMutability": "nonpayable",
            "type": "function"
          },
          {
            "inputs": [
              { "internalType": "address", "name": "pool", "type": "address" },
              { "internalType": "address", "name": "onBehalfOf", "type": "address" },
              { "internalType": "uint16", "name": "referralCode", "type": "uint16" }
            ],
            "name": "depositETH",
            "outputs": [],
            "stateMutability": "payable",
            "type": "function"
          },
          {
            "inputs": [
              { "internalType": "address", "name": "to", "type": "address" },
              { "internalType": "uint256", "name": "amount", "type": "uint256" }
            ],
            "name": "emergencyEtherTransfer",
            "outputs": [],
            "stateMutability": "nonpayable",
            "type": "function"
          },
          {
            "inputs": [
              { "internalType": "address", "name": "token", "type": "address" },
              { "internalType": "address", "name": "to", "type": "address" },
              { "internalType": "uint256", "name": "amount", "type": "uint256" }
            ],
            "name": "emergencyTokenTransfer",
            "outputs": [],
            "stateMutability": "nonpayable",
            "type": "function"
          },
          {
            "inputs": [],
            "name": "getWETHAddress",
            "outputs": [{ "internalType": "address", "name": "", "type": "address" }],
            "stateMutability": "view",
            "type": "function"
          },
          {
            "inputs": [],
            "name": "owner",
            "outputs": [{ "internalType": "address", "name": "", "type": "address" }],
            "stateMutability": "view",
            "type": "function"
          },
          {
            "inputs": [],
            "name": "renounceOwnership",
            "outputs": [],
            "stateMutability": "nonpayable",
            "type": "function"
          },
          {
            "inputs": [
              { "internalType": "address", "name": "pool", "type": "address" },
              { "internalType": "uint256", "name": "amount", "type": "uint256" },
              { "internalType": "uint256", "name": "rateMode", "type": "uint256" },
              { "internalType": "address", "name": "onBehalfOf", "type": "address" }
            ],
            "name": "repayETH",
            "outputs": [],
            "stateMutability": "payable",
            "type": "function"
          },
          {
            "inputs": [
              { "internalType": "address", "name": "newOwner", "type": "address" }
            ],
            "name": "transferOwnership",
            "outputs": [],
            "stateMutability": "nonpayable",
            "type": "function"
          },
          {
            "inputs": [
              { "internalType": "address", "name": "pool", "type": "address" },
              { "internalType": "uint256", "name": "amount", "type": "uint256" },
              { "internalType": "address", "name": "to", "type": "address" }
            ],
            "name": "withdrawETH",
            "outputs": [],
            "stateMutability": "nonpayable",
            "type": "function"
          },
          {
            "inputs": [
              { "internalType": "address", "name": "pool", "type": "address" },
              { "internalType": "uint256", "name": "amount", "type": "uint256" },
              { "internalType": "address", "name": "to", "type": "address" },
              { "internalType": "uint256", "name": "deadline", "type": "uint256" },
              { "internalType": "uint8", "name": "permitV", "type": "uint8" },
              { "internalType": "bytes32", "name": "permitR", "type": "bytes32" },
              { "internalType": "bytes32", "name": "permitS", "type": "bytes32" }
            ],
            "name": "withdrawETHWithPermit",
            "outputs": [],
            "stateMutability": "nonpayable",
            "type": "function"
          }
        ],
        abi: [
          {
            inputs: [
              {
                internalType: "contract IPoolAddressesProvider",
                name: "provider",
                type: "address",
              },
            ],
            stateMutability: "nonpayable",
            type: "constructor",
          },
          {
            anonymous: false,
            inputs: [
              {
                indexed: true,
                internalType: "address",
                name: "reserve",
                type: "address",
              },
              {
                indexed: true,
                internalType: "address",
                name: "backer",
                type: "address",
              },
              {
                indexed: false,
                internalType: "uint256",
                name: "amount",
                type: "uint256",
              },
              {
                indexed: false,
                internalType: "uint256",
                name: "fee",
                type: "uint256",
              },
            ],
            name: "BackUnbacked",
            type: "event",
          },
          {
            anonymous: false,
            inputs: [
              {
                indexed: true,
                internalType: "address",
                name: "reserve",
                type: "address",
              },
              {
                indexed: false,
                internalType: "address",
                name: "user",
                type: "address",
              },
              {
                indexed: true,
                internalType: "address",
                name: "onBehalfOf",
                type: "address",
              },
              {
                indexed: false,
                internalType: "uint256",
                name: "amount",
                type: "uint256",
              },
              {
                indexed: false,
                internalType: "enum DataTypes.InterestRateMode",
                name: "interestRateMode",
                type: "uint8",
              },
              {
                indexed: false,
                internalType: "uint256",
                name: "borrowRate",
                type: "uint256",
              },
              {
                indexed: true,
                internalType: "uint16",
                name: "referralCode",
                type: "uint16",
              },
            ],
            name: "Borrow",
            type: "event",
          },
          {
            anonymous: false,
            inputs: [
              {
                indexed: true,
                internalType: "address",
                name: "target",
                type: "address",
              },
              {
                indexed: false,
                internalType: "address",
                name: "initiator",
                type: "address",
              },
              {
                indexed: true,
                internalType: "address",
                name: "asset",
                type: "address",
              },
              {
                indexed: false,
                internalType: "uint256",
                name: "amount",
                type: "uint256",
              },
              {
                indexed: false,
                internalType: "enum DataTypes.InterestRateMode",
                name: "interestRateMode",
                type: "uint8",
              },
              {
                indexed: false,
                internalType: "uint256",
                name: "premium",
                type: "uint256",
              },
              {
                indexed: true,
                internalType: "uint16",
                name: "referralCode",
                type: "uint16",
              },
            ],
            name: "FlashLoan",
            type: "event",
          },
          {
            anonymous: false,
            inputs: [
              {
                indexed: true,
                internalType: "address",
                name: "asset",
                type: "address",
              },
              {
                indexed: false,
                internalType: "uint256",
                name: "totalDebt",
                type: "uint256",
              },
            ],
            name: "IsolationModeTotalDebtUpdated",
            type: "event",
          },
          {
            anonymous: false,
            inputs: [
              {
                indexed: true,
                internalType: "address",
                name: "collateralAsset",
                type: "address",
              },
              {
                indexed: true,
                internalType: "address",
                name: "debtAsset",
                type: "address",
              },
              {
                indexed: true,
                internalType: "address",
                name: "user",
                type: "address",
              },
              {
                indexed: false,
                internalType: "uint256",
                name: "debtToCover",
                type: "uint256",
              },
              {
                indexed: false,
                internalType: "uint256",
                name: "liquidatedCollateralAmount",
                type: "uint256",
              },
              {
                indexed: false,
                internalType: "address",
                name: "liquidator",
                type: "address",
              },
              {
                indexed: false,
                internalType: "bool",
                name: "receiveAToken",
                type: "bool",
              },
            ],
            name: "LiquidationCall",
            type: "event",
          },
          {
            anonymous: false,
            inputs: [
              {
                indexed: true,
                internalType: "address",
                name: "reserve",
                type: "address",
              },
              {
                indexed: false,
                internalType: "address",
                name: "user",
                type: "address",
              },
              {
                indexed: true,
                internalType: "address",
                name: "onBehalfOf",
                type: "address",
              },
              {
                indexed: false,
                internalType: "uint256",
                name: "amount",
                type: "uint256",
              },
              {
                indexed: true,
                internalType: "uint16",
                name: "referralCode",
                type: "uint16",
              },
            ],
            name: "MintUnbacked",
            type: "event",
          },
          {
            anonymous: false,
            inputs: [
              {
                indexed: true,
                internalType: "address",
                name: "reserve",
                type: "address",
              },
              {
                indexed: false,
                internalType: "uint256",
                name: "amountMinted",
                type: "uint256",
              },
            ],
            name: "MintedToTreasury",
            type: "event",
          },
          {
            anonymous: false,
            inputs: [
              {
                indexed: true,
                internalType: "address",
                name: "reserve",
                type: "address",
              },
              {
                indexed: true,
                internalType: "address",
                name: "user",
                type: "address",
              },
            ],
            name: "RebalanceStableBorrowRate",
            type: "event",
          },
          {
            anonymous: false,
            inputs: [
              {
                indexed: true,
                internalType: "address",
                name: "reserve",
                type: "address",
              },
              {
                indexed: true,
                internalType: "address",
                name: "user",
                type: "address",
              },
              {
                indexed: true,
                internalType: "address",
                name: "repayer",
                type: "address",
              },
              {
                indexed: false,
                internalType: "uint256",
                name: "amount",
                type: "uint256",
              },
              {
                indexed: false,
                internalType: "bool",
                name: "useATokens",
                type: "bool",
              },
            ],
            name: "Repay",
            type: "event",
          },
          {
            anonymous: false,
            inputs: [
              {
                indexed: true,
                internalType: "address",
                name: "reserve",
                type: "address",
              },
              {
                indexed: false,
                internalType: "uint256",
                name: "liquidityRate",
                type: "uint256",
              },
              {
                indexed: false,
                internalType: "uint256",
                name: "stableBorrowRate",
                type: "uint256",
              },
              {
                indexed: false,
                internalType: "uint256",
                name: "variableBorrowRate",
                type: "uint256",
              },
              {
                indexed: false,
                internalType: "uint256",
                name: "liquidityIndex",
                type: "uint256",
              },
              {
                indexed: false,
                internalType: "uint256",
                name: "variableBorrowIndex",
                type: "uint256",
              },
            ],
            name: "ReserveDataUpdated",
            type: "event",
          },
          {
            anonymous: false,
            inputs: [
              {
                indexed: true,
                internalType: "address",
                name: "reserve",
                type: "address",
              },
              {
                indexed: true,
                internalType: "address",
                name: "user",
                type: "address",
              },
            ],
            name: "ReserveUsedAsCollateralDisabled",
            type: "event",
          },
          {
            anonymous: false,
            inputs: [
              {
                indexed: true,
                internalType: "address",
                name: "reserve",
                type: "address",
              },
              {
                indexed: true,
                internalType: "address",
                name: "user",
                type: "address",
              },
            ],
            name: "ReserveUsedAsCollateralEnabled",
            type: "event",
          },
          {
            anonymous: false,
            inputs: [
              {
                indexed: true,
                internalType: "address",
                name: "reserve",
                type: "address",
              },
              {
                indexed: false,
                internalType: "address",
                name: "user",
                type: "address",
              },
              {
                indexed: true,
                internalType: "address",
                name: "onBehalfOf",
                type: "address",
              },
              {
                indexed: false,
                internalType: "uint256",
                name: "amount",
                type: "uint256",
              },
              {
                indexed: true,
                internalType: "uint16",
                name: "referralCode",
                type: "uint16",
              },
            ],
            name: "Supply",
            type: "event",
          },
          {
            anonymous: false,
            inputs: [
              {
                indexed: true,
                internalType: "address",
                name: "reserve",
                type: "address",
              },
              {
                indexed: true,
                internalType: "address",
                name: "user",
                type: "address",
              },
              {
                indexed: false,
                internalType: "enum DataTypes.InterestRateMode",
                name: "interestRateMode",
                type: "uint8",
              },
            ],
            name: "SwapBorrowRateMode",
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
                internalType: "uint8",
                name: "categoryId",
                type: "uint8",
              },
            ],
            name: "UserEModeSet",
            type: "event",
          },
          {
            anonymous: false,
            inputs: [
              {
                indexed: true,
                internalType: "address",
                name: "reserve",
                type: "address",
              },
              {
                indexed: true,
                internalType: "address",
                name: "user",
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
                name: "amount",
                type: "uint256",
              },
            ],
            name: "Withdraw",
            type: "event",
          },
          {
            inputs: [],
            name: "ADDRESSES_PROVIDER",
            outputs: [
              {
                internalType: "contract IPoolAddressesProvider",
                name: "",
                type: "address",
              },
            ],
            stateMutability: "view",
            type: "function",
          },
          {
            inputs: [],
            name: "BRIDGE_PROTOCOL_FEE",
            outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
            stateMutability: "view",
            type: "function",
          },
          {
            inputs: [],
            name: "FLASHLOAN_PREMIUM_TOTAL",
            outputs: [{ internalType: "uint128", name: "", type: "uint128" }],
            stateMutability: "view",
            type: "function",
          },
          {
            inputs: [],
            name: "FLASHLOAN_PREMIUM_TO_PROTOCOL",
            outputs: [{ internalType: "uint128", name: "", type: "uint128" }],
            stateMutability: "view",
            type: "function",
          },
          {
            inputs: [],
            name: "MAX_NUMBER_RESERVES",
            outputs: [{ internalType: "uint16", name: "", type: "uint16" }],
            stateMutability: "view",
            type: "function",
          },
          {
            inputs: [],
            name: "MAX_STABLE_RATE_BORROW_SIZE_PERCENT",
            outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
            stateMutability: "view",
            type: "function",
          },
          {
            inputs: [],
            name: "POOL_REVISION",
            outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
            stateMutability: "view",
            type: "function",
          },
          {
            inputs: [
              { internalType: "address", name: "asset", type: "address" },
              { internalType: "uint256", name: "amount", type: "uint256" },
              { internalType: "uint256", name: "fee", type: "uint256" },
            ],
            name: "backUnbacked",
            outputs: [],
            stateMutability: "nonpayable",
            type: "function",
          },
          {
            inputs: [
              { internalType: "address", name: "asset", type: "address" },
              { internalType: "uint256", name: "amount", type: "uint256" },
              {
                internalType: "uint256",
                name: "interestRateMode",
                type: "uint256",
              },
              { internalType: "uint16", name: "referralCode", type: "uint16" },
              { internalType: "address", name: "onBehalfOf", type: "address" },
            ],
            name: "borrow",
            outputs: [],
            stateMutability: "nonpayable",
            type: "function",
          },
          {
            inputs: [
              { internalType: "uint8", name: "id", type: "uint8" },
              {
                components: [
                  { internalType: "uint16", name: "ltv", type: "uint16" },
                  {
                    internalType: "uint16",
                    name: "liquidationThreshold",
                    type: "uint16",
                  },
                  {
                    internalType: "uint16",
                    name: "liquidationBonus",
                    type: "uint16",
                  },
                  {
                    internalType: "address",
                    name: "priceSource",
                    type: "address",
                  },
                  { internalType: "string", name: "label", type: "string" },
                ],
                internalType: "struct DataTypes.EModeCategory",
                name: "category",
                type: "tuple",
              },
            ],
            name: "configureEModeCategory",
            outputs: [],
            stateMutability: "nonpayable",
            type: "function",
          },
          {
            inputs: [
              { internalType: "address", name: "asset", type: "address" },
              { internalType: "uint256", name: "amount", type: "uint256" },
              { internalType: "address", name: "onBehalfOf", type: "address" },
              { internalType: "uint16", name: "referralCode", type: "uint16" },
            ],
            name: "deposit",
            outputs: [],
            stateMutability: "nonpayable",
            type: "function",
          },
          {
            inputs: [
              { internalType: "address", name: "asset", type: "address" },
            ],
            name: "dropReserve",
            outputs: [],
            stateMutability: "nonpayable",
            type: "function",
          },
          {
            inputs: [
              { internalType: "address", name: "asset", type: "address" },
              { internalType: "address", name: "from", type: "address" },
              { internalType: "address", name: "to", type: "address" },
              { internalType: "uint256", name: "amount", type: "uint256" },
              {
                internalType: "uint256",
                name: "balanceFromBefore",
                type: "uint256",
              },
              {
                internalType: "uint256",
                name: "balanceToBefore",
                type: "uint256",
              },
            ],
            name: "finalizeTransfer",
            outputs: [],
            stateMutability: "nonpayable",
            type: "function",
          },
          {
            inputs: [
              {
                internalType: "address",
                name: "receiverAddress",
                type: "address",
              },
              { internalType: "address[]", name: "assets", type: "address[]" },
              { internalType: "uint256[]", name: "amounts", type: "uint256[]" },
              {
                internalType: "uint256[]",
                name: "interestRateModes",
                type: "uint256[]",
              },
              { internalType: "address", name: "onBehalfOf", type: "address" },
              { internalType: "bytes", name: "params", type: "bytes" },
              { internalType: "uint16", name: "referralCode", type: "uint16" },
            ],
            name: "flashLoan",
            outputs: [],
            stateMutability: "nonpayable",
            type: "function",
          },
          {
            inputs: [
              {
                internalType: "address",
                name: "receiverAddress",
                type: "address",
              },
              { internalType: "address", name: "asset", type: "address" },
              { internalType: "uint256", name: "amount", type: "uint256" },
              { internalType: "bytes", name: "params", type: "bytes" },
              { internalType: "uint16", name: "referralCode", type: "uint16" },
            ],
            name: "flashLoanSimple",
            outputs: [],
            stateMutability: "nonpayable",
            type: "function",
          },
          {
            inputs: [
              { internalType: "address", name: "asset", type: "address" },
            ],
            name: "getConfiguration",
            outputs: [
              {
                components: [
                  { internalType: "uint256", name: "data", type: "uint256" },
                ],
                internalType: "struct DataTypes.ReserveConfigurationMap",
                name: "",
                type: "tuple",
              },
            ],
            stateMutability: "view",
            type: "function",
          },
          {
            inputs: [{ internalType: "uint8", name: "id", type: "uint8" }],
            name: "getEModeCategoryData",
            outputs: [
              {
                components: [
                  { internalType: "uint16", name: "ltv", type: "uint16" },
                  {
                    internalType: "uint16",
                    name: "liquidationThreshold",
                    type: "uint16",
                  },
                  {
                    internalType: "uint16",
                    name: "liquidationBonus",
                    type: "uint16",
                  },
                  {
                    internalType: "address",
                    name: "priceSource",
                    type: "address",
                  },
                  { internalType: "string", name: "label", type: "string" },
                ],
                internalType: "struct DataTypes.EModeCategory",
                name: "",
                type: "tuple",
              },
            ],
            stateMutability: "view",
            type: "function",
          },
          {
            inputs: [{ internalType: "uint16", name: "id", type: "uint16" }],
            name: "getReserveAddressById",
            outputs: [{ internalType: "address", name: "", type: "address" }],
            stateMutability: "view",
            type: "function",
          },
          {
            inputs: [
              { internalType: "address", name: "asset", type: "address" },
            ],
            name: "getReserveData",
            outputs: [
              {
                components: [
                  {
                    components: [
                      {
                        internalType: "uint256",
                        name: "data",
                        type: "uint256",
                      },
                    ],
                    internalType: "struct DataTypes.ReserveConfigurationMap",
                    name: "configuration",
                    type: "tuple",
                  },
                  {
                    internalType: "uint128",
                    name: "liquidityIndex",
                    type: "uint128",
                  },
                  {
                    internalType: "uint128",
                    name: "currentLiquidityRate",
                    type: "uint128",
                  },
                  {
                    internalType: "uint128",
                    name: "variableBorrowIndex",
                    type: "uint128",
                  },
                  {
                    internalType: "uint128",
                    name: "currentVariableBorrowRate",
                    type: "uint128",
                  },
                  {
                    internalType: "uint128",
                    name: "currentStableBorrowRate",
                    type: "uint128",
                  },
                  {
                    internalType: "uint40",
                    name: "lastUpdateTimestamp",
                    type: "uint40",
                  },
                  { internalType: "uint16", name: "id", type: "uint16" },
                  {
                    internalType: "address",
                    name: "aTokenAddress",
                    type: "address",
                  },
                  {
                    internalType: "address",
                    name: "stableDebtTokenAddress",
                    type: "address",
                  },
                  {
                    internalType: "address",
                    name: "variableDebtTokenAddress",
                    type: "address",
                  },
                  {
                    internalType: "address",
                    name: "interestRateStrategyAddress",
                    type: "address",
                  },
                  {
                    internalType: "uint128",
                    name: "accruedToTreasury",
                    type: "uint128",
                  },
                  {
                    internalType: "uint128",
                    name: "unbacked",
                    type: "uint128",
                  },
                  {
                    internalType: "uint128",
                    name: "isolationModeTotalDebt",
                    type: "uint128",
                  },
                ],
                internalType: "struct DataTypes.ReserveData",
                name: "",
                type: "tuple",
              },
            ],
            stateMutability: "view",
            type: "function",
          },
          {
            inputs: [
              { internalType: "address", name: "asset", type: "address" },
            ],
            name: "getReserveNormalizedIncome",
            outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
            stateMutability: "view",
            type: "function",
          },
          {
            inputs: [
              { internalType: "address", name: "asset", type: "address" },
            ],
            name: "getReserveNormalizedVariableDebt",
            outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
            stateMutability: "view",
            type: "function",
          },
          {
            inputs: [],
            name: "getReservesList",
            outputs: [
              { internalType: "address[]", name: "", type: "address[]" },
            ],
            stateMutability: "view",
            type: "function",
          },
          {
            inputs: [
              { internalType: "address", name: "user", type: "address" },
            ],
            name: "getUserAccountData",
            outputs: [
              {
                internalType: "uint256",
                name: "totalCollateralBase",
                type: "uint256",
              },
              {
                internalType: "uint256",
                name: "totalDebtBase",
                type: "uint256",
              },
              {
                internalType: "uint256",
                name: "availableBorrowsBase",
                type: "uint256",
              },
              {
                internalType: "uint256",
                name: "currentLiquidationThreshold",
                type: "uint256",
              },
              { internalType: "uint256", name: "ltv", type: "uint256" },
              {
                internalType: "uint256",
                name: "healthFactor",
                type: "uint256",
              },
            ],
            stateMutability: "view",
            type: "function",
          },
          {
            inputs: [
              { internalType: "address", name: "user", type: "address" },
            ],
            name: "getUserConfiguration",
            outputs: [
              {
                components: [
                  { internalType: "uint256", name: "data", type: "uint256" },
                ],
                internalType: "struct DataTypes.UserConfigurationMap",
                name: "",
                type: "tuple",
              },
            ],
            stateMutability: "view",
            type: "function",
          },
          {
            inputs: [
              { internalType: "address", name: "user", type: "address" },
            ],
            name: "getUserEMode",
            outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
            stateMutability: "view",
            type: "function",
          },
          {
            inputs: [
              { internalType: "address", name: "asset", type: "address" },
              {
                internalType: "address",
                name: "aTokenAddress",
                type: "address",
              },
              {
                internalType: "address",
                name: "stableDebtAddress",
                type: "address",
              },
              {
                internalType: "address",
                name: "variableDebtAddress",
                type: "address",
              },
              {
                internalType: "address",
                name: "interestRateStrategyAddress",
                type: "address",
              },
            ],
            name: "initReserve",
            outputs: [],
            stateMutability: "nonpayable",
            type: "function",
          },
          {
            inputs: [
              {
                internalType: "contract IPoolAddressesProvider",
                name: "provider",
                type: "address",
              },
            ],
            name: "initialize",
            outputs: [],
            stateMutability: "nonpayable",
            type: "function",
          },
          {
            inputs: [
              {
                internalType: "address",
                name: "collateralAsset",
                type: "address",
              },
              { internalType: "address", name: "debtAsset", type: "address" },
              { internalType: "address", name: "user", type: "address" },
              { internalType: "uint256", name: "debtToCover", type: "uint256" },
              { internalType: "bool", name: "receiveAToken", type: "bool" },
            ],
            name: "liquidationCall",
            outputs: [],
            stateMutability: "nonpayable",
            type: "function",
          },
          {
            inputs: [
              { internalType: "address[]", name: "assets", type: "address[]" },
            ],
            name: "mintToTreasury",
            outputs: [],
            stateMutability: "nonpayable",
            type: "function",
          },
          {
            inputs: [
              { internalType: "address", name: "asset", type: "address" },
              { internalType: "uint256", name: "amount", type: "uint256" },
              { internalType: "address", name: "onBehalfOf", type: "address" },
              { internalType: "uint16", name: "referralCode", type: "uint16" },
            ],
            name: "mintUnbacked",
            outputs: [],
            stateMutability: "nonpayable",
            type: "function",
          },
          {
            inputs: [
              { internalType: "address", name: "asset", type: "address" },
              { internalType: "address", name: "user", type: "address" },
            ],
            name: "rebalanceStableBorrowRate",
            outputs: [],
            stateMutability: "nonpayable",
            type: "function",
          },
          {
            inputs: [
              { internalType: "address", name: "asset", type: "address" },
              { internalType: "uint256", name: "amount", type: "uint256" },
              {
                internalType: "uint256",
                name: "interestRateMode",
                type: "uint256",
              },
              { internalType: "address", name: "onBehalfOf", type: "address" },
            ],
            name: "repay",
            outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
            stateMutability: "nonpayable",
            type: "function",
          },
          {
            inputs: [
              { internalType: "address", name: "asset", type: "address" },
              { internalType: "uint256", name: "amount", type: "uint256" },
              {
                internalType: "uint256",
                name: "interestRateMode",
                type: "uint256",
              },
            ],
            name: "repayWithATokens",
            outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
            stateMutability: "nonpayable",
            type: "function",
          },
          {
            inputs: [
              { internalType: "address", name: "asset", type: "address" },
              { internalType: "uint256", name: "amount", type: "uint256" },
              {
                internalType: "uint256",
                name: "interestRateMode",
                type: "uint256",
              },
              { internalType: "address", name: "onBehalfOf", type: "address" },
              { internalType: "uint256", name: "deadline", type: "uint256" },
              { internalType: "uint8", name: "permitV", type: "uint8" },
              { internalType: "bytes32", name: "permitR", type: "bytes32" },
              { internalType: "bytes32", name: "permitS", type: "bytes32" },
            ],
            name: "repayWithPermit",
            outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
            stateMutability: "nonpayable",
            type: "function",
          },
          {
            inputs: [
              { internalType: "address", name: "token", type: "address" },
              { internalType: "address", name: "to", type: "address" },
              { internalType: "uint256", name: "amount", type: "uint256" },
            ],
            name: "rescueTokens",
            outputs: [],
            stateMutability: "nonpayable",
            type: "function",
          },
          {
            inputs: [
              { internalType: "address", name: "asset", type: "address" },
            ],
            name: "resetIsolationModeTotalDebt",
            outputs: [],
            stateMutability: "nonpayable",
            type: "function",
          },
          {
            inputs: [
              { internalType: "address", name: "asset", type: "address" },
              {
                components: [
                  { internalType: "uint256", name: "data", type: "uint256" },
                ],
                internalType: "struct DataTypes.ReserveConfigurationMap",
                name: "configuration",
                type: "tuple",
              },
            ],
            name: "setConfiguration",
            outputs: [],
            stateMutability: "nonpayable",
            type: "function",
          },
          {
            inputs: [
              { internalType: "address", name: "asset", type: "address" },
              {
                internalType: "address",
                name: "rateStrategyAddress",
                type: "address",
              },
            ],
            name: "setReserveInterestRateStrategyAddress",
            outputs: [],
            stateMutability: "nonpayable",
            type: "function",
          },
          {
            inputs: [
              { internalType: "uint8", name: "categoryId", type: "uint8" },
            ],
            name: "setUserEMode",
            outputs: [],
            stateMutability: "nonpayable",
            type: "function",
          },
          {
            inputs: [
              { internalType: "address", name: "asset", type: "address" },
              { internalType: "bool", name: "useAsCollateral", type: "bool" },
            ],
            name: "setUserUseReserveAsCollateral",
            outputs: [],
            stateMutability: "nonpayable",
            type: "function",
          },
          {
            inputs: [
              { internalType: "address", name: "asset", type: "address" },
              { internalType: "uint256", name: "amount", type: "uint256" },
              { internalType: "address", name: "onBehalfOf", type: "address" },
              { internalType: "uint16", name: "referralCode", type: "uint16" },
            ],
            name: "supply",
            outputs: [],
            stateMutability: "nonpayable",
            type: "function",
          },
          {
            inputs: [
              { internalType: "address", name: "asset", type: "address" },
              { internalType: "uint256", name: "amount", type: "uint256" },
              { internalType: "address", name: "onBehalfOf", type: "address" },
              { internalType: "uint16", name: "referralCode", type: "uint16" },
              { internalType: "uint256", name: "deadline", type: "uint256" },
              { internalType: "uint8", name: "permitV", type: "uint8" },
              { internalType: "bytes32", name: "permitR", type: "bytes32" },
              { internalType: "bytes32", name: "permitS", type: "bytes32" },
            ],
            name: "supplyWithPermit",
            outputs: [],
            stateMutability: "nonpayable",
            type: "function",
          },
          {
            inputs: [
              { internalType: "address", name: "asset", type: "address" },
              {
                internalType: "uint256",
                name: "interestRateMode",
                type: "uint256",
              },
            ],
            name: "swapBorrowRateMode",
            outputs: [],
            stateMutability: "nonpayable",
            type: "function",
          },
          {
            inputs: [
              { internalType: "uint256", name: "protocolFee", type: "uint256" },
            ],
            name: "updateBridgeProtocolFee",
            outputs: [],
            stateMutability: "nonpayable",
            type: "function",
          },
          {
            inputs: [
              {
                internalType: "uint128",
                name: "flashLoanPremiumTotal",
                type: "uint128",
              },
              {
                internalType: "uint128",
                name: "flashLoanPremiumToProtocol",
                type: "uint128",
              },
            ],
            name: "updateFlashloanPremiums",
            outputs: [],
            stateMutability: "nonpayable",
            type: "function",
          },
          {
            inputs: [
              { internalType: "address", name: "asset", type: "address" },
              { internalType: "uint256", name: "amount", type: "uint256" },
              { internalType: "address", name: "to", type: "address" },
            ],
            name: "withdraw",
            outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
            stateMutability: "nonpayable",
            type: "function",
          },
        ],
      },
    ],
    streamingProtocols: [],
    batchPaymentProtocols: [],
    recurringPaymentProtocols: [
      {
        name: "Sablier",
        contractAddress: "0xAC18EAB6592F5fF6F9aCf5E0DCE0Df8E49124C06",
        abi: [
          {
            inputs: [],
            payable: false,
            stateMutability: "nonpayable",
            type: "constructor",
          },
          {
            anonymous: false,
            inputs: [
              {
                indexed: true,
                internalType: "uint256",
                name: "streamId",
                type: "uint256",
              },
              {
                indexed: true,
                internalType: "address",
                name: "sender",
                type: "address",
              },
              {
                indexed: true,
                internalType: "address",
                name: "recipient",
                type: "address",
              },
              {
                indexed: false,
                internalType: "uint256",
                name: "senderBalance",
                type: "uint256",
              },
              {
                indexed: false,
                internalType: "uint256",
                name: "recipientBalance",
                type: "uint256",
              },
            ],
            name: "CancelStream",
            type: "event",
          },
          {
            anonymous: false,
            inputs: [
              {
                indexed: true,
                internalType: "uint256",
                name: "streamId",
                type: "uint256",
              },
              {
                indexed: true,
                internalType: "address",
                name: "sender",
                type: "address",
              },
              {
                indexed: true,
                internalType: "address",
                name: "recipient",
                type: "address",
              },
              {
                indexed: false,
                internalType: "uint256",
                name: "deposit",
                type: "uint256",
              },
              {
                indexed: false,
                internalType: "address",
                name: "tokenAddress",
                type: "address",
              },
              {
                indexed: false,
                internalType: "uint256",
                name: "startTime",
                type: "uint256",
              },
              {
                indexed: false,
                internalType: "uint256",
                name: "stopTime",
                type: "uint256",
              },
            ],
            name: "CreateStream",
            type: "event",
          },
          {
            anonymous: false,
            inputs: [
              {
                indexed: true,
                internalType: "uint256",
                name: "streamId",
                type: "uint256",
              },
              {
                indexed: true,
                internalType: "address",
                name: "recipient",
                type: "address",
              },
              {
                indexed: false,
                internalType: "uint256",
                name: "amount",
                type: "uint256",
              },
            ],
            name: "WithdrawFromStream",
            type: "event",
          },
          {
            constant: true,
            inputs: [
              { internalType: "uint256", name: "streamId", type: "uint256" },
              { internalType: "address", name: "who", type: "address" },
            ],
            name: "balanceOf",
            outputs: [
              { internalType: "uint256", name: "balance", type: "uint256" },
            ],
            payable: false,
            stateMutability: "view",
            type: "function",
          },
          {
            constant: false,
            inputs: [
              { internalType: "uint256", name: "streamId", type: "uint256" },
            ],
            name: "cancelStream",
            outputs: [{ internalType: "bool", name: "", type: "bool" }],
            payable: false,
            stateMutability: "nonpayable",
            type: "function",
          },
          {
            constant: false,
            inputs: [
              { internalType: "address", name: "recipient", type: "address" },
              { internalType: "uint256", name: "deposit", type: "uint256" },
              {
                internalType: "address",
                name: "tokenAddress",
                type: "address",
              },
              { internalType: "uint256", name: "startTime", type: "uint256" },
              { internalType: "uint256", name: "stopTime", type: "uint256" },
            ],
            name: "createStream",
            outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
            payable: false,
            stateMutability: "nonpayable",
            type: "function",
          },
          {
            constant: true,
            inputs: [
              { internalType: "uint256", name: "streamId", type: "uint256" },
            ],
            name: "deltaOf",
            outputs: [
              { internalType: "uint256", name: "delta", type: "uint256" },
            ],
            payable: false,
            stateMutability: "view",
            type: "function",
          },
          {
            constant: true,
            inputs: [
              { internalType: "uint256", name: "streamId", type: "uint256" },
            ],
            name: "getStream",
            outputs: [
              { internalType: "address", name: "sender", type: "address" },
              { internalType: "address", name: "recipient", type: "address" },
              { internalType: "uint256", name: "deposit", type: "uint256" },
              {
                internalType: "address",
                name: "tokenAddress",
                type: "address",
              },
              { internalType: "uint256", name: "startTime", type: "uint256" },
              { internalType: "uint256", name: "stopTime", type: "uint256" },
              {
                internalType: "uint256",
                name: "remainingBalance",
                type: "uint256",
              },
              {
                internalType: "uint256",
                name: "ratePerSecond",
                type: "uint256",
              },
            ],
            payable: false,
            stateMutability: "view",
            type: "function",
          },
          {
            constant: true,
            inputs: [],
            name: "nextStreamId",
            outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
            payable: false,
            stateMutability: "view",
            type: "function",
          },
          {
            constant: false,
            inputs: [
              { internalType: "uint256", name: "streamId", type: "uint256" },
              { internalType: "uint256", name: "amount", type: "uint256" },
            ],
            name: "withdrawFromStream",
            outputs: [{ internalType: "bool", name: "", type: "bool" }],
            payable: false,
            stateMutability: "nonpayable",
            type: "function",
          },
        ],
      },
    ],
  },
  {
    name: "optimism_evm",
    displayName: "Optimism",
    rpcUrl: "https://optimistic.etherscan.io",
    explorerUrl: "https://optimistic.etherscan.io/",
    currencyCollectionName: "optimismCurrency",
    nativeToken: "0x4200000000000000000000000000000000000006",
    chainId: 10,
    logoUrl: CoinsURL.OPTI,
    multisigProviders: [
      {
        name: "GnosisSafe",
        txServiceUrl: "https://safe-transaction.optimism.gnosis.io/",
      },
    ],
    swapProtocols: [
      {
        name: "1inch",
        contractAddress: "",
        abi: [],
      },
    ],
    lendingProtocols: [
      {
        name: "Aave V3",
        contractAddress: "0x794a61358D6845594F94dc1DB02A252b5b4814aD",
        uiAddress: "0x64f558d4BFC1c03a8c8B2ff84976fF04c762b51f",
        protocolDataProviderAddress:
          "0x69FA688f1Dc47d4B5d8029D5a35FB7a548310654",
        abi: [],
      },
    ],
    streamingProtocols: [],
    batchPaymentProtocols: [],
    recurringPaymentProtocols: [
      {
        name: "Sablier",
        contractAddress: "0x6C5927c0679e6d857E87367bb635decbcB20F31c",
        abi: [],
      },
    ],
  },
  {
    name: "avalanche_evm",
    displayName: "Avalanche",
    rpcUrl: "https://api.avax.network/ext/bc/C/rpc",
    explorerUrl: "https://avascan.info/",
    nativeToken: "0xB31f66AA3C1e785363F0875A1B74E27b85FD66c7",
    currencyCollectionName: "avaxCurrency",
    chainId: 43114,
    logoUrl: CoinsURL.AVAX,
    multisigProviders: [
      {
        name: "GnosisSafe",
        txServiceUrl: "https://safe-transaction.avalanche.gnosis.io/",
      },
    ],
    swapProtocols: [
      {
        name: "1inch",
        contractAddress: "",
        abi: [],
      },
    ],
    lendingProtocols: [
      {
        name: "Aave V3",
        contractAddress: "0x794a61358D6845594F94dc1DB02A252b5b4814aD",
        uiAddress: "0xdBbFaFC45983B4659E368a3025b81f69Ab6E5093",
        ethGatewayAddress: "0xa938d8536aEed1Bd48f548380394Ab30Aa11B00E",
        ethGatewayABI: [
          {
            "inputs": [
              { "internalType": "address", "name": "weth", "type": "address" },
              { "internalType": "address", "name": "owner", "type": "address" }
            ],
            "stateMutability": "nonpayable",
            "type": "constructor"
          },
          {
            "anonymous": false,
            "inputs": [
              {
                "indexed": true,
                "internalType": "address",
                "name": "previousOwner",
                "type": "address"
              },
              {
                "indexed": true,
                "internalType": "address",
                "name": "newOwner",
                "type": "address"
              }
            ],
            "name": "OwnershipTransferred",
            "type": "event"
          },
          { "stateMutability": "payable", "type": "fallback" },
          {
            "inputs": [
              { "internalType": "address", "name": "pool", "type": "address" }
            ],
            "name": "authorizePool",
            "outputs": [],
            "stateMutability": "nonpayable",
            "type": "function"
          },
          {
            "inputs": [
              { "internalType": "address", "name": "pool", "type": "address" },
              { "internalType": "uint256", "name": "amount", "type": "uint256" },
              {
                "internalType": "uint256",
                "name": "interesRateMode",
                "type": "uint256"
              },
              { "internalType": "uint16", "name": "referralCode", "type": "uint16" }
            ],
            "name": "borrowETH",
            "outputs": [],
            "stateMutability": "nonpayable",
            "type": "function"
          },
          {
            "inputs": [
              { "internalType": "address", "name": "pool", "type": "address" },
              { "internalType": "address", "name": "onBehalfOf", "type": "address" },
              { "internalType": "uint16", "name": "referralCode", "type": "uint16" }
            ],
            "name": "depositETH",
            "outputs": [],
            "stateMutability": "payable",
            "type": "function"
          },
          {
            "inputs": [
              { "internalType": "address", "name": "to", "type": "address" },
              { "internalType": "uint256", "name": "amount", "type": "uint256" }
            ],
            "name": "emergencyEtherTransfer",
            "outputs": [],
            "stateMutability": "nonpayable",
            "type": "function"
          },
          {
            "inputs": [
              { "internalType": "address", "name": "token", "type": "address" },
              { "internalType": "address", "name": "to", "type": "address" },
              { "internalType": "uint256", "name": "amount", "type": "uint256" }
            ],
            "name": "emergencyTokenTransfer",
            "outputs": [],
            "stateMutability": "nonpayable",
            "type": "function"
          },
          {
            "inputs": [],
            "name": "getWETHAddress",
            "outputs": [{ "internalType": "address", "name": "", "type": "address" }],
            "stateMutability": "view",
            "type": "function"
          },
          {
            "inputs": [],
            "name": "owner",
            "outputs": [{ "internalType": "address", "name": "", "type": "address" }],
            "stateMutability": "view",
            "type": "function"
          },
          {
            "inputs": [],
            "name": "renounceOwnership",
            "outputs": [],
            "stateMutability": "nonpayable",
            "type": "function"
          },
          {
            "inputs": [
              { "internalType": "address", "name": "pool", "type": "address" },
              { "internalType": "uint256", "name": "amount", "type": "uint256" },
              { "internalType": "uint256", "name": "rateMode", "type": "uint256" },
              { "internalType": "address", "name": "onBehalfOf", "type": "address" }
            ],
            "name": "repayETH",
            "outputs": [],
            "stateMutability": "payable",
            "type": "function"
          },
          {
            "inputs": [
              { "internalType": "address", "name": "newOwner", "type": "address" }
            ],
            "name": "transferOwnership",
            "outputs": [],
            "stateMutability": "nonpayable",
            "type": "function"
          },
          {
            "inputs": [
              { "internalType": "address", "name": "pool", "type": "address" },
              { "internalType": "uint256", "name": "amount", "type": "uint256" },
              { "internalType": "address", "name": "to", "type": "address" }
            ],
            "name": "withdrawETH",
            "outputs": [],
            "stateMutability": "nonpayable",
            "type": "function"
          },
          {
            "inputs": [
              { "internalType": "address", "name": "pool", "type": "address" },
              { "internalType": "uint256", "name": "amount", "type": "uint256" },
              { "internalType": "address", "name": "to", "type": "address" },
              { "internalType": "uint256", "name": "deadline", "type": "uint256" },
              { "internalType": "uint8", "name": "permitV", "type": "uint8" },
              { "internalType": "bytes32", "name": "permitR", "type": "bytes32" },
              { "internalType": "bytes32", "name": "permitS", "type": "bytes32" }
            ],
            "name": "withdrawETHWithPermit",
            "outputs": [],
            "stateMutability": "nonpayable",
            "type": "function"
          }
        ],
        protocolDataProviderAddress:
          "0x69FA688f1Dc47d4B5d8029D5a35FB7a548310654",
        abi: [],
      },
    ],
    streamingProtocols: [],
    batchPaymentProtocols: [],
    recurringPaymentProtocols: [
      {
        name: "Sablier",
        contractAddress: "0x73f503fad13203C87889c3D5c567550b2d41D7a4",
        abi: [],
      },
    ],
  },
  {
    name: "binance_evm",
    displayName: "Binance Smart Chain",
    rpcUrl: "https://binance.nodereal.io",
    explorerUrl: "https://bscscan.com/",
    nativeToken: "0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c",
    currencyCollectionName: "bscCurrency",
    chainId: 56,
    logoUrl: CoinsURL.BNB,
    multisigProviders: [
      {
        name: "GnosisSafe",
        txServiceUrl: "https://safe-transaction.bsc.gnosis.io/",
      },
    ],
    swapProtocols: [
      {
        name: "1inch",
        contractAddress: "",
        abi: [],
      },
    ],
    lendingProtocols: [
      {
        name: "Venus",
        contractAddress: "",
        uiAddress: "",
        protocolDataProviderAddress: "",
        abi: [],
      },
    ],
    streamingProtocols: [],
    batchPaymentProtocols: [],
    recurringPaymentProtocols: [
      {
        name: "Sablier",
        contractAddress: "0x05BC7f5fb7F248d44d38703e5C921A8c168251",
        abi: [],
      },
    ],
  },
  {
    name: "arbitrum_evm",
    displayName: "Arbitrum",
    rpcUrl: "https://arb1.arbitrum.io/rpc",
    explorerUrl: "https://arbiscan.io/",
    currencyCollectionName: "artbitrumCurrency",
    chainId: 42161,
    nativeToken: "0x82aF49447D8a07e3bd95BD0d56f35241523fBab1",
    logoUrl: CoinsURL.ARBI,
    multisigProviders: [
      {
        name: "GnosisSafe",
        txServiceUrl: "https://safe-transaction.arbitrum.gnosis.io/",
      },
    ],
    swapProtocols: [
      {
        name: "1inch",
        contractAddress: "",
        abi: [],
      },
    ],
    lendingProtocols: [
      {
        name: "Aave V3",
        contractAddress: "0x794a61358D6845594F94dc1DB02A252b5b4814aD",
        uiAddress: "0x3f960bB91e85Ae2dB561BDd01B515C5A5c65802b",
        protocolDataProviderAddress:
          "0x69FA688f1Dc47d4B5d8029D5a35FB7a548310654",
        abi: [],
      },
    ],
    streamingProtocols: [],
    batchPaymentProtocols: [],
    recurringPaymentProtocols: [
      {
        name: "Sablier",
        contractAddress: "0xaDB944B478818d95659067E70D2e5Fc43Fa3eDe9",
        abi: [],
      },
    ],
  },
  {
    name: "fantom_evm",
    displayName: "Fantom",
    rpcUrl: "https://rpc.ankr.com/fantom",
    explorerUrl: "https://ftmscan.com/",
    currencyCollectionName: "fantomCurrency",
    nativeToken: "0x21be370D5312f44cB42ce377BC9b8a0cEF1A4C83",
    chainId: 250,
    logoUrl: CoinsURL.FANT,
    multisigProviders: [
      {
        name: "GnosisSafe",
      },
    ],
    swapProtocols: [
      {
        name: "1inch",
        contractAddress: "",
        abi: [],
      },
    ],
    lendingProtocols: [
      {
        name: "Aave V3",
        contractAddress: "0x794a61358D6845594F94dc1DB02A252b5b4814aD",
        uiAddress: "0x1CCbfeC508da8D5242D5C1b368694Ab0066b39f1",
        protocolDataProviderAddress:
          "0x69FA688f1Dc47d4B5d8029D5a35FB7a548310654",
        abi: [],
      },
    ],
    streamingProtocols: [],
    batchPaymentProtocols: [],
    recurringPaymentProtocols: [
      {
        name: "",
        contractAddress: "",
        abi: [],
      },
    ],
  },
  {
    name: "gnosis_evm",
    displayName: "Gnosis Smart Chain",
    rpcUrl: "https://rpc.gnosischain.com",
    explorerUrl: "https://blockscout.com/eth/mainnet/",
    currencyCollectionName: "gnosisCurrency",
    nativeToken: "0xe91D153E0b41518A2Ce8Dd3D7944Fa863463a97d",
    chainId: 100,
    logoUrl: CoinsURL.xDAI,
    multisigProviders: [
      {
        name: "GnosisSafe",
        txServiceUrl: "https://safe-transaction.xdai.gnosis.io/",
      },
    ],
    swapProtocols: [
      {
        name: "1inch",
        contractAddress: "",
        abi: [],
      },
    ],
    lendingProtocols: [
      {
        name: "",
        contractAddress: "",
        abi: [],
      },
    ],
    streamingProtocols: [],
    batchPaymentProtocols: [],
    recurringPaymentProtocols: [
      {
        name: "",
        contractAddress: "",
        abi: [],
      },
    ],
  },
];
