import React, { useEffect, useMemo, useState } from 'react'
import { useAppSelector } from 'redux/hooks';
import { SelectDarkMode } from 'redux/slices/account/remoxData';
import BudgetDetails from './budgetDetails';
import { useModalSideExit, useWalletKit } from "hooks";
import { IBudgetORM } from 'pages/api/budget/index.api';
import { useRouter } from 'next/router';
import { ProgressBarWidth, SetComma } from 'utils';
import Modal from 'components/general/Modal';
import DeleteBudget from './Modals/deleteBudgets';
import ClickAwayListener from '@mui/base/ClickAwayListener';
import { BiDotsVerticalRounded } from 'react-icons/bi'
import { AnimatePresence, motion } from 'framer-motion';
import EditBudget from './editBudget';

const variants = {
    init: {
        opacity: 0,
    },
    animate: {
        opacity: 1,
        transition: {
            duration: .3,
            ease: "easeInOut"
        }
    },
    exit: {
        opacity: 0,
    }
}

function BudgetCard({ item, }: { item: IBudgetORM }) {
    // const [openNotify, setNotify] = useState(false)
    const [details, setDetails] = useState(false)
    const [detailModal, setDetailModal] = useState(false)
    const { GetCoins } = useWalletKit()
    const dark = useAppSelector(SelectDarkMode)
    const navigate = useRouter()
    const [delBudget, setDelBudget] = useState(false)
    const [editBudget, setEditBudget] = useState(false)


    const coin = item.budgetCoins;
    const usedPercent = useMemo(() => ProgressBarWidth(coin.totalUsedAmount * 100 / coin.totalAmount), [item])
    const pendingPercent = useMemo(() => ProgressBarWidth(coin.totalPending * 100 / coin.totalAmount), [item])


    useEffect(() => {
        if (detailModal) {
            document.querySelector('body')!.style.overflowY = "hidden"
        } else {
            document.querySelector('body')!.style.overflowY = ""
        }


    }, [detailModal])

    return <>
        <BudgetDetails item={item} close={setDetailModal} visibility={detailModal} />
        {/* {openNotify && createPortal(<div className="w-full h-full !my-0 !ml-0 blur-sm absolute left-0 top-0 z-[98]"></div>, document.body)} */}

        <div className="relative">
            <div className="rounded-xl cursor-pointer shadow-lg px-4 py-4 bg-white transition-all dark:bg-darkSecond hover:transition-all hover:!bg-[#f0f0f0] dark:hover:!bg-[#131313] hover:shadow-xl" >
                <div className="absolute right-0 flex items-center">
                    <div className="text-lg font-bold pr-0">{SetComma(coin.totalUsedAmount * 100 / coin.totalAmount)}%</div>
                    <div onClick={() => setDetails(!details)} className="text-3xl cursor-pointer font-bold relative inline">
                        <BiDotsVerticalRounded color='#FF7348' />
                        <AnimatePresence>
                            {details &&
                                <ClickAwayListener onClickAway={() => {
                                    setDetails(false)
                                }}>
                                    <motion.div variants={variants} initial="init" exit={"exit"} animate="animate" className="flex flex-col items-center bg-white dark:bg-dark  absolute right-4 translate-y-full bottom-0 w-[8rem]  rounded-lg shadow-xl z-50">
                                        <div
                                            className="cursor-pointer  text-sm border-b hover:bg-greylish hover:bg-opacity-5 hover:transition-all  border-greylish border-opacity-20 flex w-full pl-2 py-2 gap-3"
                                            onClick={() => {
                                                setEditBudget(true)
                                            }}>
                                            <img src={`/icons/${dark ? 'edit_white' : 'edit'}.png`} className="dark:invert dark:brightness-0 w-4 h-4" alt="" /> <span>Edit</span>
                                        </div>
                                        <div className="cursor-pointer hover:bg-greylish hover:bg-opacity-5 hover:transition-all text-sm flex w-full pl-2 py-2 gap-3" onClick={() => {
                                            setDelBudget(true)
                                        }}>
                                            <img src={`/icons/${dark ? 'trashicon_white' : 'trashicon'}.png`} className="dark:invert dark:brightness-0 w-4 h-4" alt="" /> <span>Delete</span>
                                        </div>
                                    </motion.div>
                                </ClickAwayListener>
                            }
                        </AnimatePresence>
                    </div>
                </div>
                <div onClick={() => { setDetailModal(true) }}>
                    <div className="text-xl font-bold">{item.name}</div>
                    <div className="flex items-center gap-2 text-greylish dark:text-white py-2">
                        <div className="text-2xl font-bold flex items-center gap-1">
                            <img src={GetCoins[coin.coin].logoURI} alt="" className="rounded-full w-4 h-4" />{SetComma(coin.totalUsedAmount)}
                        </div>impacted on
                        <div className="text-lg flex items-center gap-1">
                            <img src={GetCoins[coin.coin].logoURI} className="rounded-full w-4 h-4" alt="" />{SetComma(coin.totalAmount)}
                        </div>
                    </div>
                    <div className="rounded-xl w-full h-[1.2rem] relative bg-greylish bg-opacity-40 overflow-hidden">
                        <div className='absolute left-0 top-0 w-full h-full flex'>
                            <div className="h-full bg-primary rounded-l-xl" style={usedPercent}></div>
                            <div className="stripe-1 object-cover h-full" style={pendingPercent}></div>
                        </div>
                        {/* <div className="w-[15%] h-full bg-greylish bg-opacity-10 rounded-r-xl"></div> */}
                    </div>
                    <div className="grid grid-cols-4 px-3 gap-4 justify-between items-center py-4">
                        <div className="flex flex-col gap-2">
                            <div className="flex items-center gap-1 font-bold"><span className={`rounded-full bg-primary p-2 font-bold`}></span>Used</div>
                            <div className="flex items-center gap-1 font-bold"><img src={GetCoins[coin.coin].logoURI} className="w-4 h-4 rounded-full" alt="" />{SetComma(coin.totalUsedAmount)}</div>
                        </div>
                        <div className="flex flex-col gap-2">
                            <div className="flex items-center gap-1 font-bold"><span className={`rounded-full stripe-1 bg-primary p-2 font-bold`}></span>Pending</div>
                            <div className="flex items-center gap-1 font-bold"><img src={GetCoins[item.budgetCoins.coin].logoURI} className="w-4 h-4 rounded-full" alt="" />{SetComma(coin.totalPending)}</div>
                        </div>
                        <div className="flex flex-col gap-2">
                            <div className="flex items-center gap-1 font-bold"><span className={`rounded-full bg-gray-500 p-2 font-bold`}></span>Available</div>
                            <div className="flex items-center gap-1 font-bold"><img src={GetCoins[item.budgetCoins.coin].logoURI} className="w-4 h-4 rounded-full" alt="" />{SetComma(coin.totalAmount - coin.totalUsedAmount - coin.totalPending)}</div>
                        </div>
                    </div>
                    {coin.second && <>
                        <div className="w-full border-b"></div>
                        <div className="flex items-center gap-2 text-greylish dark:text-white py-4"><span className="text-2xl font-bold flex items-center gap-1 dark:text-white">
                            <img src={GetCoins[coin.second.secondCoin].logoURI} alt="" className="rounded-full w-4 h-4" />{SetComma(coin.second.secondTotalUsedAmount)}</span>impacted on<span className="text-lg flex items-center gap-1 ">
                                <img src="/icons/currencies/celodollar.svg" className="rounded-full w-4 h-4" alt="" />{SetComma(coin.second.secondTotalAmount)}</span>
                        </div>
                        <div className=" rounded-xl relative w-full h-[1.2rem] flex bg-greylish bg-opacity-40">
                            <div className="h-full bg-primary rounded-l-xl" style={ProgressBarWidth(coin.second.secondTotalUsedAmount * 100 / coin.second.secondTotalAmount)}></div>
                            {/* <div className="stripe-1 ml-2 object-cover h-full" ></div> */}
                            <div className="w-[45%] h-full bg-greylish bg-opacity-10 rounded-r-xl"></div>
                        </div>
                        <div className="grid grid-cols-4 px-3 gap-4 justify-between items-center py-4">
                            <div className="flex flex-col gap-2">
                                <div className="flex items-center gap-1 font-bold"><span className={`rounded-full bg-primary p-2 font-bold`}></span>Used</div>
                                <div className="flex items-center gap-1 font-bold"><img src={GetCoins[coin.coin].logoURI} className="w-4 h-4 rounded-full" alt="" />{SetComma(coin.second.secondTotalAmount)}</div>
                            </div>
                            <div className="flex flex-col gap-2">
                                <div className="flex items-center gap-1 font-bold"><span className={`rounded-full stripe-1 bg-primary p-2 font-bold`}></span>Pending</div>
                                <div className="flex items-center gap-1 font-bold"><img src={GetCoins[item.budgetCoins.coin].logoURI} className="w-4 h-4 rounded-full" alt="" />{SetComma(coin.second.secondTotalPending)}</div>
                            </div>
                            <div className="flex flex-col gap-2">
                                <div className="flex items-center gap-1 font-bold"><span className={`rounded-full bg-gray-500 p-2 font-bold`}></span>Available</div>
                                <div className="flex items-center gap-1 font-bold"><img src={GetCoins[item.budgetCoins.coin].logoURI} className="w-4 h-4 rounded-full" alt="" />{SetComma(coin.second.secondTotalAmount - coin.second.secondTotalUsedAmount - coin.second.secondTotalPending)}</div>
                            </div>
                        </div>
                    </>}
                </div>
            </div>
        </div>
        {
            delBudget &&
            <Modal onDisable={setDelBudget} animatedModal={false} disableX={true} className={'!w-[30%] !pt-4'}>
                <DeleteBudget onDisable={setDelBudget} budget={item} />
            </Modal>
        }

        <Modal onDisable={setEditBudget} openNotify={editBudget} animatedModal={true}>
            <EditBudget onDisable={setEditBudget} budget={item} />
        </Modal>

    </>
}

export default BudgetCard