import { useEffect, useState, useRef } from "react";
import { SelectOrderBalance } from 'redux/reducers/currencies';
import { useAppSelector } from 'redux/hooks';
import CoinItem from './coinitem';
import { SelectSelectedAccount } from "redux/reducers/selectedAccount";
import { IFormattedTransaction } from "hooks/useTransactionProcess";
import { Chart as ChartJs } from 'chart.js';
import Chartjs from "components/general/chart";
import useModalSideExit from 'hooks/useModalSideExit';
import { useSelector } from "react-redux";
import { SelectAccountStats } from "redux/reducers/accountstats";
import Loader from "components/Loader";



const Statistic = ({ transactions }: { transactions: IFormattedTransaction[] | undefined }) => {
    const selectedAccount = useAppSelector(SelectSelectedAccount)
    const orderBalance = useAppSelector(SelectOrderBalance)


    const [orderBalance4, setOrderBalance] = useState(orderBalance.slice(0, 4))
    const [selectcoin, setSelectcoin] = useState<string>("")

    const [data, setData] = useState({
        datasets: [{
            data: [0],
            backgroundColor: [""],
            borderWidth: 0,
            hoverOffset: 0,
        },
        ],
        labels: [
            ''
        ],
    });

    const chartjs = useRef<ChartJs>(null)

    const [customRef] = useModalSideExit<string>(selectcoin, setSelectcoin, "")


    useEffect(() => {
        setOrderBalance(orderBalance.slice(0, 4))
    }, [orderBalance])

    const {
        isLoading,
        totalBalance: balance,
        lastIn,
        lastOut,
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


    useEffect(() => {
        if (orderBalance4 !== undefined) {
            const label: string[] = []
            const amount: number[] = []
            const color: string[] = []
            for (let i = 0; i < orderBalance4.length; i++) {
                if (parseFloat(((orderBalance4[i].tokenPrice ?? 0) * orderBalance4[i].amount).toFixed(2)) !== 0) {
                    label[i] = orderBalance4[i].coins.name
                    color[i] = orderBalance4[i].coins.color
                    amount[i] = parseFloat(((orderBalance4[i].tokenPrice ?? 0) * orderBalance4[i].amount).toFixed(2))
                }
            }
            setData(
                {
                    datasets: [{
                        data: amount.length > 0 ? amount : [100],
                        backgroundColor: amount.length > 0 ? color : ["#FF7348"],
                        borderWidth: 0,
                        hoverOffset: 15,
                    },
                    ],
                    labels: amount.length > 0 ? label : ['data'],
                },
            )
        }
    }, [orderBalance4, selectedAccount])

    return <>
        <div className="col-span-2 flex flex-col">
            <div className="flex justify-between pl-4 h-[1.875rem]">
                <div className="text-base text-greylish">Total Balance</div>
                <div className="text-base text-greylish opacity-70">24h</div>
            </div>
            <div className="flex justify-between shadow-custom bg-white dark:bg-darkSecond rounded-xl px-8 py-8">
                <div className="text-4xl">
                    {!isLoading ? `$${balance?.toFixed(2)}` : <Loader />}
                </div>
                <div className="flex items-center text-3xl text-greylish opacity-70" style={
                    balance !== undefined && balance !== 0 ? percent && percent > 0 ? { color: 'green' } : { color: 'red' } : { color: 'black' }
                }>
                    {!isLoading ? `${percent?.toFixed(2)}%` : <Loader />}
                </div>
            </div>
        </div>

        <div>
            <div className="flex justify-between sm:pl-4">
                <div className="text-greylish text-sm sm:text-base">Money in (c.m.)</div>
            </div>
            <div className="flex justify-between shadow-custom bg-white dark:bg-darkSecond rounded-xl px-8 py-4">
                <div className="text-xl sm:text-2xl opacity-80">
                    {lastIn !== undefined && transactions !== undefined && balance !== undefined ? `+ $${lastIn?.toFixed(2)}` : <Loader />}
                </div>
            </div>
        </div>

        <div>
            <div className="flex justify-between sm:pl-4">
                <div className="text-greylish text-sm sm:text-base">Money out (c.m.)</div>
            </div>
            <div className="flex justify-between shadow-custom bg-white dark:bg-darkSecond rounded-xl px-8 py-4">
                <div className="text-greylish opacity-80 text-xl sm:text-2xl">
                    {lastOut !== undefined && transactions !== undefined && balance !== undefined ? `- $${lastOut?.toFixed(2)}` : <Loader />}
                </div>
            </div>
        </div>

        <div className="sm:flex flex-col hidden relative">
            <div>Asset</div>
            <div className="h-full w-full">
                <Chartjs data={data} ref={chartjs} items={orderBalance4 as any} dispatch={setSelectcoin} />
            </div>
        </div>
        {
            balance && orderBalance4 !== undefined ?
                <div className="flex flex-col gap-9 overflow-hidden col-span-2 sm:col-span-1 px-4" ref={customRef}>
                    {orderBalance4.map((item, index) => {
                        return <CoinItem key={item.coins.contractAddress + item.coins.name} setSelectcoin={setSelectcoin} onClick={() => {
                            if (item.amount) {
                                setSelectcoin(item.coins.name)
                                UpdateChartAnimation(index)
                            }
                        }}
                            selectcoin={selectcoin}
                            title={item.coins.name}
                            coin={item.amount.toFixed(2)}
                            usd={((item.tokenPrice ?? 0) * item.amount).toFixed(2)}
                            percent={(item.percent || 0).toFixed(1)}
                            rate={item.per_24}
                            img={item.coins.coinUrl} />
                    })}
                </div> : <Loader />
        }</>

}


export default Statistic;