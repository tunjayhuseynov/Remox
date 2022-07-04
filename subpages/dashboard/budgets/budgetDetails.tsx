import React, {useEffect, forwardRef} from 'react'
import _ from "lodash";
import { motion, AnimatePresence } from "framer-motion"
import SubBudgets from './subBudgets';
import Labels from './labels';
import useProfile from "rpcHooks/useProfile";
import { IBudgetItem } from './budgetCard';
import { ProgressBarWidth } from 'utils';


function BudgetDetails ({ item, openNotify,  setNotify }: { setNotify: React.Dispatch<React.SetStateAction<boolean>>, item: IBudgetItem, openNotify: boolean}) {
    const { UpdateSeenTime } = useProfile()


    useEffect(() => {
        if (openNotify) {
            UpdateSeenTime(new Date().getTime())
            document.querySelector('body')!.style.overflowY = "hidden"
        }else{
            document.querySelector('body')!.style.overflowY = ""
        }

        
    }, [openNotify])

    useEffect(() => {
        if (openNotify) {
            UpdateSeenTime(new Date().getTime())
        }
    }, [openNotify])
    

    return <AnimatePresence>
            {openNotify && <>
                <motion.div initial={{ x: "100%", opacity: 0.5 }} animate={{ x: 15, opacity: 1 }} exit={{ x: "100%", opacity: 0.5 }} transition={{ type: "spring", stiffness: 400, damping: 40 }}  className="overflow-hidden z-[9999] fixed shadow-custom grid grid-cols-[55%,45%] h-[100vh] pr-1 w-[105%] overflow-y-auto  overflow-x-hidden top-0 right-0  cursor-default ">          
                <div className="w-full h-full backdrop-blur-[2px]"></div> 
                    <div className="bg-white dark:bg-darkSecond flex flex-col min-h-[325px] sm:min-h-[auto] px-10 gap-10 py-12 justify-center sm:justify-between sm:items-stretch items-center">
                    <button onClick={() => setNotify(!openNotify)} className=" absolute left-full w-[2rem] top-0 translate-x-[-170%] translate-y-[25%] opacity-45">
                        <img src="/icons/cross_greylish.png" alt="" />
                    </button>
                        <div className="flex flex-col sm:flex-row justify-center sm:items-center text-2xl font-semibold pt-2">Budgets Details</div>
                        <div className="flex items-center justify-between w-full">
                            <div className="text-xl font-bold">{item.name}</div>
                            <div className="flex items-center gap-5">
                                <div className="text-xl font-bold">{item.Percent}</div>
                            </div>
                        </div>
                        <div>
                            <div className="flex items-center gap-2 text-greylish py-2"><span className="text-2xl font-bold flex items-center gap-1"><img src="/icons/currencies/celoiconsquare.svg" alt="" className="rounded-full" />50.000,00</span>impacted on<span className="text-lg flex items-center gap-1"><img src="/icons/currencies/celoiconsquare.svg" className="rounded-full" alt="" />100.000,00</span></div>
                            <div className=" rounded-xl relative w-full h-[1.2rem] flex    bg-greylish bg-opacity-40">
                                <div className=" w-[60%] h-full bg-primary rounded-l-xl"></div>
                                <div className="stripe-1 ml-2 object-cover h-full"  style={ProgressBarWidth(40)}></div>
                                <div className=" w-[15%] h-full bg-greylish bg-opacity-10 rounded-r-xl"></div>
                            </div>
                            <div className="grid grid-cols-4 px-3 justify-between items-center py-4">
                                {item.token.map((item, id) => {
                                    return <div key={id} className="flex flex-col gap-2">
                                        <div className="flex items-center gap-1 font-bold"><span className={`rounded-full bg-primary p-2 font-bold`}></span>{item.name}</div>
                                        <div className="flex items-center gap-1 font-bold"><img src={`/icons/currencies/${item.coinUrl}.svg`} className="w-4 h-4 rounded-full" alt="" />30.000,00</div>
                                    </div>
                                })}
                            </div>
                            {item.twoToken && <>
                                <div className="w-full border-b"></div>
                                <div className="flex items-center gap-2 text-greylish py-4"><span className="text-2xl font-bold flex items-center gap-1"><img src={`/icons/currencies/${item.coinUrl}.svg`} alt="" className="rounded-full" />{item.value}</span>impacted on<span className="text-lg flex items-center gap-1"><img src={`/icons/currencies/${item.coinUrl}.svg`} className="rounded-full" alt="" />{item.impacted}</span></div>
                                <div className=" rounded-xl relative w-full h-[1.2rem] flex    bg-greylish bg-opacity-40">
                                    <div className=" w-[27.5%] h-full bg-primary rounded-l-xl"></div>
                                    <div className=" w-[27.5%] h-full bg-greylish"></div>
                                    <div className=" w-[45%] h-full bg-greylish bg-opacity-10 rounded-r-xl"></div>
                                </div>
                                <div className="flex w-[75%] px-3 justify-between items-center py-4">
                                    {item.twoToken.map((item,index)=>{
                                       return <div key={index} className="flex flex-col gap-2">
                                        <div className="flex items-center gap-1 font-bold"><span className="rounded-full bg-primary p-2 font-bold"></span>{item.name}</div>
                                        <div className="flex items-center gap-1 font-bold"><img src={`/icons/currencies/${item.coinUrl}.svg`} className="w-4 h-4 rounded-full" alt="" />{item.value}</div>
                                    </div>
                                    })}
                                </div>
                            </>}
                        </div>
                        {item.subBudgets && <>
                            <div className="text-2xl font-bold text-start pb-4">Subbudgets</div>
                            {item.subBudgets.map((item, id) => {
                                return <div key={id}><SubBudgets item={item} /> </div>
                            })}
                        </>}
                        {item.labels && <>
                            <div className="text-2xl font-bold text-start pb-4">Expense Labels</div>
                            {item.labels.map((item, id) => {
                                return <div key={id}><Labels item={item} /> </div>
                            })}
                        </>}
                    </div>

                </motion.div>
            </>
            }
        </AnimatePresence>
}

export default BudgetDetails