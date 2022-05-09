import { createSlice } from "@reduxjs/toolkit";
import { RootState } from "redux/store";
import { ATag } from "subpages/dashboard/insight/boxmoney";

export interface IMoneyFlow {
    month: number
    quart: number
    year: number,
    currentMonth: number
}
export interface ITagFlow {
    month: ATag[]
    quart: ATag[]
    year: ATag[],
    currentMonth: ATag[]
}

interface IAccountStats {
    isLoading: boolean;
    totalBalance: number;
    averageSpend: number;
    accountAge: number;
    lastIn: number | undefined;
    lastOut: number | undefined;
    accountInTag: ATag[] | undefined;
    accountOutTag: ATag[] | undefined;
    TotalBalancePercentage: number;
}

const initState: { stats: IAccountStats } = {
    stats: {
        isLoading: true,
        totalBalance: 0,
        averageSpend: 0,
        accountAge: 0,
        lastIn: 0,
        lastOut: 0,
        accountInTag: [],
        accountOutTag: [],
        TotalBalancePercentage: 0
    }
}


const AccountStatsSlice = createSlice({
    name: "accountstats",
    initialState: initState,
    reducers: {
        setAccountStats: (state, action: { payload: IAccountStats }) => {
            state.stats = action.payload;
        }
    }
})

export const { setAccountStats } = AccountStatsSlice.actions

export const SelectAccountStats = (state : RootState) => state.accountstats.stats 

export default AccountStatsSlice.reducer

