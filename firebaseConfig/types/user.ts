import type { DocumentReference } from "firebase/firestore";
import { type } from "os";
import { BlockchainType, MultisigProviders } from "types/blockchains";

export interface IMultiwallet {
    name: string;
    address: string,
    blockchain: BlockchainType["name"]
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
    blockchain: BlockchainType["name"];
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
    coins: {
        calculation: string,
        customPrice: number | null,
        amount: number,
        fiat: FiatMoneyList,
        coin: string
        second: {
            calculation: string | null,
            amount: number | null,
            customPrice: number | null
            coin: string | null,
            fiat: FiatMoneyList | null
        } | null
    }

    blockchain: BlockchainType["name"];

    created_at: number;
}

export interface IBudgetTX {
    contractAddress: string;
    contractType: 'single' | 'multi';
    protocol: string | null;
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

    fiatMoney: FiatMoneyList | null
    customPrice: number | null;

    secondFiatMoney: FiatMoneyList | null
    secondCustomPrice: number | null;

    subbudgets: ISubBudget[];

    created_at: number;
}

export interface ISubBudget {
    id: string;
    parentId: string;
    name: string;

    token: string;
    amount: number;

    fiatMoney: FiatMoneyList | null
    customPrice: number | null;

    secondFiatMoney: FiatMoneyList | null
    secondCustomPrice: number | null;

    secondToken: string | null;
    secondAmount: number | null;

    txs: IBudgetTX[];

    created_at: number;
}

export type FiatMoneyList = "USD" | "AUD" | "CAD" | "EUR" | "GBP" | "JPY" | "TRY"
export type PriceCalculationList = "current" | "5" | "10" | "15" | "20" | "30"

export interface IModerator {
    id: string
    name: string
    address: string
    image: Image | null;
    mail: string | null
}

export interface INotes {
    address: string;
    hashOrIndex: string;
    attachLink: string | null;
    notes: string | null
}

export interface IRemoxPayTransactions {
    contract: string | null;
    contractType: 'single' | 'multi';
    hashOrIndex: string;
    isSendingOut: boolean;
    timestamp: number;

    token: string;
    amount: number;
    fiat: FiatMoneyList | null;
    fiatAmount: number | null;
    customPrice: number | null;
    priceCalculation: PriceCalculationList | null;

    second: {
        token: string;
        amount: number;
        fiat: FiatMoneyList | null;
        fiatAmount: number | null;
        customPrice: number | null;
        priceCalculation: PriceCalculationList | null;
    } | null;
}

interface ICommonUserTypes {
    id: string;
    name: string;
    image: Image | null,
    accounts: DocumentReference[] | IAccount[];
    members: string[];
    payTransactions: IRemoxPayTransactions[];
    // pendingMembers: string[];
    // pendingMembersObjects: { accountId: string, member: string, memberObject: IMember }[];
    // removableMembers: string[];
    // removableMembersObjects: { accountId: string, member: string }[];
    moderators: IModerator[]
    created_date: number;
    budget_execrises: DocumentReference[] | IBudgetExercise[];
    fiatMoneyPreference: FiatMoneyList;
    priceCalculation: PriceCalculationList;

    notes: INotes[]

}
export interface IOrganization extends ICommonUserTypes {
    // creator: DocumentReference | IIndividual;
}

export interface IIndividual extends ICommonUserTypes {
    seenTime: number;
    addressBook: IAddressBook[];
}

export interface IAddressBook {
    id: string;
    name: string;
    address: string;
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
    pendingMembersObjects: { accountId: string, member: string, memberObject: IMember }[];
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