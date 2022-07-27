import { IFormattedTransaction } from "hooks/useTransactionProcess"
import { ITag } from "../tags/index.api"

export type ATag = ITag & { txs: IFormattedTransaction[], totalAmount: number }


export interface IFlowDetail {
    [key: string]: number,
    total: number,
}

export interface ITagFlow {
    week: ATag[],
    month: ATag[]
    quart: ATag[]
    year: ATag[],
    currentMonth: ATag[]
}


export interface IMoneyFlow {
    week: IFlowDetail
    month: IFlowDetail
    quart: IFlowDetail
    year: IFlowDetail,
    currentMonth: IFlowDetail
}

export interface ITotalBalanceByDay {
    week: Omit<IFlowDetail, "total">
    month: Omit<IFlowDetail, "total">
    quart: Omit<IFlowDetail, "total">
    year: Omit<IFlowDetail, "total">,
    currentMonth: Omit<IFlowDetail, "total">
}

export interface CoinStats {
    coin: string
    totalSpending: number
}

export interface ISpendingResponse {
    CoinStats: CoinStats[],
    AverageSpend: number,
    AccountAge: number,
    TotalBalance: number,
    TotalSpend: number,
    TotalBalanceByDay: ITotalBalanceByDay,
    AccountTotalBalanceChangePercent: number,
    AccountIn: IMoneyFlow,
    AccountOut: IMoneyFlow,
    AccountInTag: ITagFlow,
    AccountOutTag: ITagFlow,
}