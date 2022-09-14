import { AbiItem } from "rpcHooks/ABI/AbiItem";
import { CoinsURL } from "types/coins";
import OneInch from "rpcHooks/ABI/OneInch.json";
import AavePoolV3 from 'rpcHooks/ABI/AavePoolV3.json'
import AavePoolV2 from 'rpcHooks/ABI/AavePoolV2.json'
import Sablier from 'rpcHooks/ABI/Sablier.json'
import WETHGatewayV3 from 'rpcHooks/ABI/WETHGatewayV3.json'
import WETHGatewayV2 from 'rpcHooks/ABI/WETHGatewayV2.json'
import CeloTerminal from 'rpcHooks/ABI/CeloTerminal.json'
import BR from 'rpcHooks/ABI/BatchRequest.json'

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
    logoURL: string;
    abi: AbiItem[];
    txServiceUrl?: string;
  }[];
  swapProtocols: {
    name: string;
    logoURL: string;
    contractAddress: string;
    abi: AbiItem[];
  }[];
  lendingProtocols: {
    name: string;
    logoURL: string;
    contractAddress: string;
    uiAddress?: string;
    protocolDataProviderAddress?: string;
    tokensProvider?: string;
    ethGatewayAddress?: string;
    ethGatewayABI?: AbiItem[];
    abi: AbiItem[];
  }[];
  streamingProtocols: {
    name: string;
    logoURL: string;
    contractAddress: string;
    abi: AbiItem[];
  }[];
  batchPaymentProtocols: {
    name: string;
    logoURL: string;
    contractAddress: string;
    abi: AbiItem[];
  }[];
  recurringPaymentProtocols: {
    name: string;
    logoURL: string;
    contractAddress: string;
    abi: AbiItem[];
  }[];
};

export const Blockchains: BlockchainType[] = [
  {
    name: "celo",
    displayName: "Celo",
    nativeToken: "0x471EcE3750Da237f93B8E339c536989b8978a438",
    rpcUrl: "https://forno.celo.org",
    explorerUrl: "https://explorer.celo.org/api",
    currencyCollectionName: "celoCurrency",
    logoUrl: CoinsURL.CELO,
    multisigProviders: [
      {
        name: "Celo Terminal",
        abi: CeloTerminal.abi as AbiItem[],
        logoURL: "/icons/companies/celoterminal.png"
      },
    ],
    swapProtocols: [
      {
        name: "Ubeswap",
        contractAddress: "0xE3D8bd6Aed4F159bc8000a9cD47CffDb95F96121",
        logoURL: "/icons/companies/ubeswap.png",
        abi: [],
      },
    ],
    lendingProtocols: [
      {
        name: "Moola",
        contractAddress: "0xD1088091A174d33412a968Fa34Cb67131188B332",
        abi: [],
        logoURL: "/icons/companies/moola.png",
      },
    ],
    streamingProtocols: [
      {
        name: "Xeggo",
        abi: Sablier.abi as AbiItem[],
        contractAddress: "0x22651fc5799f1f046d5613f7622f1ee1b06f386e",
        logoURL: "/icons/companies/xeggo.jpg",
      }
    ],
    batchPaymentProtocols: [
      {
        name: "Remox Batch Payment",
        contractAddress: "0xB01a87B806EE0f5233d7c6559d7FB6d39Ad0046d",
        abi: BR.abi as AbiItem[],
        logoURL: "/icons/companies/remox.png",
      },
    ],
    recurringPaymentProtocols: [
      {
        name: "Xeggo",
        contractAddress: "0x22651fc5799f1f046d5613f7622f1ee1b06f386e",
        abi: Sablier.abi as AbiItem[],
        logoURL: "/icons/companies/xeggo.jpg",
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
        abi: [],
        logoURL: "https://avatars.githubusercontent.com/u/89436329?s=280&v=4"
      },
    ],
    swapProtocols: [
      {
        name: "Jupiter",
        contractAddress: "0x8d12A197cB00D4747a1fe03395095ce2A5CC6819",
        abi: [],
        logoURL: "https://pbs.twimg.com/profile_images/1446493130555990024/xggcEv5a_400x400.jpg"
      },
    ],
    lendingProtocols: [
      {
        name: "Castle Finance",
        contractAddress: "0x8d12A197cB00D4747a1fe03395095ce2A5CC6819",
        abi: [],
        logoURL: "https://www.castle.finance/castle-logo.svg"
      },
    ],
    streamingProtocols: [
      {
        name: "Zebec",
        contractAddress: "0x8d12A197cB00D4747a1fe03395095ce2A5CC6819",
        abi: [],
        logoURL: "https://avatars.githubusercontent.com/u/88788234?s=200&v=4"
      },
    ],
    batchPaymentProtocols: [
      {
        name: "Solana",
        logoURL: "https://upload.wikimedia.org/wikipedia/en/b/b9/Solana_logo.png",
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
        logoURL: "https://safe-docs.dev.gnosisdev.com/safe/img/gnosis_safe_logo_green.png",
        abi: [],
      },
    ],
    swapProtocols: [
      {
        name: "1inch",
        contractAddress: "0x1111111254fb6c44bAC0beD2854e76F90643097d",
        logoURL: "https://1inch.io/img/logo.png",
        abi: OneInch.abi as any,
      },
    ],
    lendingProtocols: [
      {
        name: "Aave V2",
        logoURL: "https://storage.googleapis.com/zapper-fi-assets/apps/aave-v2.png",
        contractAddress: "0x7d2768dE32b0b80b7a3454c06BdAc94A69DDc7A9",
        uiAddress: "0x548e95Ce38B8cb1D91FD82A9F094F26295840277",
        protocolDataProviderAddress:
          "0x057835Ad21a177dbdd3090bB1CAE03EaCF78Fc6d",
        ethGatewayAddress: "0xcc9a0B7c43DC2a5F023Bb9b738E45B0Ef6B06E04",
        ethGatewayABI: WETHGatewayV2.abi as any,
        abi: AavePoolV2.abi as any,
      },
    ],
    streamingProtocols: [],
    batchPaymentProtocols: [],
    recurringPaymentProtocols: [
      {
        name: "Sablier",
        logoURL: "https://avatars.githubusercontent.com/u/42513172?s=280&v=4",
        contractAddress: "0xCD18eAa163733Da39c232722cBC4E8940b1D8888",
        abi: Sablier.abi as any,
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
        logoURL: "https://safe-docs.dev.gnosisdev.com/safe/img/gnosis_safe_logo_green.png",
        txServiceUrl: "https://safe-transaction.polygon.gnosis.io",
        abi: []
      },
    ],
    swapProtocols: [
      {
        name: "1inch",
        logoURL: "https://1inch.io/img/logo.png",
        contractAddress: "0x1111111254fb6c44bAC0beD2854e76F90643097d",
        abi: OneInch.abi as any,
      },
    ],
    lendingProtocols: [
      {
        name: "Aave V3",
        logoURL: "https://storage.googleapis.com/zapper-fi-assets/apps/aave-v2.png",
        contractAddress: "0x794a61358D6845594F94dc1DB02A252b5b4814aD",
        uiAddress: "0x8F1AD487C9413d7e81aB5B4E88B024Ae3b5637D0",
        protocolDataProviderAddress:
          "0x69FA688f1Dc47d4B5d8029D5a35FB7a548310654",
        ethGatewayAddress: "0x9BdB5fcc80A49640c7872ac089Cc0e00A98451B6",
        ethGatewayABI: WETHGatewayV3.abi as any,
        abi: AavePoolV3.abi as any
      },
    ],
    streamingProtocols: [],
    batchPaymentProtocols: [],
    recurringPaymentProtocols: [
      {
        name: "Sablier",
        logoURL: "https://avatars.githubusercontent.com/u/42513172?s=280&v=4",
        contractAddress: "0xAC18EAB6592F5fF6F9aCf5E0DCE0Df8E49124C06",
        abi: Sablier.abi as any
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
        logoURL: "https://safe-docs.dev.gnosisdev.com/safe/img/gnosis_safe_logo_green.png",
        txServiceUrl: "https://safe-transaction.optimism.gnosis.io/",
        abi: []
      },
    ],
    swapProtocols: [
      {
        name: "1inch",
        logoURL: "https://1inch.io/img/logo.png",
        contractAddress: "0x1111111254fb6c44bAC0beD2854e76F90643097d",
        abi: OneInch.abi as any,
      },
    ],
    lendingProtocols: [
      {
        name: "Aave V3",
        logoURL: "https://storage.googleapis.com/zapper-fi-assets/apps/aave-v2.png",
        contractAddress: "0x794a61358D6845594F94dc1DB02A252b5b4814aD",
        uiAddress: "0x64f558d4BFC1c03a8c8B2ff84976fF04c762b51f",
        protocolDataProviderAddress:
          "0x69FA688f1Dc47d4B5d8029D5a35FB7a548310654",
        abi: AavePoolV3.abi as any,
      },
    ],
    streamingProtocols: [],
    batchPaymentProtocols: [],
    recurringPaymentProtocols: [
      {
        name: "Sablier",
        logoURL: "https://avatars.githubusercontent.com/u/42513172?s=280&v=4",
        contractAddress: "0x6C5927c0679e6d857E87367bb635decbcB20F31c",
        abi: Sablier.abi as any
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
        logoURL: "https://safe-docs.dev.gnosisdev.com/safe/img/gnosis_safe_logo_green.png",
        txServiceUrl: "https://safe-transaction.avalanche.gnosis.io/",
        abi: []
      },
    ],
    swapProtocols: [
      {
        name: "1inch",
        logoURL: "https://1inch.io/img/logo.png",
        contractAddress: "0x1111111254fb6c44bAC0beD2854e76F90643097d",
        abi: OneInch.abi as any,
      },
    ],
    lendingProtocols: [
      {
        name: "Aave V3",
        logoURL: "https://storage.googleapis.com/zapper-fi-assets/apps/aave-v2.png",
        contractAddress: "0x794a61358D6845594F94dc1DB02A252b5b4814aD",
        uiAddress: "0xdBbFaFC45983B4659E368a3025b81f69Ab6E5093",
        ethGatewayAddress: "0xa938d8536aEed1Bd48f548380394Ab30Aa11B00E",
        ethGatewayABI: WETHGatewayV3.abi as any,
        protocolDataProviderAddress:
          "0x69FA688f1Dc47d4B5d8029D5a35FB7a548310654",
        abi: AavePoolV3.abi as any,
      },
    ],
    streamingProtocols: [],
    batchPaymentProtocols: [],
    recurringPaymentProtocols: [
      {
        name: "Sablier",
        logoURL: "https://avatars.githubusercontent.com/u/42513172?s=280&v=4",
        contractAddress: "0x73f503fad13203C87889c3D5c567550b2d41D7a4",
        abi: Sablier.abi as any
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
        logoURL: "https://safe-docs.dev.gnosisdev.com/safe/img/gnosis_safe_logo_green.png",
        txServiceUrl: "https://safe-transaction.bsc.gnosis.io/",
        abi: [],
      },
    ],
    swapProtocols: [
      {
        name: "1inch",
        logoURL: "https://1inch.io/img/logo.png",
        contractAddress: "0x1111111254fb6c44bAC0beD2854e76F90643097d",
        abi: OneInch.abi as any,
      },
    ],
    lendingProtocols: [
      {
        name: "Venus",
        contractAddress: "",
        logoURL: "https://miro.medium.com/max/2400/1*ecq-dzwARyhRfEMkYfggug.png",
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
        logoURL: "https://avatars.githubusercontent.com/u/42513172?s=280&v=4",
        contractAddress: "0x05BC7f5fb7F248d44d38703e5C921A8c16825161",
        abi: Sablier.abi as any
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
        logoURL: "https://safe-docs.dev.gnosisdev.com/safe/img/gnosis_safe_logo_green.png",
        txServiceUrl: "https://safe-transaction.arbitrum.gnosis.io/",
        abi: []
      },
    ],
    swapProtocols: [
      {
        name: "1inch",
        logoURL: "https://1inch.io/img/logo.png",
        contractAddress: "0x1111111254fb6c44bAC0beD2854e76F90643097d",
        abi: OneInch.abi as any,
      },
    ],
    lendingProtocols: [
      {
        name: "Aave V3",
        logoURL: "https://storage.googleapis.com/zapper-fi-assets/apps/aave-v2.png",
        contractAddress: "0x794a61358D6845594F94dc1DB02A252b5b4814aD",
        uiAddress: "0x3f960bB91e85Ae2dB561BDd01B515C5A5c65802b",
        protocolDataProviderAddress:
          "0x69FA688f1Dc47d4B5d8029D5a35FB7a548310654",
        abi: AavePoolV3.abi as any,
      },
    ],
    streamingProtocols: [],
    batchPaymentProtocols: [],
    recurringPaymentProtocols: [
      {
        name: "Sablier",
        logoURL: "https://avatars.githubusercontent.com/u/42513172?s=280&v=4",
        contractAddress: "0xaDB944B478818d95659067E70D2e5Fc43Fa3eDe9",
        abi: Sablier.abi as any
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
        logoURL: "https://safe-docs.dev.gnosisdev.com/safe/img/gnosis_safe_logo_green.png",
        abi: []
      },
    ],
    swapProtocols: [
      {
        name: "1inch",
        logoURL: "https://1inch.io/img/logo.png",
        contractAddress: "0x1111111254fb6c44bAC0beD2854e76F90643097d",
        abi: OneInch.abi as any,
      },
    ],
    lendingProtocols: [
      {
        name: "Aave V3",
        contractAddress: "0x794a61358D6845594F94dc1DB02A252b5b4814aD",
        uiAddress: "0x1CCbfeC508da8D5242D5C1b368694Ab0066b39f1",
        protocolDataProviderAddress:
          "0x69FA688f1Dc47d4B5d8029D5a35FB7a548310654",
        abi: AavePoolV3.abi as any,
        logoURL: "https://storage.googleapis.com/zapper-fi-assets/apps/aave-v2.png",
      },
    ],
    streamingProtocols: [],
    batchPaymentProtocols: [],
    recurringPaymentProtocols: [

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
        logoURL: "https://safe-docs.dev.gnosisdev.com/safe/img/gnosis_safe_logo_green.png",
        txServiceUrl: "https://safe-transaction.xdai.gnosis.io/",
        abi: []
      },
    ],
    swapProtocols: [
      {
        name: "1inch",
        logoURL: "https://1inch.io/img/logo.png",
        contractAddress: "0x1111111254fb6c44bAC0beD2854e76F90643097d",
        abi: OneInch.abi as any,
      },
    ],
    lendingProtocols: [

    ],
    streamingProtocols: [],
    batchPaymentProtocols: [],
    recurringPaymentProtocols: [

    ],
  },
];
