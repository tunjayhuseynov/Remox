import { Create_Budget_Exercise, Delete_Budget_Exercise, Update_Budget_Exercise } from "crud/budget_exercise";
import { IBudgetExercise } from "firebaseConfig";
import { useDispatch } from "react-redux";
import { addBudgetExercise, deleteBudgetExercise } from "redux/reducers/budgets";

export default function useBudgetExercise() {
    const dispatch = useDispatch()

    const create = async (budget: IBudgetExercise) => {
        await Create_Budget_Exercise(budget);
        dispatch(addBudgetExercise(budget));
    }

    const update = async (budget: IBudgetExercise) => {
        await Update_Budget_Exercise(budget);
        dispatch(addBudgetExercise(budget));
    }

    const del = async (budget: IBudgetExercise) => {
        await Delete_Budget_Exercise(budget);
        dispatch(deleteBudgetExercise(budget));
    }

    return { create, update, del }

}
