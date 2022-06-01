import { BASE_URL, BlockchainType, fromMinScale, IPrice } from "utils/api";
import { ERC20MethodIds, IBatchRequest, IFormattedTransaction, ITransfer } from "hooks/useTransactionProcess";
import { NextApiRequest, NextApiResponse } from "next";
import date from 'date-and-time'
import axios from "axios";
import { ATag } from "subpages/dashboard/insight/boxmoney";
import { Tag } from "apiHooks/useTags";
import { FirestoreRead } from "apiHooks/useFirebase";

export interface ISpendingResponse {
    AverageSpend: number,
    AccountAge: number,
    TotalBalance: number,
    AccountTotalBalanceChangePercent: number,
    AccountIn: {
        month: number,
        quart: number,
        year: number,
        currentMonth: number
    },
    AccountOut: {
        month: number,
        quart: number,
        year: number,
        currentMonth: number
    },
    AccountInTag: {
        month: ATag[],
        quart: ATag[],
        year: ATag[],
        currentMonth: ATag[]
    },
    AccountOutTag: {
        month: ATag[],
        quart: ATag[],
        year: ATag[],
        currentMonth: ATag[]
    }
}


export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse<ISpendingResponse>
) {
    try {
        const addresses = req.query["addresses[]"];
        const parsedAddress = typeof addresses === "string" ? [addresses] : addresses;
        const blockchain = req.query.blockchain as BlockchainType;
        const authId = req.query.id as string;

        const txs = await axios.get(BASE_URL + "/api/transactions", {
            params: {
                addresses: parsedAddress,
                blockchain: blockchain
            }
        })

        const prices = await axios.get(BASE_URL + "/api/calculation/price", {
            params: {
                addresses: parsedAddress,
                blockchain: blockchain
            }
        })

        const myTags = await FirestoreRead<{ tags: Tag[] }>("tags", authId)

        const average = AverageMonthlySpending(txs.data, parsedAddress, prices.data.AllPrices, blockchain)
        const { AccountIn: AccountInMonth, AccountOut: AccountOutMonth } = await AccountInOut(txs.data, parsedAddress, 30, prices.data.AllPrices, blockchain)
        const { AccountIn: AccountInQuart, AccountOut: AccountOutQuart } = await AccountInOut(txs.data, parsedAddress, 90, prices.data.AllPrices, blockchain)
        const { AccountIn: AccountInYear, AccountOut: AccountOutYear } = await AccountInOut(txs.data, parsedAddress, 365, prices.data.AllPrices, blockchain)
        const { AccountIn: AccountInCM, AccountOut: AccountOuCM } = await AccountInOut(txs.data, parsedAddress, new Date().getDay() + 1, prices.data.AllPrices, blockchain)

        const { inATag: inATag30, outATag: outATag30 } = SpendingAccordingTags(myTags?.tags ?? [], txs.data, parsedAddress, 30, prices.data.AllPrices, blockchain)
        const { inATag: inATag90, outATag: outATag90 } = SpendingAccordingTags(myTags?.tags ?? [], txs.data, parsedAddress, 90, prices.data.AllPrices, blockchain)
        const { inATag: inATag365, outATag: outATag365 } = SpendingAccordingTags(myTags?.tags ?? [], txs.data, parsedAddress, 365, prices.data.AllPrices, blockchain)
        const { inATag: inATagCM, outATag: outATagCM } = SpendingAccordingTags(myTags?.tags ?? [], txs.data, parsedAddress, new Date().getDay() + 1, prices.data.AllPrices, blockchain)


        const age = AccountAge(txs.data)
        const percentChange = TotalBalanceChangePercent(prices.data.AllPrices)

        res.status(200).json({
            AverageSpend: average,
            AccountAge: age,
            TotalBalance: prices.data.TotalBalance,
            AccountTotalBalanceChangePercent: percentChange,
            AccountIn: {
                month: AccountInMonth,
                quart: AccountInQuart,
                year: AccountInYear,
                currentMonth: AccountInCM
            },
            AccountOut: {
                month: AccountOutMonth,
                quart: AccountOutQuart,
                year: AccountOutYear,
                currentMonth: AccountOuCM
            },
            AccountInTag: {
                month: inATag30,
                quart: inATag90,
                year: inATag365,
                currentMonth: inATagCM
            },
            AccountOutTag: {
                month: outATag30,
                quart: outATag90,
                year: outATag365,
                currentMonth: outATagCM
            }
        })
    } catch (error) {
        res.json(error as any)
        res.status(405).end()
    }
}


const AverageMonthlySpending = (transactions: IFormattedTransaction[], selectedAccounts: string[], currencies: IPrice, blockchain: BlockchainType) => {
    let average = 0;
    let oldest: IFormattedTransaction = transactions[0];

    let timeIndex = Math.ceil(new Date().getTime() / 1000);
    transactions.forEach(transaction => {
        if (Number(transaction.rawData.timeStamp) < timeIndex) {
            timeIndex = Number(transaction.rawData.timeStamp);
            oldest = transaction;
        }
        if (selectedAccounts.some(s => s.toLowerCase() === transaction.rawData.from.toLowerCase()) && currencies) {
            if (transaction.id === ERC20MethodIds.transfer || transaction.id === ERC20MethodIds.transferFrom || transaction.id === ERC20MethodIds.transferWithComment) {
                const tx = transaction as ITransfer;
                average += (Number(fromMinScale(blockchain)(tx.amount)) * Number(currencies[tx.rawData.tokenSymbol]?.price ?? 1));
            }
            if (transaction.id === ERC20MethodIds.noInput) {
                average += (Number(fromMinScale(blockchain)(transaction.rawData.value)) * Number(currencies[transaction.rawData.tokenSymbol]?.price ?? 1));
            }
            if (transaction.id === ERC20MethodIds.batchRequest) {
                const tx = transaction as IBatchRequest;
                tx.payments.forEach(transfer => {
                    average += (Number(fromMinScale(blockchain)(transfer.amount)) * Number(currencies[transfer.coinAddress.name]?.price ?? 1));
                })
            }
        }
    })
    const days = date.subtract(new Date(), new Date(Number(oldest.rawData.timeStamp) * 1000)).toDays()
    const months = Math.ceil(Math.abs(days) / 30)
    return average / months;
}

const AccountInOut = async (transactions: IFormattedTransaction[], selectedAccounts: string[], selectedDay: number, currencies: IPrice, blockchain: BlockchainType) => {
    let myin = 0;
    let myout = 0;
    transactions.forEach(t => {
        const tTime = new Date(parseInt(t.rawData.timeStamp) * 1e3)
        if (Math.abs(date.subtract(new Date(), tTime).toDays()) <= selectedDay) {
            let calc = 0;
            if (t.id === ERC20MethodIds.transfer || t.id === ERC20MethodIds.transferFrom || t.id === ERC20MethodIds.transferWithComment) {
                const tx = t as ITransfer;
                calc += (Number(fromMinScale(blockchain)(tx.amount)) * Number(currencies[tx.rawData.tokenSymbol]?.price ?? 1));
            }
            if (t.id === ERC20MethodIds.noInput) {
                calc += (Number(fromMinScale(blockchain)(t.rawData.value)) * Number(currencies[t.rawData.tokenSymbol]?.price ?? 1));
            }
            if (t.id === ERC20MethodIds.batchRequest) {
                const tx = t as IBatchRequest;
                tx.payments.forEach(transfer => {
                    calc += (Number(fromMinScale(blockchain)(transfer.amount)) * Number(currencies[transfer.coinAddress.name]?.price ?? 1));
                })
            }
            if (selectedAccounts.some(s => s.toLowerCase() === t.rawData.from.toLowerCase())) {
                myout += calc
            } else {
                myin += calc
            }
        }
    })

    return {
        AccountIn: myin,
        AccountOut: myout
    }
}

const AccountAge = (transactions: IFormattedTransaction[]) => {
    if (transactions && transactions.length > 0) {
        let oldest: IFormattedTransaction = transactions[0];

        let timeIndex = Math.ceil(new Date().getTime() / 1000);
        transactions.forEach(transaction => {
            if (Number(transaction.rawData.timeStamp) < timeIndex) {
                timeIndex = Number(transaction.rawData.timeStamp);
                oldest = transaction;
            }
        })

        return Math.abs(date.subtract(new Date(), new Date(Number(oldest.rawData.timeStamp) * 1000)).toDays()) / 30
    } else return 0
}

const TotalBalanceChangePercent = (currencies: IPrice) => {
    if (currencies) {
        const currencObj = Object.values(currencies)

        let indexable = 0;
        const per = currencObj.reduce((a, c, index) => {
            if (c.amount > 0) {
                a += c.per_24
                indexable++
            }
            return a;
        }, 0)

        return (per / indexable)
    }
    return 0;
}

const SpendingAccordingTags = (tags: Tag[], transactions: IFormattedTransaction[], selectedAccounts: string[], selectedDay: number, currencies: IPrice, blockchain: BlockchainType) => {
    let outATag: ATag[] = []
    let inATag: ATag[] = []
    tags.forEach((tag: Tag) => {
        let newInTag: ATag;
        let newOutTag: ATag;
        newInTag = {
            ...tag,
            txs: [],
            totalAmount: 0
        }
        newOutTag = {
            ...tag,
            txs: [],
            totalAmount: 0
        }
        tag.transactions.forEach(transaction => {
            const tx = transactions!.find((s: IFormattedTransaction) => s.rawData.hash.toLowerCase() === transaction.toLowerCase())
            if (tx && currencies) {
                const tTime = new Date(parseInt(tx.rawData.timeStamp) * 1e3)
                if (Math.abs(date.subtract(new Date(), tTime).toDays()) <= selectedDay) {
                    let amount = 0;
                    if (tx.id === ERC20MethodIds.transfer || tx.id === ERC20MethodIds.transferFrom || tx.id === ERC20MethodIds.transferWithComment) {
                        const txm = tx as ITransfer;
                        amount += (Number(fromMinScale(blockchain)(txm.amount)) * Number(currencies[txm.rawData.tokenSymbol]?.price ?? 1));
                    }
                    if (tx.id === ERC20MethodIds.noInput) {
                        amount += (Number(fromMinScale(blockchain)(tx.rawData.value)) * Number(currencies[tx.rawData.tokenSymbol]?.price ?? 1));
                    }
                    if (tx.id === ERC20MethodIds.batchRequest) {
                        const txm = tx as IBatchRequest;
                        txm.payments.forEach(transfer => {
                            amount += (Number(fromMinScale(blockchain)(transfer.amount)) * Number(currencies[transfer.coinAddress.name]?.price ?? 1));
                        })
                    }
                    if (selectedAccounts.some(s => s.toLowerCase() === tx.rawData.from.toLowerCase())) {
                        newOutTag.txs.push(tx)
                        newOutTag.totalAmount += amount
                    } else {
                        newInTag.txs.push(tx)
                        newInTag.totalAmount += amount
                    }
                }
            }
        })
        inATag.push(newInTag)
        outATag.push(newOutTag)
    })
    return {
        inATag,
        outATag
    }
}