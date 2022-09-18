import { useState } from "react";
import { IFormattedTransaction } from "hooks/useTransactionProcess";
import LineChart from "components/general/Linechart";
import Button from "components/button";
import useNextSelector from "hooks/useNextSelector";
import useStorage from "hooks/storage/useStorage";
import WalletList from "./WalletList";
import useMultiWallet from "hooks/useMultiWallet";
import { IAccount } from "firebaseConfig";
import { SelectAccounts, SelectStats } from "redux/slices/account/remoxData";
import { useRouter } from "next/router";
import { SetComma } from "utils";
import { useAppSelector } from "redux/hooks";

const Statistic = ({ transactions }: { transactions: IFormattedTransaction[] | undefined }) => {
    const stats = useAppSelector(SelectStats)
    const route = useRouter()
    const { getName } = useStorage()

    const [chartDate, setChartDate] = useState<"week" | "month" | "quart" | "year">("week")

    // const [openNotify, setNotify] = useState<boolean>(false)

    const accounts = useAppSelector(SelectAccounts)

    return <>
        {/* <Modal onDisable={setNotify} openNotify={openNotify} >
            <NewWalletModal onDisable={setNotify} />
        </Modal> */}
        <div className="flex flex-col gap-3  h-full w-full">
            <div className="text-[2.42857rem] font-semibold text-left">Welcome, {getName}</div>
            <div className="bg-white  dark:bg-darkSecond rounded-md shadow-15 w-full h-full">
                <div className="w-full px-5 pt-8 flex justify-between">
                    <div className="flex flex-col gap-1">
                        <div className="font-semibold text-greylish tracking-wide">Total Treasury Value</div>
                        <div className="text-3xl font-semibold">${Math.floor(stats?.TotalBalance ?? 0)}<sup className="text-sm">{`.${stats?.TotalBalance?.toFixed(2).split(".")[1] ?? "00"}`}</sup></div>
                    </div>
                    <div className="flex gap-3 pr-2">
                        <span className={`${chartDate === "week" && '!text-primary text-opacity-100'} text-opacity-100'} hover:!text-primary cursor-pointer text-greylish dark:text-greylish text-sm font-semibold tracking-wide`} onClick={() => setChartDate("week")}>1W</span>
                        <span className={`${chartDate === "month" && '!text-primary text-opacity-100'}  hover:!text-primary cursor-pointer text-greylish dark:text-greylish  text-sm font-semibold tracking-wide`} onClick={() => setChartDate("month")}>1M</span>
                        <span className={`${chartDate === "quart" && '!text-primary text-opacity-100'} text-greylish hover:!text-primary cursor-pointer dark:text-greylish text-sm font-semibold tracking-wide`} onClick={() => setChartDate("quart")}>3M</span>
                        <span className={`${chartDate === "year" && '!text-primary text-opacity-100'}   text-opacity-100'} hover:!text-primary cursor-pointer text-greylish dark:text-greylish text-sm font-semibold tracking-wide`} onClick={() => setChartDate("year")}>1Y</span>
                    </div>
                </div>
                {/* <div className="flex items-center justify-center h-[30%] w-[30%]"><Chartjs data={data} ref={chartjs} items={orderBalance4 as any} dispatch={setSelectcoin} /></div> */}
                <div className="w-full h-full flex items-center justify-center">
                    <LineChart data={stats?.TotalBalanceByDay[chartDate] ?? {}} type={'area'} />
                </div>
            </div>
            <div className="flex flex-col gap-5 pt-2">
                <div className="flex justify-between items-center w-full">
                    <div className="text-xl font-semibold">Connected Wallets</div>
                    <Button className="text-xs sm:text-lg !py-[.5rem] !px-12" onClick={() => {
                        route.push("/dashboard/new-wallet")
                    }}>+ Add Wallet</Button>
                </div>
                <div className="grid grid-cols-2 gap-x-32 xl:gap-x-20 gap-y-20 xl:gap-y-12 pb-4">
                    {accounts.map((item) => {
                        return <WalletList item={item} key={item.id} />
                    })}
                </div>

            </div>
        </div>
    </>
}


export default Statistic;