import { BASE_URL, fromMinScale, IPrice } from "utils/api";
import { ERC20MethodIds, IBatchRequest, IFormattedTransaction, ITransfer } from "hooks/useTransactionProcess";
import { NextApiRequest, NextApiResponse } from "next";
import date from 'date-and-time'
import axios from "axios";
import { FirestoreRead } from "rpcHooks/useFirebase";
import { BlockchainType } from "hooks/walletSDK/useWalletKit";
import { ITag } from "../tags";
import { ATag, CoinStats, ISpendingResponse } from "./_spendingType";

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse<ISpendingResponse>
) {
    try {
        const addresses = req.query["addresses[]"];
        const parsedAddress = typeof addresses === "string" ? [addresses] : addresses;

        const inTxs = req.query["txs[]"];

        // if (!parsedAddress) {
        //     return res.status(200).json(TxNull());
        // }

        const parsedtxs = typeof inTxs === "string" ? [inTxs] : inTxs;

        const blockchain = req.query.blockchain as BlockchainType;
        const authId = req.query.id as string;



        let specificTxs;
        if (parsedtxs && parsedtxs.length > 0) {
            specificTxs = await axios.get(BASE_URL + "/api/transactions", {
                params: {
                    addresses: parsedAddress,
                    blockchain: blockchain,
                    txs: parsedtxs
                }
            })
        } else {
            specificTxs = await axios.get(BASE_URL + "/api/transactions", {
                params: {
                    addresses: parsedAddress,
                    blockchain: blockchain,
                }
            })
        }

        const prices = await axios.get(BASE_URL + "/api/calculation/price", {
            params: {
                addresses: parsedAddress,
                blockchain: blockchain
            }
        })

        const myTags = await FirestoreRead<{ tags: ITag[] }>("tags", authId)

        const allTxs = specificTxs.data

        const coinsSpending = CoinsAndSpending(allTxs, parsedAddress, prices.data.AllPrices, blockchain)
        const average = AverageMonthlyAndTotalSpending(allTxs, parsedAddress, prices.data.AllPrices, blockchain)
        const { AccountIn: AccountInWeek, AccountOut: AccountOutWeek, TotalInOut: TotalWeek } = await AccountInOut(allTxs, prices.data.TotalBalance, parsedAddress, 7, prices.data.AllPrices, blockchain)
        const { AccountIn: AccountInMonth, AccountOut: AccountOutMonth, TotalInOut: TotalMonth } = await AccountInOut(allTxs, prices.data.TotalBalance, parsedAddress, 30, prices.data.AllPrices, blockchain)
        const { AccountIn: AccountInQuart, AccountOut: AccountOutQuart, TotalInOut: TotalQuart } = await AccountInOut(allTxs, prices.data.TotalBalance, parsedAddress, 90, prices.data.AllPrices, blockchain)
        const { AccountIn: AccountInYear, AccountOut: AccountOutYear, TotalInOut: TotalYear } = await AccountInOut(allTxs, prices.data.TotalBalance, parsedAddress, 365, prices.data.AllPrices, blockchain)
        const { AccountIn: AccountInCM, AccountOut: AccountOuCM, TotalInOut: TotalCM } = await AccountInOut(allTxs, prices.data.TotalBalance, parsedAddress, new Date().getDay() + 1, prices.data.AllPrices, blockchain)

        const { inATag: inATag7, outATag: outATag7 } = SpendingAccordingTags(myTags?.tags ?? [], allTxs, parsedAddress, 7, prices.data.AllPrices, blockchain)
        const { inATag: inATag30, outATag: outATag30 } = SpendingAccordingTags(myTags?.tags ?? [], allTxs, parsedAddress, 30, prices.data.AllPrices, blockchain)
        const { inATag: inATag90, outATag: outATag90 } = SpendingAccordingTags(myTags?.tags ?? [], allTxs, parsedAddress, 90, prices.data.AllPrices, blockchain)
        const { inATag: inATag365, outATag: outATag365 } = SpendingAccordingTags(myTags?.tags ?? [], allTxs, parsedAddress, 365, prices.data.AllPrices, blockchain)
        const { inATag: inATagCM, outATag: outATagCM } = SpendingAccordingTags(myTags?.tags ?? [], allTxs, parsedAddress, new Date().getDay() + 1, prices.data.AllPrices, blockchain)


        const age = AccountAge(allTxs)
        const percentChange = TotalBalanceChangePercent(prices.data.AllPrices)

        res.status(200).json({
            CoinStats: coinsSpending,
            AverageSpend: average.average,
            TotalSpend: average.total,
            AccountAge: age,
            TotalBalance: prices.data.TotalBalance,
            AccountTotalBalanceChangePercent: percentChange,
            TotalBalanceByDay: {
                currentMonth: TotalCM,
                year: TotalYear,
                quart: TotalQuart,
                month: TotalMonth,
                week: TotalWeek
            },
            AccountIn: {
                week: AccountInWeek,
                month: AccountInMonth,
                quart: AccountInQuart,
                year: AccountInYear,
                currentMonth: AccountInCM
            },
            AccountOut: {
                week: AccountOutWeek,
                month: AccountOutMonth,
                quart: AccountOutQuart,
                year: AccountOutYear,
                currentMonth: AccountOuCM
            },
            AccountInTag: {
                week: inATag7,
                month: inATag30,
                quart: inATag90,
                year: inATag365,
                currentMonth: inATagCM
            },
            AccountOutTag: {
                week: outATag7,
                month: outATag30,
                quart: outATag90,
                year: outATag365,
                currentMonth: outATagCM
            }
        })
    } catch (error) {
        console.error((error as any).message)
        res.status(500).json({
            "message": (error as any).message
        } as any)
    }
}


const CoinsAndSpending = (transactions: IFormattedTransaction[], selectedAccounts: string[], currencies: IPrice, blockchain: BlockchainType) => {
    if (!transactions || transactions.length === 0) return [];

    let sum: CoinStats[] = []

    transactions.forEach(transaction => {
        if (selectedAccounts.some(s => s.toLowerCase() === transaction.rawData.from.toLowerCase()) && currencies) {
            if (transaction.id === ERC20MethodIds.transfer || transaction.id === ERC20MethodIds.transferFrom || transaction.id === ERC20MethodIds.transferWithComment) {
                const tx = transaction as ITransfer;
                sum.push({
                    coin: tx.rawData.tokenSymbol,
                    totalSpending: +fromMinScale(blockchain)(tx.amount),
                })
            }
            if (transaction.id === ERC20MethodIds.noInput) {
                sum.push({
                    coin: transaction.rawData.tokenSymbol,
                    totalSpending: +fromMinScale(blockchain)(transaction.rawData.value),
                })
            }
            if (transaction.id === ERC20MethodIds.batchRequest) {
                const tx = transaction as IBatchRequest;
                tx.payments.forEach(transfer => {
                    sum.push({
                        coin: transfer.coinAddress.name,
                        totalSpending: +fromMinScale(blockchain)(transfer.amount),
                    })
                })
            }
        }
    })
    return sum;
}
const AverageMonthlyAndTotalSpending = (transactions: IFormattedTransaction[], selectedAccounts: string[], currencies: IPrice, blockchain: BlockchainType) => {
    if (transactions.length === 0) return {
        average: 0,
        total: 0
    };
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
    return {
        average: average / months,
        total: average
    };
}

const AccountInOut = async (transactions: IFormattedTransaction[], TotalBalance: number, selectedAccounts: string[], selectedDay: number, currencies: IPrice, blockchain: BlockchainType) => {
    let myin = 0;
    let myout = 0;
    const calendarOut: {
        [key: string]: number
    } = {}
    const calendarIn: {
        [key: string]: number
    } = {}

    let TotalInOut: {
        [key: string]: number
    } = {}

    const stringTime = (time: Date) => `${time.getMonth() + 1}/${time.getDate()}/${time.getFullYear()}`

    transactions.forEach(t => {
        const isOut = selectedAccounts.some(s => s.toLowerCase() === t.rawData.from.toLowerCase());
        const tTime = new Date(parseInt(t.rawData.timeStamp) * 1e3)
        const tDay = Math.abs(date.subtract(new Date(), tTime).toDays());
        const sTime = stringTime(tTime)
        if (tDay <= selectedDay) {
            let calc = 0;
            if (t.id === ERC20MethodIds.transfer || t.id === ERC20MethodIds.transferFrom || t.id === ERC20MethodIds.transferWithComment) {
                const tx = t as ITransfer;
                const current = (Number(fromMinScale(blockchain)(tx.amount)) * Number(currencies[tx.rawData.tokenSymbol]?.price ?? 1));
                if (isOut) calendarOut[sTime] = calendarOut[sTime] ? calendarOut[sTime] + current : current;
                else calendarIn[sTime] = calendarIn[sTime] ? calendarIn[sTime] + current : current;
                calc += current;
            }
            if (t.id === ERC20MethodIds.noInput) {
                const current = (Number(fromMinScale(blockchain)(t.rawData.value)) * Number(currencies[t.rawData.tokenSymbol]?.price ?? 1))
                if (isOut) calendarOut[sTime] = calendarOut[sTime] ? calendarOut[sTime] + current : current;
                else calendarIn[sTime] = calendarIn[sTime] ? calendarIn[sTime] + current : current;
                calc += current;
            }
            if (t.id === ERC20MethodIds.batchRequest) {
                const tx = t as IBatchRequest;
                tx.payments.forEach(transfer => {
                    const current = (Number(fromMinScale(blockchain)(transfer.amount)) * Number(currencies[transfer.coinAddress.name]?.price ?? 1));
                    if (isOut) calendarOut[sTime] = calendarOut[sTime] ? calendarOut[sTime] + current : current;
                    else calendarIn[sTime] = calendarIn[sTime] ? calendarIn[sTime] + current : current;
                    calc += current;
                })
            }
            if (isOut) {
                TotalInOut[sTime] = TotalInOut[sTime] ? TotalInOut[sTime] - calc : -1 * calc;
                myout += calc
            } else {
                TotalInOut[sTime] = TotalInOut[sTime] ? TotalInOut[sTime] + calc : calc;
                myin += calc
            }
        }
    })
    let tv = TotalBalance;
    const totalInOut = Object.entries(TotalInOut)
    TotalInOut = totalInOut.reduce<{ [name: string]: number }>((a, [key, value]) => {
        tv += value;
        a[key] = tv;
        return a;
    }, {})

    const currTime = stringTime(new Date());
    if (!TotalInOut[currTime]) TotalInOut[stringTime(new Date())] = TotalBalance;
    if (totalInOut.length === 0) {
        TotalInOut[stringTime(date.addDays(new Date(), -selectedDay))] = TotalBalance
        TotalInOut[stringTime(new Date())] = TotalBalance;
    }

    return {
        AccountIn: {
            total: myin,
            ...calendarIn
        },
        AccountOut: {
            total: myout,
            ...calendarOut
        },
        TotalInOut
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

const SpendingAccordingTags = (tags: ITag[], transactions: IFormattedTransaction[], selectedAccounts: string[], selectedDay: number, currencies: IPrice, blockchain: BlockchainType) => {
    let outATag: ATag[] = []
    let inATag: ATag[] = []
    tags.forEach((tag: ITag) => {
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

const TxNull: () => ISpendingResponse = () => ({
    AccountAge: 0,
    AccountIn: {
        currentMonth: {
            total: 0,
        },
        month: {
            total: 0,
        },
        quart: {
            total: 0,
        },
        week: {
            total: 0,
        },
        year: {
            total: 0,
        }
    },
    AccountInTag: {
        currentMonth: [],
        month: [],
        quart: [],
        week: [],
        year: []
    },
    AccountOut: {
        currentMonth: {
            total: 0,
        },
        month: {
            total: 0,
        },
        quart: {
            total: 0,
        },
        week: {
            total: 0,
        },
        year: {
            total: 0,
        }
    },
    AccountOutTag: {
        currentMonth: [],
        month: [],
        quart: [],
        week: [],
        year: []
    },
    AccountTotalBalanceChangePercent: 0,
    AverageSpend: 0,
    CoinStats: [],
    TotalBalance: 0,
    TotalBalanceByDay: {
        currentMonth: {},
        month: {},
        quart: {},
        week: {},
        year: {}
    },
    TotalSpend: 0,
}) 