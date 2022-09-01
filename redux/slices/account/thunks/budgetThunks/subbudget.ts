import { createAsyncThunk } from "@reduxjs/toolkit"
import { Get_Budget, Update_Budget } from "crud/budget"
import { IBudgetTX, ISubBudget } from "firebaseConfig"
import { ISubbudgetORM } from "pages/api/budget/index.api"
import { RootState } from "redux/store"
import { addTxToSubbudget, updateBudget } from "../../remoxData"

interface IBaseSubbudget {
    subbudget: ISubBudget
}

interface ISubbudgetORMandTx {
    tx: IBudgetTX
    subbudget: ISubbudgetORM
}

export const Create_Subbudget_Thunk = createAsyncThunk<void, IBaseSubbudget>("remoxData/create_subbudget", async ({ subbudget }, api) => {
    const currencies = (api.getState() as RootState).remoxData.coins

    const budget = await Get_Budget(subbudget.parentId)
    budget.subbudgets = [...budget.subbudgets, subbudget]
    await Update_Budget(budget)

    const budgetExercise = (api.getState() as RootState).remoxData.budgetExercises.find(exercise => exercise.id === budget.parentId)
    const budgetORM = budgetExercise?.budgets.find(budget => budget.id === budget.id)
    if (budgetORM) {
        const totalBudget = (currencies[subbudget.token].priceUSD * subbudget.amount) + ((currencies[subbudget?.secondToken ?? ""]?.priceUSD ?? 0) * (subbudget.secondAmount ?? 0))

        budgetORM.subbudgets = [...budgetORM.subbudgets, {
            ...subbudget,
            totalBudget: totalBudget,
            totalUsed: 0,
            totalPending: 0,
            totalAvailable: totalBudget,
            budgetCoins: {
                coin: subbudget.token,
                totalAmount: subbudget.amount,
                totalPending: 0,
                totalUsedAmount: 0,
                second: subbudget.secondToken && subbudget.secondAmount ? {
                    secondCoin: subbudget.secondToken,
                    secondTotalPending: 0,
                    secondTotalAmount: subbudget.secondAmount,
                    secondTotalUsedAmount: 0,
                } : null,
            }
        }]
        api.dispatch(updateBudget(budgetORM))
    }
})

export const Update_Subbudget_Thunk = createAsyncThunk<void, IBaseSubbudget>("remoxData/update_subbudget", async ({ subbudget }, api) => {
    const budget = await Get_Budget(subbudget.parentId)
    budget.subbudgets = budget.subbudgets.map(sb => sb.id === subbudget.id ? subbudget : sb)
    await Update_Budget(budget)
})

export const Add_Tx_To_Subbudget_Thunk = createAsyncThunk<void, ISubbudgetORMandTx>("remoxData/add_tx_to_subbudget", async ({ subbudget, tx }, api) => {
    // await update_subbudget({ ...subbudget, txs: [...subbudget.txs, tx] })
    const currencies = (api.getState() as RootState).remoxData.coins


    const budget = await Get_Budget(subbudget.parentId)
    budget.subbudgets = budget.subbudgets.map(sb => sb.id === subbudget.id ? subbudget : sb)
    await Update_Budget(budget)

    const currency = currencies[tx.token];
    api.dispatch(addTxToSubbudget({
        subbudget: subbudget,
        tx,
        currency
    }))
})

export const Delete_Subbudget_Thunk = createAsyncThunk<void, IBaseSubbudget>("remoxData/delete_subbudget", async ({ subbudget }, api) => {
    const budget = await Get_Budget(subbudget.parentId)
    budget.subbudgets = budget.subbudgets.filter(sb => sb.id !== subbudget.id)
    await Update_Budget(budget)
})