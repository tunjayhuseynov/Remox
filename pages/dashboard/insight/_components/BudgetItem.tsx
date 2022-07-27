import React, { useState } from 'react'
import AnimatedTabBar from 'components/animatedTabBar';
import { ProgressBarWidth } from '../../../utils'
import Modal from 'components/general/modal';
import BudgetDetail from './budgetDetail';
import { IBudgets, ISubbudgets } from '../../../pages/dashboard/insight/index.page'

function BudgetItem({ budget, box, id, setNotify2 }: { budget: IBudgets, box: boolean, id: number, setNotify2: React.Dispatch<React.SetStateAction<boolean>> }) {
    const [openNotify, setNotify] = useState<boolean>(false)



    return <>
      <Modal onDisable={setNotify} openNotify={openNotify} setNotify2={setNotify2} >
            <BudgetDetail budgets={budget} />
        </Modal>
        <div key={id} onClick={() => { !box && setNotify(!openNotify); !box && setNotify2(false) }} className={`w-full grid ${box ? 'px-5 grid-cols-[33%,33%,34%] py-2' : id === 4 && box ? 'hidden' : 'grid-cols-[15%,15%,10%,52.5%,7.5%] py-4'}    cursor-pointer `}>
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
            {!box && <><div className={`flex ${budget.amount2 && 'flex-col gap-4 pt-1'} items-center `}>
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
            </>}
        </div>
    </>
}

export default BudgetItem