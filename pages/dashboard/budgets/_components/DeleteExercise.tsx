import { useDispatch } from "react-redux";
import Button from "components/button";
import useLoading from "hooks/useLoading";
import { Delete_Budget_Thunk } from "redux/slices/account/thunks/budgetThunks/budget";
import { useAppDispatch } from "redux/hooks";
import { IBudgetExerciseORM, IBudgetORM } from "pages/api/budget/index.api";
import { Delete_Budget_Exercise_Thunk } from "redux/slices/account/thunks/budgetThunks/budgetExercise";


const DeletExercise = ({ onDisable, onDelete, budget }: { budget: IBudgetExerciseORM, onDelete: () => void, onDisable: React.Dispatch<boolean> }) => {

    const dispatch = useAppDispatch()

    const onSubmit = async () => {
        await dispatch(Delete_Budget_Exercise_Thunk({
            budgetExercise: budget
        })).unwrap()

        onDelete()
        onDisable(false)
    }

    const [loading, submit] = useLoading(onSubmit)

    return <div className="flex flex-col space-y-6 items-center">
        <div className="text-2xl text-primary font-semibold">Are You Sure?</div>
        <div className="flex items-center justify-center text-lg">
            You are about to delete this budget exercise
        </div>
        <div className="flex justify-center items-center space-x-4">
            <Button version="transparent" className="!rounded-xl border-2  w-[7rem] h-[2.5rem] !px-1 !py-0" onClick={() => { onDisable(false) }}>No</Button>
            <Button className="!rounded-xl w-[7rem] h-[2.5rem] !px-1 !py-0" onClick={submit} isLoading={loading}>Yes</Button>
        </div>
    </div>
}

export default DeletExercise;