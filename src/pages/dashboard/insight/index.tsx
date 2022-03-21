import { useEffect, useMemo, useState } from "react";
import Boxinsight from "subpages/dashboard/insight/boxinsight";
import Boxmoney from "subpages/dashboard/insight/boxmoney";
import { useContractKit } from "@celo-tools/use-contractkit";
import {WalletDropdown} from "../../../components/general/walletdropdown"

const style = "py-2 bg-greylish bg-opacity-10 dark:bg-darkSecond px-5  rounded-xl hover:bg-gray-300 dark:hover:bg-greylish dark:focus:bg-greylish"

const Insight = () => {
    const { kit, network, walletType } = useContractKit();
    const [selectedDate, setSelectedDate] = useState<number>(30)

    
    return (
        <div className="flex flex-col space-y-3">
            <div className="text-2xl font-bold tracking-widest pb-4">
                Insights
            </div>
            <div className="pb-2 pt-2">
                <div className="flex justify-end">
                    <div className="flex gap-7">
                        <button onClick={() => setSelectedDate(30)} className={`${selectedDate === 30 ? '!bg-greylish !bg-opacity-40 dark:!bg-opacity-100' : ''} ${style} `}>30 Days</button>
                        <button onClick={() => setSelectedDate(90)} className={`${selectedDate === 90 ? '!bg-greylish !bg-opacity-40 dark:!bg-opacity-100' : ''} ${style}`}>90 Days</button>
                        <button onClick={() => setSelectedDate(365)} className={`${selectedDate === 365 ? '!bg-greylish !bg-opacity-40 dark:!bg-opacity-100' : ''} ${style}`}>1 Year</button>
                        <WalletDropdown/>
                    </div>
                </div>
                <div className="grid grid-cols-3 pt-10 pb-10 gap-x-28 gap-y-10">
                    <Boxinsight selectedDate={selectedDate} />
                </div>
                <div className="grid xl:grid-cols-2 gap-x-20">
                    <Boxmoney selectedDate={selectedDate} />
                </div>
            </div>
        </div>
    );
}

export default Insight;