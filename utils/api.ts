import { CollectionName } from "hooks/walletSDK/useWalletKit";
import { AltCoins, CeloCoins, PoofCoins, SolanaCoins } from "types";
import { BlockchainType } from "types/blockchains";
import { fromLamport, fromWei } from "utils/ray";


export const CeloExplorer = "https://explorer.celo.org/api"
export const BASE_URL = process.env.NODE_ENV === "production" ? "https://remox.vercel.app" : "http://localhost:3000"

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
    if (blockchain.name === 'celo') {
        return CollectionName.Celo
    } else if (blockchain.name === 'solana') {
        return CollectionName.Solana
    }
    return CollectionName.Celo
}

export const GetCoins = (blockchain: BlockchainType) => {
    if (blockchain.name === "celo") {
        return CeloCoins;
    }
    // if (blockchain === "poof") return PoofCoins

    return SolanaCoins;
}

export const fromMinScale = (blockchain: BlockchainType) => {
    if (blockchain.name === "celo") {
        return fromWei
    }

    return fromLamport;
}
