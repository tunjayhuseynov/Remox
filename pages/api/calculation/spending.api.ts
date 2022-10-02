import { BASE_URL, DecimalConverter, IPrice } from "utils/api";
import { ERC20MethodIds, IBatchRequest, IFormattedTransaction, ISwap, ITransfer } from "hooks/useTransactionProcess";
import { NextApiRequest, NextApiResponse } from "next";
import axios from "axios";
import { FirestoreRead } from "rpcHooks/useFirebase";
import { ITag } from "../tags/index.api";
import { ATag, CoinStats, IFlowDetailItem, ISpendingResponse } from "./_spendingType";
import { Blockchains, BlockchainType } from "types/blockchains";
import BigNumber from "bignumber.js";
import axiosRetry from "axios-retry";
import { IPriceResponse } from "./price.api";
import { AltCoins } from "types";
import date from 'date-and-time';
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

        if (!parsedAddress) {
            return res.status(200).json(TxNull());
        }

        axiosRetry(axios, { retries: 10 });

        const parsedtxs = typeof inTxs === "string" ? [inTxs] : inTxs;

        const blockchainName = req.query.blockchain as BlockchainType["name"];
        const blockchain = Blockchains.find(b => b.name === blockchainName);
        if (!blockchain) throw new Error("Blockchain not found");

        const authId = req.query.id as string;

        let specificTxsReq;
        if (parsedtxs && parsedtxs.length > 0) {
            specificTxsReq = axios.get(BASE_URL + "/api/transactions", {
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
            specificTxsReq = axios.get(BASE_URL + "/api/transactions", {
                params: {
                    addresses: parsedAddress,
                    blockchain: blockchainName,
                }
            })
        }

        const pricesReq = axios.get<IPriceResponse>(BASE_URL + "/api/calculation/price", {
            params: {
                addresses: parsedAddress,
                blockchain: blockchainName
            }
        })

        const [specificTxs, prices] = await Promise.all([specificTxsReq, pricesReq]);

        const myTags = await FirestoreRead<{ tags: ITag[] }>("tags", authId)

        const allTxs = specificTxs.data
        const coinsSpending = CoinsAndSpending(allTxs, parsedAddress, prices.data.AllPrices, blockchain, coin, secondCoin)
        const AccountReq = await AccountInOut(allTxs, parsedAddress, 365, prices.data.AllPrices, blockchain)
        // const AccountReqWeek = AccountInOut(allTxs, parsedAddress, 7, prices.data.AllPrices, blockchain)
        // const AccountReqMonth = AccountInOut(allTxs, parsedAddress, 30, prices.data.AllPrices, blockchain)
        // const AccountReqQuart = AccountInOut(allTxs, parsedAddress, 90, prices.data.AllPrices, blockchain)
        // const AccountReqYear = AccountInOut(allTxs, parsedAddress, 365, prices.data.AllPrices, blockchain)
        // const AccountReqCM = AccountInOut(allTxs, parsedAddress, new Date().getDay() + 1, prices.data.AllPrices, blockchain)

        // const [
        //     { Account: AccountWeek, AccountAge },
        //     { Account: AccountMonth },
        //     { Account: AccountQuart },
        //     { Account: AccountYear },
        //     { Account: AccountCM }
        // ] = await Promise.all([AccountReqWeek, AccountReqMonth, AccountReqQuart, AccountReqYear, AccountReqCM])

        const { inATag: inATag7, outATag: outATag7 } = SpendingAccordingTags(myTags?.tags ?? [], allTxs, parsedAddress, 7, prices.data.AllPrices, blockchain)
        const { inATag: inATag30, outATag: outATag30 } = SpendingAccordingTags(myTags?.tags ?? [], allTxs, parsedAddress, 30, prices.data.AllPrices, blockchain)
        const { inATag: inATag90, outATag: outATag90 } = SpendingAccordingTags(myTags?.tags ?? [], allTxs, parsedAddress, 90, prices.data.AllPrices, blockchain)
        const { inATag: inATag365, outATag: outATag365 } = SpendingAccordingTags(myTags?.tags ?? [], allTxs, parsedAddress, 365, prices.data.AllPrices, blockchain)
        const { inATag: inATagCM, outATag: outATagCM } = SpendingAccordingTags(myTags?.tags ?? [], allTxs, parsedAddress, new Date().getDay() + 1, prices.data.AllPrices, blockchain)


        // const percentChange = TotalBalanceChangePercent(prices.data.AllPrices)

        res.status(200).json({
            CoinStats: coinsSpending,
            AccountAge: AccountReq.AccountAge,
            TotalBalance: prices.data.AllPrices,
            // AccountTotalBalanceChangePercent: percentChange,
            Account: {
                ...AccountReq.Account
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
            },
            Fee: AccountReq.feeAll
        })
    } catch (error) {
        console.error("Spending Api", (error as any))
        throw new Error(error as any)
    }
}


const CoinsAndSpending = (transactions: IFormattedTransaction[], selectedAccounts: string[], currencies: IPrice, blockchain: BlockchainType, coin?: string, secondCoin?: string) => {
    if (!transactions || transactions.length === 0) return [];

    let sum: CoinStats[] = []

    transactions.forEach(transaction => {
        if (selectedAccounts.some(s => s.toLowerCase() === transaction.rawData.from.toLowerCase()) && currencies) {
            if (transaction.id === ERC20MethodIds.transfer ||
                transaction.id === ERC20MethodIds.transferFrom ||
                transaction.id === ERC20MethodIds.transferWithComment ||
                transaction.id === ERC20MethodIds.automatedCanceled ||
                transaction.id === ERC20MethodIds.automatedTransfer ||
                transaction.id === ERC20MethodIds.repay ||
                transaction.id === ERC20MethodIds.deposit
            ) {
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
            if (transaction.id === ERC20MethodIds.batchRequest || transaction.id === ERC20MethodIds.automatedBatchRequest) {
                const tx = transaction as IBatchRequest;
                tx.payments.forEach(transfer => {
                    if (coin && transfer.coin.symbol !== coin) return
                    if (secondCoin && transfer.coin.symbol !== secondCoin) return
                    sum.push({
                        coin: transfer.coin.symbol,
                        totalSpending: DecimalConverter(new BigNumber(transfer.amount).div(transfer.coin.decimals).toNumber(), transfer.coin.decimals),
                    })
                })
            }
        }
    })
    return sum;
}


const AccountInOut = async (transactions: IFormattedTransaction[], selectedAccounts: string[], selectedDay: number, currencies: IPrice, blockchain: BlockchainType) => {
    try {
        let calendar: {
            [key: string]: IFlowDetailItem[]
        } = {}

        const feeAll: {
            [key: string]: { name: AltCoins, amount: string }[]
        } = {}


        const stringTime = (time: Date) => `${time.getFullYear()}/${time.getMonth() + 1 > 9 ? time.getMonth() + 1 : `0${time.getMonth() + 1}`}/${time.getDate() > 9 ? time.getDate() : `0${time.getDate()}`}`

        let oldest: IFormattedTransaction | null = null
        let timeIndex = Math.ceil(new Date().getTime() / 1000);

        let newest: number = 0;
        for (const txItem of transactions) {
            if (txItem.timestamp > newest) newest = txItem.timestamp
            if (Number(txItem.rawData.timeStamp) < timeIndex) {
                timeIndex = Number(txItem.rawData.timeStamp);
                oldest = txItem;
            }
            const isOut = !!selectedAccounts.find(s => s.toLowerCase() === txItem.rawData.from.toLowerCase());

            const tTime = new Date(parseInt(txItem.rawData.timeStamp) * 1e3)
            const tDay = Math.abs(date.subtract(new Date(Date.now()), tTime).toDays());
            const sTime = stringTime(tTime)

            if (tDay <= selectedDay) {
                let feeToken = currencies[txItem.rawData?.tokenSymbol?.toUpperCase() ?? txItem.rawData?.feeCurrency?.toUpperCase() ?? ""];

                const txFee = { name: feeToken, amount: ((+txItem.rawData.gasPrice) * (+txItem.rawData.gasUsed)).toString() }
                feeAll[sTime] = [...(feeAll?.[sTime] ?? []), txFee]

                if (!txItem.isError) {
                    if (txItem.id === ERC20MethodIds.transfer || txItem.id === ERC20MethodIds.transferFrom || txItem.id === ERC20MethodIds.transferWithComment || txItem.id === ERC20MethodIds.automatedTransfer || txItem.id === ERC20MethodIds.automatedCanceled) {
                        const tx = txItem as ITransfer;
                        if (!tx.coin) continue;
                        const current: IFlowDetailItem = { name: tx.coin, amount: tx.amount, type: isOut ? "out" : "in", fee: txFee };
                        calendar[sTime] = [...(calendar[sTime] ?? []), current];
                    }
                    if (txItem.id === ERC20MethodIds.noInput) {
                        const coin = (txItem as ITransfer).coin;
                        if (coin) {
                            const current: IFlowDetailItem = { name: coin, amount: txItem.rawData.value, type: isOut ? "out" : "in", fee: txFee };
                            calendar[sTime] = [...(calendar[sTime] ?? []), current];
                        }
                    }
                    if (txItem.id === ERC20MethodIds.batchRequest || txItem.id === ERC20MethodIds.automatedBatchRequest) {
                        const tx = txItem as IBatchRequest;
                        tx.payments.forEach(transfer => {
                            const current: IFlowDetailItem = { name: transfer.coin, amount: transfer.amount, type: isOut ? "out" : "in", fee: txFee };
                            calendar[sTime] = [...(calendar[sTime] ?? []), current];
                        })
                    }

                    if (txItem.id === ERC20MethodIds.swap) {
                        const tx = txItem as ISwap;

                        const currentInput: IFlowDetailItem = { name: tx.coinIn, amount: tx.amountIn, type: "out", fee: { amount: "0", name: feeToken } };
                        calendar[sTime] = [...(calendar[sTime] ?? []), currentInput];

                        const currentOutput: IFlowDetailItem = { name: tx.coinOutMin, amount: tx.amountOutMin, type: "in", fee: txFee };
                        calendar[sTime] = [...(calendar[sTime] ?? []), currentOutput];
                    }
                }
            }
        }

        // if (calendar[stringTime(new Date())] === undefined) calendar[stringTime(new Date())] = calendar[stringTime(new Date(newest * 1e3))] ?? []
        calendar = Object.entries(calendar).sort((([key1], [key2]) => new Date(key1).getTime() > new Date(key2).getTime() ? 1 : -1)).reduce<typeof calendar>((a, c) => { a[c[0]] = c[1]; return a; }, {})

        return {
            Account: {
                ...calendar
            },
            AccountAge: oldest ? Math.abs(date.subtract(new Date(), new Date(Number(oldest.rawData.timeStamp) * 1000)).toDays()) / 30 : 0,
            feeAll
        }
    } catch (error) {
        throw new Error(error as any)
    }
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
        }
        newOutTag = {
            ...tag,
            txs: [],
        }
        tag.transactions.forEach(transaction => {
            const tx = transactions!.find((s: IFormattedTransaction) => s.rawData.hash.toLowerCase() === transaction.hash.toLowerCase())
            if (tx && currencies) {
                const tTime = new Date(parseInt(tx.rawData.timeStamp) * 1e3)
                if (Math.abs(date.subtract(new Date(), tTime).toDays()) <= selectedDay) {
                    if (selectedAccounts.some(s => s.toLowerCase() === tx.rawData.from.toLowerCase())) {
                        newOutTag.txs.push(tx)
                    } else {
                        newInTag.txs.push(tx)
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
    Account: {

    },
    AccountInTag: {
        currentMonth: [],
        month: [],
        quart: [],
        week: [],
        year: []
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
    TotalBalance: {},
    TotalBalanceByDay: {
        currentMonth: {},
        month: {},
        quart: {},
        week: {},
        year: {}
    },
    TotalSpend: 0,
    Fee: {}
}) 