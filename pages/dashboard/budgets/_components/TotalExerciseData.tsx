import { Skeleton } from '@mui/material'
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
                totalAmount: a.totalAmount + ((b.customPrice ?? fiatPrice) * b.budgetCoins.totalAmount) + ((b.secondCustomPrice ?? fiatPrice) * (b.budgetCoins.second?.secondTotalAmount ?? 0)),
                totalUsedAmount: a.totalUsedAmount + ((b.customPrice ?? fiatPrice) * b.budgetCoins.totalUsedAmount) + ((b.secondCustomPrice ?? fiatPrice) * (b.budgetCoins.second?.secondTotalUsedAmount ?? 0)),
                totalPending: a.totalPending + ((b.customPrice ?? fiatPrice) * b.budgetCoins.totalPending) + ((b.secondCustomPrice ?? fiatPrice) * (b.budgetCoins.second?.secondTotalPending ?? 0))
            }
        }, { totalAmount: 0, totalUsedAmount: 0, totalPending: 0 })
    }, [total.budgetCoins])

    return <div className="px-5 py-8 rounded-md bg-white dark:bg-darkSecond dark:border-[#aaaaaa] hover:dark:shadow-customDark hover:shadow-custom">
        <div className='grid grid-cols-[25%,20%,20%,20%,15%]'>
            {total.budgets.length > 0 && <>
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
            </>
            }
            {
                total.budgets.length === 0 && <>
                    <div className='grid grid-rows-2 h-full border-r dark:border-[#aaaaaa] px-8'>
                        <Skeleton variant="text" sx={{ fontSize: '0.5rem' }} height="2rem" width={'50%'} />
                        <Skeleton variant="text" sx={{ fontSize: '1rem' }} height="2.5rem" />
                    </div>
                    <div className={`px-8 border-r dark:border-[#aaaaaa] !my-0`}>
                        <div className='grid grid-rows-2 h-full'>
                            <Skeleton variant="text" sx={{ fontSize: '0.5rem' }} height="2rem" width={'50%'} />
                            <Skeleton variant="text" sx={{ fontSize: '1rem' }} height="2.5rem" />
                        </div>
                    </div>
                    <div className={`px-8 border-r dark:border-[#aaaaaa] !my-0`}>
                        <div className='grid grid-rows-2 h-full'>
                            <Skeleton variant="text" sx={{ fontSize: '0.5rem' }} height="2rem" width={'50%'} />
                            <Skeleton variant="text" sx={{ fontSize: '1rem' }} height="2.5rem" />
                        </div>
                    </div>
                    <div className={`px-8 !border-r-0 gap-8 text-2xl min-w-[18rem] items-center justify-center dark:border-[#aaaaaa] !my-0`}>
                        <div className='grid grid-rows-2 h-full'>
                            <Skeleton variant="text" sx={{ fontSize: '0.5rem' }} height="2rem" width={'50%'} />
                            <Skeleton variant="text" sx={{ fontSize: '1rem' }} height="2.5rem" />
                        </div>
                    </div>
                </>
            }
            <div className="flex items-center justify-end pr-10">
                {total.budgets.length > 0 && <TotalExerciseDetails total={total} />}
            </div>
        </div>
    </div>
}

export default TotalExerciseData