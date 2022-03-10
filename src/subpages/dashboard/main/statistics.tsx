import { useEffect, useMemo, useState } from "react";
import { ClipLoader } from "react-spinners";
import { IBalanceItem, ICurrencyInternal, SelectBalances, SelectCurrencies, SelectTotalBalance } from '../../../redux/reducers/currencies';
import { AltCoins, Coins, CoinsName } from '../../../types/coins';
import { useAppSelector } from '../../../redux/hooks';
import CoinItem from './coinitem';
import { SelectSelectedAccount } from "../../../redux/reducers/selectedAccount";
import useTransactionProcess, { ERC20MethodIds, IBatchRequest, ITransfer } from "hooks/useTransactionProcess";
import { fromWei } from "web3-utils";

interface Balance {
    amount: number,
    per_24?: number,
    percent: number,
    coins: AltCoins,
    tokenPrice: number | undefined
}

const Statistic = () => {
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

    const chart = useMemo(() => {
        let deg = 0;
        let res = Object.values(all).sort((a,b)=>b.percent - a.percent).reduce((a: string, c: IBalanceItem, index: number, arr) => {
            if (index === 0) {
                deg = Math.ceil(c.percent * 3.6) + deg;
                a += `${c.coins.color} ${0}deg ${deg}deg,`
            }
            else {
                a += `${c.coins.color} ${deg}deg `
                deg = Math.ceil(c.percent * 3.6) + deg;
                a += `${deg}deg`

                if (index !== arr.length - 1) {
                    a += ','
                }
            }
            return a;
        }, "conic-gradient(")
        res += ')'

        if (res === "conic-gradient()") return `conic-gradient(#FF774E 0deg 360deg)`

        return res
    }, [balanceRedux])

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

    return <>
        <div className="col-span-2 flex flex-col">
            <div className="flex justify-between pl-4 h-[30px]">
                <div className="text-base text-greylish">Total Balance</div>
                <div className="text-base text-greylish opacity-70">24h</div>
            </div>
            <div className="flex justify-between shadow-custom dark:bg-darkSecond rounded-xl px-8 py-8">
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
            <div className="flex justify-between shadow-custom dark:bg-darkSecond rounded-xl px-8 py-4">
                <div className="text-xl sm:text-2xl opacity-80">
                    {lastIn !== undefined && transactions !== undefined && balance !== undefined ? `+ $${lastIn?.toFixed(2)}` : <ClipLoader />}
                </div>
            </div>
        </div>

        <div>
            <div className="flex justify-between sm:pl-4">
                <div className="text-greylish text-sm sm:text-base">Money out (c.m.)</div>
            </div>
            <div className="flex justify-between shadow-custom dark:bg-darkSecond rounded-xl px-8 py-4">
                <div className="text-greylish opacity-80 text-xl sm:text-2xl">
                    {lastOut !== undefined && transactions !== undefined && balance !== undefined ? `- $${lastOut?.toFixed(2)}` : <ClipLoader />}
                </div>
            </div>
        </div>

        <div className="sm:flex flex-col hidden">
            <div>Asset</div>
            <div className="h-full">
                {Object.values(balanceRedux).length > 0 ? <div className="aspect-square  rounded-full relative" style={{
                    background: chart
                }}>
                    <div className="w-[50%] h-[50%] bg-white dark:bg-dark  left-1/2 top-1/2 absolute -translate-x-1/2 -translate-y-1/2 rounded-full"></div>
                </div> : null}
            </div>
        </div>
        {
            balance && allInOne !== undefined ?
                <div className="flex flex-col gap-5 overflow-hidden col-span-2 sm:col-span-1">
                    {allInOne.map((item, index) => {
                        return <CoinItem key={item.coins.contractAddress} title={item.coins.name} coin={item.amount.toFixed(2)} usd={((item.tokenPrice ?? 0) * item.amount).toFixed(2)} percent={(item.percent || 0).toFixed(1)} rate={item.per_24} img={item.coins.coinUrl} />
                    })}
                </div> : <ClipLoader />
        }</>

}


export default Statistic;