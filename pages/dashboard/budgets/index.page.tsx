import Modal from 'components/general/Modal'
import React, { useState } from 'react'
import TotalValues from 'pages/dashboard/budgets/_components/totalValues'
import { IoIosArrowDown } from 'react-icons/io';
import BudgetCard from 'pages/dashboard/budgets/_components/budgetCard';
import { useAppSelector } from 'redux/hooks';
import { SelectBudgetExercises } from 'redux/slices/account/remoxData';
import { SetComma } from 'utils';
import useModalSideExit from '../../../hooks/useModalSideExit'
import { useRouter } from 'next/router';
import Button from 'components/button';
import { AnimatePresence, motion } from 'framer-motion'
import { AiOutlinePlusCircle } from 'react-icons/ai';
import { BASE_URL } from 'utils/api';
import Copied from 'components/copied';

const Budgets = () => {

    // const { GetCoins } = useWalletKit()
    const [isOpen, setOpen] = useState(false)
    const navigate = useRouter()
    const budget_exercises = useAppSelector(SelectBudgetExercises)

    const [selectedExerciseId, setSelectedExerciseId] = useState(budget_exercises.length > 0 ? budget_exercises[0].id : undefined)
    let selectedExercise = budget_exercises.find(exercise => exercise.id === selectedExerciseId)!

    const hasExercises = (budget_exercises?.length ?? 0) > 0

    const [modalVisibility, setModalVisible] = useState(false)
    const [tooltip, setTooltip] = useState(false);
    const [divRef, setDivRef] = useState<HTMLDivElement | null>(null)

    const [customRef, expectRef] = useModalSideExit<boolean>(isOpen, setOpen, false)
    const link = BASE_URL + "/view/budget/"

    // if (!budget_exercises || !budget_exercises?.[0]) return <>No Data</>
    return <div className="mb-6 w-full h-full">
        <div className="w-full h-full">
            <div className="flex justify-between items-center w-full">
                <div className="text-2xl font-bold pb-12">
                    Budgets
                </div>
                <Button className="!py-[.5rem] !font-medium !text-lg !px-0 min-w-[9.1rem]" onClick={() => setModalVisible(true)}>Share Link</Button>
                {modalVisibility && <Modal onDisable={setModalVisible} animatedModal={false} className={'!py-4 !pt-3 !px-2 !w-[35%]'}>
                    <div className="flex flex-col space-y-5 items-center">
                        <div className="text-xl font-bold  pt-8 py-1">
                            Invite Link
                        </div>
                        <div className="tracking-wide text-greylish">
                            Share this link with your community contributors
                        </div>
                        <div className="bg-greylish bg-opacity-10 flex justify-between items-center   w-[60%] rounded-xl">
                            <div className="truncate w-full font-semibold py-2 px-2">
                                {link}
                            </div>
                            <div ref={setDivRef}>
                                <Button className="!py-1 px-2   tracking-wider flex items-center" onClick={() => {
                                    navigator.clipboard.writeText(link)
                                    setTooltip(true)
                                    setTimeout(() => {
                                        setTooltip(false)
                                    }, 300)
                                }}>

                                    Copy
                                </Button>
                            </div>
                        </div>
                    </div>
                    <Copied tooltip={tooltip} triggerRef={divRef} />
                </Modal>}
            </div>
            {!hasExercises && <div className="rounded-lg shadow hover:bg-greylish hover:bg-opacity-5 hover:transition-all transition-all  bg-white dark:bg-darkSecond cursor-pointer flex items-center space-x-1 w-[25rem] h-[12.5rem]" onClick={() => { navigate.push('/dashboard/budgets/new-exercise') }} >
                <div className="mx-auto w-[58%] h-[70%] peer flex flex-col items-center justify-center gap-5 group">
                    <div className={`w-[5rem] h-[5rem] flex group-hover:text-primary group-hover::dark:text-primary group-hover:border-primary items-center justify-center text-5xl text-greylish dark:text-white border-2 border-greylish dark:border-white rounded-full`}>+</div>
                    <span className={`text-xl group-hover:text-primary`}>Create Budget Cycle</span>
                </div>
            </div>}

            {hasExercises && <>
                <TotalValues total={selectedExercise} />
                <div className="w-full pt-2 pb-12 flex justify-between items-center">
                    <div className="min-w-[5%] text-xl">
                        <div className="relative w-full pt-5">
                            <div ref={customRef} onClick={() => setOpen(!isOpen)} className={`w-full font-normal py-3 rounded-lg bg-light dark:bg-dark cursor-pointer bg-sec flex items-center gap-2`}>
                                <span className="flex items-center justify-center text-2xl font-semibold">{selectedExercise.name}</span>
                                <div>
                                    <IoIosArrowDown className='transition w-[0.7em] h-[0.7rem]' style={isOpen ? { transform: "rotate(180deg)" } : undefined} />
                                </div>
                            </div>
                            <AnimatePresence>
                                {isOpen &&
                                    <motion.div ref={expectRef} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.15 }} className="min-w-[25rem] absolute rounded-lg bottom-2 translate-y-full bg-light dark:bg-darkSecond z-50 border dark:border-gray-500 border-gray-200" onClick={() => setOpen(false)}>
                                        <div className='flex flex-col'>
                                            <div className='grid grid-flow-row'>
                                                {budget_exercises.map((item) => {
                                                    return <div onClick={() => setSelectedExerciseId(item.id)} key={item.id} className="hover:bg-greylish hover:bg-opacity-5 p-2 hover:transition-all transition-all text-start justify-start cursor-pointer w-full border-b dark:border-greylish">
                                                        <div className="flex items-end space-x-8 px-2">
                                                            <span className="font-semibold text-xl transition-all">{item.name}</span> <div className="border text-xs border-primary text-primary rounded-md px-1 py-1">{item.from > new Date().getTime() ? "Future" : "Active"}</div> <span className="font-semibold text-[1.25rem]">${SetComma(item.totalBudget)}</span>
                                                        </div>
                                                    </div>
                                                })}
                                            </div>
                                            <div className="p-4 hover:bg-greylish hover:bg-opacity-5">
                                                <div className="text-primary cursor-pointer flex space-x-2" onClick={() => { navigate.push('/dashboard/budgets/new-exercise') }} >
                                                    <AiOutlinePlusCircle className='text-primary' /> <span className='text-lg tracking-wide font-medium'>Create a new budgetary exercise</span>
                                                </div>
                                            </div>
                                        </div>
                                    </motion.div>
                                }
                            </AnimatePresence>
                        </div>
                        <div className="text-primary border border-primary bg-primary  bg-opacity-30 text-xs px-1 py-1 rounded-sm max-w-[6rem] cursor-pointer text-center font-semibold">{new Date(selectedExercise.created_at * 1e3).toLocaleDateString('en-us', { year: "numeric", month: "short" })}</div>
                    </div>
                    <div className="grid grid-cols-1 gap-5">
                        {/* {selectedExercise.budgets.length > 0 && <Button version='transparent'>Current Month</Button>}
                        {selectedExercise.budgets.length > 0 && <Button version='half'>Overall</Button>} */}
                        <Button onClick={() => { navigate.push(`/dashboard/budgets/new-budget?parentId=${selectedExerciseId}`) }}>Add Budget</Button>
                    </div>
                </div>
                {selectedExercise.budgets.length === 0 && <div className="w-full h-[40%] flex flex-col  items-center justify-center gap-6">
                    <img src="/icons/noData.png" alt="" className="w-[10rem] h-[10rem]" />
                    <div className="text-greylish font-bold dark:text-white text-2xl">No Data</div>
                </div>}
                <div className={` grid grid-cols-2 gap-12`}>
                    {selectedExercise.budgets.map((item) => <BudgetCard key={item.id} item={item} />)}
                </div>
            </>}
        </div >
    </div >

}

export default Budgets