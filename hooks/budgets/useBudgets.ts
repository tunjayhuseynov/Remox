import { Create_Budget, Delete_Budget, Update_Budget } from "crud/budget";
import { Get_Budget_Exercise, Update_Budget_Exercise } from "crud/budget_exercise";
import { IBudget, IBudgetExercise, IBudgetTX } from "firebaseConfig";
import { IBudgetORM } from "pages/api/budget";
import { useDispatch } from "react-redux";
import { useAppSelector } from "redux/hooks";
import { addBudget, addTxToBudget, deleteBudget, SelectBudgetExercises, updateBudget } from "redux/slices/account/remoxData";
import { SelectCurrencies } from "redux/slices/currencies";

export default function useBudgets() {
    const dispatch = useDispatch()
    const currencies = useAppSelector(SelectCurrencies)


    const create_budget = async (budget: IBudget) => {
        await Create_Budget(budget);
        const exercise = await Get_Budget_Exercise(budget.parentId);
        (exercise.budgets as IBudget[]) = [...exercise.budgets as IBudget[], budget];
        await Update_Budget_Exercise(exercise)
        const totalBudget = (currencies[budget.token].price * budget.amount) + ((currencies[budget?.secondToken ?? ""]?.price ?? 0) * (budget.secondAmount ?? 0))
        dispatch(addBudget({
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
    }

    const add_tx_to_budget = async (budget: IBudgetORM, tx: IBudgetTX) => {
        await Update_Budget({ ...budget, txs: [...budget.txs, tx] })
        const currency = currencies[tx.token];
        dispatch(addTxToBudget({
            budget,
            tx,
            currency
        }))
    }

    const update_budget = async (budget: IBudgetORM) => {
        await Update_Budget(budget);
        dispatch(updateBudget(budget))
    }

    const delete_budget = async (budget: IBudgetORM) => {
        await Delete_Budget(budget);
        const exercise = await Get_Budget_Exercise(budget.parentId);
        exercise.budgets = (exercise.budgets as IBudget[]).filter(b => b.id !== budget.id)
        await Update_Budget_Exercise(exercise)
        dispatch(deleteBudget(budget))
    }

    return { create_budget, update_budget, delete_budget, add_tx_to_budget }
}
