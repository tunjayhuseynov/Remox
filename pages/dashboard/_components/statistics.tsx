import { useMemo, useState } from "react";
import LineChart from "components/general/Linechart";
import useStorage from "hooks/storage/useStorage";
import { SelectAccounts, SelectBalance, SelectDailyBalance, SelectFiatSymbol, SelectHistoricalPrices, SelectStats, SelectStorage, SelectTotalBalance } from "redux/slices/account/remoxData";
import { useAppSelector } from "redux/hooks";
import Payments from "./request-payment";


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
    const dailyBalance = useAppSelector(SelectDailyBalance)


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