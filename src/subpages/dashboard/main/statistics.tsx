import { useEffect, useMemo, useState, useRef, useCallback } from "react";
import { ClipLoader } from "react-spinners";
import { IBalanceItem, ICurrencyInternal, SelectBalances, SelectCurrencies, SelectTotalBalance } from '../../../redux/reducers/currencies';
import { useAppSelector } from '../../../redux/hooks';
import CoinItem from './coinitem';
import { SelectSelectedAccount } from "../../../redux/reducers/selectedAccount";
import useTransactionProcess, { ERC20MethodIds, IBatchRequest, ITransfer } from "hooks/useTransactionProcess";
import { fromWei } from "web3-utils";
import { Chart as ChartJs, Tooltip, Title, ArcElement, Legend } from 'chart.js';
import Chartjs from "components/general/chart";
import useModalSideExit from 'hooks/useModalSideExit';
import { AltCoins, CoinsName } from "types";
import { getElementAtEvent } from "react-chartjs-2";

ChartJs.register(
    Tooltip, Title, ArcElement, Legend
);

interface Balance {
    amount: number,
    per_24?: number,
    percent: number,
    coins: AltCoins,
    tokenPrice: number | undefined
};

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
    const [customRef] = useModalSideExit<string>(selectcoin, setSelectcoin, "")
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

    const onHover = useCallback((ref: any, item: any, dispatch: any) => {
        return (event: any) => {
            const el = getElementAtEvent((ref as any).current as any, event)
            if (el.length > 0 && el[0].index > 0) {
                const index = el[0].index ?? 1;
                dispatch(item[index].name);
                (ref as any).current.setActiveElements([{ datasetIndex: 0, index: index }])
            } else {
                (ref as any).current.setActiveElements([])
                dispatch("");
            }
            (ref as any).current.update()
        }
    }, [])

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
    }, [balanceRedux, selectedAccount])


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
        if (balanceRedux) {
            setAllInOne(Object.values(balanceRedux).sort((a, b) => (b.amount * b.tokenPrice).toLocaleString().localeCompare((a.amount * a.tokenPrice).toLocaleString())).slice(0, 4))
        }
    }, [balanceRedux, selectedAccount])

    useEffect(() => {
        if (transactions) {
            let myin = 0;
            let myout = 0;
            transactions.forEach(t => {
                let feeToken = Object.entries(CoinsName).find(w => w[0] === t.rawData.tokenSymbol)?.[1]
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
    }, [transactions, currencies, selectedAccount])

    useEffect(() => {
        if (allInOne !== undefined) {
            const label: string[] = []
            const amount: number[] = []
            const color: string[] = []
            for (let i = 0; i < allInOne.length; i++) {
                if (parseFloat(((allInOne[i].tokenPrice ?? 0) * allInOne[i].amount).toFixed(2)) !== 0) {
                    label[i] = allInOne[i].coins.name
                    color[i] = allInOne[i].coins.color
                    amount[i] = parseFloat(((allInOne[i].tokenPrice ?? 0) * allInOne[i].amount).toFixed(2))
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
    }, [allInOne, selectedAccount])

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
                <Chartjs data={data} ref={chartjs} onClickEvent={onHover(chartjs, allInOne, setSelectcoin)} />
            </div>
        </div>
        {
            balance && allInOne !== undefined ?
                <div className="flex flex-col gap-9 overflow-hidden col-span-2 sm:col-span-1 px-4" ref={customRef}>
                    {allInOne.map((item, index) => {
                        return <CoinItem key={item.coins.contractAddress} setSelectcoin={setSelectcoin} onClick={() => {
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
                </div> : <ClipLoader />
        }</>

}


export default Statistic;