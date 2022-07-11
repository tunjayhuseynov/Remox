import Modal from 'components/general/modal'
import React, { useEffect, useState } from 'react'
import NewBudgets from 'subpages/dashboard/budgets/Modals/newBudgets'
import TotalValues from 'subpages/dashboard/budgets/totalValues'
import { IoIosArrowDown } from 'react-icons/io';
import NewExercise from 'subpages/dashboard/budgets/Modals/newExercise';
import EditBudget from 'subpages/dashboard/budgets/Modals/editBudgets';
import DeleteBudget from 'subpages/dashboard/budgets/Modals/deleteBudgets';
import BudgetCard from 'subpages/dashboard/budgets/budgetCard';
import { useWalletKit } from 'hooks';
import { useAppSelector } from 'redux/hooks';
import { SelectBudgetExercises } from 'redux/slices/account/remoxData';
import { SetComma } from 'utils';

const Budgets = () => {

    const { GetCoins } = useWalletKit()
    const [newBudget, setNewBudget] = useState(false)
    const [editBudget, setEditBudget] = useState(false)
    const [delBudget, setDelBudget] = useState(false)
    const [newBudgetModal, setNewBudgetModal] = useState(false)
    const [sign, setSign] = useState(false)
    const [exercise, setExercise] = useState(false)
    const [isOpen, setOpen] = useState(false)

    const budget_exercises = useAppSelector(SelectBudgetExercises)

    const [selectedExerciseId, setSelectedExerciseId] = useState(budget_exercises[0].id)
    let selectedExercise = budget_exercises.find(exercise => exercise.id === selectedExerciseId)!

    const hasExercises = (budget_exercises?.length ?? 0) > 0

    // if (!budget_exercises || !budget_exercises?.[0]) return <>No Data</>
    return <div className="mb-6 w-full h-full">
        <div className="w-full h-full">
            <div className="flex justify-between items-center w-full">
                <div className="text-4xl font-bold pb-12">
                    Budgets
                </div>
            </div>
            {!hasExercises && <div className="text-primary cursor-pointer flex items-center space-x-1 min-w-[25rem] min-h-[12-5rem]" onClick={() => { setExercise(true); }} >
                 <div className="mx-auto w-full h-full flex flex-col gap-5">
                    <div className='w-15 h-15 text-greylish dark:text-white border-2 border-greylish dark:border-white rounded-full'>+</div>
                    <span className="text-greylish text-2xl">Create Budget Cycle</span>
                 </div>
            </div>}
            {
                newBudgetModal &&
                <Modal onDisable={setNewBudgetModal} disableX={true} className={'!w-[40%] !pt-4'} animatedModal={false}>
                    <NewBudgets parentId={selectedExerciseId} setNewBudget={setNewBudgetModal} />
                </Modal>
            }
            <Modal onDisable={setExercise} openNotify={exercise} >
                <NewExercise setExercise={setExercise} setNewBudget={setNewBudget} />
            </Modal>
            {hasExercises && <>
                <TotalValues total={selectedExercise} />
                <div className="w-full pt-2 pb-12 flex justify-between items-center">
                    <div className="min-w-[5%] text-xl">
                        <div className="relative w-full pt-5">
                            <div onClick={() => setOpen(!isOpen)} className={`w-full font-normal py-3 rounded-lg bg-light dark:bg-dark cursor-pointer bg-sec flex items-center gap-2`}>
                                <span className="flex items-center justify-center text-2xl">{selectedExercise.name}</span>
                                <div>
                                    <IoIosArrowDown className='transition w-[0.7em] h-[0.7rem]' style={isOpen ? { transform: "rotate(180deg)" } : undefined} />
                                </div>
                            </div>
                            {isOpen && <div className="min-w-[25rem] absolute flex rounded-lg bottom-2 translate-y-full bg-light dark:bg-darkSecond z-50">
                                <ul className="w-full">
                                    <li className="flex flex-col items-center text-center justify-center w-full bg-white dark:bg-darkSecond space-y-1 transition rounded-xl cursor-pointer  ">
                                        <div className="flex flex-col w-full">
                                            {budget_exercises.map((item, index) => {
                                                return <label onClick={() => setSelectedExerciseId(item.id)} key={index} className=" text-start flex items-center justify-start cursor-pointer w-full  border-b dark:border-greylish pl-3 pr-6 py-2">
                                                    <div className="flex items-center gap-3"><span className="font-semibold">{item.name}</span> <div className="border text-sm border-primary text-primary rounded-md px-1 py-1">Active</div> <span className=" font-semibold">{SetComma(item.totalBudget)}</span> </div>
                                                </label>
                                            })}
                                            <label className=" text-start  flex items-center justify-start cursor-pointer w-full pl-3 pr-6 py-2">
                                                <div className="text-primary cursor-pointer " onClick={() => { setExercise(true) }} ><span className="rounded-full border border-primary px-2 ">+</span> Create a new budgetary exercise</div>
                                            </label>
                                        </div>
                                    </li>
                                </ul>
                            </div>}

                        </div>
                        <div className="text-primary border border-primary bg-primary  bg-opacity-30 text-sm px-1 py-1 rounded-sm cursor-pointer text-center w-full">May 2022</div>
                    </div>
                    <div className="flex gap-5">
                        <div className="text-primary border border-primary px-3 py-2 rounded-xl cursor-pointer">Current Month</div>
                        <div className="text-primary border border-primary bg-primary  bg-opacity-30 px-9 py-2 rounded-xl cursor-pointer">Overall</div>
                        <div className="text-white border border-primary px-5 py-2 bg-primary rounded-xl cursor-pointer" onClick={() => { setNewBudgetModal(true) }}>Add Budget</div>
                    </div>
                </div>

                <div className={` grid grid-cols-2 gap-12`}>
                    {selectedExercise.budgets.map((item) => <BudgetCard key={item.id} item={item} setEditBudget={setEditBudget} setDelBudget={setDelBudget} />)}
                </div >
                {/* {
                    exercise &&
                    <Modal onDisable={setExercise} disableX={true} className={'!w-[40%] !pt-4'}>
                        <NewExercise setExercise={setExercise} setNewBudget={setNewBudget} />
                    </Modal>
                } */}
                {
                    editBudget &&
                    <Modal onDisable={setEditBudget} animatedModal={false} disableX={true} className={'!w-[40%] !pt-4'}>
                        <EditBudget setNewBudget={setEditBudget} />
                    </Modal>
                }
                {
                    delBudget &&
                    <Modal onDisable={setDelBudget} animatedModal={false} disableX={true} className={'!w-[30%] !pt-4'}>
                        <DeleteBudget onDisable={setDelBudget} />
                    </Modal>
                }
            </>}
        </div >
    </div >

}

export default Budgets