import { useEffect, useState } from "react";
import Boxinsight from "subpages/dashboard/insight/boxinsight";
import Boxmoney from "subpages/dashboard/insight/boxmoney";
import { WalletDropdown } from "components/general/walletdropdown"
import { useSelector } from "react-redux";
import { SelectSelectedAccount } from "redux/slices/account/selectedAccount";
import useMultiWallet from "hooks/useMultiWallet";
import useInsight from "rpcHooks/useInsight";
import Loader from "components/Loader";
import useMultisigProcess from "hooks/useMultisigProcess";
import { useAppSelector } from "redux/hooks";
import { selectDarkMode } from "redux/slices/notificationSlice";
import { CSVLink } from "react-csv";
import AllCharts from "subpages/dashboard/insight/allCharts";
import BudgetsAndLabels from "subpages/dashboard/insight/Budgets-Labels";

const style = "py-2 bg-greylish bg-opacity-10 dark:bg-darkSecond px-5  rounded-xl hover:bg-gray-300 dark:hover:bg-greylish dark:focus:bg-greylish"

const Insight = () => {
    const darkMode = useSelector(selectDarkMode)
    const { data: wallets } = useMultiWallet()
    const { refetch, isMultisig } = useMultisigProcess()
    const [selectedDate, setSelectedDate] = useState<number>(30)
    const selectedAccount = useAppSelector(SelectSelectedAccount)
    const { data } = useMultiWallet()
    const [selectedAccounts, setSelectedAccounts] = useState<string[]>(data?.map(s => s.address) ?? [selectedAccount])
    const [changedAccount, setChangedAccount] = useState<string[]>(wallets?.map(s => s.address) ?? [selectedAccount])
    const insight = useInsight({ selectedDate, selectedAccounts })


    useEffect(() => {
        if (data !== undefined) {
            setSelectedAccounts(data.map(s => s.address))
        }
    }, [data])



    const coins = [
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

    ]

    return (
        <div className="flex flex-col space-y-3">
            <div className="flex justify-between pb-4">
                <div className="text-4xl font-bold">Insights</div>
                <div className="flex gap-2">
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
                </div>
            </div>
            <div className=" px-5 w-full mt-6">
                <div className="grid grid-cols-[24%,60%,16%] w-[95%]  mb-10">
                    <div className='flex flex-col  gap-12 lg:gap-4 pr-6 border-r'>
                        <div className='text-xl font-semibold'>Total Spending </div>
                        <div className='text-3xl font-bold !mt-0'>$5.000 USD</div>
                    </div>
                    <div className="flex flex-col gap-4  pl-6 border-r">
                        <div className='text-xl font-semibold'>Token Allocation</div>
                        <div className='grid grid-cols-4 gap-4'>
                            {coins.map((item, i) => {
                                return <div key={i} className="flex flex-col">
                                    <div className="flex items-center gap-1">
                                        <div className="font-bold text-xl">{item.value}</div>
                                        <div className="font-bold text-xl flex gap-1 items-center">
                                            <img src={`/icons/currencies/${item.image}.svg`} className="w-[1.563rem] h-[1.563rem] rounded-full" alt="" />
                                            {item.name}</div>
                                    </div>
                                    <div className=" text-sm text-greylish opacity-75 text-left">
                                        ${item.usdValue} USD
                                    </div>
                                </div>
                            })}
                        </div>
                    </div>
                    <div className='flex flex-col pl-6'>
                        <div className='text-xl font-semibold'>Total Transactions </div>
                        <div className='text-3xl font-bold !mt-0'>239</div>
                    </div>
                </div>
            </div>
            
            <BudgetsAndLabels/>
            <AllCharts />

        </div>
    );
}

export default Insight;