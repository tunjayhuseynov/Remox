import { Image } from "firebaseConfig";
import { CoinsName } from "types/coins";

export enum DateInterval {
    daily = "daily",
    weekly = "weekly",
    monthly = "monthly",
}

export interface IContributor {
    id: string;
    userId: string;
    name: string;
    timestamp: number;
    members: IMember[]
}

export enum ExecutionType {
    auto = "auto",
    manual = "manual",
}

export interface IMember {
    id: string;
    name: string,
    first: string,
    last: string,
    role: string,
    image: Image | null,
    address: string,
    compensation: string,
    currency: string,
    amount: string,
    teamId: string,
    execution: ExecutionType,
    paymantDate: number | string,
    paymantEndDate: number | string ,
    interval: DateInterval,
    usdBase: boolean,
    secondaryCurrency: string | null,
    secondaryAmount: string | null,
    secondaryUsdBase: boolean | null,
    taskId: string | null,
}
