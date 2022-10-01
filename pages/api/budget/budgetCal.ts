import axios from "axios";
import { IBudget, IBudgetTX } from "firebaseConfig";
import { BlockchainType } from "types/blockchains";
import { BASE_URL } from "utils/api";
import { ISpendingResponse, ITagFlow } from "../calculation/_spendingType";
import { IBudgetCoin, IBudgetORM, ISubbudgetORM } from "./index.api";
import { IPriceResponse } from "../calculation/price.api";
import { MultisigTxCal } from "./MultisigTxCal";
import { ITag } from "../tags/index.api";
import axiosRetry from "axios-retry";

export const CalculateBudget = async (budget: IBudget, parentId: string, parsedAddress: string[], blockchain: string, blockchainType: BlockchainType, prices: IPriceResponse, tags: ITag[]) => {
    let totalBudgetCoin: IBudgetCoin, orm: IBudgetORM;
    const singleTxs = budget.txs.filter(tx => tx.contractType === "single");
    const multiTxs = budget.txs.filter(tx => tx.contractType === "multi");

    let totalFirstCoinPending = 0, totalSecondCoinPending = 0, totalFirstCoinSpent = 0, totalSecondCoinSpent = 0;

    axiosRetry(axios, { retries: 10 });
    const spending = await axios.get<ISpendingResponse>(BASE_URL + "/api/calculation/spending", {
        params: {
            addresses: parsedAddress,
            blockchain: blockchain,
            txs: Array.from(new Set(singleTxs.map(s => s.hashOrIndex))),
            id: parentId,
            isTxNecessery: true,
            coin: budget.token,
            secondCoin: budget.secondToken ?? undefined
        }
    })

    const tagTxs: IBudgetORM["tags"] = [];

    for (const tag of tags) {
        const singleTxs = tag.transactions.filter(
            s => s.contractType == "single" && budget.txs.find(a => a.contractAddress.toLowerCase() === s.contractType.toLowerCase() && a.hashOrIndex.toLowerCase() === s.hash.toLowerCase())
        );
        const multiTxs = tag.transactions.filter(
            s => s.contractType == "multi" && budget.txs.find(a => a.contractAddress.toLowerCase() === s.contractType.toLowerCase() && a.hashOrIndex.toLowerCase() === s.hash.toLowerCase())
        );
        if (singleTxs.length === 0 && multiTxs.length == 0) {
            continue;
        }
        const tagSpending = singleTxs.length > 0 ? await axios.get<ISpendingResponse>(BASE_URL + "/api/calculation/spending", {
            params: {
                addresses: parsedAddress,
                blockchain: blockchain,
                txs: singleTxs.map(s => s.hash),
                id: parentId,
                isTxNecessery: true,
                coin: budget.token,
                secondCoin: budget.secondToken ?? undefined
            }
        }) : null;

        const coinParsed = tagSpending ? tagSpending.data.CoinStats.reduce<{ [name: string]: number }>((a, c) => {
            if (a[c.coin]) {
                a[c.coin] += c.totalSpending;
            } else {
                a[c.coin] = c.totalSpending;
            }
            return a;
        }, {}) : null

        const txMultisigResponse = await Promise.allSettled(multiTxs.map(s => MultisigTxCal(budget, {
            contractAddress: s.address,
            hashOrIndex: s.hash,
            protocol: s.provider ?? "",
        }, blockchainType, parentId)))

        tagTxs.push({
            tag: tag,
            budgetCoin: {
                coin: budget.token,
                totalAmount: budget.amount, //- (coinParsed[budget.token] ?? 0) - totalFirstCoinSpent - totalFirstCoinPending,
                totalPending: txMultisigResponse.reduce((a, c) => a + (c.status === "fulfilled" ? c.value.totalFirstCoinPending : 0), 0),
                totalUsedAmount: (coinParsed?.[budget.token] ?? 0) + txMultisigResponse.reduce((a, c) => a + (c.status === "fulfilled" ? c.value.totalFirstCoinSpent : 0), 0),
                second: budget.secondToken && budget.secondAmount ? {
                    secondTotalAmount: budget.secondAmount,// - totalSecondCoinPending - coinParsed[budget.secondToken] - totalSecondCoinSpent,
                    secondCoin: budget.secondToken,
                    secondTotalPending: txMultisigResponse.reduce((a, c) => a + (c.status === "fulfilled" ? c.value.totalSecondCoinPending : 0), 0),
                    secondTotalUsedAmount: (coinParsed?.[budget.secondToken] ?? 0) + txMultisigResponse.reduce((a, c) => a + (c.status === "fulfilled" ? c.value.totalSecondCoinSpent : 0), 0)
                } : null
            }
        })
    }


    const txMultisigResponse = await Promise.allSettled(multiTxs.map(s => MultisigTxCal(budget, s, blockchainType, parentId)))
    txMultisigResponse.forEach(tx => {
        if (tx.status === "fulfilled") {

            totalFirstCoinPending += tx.value.totalFirstCoinPending;
            totalSecondCoinPending += tx.value.totalSecondCoinPending;

            totalFirstCoinSpent += tx.value.totalFirstCoinSpent;
            totalSecondCoinSpent += tx.value.totalSecondCoinSpent;
        }
    })

    const coinParsed = spending.data.CoinStats.reduce<{ [name: string]: number }>((a, c) => {
        if (a[c.coin]) {
            a[c.coin] += c.totalSpending;
        } else {
            a[c.coin] = c.totalSpending;
        }
        return a;
    }, {})

    let budgetCoin: IBudgetCoin = {
        coin: budget.token,
        totalAmount: budget.amount, //- (coinParsed[budget.token] ?? 0) - totalFirstCoinSpent - totalFirstCoinPending,
        totalPending: totalFirstCoinPending,
        totalUsedAmount: (coinParsed?.[budget.token] ?? 0) + totalFirstCoinSpent,
        second: budget.secondToken && budget.secondAmount ? {
            secondTotalAmount: budget.secondAmount,// - totalSecondCoinPending - coinParsed[budget.secondToken] - totalSecondCoinSpent,
            secondCoin: budget.secondToken,
            secondTotalPending: totalSecondCoinPending,
            secondTotalUsedAmount: (coinParsed?.[budget.secondToken] ?? 0) + totalSecondCoinSpent
        } : null
    }

    totalBudgetCoin = budgetCoin


    /*Subbudget Calculation */
    /*Subbudget Calculation */
    /*Subbudget Calculation */
    let subbudgets: ISubbudgetORM[] = [];
    for (const subbudget of budget.subbudgets) {
        const singleTxs = subbudget.txs.filter(tx => tx.contractType === "single");
        const multiTxs = subbudget.txs.filter(tx => tx.contractType === "multi");

        let totalSubFirstCoinPending = 0, totalSubSecondCoinPending = 0, totalSubFirstCoinSpent = 0, totalSubSecondCoinSpent = 0;
        const spending = await axios.get<ISpendingResponse>(BASE_URL + "/api/calculation/spending", {
            params: {
                addresses: parsedAddress,
                blockchain: blockchain,
                txs: Array.from(new Set(singleTxs.map(s => s.hashOrIndex))),
                id: parentId,
                isTxNecessery: true
            }
        })

        const coinParsed = spending.data.CoinStats.reduce<{ [name: string]: number }>((a, c) => {
            if (a[c.coin]) {
                a[c.coin] += c.totalSpending;
            } else {
                a[c.coin] = c.totalSpending;
            }
            return a;
        }, {})


        const txMultisigResponse = await Promise.all(multiTxs.map(s => MultisigTxCal(budget, s, blockchainType, parentId)))
        txMultisigResponse.forEach(tx => {
            totalSubFirstCoinPending += tx.totalFirstCoinPending;
            totalSubSecondCoinPending += tx.totalSecondCoinPending;
            totalSubFirstCoinSpent += tx.totalFirstCoinSpent;
            totalSubSecondCoinSpent += tx.totalSecondCoinSpent;
        })

        let budgetCoin: IBudgetCoin = {
            coin: subbudget.token,
            totalAmount: subbudget.amount,
            totalPending: totalSubFirstCoinPending,
            totalUsedAmount: (coinParsed?.[budget.token] ?? 0) + totalSubFirstCoinSpent,
            second: subbudget.secondToken && subbudget.secondAmount ? {
                secondTotalAmount: subbudget.secondAmount,
                secondCoin: subbudget.secondToken,
                secondTotalPending: totalSubSecondCoinPending,
                secondTotalUsedAmount: (coinParsed?.[subbudget.secondToken] ?? 0) + totalSubSecondCoinSpent
            } : null
        }


        subbudgets.push({
            ...subbudget,
            budgetCoins: budgetCoin,
        })
    }
    /*Subbudget Calculation END*/
    /*Subbudget Calculation END*/
    /*Subbudget Calculation END */

    orm = {
        ...budget,
        budgetCoins: budgetCoin,
        subbudgets: subbudgets,
        tags: tagTxs
    }

    return {
        orm,
        totalBudgetCoin,
    }
}