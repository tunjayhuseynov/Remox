import { Get_Budget, Update_Budget } from "crud/budget";
import { ISubBudget } from "firebaseConfig";

export default function useSubbudgets() {

    const create = async (subbudget: ISubBudget) => {
        const budget = await Get_Budget(subbudget.parentId)
        budget.subbudgets.push(subbudget)
        await Update_Budget(budget)
    }

    const update = async (subbudget: ISubBudget) => {
        const budget = await Get_Budget(subbudget.parentId)
        budget.subbudgets = budget.subbudgets.map(sb => sb.id === subbudget.id ? subbudget : sb)
        await Update_Budget(budget)
    }

    const del = async (subbudget: ISubBudget) => {
        const budget = await Get_Budget(subbudget.parentId)
        budget.subbudgets = budget.subbudgets.filter(sb => sb.id !== subbudget.id)
        await Update_Budget(budget)
    }

    return { create, update, del }
}
