import { WalletTypes } from "@celo-tools/use-contractkit";

export interface IMultiwallet{
    name: WalletTypes, 
    address: string
}

export interface IUser{
    id: string;
    address: string[];
    multiwallets: IMultiwallet[];
    name?: string;
    surname?: string;
    companyName?: string;
    contractAddress?: string;
    seenTime: number;
    timestamp: number;
}