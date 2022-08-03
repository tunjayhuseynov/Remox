import React from 'react'
import { ProgressBarWidth } from 'utils'
import { ILabels } from '../index.page'
// export interface ILabels {
//     name: string,
//     value: number,
//     percent: number,
//     transactions: number,
// }[]

function Labels({ box = false, labels }: { box?: boolean, labels?: ILabels[] }) {

    return <div className="w-full">
        <div className={` text-greylish dark:text-white border-b grid ${box ? 'px-2 grid-cols-[33%,33%,34%] w-[95%] mx-auto py-2' : ' px-0 grid-cols-[15%,15%,15%,55%] w-full py-4 '} `}>
            <span>Name</span>
            <span>Amount</span>
            <span>% of Total</span>
            {!box && <span className="flex justify-end">Transactions</span>}
        </div>
        <div className="">
            {labels && labels.map((label, index) => {
                return <div key={index} className={`w-full grid  ${box ? 'px-5 grid-cols-[33%,33%,34%] py-2' : index === 5 && box ? 'hidden' : 'grid-cols-[15%,15%,10%,52.5%,7.5%] py-4'}   `}>
                    <div className="font-semibold">{label.name}</div>
                    <span className="font-semibold">{label.value}</span>
                    <div className="font-semibold justify-start">{label.percent}%</div>
                    {!box && <div className=" rounded-xl relative w-full h-[1rem] flex bg-greylish bg-opacity-40">
                        <div className=" h-full bg-primary rounded-l-xl" style={ProgressBarWidth(label.percent)}></div>
                    </div>}
                    {!box && <div className="font-semibold flex justify-end">{label.transactions}</div>}
                </div>
            })}
        </div>
    </div>
}

export default Labels