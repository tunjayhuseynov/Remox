import { useState } from "react";
import { IFormattedTransaction } from "hooks/useTransactionProcess";
import LineChart from "components/general/Linechart";
import Button from "components/button";
import useStorage from "hooks/storage/useStorage";
import WalletList from "./WalletList";
import { SelectAccounts, SelectDailyBalance, SelectFiatSymbol, SelectStats, SelectTotalBalance } from "redux/slices/account/remoxData";
import { useRouter } from "next/router";
import { useAppSelector } from "redux/hooks";
import Payments from "./request-payment";

const Statistic = () => {
    const stats = useAppSelector(SelectStats)
    const { getName } = useStorage()

    const [chartDate, setChartDate] = useState<"week" | "month" | "quart" | "year">("week")

    // const [openNotify, setNotify] = useState<boolean>(false)

    const totalBalance = useAppSelector(SelectTotalBalance)
    const dailyBalance = useAppSelector(SelectDailyBalance)
    const symbol = useAppSelector(SelectFiatSymbol)
    return <>
        {/* <Modal onDisable={setNotify} openNotify={openNotify} >
            <NewWalletModal onDisable={setNotify} />
        </Modal> */}
        <div className="flex flex-col space-y-3">
            <div className="text-6xl font-semibold text-left">Welcome, {getName}</div>
            <div className="grid grid-cols-[66.6%,33.3%] gap-x-12 ">
                <div className="bg-white dark:bg-darkSecond py-5 px-3 rounded-md shadow-15 ">
                    <div className="w-full flex justify-between">
                        <div className="flex flex-col gap-1">
                            <div className="font-semibold text-greylish tracking-wide text-sm">Total Treasury Value</div>
                            <div className="text-3xl font-semibold">{symbol}{Math.floor(totalBalance)}<sup className="text-sm">{`.${totalBalance.toFixed(2).split(".")[1] ?? "00"}`}</sup></div>
                        </div>
                        <div className="flex gap-3 pr-2 ">
                            <span className={`${chartDate === "week" && '!text-primary text-opacity-100'} text-opacity-100'} hover:!text-primary cursor-pointer text-greylish dark:text-greylish text-xs font-semibold tracking-wide`} onClick={() => setChartDate("week")}>1W</span>
                            <span className={`${chartDate === "month" && '!text-primary text-opacity-100'}  hover:!text-primary cursor-pointer text-greylish dark:text-greylish  text-xs font-semibold tracking-wide`} onClick={() => setChartDate("month")}>1M</span>
                            <span className={`${chartDate === "quart" && '!text-primary text-opacity-100'} text-greylish hover:!text-primary cursor-pointer dark:text-greylish text-xs font-semibold tracking-wide`} onClick={() => setChartDate("quart")}>3M</span>
                            <span className={`${chartDate === "year" && '!text-primary text-opacity-100'}   text-opacity-100'} hover:!text-primary cursor-pointer text-greylish dark:text-greylish text-xs font-semibold tracking-wide`} onClick={() => setChartDate("year")}>1Y</span>
                        </div>
                    </div>
                    <div className="w-full h-full">
                        <LineChart data={dailyBalance?.[chartDate] ?? {}} type={'area'} />
                    </div>
                </div>
                <div className="pr-10">
                    <div id="transaction" className="flex flex-col justify-between h-full">
                        <div className="text-xl font-semibold mb-2">Requests & Payments</div>
                        <div className="flex flex-col h-full justify-between">
                            <Payments />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </>
}


export default Statistic;