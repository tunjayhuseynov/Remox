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
    // const fiatPreference = useAppSelector(SelectFiatPreference)
    const symbol = useAppSelector(SelectFiatSymbol)
    const coins = useAppSelector(SelectCurrencies)

    const TotalBudget = total.budgets.reduce((a, b) => {
        return {
            totalAmount: a.totalAmount + b.budgetCoins.totalAmount,
            totalUsedAmount: a.totalUsedAmount + b.budgetCoins.totalUsedAmount,
            totalPending: a.totalPending + b.budgetCoins.totalPending,
        }
    }, { totalAmount: 0, totalUsedAmount: 0, totalPending: 0 })

    const TotalSecondBudget = total.budgets.reduce((a, b) => {
        return {
            totalAmount: a.totalAmount + (b.budgetCoins.second?.secondTotalAmount ?? 0),
            totalUsedAmount: a.totalUsedAmount + (b.budgetCoins.second?.secondTotalUsedAmount ?? 0),
            totalPending: a.totalPending + (b.budgetCoins.second?.secondTotalPending ?? 0),
        }
    }, { totalAmount: 0, totalUsedAmount: 0, totalPending: 0 })


    return <div className="px-5 py-8 rounded-md bg-white dark:bg-darkSecond dark:border-[#aaaaaa] hover:dark:shadow-customDark hover:shadow-custom">
        <div className={`grid ${total.coins.second ? "grid-cols-[25%,20%,20%,20%,15%]" : "grid-cols-[20%,20%,20%,20%,20%]"}`}>
            {total.budgets.length > 0 && <>
                <div className={`flex pr-16  border-r dark:border-[#aaaaaa] !my-0`}>
                    <div className={`flex flex-col gap-12 lg:gap-4`}>
                        <div className='text-sm font-bold text-gray-500'>Total Budget</div>
                        <div className="flex space-x-5">
                            <div className={`text-3xl font-semibold gap-2 flex items-center ${total.coins.second ? "border-r" : ""} pr-5`}>
                                <img src={coins[total.coins.coin].logoURI} alt="" className='rounded-full object-cover w-[1.5rem] h-[1.5rem]' />
                                <div>
                                    <NG number={TotalBudget.totalAmount} fontSize={1.75} />
                                </div>
                            </div>
                            {total.coins.second?.coin && <div className={`text-3xl font-semibold gap-2 flex items-center`}>
                                <img src={coins[total.coins.second.coin].logoURI} alt="" className='rounded-full object-cover w-[1.5rem] h-[1.5rem]' />
                                <div>
                                    <NG number={TotalSecondBudget.totalAmount} fontSize={1.75} />
                                </div>
                            </div>
                            }
                        </div>
                    </div>
                </div>
                <div className={`flex pl-8 border-r dark:border-[#aaaaaa] !my-0`}>
                    <div className={`flex flex-col gap-12 lg:gap-4 justify-between`}>
                        <div className='text-sm font-bold text-gray-500'>Total Used</div>
                        <div className="flex space-x-5">
                            <div className={`text-xl font-semibold gap-2 flex items-center ${total.coins.second ? "border-r" : ""} pr-5`}>
                                <img src={coins[total.coins.coin].logoURI} alt="" className='rounded-full object-cover w-[1.125rem] h-[1.125rem]' />
                                <div>
                                    <NG number={TotalBudget.totalUsedAmount} fontSize={1.25} />
                                </div>
                            </div>
                            {total.coins.second?.coin && <div className={`text-xl font-semibold gap-2 flex items-center`}>
                                <img src={coins[total.coins.second.coin].logoURI} alt="" className='rounded-full object-cover w-[1.125rem] h-[1.125rem]' />
                                <div>
                                    <NG number={TotalSecondBudget.totalUsedAmount} fontSize={1.25} />
                                </div>
                            </div>
                            }
                        </div>
                    </div>
                </div>
                <div className={`flex px-8 border-r dark:border-[#aaaaaa] !my-0`}>
                    <div className={`flex flex-col gap-12 lg:gap-4 justify-between`}>
                        <div className='text-sm font-bold text-gray-500'>Total Pending</div>
                        <div className="flex space-x-5">
                            <div className={`text-xl font-semibold gap-2 flex items-center ${total.coins.second ? "border-r" : ""} pr-5`}>
                                <img src={coins[total.coins.coin].logoURI} alt="" className='rounded-full object-cover w-[1.125rem] h-[1.125rem]' />
                                <div>
                                    <NG number={TotalBudget.totalPending} fontSize={1.25} />
                                </div>
                            </div>
                            {total.coins.second?.coin && <div className={`text-xl font-semibold gap-2 flex items-center`}>
                                <img src={coins[total.coins.second.coin].logoURI} alt="" className='rounded-full object-cover w-[1.125rem] h-[1.125rem]' />
                                <div>
                                    <NG number={TotalSecondBudget.totalPending} fontSize={1.25} />
                                </div>
                            </div>
                            }
                        </div>
                    </div>
                </div>
                <div className={`pl-8 !border-r-0 gap-8 !flex-row text-2xl min-w-[18rem] items-center justify-center dark:border-[#aaaaaa] !my-0`}>
                    <div className={`justify-between flex flex-col h-full gap-12 lg:gap-4`}>
                        <div className='text-sm font-bold text-gray-500'>Total Available</div>
                        <div className="flex space-x-5">
                            <div className={`text-xl font-semibold gap-2 flex items-center ${total.coins.second ? "border-r" : ""} pr-5`}>
                                <img src={coins[total.coins.coin].logoURI} alt="" className='rounded-full object-cover w-[1.125rem] h-[1.125rem]' />
                                <div>
                                    <NG number={TotalBudget.totalAmount - TotalBudget.totalUsedAmount - TotalBudget.totalPending} fontSize={1.25} />
                                </div>
                            </div>
                            {total.coins.second?.coin && <div className={`text-xl font-semibold gap-2 flex items-center`}>
                                <img src={coins[total.coins.second.coin].logoURI} alt="" className='rounded-full object-cover w-[1.125rem] h-[1.125rem]' />
                                <div>
                                    <NG number={TotalSecondBudget.totalAmount - TotalSecondBudget.totalUsedAmount - TotalSecondBudget.totalPending} fontSize={1.25} />
                                </div>
                            </div>
                            }
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