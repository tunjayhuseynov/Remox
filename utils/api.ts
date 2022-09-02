import BigNumber from "bignumber.js";
import { CollectionName } from "hooks/walletSDK/useWalletKit";
import { AltCoins, TokenType } from "types";
import { BlockchainType } from "types/blockchains";
import { fromLamport, fromWei } from "utils/ray";


// export const CeloExplorer = "https://explorer.celo.org/api"
export const BASE_URL = process.env.NODE_ENV === "production" ? "https://remox.vercel.app" : "http://localhost:3000"

export interface IPrice {
    [name: string]: {
        coins: AltCoins;
        amountUSD: number;
        amount: number;
        percent: number;
        tokenPrice: number;

        name: string;
        coinUrl: string;
        type: TokenType;
        address: string;
        color: string;
        decimals: number;
        chainID: number;
        logoURI: string;
        priceUSD: number;
        symbol: string;
    };
}

export const DecimalConverter = (amount: number | string, decimals: number) => {
    return new BigNumber(amount).shiftedBy(-1 * Math.abs(decimals)).toNumber();
}
