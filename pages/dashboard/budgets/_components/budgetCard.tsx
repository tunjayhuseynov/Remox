import React, { useEffect, useMemo, useState } from 'react'
import { useAppSelector } from 'redux/hooks';
import { SelectDarkMode } from 'redux/slices/account/remoxData';
import BudgetDetails from './budgetDetails';
import { useModalSideExit, useWalletKit } from "hooks";
import { IBudgetORM } from 'pages/api/budget/index.api';
import { useRouter } from 'next/router';
import { ProgressBarWidth, SetComma } from 'utils';
import Modal from 'components/general/modal';
import DeleteBudget from './Modals/deleteBudgets';

function BudgetCard({ item, }: { item: IBudgetORM }) {
    // const [openNotify, setNotify] = useState(false)
    const [details, setDetails] = useState(false)
    const [detailModal, setDetailModal] = useState(false)
    const { GetCoins } = useWalletKit()
    const dark = useAppSelector(SelectDarkMode)
    const navigate = useRouter()
    const [delBudget, setDelBudget] = useState(false)

    const [divRef, exceptRef] = useModalSideExit(detailModal, setDetailModal, false)

    const coin = item.budgetCoins;
    const usedPercent = useMemo(() => ProgressBarWidth(coin.totalUsedAmount * 100 / coin.totalAmount), [item])


    useEffect(() => {
        if (detailModal) {
            document.querySelector('body')!.style.overflowY = "hidden"
        } else {
            document.querySelector('body')!.style.overflowY = ""
        }


    }, [detailModal])

    return <>
        <BudgetDetails item={item} ref={divRef} close={setDetailModal} visibility={detailModal} />
        {/* {openNotify && createPortal(<div className="w-full h-full !my-0 !ml-0 blur-sm absolute left-0 top-0 z-[98]"></div>, document.body)} */}

        <div className="relative">
            <div className="right-2 top-1 absolute flex space-x-3 justify-end" >
                <span onClick={() => setDetails(!details)} className=" text-3xl flex items-center  cursor-pointer  font-bold relative"><span className=" text-primary pb-4 rotate-90">...</span>
                    {details && <div ref={divRef} className="flex flex-col items-center bg-white dark:bg-dark  absolute right-4 -bottom-8 w-[8rem]  rounded-lg shadow-xl z-50 ">
                        <div className="cursor-pointer  text-sm border-b hover:bg-greylish hover:bg-opacity-5 hover:transition-all  border-greylish border-opacity-20 flex w-full pl-2 py-2 gap-3" onClick={() => {
                            navigate.push('/dashboard/budgets/edit-budget')
                        }}>
                            <img src={`/icons/${dark ? 'edit_white' : 'edit'}.png`} className="dark:invert dark:brightness-0 w-4 h-4" alt="" /> <span>Edit</span>
                        </div>
                        <div className="cursor-pointer hover:bg-greylish hover:bg-opacity-5 hover:transition-all text-sm flex w-full pl-2 py-2 gap-3" onClick={() => {
                            setDelBudget(true)
                        }}>
                            <img src={`/icons/${dark ? 'trashicon_white' : 'trashicon'}.png`} className="dark:invert dark:brightness-0 w-4 h-4" alt="" /> <span>Delete</span>
                        </div>
                    </div>}
                </span>
            </div>
            <div ref={exceptRef} onClick={() => { setDetailModal(true) }} className=" rounded-xl shadow-lg px-4 py-4 bg-white transition-all dark:bg-darkSecond hover:transition-all hover:!bg-[#f0f0f0] dark:hover:!bg-[#131313] hover:shadow-xl" >
                <div className="flex items-center justify-between w-full">
                    <div className="text-xl font-bold">{item.name}</div>
                    <div className="flex items-center gap-5">
                        <div className="text-xl font-bold pr-4">{SetComma(coin.totalUsedAmount * 100 / coin.totalAmount)}%</div>
                    </div>
                </div>
                <div>
                    <div className="flex items-center gap-2 text-greylish dark:text-white py-2">
                        <span className="text-2xl font-bold flex items-center gap-1">
                            <img src={GetCoins[coin.coin].coinUrl} alt="" className="rounded-full w-4 h-4" />{SetComma(coin.totalUsedAmount)}</span>impacted on
                        <span className="text-lg flex items-center gap-1">
                            <img src={GetCoins[coin.coin].coinUrl} className="rounded-full w-4 h-4" alt="" />{SetComma(coin.totalAmount)}
                        </span>
                    </div>
                    <div className=" rounded-xl relative w-full h-[1.2rem] flex bg-greylish bg-opacity-40">
                        <div className=" h-full bg-primary rounded-l-xl" style={usedPercent}></div>
                        <div className="stripe-1 ml-2 object-cover h-full"></div>
                        <div className=" w-[15%] h-full bg-greylish bg-opacity-10 rounded-r-xl"></div>
                    </div>
                    <div className="grid grid-cols-4 px-3 gap-4 justify-between items-center py-4">
                        <div className="flex flex-col gap-2">
                            <div className="flex items-center gap-1 font-bold"><span className={`rounded-full bg-primary p-2 font-bold`}></span>Used</div>
                            <div className="flex items-center gap-1 font-bold"><img src={GetCoins[coin.coin].coinUrl} className="w-4 h-4 rounded-full" alt="" />{SetComma(coin.totalUsedAmount)}</div>
                        </div>
                        <div className="flex flex-col gap-2">
                            <div className="flex items-center gap-1 font-bold"><span className={`rounded-full stripe-1 bg-primary p-2 font-bold`}></span>Pending</div>
                            <div className="flex items-center gap-1 font-bold"><img src={GetCoins[item.budgetCoins.coin].coinUrl} className="w-4 h-4 rounded-full" alt="" />{SetComma(0)}</div>
                        </div>
                        <div className="flex flex-col gap-2">
                            <div className="flex items-center gap-1 font-bold"><span className={`rounded-full bg-gray-500 p-2 font-bold`}></span>Available</div>
                            <div className="flex items-center gap-1 font-bold"><img src={GetCoins[item.budgetCoins.coin].coinUrl} className="w-4 h-4 rounded-full" alt="" />{SetComma(coin.totalAmount - coin.totalUsedAmount)}</div>
                        </div>
                    </div>
                    {coin.second && <>
                        <div className="w-full border-b"></div>
                        <div className="flex items-center gap-2 text-greylish dark:text-white py-4"><span className="text-2xl font-bold flex items-center gap-1 dark:text-white">
                            <img src={GetCoins[coin.second.secondCoin].coinUrl} alt="" className="rounded-full w-4 h-4" />{SetComma(coin.second.secondTotalUsedAmount)}</span>impacted on<span className="text-lg flex items-center gap-1 ">
                                <img src="/icons/currencies/celodollar.svg" className="rounded-full w-4 h-4" alt="" />{SetComma(coin.second.secondTotalAmount)}</span>
                        </div>
                        <div className=" rounded-xl relative w-full h-[1.2rem] flex bg-greylish bg-opacity-40">
                            <div className="h-full bg-primary rounded-l-xl" style={ProgressBarWidth(coin.second.secondTotalUsedAmount * 100 / coin.second.secondTotalAmount)}></div>
                            {/* <div className="stripe-1 ml-2 object-cover h-full" ></div> */}
                            <div className="w-[45%] h-full bg-greylish bg-opacity-10 rounded-r-xl"></div>
                        </div>
                        <div className="grid grid-cols-4 px-3 justify-between items-center py-4">
                            <div className="flex flex-col gap-2">
                                <div className="flex items-center gap-1 font-bold"><span className={`rounded-full bg-primary p-2 font-bold`}></span>Used</div>
                                <div className="flex items-center gap-1 font-bold"><img src={GetCoins[coin.second.secondCoin].coinUrl} className="w-4 h-4 rounded-full" alt="" />{SetComma(coin.second.secondTotalUsedAmount)}</div>
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
    </>
}

export default BudgetCard