import { Get_Budget, Update_Budget } from "crud/budget";
import { IBudgetTX, ISubBudget } from "firebaseConfig";
import { ISubbudgetORM } from "pages/api/budget";
import { useDispatch } from "react-redux";
import { useAppSelector } from "redux/hooks";
import { addTxToSubbudget } from "redux/slices/account/remoxData";
import { SelectCurrencies } from "redux/slices/currencies";

export default function useSubbudgets() {
    const dispatch = useDispatch()
    const currencies = useAppSelector(SelectCurrencies)

    const create_subbudget = async (subbudget: ISubBudget) => {
        const budget = await Get_Budget(subbudget.parentId)
        budget.subbudgets = [...budget.subbudgets, subbudget]
        await Update_Budget(budget)
    }

    const add_tx_to_subbudget = async (subbudget: ISubbudgetORM, tx: IBudgetTX) => {
        await update_subbudget({ ...subbudget, txs: [...subbudget.txs, tx] })
        const currency = currencies[tx.token];
        dispatch(addTxToSubbudget({
            subbudget: subbudget,
            tx,
            currency
        }))
    }

    const update_subbudget = async (subbudget: ISubbudgetORM) => {
        const budget = await Get_Budget(subbudget.parentId)
        budget.subbudgets = budget.subbudgets.map(sb => sb.id === subbudget.id ? subbudget : sb)
        await Update_Budget(budget)
    }

    const delete_budget = async (subbudget: ISubbudgetORM) => {
        const budget = await Get_Budget(subbudget.parentId)
        budget.subbudgets = budget.subbudgets.filter(sb => sb.id !== subbudget.id)
        await Update_Budget(budget)
    }

    return { create_subbudget, update_subbudget, delete_budget, add_tx_to_subbudget }
}
