import { IBudgetExerciseORM } from 'pages/api/budget/index.api'
import React, { useMemo } from 'react'
import { useAppSelector } from 'redux/hooks'
import { SelectCurrencies, SelectFiatPreference, SelectFiatSymbol, SelectPriceCalculationFn } from 'redux/slices/account/remoxData'
import { SetComma } from 'utils'
import { GetFiatPrice } from 'utils/const'
import TotalExerciseDetails from './TotalExerciseDetails'

function TotalExerciseData({ total }: { total: IBudgetExerciseORM }) {
    const fiatPreference = useAppSelector(SelectFiatPreference)
    const symbol = useAppSelector(SelectFiatSymbol)
    const coins = useAppSelector(SelectCurrencies)

    const TotalBudget = useMemo(() => {
        return total.budgets.reduce((a, b) => {
            const fiatPrice = GetFiatPrice(coins[b.token], fiatPreference)
            return {
                totalAmount: a.totalAmount + (fiatPrice * b.budgetCoins.totalAmount),
                totalUsedAmount: a.totalUsedAmount + (fiatPrice * b.budgetCoins.totalUsedAmount),
                totalPending: a.totalPending + (fiatPrice * b.budgetCoins.totalPending)
            }
        }, { totalAmount: 0, totalUsedAmount: 0, totalPending: 0 })
    }, [total.budgetCoins])

    return <div className="px-5 py-8 rounded-md bg-white dark:bg-darkSecond dark:border-[#aaaaaa] hover:dark:shadow-customDark hover:shadow-custom">
        <div className='grid grid-cols-[25%,20%,20%,20%,15%]'>
            <div className={`flex pr-16  border-r dark:border-[#aaaaaa] !my-0`}>
                <div className={`flex flex-col gap-12 lg:gap-4`}>
                    <div className='text-lg font-bold text-gray-500'>Total Budget</div>
                    <div className={`text-4xl font-semibold flex flex-col gap-2`}>
                        {symbol}{SetComma(TotalBudget.totalAmount)}
                    </div>
                </div>
            </div>
            <div className={`flex pl-8 border-r dark:border-[#aaaaaa] !my-0`}>
                <div className={`flex flex-col gap-12 lg:gap-4 `}>
                    <div className='text-lg font-bold text-gray-500'>Total Used</div>
                    <div className={`text-2xl font-semibold flex flex-col gap-2`}>
                        {symbol}{SetComma(TotalBudget.totalUsedAmount)}
                    </div>
                </div>
            </div>
            <div className={`flex px-8 border-r dark:border-[#aaaaaa] !my-0`}>
                <div className={`flex flex-col gap-12 lg:gap-4 `}>
                    <div className='text-lg font-bold text-gray-500'>Total Pending</div>
                    <div className={`text-2xl font-semibold flex flex-col gap-2`}>
                        {symbol}{SetComma(TotalBudget.totalPending)}
                    </div>
                </div>
            </div>
            <div className={`pl-8 !border-r-0 gap-8 !flex-row text-2xl min-w-[18rem] items-center justify-center dark:border-[#aaaaaa] !my-0`}>
                <div className={`self-start flex flex-col gap-12 lg:gap-4`}>
                    <div className='text-lg font-bold text-gray-500'>Total Available</div>
                    <div className={`text-2xl font-semibold flex flex-col gap-2`}>
                        {symbol}{SetComma(TotalBudget.totalAmount - TotalBudget.totalUsedAmount - TotalBudget.totalPending)}
                    </div>
                </div>
            </div>
            <div className="flex items-center justify-end pr-10">
                {total.budgets.length > 0 && <TotalExerciseDetails total={total} />}
            </div>
        </div>
    </div>
}

export default TotalExerciseData