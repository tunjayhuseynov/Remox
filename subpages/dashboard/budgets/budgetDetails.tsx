import React, { Dispatch, SetStateAction } from 'react'
import _ from "lodash";
import { motion, AnimatePresence } from "framer-motion"
import SubBudgets from './subBudgets';
import Labels from './labels';
import { ProgressBarWidth } from '../../../utils'
import ReactDOM, { createPortal } from 'react-dom';
import { IBudgetItem } from './budgetCard';

function BudgetDetails({ item, openNotify, divRef, setNotify }: { setNotify: React.Dispatch<React.SetStateAction<boolean>>, item: IBudgetItem, openNotify: boolean, divRef: React.RefObject<HTMLDivElement> }) {

    const subbudgets = [
        {
            id: 0,
            name: "Security",
        },
        {
            id: 1,
            name: "Product",
        },
        {
            id: 2,
            name: "Event",
        }
    ]

    const labels = [
        {
            id: 0,
            name: "Security",
        },
        {
            id: 1,
            name: "Event",
        },

    ]

    const tokens = [
        {
            id: 0,
            name: "used",
        },
        {
            id: 1,
            name: "Pending",
        },
        {
            id: 2,
            name: "Available",
        },
    ]

    return ReactDOM.createPortal(<>
        <AnimatePresence>
            {openNotify && <>
                <motion.div initial={{ x: "100%", opacity: 0.5 }} animate={{ x: 15, opacity: 1 }} exit={{ x: "100%", opacity: 0.5 }} transition={{ type: "spring", stiffness: 400, damping: 40 }} ref={divRef} className=" z-[97] blu fixed shadow-custom min-w-[50rem] h-[100vh] pr-1 overflow-y-auto overflow-x-hidden top-0 right-0 bg-white dark:bg-darkSecond cursor-default ">
                    <button onClick={() => setNotify(false)} className=" absolute left-full w-[2rem] top-0 translate-x-[-170%] translate-y-[25%] opacity-45">
                        <img src="/icons/cross_greylish.png" alt="" />
                    </button>
                    <div className="flex flex-col min-h-[325px] sm:min-h-[auto] px-10 gap-10 py-12 justify-center sm:justify-between sm:items-stretch items-center">
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
                                <div className="stripe-1  object-cover h-full" style={ProgressBarWidth(40)}></div>
                                <div className=" w-[15%] h-full bg-greylish bg-opacity-10 rounded-r-xl"></div>
                            </div>
                            <div className="grid grid-cols-4 px-3 justify-between items-center py-4">
                                {tokens.map((item, id) => {
                                    return <div key={id} className="flex flex-col gap-2">
                                        <div className="flex items-center gap-1 font-bold"><span className={`rounded-full bg-primary p-2 font-bold`}></span>{item.name}</div>
                                        <div className="flex items-center gap-1 font-bold"><img src="/icons/currencies/celoiconsquare.svg" className="w-4 h-4 rounded-full" alt="" />30.000,00</div>
                                    </div>
                                })}
                            </div>
                            {item.isDoubleToken && <>
                                <div className="w-full border-b"></div>
                                <div className="flex items-center gap-2 text-greylish py-4"><span className="text-2xl font-bold flex items-center gap-1"><img src="/icons/currencies/celodollar.svg" alt="" className="rounded-full" />50.000,00</span>impacted on<span className="text-lg flex items-center gap-1"><img src="/icons/currencies/celodollar.svg" className="rounded-full" alt="" />100.000,00</span></div>
                                <div className=" rounded-xl relative w-full h-[1.2rem] flex    bg-greylish bg-opacity-40">
                                    <div className=" w-[27.5%] h-full bg-primary rounded-l-xl"></div>
                                    <div className=" w-[27.5%] h-full bg-greylish"></div>
                                    <div className=" w-[45%] h-full bg-greylish bg-opacity-10 rounded-r-xl"></div>
                                </div>
                                <div className="flex w-[75%] px-3 justify-between items-center py-4">
                                    <div className="flex flex-col gap-2">
                                        <div className="flex items-center gap-1 font-bold"><span className="rounded-full bg-primary p-2 font-bold"></span>Used</div>
                                        <div className="flex items-center gap-1 font-bold"><img src="/icons/currencies/celodollar.svg" className="w-4 h-4 rounded-full" alt="" />18.000,00</div>
                                    </div>
                                    <div className="flex flex-col gap-2">
                                        <div className="flex items-center gap-1 font-bold"><span className="rounded-full bg-greylish p-2 font-bold"></span>Pending</div>
                                        <div className="flex items-center gap-1 font-bold"><img src="/icons/currencies/celodollar.svg" className="w-4 h-4 rounded-full" alt="" />47.000,00</div>
                                    </div>
                                    <div className="flex flex-col gap-2">
                                        <div className="flex items-center gap-1 font-bold"><span className="rounded-full bg-greylish bg-opacity-10 p-2 font-bold"></span>Available</div>
                                        <div className="flex items-center gap-1 font-bold"><img src="/icons/currencies/celodollar.svg" className="w-4 h-4 rounded-full" alt="" />68.000,00</div>
                                    </div>
                                </div>
                            </>}
                        </div>
                        {item.subBudgets && <>
                            <div className="text-2xl font-bold text-start pb-4">Subbudgets</div>
                            {subbudgets.map((item, id) => {
                                return <div key={id}><SubBudgets item={item} id={id} /> </div>
                            })}
                        </>}
                        {item.labels && <>
                            <div className="text-2xl font-bold text-start pb-4">Expense Labels</div>
                            {labels.map((item, id) => {
                                return <div key={id}><Labels item={item} /> </div>
                            })}
                        </>}
                    </div>

                </motion.div>
            </>
            }
        </AnimatePresence></>, document.body)
}

export default BudgetDetails