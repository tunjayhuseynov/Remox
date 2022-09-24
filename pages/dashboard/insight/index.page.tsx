import { useState } from "react";
import { useSelector } from "react-redux";
import useMultiWallet from "hooks/useMultiWallet";
import { useAppSelector } from "redux/hooks";
import { SelectDarkMode, SelectFiatSymbol } from 'redux/slices/account/remoxData';
import { CSVLink } from "react-csv";
import AllCharts from "./_components/allCharts";


export interface ILabels {
    name: string,
    value: number,
    percent: number,
    transactions: number,
}[]

export interface ISubbudgets {
    name: string,
    amount: {
        coinUrl: string,
        value: number,
        percent: number,
        transaction: number,
    },
    amount2?: {
        coinUrl: string,
        value: number,
        percent: number,
        transaction: number,
    },
}[]


export interface IBudgets {
    name: string,
    totalSpend: number,
    transaction: number,
    startTime: string,
    endTime: string,
    amount: {
        coinUrl: string,
        value: number,
        percent: number,
        transactions: number,
    },
    amount2?: {
        coinUrl: string,
        value: number,
        percent: number,
        transactions: number,
    },

    subbudgets: ISubbudgets[],
    labels: ILabels[]
}[]

interface IInsightData {
    totalSpend: number,
    Tokens: {
            value: number,
            image: string,
            name:string,
            usdValue: number,
        }[]

    
    totalTransactions: number,

}


const Insight = () => {
    const darkMode = useSelector(SelectDarkMode)
    const { data: wallets } = useMultiWallet()
    const [selectedDate, setSelectedDate] = useState<number>(30)
    const { data } = useMultiWallet()
    // const [selectedAccounts, setSelectedAccounts] = useState<string[]>(data?.map(s => s.address) ?? [selectedAccount])
    // const [changedAccount, setChangedAccount] = useState<string[]>(wallets?.map(s => s.address) ?? [selectedAccount])
    // const insight = useInsight({ selectedDate, selectedAccounts })


    // useEffect(() => {
    //     if (data !== undefined) {
    //         setSelectedAccounts(data.map(s => s.address))
    //     }
    // }, [data])

    const InsightData:IInsightData = {
        totalSpend: 1500000,
        Tokens: [
            {
                value: 0.1,
                image: 'celodollar',
                name: 'CELO',
                usdValue: 500,
            },
            {
                value: 23,
                image: 'celodollar',
                name: 'CELO',
                usdValue: 354,
            },
    
        ],
        totalTransactions: 234,
    }

    const Budgets: IBudgets[] = [
        {
            name: 'Product',
            totalSpend: 1000000,
            transaction: 50,
            startTime: 'May 2022',
            endTime: 'May 2023',
            amount: {
                coinUrl: 'celodollar',
                value: 544.730,
                percent: 68,
                transactions: 14,
            },
            amount2: {
                coinUrl: 'celoiconsquare',
                value: 544.730,
                percent: 68,
                transactions: 14,
            },
            subbudgets: [
                {
                    name: 'SubProduct',
                    amount: {
                        coinUrl: 'celodollar',
                        value: 30,
                        percent: 82,
                        transaction: 35,
                    },
                },
                {
                    name: 'subEvent',
                    amount: {
                        coinUrl: 'celodollar',
                        value: 30,
                        percent: 82,
                        transaction: 35,
                    },
                    amount2: {
                        coinUrl: 'celodollar',
                        value: 750,
                        percent: 82,
                        transaction: 35,
                    },
                },
            ],
            labels: [
                {
                    name: 'budgetLabel',
                    value: 30,
                    percent: 76,
                    transactions: 20,
                },
                {
                    name: 'Target',
                    value: 30,
                    percent: 35,
                    transactions: 21,
                },
            ],

        },
        {
            name: 'Operation',
            totalSpend: 300000,
            transaction: 35,
            startTime: 'Apr 2022',
            endTime: 'Apr 2023',
            amount: {
                coinUrl: 'celodollar',
                value: 7557.30,
                percent: 82,
                transactions: 35,
            },
            subbudgets: [
                {
                    name: 'subOperation',
                    amount: {
                        coinUrl: 'celodollar',
                        value: 30,
                        percent: 88,
                        transaction: 57
                    },
                },
                {
                    name: 'subEvent',
                    amount: {
                        coinUrl: 'celodollar',
                        value: 30,
                        percent: 52,
                        transaction: 57
                    },
                    amount2: {
                        coinUrl: 'celodollar',
                        value: 750,
                        percent: 82,
                        transaction: 75
                    },
                },
            ],
            labels: [
                {
                    name: 'labelOperation',
                    value: 30,
                    percent: 30,
                    transactions: 30,
                },
                {
                    name: 'Target',
                    value: 30,
                    percent: 30,
                    transactions: 30,
                },
            ],

        }
    ]

    const symbol = useAppSelector(SelectFiatSymbol)

    return (
        <div className="flex flex-col space-y-3">
            <div className="flex justify-between pb-4">
                <div className="text-4xl font-bold">Insights</div>
                <div className="flex gap-2">
                    {<> <div className="">
                        <CSVLink data={''} className="font-normal   py-2 px-4 rounded-xl cursor-pointer flex justify-center items-center bg-white dark:bg-darkSecond xl:space-x-5">
                            <div className={'hidden'}>Export</div>
                            <img className={`w-[1.5rem] h-[1.5rem] !m-0 `} src={darkMode ? '/icons/import_white.png' : '/icons/import.png'} alt='Import' />
                        </CSVLink>
                    </div></>}
                </div>
            </div>
            <div className=" px-5 w-full mt-6">
                <div className="grid grid-cols-[24%,60%,16%] w-[95%]  mb-10">
                    <div className='flex flex-col  gap-12 lg:gap-4 pr-6 border-r'>
                        <div className='text-xl font-semibold text-greylish dark:text-white'>Total Spending </div>
                        <div className='text-3xl font-bold !mt-0'>${Number(InsightData.totalSpend.toFixed(2)).toLocaleString()} USD</div>
                    </div>
                    <div className="flex flex-col gap-4  pl-6 border-r">
                        <div className='text-xl font-semibold text-greylish dark:text-white'>Token Allocation</div>
                        <div className='grid grid-cols-4 gap-4'>
                            {InsightData.Tokens.map((item, i) => {
                                return <div key={i} className="flex flex-col">
                                    <div className="flex items-center gap-1">
                                        <div className="font-bold text-xl">{item.value}</div>
                                        <div className="font-bold text-xl flex gap-1 items-center">
                                            <img src={`/icons/currencies/${item.image}.svg`} className="w-[1.563rem] h-[1.563rem] rounded-full" alt="" />
                                            {item.name}</div>
                                    </div>
                                    <div className=" text-sm text-greylish dark:text-white opacity-75 text-left">
                                        ${item.usdValue} {symbol}
                                    </div>
                                </div>
                            })}
                        </div>
                    </div>
                    <div className='flex flex-col pl-6'>
                        <div className='text-xl font-semibold text-greylish dark:text-white'>Total Transactions </div>
                        <div className='text-3xl font-bold !mt-0'>239</div>
                    </div>
                </div>
            </div>
            <AllCharts budgets={Budgets} />
        </div>
    );
}

export default Insight;