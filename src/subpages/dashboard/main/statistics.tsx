import { useEffect, useMemo, useState, useRef } from "react";
import { ClipLoader } from "react-spinners";
import { IBalanceItem, ICurrencyInternal, SelectBalances, SelectCurrencies, SelectTotalBalance } from '../../../redux/reducers/currencies';
import { AltCoins, Coins, CoinsName } from '../../../types/coins';
import { useAppSelector } from '../../../redux/hooks';
import CoinItem from './coinitem';
import { SelectSelectedAccount } from "../../../redux/reducers/selectedAccount";
import useTransactionProcess, { ERC20MethodIds, IBatchRequest, ITransfer } from "hooks/useTransactionProcess";
import { fromWei } from "web3-utils";
import { Chart as ChartJs, Tooltip, Title, ArcElement, Legend } from 'chart.js';
import { Doughnut, Chart } from 'react-chartjs-2';

ChartJs.register(
    Tooltip, Title, ArcElement, Legend
);

interface Balance {
    amount: number,
    per_24?: number,
    percent: number,
    coins: AltCoins,
    tokenPrice: number | undefined
}

const Statistic = () => {
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

    const [selectcoin, setSelectcoin] = useState<string>("")
    const selectedAccount = useAppSelector(SelectSelectedAccount)

    const [transactions] = useTransactionProcess()

    const [lastIn, setIn] = useState<number>()
    const [lastOut, setOut] = useState<number>();

    const [allInOne, setAllInOne] = useState<Balance[]>()

    let totalBalance = useAppSelector(SelectTotalBalance)
    let balance;
    if (totalBalance !== undefined) balance = parseFloat(`${totalBalance}`).toFixed(2)

    const currencies = useAppSelector(SelectCurrencies)

    const balanceRedux = useAppSelector(SelectBalances)

    const all = balanceRedux



    const percent = useMemo(() => {
        if (currencies && balanceRedux && balanceRedux.CELO) {
            const currencObj = Object.values(currencies)
            const currencObj2: IBalanceItem[] = Object.values(balanceRedux)

            let indexable = 0;
            const per = currencObj.reduce((a, c: ICurrencyInternal, index) => {
                if (currencObj2[index].amount > 0) {
                    a += c.percent_24
                    indexable++
                }
                return a;
            }, 0)

            return (per / indexable)
        }
    }, [balanceRedux])


    useEffect(() => {
        if (all) {
            setAllInOne(Object.values(all).sort((a, b) => (b.amount * b.tokenPrice).toLocaleString().localeCompare((a.amount * a.tokenPrice).toLocaleString())).slice(0, 4))
        }
    }, [all])

    useEffect(() => {
        if (transactions) {
            let myin = 0;
            let myout = 0;
            transactions.forEach(t => {
                let feeToken = Object.entries(CoinsName).find(w => w[0] === t.rawData.tokenSymbol)?.[1]
                const coin = feeToken ? Coins[feeToken] : Coins.cUSD;
                const tTime = new Date(parseInt(t.rawData.timeStamp) * 1e3)
                if (tTime.getMonth() === new Date().getMonth()) {
                    let calc = 0;
                    if (t.id === ERC20MethodIds.transfer || t.id === ERC20MethodIds.transferFrom || t.id === ERC20MethodIds.transferWithComment) {
                        const tx = t as ITransfer;
                        calc += (Number(fromWei(tx.amount, "ether")) * Number(currencies[tx.rawData.tokenSymbol]?.price ?? 1));
                    }
                    if (t.id === ERC20MethodIds.noInput) {
                        calc += (Number(fromWei(t.rawData.value, "ether")) * Number(currencies[t.rawData.tokenSymbol]?.price ?? 1));
                    }
                    if (t.id === ERC20MethodIds.batchRequest) {
                        const tx = t as IBatchRequest;
                        tx.payments.forEach(transfer => {
                            calc += (Number(fromWei(transfer.amount, "ether")) * Number(currencies[transfer.coinAddress.name]?.price ?? 1));
                        })
                    }
                    if (t.rawData.from.toLowerCase() === selectedAccount.toLowerCase()) {
                        myout += calc
                    } else {
                        myin += calc
                    }
                }
            })
            setIn(myin)
            setOut(myout)
        }
    }, [transactions, currencies])

    useEffect(() => {
        if (allInOne !== undefined) {
            const label: string[] = []
            const amount: number[] = []
            const color: string[] = []
            for (let i = 0; i < allInOne.length; i++) {
                label.push(allInOne[i].coins.name)
                amount.push(parseFloat(((allInOne[i].tokenPrice ?? 0) * allInOne[i].amount).toFixed(2)))
                color.push(allInOne[i].coins.color)
            }
            setData(
                {
                    datasets: [{
                        data: amount,
                        backgroundColor: color,
                        borderWidth: 0,
                        hoverOffset: 10,
                    },
                    ],
                    labels: label,
                },
            )
        }
    }, [allInOne])

    const options = {
        responsive: true,
        layout: {
            padding: 10,
        },
        plugins: {
            tooltip: {
                enabled: false
            },
            legend: {
                display: false,
            },
        }
    };
    return <>
        <div className="col-span-2 flex flex-col">
            <div className="flex justify-between pl-4 h-[1.875rem]">
                <div className="text-base text-greylish">Total Balance</div>
                <div className="text-base text-greylish opacity-70">24h</div>
            </div>
            <div className="flex justify-between shadow-custom bg-white dark:bg-darkSecond rounded-xl px-8 py-8">
                <div className="text-4xl">
                    {(balance && balanceRedux) || (balance !== undefined && parseFloat(balance) === 0 && balanceRedux) ? `$${balance}` : <ClipLoader />}
                </div>
                <div className="flex items-center text-3xl text-greylish opacity-70" style={
                    balance !== undefined && parseFloat(balance) !== 0 ? percent && percent > 0 ? { color: 'green' } : { color: 'red' } : { color: 'black' }
                }>
                    {balance !== undefined && parseFloat(balance) !== 0 ? percent ? `${percent.toFixed(2)}%` : <ClipLoader /> : '0%'}
                </div>
            </div>
        </div>

        <div>
            <div className="flex justify-between sm:pl-4">
                <div className="text-greylish text-sm sm:text-base">Money in (c.m.)</div>
            </div>
            <div className="flex justify-between shadow-custom bg-white dark:bg-darkSecond rounded-xl px-8 py-4">
                <div className="text-xl sm:text-2xl opacity-80">
                    {lastIn !== undefined && transactions !== undefined && balance !== undefined ? `+ $${lastIn?.toFixed(2)}` : <ClipLoader />}
                </div>
            </div>
        </div>

        <div>
            <div className="flex justify-between sm:pl-4">
                <div className="text-greylish text-sm sm:text-base">Money out (c.m.)</div>
            </div>
            <div className="flex justify-between shadow-custom bg-white dark:bg-darkSecond rounded-xl px-8 py-4">
                <div className="text-greylish opacity-80 text-xl sm:text-2xl">
                    {lastOut !== undefined && transactions !== undefined && balance !== undefined ? `- $${lastOut?.toFixed(2)}` : <ClipLoader />}
                </div>
            </div>
        </div>

        <div className="sm:flex flex-col hidden relative">
            <div>Asset</div>
            <div className="h-full w-full">
                <Chart type="doughnut" data={data} options={options} ref={chartjs} />
            </div>
        </div>
        {
            balance && allInOne !== undefined ?
                <div className="flex flex-col gap-9 overflow-hidden col-span-2 sm:col-span-1">
                    {allInOne.map((item, index) => {
                        return <CoinItem key={item.coins.contractAddress} setSelectcoin={setSelectcoin} onClick={() => {
                            setSelectcoin(item.coins.name);
                            if (chartjs.current) {
                                chartjs.current.setActiveElements([{ datasetIndex: 0, index: index }])
                                chartjs.current.update()
                            }
                        }} selectcoin={selectcoin} title={item.coins.name} coin={item.amount.toFixed(2)} usd={((item.tokenPrice ?? 0) * item.amount).toFixed(2)} percent={(item.percent || 0).toFixed(1)} rate={item.per_24} img={item.coins.coinUrl} />
                    })}
                </div> : <ClipLoader />
        }</>

}


export default Statistic;