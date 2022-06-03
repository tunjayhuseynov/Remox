import type { DocumentReference } from "firebase/firestore";
import type { BlockChainTypes } from "redux/reducers/network";

export interface IMultiwallet {
    name: string;
    address: string,
    blockchain: BlockChainTypes
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
    blockchain: BlockChainTypes;
    timestamp: number;
}


export interface IBudgetExercise {
    id: string;
    name: string;
    from: number;
    to: number;
    budgets: DocumentReference[] | IBudget[];

    created_at: number;
}

export interface IBudget {
    id: string;
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
    organizationAccounts: DocumentReference[] | IAccount[];
    blockchain: BlockChainTypes;
    members: string[];
    firebaseAccess: string[];
    creator: DocumentReference | IIndividual;
    image: Image | null,
    name: string;

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
    blockchain: BlockChainTypes;
    address: string;
    name: string;
    members: IMember[];
    created_date: number;
}

export interface IIndividual {
    id: string;
    name: string;
    seenTime: number;
    image: Image | null,
    addresses: string[];
    accounts: IAccount[];
    budget_execrises: DocumentReference[] | IBudgetExercise[];

    created_date: number;
}

export interface IRegisteredIndividual {
    id: string;
    address: string;
    nonce: number;
    password: string;
    blockchain: BlockChainTypes;
    created_date: number;
}

export interface Image {
    imageUrl: string | File;
    nftUrl: string;
    tokenId: number | null;
    type: "image" | "nft";
    blockchain: BlockChainTypes;
}