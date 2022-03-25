import { useEffect, useMemo, useState } from "react";
import { IBalanceItem, ICurrencyInternal, SelectBalances, SelectCurrencies, SelectTotalBalance } from '../../../redux/reducers/currencies';
import { useAppSelector } from '../../../redux/hooks';
import { selectTags } from "redux/reducers/tags";
import { useTransactionProcess } from "hooks";
import { Tag } from "API/useTags";
import { useSelector } from "react-redux";
import { SelectSelectedAccount } from "redux/reducers/selectedAccount";
import { ERC20MethodIds, IBatchRequest, IFormattedTransaction, ITransfer } from "hooks/useTransactionProcess";
import { fromWei } from "web3-utils";
import { CoinsName } from "types";
import date from 'date-and-time'

type ATag = Tag & { txs: IFormattedTransaction[], totalAmount: number }
type STag = Array<ATag>

const Boxmoney = ({ selectedDate }: { selectedDate: number }) => {

    const selectedAccount = useSelector(SelectSelectedAccount)
    const currencies = useSelector(SelectCurrencies)

    let [transactions] = useTransactionProcess()
    let tags = useAppSelector(selectTags)

    const [lastIn, setIn] = useState<number>()
    const [lastOut, setOut] = useState<number>();

    const [inTags, setInTags] = useState<STag>([])
    const [outTags, setOutTags] = useState<STag>([])

    useEffect(() => {
        if (transactions) {
            let outATag: ATag[] = []
            let inATag: ATag[] = []
            tags.forEach((tag: Tag) => {
                let newInTag: ATag;
                let newOutTag: ATag;
                newInTag = {
                    ...tag,
                    txs: [],
                    totalAmount: 0
                }
                newOutTag = {
                    ...tag,
                    txs: [],
                    totalAmount: 0
                }
                tag.transactions.forEach(transaction => {
                    const tx = transactions!.find(s => s.rawData.hash.toLowerCase() === transaction.toLowerCase())
                    if (tx) {
                        const tTime = new Date(parseInt(tx.rawData.timeStamp) * 1e3)
                        if (Math.abs(date.subtract(new Date(), tTime).toDays()) <= selectedDate) {
                            let amount = 0;
                            if (tx.id === ERC20MethodIds.transfer || tx.id === ERC20MethodIds.transferFrom || tx.id === ERC20MethodIds.transferWithComment) {
                                const txm = tx as ITransfer;
                                amount += (Number(fromWei(txm.amount, "ether")) * Number(currencies[txm.rawData.tokenSymbol]?.price ?? 1));
                            }
                            if (tx.id === ERC20MethodIds.noInput) {
                                amount += (Number(fromWei(tx.rawData.value, "ether")) * Number(currencies[tx.rawData.tokenSymbol]?.price ?? 1));
                            }
                            if (tx.id === ERC20MethodIds.batchRequest) {
                                const txm = tx as IBatchRequest;
                                txm.payments.forEach(transfer => {
                                    amount += (Number(fromWei(transfer.amount, "ether")) * Number(currencies[transfer.coinAddress.name]?.price ?? 1));
                                })
                            }


                            if (tx.rawData.from.toLowerCase() === selectedAccount.toLowerCase()) {
                                newOutTag.txs.push(tx)
                                newOutTag.totalAmount += amount
                            } else {
                                newInTag.txs.push(tx)
                                newInTag.totalAmount += amount
                            }
                        }
                    }
                })
                inATag.push(newInTag)
                outATag.push(newOutTag)
            })

            setInTags(inATag)
            setOutTags(outATag)
        }
    }, [transactions, tags, selectedDate])

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

    const inChart = useMemo(() => {
        if (lastIn !== undefined) {
            let grad = "conic-gradient("
            let startDeg = 0;
            inTags.forEach(tag => {
                if(lastIn !== 0){
                    let calc = tag.totalAmount;
                    const deg = Math.floor(3.6 * ((calc * 100) / lastIn))
                    grad += `${tag.color} ${startDeg}deg ${startDeg + deg}deg,`
                    startDeg += deg;
                }
            })
            if (startDeg < 360) {
                grad += `#FF7348 ${startDeg}deg 360deg`
            }
            if (grad[grad.length - 1] === ',') {
                grad = grad.slice(0, -1)
            }
            grad += ')'

            return grad
        }
    }, [inTags, lastIn])

    const outChart = useMemo(() => {
        if (lastOut !== undefined) {
            let grad = "conic-gradient(" 
            let startDeg = 0;
            outTags.forEach(tag => {
                if(lastOut !== 0){
                    let calc = tag.totalAmount; 
                    const deg = Math.floor(3.6 * ((calc * 100) / lastOut))
                    grad += `${tag.color} ${startDeg}deg ${startDeg + deg}deg,`
                    startDeg = deg;
                }
            })
            if (startDeg < 360) {
                grad += `#FF7348 ${startDeg}deg 360deg`
            }
            if (grad[grad.length - 1] === ',') {
                grad = grad.slice(0, -1)
            }
            grad += ')'

            return grad
        }
    }, [outTags, lastOut])


    const boxmoneydata = [
        {
            id: 1,
            header: "Money in",
            headermoney: lastIn?.toFixed(2),
            chart: inChart,
            tagList: inTags,
            tags: <>
                {inTags.map(tag => {
                    return <div key={tag.id} className="flex space-x-3 justify-between"><div className="flex items-center"><div className="w-[0.625rem] h-[0.625rem] rounded-full " style={{ backgroundColor: tag.color }}></div><p className="font-bold pl-2 truncate">{tag.name}</p></div><p className="text-gray-500 font-bold">$ {tag.totalAmount.toFixed(2)}</p></div>
                })}
            </>
        },
        {
            id: 2,
            header: "Money out",
            headermoney: lastOut?.toFixed(2),
            chart: outChart,
            tagList: outTags,
            tags: <>
                {outTags.map(tag => {
                    return <div key={tag.id} className="flex space-x-3 justify-between"><div className="flex items-center"><div className="w-[0.625rem] h-[0.625rem] rounded-full " style={{ backgroundColor: tag.color }}></div><p className="font-bold pl-2 truncate">{tag.name}</p></div><p className="text-gray-500 font-bold">$ {tag.totalAmount.toFixed(2)}</p></div>
                })}
            </>
        },
    ]
    return <>
        {boxmoneydata.map((a) => {
            return <div key={a.id} className="mb-10">
                <h1 className="text-xl mb-4 font-semibold ">{a.header}</h1>
                <div className="grid grid-cols-2 gap-x-10 px-8 py-5 bg-white dark:bg-darkSecond  drop-shadow-xl rounded-xl">
                    <div className="flex flex-col">
                        <div className="flex flex-col"><h1 className="font-bold text-4xl ">$ {a.headermoney}</h1><p className="text-gray-500  pt-2 text-sm">Total {a.header}</p></div>
                        <div className="flex flex-col gap-4 pt-3 ">
                            {a.tags}
                        </div>
                    </div>
                     <div className="aspect-square rounded-full relative" style={{
                        background: a.chart
                    }}>
                        <div className="w-[50%] h-[50%] bg-white dark:bg-darkSecond  left-1/2 top-1/2 absolute -translate-x-1/2 -translate-y-1/2 rounded-full"></div>
                    </div> 
                </div>
            </div>
        })}
    </>
}

export default Boxmoney