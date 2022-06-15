import { useEffect, useState } from "react";
import Boxinsight from "subpages/dashboard/insight/boxinsight";
import Boxmoney from "subpages/dashboard/insight/boxmoney";
import { WalletDropdown } from "components/general/walletdropdown"
import { useSelector } from "react-redux";
import { SelectSelectedAccount } from "redux/reducers/selectedAccount";
import useMultiWallet from "hooks/useMultiWallet";
import useInsight from "rpcHooks/useInsight";
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


    return (
        <div className="flex flex-col space-y-3">
            <div className="flex justify-between pb-4">
                <div className="text-4xl font-bold">Insights</div>
            </div>
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