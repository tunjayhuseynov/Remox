import React, { useState } from 'react'
import TotalExerciseData from 'pages/dashboard/budgets/_components/TotalExerciseData'
import { IoIosArrowDown } from 'react-icons/io';
import { useAppSelector } from 'redux/hooks';
import { SelectBudgetExercises, SelectCurrencies, SelectFiatPreference, SelectFiatSymbol } from 'redux/slices/account/remoxData';
import { useRouter } from 'next/router';
import { AnimatePresence, motion } from 'framer-motion'
import { AiOutlinePlusCircle } from 'react-icons/ai';
import { BASE_URL } from 'utils/api';
import ExerciseBody from './_components/ExerciseBody';
import { ClickAwayListener } from '@mui/material';
import { NG } from 'utils/jsxstyle';
import { GetFiatPrice } from 'utils/const';
import { VscEdit } from 'react-icons/vsc';
import { GiCancel } from 'react-icons/gi';
import Modal from 'components/general/modal';
import EditExercise from './_components/EditExercise';
import DeleteExercise from './_components/DeleteExercise';
import { IBudgetExerciseORM } from 'pages/api/budget/index.api';

const Budgets = () => {

    // const { GetCoins } = useWalletKit()
    const [isOpen, setOpen] = useState(false)
    const navigate = useRouter()
    const budget_exercises = useAppSelector(SelectBudgetExercises)

    const [selectedExerciseId, setSelectedExerciseId] = useState(budget_exercises.length > 0 ? budget_exercises[0].id : undefined)
    const selectedExercise = budget_exercises.find(s => s.id === selectedExerciseId)

    const hasExercises = (budget_exercises?.length ?? 0) > 0

    const fiatPreference = useAppSelector(SelectFiatPreference)
    const fiatSymbol = useAppSelector(SelectFiatSymbol)
    const coins = useAppSelector(SelectCurrencies)

    const [modalVisibility, setModalVisible] = useState(false)
    const [tooltip, setTooltip] = useState(false);
    const [divRef, setDivRef] = useState<HTMLDivElement | null>(null)

    const [deleteModal, setDeleteModal] = useState(false)
    const [editModal, setEditModal] = useState(false)
    const [selectedEditExercise, setSelectedEditExercise] = useState<IBudgetExerciseORM | null>(null)
    const [selectedDeleteExercise, setSelectedDeleteExercise] = useState<IBudgetExerciseORM | null>(null)

    const link = BASE_URL + "/view/budget/"

    // if (!budget_exercises || !budget_exercises?.[0]) return <>No Data</>
    return <div>
        <div className="flex flex-col space-y-8">
            <div className="flex justify-between items-center w-full">
                <div className="text-2xl font-semibold">
                    Budgets
                </div>
                {/* <Button className="!py-[.5rem] !font-medium !text-lg !px-0 min-w-[9.1rem]" onClick={() => setModalVisible(true)}>Share Link</Button>
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
                </Modal>} */}
            </div>
            {!hasExercises && <div className="rounded-lg shadow hover:bg-greylish hover:bg-opacity-5 hover:transition-all transition-all  bg-white dark:bg-darkSecond cursor-pointer flex items-center space-x-1 w-[25rem] h-[12.5rem]" onClick={() => { navigate.push('/dashboard/budgets/new-exercise') }} >
                <div className="mx-auto w-[58%] h-[70%] peer flex flex-col items-center justify-center gap-5 group">
                    <div className={`w-[5rem] h-[5rem] flex group-hover:text-primary group-hover::dark:text-primary group-hover:border-primary items-center justify-center text-5xl text-greylish dark:text-white border-2 border-greylish dark:border-white rounded-full`}>+</div>
                    <span className={`text-xl group-hover:text-primary`}>Create Budget Cycle</span>
                </div>
            </div>}
            {hasExercises && <div>
                <div className="inline-block text-xl relative">
                    <div className="relative w-full">
                        <div onClick={() => setOpen(!isOpen)} className={`w-full font-normal py-3 rounded-lg bg-light dark:bg-dark cursor-pointer bg-sec flex items-center gap-2`}>
                            <span className="flex items-center justify-center text-xl font-semibold">{selectedExercise?.name}</span>
                            <div>
                                <IoIosArrowDown className='transition w-[0.7em] h-[0.7rem]' style={isOpen ? { transform: "rotate(180deg)" } : undefined} />
                            </div>
                        </div>

                    </div>
                    {selectedExercise?.from && <div className="text-primary border border-primary bg-primary  bg-opacity-30 text-xs px-1 py-1 rounded-sm max-w-[6rem] cursor-pointer text-center font-semibold">
                        {new Date(selectedExercise.from * 1e3).toLocaleDateString('en-us', { year: "numeric", month: "short" })}
                    </div>}
                    <AnimatePresence>
                        {isOpen &&
                            <ClickAwayListener onClickAway={() => setOpen(false)}>
                                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.15 }}
                                    className="min-w-[24.75rem] absolute rounded-lg right-0 bottom-0 translate-x-full translate-y-1/2 bg-light dark:bg-darkSecond z-50 border dark:border-gray-500 border-gray-200"
                                    onClick={() => setOpen(false)}
                                >
                                    <div className='flex flex-col'>
                                        <div className='grid grid-flow-row'>
                                            {budget_exercises.map((item) => {
                                                const TotalBudget = item.budgets.reduce((a, b) => {

                                                    const MainFiatPrice = GetFiatPrice(coins[b.token], fiatPreference)

                                                    const fiatPrice = GetFiatPrice(coins[b.token], b.fiatMoney ?? fiatPreference)
                                                    const totalAmount = b.budgetCoins.fiat ? b.budgetCoins.totalAmount / fiatPrice : b.budgetCoins.totalAmount
                                                    // const totalUsedAmount = b.budgetCoins.fiat ? b.budgetCoins.totalUsedAmount / fiatPrice : b.budgetCoins.totalUsedAmount
                                                    // const totalPendingAmount = b.budgetCoins.fiat ? b.budgetCoins.totalPending / fiatPrice : b.budgetCoins.totalPending

                                                    const MainFiatPriceSecond = b.secondToken ? GetFiatPrice(coins[b.secondToken], fiatPreference) : 0

                                                    const fiatPriceSecond = b.secondToken ? GetFiatPrice(coins[b.secondToken], b.secondFiatMoney ?? fiatPreference) : 0;
                                                    const totalAmountSecond = b.budgetCoins.second?.fiat ? b.budgetCoins.second.secondTotalAmount / fiatPriceSecond : b.budgetCoins.second?.secondTotalAmount

                                                    // const totalUsedAmountSecond = b.budgetCoins.second?.fiat ? b.budgetCoins.second.secondTotalUsedAmount / fiatPriceSecond : b.budgetCoins.second?.secondTotalUsedAmount
                                                    // const totalPendingAmountSecond = b.budgetCoins.second?.fiat ? b.budgetCoins.second.secondTotalPending / fiatPriceSecond : b.budgetCoins.second?.secondTotalPending
                                                    return {
                                                        totalAmount: a.totalAmount + ((b.customPrice ?? MainFiatPrice) * totalAmount) + ((b.secondCustomPrice ?? MainFiatPriceSecond) * (totalAmountSecond ?? 0))
                                                        // totalUsedAmount: a.totalUsedAmount + ((b.customPrice ?? MainFiatPrice) * totalUsedAmount) + ((b.secondCustomPrice ?? MainFiatPriceSecond) * (totalUsedAmountSecond ?? 0)),
                                                        // totalPending: a.totalPending + ((b.customPrice ?? MainFiatPrice) * totalPendingAmount) + ((b.secondCustomPrice ?? MainFiatPriceSecond) * (totalPendingAmountSecond ?? 0))
                                                    }
                                                }, { totalAmount: 0 })

                                                return <div onClick={() => setSelectedExerciseId(item.id)} key={item.id} className="hover:bg-greylish hover:bg-opacity-5 p-2 hover:transition-all transition-all text-start justify-start cursor-pointer w-full border-b dark:border-greylish">
                                                    <div className="grid grid-cols-[35%,1fr,33%,1fr] gap-x-1 px-2 ">
                                                        <span className="font-medium text-sm transition-all self-center">{item.name}</span>
                                                        <div className="text-primary border border-primary bg-primary bg-opacity-30 text-xxs px-1 py-1 rounded-sm cursor-pointer text-center font-semibold self-center">
                                                            {item.from * 1e3 > new Date().getTime() ? "Future" : item.to * 1e3 < new Date().getTime() ? "Past" : "Current"}
                                                        </div>
                                                        <span className="font-medium text-sm self-center pl-2">{fiatSymbol}<NG number={TotalBudget.totalAmount} fontSize={0.875} /></span>
                                                        <div className="flex space-x-2 self-center justify-end w-full pl-2">
                                                            <VscEdit size={"1.125rem"} className="cursor-pointer hover:text-green-500" onClick={() => { setEditModal(true); setSelectedEditExercise(item) }} />
                                                            <GiCancel size={"1.125rem"} className="cursor-pointer hover:text-red-500" onClick={() => { setDeleteModal(true); setSelectedDeleteExercise(item) }} />
                                                        </div>
                                                    </div>
                                                </div>
                                            })}
                                        </div>
                                        <div className="px-4 py-2 hover:bg-greylish hover:bg-opacity-5">
                                            <div className="text-primary cursor-pointer flex space-x-2 items-center" onClick={() => { navigate.push('/dashboard/budgets/new-exercise') }} >
                                                <AiOutlinePlusCircle className='text-primary' /> <span className='text-sm tracking-wide font-medium'>Create new budgetary exercise</span>
                                            </div>
                                        </div>
                                    </div>
                                </motion.div>
                            </ClickAwayListener>
                        }
                    </AnimatePresence>
                </div>
            </div>}
            {selectedEditExercise && <Modal onDisable={setEditModal} openNotify={editModal} disableX={true}>
                <EditExercise exercise={selectedEditExercise} onBack={() => {
                    // setSelectedEditExercise(null)
                    setEditModal(false)
                }} />
            </Modal>}
            {
                deleteModal && selectedDeleteExercise &&
                <Modal onDisable={setDeleteModal} animatedModal={false} disableX={true} className={'!w-[30%] !pt-4'}>
                    <DeleteExercise onDisable={setDeleteModal} onDelete={() => {
                        setSelectedExerciseId(budget_exercises.length > 0 ? budget_exercises[0].id : undefined)
                    }} budget={selectedDeleteExercise}></DeleteExercise>
                </Modal>
            }
            {hasExercises && selectedExercise && <>
                <TotalExerciseData total={selectedExercise} />
                <ExerciseBody exercise={selectedExercise} />
                {/* {selectedExercise.budgets.length === 0 && <div className="w-full h-[40%] flex items-center justify-center gap-6">
                    <img src="/icons/noData.png" alt="" className="w-[8rem] h-[8rem]" />
                    <div className="text-greylish font-bold dark:text-white text-2xl">No budget</div>
                </div>} */}
            </>}
        </div >

    </div >

}

export default Budgets