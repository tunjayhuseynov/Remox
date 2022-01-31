import { DateInterval } from "API/useContributors";
import { CoinsName } from "../../coins";

export interface GetMember{
    take?: number;
    skip?: number;
    sortBy?: string;
}

export interface Member {
    id: string,
    name: string,
    address: string,
    currency: CoinsName,
    amount: string,
    teamId: string, 
    paymantDate: string,
    interval: DateInterval,
    usdBase: boolean,
    secondaryCurrency?: CoinsName,
    secondaryAmount?: string,
    secondaryUsdBase?: boolean,
}

export interface GetMemberResponse{
    members: Member[],
    total: number,
}