export interface Coins {
  [name: string]: AltCoins;
}

export interface AltCoins {
  name: string;
  coinUrl: string;
  type: TokenType;
  address: string;
  color: string;
  decimals: number;
  chainID: number;
  logoURI: string;
  priceUSD: number;
  priceAUD: number;
  priceCAD: number;
  priceEUR: number;
  priceGBP: number;
  priceJPY: number;
  priceTRY: number;
  symbol: string;
  current_balance?: number;
}

export enum TokenType {
  GoldToken = "GoldToken",
  StableToken = "StableToken",
  Altcoin = "Altcoin",
  YieldToken = "YieldToken",
}

export enum CoinsName {
  CELO = "CELO",
  cUSD = "cUSD",
  cEUR = "cEUR",
  cREAL = "cREAL",
  UBE = "UBE",
  MOO = "MOO",
  MOBI = "MOBI",
  POOF = "POOF",
  PACT = "PACT",
  ARI = "ARI",
  mCELO = "mCELO",
  mcUSD = "mcUSD",
  mcEUR = "mcEUR",
  mcREAL = "mcREAL",

  //Solana
  SOL = "SOL",
  SBR = "SBR",
  ZBC = "ZBC",
  USDC = "USDC",
  USDT = "USDT",
  wSOL = "wSOL",
  soETH = "soETH",
  wWBTC_v1 = "wWBTC_v1",
  AVAX = "AVAX",
  atLUNA = "atLUNA",
  ORCA = "ORCA",
  SUNNY = "SUNNY",
  SRM = "SRM",
  RAY = "RAY",
  MNGO = "MNGO",
  SLND = "SLND",
  MNDE = "MNDE",
  UXD = "UXD",

  //Polygon
  MATIC = "MATIC",
  ETH = "ETH",



  noCoin = "",
}

export enum CoinsURL {
  CELO = "/icons/currencies/celoiconsquare.svg",
  cUSD = "/icons/currencies/celodollar.svg",
  cEUR = "/icons/currencies/ceur.png",
  UBE = "/icons/currencies/ubeswap.png",
  MOO = "/icons/currencies/moola.png",
  MOBI = "/icons/currencies/mobius.png",
  POOF = "/icons/currencies/poof.png",
  cREAL = "/icons/currencies/creal.png",
  PACT = "/icons/currencies/pact.png",
  ARI = "/icons/currencies/ari.png",
  mCELO = "/icons/currencies/mCELO.png",
  mcUSD = "/icons/currencies/mcUSD.png",
  mcEUR = "/icons/currencies/mcEUR.png",
  mcREAL = "/icons/currencies/mcREAL.png",

  //Solana
  SOL = "/icons/currencies/solana.png",
  SBR = "https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/Saber2gLauYim4Mvftnrasomsv6NvAuncvMEZwcLpD1/logo.svg",
  ZBC = "https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/zebeczgi5fSEtbpfQKVZKCJ3WgYXxjkMUkNNx7fLKAF/logo.png",
  USDC = "https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v/logo.png",
  USDT = "https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB/logo.svg",
  wSOL = "https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/So11111111111111111111111111111111111111112/logo.png",
  soETH = "https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/2FPyTwcZLUg1MDrwsyoP4D6s1tM7hAkHYRjkNb5w6Pxk/logo.png",
  wWBTC_v1 = "https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/qfnqNqs3nCAHjnyCgLRDbBtq4p2MtHZxw8YjSyYhPoL/logo.png",
  AVAX = "https://assets.coingecko.com/coins/images/12559/small/coin-round-red.png",
  atLUNA = "https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/2Xf2yAXJfg82sWwdLUo2x9mZXy6JCdszdMZkcF1Hf4KV/logo.png",
  ORCA = "https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/orcaEKTdK7LKz57vaAYr9QeNsVEPfiu6QeMU1kektZE/logo.png",
  SUNNY = "https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/SUNNYWgPQmFxe9wTZzNK7iPnJ3vYDrkgnxJRJm1s3ag/logo.svg",
  SRM = "https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/SRMuApVNdxXokk5GT7XD5cUUgXMBCoAz2LHeuAoKWRt/logo.png",
  RAY = "https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/4k3Dyjzvzp8eMZWUXbBCjEvwSkkk59S5iCNLY3QrkX6R/logo.png",
  MNGO = "https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/MangoCzJ36AjZyKwVj3VnYU4GTonjfVEnJmvvWaxLac/token.png",
  SLND = "https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/SLNDpmoWTVADgEdndyvWzroNL7zSi1dF9PC3xHGtPwp/logo.png",
  MNDE = "https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/MNDEFzGvMt87ueuHvVU9VcTqsAP5b3fTGPsHuuPA5ey/logo.png",
  UXD = "https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/7kbnvuGBxxj8AG9qp8Scn56muWGaRaFqxg1FsRp3PaFT/uxd-icon-black.png",

  //Evm
  ETH = "https://assets.coingecko.com/coins/images/279/small/ethereum.png?1595348880",
  MATIC = "https://assets.coingecko.com/coins/images/4713/small/matic-token-icon.png?1624446912",
  OPTI = "https://assets.coingecko.com/coins/images/25244/small/Optimism.png?1660904599",
  BNB = "https://assets.coingecko.com/coins/images/9576/small/BUSD.png?1568947766",
  ARBI = "https://assets-global.website-files.com/5f973c970bea5548ad4287ef/60a320b472858ace6700df76_arb-icon.svg",
  FANT = "https://assets.coingecko.com/coins/images/4001/small/Fantom.png?1558015016",
  xDAI = "https://assets.coingecko.com/coins/images/11062/small/Identity-Primary-DarkBG.png?1638372986",

  None = "",
}
