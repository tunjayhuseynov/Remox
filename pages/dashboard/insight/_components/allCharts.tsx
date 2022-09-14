import { useEffect, useState, useContext } from "react";
import Paydropdown from "pages/dashboard/pay/_components/paydropdown";
import { BasicCharts } from "./charts/basicChart";
import { NegativeChart } from "./charts/negativeChart";
import { StackedChart } from "./charts/stackedChart";
import Modal from 'components/general/Modal';
import { motion, AnimatePresence } from "framer-motion"
import ReactDOM, { createPortal } from 'react-dom';
import { DashboardContext } from 'layouts/dashboard';
import { IBudgets, ILabels } from "../index.page";
import Labels from "./Labels";
import Budgets from "./Budgets";

function AllCharts({ budgets }: { budgets: IBudgets[] }) {
    const [chartDate, setChartDate] = useState<"week" | "month" | "quart" | "year">("week")
    const [openNotify, setNotify] = useState<boolean>(false)
    const [openNotify2, setNotify2] = useState<boolean>(false)
    const [openNotify3, setNotify3] = useState<boolean>(false)
    const [openNotify4, setNotify4] = useState<boolean>(false)
    const [openNotify5, setNotify5] = useState<boolean>(false)
    const [openNotify6, setNotify6] = useState<boolean>(false)


    let BudgetData: number[] = []


    const labels: { name: string; color: string }[] = [
        {
            name: 'Full',
            color: '#E8FF04',
        },
        {
            name: 'Nam',
            color: '#2D5EFF',
        },
        {
            name: 'Tags',
            color: '#EF2727',
        },
    ]
    const label: ILabels[] = [
        {
            name: "Event",
            value: 53.12,
            percent: 30,
            transactions: 20,
        },
        {
            name: "Auto",
            value: 3.12,
            percent: 5,
            transactions: 26,
        },
        {
            name: "Type",
            value: 5412,
            percent: 17,
            transactions: 5,
        },
    ]

    return <>
        <div className="grid grid-cols-3 gap-10 py-4">
            <div className="py-2 max-h-[20rem] cursor-pointer bg-white dark:bg-darkSecond rounded-xl shadow" onClick={() => { setNotify(true) }}>
                <NegativeChart chartDate={chartDate} setChartDate={setChartDate} />
            </div>
            <div className="py-2 max-h-[20rem] cursor-pointer bg-white dark:bg-darkSecond rounded-xl shadow" onClick={() => { setNotify2(true) }}>
                <BasicCharts />
            </div>
            <div className="py-2 max-h-[20rem] cursor-pointer bg-white dark:bg-darkSecond rounded-xl shadow" onClick={() => { setNotify3(true) }}>
                <BasicCharts BudgetData={BudgetData} />
            </div>
            <div className="py-2 max-h-[20rem] cursor-pointer bg-white dark:bg-darkSecond rounded-xl shadow" onClick={() => { setNotify4(true) }}>
                <StackedChart labels={labels} />
            </div>
            <div className="py-2  max-h-[20rem] cursor-pointer bg-white dark:bg-darkSecond rounded-xl shadow" onClick={() => { setNotify6(true) }}>
                <div className="text-2xl font-semibold py-1 px-4">Labels</div>
                <Labels box={true} labels={label} />
            </div>
            <div className="py-2 max-h-[20rem]  cursor-pointer bg-white dark:bg-darkSecond rounded-xl shadow" onClick={() => { setNotify5(true) }}>
                <div className="text-2xl font-semibold py-1 px-4">Budgets</div>
                <Budgets box={true} budgets={budgets} setNotify2={setNotify5} />
            </div>
        </div>
        <Modal onDisable={setNotify} openNotify={openNotify} >
            <div className="w-[80%] flex justify-center mx-auto">
                <NegativeChart chartDate={chartDate} setChartDate={setChartDate} box={false} />
            </div>
        </Modal>
        <Modal onDisable={setNotify2} openNotify={openNotify2} >
            <div className="w-[80%] flex justify-center mx-auto">
                <BasicCharts box={false} />
            </div>
        </Modal>
        <Modal onDisable={setNotify3} openNotify={openNotify3} >
            <div className="w-[80%] flex justify-center mx-auto">
                <BasicCharts BudgetData={BudgetData} box={false} />
            </div>
        </Modal>
        <Modal onDisable={setNotify4} openNotify={openNotify4} >
            <div className="w-[80%] flex justify-center mx-auto">
                <StackedChart labels={labels} box={false} />
            </div>
        </Modal>
        {ReactDOM.createPortal(<AnimatePresence> {openNotify5 &&
            <motion.div initial={{ x: "100%" }} animate={{ x: 15 }} exit={{ x: "100%" }} transition={{ type: "tween", duration: .33 }} className="bg-light dark:bg-dark overflow-hidden z-[9999] fixed  h-[87.5%] pr-1 w-[85%] overflow-y-auto  overflow-x-hidden bottom-0 right-0  cursor-default ">
                <div className="w-[70%] mx-auto">
                    <button onClick={() => setNotify5(false)} className=" absolute right-full w-[4rem] top-0 translate-x-[175%] translate-y-[25%] tracking-wider font-bold transition-all hover:text-primary hover:transition-all text-xl flex items-center gap-2">
                        <span className="text-4xl">&#171;</span> Back
                    </button>
                    <div className="text-2xl font-semibold pt-4 pb-8">Budgets</div>
                    <Budgets box={false} budgets={budgets} setNotify2={setNotify5} />
                </div>
            </motion.div>}
        </AnimatePresence>, document.body)}

        <Modal onDisable={setNotify6} openNotify={openNotify6} >
            <div className="w-[70%]  mx-auto">
                <div className="text-2xl font-semibold pt-4 pb-8">Labels</div>
                <Labels box={false} labels={label} />
            </div>
        </Modal>
    </>
}

export default AllCharts