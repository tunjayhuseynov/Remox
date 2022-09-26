import CreateButton from "components/general/CreateButton"
import { IBudgetExerciseORM } from "pages/api/budget/index.api"
import BudgetCard from "pages/dashboard/budgets/_components/BudgetCard"

interface IProps { exercise: IBudgetExerciseORM }

const ExerciseBody = ({ exercise }: IProps) => {

    return <>
        <table className="w-full">
            <thead>
                <tr className="pl-5 grid grid-cols-[repeat(7,minmax(0,1fr))] text-gray-500 dark:text-gray-300 text-sm font-normal bg-gray-200 dark:bg-darkSecond rounded-md">
                    <th className="py-3 self-center text-left">Budget name</th>
                    <th className="py-3 self-center text-left">Total budget</th>
                    <th className="py-3 self-center text-left">Used</th>
                    <th className="py-3 self-center text-left">Pending</th>
                    <th className="py-3 self-center text-left">Availabel</th>
                    <th className="py-3 self-center text-left">Status</th>
                    <th></th>
                </tr>
                {exercise.budgets.map(s => <BudgetCard item={s} />)}
            </thead>
        </table>
        <div className="flex justify-center !mt-0">
            <CreateButton />
        </div>
    </>
}

export default ExerciseBody