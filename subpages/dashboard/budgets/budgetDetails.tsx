import React, { useEffect } from 'react'
import _ from "lodash";
import { motion, AnimatePresence } from "framer-motion"
import SubBudgets from './subBudgets';
import Labels from './labels';
import useProfile from "rpcHooks/useProfile";
import { ProgressBarWidth } from 'utils';
import { IBudgetItem } from 'types/dashboard/budgets';
import { IBudgetORM } from 'pages/api/budget';
import { useWalletKit } from 'hooks';


function BudgetDetails({ item, openNotify, divRef, setNotify }: { setNotify: React.Dispatch<React.SetStateAction<boolean>>, item: IBudgetORM, openNotify: boolean, divRef: React.RefObject<HTMLDivElement> }) {
    const { UpdateSeenTime } = useProfile()

    const { GetCoins } = useWalletKit()

    useEffect(() => {
        if (openNotify) {
            UpdateSeenTime(new Date().getTime())
        }
    }, [openNotify])


    return <AnimatePresence>
        {openNotify && <>
            <motion.div initial={{ x: "100%", opacity: 0.5 }} animate={{ x: 15, opacity: 1 }} exit={{ x: "100%", opacity: 0.5 }} transition={{ type: "spring", stiffness: 400, damping: 40 }} ref={divRef} className="z-[97] blu fixed shadow-custom min-w-[50rem] h-[100vh] pr-1 overflow-y-auto overflow-x-hidden top-0 right-0 bg-white dark:bg-darkSecond cursor-default">
                <button onClick={() => setNotify(!openNotify)} className=" absolute left-full w-[2rem] top-0 translate-x-[-170%] translate-y-[25%] opacity-45">
                    <img src="/icons/cross_greylish.png" alt="" />
                </button>
                <div className="flex flex-col min-h-[325px] sm:min-h-[auto] px-10 gap-10 py-12 justify-center sm:justify-between sm:items-stretch items-center">
                    <div className="flex flex-col sm:flex-row justify-center sm:items-center text-2xl font-semibold pt-2">Budgets Details</div>
                    <div className="flex items-center justify-between w-full">
                        <div className="text-xl font-bold">{item.name}</div>
                        <div className="flex items-center gap-5">
                            <div className="text-xl font-bold">{item.totalBudget * 100 / item.totalAvailable}</div>
                        </div>
                    </div>
                    <div>
                        <div className="flex items-center gap-2 text-greylish py-2"><span className="text-2xl font-bold flex items-center gap-1">
                            <img src="/icons/currencies/celoiconsquare.svg" alt="" className="rounded-full" />{item.totalUsed}</span>impacted on<span className="text-lg flex items-center gap-1"><img src="/icons/currencies/celoiconsquare.svg" className="rounded-full" alt="" />{item.totalAvailable}</span></div>
                        <div className=" rounded-xl relative w-full h-[1.2rem] flex    bg-greylish bg-opacity-40">
                            <div className=" w-[60%] h-full bg-primary rounded-l-xl"></div>
                            <div className="stripe-1 ml-2 object-cover h-full" style={ProgressBarWidth(40)}></div>
                            <div className=" w-[15%] h-full bg-greylish bg-opacity-10 rounded-r-xl"></div>
                        </div>
                        <div className="grid grid-cols-4 px-3 justify-between items-center py-4">
                            <div className="flex flex-col gap-2">
                                <div className="flex items-center gap-1 font-bold"><span className={`rounded-full bg-primary p-2 font-bold`}></span>{item.budgetCoins.coin}</div>
                                <div className="flex items-center gap-1 font-bold"><img src={GetCoins[item.budgetCoins.coin].coinUrl} className="w-4 h-4 rounded-full" alt="" />{item.budgetCoins.totalUsedAmount}</div>
                            </div>
                        </div>
                        {item.budgetCoins.second && <>
                            <div className="w-full border-b"></div>
                            <div className="flex items-center gap-2 text-greylish py-4">
                                <span className="text-2xl font-bold flex items-center gap-1">
                                    <img src={GetCoins[item.budgetCoins.second.secondCoin].coinUrl} alt="" className="rounded-full" />
                                    {item.budgetCoins.second.secondTotalUsedAmount}
                                </span>impacted on<span className="text-lg flex items-center gap-1">
                                    <img src={GetCoins[item.budgetCoins.second.secondCoin].coinUrl} className="rounded-full" alt="" />{item.budgetCoins.second.secondTotalAmount}
                                </span>
                            </div>
                            <div className=" rounded-xl relative w-full h-[1.2rem] flex    bg-greylish bg-opacity-40">
                                <div className=" w-[27.5%] h-full bg-primary rounded-l-xl"></div>
                                <div className=" w-[27.5%] h-full bg-greylish"></div>
                                <div className=" w-[45%] h-full bg-greylish bg-opacity-10 rounded-r-xl"></div>
                            </div>
                            <div className="flex w-[75%] px-3 justify-between items-center py-4">
                                <div className="flex flex-col gap-2">
                                    <div className="flex items-center gap-1 font-bold"><span className="rounded-full bg-primary p-2 font-bold"></span>{item.name}</div>
                                    <div className="flex items-center gap-1 font-bold"><img src={GetCoins[item.budgetCoins.second.secondCoin].coinUrl} className="w-4 h-4 rounded-full" alt="" />{item.budgetCoins.second.secondTotalUsedAmount}</div>
                                </div>
                            </div>
                        </>}
                    </div>
                    {/* {item.subbudgets && <>
                        <div className="text-2xl font-bold text-start pb-4">Subbudgets</div>
                        {item.subbudgets.map((item, id) => <div key={id}>
                            <SubBudgets item={item} />
                        </div>
                        )}
                    </>} */}
                    {/* {item.labels && <>
                        <div className="text-2xl font-bold text-start pb-4">Expense Labels</div>
                        {item.labels.map((item, id) => {
                            return <div key={id}><Labels item={item} /> </div>
                        })}
                    </>} */}
                </div>

            </motion.div>
        </>
        }
    </AnimatePresence>
}

export default BudgetDetails