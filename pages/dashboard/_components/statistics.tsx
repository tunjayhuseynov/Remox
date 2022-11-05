import { useMemo, useState } from "react";
import LineChart from "components/general/Linechart";
import useStorage from "hooks/storage/useStorage";
import { SelectAccounts, SelectBalance, SelectDailyBalance, SelectFiatSymbol, SelectHistoricalPrices, SelectStats, SelectStorage, SelectTotalBalance } from "redux/slices/account/remoxData";
import { useAppSelector } from "redux/hooks";
import Payments from "./request-payment";
import { IFlowDetailItem } from "pages/api/calculation/_spendingType";
import { DecimalConverter, IPrice } from "utils/api";
import { GetFiatPrice } from "utils/const";
import date from 'date-and-time'

const Statistic = () => {
    const stats = useAppSelector(SelectStats)
    const storage = useAppSelector(SelectStorage)
    const { getName } = useStorage()

    const [chartDate, setChartDate] = useState<"week" | "month" | "quart" | "year">("week")

    // const [openNotify, setNotify] = useState<boolean>(false)

    const totalBalance = useAppSelector(SelectTotalBalance)
    const accounts = useAppSelector(SelectAccounts)
    const balances = useAppSelector(SelectBalance)
    const hp = useAppSelector(SelectHistoricalPrices)
    // const dailyBalance = useAppSelector(SelectDailyBalance)
    const dailyBalance = useMemo(() => {
        if (stats) {
            const stringTime = (time: Date) => `${time.getFullYear()}/${time.getMonth() + 1 > 9 ? time.getMonth() + 1 : `0${time.getMonth() + 1}`}/${time.getDate() > 9 ? time.getDate() : `0${time.getDate()}`}`
            const timeCoins: { [time: string]: IPrice } = {}
            const preference = storage?.organization?.fiatMoneyPreference ?? storage?.individual?.fiatMoneyPreference ?? "USD";
            // let pc = storage?.organization?.priceCalculation ?? storage?.individual?.priceCalculation ?? "current";

            let response: { [time: string]: number } = {}
            let balance: typeof balances = accounts.reduce<typeof balances>((a, account) => {
                for (const coin of account.coins) {
                    if (a[coin.symbol] === undefined) {
                        a[coin.symbol] = Object.assign({}, coin) as any;
                    } else {
                        a[coin.symbol].amount += coin.amount;
                    }
                }
                return a;
            }, {});

            let newest = "1970/01/01";
            for (const [flowKey, flowValue] of Object.entries(stats.Account).reverse()) {
                if (new Date(flowKey).getTime() > new Date(newest).getTime()) newest = flowKey
                for (const item of flowValue) {
                    if (!timeCoins[flowKey]) {
                        timeCoins[flowKey] = {};
                    }
                    if (balance[item.name.symbol]) {
                        balance[item.name.symbol].amount += ((item.type === "in" ? -1 : 1) * DecimalConverter(item.amount, item.name.decimals));
                    }
                    // if (balance?.[item?.fee?.name?.symbol]) {
                    //     balance[item.fee.name.symbol].amount += DecimalConverter(item.fee.amount, item.fee.name.decimals);
                    // }
                    timeCoins[flowKey] = {...balance}
                    // console.log(flowKey,balance);
  
                }
                response[flowKey] = Object.entries(timeCoins[flowKey]).reduce((a, [key, val]) => {
                    a += (hp[balance[key].symbol]?.[preference].find(s => new Date(flowKey).getTime() === new Date(s.date).getTime())?.price ?? GetFiatPrice(balances[key], preference)) * val.amount
                    return a;
                }, 0);
            }
            //(hp[balance[key].symbol]?.[preference].find(s => new Date(flowKey).getTime() === new Date(s.date).getTime())?.price) ?? 
            // console.log("TimeCoins: ", timeCoins)
            // console.log("TimeCoins: ", timeCoins)
            // console.log("Response: ", response)
            let totalBalance = 0;
            accounts.forEach((account) => {
                account.coins.forEach((coin) => {
                    totalBalance += (coin.amount * GetFiatPrice(coin, preference)) //generatePriceCalculation(coin, hp, pc, preference);
                })
            })

            if (response[stringTime(new Date())] === undefined && Object.keys(response).length > 0) response[stringTime(new Date())] = totalBalance
            response = Object.entries(response).sort(([key1], [key2]) => new Date(key1).getTime() > new Date(key2).getTime() ? 1 : -1).reduce<typeof response>((a, c) => { a[c[0]] = c[1]; return a }, {})

            const calendarList = Object.entries(response).reverse()
            if (calendarList.length > 0) {
                const last = calendarList.at(-1)
                const first = calendarList[0][0]
                if (last && calendarList.length > 0) {
                    let saved = response[last[0]]
                    let lastCheckedTime = last[0]
                    const difference = date.subtract(new Date(last[0]), new Date(first)).toDays()
                    for (let index = difference; index > 0; index--) {
                        const time = stringTime(date.addDays(new Date(last[0]), -1 * (difference - index - 1)))
                        if (response[time]) {
                            saved = response[time]
                            lastCheckedTime = time
                        } else {
                            if (timeCoins?.[lastCheckedTime]) {
                                response[time] = Object.entries(timeCoins[lastCheckedTime]).reduce((a, [key, val]) => {
                                    a += (hp[balance[key].symbol]?.[preference].find(s => new Date(time).getTime() === new Date(s.date).getTime())?.price ?? GetFiatPrice(balances[key], preference)) * val.amount
                                    return a;
                                }, 0);
                            } else {
                                response[time] = saved
                            }
                        }
                    }
                }
            }
            response = Object.entries(response).sort(([key1], [key2]) => new Date(key1).getTime() > new Date(key2).getTime() ? 1 : -1).reduce<typeof response>((a, c) => { a[c[0]] = c[1]; return a }, {})
            console.log("Response2: ", response)
            return {
                week: Object.entries(response).filter(([time, amount]) => Math.abs(date.subtract(new Date(), new Date(time)).toDays()) <= 7).reduce<{ [name: string]: number }>((a, c) => { a[c[0]] = c[1]; return a; }, {}),
                month: Object.entries(response).filter(([time, amount]) => Math.abs(date.subtract(new Date(), new Date(time)).toDays()) <= 31).reduce<{ [name: string]: number }>((a, c) => { a[c[0]] = c[1]; return a; }, {}),
                quart: Object.entries(response).filter(([time, amount]) => Math.abs(date.subtract(new Date(), new Date(time)).toDays()) <= 90).reduce<{ [name: string]: number }>((a, c) => { a[c[0]] = c[1]; return a; }, {}),
                year: Object.entries(response).filter(([time, amount]) => Math.abs(date.subtract(new Date(), new Date(time)).toDays()) <= 365).reduce<{ [name: string]: number }>((a, c) => { a[c[0]] = c[1]; return a; }, {}),
            };
        }
        return null;
    }, [stats, accounts, balances, hp])

    const symbol = useAppSelector(SelectFiatSymbol)
    return <>
        {/* <Modal onDisable={setNotify} openNotify={openNotify} >
            <NewWalletModal onDisable={setNotify} />
        </Modal> */}
        <div className="flex flex-col space-y-3">
            <div className="text-6xl font-semibold text-left">Welcome, {storage?.individual.name}</div>
            <div className="grid grid-cols-[65%,35%] gap-x-12 ">
                <div className="bg-white dark:bg-darkSecond pt-4 rounded-md shadow-15 ">
                    <div className="w-full flex justify-between px-5">
                        <div className="flex flex-col gap-1">
                            <div className="font-semibold text-greylish tracking-wide text-sm">Total Treasury Value</div>
                            <p className="text-3xl font-semibold">{symbol}{Math.floor(totalBalance)}<sup className="text-sm">{`.${totalBalance.toFixed(2).split(".")[1] ?? "00"}`}</sup></p>
                        </div>
                        <div className="flex gap-5 ">
                            <span className={`${chartDate === "week" && '!text-primary text-opacity-100'} text-opacity-100'} hover:!text-primary cursor-pointer text-greylish dark:text-greylish text-xs font-semibold tracking-wide`} onClick={() => setChartDate("week")}>1W</span>
                            <span className={`${chartDate === "month" && '!text-primary text-opacity-100'}  hover:!text-primary cursor-pointer text-greylish dark:text-greylish  text-xs font-semibold tracking-wide`} onClick={() => setChartDate("month")}>1M</span>
                            <span className={`${chartDate === "quart" && '!text-primary text-opacity-100'} text-greylish hover:!text-primary cursor-pointer dark:text-greylish text-xs font-semibold tracking-wide`} onClick={() => setChartDate("quart")}>3M</span>
                            <span className={`${chartDate === "year" && '!text-primary text-opacity-100'}   text-opacity-100'} hover:!text-primary cursor-pointer text-greylish dark:text-greylish text-xs font-semibold tracking-wide`} onClick={() => setChartDate("year")}>1Y</span>
                        </div>
                    </div>
                    <div className="w-full h-full flex items-center justify-center">
                        <LineChart data={dailyBalance?.[chartDate] ?? {}} type={'area'} selectedDate={chartDate} />
                    </div>
                </div>
                <div className="pr-10">
                    <div id="transaction" className="flex flex-col items-start justify-between h-full">
                        <span className="text-xl font-semibold leading-none">Requests & Payments</span>
                        <Payments />
                    </div>
                </div>
            </div>
        </div>
    </>
}


export default Statistic;