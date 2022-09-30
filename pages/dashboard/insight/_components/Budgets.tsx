import React, { useState } from 'react'
import { IBudgets } from '../index.page';


import BudgetItem from './BudgetItem';

function Budgets({ box = false, budgets,setNotify2 }: { box?: boolean, budgets: IBudgets[],setNotify2: React.Dispatch<React.SetStateAction<boolean>>}) {




    return <>

        <div className="w-full">
            <div className={`w-full text-greylish dark:text-white border-b grid ${box ? 'px-2 grid-cols-[33%,33%,34%] w-[95%] mx-auto py-2' : ' px-0 grid-cols-[15%,15%,15%,55%] w-full py-4 '} `}>
                <span>Name</span>
                <span>Amount</span>
                <span>% of Total</span>
                {!box && <span className="flex justify-end">Transactions</span>}
            </div>
            <div className="">
                {budgets && budgets.map((budget, index) => {
                    return <BudgetItem key={index} id={index} box={box} budget={budget} setNotify2={setNotify2} />
                })}
            </div>
        </div>
    </>
}

export default Budgets