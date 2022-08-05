import { useDispatch } from "react-redux";
import Button from "components/button";
import useLoading from "hooks/useLoading";
import { Delete_Budget_Thunk } from "redux/slices/account/thunks/budgetThunks/budget";
import { useAppDispatch } from "redux/hooks";
import { IBudgetORM } from "pages/api/budget/index.api";


const DeletBudget = ({ onDisable, budget }: { budget: IBudgetORM, onDisable: React.Dispatch<boolean> }) => {

    const dispatch = useAppDispatch()

    const onSubmit = async () => {
        await dispatch(Delete_Budget_Thunk({
            budget
        }))

        onDisable(false)
    }

    const [loading, submit] = useLoading(onSubmit)

    return <div className="flex flex-col space-y-10 items-center">
        <div className="text-2xl text-primary">Are You Sure?</div>
        <div className="flex items-center justify-center text-xl">
            Your Are About Delete This Budget
        </div>
        <div className="flex justify-center items-center space-x-4">
            <Button version="second" className="!rounded-xl border-2  w-[7rem] h-[2.5rem] !px-1 !py-0" onClick={() => { onDisable(false) }}>No</Button>
            <Button className="!rounded-xl w-[7rem] h-[2.5rem] !px-1 !py-0" onClick={submit} isLoading={loading}>Yes</Button>
        </div>
    </div>
}

export default DeletBudget;