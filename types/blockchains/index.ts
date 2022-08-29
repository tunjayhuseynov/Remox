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
    rpcUrl: "https://celo-rpc.celo.org",
    explorerUrl: "https://explorer.celo.org",
    currencyCollectionName: "currency",
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
    rpcUrl: "https://rpc.ankr.com/eth",
    explorerUrl: "https://etherscan.io/",
    currencyCollectionName: "ethereumCurrency",
    logoUrl: CoinsURL.ETH,
    chainId: 1,
    multisigProviders: [
      {
        name: "Gnosis Safe",
        txServiceUrl: "https://safe-transaction.mainnet.gnosis.io/"
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
        name: "Aave V2",
        contractAddress: "0x7d2768dE32b0b80b7a3454c06BdAc94A69DDc7A9",
        uiAddress: "0x548e95Ce38B8cb1D91FD82A9F094F26295840277",
        protocolDataProviderAddress:
          "0x057835Ad21a177dbdd3090bB1CAE03EaCF78Fc6d",
        abi: [],
      },
    ],
    streamingProtocols: [],
    batchPaymentProtocols: [],
    recurringPaymentProtocols: [
      {
        name: "Sablier",
        contractAddress: "0xCD18eAa163733Da39c232722cBC4E8940b1D8888",
        abi: [],
      },
    ],
  },
  {
    name: "polygon_evm",
    displayName: "Polygon",
    rpcUrl: "https://polygon-rpc.com",
    explorerUrl: "https://polygonscan.com",
    currencyCollectionName: "polygonCurrency",
    chainId: 137,
    logoUrl: CoinsURL.MATIC,
    multisigProviders: [
      {
        name: "Gnosis Safe",
        txServiceUrl: "https://safe-transaction.polygon.gnosis.io"
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
        uiAddress: "0x8F1AD487C9413d7e81aB5B4E88B024Ae3b5637D0",
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
    name: "optimism_evm",
    displayName: "Optimism",
    rpcUrl: "https://optimistic.etherscan.io",
    explorerUrl: "https://optimistic.etherscan.io/",
    currencyCollectionName: "",
    chainId: 10,
    logoUrl: CoinsURL.OPTI,
    multisigProviders: [
      {
        name: "Gnosis Safe",
        txServiceUrl: "https://safe-transaction.optimism.gnosis.io/"
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
    currencyCollectionName: "avaxCurrency",
    chainId: 43114,
    logoUrl: CoinsURL.AVAX,
    multisigProviders: [
      {
        name: "Gnosis Safe",
        txServiceUrl: "https://safe-transaction.avalanche.gnosis.io/"
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
    currencyCollectionName: "bscCurrency",
    chainId: 56,
    logoUrl: CoinsURL.BNB,
    multisigProviders: [
      {
        name: "Gnosis Safe",
        txServiceUrl: "https://safe-transaction.bsc.gnosis.io/"
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
    logoUrl: CoinsURL.ARBI,
    multisigProviders: [
      {
        name: "Gnosis Safe",
        txServiceUrl: "https://safe-transaction.arbitrum.gnosis.io/"
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
    chainId: 250,
    logoUrl: CoinsURL.FANT,
    multisigProviders: [
      {
        name: "Gnosis Safe",
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
    chainId: 100,
    logoUrl: CoinsURL.xDAI,
    multisigProviders: [
      {
        name: "Gnosis Safe",
        txServiceUrl: "https://safe-transaction.xdai.gnosis.io/"
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
