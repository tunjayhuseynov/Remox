import { createSlice } from "@reduxjs/toolkit";
import { ISpendingResponse } from "pages/api/calculation/spending";
import { RootState } from "redux/store";
import { ATag } from "subpages/dashboard/insight/boxmoney";



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
type StateType = { stats: IAccountStats, rawStats: ISpendingResponse };
const initState: StateType = {
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
    },
    rawStats: {
        CoinStats: [],
        TotalSpend: 0,
        AccountAge: 0,
        AverageSpend: 0,
        AccountIn: {
            week: { total: 0 },
            month: { total: 0 },
            quart: { total: 0 },
            year: { total: 0 },
            currentMonth: { total: 0 }
        },
        AccountOut: {
            week: { total: 0 },
            month: { total: 0 },
            quart: { total: 0 },
            year: { total: 0 },
            currentMonth: { total: 0 }
        },
        AccountInTag: {
            week: [],
            month: [],
            quart: [],
            year: [],
            currentMonth: []
        },
        AccountOutTag: {
            week: [],
            month: [],
            quart: [],
            year: [],
            currentMonth: []
        },
        TotalBalance: 0,
        TotalBalanceByDay: {
            currentMonth: {},
            week: {},
            month: {},
            quart: {},
            year: {}
        },
        AccountTotalBalanceChangePercent: 0
    }
}


const AccountStatsSlice = createSlice({
    name: "accountstats",
    initialState: initState,
    reducers: {
        setAccountStats: (state: StateType, action: { payload: IAccountStats }) => {
            state.stats = action.payload;
        },
        setAccountRawStats: (state: StateType, action: { payload: ISpendingResponse }) => {
            state.rawStats = action.payload;
        }
    }
})

export const { setAccountStats, setAccountRawStats } = AccountStatsSlice.actions

export const SelectAccountStats = (state: RootState) => state.accountstats.stats
export const SelectRawStats = (state: RootState) => state.accountstats.rawStats

export default AccountStatsSlice.reducer

