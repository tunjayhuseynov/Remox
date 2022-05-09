import { useEffect, useState, useRef } from "react";
import { Tag } from "apiHooks/useTags";
import { IFormattedTransaction } from "hooks/useTransactionProcess";
import { Chart as ChartJs } from 'chart.js';
import Chartjs from "components/general/chart";
import useInsight from "apiHooks/useInsight";

export type ATag = Tag & { txs: IFormattedTransaction[], totalAmount: number }

const Boxmoney = ({ insight }: { insight: ReturnType<typeof useInsight> }) => {
    const {
        lastIn,
        lastOut,
        accountInTag: inTags,
        accountOutTag: outTags
    } = insight;

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

    useEffect(() => {
        if (lastIn !== undefined && inTags) {
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
        if (lastOut !== undefined && outTags) {
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
            chart: <Chartjs data={data} ref={chartjs} dispatch={setSelectedCoin} items={inTags as any} />,
            tagList: inTags,
            tags: <div className="flex flex-col gap-3 pt-2 ">
                {inTags?.map((tag, index) => {
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
            chart: <Chartjs data={data2} ref={chartjs2} dispatch={setSelectedCoin2} items={outTags as any} />,
            tagList: outTags,
            tags: <div className="flex flex-col gap-3 pt-2 "  >
                {outTags?.map((tag, index) => {
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