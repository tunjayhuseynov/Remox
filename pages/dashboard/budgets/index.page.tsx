import Modal from 'components/general/modal'
import React, { useState } from 'react'
import TotalValues from 'pages/dashboard/budgets/_components/totalValues'
import { IoIosArrowDown } from 'react-icons/io';
import DeleteBudget from 'pages/dashboard/budgets/_components/Modals/deleteBudgets';
import BudgetCard from 'pages/dashboard/budgets/_components/budgetCard';
import { useWalletKit } from 'hooks';
import { useAppSelector } from 'redux/hooks';
import { SelectBudgetExercises } from 'redux/slices/account/remoxData';
import { SetComma } from 'utils';
import useModalSideExit from '../../../hooks/useModalSideExit'
import { useRouter } from 'next/router';

const Budgets = () => {

    // const { GetCoins } = useWalletKit()
    const [delBudget, setDelBudget] = useState(false)
    const [exercise, setExercise] = useState(false)
    const [isOpen, setOpen] = useState(false)
    const navigate = useRouter()
    const budget_exercises = useAppSelector(SelectBudgetExercises)

    const [selectedExerciseId, setSelectedExerciseId] = useState(budget_exercises.length > 0 ? budget_exercises[0].id : undefined)
    let selectedExercise = budget_exercises.find(exercise => exercise.id === selectedExerciseId)!

    const hasExercises = (budget_exercises?.length ?? 0) > 0

    const [customRef, expectRef] = useModalSideExit<boolean>(isOpen, setOpen, false)

    // if (!budget_exercises || !budget_exercises?.[0]) return <>No Data</>
    return <div className="mb-6 w-full h-full">
        <div className="w-full h-full">
            <div className="flex justify-between items-center w-full">
                <div className="text-4xl font-bold pb-12">
                    Budgets
                </div>
            </div>
            {!hasExercises && <div className=" rounded-lg   shadow hover:bg-greylish hover:bg-opacity-5 hover:transition-all transition-all  bg-white dark:bg-darkSecond cursor-pointer flex items-center space-x-1 w-[25rem] h-[12.5rem]" onClick={() => { navigate.push('/dashboard/budgets/new-exercise') }} >
                <div className="mx-auto w-[58%] h-[70%] peer flex flex-col items-center justify-center gap-5" onMouseOver={() => { setExercise(true) }} onMouseOut={() => { setExercise(false) }}>
                    <div className={`w-[5rem] h-[5rem] ${exercise && 'text-primary !border-primary'} flex items-center justify-center text-5xl text-greylish dark:text-white border-2 border-greylish dark:border-white rounded-full`}>+</div>
                    <span className={`text-greylish ${exercise && 'text-primary border-primary'}  text-2xl`}>Create Budget Cycle</span>
                </div>
            </div>}

            {hasExercises && <>
                <TotalValues total={selectedExercise} />
                <div className="w-full pt-2 pb-12 flex justify-between items-center">
                    <div className="min-w-[5%] text-xl">
                        <div className="relative w-full pt-5">
                            <div ref={customRef} onClick={() => setOpen(!isOpen)} className={`w-full font-normal py-3 rounded-lg bg-light dark:bg-dark cursor-pointer bg-sec flex items-center gap-2`}>
                                <span className="flex items-center justify-center text-2xl">{selectedExercise.name}</span>
                                <div>
                                    <IoIosArrowDown className='transition w-[0.7em] h-[0.7rem]' style={isOpen ? { transform: "rotate(180deg)" } : undefined} />
                                </div>
                            </div>
                            {isOpen && <div ref={expectRef} className="min-w-[25rem] absolute flex rounded-lg bottom-2 translate-y-full bg-light dark:bg-darkSecond z-50" onClick={() => setOpen(false)}>
                                <ul className="w-full">
                                    <li className="flex flex-col items-center text-center justify-center w-full bg-white dark:bg-darkSecond space-y-1 transition rounded-xl cursor-pointer  ">
                                        <div className="flex flex-col w-full">
                                            {budget_exercises.map((item, index) => {
                                                return <label onClick={() => setSelectedExerciseId(item.id)} key={index} className="hover:bg-greylish hover:bg-opacity-5 hover:transition-all transition-all text-start flex items-center justify-start cursor-pointer w-full  border-b dark:border-greylish pl-3 pr-6 py-2">
                                                    <div className="flex items-center gap-3"><span className="font-semibold">{item.name}</span> <div className="border text-sm border-primary text-primary rounded-md px-1 py-1">Active</div> <span className=" font-semibold">{SetComma(item.totalBudget)}</span> </div>
                                                </label>
                                            })}
                                            <label className=" text-start  flex items-center justify-start cursor-pointer w-full pl-3 pr-6 py-2">
                                                <div className="text-primary cursor-pointer " onClick={() => { navigate.push('/dashboard/budgets/new-exercise') }} ><span className="rounded-full border border-primary px-2 ">+</span> Create a new budgetary exercise</div>
                                            </label>
                                        </div>
                                    </li>
                                </ul>
                            </div>}
                        </div>
                        <div className="text-primary border border-primary bg-primary  bg-opacity-30 text-sm px-1 py-1 rounded-sm max-w-[6rem] cursor-pointer text-center ">{new Date(selectedExercise.created_at * 1e3).toLocaleDateString('en-us', { year: "numeric", month: "short" })}</div>
                    </div>
                    <div className="flex gap-5">
                        {selectedExercise.budgets.length > 0 && <div className="text-primary border border-primary px-3 py-2 rounded-xl cursor-pointer">Current Month</div>}
                        {selectedExercise.budgets.length > 0 && <div className="text-primary border border-primary bg-primary  bg-opacity-30 px-9 py-2 rounded-xl cursor-pointer">Overall</div>}
                        <div className="text-white border border-primary px-5 py-2 bg-primary rounded-xl cursor-pointer" onClick={() => { navigate.push(`/dashboard/budgets/new-budget?parentId=${selectedExerciseId}`) }}>Add Budget</div>
                    </div>
                </div>
                {selectedExercise.budgets.length === 0 && <div className="w-full h-[40%] flex flex-col  items-center justify-center gap-6">
                    <img src="/icons/noData.png" alt="" className="w-[10rem] h-[10rem]" />
                    <div className="text-greylish font-bold dark:text-white text-2xl">No Data</div>
                </div>}
                <div className={` grid grid-cols-2 gap-12`}>
                    {selectedExercise.budgets.map((item) => <BudgetCard key={item.id} item={item} setDelBudget={setDelBudget} />)}
                </div >
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