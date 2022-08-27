import { Coins, CoinsName, CoinsURL, TokenType } from ".";

export const PolygonCoins: Coins = {
    MATIC: {
        name: CoinsName.MATIC,
        coinUrl: CoinsURL.MATIC,
        type: TokenType.GoldToken,
        contractAddress: "0x0000000000000000000000000000000000001010",
        color: "#8247e5",
        decimals: 18
    },
    ETH: {
        name: CoinsName.ETH,
        coinUrl: CoinsURL.ETH,
        type: TokenType.Altcoin,
        contractAddress: "0x7ceB23fD6bC0adD59E62ac25578270cFf1b9f619",
        color: "#343434",
        decimals: 18
    }, 
    USDC: {
        name: CoinsName.USDC,
        coinUrl: CoinsURL.USDC,
        type: TokenType.StableToken,
        contractAddress: "0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174",
        color: "#2775ca",
        decimals: 6
    }
}