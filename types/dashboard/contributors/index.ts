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
    image: string | null,
    address: string,
    compensation: string,
    currency: CoinsName,
    amount: string,
    teamId: string,
    execution: ExecutionType,
    paymantDate: string,
    paymantEndDate: string,
    interval: DateInterval,
    usdBase: boolean,
    secondaryCurrency: CoinsName | null,
    secondaryAmount: string | null,
    secondaryUsdBase: boolean | null,
    taskId: string | null,
}
