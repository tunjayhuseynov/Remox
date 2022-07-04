import { BlockchainType, CollectionName } from "hooks/walletSDK/useWalletKit";
import { AltCoins, CeloCoins, PoofCoins, SolanaCoins } from "types";
import { fromLamport, fromWei } from "utils/ray";


export const CeloExplorer = "https://explorer.celo.org/api"
export const BASE_URL = process.env.NODE_ENV === "production" ? "https://app.remox.io" : "http://localhost:3000"

export interface IPrice {
    [name: string]: {
        coins: AltCoins;
        per_24: number;
        price: number;
        amount: number;
        percent: number;
        tokenPrice: number;
    };
}

export const Collection = (blockchain: BlockchainType) => {
    if (blockchain === 'celo') {
        return CollectionName.Celo
    } else if (blockchain === 'solana') {
        return CollectionName.Solana
    }
    return CollectionName.Celo
}

export const GetCoins = (blockchain: BlockchainType) => {
    if (blockchain === "celo") {
        return CeloCoins;
    }
    // if (blockchain === "poof") return PoofCoins

    return SolanaCoins;
}

export const fromMinScale = (blockchain: BlockchainType) => {
    if (blockchain === "celo") {
        return fromWei
    }

    return fromLamport;
}
