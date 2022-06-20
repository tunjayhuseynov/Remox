import type { DocumentReference } from "firebase/firestore";
import { BlockchainType } from "hooks/walletSDK/useWalletKit";

export interface IMultiwallet {
    name: string;
    address: string,
    blockchain: BlockchainType
}

export interface IUser {
    id: string;
    address: string[];
    multiwallets: IMultiwallet[];
    name?: string;
    surname?: string;
    companyName?: string;
    contractAddress?: string;
    seenTime: number;
    blockchain: BlockchainType;
    timestamp: number;
}


export interface IBudgetExercise {
    id: string;
    parentId: string;
    parentType: "organization" | "individual"
    name: string;
    from: number;
    to: number;
    budgets: DocumentReference[] | IBudget[];

    blockchain: BlockchainType;

    created_at: number;
}

export interface IBudget {
    id: string;
    parentId: string;
    name: string;
    token: string;
    amount: number;
    secondToken: string | null;
    secondAmount: number | null;
    txs: string[];

    subbudgets: ISubBudget[];

    created_at: number;
}

export interface ISubBudget {
    id: string;
    parentId: string;
    name: string;
    token: string;
    amount: number;

    secondToken: string | null;
    secondAmount: number | null;

    txs: string[];

    created_at: number;
}


export interface IOrganization {
    id: string;
    name: string;
    image: Image | null,
    accounts: DocumentReference[] | IAccount[];
    members: string[];

    creator: DocumentReference | IIndividual;
    
    budget_execrises: DocumentReference[] | IBudgetExercise[];
    blockchain: BlockchainType;

    created_date: number;
}

export interface IIndividual {
    id: string;
    name: string;
    image: Image | null,
    accounts: IAccount[];
    seenTime: number;
    members: string[];
     
    budget_execrises: DocumentReference[] | IBudgetExercise[];

    created_date: number;
}

export interface IMember {
    id: string;
    name: string;
    address: string;
    mail: string | null;
    image: Image | null;
}

export interface IAccount {
    id: string;
    image: Image | null,
    signerType: "single" | "multi";
    provider: "Goki" | "CeloTerminal" | null;
    blockchain: BlockchainType;
    address: string;
    name: string;
    members: IMember[];
    created_date: number;
}



export interface IRegisteredIndividual {
    id: string;
    address: string;
    nonce: number;
    password: string;
    blockchain: BlockchainType;
    created_date: number;
}

export interface Image {
    imageUrl: string | File;
    nftUrl: string;
    tokenId: number | null;
    type: "image" | "nft";
    blockchain: BlockchainType;
}