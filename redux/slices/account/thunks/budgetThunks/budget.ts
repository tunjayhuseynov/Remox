import { createAsyncThunk } from "@reduxjs/toolkit";
import { Create_Budget, Delete_Budget, Update_Budget } from "crud/budget";
import { Get_Budget_Exercise, Update_Budget_Exercise } from "crud/budget_exercise";
import { IBudget, IBudgetTX } from "firebaseConfig";
import { IBudgetORM } from "pages/api/budget/index.api";
import { RootState } from "redux/store";
import { generatePriceCalculation } from "utils/const";
import { addBudget, addTxToBudget, deleteBudget, removeTxFromBudget, updateBudget } from "../../remoxData";


interface IBaseBudget {
    budget: IBudget;
}

interface IBaseOrmBudget {
    budget: IBudgetORM;
}

interface IBudgetAndTx extends IBaseOrmBudget {
    tx: IBudgetTX,
    isExecuted: boolean,
    txIndex?: number
}

/*Budget */
/*Budget */
/*Budget */

export const Create_Budget_Thunk = createAsyncThunk<void, IBaseBudget>("remoxData/create_budget", async ({ budget }, api) => {

    await Create_Budget(budget);
    const exercise = await Get_Budget_Exercise(budget.parentId);
    (exercise.budgets as IBudget[]) = [...exercise.budgets as IBudget[], budget];
    await Update_Budget_Exercise(exercise)

    api.dispatch(addBudget({
        ...budget,
        tags: [],
        subbudgets: budget.subbudgets.map(sub => {

            return {
                ...sub,
                budgetCoins: {
                    coin: sub.token,
                    totalAmount: sub.amount,
                    totalUsedAmount: 0,
                    totalPending: 0,
                    fiat: sub.fiatMoney,
                    second: sub.secondToken && sub.secondAmount ? {
                        secondCoin: sub.secondToken,
                        fiat: sub.secondFiatMoney,
                        secondTotalPending: 0,
                        secondAmount: sub.secondAmount,
                        secondTotalAmount: sub.secondAmount,
                        secondTotalUsedAmount: 0,
                    } : null,
                }
            }
        }),
        budgetCoins: {
            coin: budget.token,
            totalAmount: budget.amount,
            totalPending: 0,
            totalUsedAmount: 0,
            fiat: budget.fiatMoney,
            second: budget.secondToken && budget.secondAmount ? {
                secondCoin: budget.secondToken,
                fiat: budget.secondFiatMoney,
                secondTotalPending: 0,
                secondTotalAmount: budget.secondAmount,
                secondTotalUsedAmount: 0,
            } : null,
        },
    }))
})

export const Add_Tx_To_Budget_Thunk = createAsyncThunk<void, IBudgetAndTx>("remoxData/add_tx_to_budget", async ({ budget, tx, isExecuted, txIndex }, api) => {
    const state = api.getState() as RootState
    const currencies = state.remoxData.coins
    const preference = state.remoxData.storage?.organization?.fiatMoneyPreference ?? state.remoxData.storage?.individual.fiatMoneyPreference ?? "USD"

    await Update_Budget({ ...budget, txs: [...budget.txs, tx] })
    const currency = currencies[tx.token];

    let amount = tx.amount;
    if ((budget.budgetCoins.coin === tx.token && budget.fiatMoney)) {
        amount = tx.amount * generatePriceCalculation({ ...currency, amount: tx.amount } as any, state.remoxData.historyPriceList, preference, budget.fiatMoney)
    } else if (budget.budgetCoins.second?.secondCoin === tx.token && budget.secondFiatMoney) {
        amount = tx.amount * generatePriceCalculation({ ...currency, amount: tx.amount } as any, state.remoxData.historyPriceList, preference, budget.secondFiatMoney)
    }

    api.dispatch(addTxToBudget({
        budget,
        tx: {
            ...tx,
            amount,
        },
        currency,
        isTxExecuted: isExecuted,
        txIndexInCM: txIndex
    }))

})

export const Remove_Tx_From_Budget_Thunk = createAsyncThunk<void, IBudgetAndTx>("remoxData/remove_tx_from_budget", async ({ budget, tx, isExecuted, txIndex }, api) => {
    const state = api.getState() as RootState
    const currencies = state.remoxData.coins
    const preference = state.remoxData.storage?.organization?.fiatMoneyPreference ?? state.remoxData.storage?.individual.fiatMoneyPreference ?? "USD"
    await Update_Budget({
        amount: budget.amount,
        created_at: budget.created_at,
        id: budget.id,
        name: budget.name,
        customPrice: budget.customPrice,
        secondCustomPrice: budget.secondCustomPrice,
        secondFiatMoney: budget.secondFiatMoney,
        fiatMoney: budget.fiatMoney,
        parentId: budget.parentId,
        secondAmount: budget.secondAmount,
        secondToken: budget.secondToken,
        subbudgets: budget.subbudgets,
        token: budget.token,
        txs: budget.txs.filter(s => s.contractAddress.toLowerCase() !== tx.contractAddress.toLowerCase() && s.hashOrIndex.toLowerCase() !== tx.hashOrIndex.toLowerCase())
    })
    const currency = currencies[tx.token];

    let amount = tx.amount;
    if ((budget.budgetCoins.coin === tx.token && budget.fiatMoney)) {
        amount = tx.amount * generatePriceCalculation({ ...currency, amount: tx.amount } as any, state.remoxData.historyPriceList, preference, budget.fiatMoney)
    } else if (budget.budgetCoins.second?.secondCoin === tx.token && budget.secondFiatMoney) {
        amount = tx.amount * generatePriceCalculation({ ...currency, amount: tx.amount } as any, state.remoxData.historyPriceList, preference, budget.secondFiatMoney)
    }

    api.dispatch(removeTxFromBudget({
        budget,
        tx: {
            ...tx,
            amount
        },
        currency,
        isTxExecuted: isExecuted,
        txIndexInCM: txIndex
    }))

})

export const Update_Budget_Thunk = createAsyncThunk<void, IBaseOrmBudget>("remoxData/update_budget", async ({ budget }, api) => {
    await Update_Budget(budget);
    api.dispatch(updateBudget(budget));
})

export const Delete_Budget_Thunk = createAsyncThunk<void, IBaseOrmBudget>("remoxData/delete_budget", async ({ budget }, api) => {
    const exercise = await Get_Budget_Exercise(budget.parentId);
    exercise.budgets = (exercise.budgets as IBudget[]).filter(b => b.id !== budget.id)
    await Update_Budget_Exercise(exercise)
    await Delete_Budget(budget);
    api.dispatch(deleteBudget(budget))
})