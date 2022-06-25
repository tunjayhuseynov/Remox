import React, { useEffect, useState } from 'react'
import { motion, AnimatePresence } from "framer-motion"
import { useModalSideExit } from "hooks";
import useProfile from 'rpcHooks/useProfile';
import { IBudgetExerciseORM } from 'pages/api/budget';

function TotalDetails({ total }: { total: IBudgetExerciseORM }) {
    const { profile, UpdateSeenTime } = useProfile()
    const [openNotify, setNotify] = useState(false)

    useEffect(() => {
        if (openNotify) {
            UpdateSeenTime(new Date().getTime())
        }
    }, [openNotify])


    const [divRef, exceptRef] = useModalSideExit(openNotify, setNotify, false)

    return <>

        <div ref={exceptRef} onClick={() => { setNotify(!openNotify) }}>
            <img src="/icons/next_budgets.png" alt="" className="w-10 h-10 cursor-pointer" />
        </div>
        <AnimatePresence>
            {openNotify &&
                <motion.div initial={{ x: "100%", opacity: 0.5 }} animate={{ x: 15, opacity: 1 }} exit={{ x: "100%", opacity: 0.5 }} transition={{ type: "spring", stiffness: 400, damping: 40 }} ref={divRef} className=" z-[97] fixed shadow-custom w-[40rem] h-[100vh] pr-1 overflow-y-auto overflow-x-hidden top-0 right-0 bg-white dark:bg-darkSecond cursor-default ">
                    <button onClick={() => setNotify(false)} className=" absolute left-full w-[2rem] top-0 translate-x-[-170%] translate-y-[25%] opacity-45">
                        <img src="/icons/cross_greylish.png" alt="" />
                    </button>
                    <div className="flex flex-col min-h-[325px] sm:min-h-[auto] px-12 py-12 justify-center sm:justify-between sm:items-stretch items-center">
                        <div className="flex flex-col sm:flex-row justify-center sm:items-center text-2xl font-semibold pt-2">Spending Details</div>
                        <div className="flex flex-col gap-8 py-8 border-b">
                            <div className="flex justify-between px-2"><span className="text-greylish dark:text-white text-xl">{total.totalBudget}</span><span className="font-bold text-xl">Total budget</span></div>
                            <div className="flex justify-between px-2">
                                <span className="text-greylish dark:text-white text-xl">Token Breakdown</span>
                                {/* <div className="flex flex-col gap-2">
                                    <div className="flex items-center gap-1"><span className="text-xl font-bold">{item.token.value}</span> <img src={`/icons/currencies/${item.token.coinUrl}.svg`} className="w-5 h-5 rounded-full" alt="" /> <span className="text-xl font-bold">{item.token.name}</span> </div>
                                    {item.token2 && <div className="flex items-center gap-1"><span className="text-xl font-bold">{item.token2.value}</span> <img src={`/icons/currencies/${item.token2.coinUrl}.svg`} className="w-5 h-5 rounded-full" alt="" /> <span className="text-xl font-bold">{item.token2.name}</span> </div>}
                                </div> */}
                            </div>
                        </div>
                        <div className="flex flex-col gap-8 py-8 border-b">
                            <div className="flex justify-between px-2"><span className="text-greylish dark:text-white text-xl">{total.totalUsed}</span><span className="font-bold text-xl">Total Used</span></div>
                            <div className="flex justify-between px-2">
                                <span className="text-greylish dark:text-white text-xl">Token Breakdown</span>
                                {/* <div className="flex flex-col gap-2">
                                    <div className="flex items-center gap-1"><span className="text-xl font-bold">{item.token.value}</span> <img src={`/icons/currencies/${item.token.coinUrl}.svg`} className="w-5 h-5 rounded-full" alt="" /> <span className="text-xl font-bold">{item.token.name}</span> </div>
                                    {item.token2 && <div className="flex items-center gap-1"><span className="text-xl font-bold">{item.token2.value}</span> <img src={`/icons/currencies/${item.token2.coinUrl}.svg`} className="w-5 h-5 rounded-full" alt="" /> <span className="text-xl font-bold">{item.token2.name}</span> </div>}
                                </div> */}
                            </div>
                        </div>
                        <div className="flex flex-col gap-8 py-8 border-b">
                            <div className="flex justify-between px-2"><span className="text-greylish dark:text-white text-xl">{0}</span><span className="font-bold text-xl">Total Pending</span></div>
                            <div className="flex justify-between px-2">
                                <span className="text-greylish dark:text-white text-xl">Token Breakdown</span>
                                {/* <div className="flex flex-col gap-2">
                                    <div className="flex items-center gap-1"><span className="text-xl font-bold">{item.token.value}</span> <img src={`/icons/currencies/${item.token.coinUrl}.svg`} className="w-5 h-5 rounded-full" alt="" /> <span className="text-xl font-bold">{item.token.name}</span> </div>
                                    {item.token2 && <div className="flex items-center gap-1"><span className="text-xl font-bold">{item.token2.value}</span> <img src={`/icons/currencies/${item.token2.coinUrl}.svg`} className="w-5 h-5 rounded-full" alt="" /> <span className="text-xl font-bold">{item.token2.name}</span> </div>}
                                </div> */}
                            </div>
                        </div>
                        <div className="flex flex-col gap-8 py-8 border-b">
                            <div className="flex justify-between px-2"><span className="text-greylish dark:text-white text-xl">{total.totalAvailable}</span><span className="font-bold text-xl">Total Available</span></div>
                            <div className="flex justify-between px-2">
                                <span className="text-greylish dark:text-white text-xl">Token Breakdown</span>
                                {/* <div className="flex flex-col gap-2">
                                    <div className="flex items-center gap-1"><span className="text-xl font-bold">{total.budgetCoins.}</span> <img src={`/icons/currencies/${item.token.coinUrl}.svg`} className="w-5 h-5 rounded-full" alt="" /> <span className="text-xl font-bold">{item.token.name}</span> </div>
                                    {item.token2 && <div className="flex items-center gap-1"><span className="text-xl font-bold">{item.token2.value}</span> <img src={`/icons/currencies/${item.token2.coinUrl}.svg`} className="w-5 h-5 rounded-full" alt="" /> <span className="text-xl font-bold">{item.token2.name}</span> </div>}
                                </div> */}
                            </div>
                        </div>
                    </div>

                </motion.div>}
        </AnimatePresence>
    </>
}

export default TotalDetails