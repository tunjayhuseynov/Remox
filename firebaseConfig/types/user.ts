import { WalletTypes } from "@celo-tools/use-contractkit";
import { BlockChainTypes } from "redux/reducers/network";

export interface IMultiwallet{
    name: string; 
    address: string,
    blockchain: BlockChainTypes
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
    blockchain: BlockChainTypes;
    timestamp: number;
}