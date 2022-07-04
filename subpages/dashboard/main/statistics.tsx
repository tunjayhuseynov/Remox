import { useEffect, useState, useRef } from "react";
import { IFormattedTransaction } from "hooks/useTransactionProcess";
import LineChart from "components/general/Linechart";
import Button from "components/button";
import useNextSelector from "hooks/useNextSelector";
import useStorage from "hooks/storage/useStorage";
import AllWallets from "./allWallets";
import Modal from 'components/general/modal'
import NewWalletModal from "./newWalletModal";
import useMultiWallet from "hooks/useMultiWallet";
import { IAccount } from "firebaseConfig";
import { SelectRawStats } from "redux/slices/account/accountstats";
import { SelectStats } from "redux/slices/account/remoxData";

const Statistic = ({ transactions }: { transactions: IFormattedTransaction[] | undefined }) => {
    const stats = useNextSelector(SelectStats)
    const { getName } = useStorage()

    const [chartDate, setChartDate] = useState<"week" | "month" | "quart" | "year">("week")

    const [openNotify, setNotify] = useState<boolean>(false)

    const { data } = useMultiWallet()

    return <>
        <Modal onDisable={setNotify} openNotify={openNotify} >
            <NewWalletModal onDisable={setNotify} />
        </Modal>
        <div className="flex flex-col gap-5 h-full w-full ">
            <div className="text-4xl font-semibold text-left">Welcome, {getName}</div>
            <div className="bg-white  mt-3 dark:bg-darkSecond rounded-lg shadow">
                <div className="w-full px-12 pt-5 flex justify-between">
                    <div className="  flex flex-col gap-1">
                        <div className=" font-medium text-lg text-greylish dark:text-white text-opacity-40 tracking-wide">Total Treasury Value</div>
                        <div className="text-4xl font-semibold">${stats?.TotalBalance?.toFixed(0)}<sup className="text-sm">{`.${stats?.TotalBalance?.toFixed(2).split(".")[1] ?? "00"}`}</sup></div>
                    </div>
                    <div className="flex gap-3 pt-6">
                        <span className={` ${chartDate === "week" && '!text-primary text-opacity-100'} hover:!text-primary cursor-pointer text-greylish dark:text-white text-opacity-40 tracking-wide`} onClick={() => setChartDate("week")}>1W</span>
                        <span className={` ${chartDate === "month" && '!text-primary text-opacity-100'}  hover:!text-primary cursor-pointer text-greylish dark:text-white  text-opacity-40 tracking-wide`} onClick={() => setChartDate("month")}>1M</span>
                        <span className={` ${chartDate === "quart" && '!text-primary text-opacity-100'} text-greylish hover:!text-primary cursor-pointer dark:text-white text-opacity-40 tracking-wide`} onClick={() => setChartDate("quart")}>3M</span>
                        <span className={` ${chartDate === "year" && '!text-primary text-opacity-100'}  hover:!text-primary cursor-pointer text-greylish dark:text-white text-opacity-40 tracking-wide`} onClick={() => setChartDate("year")}>1Y</span>
                    </div>
                </div>
                {/* <div className="flex items-center justify-center h-[30%] w-[30%]"><Chartjs data={data} ref={chartjs} items={orderBalance4 as any} dispatch={setSelectcoin} /></div> */}
                <div className="w-full h-full flex items-center justify-center"><LineChart data={stats?.TotalBalanceByDay[chartDate] ?? {}} type={'area'} /></div>
            </div>
            <div className=" flex flex-col gap-5 pt-6 xl:pt-0">
                <div className="flex justify-between w-full">
                    <div className="text-2xl font-semibold">Connected Wallets</div>
                    <Button className="text-xs sm:text-base !py-0 !px-8 rounded-xl" onClick={() => { setNotify(true) }}>+ Add Wallet</Button>
                </div>
                <div className="grid grid-cols-2 gap-32 xl:gap-10 pb-4">
                    {data && data.map((item, id) => {
                        return <AllWallets item={item as IAccount} key={id} />
                    })}
                </div>

            </div>
        </div>
    </>
}


export default Statistic;