import React, { useEffect, useState } from 'react'
import { motion, AnimatePresence } from "framer-motion"
import { IBudgetExerciseORM } from 'pages/api/budget/index.api';
import { SetComma } from 'utils';
import { useWalletKit } from 'hooks';
import CloseOutlinedIcon from '@mui/icons-material/CloseOutlined';

function TotalDetails({ total }: { total: IBudgetExerciseORM }) {
    const [openNotify, setNotify] = useState(false)
    const { GetCoins } = useWalletKit()

    useEffect(() => {
        if (openNotify) {
            document.querySelector('body')!.style.overflowY = "hidden"
        } else {
            document.querySelector('body')!.style.overflowY = ""
        }
    }, [openNotify])



    return <>
        <div onClick={() => { setNotify(!openNotify) }}>
            <span className="text-white pb-[3px] bg-primary transition-all rounded-full text-4xl flex items-center justify-center w-8 h-8 cursor-pointer hover:bg-[#ff5413] hover:transition-all">&#8250;</span>
        </div>
        <AnimatePresence>
            {openNotify &&
                <motion.div initial={{ x: "100%", opacity: 0.5 }} animate={{ x: 15, opacity: 1 }} exit={{ x: "100%", opacity: 0.5 }} transition={{ type: "spring", stiffness: 400, damping: 40 }} className=" z-[99] fixed shadow-custom grid grid-cols-[70%,30%] h-[100vh] w-[105%]  pr-1 overflow-y-auto overflow-x-hidden top-0 right-4 cursor-default ">
                    <div className="w-full h-full backdrop-blur-[2px]" onClick={() => { setNotify(!openNotify) }}></div>
                    <button onClick={() => setNotify(false)} className=" absolute left-full w-[2rem] top-0 translate-x-[-170%] translate-y-[25%] opacity-45">
                        <CloseOutlinedIcon className="t !w-8 !h-8 text-greylish hover:text-[#aaaaaa]" />
                    </button>
                    <div className="flex flex-col min-h-[325px] bg-white dark:bg-darkSecond sm:min-h-[auto] py-10 justify-center sm:justify-between sm:items-stretch items-center">
                        <div className="flex flex-col sm:flex-row justify-center sm:items-center text-2xl font-medium tracking-wide">Spending Details</div>
                        <div className="flex flex-col gap-8 py-8 border-b px-10 ">
                            <div className="flex justify-between px-2"><span className="font-medium text-lg text-gray-400">Total budget</span><span className="text-greylish dark:text-white text-lg">${SetComma(total.totalBudget)} </span></div>
                            <div className="flex justify-between px-2">
                                <span className="text-lg font-medium text-gray-400">Token Breakdown</span>
                                <div className="flex flex-col items-end gap-2">
                                    {total.budgetCoins.map((coin, index) => {
                                        return <div className="flex items-center gap-1">
                                            <span className="text-lg font-medium">{SetComma(coin.totalAmount)}</span> <img src={GetCoins[coin.coin].logoURI} className="w-5 h-5 rounded-full" alt="" /> <span className="text-lg font-medium">{coin.coin}</span>
                                        </div>
                                    })}
                                </div>
                            </div>
                        </div>
                        <div className="flex flex-col gap-8 py-8 border-b px-10">
                            <div className="flex justify-between px-2"><span className="font-medium text-lg text-gray-400">Total Used</span><span className="text-greylish dark:text-white text-lg">${SetComma(total.totalUsed)}</span></div>
                            <div className="flex justify-between px-2">
                                <span className="text-lg font-medium text-gray-400">Token Breakdown</span>
                                <div className="flex flex-col  items-end gap-2">
                                    {total.budgetCoins.map((coin, index) => {
                                        return <div className="flex items-center gap-1">
                                            <span className="text-lg font-medium">{SetComma(coin.totalUsedAmount)}</span> <img src={GetCoins[coin.coin].logoURI} className="w-5 h-5 rounded-full" alt="" /> <span className="text-lg font-medium">{coin.coin}</span>
                                        </div>
                                    })}
                                </div>
                            </div>
                        </div>
                        <div className="flex flex-col gap-8 py-8 border-b px-10">
                            <div className="flex justify-between px-2"><span className="font-medium text-lg text-gray-400">Total Pending</span><span className="text-greylish dark:text-white text-lg">${SetComma(31000)}</span></div>
                            <div className="flex justify-between px-2">
                                <span className="text-lg font-medium text-gray-400">Token Breakdown</span>
                                <div className="flex flex-col items-end gap-2">
                                    {total.budgetCoins.map((coin, index) => {
                                        return <div className="flex items-center gap-1">
                                            <span className="text-lg font-medium">{SetComma(coin.totalPending)}</span> <img src={GetCoins[coin.coin].logoURI} className="w-5 h-5 rounded-full" alt="" /> <span className="text-lg font-medium">{coin.coin}</span>
                                        </div>
                                    })}
                                </div>
                            </div>
                        </div>
                        <div className="flex flex-col gap-8 py-8 border-b px-10">
                            <div className="flex justify-between px-2"><span className="font-medium text-lg text-gray-400">Total Available</span><span className=" dark:text-white text-lg">${SetComma(60000)}</span></div>
                            <div className="flex justify-between px-2">
                                <span className="text-lg font-medium text-gray-400">Token Breakdown</span>
                                <div className="flex flex-col  items-end gap-2">
                                    {total.budgetCoins.map((coin, index) => {
                                        return <div className="flex items-center gap-1">
                                            <span className="text-lg font-medium">{SetComma((coin.totalAmount - coin.totalPending - coin.totalUsedAmount))}</span> <img src={GetCoins[coin.coin].logoURI} className="w-5 h-5 rounded-full" alt="" /> <span className="text-lg font-medium">{coin.coin}</span>
                                        </div>
                                    })}
                                </div>
                            </div>
                        </div>
                    </div>
                </motion.div>}
        </AnimatePresence>
    </>
}

export default TotalDetails