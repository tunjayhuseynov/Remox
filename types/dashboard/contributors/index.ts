import { FiatMoneyList, Image } from "firebaseConfig";
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
    fullname: string,
    first: string,
    last: string,
    address: string,
    amount: string,
    currency: string,
    fiat: FiatMoneyList | null,
    secondAmount: string | null,
    secondCurrency: string | null,
    fiatSecond: FiatMoneyList | null
    role: string,
    image: Image | null,
    compensation: string,
    teamId: string,
    execution: ExecutionType,
    paymantDate: number | string,
    paymantEndDate: number | string ,
    interval: DateInterval,
    taskId: string | null,
}
