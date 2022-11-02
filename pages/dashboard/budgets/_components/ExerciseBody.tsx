import CreateButton from "components/general/CreateButton"
import Modal from "components/general/modal"
import { useRouter } from "next/router"
import { IBudgetExerciseORM } from "pages/api/budget/index.api"
import Card from "pages/dashboard/budgets/_components/Card"
import { useState } from "react"
import NewBudget from "./NewBudget"

interface IProps { exercise: IBudgetExerciseORM }

const ExerciseBody = ({ exercise }: IProps) => {
    const [modalVisibility, setModalVisible] = useState(false)
    return <>
        {exercise.budgets.length > 0 && <table className="w-full">
            <thead>
                <tr className="pl-5 grid grid-cols-[repeat(7,minmax(0,1fr))] text-greylish dark:text-gray-300 text-sm font-normal bg-tabelBarLight dark:bg-darkSecond rounded-md">
                    <th className="py-3 self-center text-left">Budget name</th>
                    <th className="py-3 self-center text-left">Total budget</th>
                    <th className="py-3 self-center text-left">Used</th>
                    <th className="py-3 self-center text-left">Pending</th>
                    <th className="py-3 self-center text-left">Available</th>
                    <th className="py-3 self-center text-left">Status</th>
                    <th></th>
                </tr>
                {exercise.budgets.map(s => <Card key={s.id} item={s} exercise={exercise}/>)}
            </thead>
        </table>}
        <div className="flex justify-center !mt-0 py-10">
            <CreateButton onClick={() => setModalVisible(true)} />
        </div>
        <Modal onDisable={setModalVisible} disableX openNotify={modalVisibility}>
            <NewBudget exercise={exercise} onBack={() => setModalVisible(false)} />
        </Modal>
    </>
}

export default ExerciseBody