import { Get_Budget, Update_Budget } from "crud/budget";
import { ISubBudget } from "firebaseConfig";

export default function useSubbudgets() {

    const create_subbudget = async (subbudget: ISubBudget) => {
        const budget = await Get_Budget(subbudget.parentId)
        budget.subbudgets.push(subbudget)
        await Update_Budget(budget)
    }

    const update_subbudget = async (subbudget: ISubBudget) => {
        const budget = await Get_Budget(subbudget.parentId)
        budget.subbudgets = budget.subbudgets.map(sb => sb.id === subbudget.id ? subbudget : sb)
        await Update_Budget(budget)
    }

    const delete_budget = async (subbudget: ISubBudget) => {
        const budget = await Get_Budget(subbudget.parentId)
        budget.subbudgets = budget.subbudgets.filter(sb => sb.id !== subbudget.id)
        await Update_Budget(budget)
    }

    return { create_subbudget, update_subbudget, delete_budget }
}
