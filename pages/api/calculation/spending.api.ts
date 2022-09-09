import { BASE_URL, DecimalConverter, IPrice } from "utils/api";
import { ERC20MethodIds, IBatchRequest, IFormattedTransaction, ITransfer } from "hooks/useTransactionProcess";
import { NextApiRequest, NextApiResponse } from "next";
import date from 'date-and-time'
import axios from "axios";
import { FirestoreRead } from "rpcHooks/useFirebase";
import { ITag } from "../tags/index.api";
import { ATag, CoinStats, ISpendingResponse } from "./_spendingType.api";
import { Blockchains, BlockchainType } from "types/blockchains";
import BigNumber from "bignumber.js";

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse<ISpendingResponse>
) {
    try {
        const addresses = req.query["addresses[]"];
        const parsedAddress = typeof addresses === "string" ? [addresses] : addresses;
        const isTxNecessery = req.query["isTxNecessery"] === "true";
        const inTxs = req.query["txs[]"];
        const coin = req.query["coin"] as string;
        const secondCoin = req.query["secondCoin"] as string;

        // if (!parsedAddress) {
        //     return res.status(200).json(TxNull());
        // }

        const parsedtxs = typeof inTxs === "string" ? [inTxs] : inTxs;

        const blockchainName = req.query.blockchain as BlockchainType["name"];
        const blockchain = Blockchains.find(b => b.name === blockchainName);
        if (!blockchain) throw new Error("Blockchain not found");

        const authId = req.query.id as string;


        let specificTxs;
        if (parsedtxs && parsedtxs.length > 0) {
            specificTxs = await axios.get(BASE_URL + "/api/transactions", {
                params: {
                    addresses: parsedAddress,
                    blockchain: blockchainName,
                    txs: parsedtxs
                }
            })
        } else {
            if (isTxNecessery) {
                return res.status(200).json(TxNull());
            }
            specificTxs = await axios.get(BASE_URL + "/api/transactions", {
                params: {
                    addresses: parsedAddress,
                    blockchain: blockchainName,
                }
            })
        }

        const prices = await axios.get(BASE_URL + "/api/calculation/price", {
            params: {
                addresses: parsedAddress,
                blockchain: blockchainName
            }
        })

        const myTags = await FirestoreRead<{ tags: ITag[] }>("tags", authId)

        const allTxs = specificTxs.data
   
        const coinsSpending = CoinsAndSpending(allTxs, parsedAddress, prices.data.AllPrices, blockchain, coin, secondCoin)
        const average = AverageMonthlyAndTotalSpending(allTxs, parsedAddress, prices.data.AllPrices, blockchain, coin, secondCoin)

        const AccountReqWeek = AccountInOut(allTxs, prices.data.TotalBalance, parsedAddress, 7, prices.data.AllPrices, blockchain)
        const AccountReqMonth = AccountInOut(allTxs, prices.data.TotalBalance, parsedAddress, 30, prices.data.AllPrices, blockchain)
        const AccountReqQuart = AccountInOut(allTxs, prices.data.TotalBalance, parsedAddress, 90, prices.data.AllPrices, blockchain)
        const AccountReqYear = AccountInOut(allTxs, prices.data.TotalBalance, parsedAddress, 365, prices.data.AllPrices, blockchain)
        const AccountReqCM = AccountInOut(allTxs, prices.data.TotalBalance, parsedAddress, new Date().getDay() + 1, prices.data.AllPrices, blockchain)

        const [
            { AccountIn: AccountInWeek, AccountOut: AccountOutWeek, TotalInOut: TotalWeek },
            { AccountIn: AccountInMonth, AccountOut: AccountOutMonth, TotalInOut: TotalMonth },
            { AccountIn: AccountInQuart, AccountOut: AccountOutQuart, TotalInOut: TotalQuart },
            { AccountIn: AccountInYear, AccountOut: AccountOutYear, TotalInOut: TotalYear },
            { AccountIn: AccountInCM, AccountOut: AccountOuCM, TotalInOut: TotalCM }
        ] = await Promise.all([AccountReqWeek, AccountReqMonth, AccountReqQuart, AccountReqYear, AccountReqCM])

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
        throw new Error(error as any)
    }
}


const CoinsAndSpending = (transactions: IFormattedTransaction[], selectedAccounts: string[], currencies: IPrice, blockchain: BlockchainType, coin?: string, secondCoin?: string) => {
    if (!transactions || transactions.length === 0) return [];

    let sum: CoinStats[] = []
    console.log(coin)
    transactions.forEach(transaction => {
        if (selectedAccounts.some(s => s.toLowerCase() === transaction.rawData.from.toLowerCase()) && currencies) {
            if (transaction.id === ERC20MethodIds.transfer || transaction.id === ERC20MethodIds.transferFrom || transaction.id === ERC20MethodIds.transferWithComment) {
                const tx = transaction as ITransfer;
                if (!tx.coin.symbol) return
                if (coin && tx.coin.symbol !== coin) return
                if (secondCoin && tx.coin.symbol !== secondCoin) return
                sum.push({
                    coin: tx.coin.symbol,
                    totalSpending: DecimalConverter(tx.amount, tx.coin.decimals),
                })
            }
            if (transaction.id === ERC20MethodIds.noInput) {
                const currentCoin = (transaction as ITransfer).coin;
                if (!currentCoin) return
                if (coin && currentCoin.symbol !== coin) return
                if (secondCoin && currentCoin.symbol !== secondCoin) return
                sum.push({
                    coin: currentCoin.symbol,
                    totalSpending: DecimalConverter(transaction.rawData.value, currentCoin.decimals),
                })
            }
            if (transaction.id === ERC20MethodIds.batchRequest) {
                const tx = transaction as IBatchRequest;
                tx.payments.forEach(transfer => {
                    if (coin && transfer.coin.symbol !== coin) return
                    if (secondCoin && transfer.coin.symbol !== secondCoin) return
                    sum.push({
                        coin: transfer.coin.name,
                        totalSpending: new BigNumber(transfer.amount).div(transfer.coin.decimals).toNumber(),
                    })
                })
            }
        }
    })
    return sum;
}
const AverageMonthlyAndTotalSpending = (transactions: IFormattedTransaction[], selectedAccounts: string[], currencies: IPrice, blockchain: BlockchainType, coin?: string, secondCoin?: string) => {
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
                if (coin && tx.coin.symbol !== coin) return
                if (secondCoin && tx.coin.symbol !== secondCoin) return
                average += (DecimalConverter(tx.amount, tx.coin.decimals) * tx.coin.priceUSD ?? 1);
            }
            if (transaction.id === ERC20MethodIds.noInput) {
                const currentCoin = (transaction as ITransfer).coin;
                if (coin && currentCoin.symbol !== coin) return
                if (secondCoin && currentCoin.symbol !== secondCoin) return
                if (currentCoin) {
                    average += (DecimalConverter(transaction.rawData.value, currentCoin.decimals) * currentCoin.priceUSD ?? 1);
                }
            }
            if (transaction.id === ERC20MethodIds.batchRequest) {
                const tx = transaction as IBatchRequest;
                tx.payments.forEach(transfer => {
                    if (coin && transfer.coin.symbol !== coin) return
                    if (secondCoin && transfer.coin.symbol !== secondCoin) return
                    average += (DecimalConverter(transfer.amount, transfer.coin.decimals) * currencies[transfer.coin.symbol]?.priceUSD ?? 1);
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
    try {
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
                    if (!tx.coin) return
                    const current = (DecimalConverter(tx.amount, tx.coin.decimals) * Number(currencies[tx.coin.symbol]?.priceUSD ?? 1));
                    if (isOut) calendarOut[sTime] = calendarOut[sTime] ? calendarOut[sTime] + current : current;
                    else calendarIn[sTime] = calendarIn[sTime] ? calendarIn[sTime] + current : current;
                    calc += current;
                }
                if (t.id === ERC20MethodIds.noInput) {
                    const coin = (t as ITransfer).coin;
                    if (coin) {
                        const current = (DecimalConverter(t.rawData.value, coin.decimals) * coin.priceUSD ?? 1)
                        if (isOut) calendarOut[sTime] = calendarOut[sTime] ? calendarOut[sTime] + current : current;
                        else calendarIn[sTime] = calendarIn[sTime] ? calendarIn[sTime] + current : current;
                        calc += current;
                    }
                }
                if (t.id === ERC20MethodIds.batchRequest) {
                    const tx = t as IBatchRequest;
                    tx.payments.forEach(transfer => {
                        const current = (DecimalConverter(transfer.amount, transfer.coin.decimals) * Number(currencies[transfer.coin.name]?.priceUSD ?? 1));
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
    } catch (error) {
        throw new Error(error as any)
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
                a += c.percent
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
            const tx = transactions!.find((s: IFormattedTransaction) => s.rawData.hash.toLowerCase() === transaction.hash.toLowerCase())
            if (tx && currencies) {
                const tTime = new Date(parseInt(tx.rawData.timeStamp) * 1e3)
                if (Math.abs(date.subtract(new Date(), tTime).toDays()) <= selectedDay) {
                    let amount = 0;
                    if (tx.id === ERC20MethodIds.transfer || tx.id === ERC20MethodIds.transferFrom || tx.id === ERC20MethodIds.transferWithComment) {
                        const txm = tx as ITransfer;
                        if (!txm?.coin) return
                        amount += (DecimalConverter(txm.amount, txm.coin.decimals) * Number(currencies[txm.coin.symbol]?.priceUSD ?? 1));
                    }
                    if (tx.id === ERC20MethodIds.noInput) {
                        const coin = (tx as ITransfer).coin;
                        if (coin) {
                            amount += (DecimalConverter(tx.rawData.value, coin.decimals) * coin.priceUSD ?? 1);
                        }
                    }
                    if (tx.id === ERC20MethodIds.batchRequest) {
                        const txm = tx as IBatchRequest;
                        txm.payments.forEach(transfer => {
                            amount += (DecimalConverter(transfer.amount, transfer.coin.decimals) * Number(currencies[transfer.coin.name]?.priceUSD ?? 1));
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