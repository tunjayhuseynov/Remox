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
    teamId: string,
    compensation: string,
    role: string,
    amount: string,
    currency: string,
    fiat: FiatMoneyList | null,
    secondAmount: string | null,
    secondCurrency: string | null,
    fiatSecond: FiatMoneyList | null
    address: string,
    execution: ExecutionType,
    interval: DateInterval,
    paymantDate: number ,
    paymantEndDate: number ,
    image: Image | null,
    taskId: string | null,
}
