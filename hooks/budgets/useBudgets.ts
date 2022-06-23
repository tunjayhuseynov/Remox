import { Create_Budget, Delete_Budget, Update_Budget } from "crud/budget";
import { Get_Budget_Exercise, Update_Budget_Exercise } from "crud/budget_exercise";
import { IBudget, IBudgetExercise } from "firebaseConfig";
import { useDispatch } from "react-redux";
import { addBudget, deleteBudget, updateBudget } from "redux/reducers/budgets";

export default function useBudgets() {
    const dispatch = useDispatch()

    const create_budget = async (budget: IBudget) => {
        await Create_Budget(budget);
        const exercise = await Get_Budget_Exercise(budget.parentId);
        (exercise.budgets as IBudget[]).push(budget)
        await Update_Budget_Exercise(exercise)
        dispatch(addBudget(budget))
    }

    const update_budget = async (budget: IBudget) => {
        await Update_Budget(budget);
        dispatch(updateBudget(budget))
    }

    const delete_budget = async (budget: IBudget) => {
        await Delete_Budget(budget);
        const exercise = await Get_Budget_Exercise(budget.parentId);
        exercise.budgets = (exercise.budgets as IBudget[]).filter(b => b.id !== budget.id)
        await Update_Budget_Exercise(exercise)
        dispatch(deleteBudget(budget))
    }

    return { create_budget, update_budget, delete_budget }
}
