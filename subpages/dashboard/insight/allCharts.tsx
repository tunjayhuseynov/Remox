import { useEffect, useState } from "react";
import Paydropdown from "subpages/pay/paydropdown";
import { BasicCharts } from "./charts/basicChart";
import { NegativeChart } from "./charts/negativeChart";
import { StackedChart } from "./charts/stackedChart";
import Budgets from "subpages/dashboard/insight/Budgets";
import Labels from "subpages/dashboard/insight/Labels";
import Modal from 'components/general/modal'

function AllCharts() {
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
            <div className="py-2 max-h-[20rem]  cursor-pointer bg-white dark:bg-darkSecond rounded-xl shadow" onClick={() => { setNotify5(true) }}>
                <Budgets box={true} />
            </div>
            <div className="py-2  max-h-[20rem] cursor-pointer bg-white dark:bg-darkSecond rounded-xl shadow" onClick={() => { setNotify6(true) }}>
                <Labels box={true} />
            </div>
        </div>
        <Modal onDisable={setNotify} openNotify={openNotify} >
            <div className="w-[80%] flex justify-center mx-auto">
                <NegativeChart chartDate={chartDate} setChartDate={setChartDate} box={false}  />
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
        <Modal onDisable={setNotify5} openNotify={openNotify5} >
            <div className="w-[70%]  mx-auto">
                <div className="text-2xl font-semibold pt-4 pb-8">Budgets</div>
                <Budgets box={true} />
            </div>
        </Modal>
        <Modal onDisable={setNotify6} openNotify={openNotify6} >
            <div className="w-[70%]  mx-auto">
                <div className="text-2xl font-semibold pt-4 pb-8">Labels</div>
                <Labels box={true} />
            </div>
        </Modal>
    </>
}

export default AllCharts