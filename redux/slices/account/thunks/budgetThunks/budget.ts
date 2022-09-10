import { createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";
import { Create_Budget, Delete_Budget, Update_Budget } from "crud/budget";
import { Get_Budget_Exercise, Update_Budget_Exercise } from "crud/budget_exercise";
import { IBudget, IBudgetTX } from "firebaseConfig";
import { IMultisigSafeTransaction, ITransactionMultisig } from "hooks/walletSDK/useMultisig";
import { IBudgetORM } from "pages/api/budget/index.api";
import { RootState } from "redux/store";
import { addBudget, addTxToBudget, deleteBudget, removeTxFromBudget, updateBudget } from "../../remoxData";


interface IBaseBudget {
    budget: IBudget;
}

interface IBaseOrmBudget {
    budget: IBudgetORM;
}

interface IBudgetAndTx extends IBaseOrmBudget {
    tx: IBudgetTX,
    isExecuted: boolean
}

/*Budget */
/*Budget */
/*Budget */

export const Create_Budget_Thunk = createAsyncThunk<void, IBaseBudget>("remoxData/create_budget", async ({ budget }, api) => {
    const currencies = (api.getState() as RootState).remoxData.coins
    await Create_Budget(budget);
    const exercise = await Get_Budget_Exercise(budget.parentId);
    (exercise.budgets as IBudget[]) = [...exercise.budgets as IBudget[], budget];
    await Update_Budget_Exercise(exercise)
    const totalBudget = (currencies[budget.token].priceUSD * budget.amount) + ((currencies[budget?.secondToken ?? ""]?.priceUSD ?? 0) * (budget.secondAmount ?? 0))
    api.dispatch(addBudget({
        ...budget,
        totalBudget,
        totalPending: 0,
        totalUsed: 0,
        totalAvailable: totalBudget,
        subbudgets: budget.subbudgets.map(sub => {
            let totalBudget = (currencies[sub.token].priceUSD * sub.amount) + ((currencies[sub?.secondToken ?? ""]?.priceUSD ?? 0) * (sub.secondAmount ?? 0))
            return {
                ...sub,
                totalBudget,
                totalAvailable: totalBudget,
                totalUsed: 0,
                totalPending: 0,
                budgetCoins: {
                    coin: sub.token,
                    totalAmount: sub.amount,
                    totalUsedAmount: 0,
                    totalPending: 0,
                    second: sub.secondToken && sub.secondAmount ? {
                        secondCoin: sub.secondToken,
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
            second: budget.secondToken && budget.secondAmount ? {
                secondCoin: budget.secondToken,
                secondTotalPending: 0,
                secondTotalAmount: budget.secondAmount,
                secondTotalUsedAmount: 0,
            } : null,
        },
    }))
})

export const Add_Tx_To_Budget_Thunk = createAsyncThunk<void, IBudgetAndTx>("remoxData/add_tx_to_budget", async ({ budget, tx, isExecuted }, api) => {
    const currencies = (api.getState() as RootState).remoxData.coins
    await Update_Budget({ ...budget, txs: [...budget.txs, tx] })
    const currency = currencies[tx.token];
    if (tx.contractType === "multi") {
        // const { data, status } = await axios.get<ITransactionMultisig | IMultisigSafeTransaction>("/api/multisig/tx", {
        //     params: {
        //         id: (api.getState() as RootState).remoxData.providerID,
        //         blockchain: (api.getState() as RootState).remoxData.blockchain.name,
        //         index: tx.hashOrIndex,
        //         address: tx.contractAddress,
        //         Skip: 0,
        //         name: tx.protocol,
        //     }
        // })
        api.dispatch(addTxToBudget({
            budget,
            tx,
            currency,
            isTxExecuted: isExecuted
        }))
    }
})

export const Remove_Tx_From_Budget_Thunk = createAsyncThunk<void, IBudgetAndTx>("remoxData/remove_tx_from_budget", async ({ budget, tx, isExecuted }, api) => {
    const currencies = (api.getState() as RootState).remoxData.coins
    await Update_Budget({
        ...budget,
        txs: budget.txs.filter(s => s.contractAddress.toLowerCase() !== tx.contractAddress.toLowerCase() && s.hashOrIndex.toLowerCase() !== tx.hashOrIndex.toLowerCase())
    })
    const currency = currencies[tx.token];
    if (tx.contractType === "multi") {
        api.dispatch(removeTxFromBudget({
            budget,
            tx,
            currency,
            isTxExecuted: isExecuted
        }))
    }
})

export const Update_Budget_Thunk = createAsyncThunk<void, IBaseOrmBudget>("remoxData/update_budget", async ({ budget }, api) => {
    await Update_Budget(budget);
    api.dispatch(updateBudget(budget));
})

export const Delete_Budget_Thunk = createAsyncThunk<void, IBaseOrmBudget>("remoxData/delete_budget", async ({ budget }, api) => {
    await Delete_Budget(budget);
    const exercise = await Get_Budget_Exercise(budget.parentId);
    exercise.budgets = (exercise.budgets as IBudget[]).filter(b => b.id !== budget.id)
    await Update_Budget_Exercise(exercise)
    api.dispatch(deleteBudget(budget))
})