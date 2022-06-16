import { useEffect, useState } from "react";
import Paydropdown from "subpages/pay/paydropdown";
import { BasicCharts } from "./charts/basicChart";
import { NegativeChart } from "./charts/negativeChart";
import {StackedChart} from "./charts/stackedChart";

function AllCharts() {
    const [value, setValue] = useState('This Year')
    const [value2, setValue2] = useState('Filters')
    const [chartDate, setChartDate] = useState<"week" | "month" | "quart" | "year">("week")
    const [isOpen, setOpen] = useState(false)
    const [stream, setStream] = useState(false)

    let BudgetData = []
    if(stream){ 
        BudgetData.push(76, 85, 101, 98, 87, 105, 91, 114, 94)
    
    }


    const paymentname = ["This Year", "2021", "2020"]
    const paymentname2 = ["Filters", "Labels"]

    const labels = [
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
        <div className="py-2">
            <div className="bg-white dark:bg-darkSecond rounded-lg shadow">
                <div className="w-full pl-12 pr-4 py-4 pb-6 flex justify-between items-center">
                    <div className=" font-medium text-lg text-greylish dark:text-white tracking-wide">Cash In/Out</div>
                    <div className="flex gap-3 ">
                        <span className={` ${chartDate === "week" && '!text-primary text-opacity-100'} hover:!text-primary cursor-pointer text-greylish dark:text-white text-opacity-40 tracking-wide text-xl`} onClick={() => setChartDate("week")}>1W</span>
                        <span className={` ${chartDate === "month" && '!text-primary text-opacity-100'}  hover:!text-primary cursor-pointer text-greylish dark:text-white  text-opacity-40 tracking-wide text-xl`} onClick={() => setChartDate("month")}>1M</span>
                        <span className={` ${chartDate === "quart" && '!text-primary text-opacity-100'} text-greylish hover:!text-primary cursor-pointer dark:text-white text-opacity-40 tracking-wide text-xl`} onClick={() => setChartDate("quart")}>3M</span>
                        <span className={` ${chartDate === "year" && '!text-primary text-opacity-100'}  hover:!text-primary cursor-pointer text-greylish dark:text-white text-opacity-40 tracking-wide text-xl`} onClick={() => setChartDate("year")}>1Y</span>
                    </div>
                </div>

                <div className="w-full h-full flex items-center justify-center"><NegativeChart /></div>
            </div>
        </div>
        <div className="py-2">
            <div className="w-full flex justify-start items-center pb-6 ">
                <div className="flex gap-4">
                    <div className=""><Paydropdown className={'text-sm py-1 w-[7rem] !px-4 rounded-2xl border-box'} className2={'text-sm '} paymentname={paymentname} value={value} setValue={setValue} /></div>

                    <div className=""><Paydropdown className={'text-sm py-1 w-[7rem] !px-6  rounded-2xl border-box'} className2={'text-sm '} paymentname={paymentname2} value={value2} setValue={setValue2} /></div>
                </div>

            </div>
            <div className="bg-white dark:bg-darkSecond rounded-lg shadow">
                {value2 === 'Filters' ? <div className="w-full pl-12 pr-4 py-3 flex justify-between">
                    <div className={`flex ${stream && 'gap-12'}`}>
                        {stream && <div className="flex items-center gap-2">
                            <div className="w-5 h-5 bg-greylish bg-opacity-40"></div>
                            <div className="font-semibold">Budgeted</div>
                        </div>}
                        <div className="flex items-center gap-2">
                            <div className="w-5 h-5 bg-primary"></div>
                            <div className="font-semibold">Actual</div>
                        </div>
                    </div>
                    <div className="font-semibold flex items-center gap-5">
                        <span>Compare to Budgeted</span>
                        <label htmlFor="toggleB" className="flex items-center cursor-pointer">
                            <div className="relative">
                                <input type="checkbox" id="toggleB" className="sr-only peer" onClick={() => { setStream(!stream) }} />
                                <div className="block bg-gray-400 peer-checked:bg-primary w-12 h-7 rounded-full"></div>
                                <div className="peer-checked:transform peer-checked:translate-x-full  absolute left-1 top-1 bg-white w-5 h-5 rounded-full transition"></div>
                            </div>
                        </label>
                    </div>

                </div>
                    : <div className="w-full px-12 pt-5 flex ">
                        <div className={`flex gap-12`}>
                            {labels.map((item, i) => {
                                return <div key={i} className="flex items-center gap-2">
                                    <div className={`w-3 h-3 rounded-full`} style={{
                                        background: `${item.color}`,
                                    }}></div>
                                    <div className="font-semibold">{item.name}</div>
                                </div>
                            })}

                        </div>
                    </div>}
                <div className="w-full h-full flex items-center justify-center">{value2 === 'Filters' ? <BasicCharts BudgetData={BudgetData} /> : <StackedChart/>}</div>
            </div>
        </div>
    </>
}

export default AllCharts