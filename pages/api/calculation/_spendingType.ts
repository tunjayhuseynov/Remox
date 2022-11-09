import { IFormattedTransaction } from "hooks/useTransactionProcess"
import { AltCoins } from "types"
import { IPrice } from "utils/api"
import { ITag } from "../tags/index.api"

export type ATag = ITag & { txs: ITokenApiItem[] }

export interface IFlowDetailItem { amount: string, name: AltCoins, type: "in" | "out", fee: { name: AltCoins, amount: string } }
export interface IFlowDetail {
    [key: string]: IFlowDetailItem[],
    // total: number,
}

export interface ITokenApiItem {
    timeStamp: string,
    value: string,
    contractAddress: string,
    from: string,
    to: string,
    gas: string
    gasUsed: string
    gasPrice: string
    tokenDecimal: string
    tokenSymbol: string,
    hash: string
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

export interface CoinStats {
    coin: string
    totalSpending: number
}

export interface ISpendingResponse {
    CoinStats: CoinStats[],
    AccountAge: number,
    TotalBalance: IPrice,
    // TotalBalanceByDay: ITotalBalanceByDay,
    // AccountTotalBalanceChangePercent: number,
    Account: IFlowDetail,
    AccountInTag: ITagFlow,
    AccountOutTag: ITagFlow,
    Fee: {
        [key: string]: { name: AltCoins, amount: string }[]
    }
}