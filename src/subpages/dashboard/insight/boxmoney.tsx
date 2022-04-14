import { useEffect, useMemo, useState, useRef, useCallback } from "react";
import { useAppSelector } from '../../../redux/hooks';
import { selectTags } from "redux/reducers/tags";
import { useCalculation, useTransaction, useTransactionProcess } from "hooks";
import { Tag } from "API/useTags";
import { ERC20MethodIds, IBatchRequest, IFormattedTransaction, ITransfer } from "hooks/useTransactionProcess";
import { CoinsName } from "types";
import date from 'date-and-time'
import { Chart as ChartJs } from 'chart.js';
import Chartjs from "components/general/chart";
import useModalSideExit from 'hooks/useModalSideExit'
import useBalance from "API/useBalance";
import { fromWei } from "utils/ray";
import useCurrency from "API/useCurrency";
import { getElementAtEvent } from "react-chartjs-2";

type ATag = Tag & { txs: IFormattedTransaction[], totalAmount: number }
type STag = Array<ATag>

const Boxmoney = ({ selectedDate, selectedAccounts }: { selectedDate: number, selectedAccounts: string[] }) => {
    const [data, setData] = useState({
        datasets: [{
            data: [0],
            backgroundColor: [""],
            borderWidth: 0,
            hoverOffset: 0,
        },],
        labels: [
            ''
        ],
    });
    const [data2, setData2] = useState({
        datasets: [{
            data: [0],
            backgroundColor: [""],
            borderWidth: 0,
            hoverOffset: 0,
        },],
        labels: [
            ''
        ],
    });

    const chartjs = useRef<ChartJs>(null)
    const chartjs2 = useRef<ChartJs>(null)

    const [selectedCoin, setSelectedCoin] = useState<string>("")
    const [selectedCoin2, setSelectedCoin2] = useState<string>("")

    const onHover = useCallback((ref, item, dispatch) => {
        return (event: any) => {
            const el = getElementAtEvent((ref as any).current as any, event)
            if (el.length > 0 && el[0].index > 0) {
                const index = el[0].index ?? 1;
                dispatch(item[index].id);
                (ref as any).current.setActiveElements([{ datasetIndex: 0, index: index }])
            } else {
                (ref as any).current.setActiveElements([])
                dispatch("");
            }
            (ref as any).current.update()
        }
    }, [])


    const customRef = useModalSideExit<string>(selectedCoin, setSelectedCoin, "")
    const customRef2 = useModalSideExit<string>(selectedCoin2, setSelectedCoin2, "")

    const { fetchedBalance } = useBalance(selectedAccounts)
    const fetchedCurrencies = useCurrency()
    const { AllPrices } = useCalculation(fetchedBalance, fetchedCurrencies)

    const currencies = AllPrices

    const { list: transactions } = useTransaction(selectedAccounts)

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
                    const tx = transactions!.find((s: IFormattedTransaction) => s.rawData.hash.toLowerCase() === transaction.toLowerCase())
                    if (tx && currencies) {
                        const tTime = new Date(parseInt(tx.rawData.timeStamp) * 1e3)
                        if (Math.abs(date.subtract(new Date(), tTime).toDays()) <= selectedDate) {
                            let amount = 0;
                            if (tx.id === ERC20MethodIds.transfer || tx.id === ERC20MethodIds.transferFrom || tx.id === ERC20MethodIds.transferWithComment) {
                                const txm = tx as ITransfer;
                                amount += (Number(fromWei(txm.amount)) * Number(currencies[txm.rawData.tokenSymbol]?.price ?? 1));
                            }
                            if (tx.id === ERC20MethodIds.noInput) {
                                amount += (Number(fromWei(tx.rawData.value)) * Number(currencies[tx.rawData.tokenSymbol]?.price ?? 1));
                            }
                            if (tx.id === ERC20MethodIds.batchRequest) {
                                const txm = tx as IBatchRequest;
                                txm.payments.forEach(transfer => {
                                    amount += (Number(fromWei(transfer.amount)) * Number(currencies[transfer.coinAddress.name]?.price ?? 1));
                                })
                            }
                            if (selectedAccounts.some(s => s.toLowerCase() === tx.rawData.from.toLowerCase())) {
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
                if (Math.abs(date.subtract(new Date(), tTime).toDays()) <= selectedDate && currencies) {
                    let calc = 0;
                    if (t.id === ERC20MethodIds.transfer || t.id === ERC20MethodIds.transferFrom || t.id === ERC20MethodIds.transferWithComment) {
                        const tx = t as ITransfer;
                        calc += (Number(fromWei(tx.amount)) * Number(currencies[tx.rawData.tokenSymbol]?.price ?? 1));
                    }
                    if (t.id === ERC20MethodIds.noInput) {
                        calc += (Number(fromWei(t.rawData.value)) * Number(currencies[t.rawData.tokenSymbol]?.price ?? 1));
                    }
                    if (t.id === ERC20MethodIds.batchRequest) {
                        const tx = t as IBatchRequest;
                        tx.payments.forEach(transfer => {
                            calc += (Number(fromWei(transfer.amount)) * Number(currencies[transfer.coinAddress.name]?.price ?? 1));
                        })
                    }
                    if (selectedAccounts.some(s => s.toLowerCase() === t.rawData.from.toLowerCase())) {
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

    useEffect(() => {
        if (lastIn !== undefined) {
            const label: string[] = [];
            const amount: number[] = [];
            const color: string[] = [];
            for (var i = 0; i < inTags.length; i++) {
                if (inTags[i].totalAmount !== 0) {
                    label[i] = (inTags[i].name)
                    color[i] = (inTags[i].color)
                    amount[i] = (inTags[i].totalAmount)
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
    }, [inTags, lastIn])

    useEffect(() => {
        if (lastOut !== undefined) {
            const label: string[] = [];
            const amount: number[] = [];
            const color: string[] = [];
            for (var i = 0; i < outTags.length; i++) {
                if (outTags[i].totalAmount !== 0) {
                    label[i] = (outTags[i].name)
                    color[i] = (outTags[i].color)
                    amount[i] = (outTags[i].totalAmount)
                }
            }
            setData2(
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
    }, [outTags, lastOut])
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

    const UpdateChartAnimation2 = (index?: number) => {
        if (chartjs2.current) {
            if (index || index === 0) {
                chartjs2.current.setActiveElements([{ datasetIndex: 0, index: index }])
            } else {
                chartjs2.current.setActiveElements([])
            }
            chartjs2.current.update()
        }
    }

    useEffect(() => {
        if (!selectedCoin) {
            UpdateChartAnimation()
        }
        if (!selectedCoin2) {
            UpdateChartAnimation2()
        }
    }, [selectedCoin, selectedCoin2])

    const boxmoneydata = [
        {
            id: 1,
            header: "Money in",
            headermoney: lastIn?.toFixed(2),
            chart: <Chartjs data={data} ref={chartjs} onClickEvent={onHover(chartjs, inTags, setSelectedCoin)} />,
            tagList: inTags,
            tags: <div className="flex flex-col gap-3 pt-2 " ref={customRef}>
                {inTags.map((tag, index) => {
                    return <div key={tag.id} className={`flex ${selectedCoin === tag.id && tag.totalAmount !== 0 && "shadow-[1px_1px_8px_3px_#dad8d8] dark:shadow-[1px_1px_14px_2px_#0000008f] rounded-xl"} p-[2px] px-2 space-x-3 justify-between cursor-pointer`} onMouseOver={() => {
                        setSelectedCoin(tag.id)
                        if (chartjs.current && tag.totalAmount !== 0) {
                            UpdateChartAnimation(index)
                        }

                    }} onMouseLeave={() => {
                        UpdateChartAnimation()
                        setSelectedCoin("")
                    }}><div className="flex items-center"><div className="w-[0.625rem] h-[0.625rem] rounded-full " style={{ backgroundColor: tag.color }}></div><p className="font-bold pl-2 truncate">{tag.name}</p></div><p className="text-gray-500 font-bold">$ {tag.totalAmount.toFixed(2)}</p></div>
                })}
            </div>
        },
        {
            id: 2,
            header: "Money out",
            headermoney: lastOut?.toFixed(2),
            chart: <Chartjs data={data2} ref={chartjs2} onClickEvent={onHover(chartjs2, outTags, setSelectedCoin2)} />,
            tagList: outTags,
            tags: <div className="flex flex-col gap-3 pt-2 " ref={customRef2} >
                {outTags.map((tag, index) => {
                    return <div key={tag.id} className={`flex ${selectedCoin2 === tag.id && tag.totalAmount !== 0 && "shadow-[1px_1px_8px_3px_#dad8d8] dark:shadow-[1px_1px_14px_2px_#0000008f] rounded-xl"} p-[2px] px-2 space-x-3 justify-between cursor-pointer`} onMouseOver={() => {
                        setSelectedCoin2(tag.id)
                        if (chartjs2.current && tag.totalAmount !== 0) {
                            UpdateChartAnimation2(index)
                        }
                    }} onMouseLeave={() => {
                        UpdateChartAnimation2()
                        setSelectedCoin2("")
                    }}><div className="flex items-center"><div className="w-[0.625rem] h-[0.625rem] rounded-full " style={{ backgroundColor: tag.color }}></div><p className="font-bold pl-2 truncate">{tag.name}</p></div><p className="text-gray-500 font-bold">$ {tag.totalAmount.toFixed(2)}</p></div>
                })}
            </div>
        },
    ]

    return <>
        {boxmoneydata.map((a) => {
            return <div key={a.id} className="mb-10">
                <h1 className="text-xl mb-4 font-semibold ">{a.header}</h1>
                <div className="grid grid-cols-2 gap-x-10 px-8 py-5 bg-white dark:bg-darkSecond  drop-shadow-xl rounded-xl">
                    <div className="flex flex-col">
                        <div className="flex flex-col"><h1 className="font-bold text-4xl ">$ {a.headermoney}</h1><p className="text-gray-500  pt-2 text-sm">Total {a.header}</p></div>
                        <div>
                            {a.tags}
                        </div>
                    </div>
                    <div className="h-full w-full" >
                        {a.chart}
                    </div>
                </div>
            </div>
        })}
    </>
}

export default Boxmoney