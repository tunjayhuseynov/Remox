import { useEffect, useState } from "react";
import Boxinsight from "subpages/dashboard/insight/boxinsight";
import Boxmoney from "subpages/dashboard/insight/boxmoney";
import { WalletDropdown } from "components/general/walletdropdown"
import { useSelector } from "react-redux";
import { SelectSelectedAccount } from "redux/reducers/selectedAccount";
import useMultiWallet from "hooks/useMultiWallet";
import useInsight from "apiHooks/useInsight";
import Loader from "components/Loader";
import useMultisigProcess from "hooks/useMultisigProcess";
import { useAppSelector } from "redux/hooks";
import { selectDarkMode } from "redux/reducers/notificationSlice";
import { CSVLink } from "react-csv";
import LineChart from "components/general/Linechart";

const style = "py-2 bg-greylish bg-opacity-10 dark:bg-darkSecond px-5  rounded-xl hover:bg-gray-300 dark:hover:bg-greylish dark:focus:bg-greylish"

const Insight = () => {
    const darkMode = useSelector(selectDarkMode)
    const [isOpen, setOpen] = useState(false)
    const { data: wallets } = useMultiWallet()
    const { refetch, isMultisig } = useMultisigProcess()
    const [selectedDate, setSelectedDate] = useState<number>(30)
    const selectedAccount = useAppSelector(SelectSelectedAccount)
    const { data } = useMultiWallet()
    const [stream, setStream] = useState(false)
    const [selectedAccounts, setSelectedAccounts] = useState<string[]>(data?.map(s => s.address) ?? [selectedAccount])
    const [changedAccount, setChangedAccount] = useState<string[]>(wallets?.map(s => s.address) ?? [selectedAccount])
    const insight = useInsight({ selectedDate, selectedAccounts })
    useEffect(() => {
        if (data !== undefined) {
            setSelectedAccounts(data.map(s => s.address))
        }
    }, [data])




    const [datas, setData] = useState({
        colors: ['#ff501a'],

        grid: {
            show: false,
        },
        legend: {
            show: false,
            showForSingleSeries: false,
            showForNullSeries: false,
            showForZeroSeries: false,
        },
        yaxis: {
            show: false,
        },
        chart: {

            toolbar: {
                show: false,
            },
            zoom: {
                enabled: false
            }
        },

        dataLabels: {
            enabled: false,
        },
        stroke: {
            curve: "smooth",
        },

        xaxis: {
            type: "datetime",
            categories: [
                "1/22/20",
                "2/1/20",
                "2/15/20",
                "3/1/20",
                "3/15/20",
                "4/1/20",
                "4/15/20",
                "5/1/20",
                "5/7/20",
            ],
        },


    })


    return (
        <div className="flex flex-col space-y-3">
            <div className="flex justify-between pb-4">
                <div className="text-4xl font-bold">Insights</div>
                {/* <div className="flex gap-2">
                    {!isMultisig && <div className="mr-3">
                        <WalletDropdown selected={selectedAccount} onChange={(wallets) => {
                            setChangedAccount([...wallets.map((wallet) => wallet.address)])
                        }} />
                    </div>}
                    {!isMultisig && <> <div className="">
                        <CSVLink data={''} className="font-normal   py-2 px-4 rounded-xl cursor-pointer flex justify-center items-center bg-white dark:bg-darkSecond xl:space-x-5">
                            <div className={'hidden'}>Export</div>
                            <img className={`w-[1.5rem] h-[1.5rem] !m-0 `} src={darkMode ? '/icons/import_white.png' : '/icons/import.png'} alt='Import' />
                        </CSVLink>
                    </div></>}
                </div> */}
            </div>
            {/* <div className="rounded-xl shadow-custom px-5 w-full pb-10 pt-6 bg-white dark:bg-darkSecond ">
                <div className="flex w-[90%] justify-between">
                    <div className='flex  space-y-3 gap-12'>
                        <div className='flex flex-col space-y-5 gap-12 lg:gap-4'>
                            <div className='text-xl font-semibold'>Total Spending </div>
                            <div className='text-3xl font-bold !mt-0'>$5.000 USD</div>
                        </div>
                        <div className="flex flex-col space-y-5 !mt-0">
                            <div className='text-xl font-semibold'>Token Allocation</div>
                            <div className='grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-4 gap-12'>
                                <div className="flex space-x-2 relative h-fit">
                                    <div className="font-bold text-xl">{0.10}</div>
                                    <div className="font-bold text-xl flex gap-1 items-center">
                                        <img src="/icons/currencies/celodollar.svg" className="w-[1.563rem] h-[1.563rem] rounded-full" alt="" />
                                        {'CELO'}</div>
                                    <div>
                                    </div>
                                    <div className="absolute -left-1 -bottom-6 text-sm text-greylish opacity-75 text-left">
                                        $500 USD
                                    </div>
                                </div>
                                <div className="flex space-x-2 relative h-fit">
                                    <div className="font-bold text-xl">{10}</div>
                                    <div className="font-bold text-xl flex gap-1 items-center">
                                        <img src="/icons/currencies/celodollar.svg" className="w-[1.563rem] h-[1.563rem] rounded-full" alt="" />
                                        {'CELO'}</div>
                                    <div>
                                    </div>
                                    <div className="absolute -left-1 -bottom-6 text-sm text-greylish opacity-75 text-left">
                                        $720 USD
                                    </div>
                                </div>
                            </div>

                        </div>
                    </div>
                    <div className='flex flex-col space-y-5 gap-12 lg:gap-4'>
                        <div className='text-xl font-semibold'>Total Transactions </div>
                        <div className='text-3xl font-bold !mt-0'>239</div>
                    </div>
                </div>
            </div>

            <div className="pb-2 pt-2">
                <div className=""></div>
                <div className="bg-white rounded-lg shadow">
                    <div className="w-full px-12 pt-5 flex justify-between">
                        <div className="flex gap-2">
                            <div className="w-5 h-5 bg-primary"></div>
                            <div className="font-semibold">Actual</div>
                        </div>
                        <div className="font-semibold flex items-center gap-5">
                            <span>Compare to Budgeted</span>
                            <label htmlFor="toggleB" className="flex items-center cursor-pointer">
                            <div className="relative">
                                <input type="checkbox" id="toggleB" className="sr-only peer" onClick={() => { setStream(!stream) }} />
                                <div className="block bg-gray-400 peer-checked:bg-primary w-14 h-8 rounded-full"></div>
                                <div className="peer-checked:transform peer-checked:translate-x-full  absolute left-1 top-1 bg-white w-6 h-6 rounded-full transition"></div>
                            </div> 
                            </label>
                            </div>
                    </div>
                    {/* <div className="flex items-center justify-center h-[30%] w-[30%]"><Chartjs data={data} ref={chartjs} items={orderBalance4 as any} dispatch={setSelectcoin} /></div> 
                    <div className="w-full h-full flex items-center justify-center"><LineChart data={datas} type={'bar'} /></div>
                </div>
            </div> */}
            <div className="pb-2 pt-2">
                <div className="flex justify-end">
                    <div className="flex gap-7">
                        <button onClick={() => setSelectedDate(30)} className={`${selectedDate === 30 ? '!bg-greylish !bg-opacity-40 dark:!bg-opacity-100' : ''} ${style} `}>30 Days</button>
                        <button onClick={() => setSelectedDate(90)} className={`${selectedDate === 90 ? '!bg-greylish !bg-opacity-40 dark:!bg-opacity-100' : ''} ${style}`}>90 Days</button>
                        <button onClick={() => setSelectedDate(365)} className={`${selectedDate === 365 ? '!bg-greylish !bg-opacity-40 dark:!bg-opacity-100' : ''} ${style}`}>1 Year</button>
                        <WalletDropdown selected={selectedAccount} onChange={(wallets) => {
                            setSelectedAccounts([...wallets.map(wallet => wallet.address)])
                        }} />
                    </div>
                </div>
                {insight.isLoading ? <div className="absolute top-1/2 left-1/2 flex"><Loader /></div>
                    :
                    <>
                        <div className="grid grid-cols-3 pt-10 pb-10 gap-x-28 gap-y-10">
                            <Boxinsight insight={insight} />
                        </div>
                        <div className="grid xl:grid-cols-2 gap-x-20">
                            <Boxmoney insight={insight} />
                        </div>
                    </>}
            </div>
        </div>
    );
}

export default Insight;