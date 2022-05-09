import Loader from "components/Loader"
import { useTransactionProcess } from "hooks"
import Statistics from 'subpages/dashboard/main/statistics'
import TransactionHistory from "subpages/dashboard/main/transactionHistory"



export default function Dashboard() {
    const [transactions] = useTransactionProcess()

    
    return <main className="flex gap-5 flex-col xl:flex-row">
        <div className="w-1/2">
            <div className="grid grid-cols-2 gap-8 max-h-full">
                <Statistics transactions={transactions} />
            </div>
        </div>
        <div className=" w-1/2">
            <div id="transaction" className=" pt-[1.875rem]">
                {transactions ? <TransactionHistory transactions={transactions} /> : <div className="flex justify-center"> <Loader /></div>}
            </div>
        </div>
    </main>
}
