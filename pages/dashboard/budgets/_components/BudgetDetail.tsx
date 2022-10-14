import { Dispatch, forwardRef, useEffect, useMemo, Fragment } from 'react'
import _ from "lodash";
import { motion, AnimatePresence } from "framer-motion"
import { ProgressBarWidth, SetComma } from 'utils';
import { IBudgetORM } from 'pages/api/budget/index.api';
import { useWalletKit } from 'hooks';
import ClickAwayListener from '@mui/base/ClickAwayListener';
import { fiatList } from 'components/general/PriceInputField';
import CurrencyElement from 'components/general/CurrencyElement';

interface IProps {
    item: IBudgetORM,
    close: Dispatch<boolean>,
    visibility: boolean
}

const BudgetDetails = forwardRef<HTMLDivElement, IProps>(function BudgetDetail({ item, close, visibility }, ref) {

    const { GetCoins } = useWalletKit()

    const coin = item.budgetCoins;
    const usedPercent = useMemo(() => (coin.totalUsedAmount) * 100 / coin.totalAmount, [item])
    const usedPercentStyle = useMemo(() => ProgressBarWidth(usedPercent), [usedPercent])

    const pendingPercent = useMemo(() => (coin.totalPending) * 100 / coin.totalAmount, [item])
    const pendingPercentStyle = useMemo(() => ProgressBarWidth(pendingPercent), [usedPercent])

    const usedSecondPercent = useMemo(() => ((coin.second?.secondTotalUsedAmount ?? 0) + (coin.second?.secondTotalPending ?? 0)) * 100 / (coin.second?.secondTotalAmount ?? 1), [item])
    const usedSecondPercentStyle = useMemo(() => ProgressBarWidth(usedSecondPercent), [usedSecondPercent])

    const firstFiat = fiatList.find(f => f.name === item.fiatMoney)?.logo
    const secondFiat = fiatList.find(f => f.name === item.secondFiatMoney)?.logo

    return <>
        <AnimatePresence>
            {visibility &&
                <motion.div initial={{ x: "100%", opacity: 0.5 }} animate={{ x: 15, opacity: 1 }} exit={{ x: "100%", opacity: 0.5 }} transition={{ type: "spring", stiffness: 400, damping: 40 }} className="z-[97] grid grid-cols-2 fixed shadow-custom w-[100%] h-[100vh] pr-1 overflow-y-auto overflow-x-hidden top-0 right-0 cursor-default">
                    <div className='w-full h-full backdrop-blur-[2px]'></div>
                    <ClickAwayListener onClickAway={() => close(false)}>
                        <div className="flex flex-col min-h-[325px] sm:min-h-[auto] px-10 bg-white dark:bg-darkSecond  gap-10 py-12 justify-center sm:justify-start sm:items-stretch items-center">
                            <button onClick={() => close(false)} className="absolute left-full w-[2rem] top-0 translate-x-[-170%] translate-y-[25%] opacity-45">
                                <img src="/icons/cross_greylish.png" alt="" />
                            </button>
                            <div className="flex flex-col sm:flex-row justify-center sm:items-center text-2xl font-bold pt-2">Budget Details</div>
                            <div className="flex items-center justify-between w-full">
                                <div className="text-xl font-bold">{item.name}</div>
                                <div className="flex items-center gap-5">
                                    <div className="text-xl font-bold">{usedPercent.toLocaleString()}%</div>
                                </div>
                            </div>
                            <div className='flex flex-col space-y-5'>
                                <div>
                                    <div className="flex items-center gap-2 text-greylish py-2">
                                        <span className="text-xl font-bold flex items-center gap-1">
                                            <CurrencyElement coin={GetCoins[coin.coin]} fiat={coin.fiat} amount={coin.totalUsedAmount + coin.totalPending} size={1.25} />
                                        </span>
                                        <span className="text-sm">impacted on</span>
                                        <span className="text-sm font-bold flex items-center gap-1">
                                            <CurrencyElement coin={GetCoins[coin.coin]} fiat={coin.fiat} amount={coin.totalAmount} size={0.875} />
                                        </span>
                                    </div>
                                    <div className="rounded-xl w-full h-[1.2rem] relative bg-greylish bg-opacity-40 overflow-hidden">
                                        <div className='absolute left-0 top-0 w-full h-full flex'>
                                            <div className="h-full bg-primary rounded-l-xl" style={usedPercentStyle}></div>
                                            <div className="stripe-1 object-cover h-full" style={pendingPercentStyle}></div>
                                        </div>
                                        {/* <div className="w-[15%] h-full bg-greylish bg-opacity-10 rounded-r-xl"></div> */}
                                    </div>
                                    <div className="grid grid-cols-4 px-3 justify-between items-center py-4">
                                        <div className="flex flex-col gap-2">
                                            <div className="flex items-center gap-1 font-bold text-xs"><span className={`rounded-full bg-primary p-2 font-bold text-xs`}></span>Used</div>
                                            <div className="flex items-center gap-1 font-bold text-xs">
                                                <CurrencyElement coin={GetCoins[item.budgetCoins.coin]} fiat={item.budgetCoins.fiat} amount={coin.totalUsedAmount} size={0.75} />
                                            </div>
                                        </div>
                                        <div className="flex flex-col gap-2">
                                            <div className="flex items-center gap-1 font-bold text-xs"><span className={`rounded-full stripe-1 bg-primary p-2 font-bold text-xs`}></span>Pending</div>
                                            <div className="flex items-center gap-1 font-bold text-xs">
                                                <CurrencyElement coin={GetCoins[item.budgetCoins.coin]} fiat={item.budgetCoins.fiat} amount={coin.totalPending} size={0.75} />
                                            </div>
                                        </div>
                                        <div className="flex flex-col gap-2">
                                            <div className="flex items-center gap-1 font-bold text-xs"><span className={`rounded-full bg-gray-500 p-2 font-bold text-xs`}></span>Available</div>
                                            <div className="flex items-center gap-1 font-bold text-xs">
                                                <CurrencyElement coin={GetCoins[item.budgetCoins.coin]} fiat={item.budgetCoins.fiat} amount={coin.totalAmount - coin.totalUsedAmount - coin.totalPending} size={0.75} />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                {coin.second && <>
                                    <div>
                                        <div className="flex items-center gap-2 text-greylish py-2">
                                            <span className="text-2xl font-bold flex items-center gap-1">
                                                <CurrencyElement coin={GetCoins[coin.second.secondCoin]} fiat={coin.second.fiat} amount={coin.second.secondTotalUsedAmount + coin.second.secondTotalPending} size={1.25} />
                                            </span>
                                            <span>impacted on</span>
                                            <span className="text-lg flex items-center gap-1">
                                                <CurrencyElement coin={GetCoins[coin.second.secondCoin]} fiat={coin.second.fiat} amount={coin.second.secondTotalAmount} size={0.875} />
                                            </span>
                                        </div>
                                        <div className=" rounded-xl relative w-full h-[1.2rem] flex bg-greylish bg-opacity-40">
                                            <div className="h-full bg-primary rounded-l-xl" style={usedSecondPercentStyle}></div>
                                            <div className="stripe-1 ml-2 object-cover h-full"></div>
                                            <div className="h-full bg-greylish bg-opacity-10 rounded-r-xl"></div>
                                        </div>
                                        <div className="grid grid-cols-4 px-3 justify-between items-center py-4">
                                            <div className="flex flex-col gap-2">
                                                <div className="flex items-center gap-1 font-bold text-xs"><span className={`rounded-full bg-primary p-2 font-bold text-xs`}></span>Used</div>
                                                <div className="flex items-center gap-1 font-bold text-xs">
                                                    <CurrencyElement coin={GetCoins[coin.second.secondCoin]} fiat={coin.second.fiat} amount={coin.second.secondTotalUsedAmount} size={0.75} />
                                                </div>
                                            </div>
                                            <div className="flex flex-col gap-2">
                                                <div className="flex items-center gap-1 font-bold text-xs"><span className={`rounded-full stripe-1 bg-primary p-2 font-bold text-xs`}></span>Pending</div>
                                                <div className="flex items-center gap-1 font-bold text-xs">
                                                    <CurrencyElement coin={GetCoins[coin.second.secondCoin]} fiat={coin.second.fiat} amount={coin.totalPending} size={0.75} />
                                                </div>
                                            </div>
                                            <div className="flex flex-col gap-2">
                                                <div className="flex items-center gap-1 font-bold text-xs"><span className={`rounded-full bg-gray-500 p-2 font-bold text-xs`}></span>Available</div>
                                                <div className="flex items-center gap-1 font-bold text-xs">
                                                    <CurrencyElement coin={GetCoins[coin.second.secondCoin]} fiat={coin.second.fiat} amount={coin.second.secondTotalAmount - coin.second.secondTotalUsedAmount - coin.second.secondTotalPending} size={0.75} />
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </>}
                            </div>
                            {item.subbudgets.length > 0 && <>
                                <div className="text-xl font-bold text-start pb-3">Budget Labels</div>
                                {item.subbudgets.map((item, id) => {
                                    return <div key={id}>
                                        <div className="border-b py-4 w-full grid grid-cols-[15%,60%,25%] items-center">
                                            <div className="text-greylish w-full font-bold text-xs">{item.name}</div>
                                            <div className='flex flex-col space-y-2 w-full place-items-center'>
                                                <div className="text-greylish flex items-start space-x-2 text-sm">
                                                    <CurrencyElement size={0.75} coin={GetCoins[item.budgetCoins.coin]} fiat={item.fiatMoney} amount={item.budgetCoins.totalAmount} />
                                                    <span>/</span>
                                                    <CurrencyElement size={0.75} coin={GetCoins[item.budgetCoins.coin]} fiat={item.budgetCoins.fiat} amount={item.budgetCoins.totalUsedAmount} />
                                                    <span>/</span>
                                                    <CurrencyElement size={0.75} coin={GetCoins[item.budgetCoins.coin]} fiat={item.fiatMoney} amount={item.budgetCoins.totalPending} />
                                                </div>
                                                {item.budgetCoins.second && <div className="text-greylish flex items-start gap-1 text-sm">
                                                    <CurrencyElement size={0.75} coin={GetCoins[item.budgetCoins.second.secondCoin]} fiat={item.secondFiatMoney} amount={item.budgetCoins.second.secondTotalAmount} />
                                                    <span>/</span>
                                                    <CurrencyElement size={0.75} coin={GetCoins[item.budgetCoins.second.secondCoin]} fiat={item.secondFiatMoney} amount={item.budgetCoins.second.secondTotalUsedAmount} />
                                                    <span>/</span>
                                                    <CurrencyElement size={0.75} coin={GetCoins[item.budgetCoins.second.secondCoin]} fiat={item.secondFiatMoney} amount={item.budgetCoins.second.secondTotalPending} />
                                                </div>}
                                            </div>
                                            <div className='flex flex-col space-y-2 w-full'>
                                                <div className="rounded-xl relative h-[1rem] flex w-full bg-greylish bg-opacity-40 overflow-hidden">
                                                    <div className="h-full bg-primary" style={ProgressBarWidth((((item.budgetCoins.totalUsedAmount ?? 0) + (item.budgetCoins.totalPending ?? 0)) * 100) / (item.budgetCoins.totalAmount ?? 1))}></div>
                                                    {/* <div className="stripe-1 ml-2 object-cover h-full" ></div> */}
                                                    {/* <div className=" h-full bg-greylish bg-opacity-10 rounded-r-xl"></div> */}
                                                </div >
                                                {item.budgetCoins.second && <div className="rounded-xl relative  h-[1rem] flex w-full bg-greylish bg-opacity-40 overflow-hidden">
                                                    <div className="h-full bg-primary" style={ProgressBarWidth((((item.budgetCoins.second.secondTotalUsedAmount ?? 0) + (item.budgetCoins.second.secondTotalPending ?? 0)) * 100) / (item.budgetCoins.second.secondTotalAmount ?? 1))}></div>
                                                    {/* <div className="stripe-1 ml-2 object-cover h-full" ></div> */}
                                                    {/* <div className=" h-full bg-greylish bg-opacity-10 rounded-r-xl"></div> */}
                                                </div >}
                                            </div>
                                        </div>
                                    </div>
                                })}
                            </>}
                            {/* {item.labels && <>
                        <div className="text-2xl font-bold text-start pb-4">Expense Labels</div>
                        {item.labels.map((item, id) => {
                            return <div key={id}><Labels item={item} /> </div>
                        })}
                    </>} */}
                        </div>
                    </ClickAwayListener>
                </motion.div>}
        </AnimatePresence >
    </>

})

export default BudgetDetails