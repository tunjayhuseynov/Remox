import { Skeleton } from '@mui/material'
import { IBudgetExerciseORM } from 'pages/api/budget/index.api'
import React, { useMemo } from 'react'
import { useAppSelector } from 'redux/hooks'
import { SelectCurrencies, SelectFiatPreference, SelectFiatSymbol, SelectPriceCalculationFn } from 'redux/slices/account/remoxData'
import { SetComma } from 'utils'
import { GetFiatPrice } from 'utils/const'
import { NG } from 'utils/jsxstyle'
import TotalExerciseDetails from './TotalExerciseDetails'

function TotalExerciseData({ total }: { total: IBudgetExerciseORM }) {
    const fiatPreference = useAppSelector(SelectFiatPreference)
    const symbol = useAppSelector(SelectFiatSymbol)
    const coins = useAppSelector(SelectCurrencies)

    const TotalBudget = total.budgets.reduce((a, b) => {

        const MainFiatPrice = GetFiatPrice(coins[b.token], fiatPreference)

        const fiatPrice = GetFiatPrice(coins[b.token], b.fiatMoney ?? fiatPreference)
        const totalAmount = b.budgetCoins.fiat ? b.budgetCoins.totalAmount / fiatPrice : b.budgetCoins.totalAmount
        const totalUsedAmount = b.budgetCoins.fiat ? b.budgetCoins.totalUsedAmount / fiatPrice : b.budgetCoins.totalUsedAmount
        const totalPendingAmount = b.budgetCoins.fiat ? b.budgetCoins.totalPending / fiatPrice : b.budgetCoins.totalPending

        const MainFiatPriceSecond = b.secondToken ? GetFiatPrice(coins[b.secondToken], fiatPreference) : 0

        const fiatPriceSecond = b.secondToken ? GetFiatPrice(coins[b.secondToken], b.secondFiatMoney ?? fiatPreference) : 0;
        const totalAmountSecond = b.budgetCoins.second?.fiat ? b.budgetCoins.second.secondTotalAmount / fiatPriceSecond : b.budgetCoins.second?.secondTotalAmount
       
        const totalUsedAmountSecond = b.budgetCoins.second?.fiat ? b.budgetCoins.second.secondTotalUsedAmount / fiatPriceSecond : b.budgetCoins.second?.secondTotalUsedAmount
        const totalPendingAmountSecond = b.budgetCoins.second?.fiat ? b.budgetCoins.second.secondTotalPending / fiatPriceSecond : b.budgetCoins.second?.secondTotalPending
        return {
            totalAmount: a.totalAmount + ((b.customPrice ?? MainFiatPrice) * totalAmount) + ((b.secondCustomPrice ?? MainFiatPriceSecond) * (totalAmountSecond ?? 0)),
            totalUsedAmount: a.totalUsedAmount + ((b.customPrice ?? MainFiatPrice) * totalUsedAmount) + ((b.secondCustomPrice ?? MainFiatPriceSecond) * (totalUsedAmountSecond ?? 0)),
            totalPending: a.totalPending + ((b.customPrice ?? MainFiatPrice) * totalPendingAmount) + ((b.secondCustomPrice ?? MainFiatPriceSecond) * (totalPendingAmountSecond ?? 0))
        }
    }, { totalAmount: 0, totalUsedAmount: 0, totalPending: 0 })


    return <div className="px-5 py-8 rounded-md bg-white dark:bg-darkSecond dark:border-[#aaaaaa] hover:dark:shadow-customDark hover:shadow-custom">
        <div className='grid grid-cols-[25%,20%,20%,20%,15%]'>
            {total.budgets.length > 0 && <>
                <div className={`flex pr-16  border-r dark:border-[#aaaaaa] !my-0`}>
                    <div className={`flex flex-col gap-12 lg:gap-4`}>
                        <div className='text-sm font-bold text-gray-500'>Total Budget</div>
                        <div className={`text-3xl font-semibold gap-2`}>
                            {symbol}<NG number={TotalBudget.totalAmount} fontSize={1.75} />
                        </div>
                    </div>
                </div>
                <div className={`flex pl-8 border-r dark:border-[#aaaaaa] !my-0`}>
                    <div className={`flex flex-col gap-12 lg:gap-4 justify-between`}>
                        <div className='text-sm font-bold text-gray-500'>Total Used</div>
                        <div className={`text-xl font-semibold gap-2`}>
                            {symbol}<NG number={TotalBudget.totalUsedAmount} fontSize={1.25} />
                        </div>
                    </div>
                </div>
                <div className={`flex px-8 border-r dark:border-[#aaaaaa] !my-0`}>
                    <div className={`flex flex-col gap-12 lg:gap-4 justify-between`}>
                        <div className='text-sm font-bold text-gray-500'>Total Pending</div>
                        <div className={`text-xl font-semibold gap-2`}>
                            {symbol}<NG number={TotalBudget.totalPending} fontSize={1.25} />
                        </div>
                    </div>
                </div>
                <div className={`pl-8 !border-r-0 gap-8 !flex-row text-2xl min-w-[18rem] items-center justify-center dark:border-[#aaaaaa] !my-0`}>
                    <div className={`justify-between flex flex-col h-full gap-12 lg:gap-4`}>
                        <div className='text-sm font-bold text-gray-500'>Total Available</div>
                        <div className={`text-xl font-semibold gap-2`}>
                            {symbol}<NG number={TotalBudget.totalAmount - TotalBudget.totalUsedAmount - TotalBudget.totalPending} fontSize={1.25} />
                        </div>
                    </div>
                </div>
            </>
            }
            {
                total.budgets.length === 0 && <>
                    <div className='grid grid-rows-2 h-full border-r dark:border-[#aaaaaa] px-8'>
                        <Skeleton animation={false} variant="text" sx={{ fontSize: '0.5rem' }} height="2rem" width={'50%'} />
                        <Skeleton animation={false} variant="text" sx={{ fontSize: '1rem' }} height="2.5rem" />
                    </div>
                    <div className={`px-8 border-r dark:border-[#aaaaaa] !my-0`}>
                        <div className='grid grid-rows-2 h-full'>
                            <Skeleton animation={false} variant="text" sx={{ fontSize: '0.5rem' }} height="2rem" width={'50%'} />
                            <Skeleton animation={false} variant="text" sx={{ fontSize: '1rem' }} height="2.5rem" />
                        </div>
                    </div>
                    <div className={`px-8 border-r dark:border-[#aaaaaa] !my-0`}>
                        <div className='grid grid-rows-2 h-full'>
                            <Skeleton animation={false} variant="text" sx={{ fontSize: '0.5rem' }} height="2rem" width={'50%'} />
                            <Skeleton animation={false} variant="text" sx={{ fontSize: '1rem' }} height="2.5rem" />
                        </div>
                    </div>
                    <div className={`px-8 !border-r-0 gap-8 text-2xl min-w-[18rem] items-center justify-center dark:border-[#aaaaaa] !my-0`}>
                        <div className='grid grid-rows-2 h-full'>
                            <Skeleton animation={false} variant="text" sx={{ fontSize: '0.5rem' }} height="2rem" width={'50%'} />
                            <Skeleton animation={false} variant="text" sx={{ fontSize: '1rem' }} height="2.5rem" />
                        </div>
                    </div>
                </>
            }
            <div className="flex items-center justify-end">
                {total.budgets.length > 0 && <TotalExerciseDetails total={total} />}
            </div>
        </div>
    </div>
}

export default TotalExerciseData