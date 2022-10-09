import { Fragment, useMemo, useState } from 'react'
import { motion, AnimatePresence } from "framer-motion"
import { IBudgetExerciseORM } from 'pages/api/budget/index.api';
import CloseOutlinedIcon from '@mui/icons-material/CloseOutlined';
import { GetFiatPrice } from 'utils/const';
import { useAppSelector } from 'redux/hooks';
import { SelectCurrencies, SelectFiatPreference, SelectFiatSymbol } from 'redux/slices/account/remoxData';
import { AiFillRightCircle } from 'react-icons/ai';
import { fiatList } from 'components/general/PriceInputField';
import { NG } from 'utils/jsxstyle';

function TotalExerciseDetails({ total }: { total: IBudgetExerciseORM }) {
    const [openNotify, setNotify] = useState(false)
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



    return <>
        <div onClick={() => { setNotify(!openNotify) }}>
            <AiFillRightCircle size={34} className="cursor-pointer text-primary hover:text-secondary" />
        </div>
        <AnimatePresence>
            {openNotify &&
                <motion.div initial={{ x: "100%", opacity: 0.5 }} animate={{ x: 15, opacity: 1 }} exit={{ x: "100%", opacity: 0.5 }} transition={{ type: "spring", stiffness: 400, damping: 40 }} className=" z-[99] fixed shadow-custom grid grid-cols-[70%,30%] h-[100vh] w-[105%]  pr-1 overflow-y-auto overflow-x-hidden top-0 right-4 cursor-default ">
                    <div className="w-full h-full backdrop-blur-[2px]" onClick={() => { setNotify(!openNotify) }}></div>
                    <button onClick={() => setNotify(false)} className=" absolute left-full w-[2rem] top-0 translate-x-[-170%] translate-y-[25%] opacity-45">
                        <CloseOutlinedIcon className="t !w-8 !h-8 text-greylish hover:text-[#aaaaaa]" />
                    </button>
                    <div className="flex flex-col min-h-[325px] bg-white dark:bg-darkSecond sm:min-h-[auto] py-10 justify-center sm:justify-between sm:items-stretch items-center">
                        <div className="flex flex-col sm:flex-row justify-center sm:items-center text-2xl font-medium tracking-wide">Spending Details</div>
                        <div className="flex flex-col gap-8 py-8 border-b px-10 ">
                            <div className="flex justify-between px-2">
                                <span className="font-medium text-lg text-gray-400">Total budget</span>
                                <span className="text-greylish dark:text-white text-lg">{symbol}<NG number={TotalBudget.totalAmount} /> </span></div>
                            <div className="flex justify-between px-2">
                                <span className="text-lg font-medium text-gray-400">Token Breakdown</span>
                                <div className="flex flex-col items-end gap-2">
                                    {total.budgetCoins.map((coin, index) => {
                                        const firstFiat = fiatList.find(f => f.name === coin.fiat)?.logo
                                        const secondFiat = fiatList.find(f => f.name === coin.second?.fiat)?.logo

                                        return <Fragment key={index}>
                                            <div className="flex items-center gap-1">
                                                <span className="text-lg font-medium"><NG number={coin.totalAmount} /></span>
                                                <img src={firstFiat ?? coins[coin.coin].logoURI} className="w-5 h-5 rounded-full" alt="" />
                                                <span className="text-lg font-medium">{coin.fiat ?? coin.coin}</span>
                                            </div>
                                            {coin.second && <div className="flex items-center gap-1">
                                                <span className="text-lg font-medium"><NG number={coin.second.secondTotalAmount} /></span>
                                                <img src={secondFiat ?? coins[coin.second.secondCoin].logoURI} className="w-5 h-5 rounded-full" alt="" />
                                                <span className="text-lg font-medium">{coin.second.fiat ?? coin.second.secondCoin}</span>
                                            </div>}
                                        </Fragment>
                                    })}
                                </div>
                            </div>
                        </div>
                        <div className="flex flex-col gap-8 py-8 border-b px-10">
                            <div className="flex justify-between px-2">
                                <span className="font-medium text-lg text-gray-400">Total Used</span>
                                <span className="text-greylish dark:text-white text-lg">{symbol}<NG number={TotalBudget.totalUsedAmount} /></span></div>
                            <div className="flex justify-between px-2">
                                <span className="text-lg font-medium text-gray-400">Token Breakdown</span>
                                <div className="flex flex-col  items-end gap-2">
                                    {total.budgetCoins.map((coin, index) => {
                                        const firstFiat = fiatList.find(f => f.name === coin.fiat)?.logo
                                        const secondFiat = fiatList.find(f => f.name === coin.second?.fiat)?.logo
                                        return <Fragment key={index}>
                                            <div className="flex items-center gap-1">
                                                <span className="text-lg font-medium"><NG number={coin.totalUsedAmount} /></span>
                                                <img src={firstFiat ?? coins[coin.coin].logoURI} className="w-5 h-5 rounded-full" alt="" />
                                                <span className="text-lg font-medium">{coin.fiat ?? coin.coin}</span>
                                            </div>
                                            {coin.second && <div className="flex items-center gap-1">
                                                <span className="text-lg font-medium"><NG number={coin.second.secondTotalUsedAmount} /></span>
                                                <img src={secondFiat ?? coins[coin.coin].logoURI} className="w-5 h-5 rounded-full" alt="" />
                                                <span className="text-lg font-medium">{coin.second.fiat ?? coin.coin}</span>
                                            </div>}
                                        </Fragment>
                                    })}
                                </div>
                            </div>
                        </div>
                        <div className="flex flex-col gap-8 py-8 border-b px-10">
                            <div className="flex justify-between px-2">
                                <span className="font-medium text-lg text-gray-400">Total Pending</span>
                                <span className="text-greylish dark:text-white text-lg">{symbol}<NG number={TotalBudget.totalPending} /></span></div>
                            <div className="flex justify-between px-2">
                                <span className="text-lg font-medium text-gray-400">Token Breakdown</span>
                                <div className="flex flex-col items-end gap-2">
                                    {total.budgetCoins.map((coin, index) => {
                                        const firstFiat = fiatList.find(f => f.name === coin.fiat)?.logo
                                        const secondFiat = fiatList.find(f => f.name === coin.second?.fiat)?.logo
                                        return <Fragment key={index}>
                                            <div className="flex items-center gap-1">
                                                <span className="text-lg font-medium"><NG number={coin.totalPending} /></span>
                                                <img src={firstFiat ?? coins[coin.coin].logoURI} className="w-5 h-5 rounded-full" alt="" />
                                                <span className="text-lg font-medium">{coin.fiat ?? coin.coin}</span>
                                            </div>
                                            {coin.second && <div className="flex items-center gap-1">
                                                <span className="text-lg font-medium"><NG number={coin.second.secondTotalPending} /></span>
                                                <img src={secondFiat ?? coins[coin.coin].logoURI} className="w-5 h-5 rounded-full" alt="" />
                                                <span className="text-lg font-medium">{coin.second.fiat ?? coin.coin}</span>
                                            </div>}
                                        </Fragment>
                                    })}
                                </div>
                            </div>
                        </div>
                        <div className="flex flex-col gap-8 py-8 border-b px-10">
                            <div className="flex justify-between px-2">
                                <span className="font-medium text-lg text-gray-400">Total Available</span>
                                <span className=" dark:text-white text-lg">{symbol}<NG number={TotalBudget.totalAmount - TotalBudget.totalPending - TotalBudget.totalUsedAmount} /></span></div>
                            <div className="flex justify-between px-2">
                                <span className="text-lg font-medium text-gray-400">Token Breakdown</span>
                                <div className="flex flex-col  items-end gap-2">
                                    {total.budgetCoins.map((coin, index) => {
                                        const firstFiat = fiatList.find(f => f.name === coin.fiat)?.logo
                                        const secondFiat = fiatList.find(f => f.name === coin.second?.fiat)?.logo
                                        return <Fragment key={index}>
                                            <div className="flex items-center gap-1">
                                                <span className="text-lg font-medium"><NG number={coin.totalAmount - coin.totalPending - coin.totalUsedAmount} /></span>
                                                <img src={firstFiat ?? coins[coin.coin].logoURI} className="w-5 h-5 rounded-full" />
                                                <span className="text-lg font-medium">{coin.fiat ?? coin.coin}</span>
                                            </div>
                                            {coin.second && <div className="flex items-center gap-1">
                                                <span className="text-lg font-medium"><NG number={coin.second.secondTotalAmount - coin.second.secondTotalPending - coin.second.secondTotalUsedAmount} /></span>
                                                <img src={secondFiat ?? coins[coin.coin].logoURI} className="w-5 h-5 rounded-full" />
                                                <span className="text-lg font-medium">{coin.second.fiat ?? coin.second.secondCoin}</span>
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