import React,{useState} from 'react'
import { IBudgets } from '../../../pages/dashboard/insight'
import AnimatedTabBar from 'components/animatedTabBar';
import { ProgressBarWidth } from '../../../utils'

function BudgetDetail({ budgets }: { budgets: IBudgets }) {
    const [text, setText] = useState('Subbudgets')
    const paymentdata = [
        {
            to: "",
            text: "Subbudgets"
        },
        {
            to: "",
            text: "Labels"
        }
    ]


    return <div className="w-[70%]  mx-auto">
        <div className="pt-4 pb-8">
            <div className="text-2xl font-semibold pb-2">{budgets.name}</div>
            <div className="text-greylish">{budgets.startTime} - {budgets.endTime}</div>
        </div>
        <div className="flex justify-between w-full">
            <div className="flex gap-24">
                <div className="flex flex-col gap-2">
                    <div className="text-greylish text-base">Total Spend</div>
                    <div className="text-bold text-3xl">{budgets.totalSpend}</div>
                </div>
                <div className="flex flex-col gap-2">
                    <div className="text-greylish text-base">Transactions</div>
                    <div className="text-bold text-3xl">{budgets.transaction}</div>
                </div>
            </div>
            <div className="flex items-center justify-center gap-5">
                <div className=" px-3 py-1 border rounded-2xl text-greylish cursor-pointer">View All Transactions</div>
                <div className=" px-3 py-1 border rounded-2xl text-greylish cursor-pointer">View Budget</div>
            </div>
        </div>
        <div className="flex justify-start gap-5 pt-1">
            <div className="flex items-center justify-center text-greylish"> <img src={`/icons/currencies/${budgets.amount.coinUrl}.svg`} className="w-5 h-5 mr-2" alt="" />{budgets.amount.value} </div>
            {budgets.amount2 && <div className="flex items-center justify-center text-greylish"> <img src={`/icons/currencies/${budgets.amount2.coinUrl}.svg`} className="w-5 h-5 mr-2" alt="" />{budgets.amount2.value} </div>}
        </div>
        <div className="flex  py-8 w-full items-center gap-16">
            <AnimatedTabBar data={paymentdata} setText={setText} className={'!text-lg'} />
        </div>
        {text === "Subbudgets" ?  <div className="w-full">
            <div className={` text-greylish dark:text-white border-b grid  px-0 grid-cols-[15%,15%,15%,55%] w-full py-4  `}>
                <span>Name</span>
                <span>Amount</span>
                <span>% of Total</span>
              <span className="flex justify-end">Transactions</span>
            </div>
            <div className="">
                { budgets.subbudgets.map((budget, index) => {
                    return <div key={index}  className={`w-full grid grid-cols-[15%,15%,10%,52.5%,7.5%] py-4 cursor-pointer `}>
                        <div className="font-semibold">{budget.name}</div>
                        <div className={`flex ${budget.amount2 && 'flex-col gap-2'}`}>
                            <div className="flex gap-1 items-center justify-start">
                                <img src={`/icons/currencies/${budget.amount.coinUrl}.svg`} className="w-5 h-5 rounded-full" alt="" />
                                <span className="font-semibold">{budget.amount.value}</span>
                            </div>
                            {budget.amount2 && <div className="flex gap-1 items-center justify-start">
                                <img src={`/icons/currencies/${budget.amount2.coinUrl}.svg`} className="w-5 h-5 rounded-full" alt="" />
                                <span className="font-semibold">{budget.amount2.value}</span>
                            </div>}
                        </div>
                        <div className={`flex ${budget.amount2 && 'flex-col gap-2'}`}>
                            <div className="font-semibold justify-start">{budget.amount.percent}%</div>
                            {budget.amount2 && <div className="font-semibold justify-start">{budget.amount2.percent}%</div>}
                        </div>
                       <div className={`flex ${budget.amount2 && 'flex-col gap-4 pt-1'} items-center `}>
                            <div className=" rounded-xl relative w-full h-[1rem] flex    bg-greylish bg-opacity-40">
                                <div className=" h-full bg-primary rounded-l-xl" style={ProgressBarWidth(budget.amount.percent)}></div>
                            </div>
                            {budget.amount2 && <div className=" rounded-xl relative w-full h-[1rem] flex     bg-greylish bg-opacity-40">
                                <div className=" h-full bg-primary rounded-l-xl" style={ProgressBarWidth(budget.amount2.percent)}></div>
                            </div>}
                        </div>
                            <div className={`flex ${budget.amount2 && 'flex-col gap-2 '} justify-end`}>
                                <div className="font-semibold flex justify-end">{budget.amount.transaction}</div>
                                {budget.amount2 && <div className="font-semibold flex justify-end">{budget.amount2.transaction}</div>}
                            </div>
                        
                    </div>
                })}
            </div>
        </div> : <div className="w-full">
        <div className={` text-greylish dark:text-white border-b grid px-0 grid-cols-[15%,15%,15%,55%] w-full py-4  `}>
            <span>Name</span>
            <span>Amount</span>
            <span>% of Total</span>
            <span className="flex justify-end">Transactions</span> 
        </div>
        <div className="">
            {budgets.labels.map((label, index) => {
                return <div key={index} className={`w-full grid  grid-cols-[15%,15%,10%,52.5%,7.5%] py-4   `}>
                    <div className="font-semibold">{label.name}</div>
                    <span className="font-semibold">{label.value}</span>
                    <div className="font-semibold justify-start">{label.percent}%</div>
                  <div className=" rounded-xl relative w-full h-[1rem] flex bg-greylish bg-opacity-40">
                        <div className=" h-full bg-primary rounded-l-xl" style={ProgressBarWidth(label.percent)}></div>
                    </div>
                   <div className="font-semibold flex justify-end">{label.transactions}</div>
                </div>
            })}
        </div>
    </div>}
    </div>
}

export default BudgetDetail