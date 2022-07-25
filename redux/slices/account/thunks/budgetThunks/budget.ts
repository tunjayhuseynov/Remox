import { createAsyncThunk } from "@reduxjs/toolkit";
import { Create_Budget, Delete_Budget, Update_Budget } from "crud/budget";
import { Get_Budget_Exercise, Update_Budget_Exercise } from "crud/budget_exercise";
import { IBudget, IBudgetTX } from "firebaseConfig";
import { IBudgetORM } from "pages/api/budget";
import { RootState } from "redux/store";
import { addBudget, addTxToBudget, deleteBudget, updateBudget } from "../../remoxData";


interface IBaseBudget {
    budget: IBudget;
}

interface IBaseOrmBudget {
    budget: IBudgetORM;
}

interface IBudgetAndTx extends IBaseOrmBudget {
    tx: IBudgetTX
}

/*Budget */
/*Budget */
/*Budget */

export const Create_Budget_Thunk = createAsyncThunk<void, IBaseBudget>("remoxData/create_budget", async ({ budget }, api) => {
    const currencies = (api.getState() as RootState).currencyandbalance.allCoins
    await Create_Budget(budget);
    const exercise = await Get_Budget_Exercise(budget.parentId);
    (exercise.budgets as IBudget[]) = [...exercise.budgets as IBudget[], budget];
    await Update_Budget_Exercise(exercise)
    const totalBudget = (currencies[budget.token].price * budget.amount) + ((currencies[budget?.secondToken ?? ""]?.price ?? 0) * (budget.secondAmount ?? 0))
    api.dispatch(addBudget({
        ...budget,
        totalBudget,
        totalUsed: 0,
        totalAvailable: totalBudget,
        subbudgets: budget.subbudgets.map(sub => {
            let totalBudget = (currencies[sub.token].price * sub.amount) + ((currencies[sub?.secondToken ?? ""]?.price ?? 0) * (sub.secondAmount ?? 0))
            return {
                ...sub,
                totalBudget,
                totalAvailable: totalBudget,
                totalUsed: 0,
                budgetCoins: {
                    coin: sub.token,
                    totalAmount: sub.amount,
                    totalUsedAmount: 0,
                    second: sub.secondToken && sub.secondAmount ? {
                        secondCoin: sub.secondToken,
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
            totalUsedAmount: 0,
            second: budget.secondToken && budget.secondAmount ? {
                secondCoin: budget.secondToken,
                secondTotalAmount: budget.secondAmount,
                secondTotalUsedAmount: 0,
            } : null,
        },
    }))
})

export const Add_Tx_To_Budget_Thunk = createAsyncThunk<void, IBudgetAndTx>("remoxData/add_tx_to_budget", async ({ budget, tx }, api) => {
    const currencies = (api.getState() as RootState).currencyandbalance.allCoins
    await Update_Budget({ ...budget, txs: [...budget.txs, tx] })
    const currency = currencies[tx.token];
    api.dispatch(addTxToBudget({
        budget,
        tx,
        currency
    }))
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