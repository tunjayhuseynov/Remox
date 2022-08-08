import axios from "axios";
import { IBudget } from "firebaseConfig";
import { BlockchainType } from "types/blockchains";
import { BASE_URL } from "utils/api";
import { ISpendingResponse } from "../calculation/_spendingType.api";
import { IBudgetCoin, IBudgetORM, ISubbudgetORM } from "./index.api";
import { IPriceResponse } from "../calculation/price.api";
import { TxCal } from "./txCal";

export const CalculateBudget = async (budget: IBudget, parentId: string, parsedAddress: string[], blockchain: string, blockchainType: BlockchainType, prices: IPriceResponse) => {
    let totalBudgetCoin: IBudgetCoin, orm: IBudgetORM;
    const singleTxs = budget.txs.filter(tx => tx.contractType === "single");
    const multiTxs = budget.txs.filter(tx => tx.contractType === "multi");
    let totalBudget: number = 0, totalBudgetUsed: number = 0, totalBudgetPending: number = 0, totalBudgetAvailable: number = 0;
    let totalFirstCoinPending = 0, totalSecondCoinPending = 0, totalFirstCoinSpent = 0, totalSecondCoinSpent = 0;
    const spending = await axios.get<ISpendingResponse>(BASE_URL + "/api/calculation/spending", {
        params: {
            addresses: parsedAddress,
            blockchain: blockchain,
            txs: Array.from(new Set(singleTxs.map(s => s.hashOrIndex))),
            id: parentId,
            isTxNecessery: true
        }
    })

    const txMultisigResponse = await Promise.all(multiTxs.map(s => TxCal(budget, s, blockchainType)))
    txMultisigResponse.forEach(tx => {
        totalBudgetPending += tx.totalBudgetPending;
        totalBudgetUsed += tx.totalBudgetUsed;
        totalFirstCoinPending += tx.totalFirstCoinPending;
        totalSecondCoinPending += tx.totalSecondCoinPending;
        totalFirstCoinSpent += tx.totalFirstCoinSpent;
        totalSecondCoinSpent += tx.totalSecondCoinSpent;
    })

    totalBudget += ((budget.amount * prices.AllPrices[budget.token].price) + ((budget.secondAmount ?? 1) * (budget.secondToken ? prices.AllPrices[budget.secondToken].price : 0)));
    let budgetCoin: IBudgetCoin = {
        coin: budget.token,
        totalAmount: budget.amount,
        totalPending: totalFirstCoinPending,
        totalUsedAmount: (spending.data.CoinStats?.[0]?.totalSpending ?? 0) + totalFirstCoinSpent,
        second: budget.secondToken && budget.secondAmount && spending.data.CoinStats?.[1] ? {
            secondTotalAmount: budget.secondAmount,
            secondCoin: budget.secondToken,
            secondTotalPending: totalSecondCoinPending,
            secondTotalUsedAmount: spending.data.CoinStats[1].totalSpending + totalSecondCoinSpent
        } : null
    }

    totalBudgetCoin = budgetCoin


    totalBudgetUsed += spending.data.TotalSpend;
    totalBudgetAvailable += totalBudget - totalBudgetUsed - totalBudgetPending;

    /*Subbudget Calculation */
    /*Subbudget Calculation */
    /*Subbudget Calculation */
    let subbudgets: ISubbudgetORM[] = [];
    for (const subbudget of budget.subbudgets) {
        const singleTxs = subbudget.txs.filter(tx => tx.contractType === "single");
        const multiTxs = subbudget.txs.filter(tx => tx.contractType === "multi");
        let totalSubBudget: number = 0, totalSubUsed: number = 0, totalSubPending: number = 0, totalSubAvailable: number = 0;
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

        const txMultisigResponse = await Promise.all(multiTxs.map(s => TxCal(budget, s, blockchainType)))
        txMultisigResponse.forEach(tx => {
            totalSubPending += tx.totalBudgetPending;
            totalSubUsed += tx.totalBudgetUsed;
            totalSubFirstCoinPending += tx.totalFirstCoinPending;
            totalSubSecondCoinPending += tx.totalSecondCoinPending;
            totalSubFirstCoinSpent += tx.totalFirstCoinSpent;
            totalSubSecondCoinSpent += tx.totalSecondCoinSpent;
        })

        totalSubBudget += ((budget.amount * prices.AllPrices[budget.token].price) + ((budget.secondAmount ?? 1) * (budget.secondToken ? prices.AllPrices[budget.secondToken].price : 1)));

        let budgetCoin: IBudgetCoin = {
            coin: subbudget.token,
            totalAmount: subbudget.amount,
            totalPending: totalSubFirstCoinPending,
            totalUsedAmount: (spending.data.CoinStats?.[0]?.totalSpending ?? 0) + totalSubFirstCoinSpent,
            second: subbudget.secondToken && subbudget.secondAmount && spending.data.CoinStats?.[1] ? {
                secondTotalAmount: subbudget.secondAmount,
                secondCoin: subbudget.secondToken,
                secondTotalPending: totalSubSecondCoinPending,
                secondTotalUsedAmount: spending.data.CoinStats[1].totalSpending + totalSubSecondCoinSpent
            } : null
        }

        totalSubUsed += spending.data.TotalSpend;
        totalSubAvailable += totalSubBudget - totalSubUsed - totalSubPending;

        subbudgets.push({
            ...subbudget,
            totalBudget: totalSubBudget,
            totalPending: totalSubPending,
            budgetCoins: budgetCoin,
            totalAvailable: totalSubAvailable,
            totalUsed: totalSubUsed,
        })
    }
    /*Subbudget Calculation END*/
    /*Subbudget Calculation END*/
    /*Subbudget Calculation END */

    orm = {
        ...budget,
        totalBudget,
        totalUsed: totalBudgetUsed,
        totalAvailable: totalBudgetAvailable,
        totalPending: totalBudgetPending,
        budgetCoins: budgetCoin,
        subbudgets: subbudgets
    }

    return {
        orm,
        totalBudgetCoin,
    }
}