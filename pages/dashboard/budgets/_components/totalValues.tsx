import { IBudgetExerciseORM } from 'pages/api/budget/index.api'
import React from 'react'
import { SetComma } from 'utils'
import TotalDetails from './totalDetails'

function TotalValues({ total }: { total: IBudgetExerciseORM }) {


    return <div className="px-5 py-8 rounded-md bg-white dark:bg-darkSecond dark:border-[#aaaaaa] hover:dark:shadow-customDark hover:shadow-custom">
        <div className='grid grid-cols-[30%,21%,21%,21%,7%]'>
            <div className={`flex pr-16  border-r dark:border-[#aaaaaa] !my-0`}>
                <div className={`flex flex-col gap-12 lg:gap-4`}>
                    <div className='text-lg font-bold text-gray-500'>Total Budget</div>
                    <div className={`text-4xl font-semibold flex flex-col gap-2`}>
                        ${SetComma(total.totalBudget)}
                    </div>
                </div>
            </div>
            <div className={`flex pl-8 border-r dark:border-[#aaaaaa] !my-0`}>
                <div className={`flex flex-col gap-12 lg:gap-4 `}>
                    <div className='text-lg font-bold text-gray-500'>Total Used</div>
                    <div className={`text-2xl font-semibold flex flex-col gap-2`}>
                        ${SetComma(total.totalUsed)}
                    </div>
                </div>
            </div>
            <div className={`flex px-8 border-r dark:border-[#aaaaaa] !my-0`}>
                <div className={`flex flex-col gap-12 lg:gap-4 `}>
                    <div className='text-lg font-bold text-gray-500'>Total Pending</div>
                    <div className={`text-2xl font-semibold flex flex-col gap-2`}>
                        ${SetComma(0)}
                    </div>
                </div>
            </div>
            <div className={`pl-8 !border-r-0 gap-8 !flex-row text-2xl min-w-[18rem] items-center justify-center dark:border-[#aaaaaa] !my-0`}>
                <div className={`self-start flex flex-col gap-12 lg:gap-4`}>
                    <div className='text-lg font-bold text-gray-500'>Total Available</div>
                    <div className={`text-2xl font-semibold flex flex-col gap-2`}>
                        ${SetComma(total.totalAvailable)}
                    </div>
                </div>
            </div>
            <div className="flex items-center justify-center">
                {total.budgets.length > 0 &&<TotalDetails total={total} />}
            </div>
        </div>
    </div>
}

export default TotalValues