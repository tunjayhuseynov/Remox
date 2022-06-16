import React, { useState } from 'react'
import AnimatedTabBar from 'components/animatedTabBar';
import { ProgressBarWidth } from '../../../utils'

export interface ILabels {
    name: string,
    value: number,
    percent: number,
    transactions: number,
}[]

export interface ISubbudgets {
    name: string,
    amount: {
        coinUrl: string,
        value: number,
    },
    amount2?: {
        coinUrl: string,
        value: number,
    },
    percent: number,
    transactions: number,
}[]


export interface IBudgets {
    name: string,
    totalSpend: number,
    amount: {
        coinUrl: string,
        value: number,
        percent: number,
        transactions: number,
    },
    amount2?: {
        coinUrl: string,
        value: number,
        percent: number,
        transactions: number,
    },

    subbudgets: ISubbudgets[],
    labels: ILabels[]
}[]

function BudgetsAndLabels() {
    const [text, setText] = useState('Budgets')


    const Budgets: IBudgets[] = [
        {
            name: 'Product',
            totalSpend: 10.000,
            amount: {
                coinUrl: 'celodollar',
                value: 544.730,
                percent: 68,
                transactions: 14,
            },
            amount2: {
                coinUrl: 'celoiconsquare',
                value: 544.730,
                percent: 68,
                transactions: 14,
            },
            subbudgets: [
                {
                    name: 'SubProduct',
                    amount: {
                        coinUrl: 'celodollar',
                        value: 30,
                    },
                    percent: 30,
                    transactions: 30,
                },
                {
                    name: 'subEvent',
                    amount: {
                        coinUrl: 'celodollar',
                        value: 30,
                    },
                    amount2: {
                        coinUrl: 'celodollar',
                        value: 750,
                    },
                    percent: 41,
                    transactions: 30,
                },
            ],
            labels: [
                {
                    name: 'budgetLabel',
                    value: 30,
                    percent: 30,
                    transactions: 30,
                },
                {
                    name: 'Target',
                    value: 30,
                    percent: 30,
                    transactions: 30,
                },
            ],

        },
        {
            name: 'Operation',
            totalSpend: 13.000,
            amount: {
                coinUrl: 'celodollar',
                value: 7557.30,
                percent: 82,
                transactions: 35,
            },
            subbudgets: [
                {
                    name: 'subOperation',
                    amount: {
                        coinUrl: 'celodollar',
                        value: 30,
                    },
                    percent: 30,
                    transactions: 30,
                },
                {
                    name: 'subEvent',
                    amount: {
                        coinUrl: 'celodollar',
                        value: 30,
                    },
                    amount2: {
                        coinUrl: 'celodollar',
                        value: 750,
                    },
                    percent: 41,
                    transactions: 30,
                },
            ],
            labels: [
                {
                    name: 'labelOperation',
                    value: 30,
                    percent: 30,
                    transactions: 30,
                },
                {
                    name: 'Target',
                    value: 30,
                    percent: 30,
                    transactions: 30,
                },
            ],

        }
    ]
    const Labels: ILabels[] = [
        {
            name: 'budgetLabel',
            value: 30,
            percent: 30,
            transactions: 30,
        },
        {
            name: 'Target',
            value: 30,
            percent: 30,
            transactions: 30,
        },
    ]

    const paymentdata = [
        {
            to: "",
            text: "Budgets"
        },
        {
            to: "",
            text: "Labels"
        }
    ]

    return <div className="w-full">
        <div className="flex   pt-2 pb-12  w-[20%] justify-between text-2xl">
            <AnimatedTabBar data={paymentdata} setText={setText} />
        </div>
        <div className="w-full">
            <div className="w-full text-greylish border-b grid grid-cols-[15%,15%,15%,55%] py-4 px-6">
                <span>Name</span>
                <span>Amount</span>
                <span>% of Total</span>
                <span className="flex justify-end">Transactions</span>
            </div>
            <div className="">
                {text === "Budgets" ? Budgets.map((budget, index) => {
                    return <div key={index} className="w-full grid grid-cols-[15%,15%,10%,52.5%,7.5%] py-4 px-6 cursor-pointer">
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
                            {budget.amount2 && <div className="font-semibold justify-start">{budget.amount2.percent}%</div> }
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
                                <div className="font-semibold flex justify-end">{budget.amount.transactions}</div>
                                 {budget.amount2 && <div className="font-semibold flex justify-end">{budget.amount2.transactions}</div>}
                                 </div>
                                
                            </div>
                            
                }) : Labels.map((label, index) => {
                    return <div key={index} className="w-full grid grid-cols-[15%,15%,10%,52.5%,7.5%] py-4 px-6">
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
                    </div>
        </div>
}

            export default BudgetsAndLabels