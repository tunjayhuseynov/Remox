import { WalletTypes } from "@celo-tools/use-contractkit";

export interface IUser{
    id: string;
    address: string[];
    multiwallets: {name: WalletTypes, address: string}[];
    name?: string;
    surname?: string;
    companyName?: string;
    contractAddress?: string;
    seenTime: number;
    timestamp: number;
}