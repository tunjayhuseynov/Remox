import { useAppSelector } from '../../../redux/hooks';
import { ClipLoader } from "react-spinners";
import { useEffect, useMemo, useState } from "react";
import { SelectSelectedAccount } from "../../../redux/reducers/selectedAccount";
import { CoinsName } from '../../../types/coins';
import { IBalanceItem, ICurrencyInternal, SelectBalances, SelectCurrencies, SelectTotalBalance } from '../../../redux/reducers/currencies';
import { useTransactionProcess } from 'hooks';
import { ERC20MethodIds, IBatchRequest, IFormattedTransaction, ITransfer } from 'hooks/useTransactionProcess';
import date from 'date-and-time'
import { fromWei } from 'web3-utils';

const Boxinsight = ({ selectedDate }: { selectedDate: number }) => {

    const selectedAccount = useAppSelector(SelectSelectedAccount)
    const [transactions] = useTransactionProcess()
    const balanceRedux = useAppSelector(SelectBalances)
    const currencies = useAppSelector(SelectCurrencies)
    let totalBalance = useAppSelector(SelectTotalBalance)


    const [lastIn, setIn] = useState<number>(0)
    const [lastOut, setOut] = useState<number>(0);

    const averageSpending = useMemo(() => {
        if (transactions && transactions.length > 0) {
            //average monthly spending 
            let average = 0;
            let oldest: IFormattedTransaction = transactions[0];

            let timeIndex = Math.ceil(new Date().getTime() / 1000);
            transactions.forEach(transaction => {
                if (Number(transaction.rawData.timeStamp) < timeIndex) {
                    timeIndex = Number(transaction.rawData.timeStamp);
                    oldest = transaction;
                }
                if (transaction.rawData.from.toLowerCase() === selectedAccount.toLowerCase()) {
                    if (transaction.id === ERC20MethodIds.transfer || transaction.id === ERC20MethodIds.transferFrom || transaction.id === ERC20MethodIds.transferWithComment) {
                        const tx = transaction as ITransfer;
                        average += (Number(fromWei(tx.amount, "ether")) * Number(currencies[tx.rawData.tokenSymbol]?.price ?? 1));
                    }
                    if (transaction.id === ERC20MethodIds.noInput) {
                        average += (Number(fromWei(transaction.rawData.value, "ether")) * Number(currencies[transaction.rawData.tokenSymbol]?.price ?? 1));
                    }
                    if (transaction.id === ERC20MethodIds.batchRequest) {
                        const tx = transaction as IBatchRequest;
                        tx.payments.forEach(transfer => {
                            average += (Number(fromWei(transfer.amount, "ether")) * Number(currencies[transfer.coinAddress.name]?.price ?? 1));
                        })
                    }
                }
            })
            const days = date.subtract(new Date(), new Date(Number(oldest.rawData.timeStamp) * 1000)).toDays()
            const months = Math.ceil(Math.abs(days) / 30)
            return average / months;
        } else return 0
    }, [transactions])


    const months = useMemo(() => {
        if (transactions && transactions.length > 0) {
            let oldest: IFormattedTransaction = transactions[0];

            let timeIndex = Math.ceil(new Date().getTime() / 1000);
            transactions.forEach(transaction => {
                if (Number(transaction.rawData.timeStamp) < timeIndex) {
                    timeIndex = Number(transaction.rawData.timeStamp);
                    oldest = transaction;
                }
            })

            return Math.abs(date.subtract(new Date(), new Date(Number(oldest.rawData.timeStamp) * 1000)).toDays()) / 30
        } else return 0
    }, [transactions])

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
        if (transactions) {
            let myin = 0;
            let myout = 0;
            transactions.forEach(t => {
                let feeToken = Object.entries(CoinsName).find(w => w[0] === t.rawData.tokenSymbol)?.[1]
                const tTime = new Date(parseInt(t.rawData.timeStamp) * 1e3)
                if (Math.abs(date.subtract(new Date(), tTime).toDays()) <= selectedDate) {
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
    }, [transactions, currencies, selectedDate])

    const boxdata = [
        {
            id: '1',
            header: "Actual total balance",
            interest: percent ? `${percent}` : undefined,
            money: totalBalance?.toFixed(2),
        },
        {
            id: '2',
            header: "Money in",
            money: lastIn?.toFixed(2),
        },
        {
            id: '3',
            header: "Money out",
            money: lastOut?.toFixed(2),
        },
        {
            id: 4,
            header: "Net change",
            money: lastIn && lastOut ? `${(lastIn - lastOut).toFixed(2)}` : '',
        },
        {
            id: 5,
            header: "Average monthly spending",
            money: averageSpending?.toFixed(2)
        },
        {
            id: 6,
            header: "Runway",
            text: months?.toFixed(1),
            endnum: "Months",
        },
    ]

    return <>
        {boxdata.map((w) => {
            return <div key={w.id} className="bg-greylish bg-opacity-10 dark:bg-darkSecond rounded-xl h-[100px]  p-3  ">
                <div className="flex justify-between">
                    <p className="font-bold text-sm">{w.header}</p><p style={
                        w.interest && parseFloat(w.interest) !== 0 ? parseFloat(w.interest) > 0 ? { color: 'green' } : { color: 'red' } : { color: 'black' }
                    }>
                        {w.interest && parseFloat(w.interest) !== 0 ? `${parseFloat(w.interest).toFixed(2)}%` : ''}
                    </p>
                </div>
                <h1 className="text-3xl pl-2 pt-4 font-bold">{w.text} {w.money ? <span>${w.money.split('.')[0]}{w.money.split('.')[1] && <span className="text-greylish text-lg">.{w.money.split('.')[1]}</span>} </span> : !w.text && <ClipLoader size={'24px'} />}  {w.endnum && <span className="text-greylish opacity-80 tracking-wider text-xl">{w.endnum}</span>}</h1>
            </div>
        })}

    </>

}

export default Boxinsight 