import React from 'react'
import { BudgetItem } from './allBudgets'
import {progressBarWidth} from '../../../utils'

function Labels({ item }: { item: {id: number,color: string,name: string,coinUrl:string,used: string,pending: string,progressbar: number,}}) {
    return <>
        <div className=" border-b py-4 w-full flex justify-between items-center">
            <div className="text-greylish flex items-center gap-1 w-[15%]"><span className={` ${item.color}  p-2 bg-primary rounded-full`}></span>{item.name}</div>
            <div className="text-greylish flex items-center gap-1 text-sm"><img src={`/icons/currencies/${item.coinUrl}.svg`} className="w-5 h-5" alt="" /><span className="text-red-600">{item.used}</span>/  <img src={`/icons/currencies/${item.coinUrl}.svg`} className="w-5 h-5" alt="" /><span className="text-black">{item.pending}</span></div>
            <div className=" rounded-xl relative  h-[1rem] flex w-[20%]   bg-greylish bg-opacity-40">
                <div className={` h-full bg-primary rounded-l-xl`} style={progressBarWidth(item.progressbar)}></div>
            </div>
        </div>
    </>
}

export default Labels