import { FiatMoneyList, Image } from "firebaseConfig";
import { CoinsName } from "types/coins";

export enum DateInterval {
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
    auto = "Auto",
    manual = "Manual",
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
    paymantEndDate: number | null,
    lastCheckedDate?: number | null,
    checkedCount?: number,
    image: Image | null,
    taskId: string | null,
}
