import { Fragment, useMemo, useState } from 'react'
import { motion, AnimatePresence } from "framer-motion"
import { IBudgetCoin, IBudgetExerciseORM, IBudgetORM } from 'pages/api/budget/index.api';
import CloseOutlinedIcon from '@mui/icons-material/CloseOutlined';
import { GetFiatPrice } from 'utils/const';
import { useAppSelector } from 'redux/hooks';
import { SelectCurrencies, SelectFiatPreference, SelectFiatSymbol } from 'redux/slices/account/remoxData';
import { AiFillRightCircle } from 'react-icons/ai';
import { fiatList } from 'components/general/PriceInputField';
import { NG } from 'utils/jsxstyle';
import { ProgressBarWidth } from 'utils';

function TotalExerciseDetails({ total }: { total: IBudgetExerciseORM }) {
    const [openNotify, setNotify] = useState(false)
    const fiatPreference = useAppSelector(SelectFiatPreference)
    const symbol = useAppSelector(SelectFiatSymbol)
    const coins = useAppSelector(SelectCurrencies)

    const TotalBudget = total.budgets.reduce((a, b) => {
        return {
            totalAmount: a.totalAmount + b.budgetCoins.totalAmount + (b.budgetCoins.second?.secondTotalAmount ?? 0),
            totalUsedAmount: a.totalUsedAmount + b.budgetCoins.totalUsedAmount + (b.budgetCoins.second?.secondTotalUsedAmount ?? 0),
            totalPending: a.totalPending + b.budgetCoins.totalPending + (b.budgetCoins.second?.secondTotalPending ?? 0),
        }
    }, { totalAmount: 0, totalUsedAmount: 0, totalPending: 0 })


    const reduceFn = (a: IBudgetORM[], c: IBudgetORM) => {
        const b = c.budgetCoins;
        if (a.find(x => x.budgetCoins.coin === b.coin)) {
            const index = a.findIndex(x => x.budgetCoins.coin === b.coin)
            a[index].budgetCoins = Object.assign({}, a[index].budgetCoins)
            a[index].budgetCoins.totalAmount += b.totalAmount
            a[index].budgetCoins.totalUsedAmount += b.totalUsedAmount
            a[index].budgetCoins.totalPending += b.totalPending

            if (b.second) {
                if (a[index].budgetCoins.second) {
                    a[index].budgetCoins.second!.secondTotalAmount += b.second.secondTotalAmount
                    a[index].budgetCoins.second!.secondTotalUsedAmount += b.second.secondTotalUsedAmount
                    a[index].budgetCoins.second!.secondTotalPending += b.second.secondTotalPending
                } else {
                    a[index].budgetCoins.second = b.second
                }
            }

            return a
        } else {
            return [...a, Object.assign({}, c)]
        }
    }

    return <>
        <div onClick={() => { setNotify(!openNotify) }}>
            <AiFillRightCircle size={34} className="cursor-pointer text-primary hover:text-secondary" />
        </div>
        <AnimatePresence>
            {openNotify &&
                <motion.div initial={{ x: "100%", opacity: 0.5 }} animate={{ x: 15, opacity: 1 }} exit={{ x: "100%", opacity: 0.5 }} transition={{ type: "spring", stiffness: 400, damping: 40 }} className=" z-[99] fixed shadow-custom grid grid-cols-[60%,40%] h-[100vh] w-[105%] overflow-y-auto overflow-x-hidden top-0 right-3 cursor-default ">
                    <div className="w-full h-full backdrop-blur-[2px]" onClick={() => { setNotify(!openNotify) }}></div>
                    <button onClick={() => setNotify(false)} className=" absolute left-full w-[2rem] top-0 translate-x-[-170%] translate-y-[25%] opacity-45">
                        <CloseOutlinedIcon className="t !w-8 !h-8 text-greylish hover:text-[#aaaaaa]" />
                    </button>
                    <div className="flex flex-col min-h-[325px] bg-white dark:bg-darkSecond sm:min-h-[auto] py-10 justify-center sm:justify-between sm:items-stretch items-center">
                        <div className="flex flex-col sm:flex-row justify-center sm:items-center text-2xl font-medium tracking-wide">Spending Details</div>
                        <div className="flex flex-col gap-8 py-8 border-b dark:border-b-greylish px-10 ">
                            <div className="flex justify-between px-2">
                                <span className="font-medium text-xl text-greylish">Total budget</span>
                                <div className="flex flex-col space-y-3">
                                    {total.budgets.reduce(reduceFn, []).map((budget, index) => {
                                        // const firstFiat = fiatList.find(f => f.name === coin.fiat)?.logo
                                        // const secondFiat = fiatList.find(f => f.name === coin.second?.fiat)?.logo
                                        let coin = budget.budgetCoins;
                                        return <Fragment key={index}>
                                            <div className="flex items-center gap-1">
                                                <img src={coins[coin.coin].logoURI} className="rounded-full object-cover w-[1.25rem] aspect-square" />
                                                <div>
                                                    <NG number={coin.totalAmount} fontSize={1.25} />
                                                </div>
                                            </div>
                                            {coin.second && <div className="flex items-center gap-1">
                                                <img src={coins[coin.second.secondCoin].logoURI} className="rounded-full object-cover w-[1.25rem] aspect-square" />
                                                <div>
                                                    <NG number={coin.second.secondTotalAmount} fontSize={1.25} />
                                                </div>
                                            </div>}
                                        </Fragment>
                                    })}
                                </div>
                            </div>
                            <div className="pt-3 pb-16 px-2 flex flex-col">
                                {
                                    total.budgets.map((b, i) => {

                                        const usedPercent = (b.budgetCoins.totalAmount + (b.budgetCoins.second?.secondTotalAmount ?? 0)) * 100 / TotalBudget.totalAmount
                                        const usedPercentStyle = ProgressBarWidth(usedPercent)

                                        // const pendingPercent = b.budgetCoins.totalPending * 100 / b.budgetCoins.totalAmount
                                        // const pendingPercentStyle = ProgressBarWidth(pendingPercent)

                                        return <div key={b.id} className="flex justify-between relative">
                                            <div className="font-medium text-xl text-greylish">{b.name}</div>
                                            <div className="w-[45%] grid grid-cols-[67.5%,2.5%,1fr]">
                                                <div className="rounded-xl h-3 relative bg-greylish bg-opacity-40 overflow-hidden self-center">
                                                    <div className='absolute left-0 top-0 w-full h-full flex'>
                                                        <div className="h-full bg-primary rounded-l-xl" style={usedPercentStyle}></div>
                                                        {/* <div className="stripe-1 object-cover h-full" style={pendingPercentStyle}></div> */}
                                                    </div>
                                                </div>
                                                <div></div>
                                                <div className='pl-1 font-medium text-xl self-center'>
                                                    {usedPercent.toFixed(2)}%
                                                </div>
                                            </div>
                                        </div>
                                    })
                                }
                            </div>
                        </div>
                        <div className="flex flex-col gap-8 py-8 border-b dark:border-b-greylish px-10">
                            <div className="flex justify-between px-2">
                                <span className="font-medium text-xl text-greylish">Total Used</span>
                                <div className="flex flex-col space-y-1">
                                    {total.budgets.reduce(reduceFn, []).map((budget, index) => {
                                        let coin = budget.budgetCoins
                                        // const firstFiat = fiatList.find(f => f.name === coin.fiat)?.logo
                                        // const secondFiat = fiatList.find(f => f.name === coin.second?.fiat)?.logo
                                        return <Fragment key={index}>
                                            <div className="flex items-center gap-1">
                                                <img src={coins[coin.coin].logoURI} className="rounded-full object-cover w-[1.25rem] aspect-square" />
                                                <div>
                                                    <NG number={coin.totalUsedAmount} fontSize={1.25} />
                                                </div>
                                            </div>
                                            {coin.second && <div className="flex items-center gap-1">
                                                <img src={coins[coin.second.secondCoin].logoURI} className="rounded-full object-cover w-[1.25rem] aspect-square" />
                                                <div>
                                                    <NG number={coin.second.secondTotalUsedAmount} fontSize={1.25} />
                                                </div>
                                            </div>}
                                        </Fragment>
                                    })}
                                </div>
                            </div>
                        </div>
                        <div className="flex flex-col gap-8 py-8 border-b dark:border-b-greylish px-10">
                            <div className="flex justify-between px-2">
                                <span className="font-medium text-xl text-greylish">Total Pending</span>
                                <div className="flex flex-col space-y-1">
                                    {total.budgets.reduce(reduceFn, []).map((budget, index) => {
                                        let coin = budget.budgetCoins;
                                        return <Fragment key={index}>
                                            <div className="flex items-center gap-1">
                                                <img src={coins[coin.coin].logoURI} className="rounded-full object-cover w-[1.25rem] aspect-square" />
                                                <div>
                                                    <NG number={coin.totalPending} fontSize={1.25} />
                                                </div>
                                            </div>
                                            {coin.second && <div className="flex items-center gap-1">
                                                <img src={coins[coin.second.secondCoin].logoURI} className="rounded-full object-cover w-[1.25rem] aspect-square" />
                                                <div>
                                                    <NG number={coin.second.secondTotalPending} fontSize={1.25} />
                                                </div>
                                            </div>}
                                        </Fragment>
                                    })}
                                </div>
                            </div>
                        </div>
                        <div className="flex flex-col gap-8 py-8 border-b dark:border-b-greylish px-10">
                            <div className="flex justify-between px-2">
                                <span className="font-medium text-xl text-greylish">Total Available</span>
                                <div className="flex flex-col space-y-1">
                                    {total.budgets.reduce(reduceFn, []).map((budget, index) => {
                                        let coin = budget.budgetCoins;
                                        return <Fragment key={index}>
                                            <div className="flex items-center gap-1">
                                                <img src={coins[coin.coin].logoURI} className="rounded-full object-cover w-[1.25rem] aspect-square" />

                                                <div>
                                                    <NG number={coin.totalAmount - coin.totalPending - coin.totalUsedAmount} fontSize={1.25} />
                                                </div>
                                            </div>
                                            {coin.second && <div className="flex items-center gap-1">
                                                <img src={coins[coin.second.secondCoin].logoURI} className="rounded-full object-cover w-[1.25rem] aspect-square" />
                                                <div>
                                                    <NG number={coin.second.secondTotalAmount - coin.second.secondTotalPending - coin.second.secondTotalUsedAmount} fontSize={1.25} />
                                                </div>
                                            </div>}
                                        </Fragment>
                                    })}
                                </div>
                            </div>
                        </div>
                    </div>
                </motion.div>}
        </AnimatePresence>
    </>
}

export default TotalExerciseDetails