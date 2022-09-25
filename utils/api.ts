import BigNumber from "bignumber.js";
import { AltCoins, TokenType } from "types";


// export const CeloExplorer = "https://explorer.celo.org/api"
export const BASE_URL = process.env.NODE_ENV === "production" ? "https://remox.vercel.app" : "http://localhost:3000"

export interface IPrice {
    [name: string]: {
        coin: AltCoins;    
        amount: number;
        
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
    };
}

export const DecimalConverter = (amount: number | string, decimals: number) => {
    return new BigNumber(amount).shiftedBy(-1 * Math.abs(decimals)).toNumber();
}
