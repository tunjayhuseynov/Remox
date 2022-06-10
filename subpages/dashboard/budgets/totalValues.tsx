import React from 'react'
import { ITotals } from './budgetCard'
import TotalDetails from './totalDetails'

function TotalValues({ totals }: { totals: ITotals[] }) {


    return <div className="py-4  border-b dark:border-[#aaaaaa]">
        <div className='flex'>
            {totals.map((item, index) => {
                return <div key={index} className={`flex ${item.id === 0 ? 'pr-16 !min-w-[23rem] ' : item.id === 3 ? '!border-r-0 pl-20 gap-8 !flex-row text-2xl min-w-[23rem] items-center justify-center' : 'px-20'}  border-r dark:border-[#aaaaaa] !my-0`}>
                    <div className={` ${item.id === 3 && 'self-start'} flex flex-col gap-12 lg:gap-4 `}>
                        <div className='text-xl font-bold'>{item.name}</div>
                        <div className={` ${item.id === 0 ? 'text-4xl' : 'text-2xl'} font-semibold flex flex-col gap-2`}>
                            {item.value}
                        </div>
                    </div>
                    {item.id === 3 && <div className="flex items-center justify-center">
                        <TotalDetails totals={totals} />
                    </div>}
                </div>
            })}
        </div>
    </div>
}

export default TotalValues