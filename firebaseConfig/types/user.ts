import type { DocumentReference } from "firebase/firestore";
import { BlockchainType, MultisigProviders } from "types/blockchains";

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

export interface IBudgetTX {
    contractAddress: string;
    contractType: 'single' | 'multi';
    protocol: string;
    hashOrIndex: string,
    timestamp: number,
    isSendingOut: boolean,
    token: string,
    amount: number,
}

export interface IBudget {
    id: string;
    parentId: string;
    name: string;
    token: string;
    amount: number;
    secondToken: string | null;
    secondAmount: number | null;
    txs: IBudgetTX[];

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

    txs: IBudgetTX[];

    created_at: number;
}

export type FiatMoneyList = "USD" | "AUD" | "CAD" | "EUR" | "GBP" | "JPY" | "TRY"

export interface IModerator{
    id: string
    name: string
    address: string
    image: Image | null;
    mail: string | null
}
export interface IOrganization {
    id: string;
    name: string;
    image: Image | null,
    accounts: DocumentReference[] | IAccount[];
    members: string[];
    moderators: IModerator[]
    created_date: number;
    budget_execrises: DocumentReference[] | IBudgetExercise[];
    fiatMoneyPreference: FiatMoneyList;

    creator: DocumentReference | IIndividual;
    blockchain: BlockchainType;
}

export interface IIndividual {
    id: string;
    name: string;
    image: Image | null,
    accounts: DocumentReference[] | IAccount[];
    members: string[];
    moderators: IModerator[]
    created_date: number;
    budget_execrises: DocumentReference[] | IBudgetExercise[];
    fiatMoneyPreference: FiatMoneyList;
    
    seenTime: number;
}

export interface IMember {
    id: string;
    name: string;
    address: string;
    mail: string | null;
    image: Image | null;
}

export interface IMemberORM extends IMember {
    parent: IAccount
}

export interface IAccount {
    id: string;
    image: Image | null,
    signerType: "single" | "multi";
    provider: MultisigProviders | null;
    blockchain: BlockchainType["name"];
    createdBy: string;
    address: string;
    name: string;
    mail: string | null;
    members: IMember[];
    created_date: number;
}


export interface IRegisteredIndividual {
    id: string;
    address: string;
    nonce: number;
    password: string;
    blockchain: BlockchainType["name"];
    created_date: number;
}

export interface Image {
    imageUrl: string;
    nftUrl: string;
    tokenId: number | null;
    type: "image" | "nft";
    blockchain: BlockchainType["name"];
}


export interface IHpPriceData {
    date: string,
    price: number
}

export interface IHpPrice {
    blockchain: string,
    coins: {
        name: string,
        symbol: string,
        address: string,
        historicalPrices: {
            usd: IHpPriceData[],
            eur: IHpPriceData[],
            gbp: IHpPriceData[],
            try: IHpPriceData[],
            aud: IHpPriceData[],
            cad: IHpPriceData[],
            jpy: IHpPriceData[],
        }
    }[]
}