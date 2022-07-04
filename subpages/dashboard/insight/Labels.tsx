import React from 'react'
import { ProgressBarWidth } from '../../../utils'

export interface ILabels {
    name: string,
    value: number,
    percent: number,
    transactions: number,
}[]

function Labels({box=false}:{box?:boolean}) {
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

    return <div className="w-full">
        <div className={`w-full text-greylish dark:text-white border-b grid ${box ? 'px-3 grid-cols-[33%,33%,34%]': 'grid-cols-[15%,15%,15%,55%]'} py-4 `}>
            <span>Name</span>
            <span>Amount</span>
            <span>% of Total</span>
            {!box && <span className="flex justify-end">Transactions</span> }
        </div>
        <div className="">
            {Labels.map((label, index) => {
                return <div key={index} className={`w-full grid  ${box ? 'px-3 grid-cols-[33%,33%,34%]': 'grid-cols-[15%,15%,10%,52.5%,7.5%]'}   py-4 `}>
                    <div className="font-semibold">{label.name}</div>
                    <span className="font-semibold">{label.value}</span>
                    <div className="font-semibold justify-start">{label.percent}%</div>
                    { !box &&<div className=" rounded-xl relative w-full h-[1rem] flex bg-greylish bg-opacity-40">
                        <div className=" h-full bg-primary rounded-l-xl" style={ProgressBarWidth(label.percent)}></div>
                    </div>}
                   { !box && <div className="font-semibold flex justify-end">{label.transactions}</div>}
                </div>
            })}
        </div>
    </div>
}

export default Labels