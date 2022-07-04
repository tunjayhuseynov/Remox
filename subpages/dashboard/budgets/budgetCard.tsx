import React, { useState } from 'react'
import { useAppSelector } from 'redux/hooks';
import { selectDarkMode } from 'redux/slices/notificationSlice';
import BudgetDetails from './budgetDetails';
import { useModalSideExit, useWalletKit } from "hooks";
import { ProgressBarWidth } from '../../../utils'
import { createPortal } from 'react-dom';
import { IBudgetORM } from 'pages/api/budget';


function BudgetCard({ setEditBudget, setDelBudget, item, id }: { item: IBudgetORM, id: number, setEditBudget: React.Dispatch<boolean>, setDelBudget: React.Dispatch<boolean> }) {
    const [openNotify, setNotify] = useState(false)
    const [details, setDetails] = useState(false)
    const [detailModal, setDetailModal] = useState(false)
    const { GetCoins } = useWalletKit()
    const dark = useAppSelector(selectDarkMode)


    const [divRef2, exceptRef2] = useModalSideExit(details, setDetails, false)

    return <>
        <BudgetDetails item={item} divRef={divRef2} setNotify={setNotify} openNotify={openNotify} />
        {openNotify && createPortal(<div className="w-full h-full !my-0 !ml-0 blur-sm absolute left-0 top-0 z-[98]"></div>, document.body)}
        <div key={id} >
            <div className="rounded-xl shadow-lg px-4 py-4 bg-white transition-all dark:bg-darkSecond hover:transition-all hover:!bg-[#f0f0f0] dark:hover:!bg-[#131313]  hover:shadow-xl" >
                <div className="flex items-center justify-between w-full">
                    <div className="text-xl font-bold">{item.name}</div>
                    <div className="flex items-center gap-5">
                        <div className="text-xl font-bold">{item.totalUsed * 100 / item.totalBudget}</div>
                        <div className="flex space-x-3 justify-end" >
                            <span ref={exceptRef2} onClick={() => { setDetails(!details) }} className=" text-3xl flex items-center  cursor-pointer  font-bold relative"><span className=" text-primary pb-4 rotate-90">...</span>
                                {details && <div ref={divRef2} className="flex flex-col items-center bg-white dark:bg-darkSecond  absolute right-5 -bottom-5 w-[7rem]  rounded-lg shadow-xl z-50 ">
                                    <div className="cursor-pointer  text-sm border-b border-greylish border-opacity-20 flex w-full pl-2 py-1 gap-3" onClick={() => {
                                        setEditBudget(true)
                                    }}>
                                        <img src={`/icons/${dark ? 'edit_white' : 'edit'}.png`} className="dark:invert dark:brightness-0 w-4 h-4" alt="" /> <span>Edit</span>
                                    </div>
                                    <div className="cursor-pointer  text-sm flex w-full pl-2 py-1 gap-3" onClick={() => {
                                        setDelBudget(true)
                                    }}>
                                        <img src={`/icons/${dark ? 'trashicon_white' : 'trashicon'}.png`} className="dark:invert dark:brightness-0 w-4 h-4" alt="" /> <span>Delete</span>
                                    </div>
                                </div>}
                            </span>
                        </div>
                    </div>
                </div>
                <div ref={exceptRef2} onClick={() => { setNotify(!openNotify) }}>
                    <div className="flex items-center gap-2 text-greylish dark:text-white py-2">
                        <span className="text-2xl font-bold flex items-center gap-1">
                            <img src={GetCoins[item.budgetCoins.coin].coinUrl} alt="" className="rounded-full" />{item.totalUsed}</span>impacted on
                        <span className="text-lg flex items-center gap-1">
                            <img src={GetCoins[item.budgetCoins.coin].coinUrl} className="rounded-full" alt="" />{item.totalBudget}
                        </span>
                    </div>
                    <div className=" rounded-xl relative w-full h-[1.2rem] flex    bg-greylish bg-opacity-40">
                        <div className=" w-[60%] h-full bg-primary rounded-l-xl"></div>
                        <div className="stripe-1 ml-2 object-cover h-full" style={ProgressBarWidth(40)}></div>
                        <div className=" w-[15%] h-full bg-greylish bg-opacity-10 rounded-r-xl"></div>
                    </div>
                    <div className="grid grid-cols-4 px-3 gap-4 justify-between items-center py-4">
                        <div className="flex flex-col gap-2">
                            <div className="flex items-center gap-1 font-bold"><span className={`rounded-full bg-primary p-2 font-bold`}></span>{item.name}</div>
                            <div className="flex items-center gap-1 font-bold"><img src={GetCoins[item.budgetCoins.coin].coinUrl} className="w-4 h-4 rounded-full" alt="" />{item.totalUsed}</div>
                        </div>
                    </div>
                    {item.budgetCoins.second && <>
                        <div className="w-full border-b"></div>
                        <div className="flex items-center gap-2 text-greylish dark:text-white py-4"><span className="text-2xl font-bold flex items-center gap-1 dark:text-white">
                            <img src={GetCoins[item.budgetCoins.second.secondCoin].coinUrl} alt="" className="rounded-full" />{item.budgetCoins.second.secondTotalUsedAmount}</span>impacted on<span className="text-lg flex items-center gap-1 ">
                                <img src="/icons/currencies/celodollar.svg" className="rounded-full" alt="" />{item.budgetCoins.second.secondTotalAmount}</span>
                        </div>
                        <div className=" rounded-xl relative w-full h-[1.2rem] flex    bg-greylish bg-opacity-40">
                            <div className=" w-[27.5%] h-full bg-primary rounded-l-xl"></div>
                            <div className="stripe-1 ml-2 object-cover h-full" style={ProgressBarWidth(40)}></div>
                            <div className=" w-[45%] h-full bg-greylish bg-opacity-10 rounded-r-xl"></div>
                        </div>
                        <div className="grid grid-cols-4 px-3 justify-between items-center py-4">
                            <div className="flex flex-col gap-2">
                                <div className="flex items-center gap-1 font-bold"><span className={`rounded-full bg-primary p-2 font-bold`}></span>{item.budgetCoins.second.secondCoin}</div>
                                <div className="flex items-center gap-1 font-bold"><img src={GetCoins[item.budgetCoins.second.secondCoin].coinUrl} className="w-4 h-4 rounded-full" alt="" />{item.budgetCoins.second.secondTotalUsedAmount}</div>
                            </div>
                        </div>
                    </>}
                </div>
            </div>
        </div>
    </>
}

export default BudgetCard