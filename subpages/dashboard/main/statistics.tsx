import { useEffect, useState, useRef } from "react";
import { IBalanceItem, SelectOrderBalance } from 'redux/reducers/currencies';
import { SelectSelectedAccount } from "redux/reducers/selectedAccount";
import { IFormattedTransaction } from "hooks/useTransactionProcess";
import { Chart as ChartJs } from 'chart.js';
import useModalSideExit from 'hooks/useModalSideExit';
import { useSelector } from "react-redux";
import { SelectAccountStats, SelectRawStats } from "redux/reducers/accountstats";
import LineChart from "components/general/Linechart";
import Button from "components/button";
import { changeDarkMode, selectDarkMode } from 'redux/reducers/notificationSlice';
import useNextSelector from "hooks/useNextSelector";
import { selectStorage } from "redux/reducers/storage";
import AllWallets from "./allWallets";


const Statistic = ({ transactions }: { transactions: IFormattedTransaction[] | undefined }) => {
    const selectedAccount = useNextSelector(SelectSelectedAccount)
    const dark = useNextSelector(selectDarkMode)
    const stats = useNextSelector(SelectRawStats)
    const [walletModal, setWalletModal] = useState<boolean>(false)
    const [selectcoin, setSelectcoin] = useState<string>("")
    const [chartDate, setChartDate] = useState<string>("")
    const chartjs = useRef<ChartJs>(null)
    const [customRef] = useModalSideExit<string>(selectcoin, setSelectcoin, "")



    const {
        isLoading,
        totalBalance: balance,
        TotalBalancePercentage: percent
    } = useSelector(SelectAccountStats)


    const UpdateChartAnimation = (index?: number) => {
        if (chartjs.current) {
            if (index || index === 0) {
                chartjs.current.setActiveElements([{ datasetIndex: 0, index: index }])
            } else {
                chartjs.current.setActiveElements([])
            }
            chartjs.current.update()
        }
    }

    useEffect(() => {
        if (!selectcoin) {
            UpdateChartAnimation()
        }
    }, [selectcoin])


    const datas = [
        {
            id: 0,
            walletName: "Treasury Vault 0",
            balance: `$${balance?.toFixed(2)}`,
        },
        {
            id: 1,
            walletName: "Treasury Vault 1",
            balance: `$${balance?.toFixed(2)}`,
        },
    ]

    return <>

        <div className="flex flex-col gap-5 h-full w-full ">
            <div className="text-4xl font-semibold text-left">Welcome, {}</div>
            <div className="bg-white dark:bg-darkSecond rounded-lg shadow">
                <div className="w-full px-12 pt-5 flex justify-between">
                    <div className="  flex flex-col gap-1">
                        <div className=" font-medium text-lg text-greylish dark:text-white text-opacity-40 tracking-wide">Total Treasury Value</div>
                        <div className="text-4xl font-semibold">$500.000</div>
                    </div>
                    <div className="flex gap-3 pt-6">
                        <span className={` ${chartDate === "1w" && '!text-primary text-opacity-100'} hover:!text-primary cursor-pointer text-greylish dark:text-white text-opacity-40 tracking-wide`} onClick={() => setChartDate("1w")}>1W</span>
                        <span className={` ${chartDate === "1m" && '!text-primary text-opacity-100'}  hover:!text-primary cursor-pointer text-greylish dark:text-white  text-opacity-40 tracking-wide`} onClick={() => setChartDate("1m")}>1M</span>
                        <span className={` ${chartDate === "3m" && '!text-primary text-opacity-100'} text-greylish dark:text-white hover:!text-primary cursor-pointer text-opacity-40 tracking-wide`} onClick={() => setChartDate("3m")}>3M</span>
                        <span className={` ${chartDate === "1y" && '!text-primary text-opacity-100'}  hover:!text-primary cursor-pointer text-greylish dark:text-white text-opacity-40 tracking-wide`} onClick={() => setChartDate("1y")}>1Y</span>
                    </div>
                </div>
                {/* <div className="flex items-center justify-center h-[30%] w-[30%]"><Chartjs data={data} ref={chartjs} items={orderBalance4 as any} dispatch={setSelectcoin} /></div> */}
                <div className="w-full h-full flex items-center justify-center"><LineChart data={stats?.TotalBalanceByDay.year ?? {}} type={'area'} /></div>
            </div>
            <div className=" flex flex-col gap-5 pt-6 xl:pt-0">
                <div className="flex justify-between w-full">
                    <div className="text-2xl font-semibold">Connected Wallets</div>
                    <Button className="text-xs sm:text-base !py-0 !px-8 rounded-xl" onClick={() => { setWalletModal(!walletModal) }}>+ Add Wallet</Button>
                </div>
                <div className="grid grid-cols-2 gap-32 xl:gap-10 pb-4">
                    {datas.map((item, id) => {
                        return <AllWallets item={item} key={id} walletModal={walletModal} setWalletModal={setWalletModal} />
                    })}
                </div>

            </div>
        </div>

    </>
}


export default Statistic;