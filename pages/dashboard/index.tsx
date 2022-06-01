import Loader from "components/Loader"
import { useTransactionProcess } from "hooks"
import Payments from "subpages/dashboard/main/request-payment"
import Statistics from 'subpages/dashboard/main/statistics'
import TransactionHistory from "subpages/dashboard/main/transactionHistory"


export default function Dashboard() {
    const [transactions] = useTransactionProcess()
    
    return <main className="flex gap-10 flex-col xl:flex-row">
        <div className="w-full h-1/2 xl:w-[70%]">
            <div className=" max-h-full">
                <Statistics transactions={transactions} />
            </div>
        </div>
        <div className="w-full h-full xl:w-[30%] xl:h-[70%] xl:pt-12">
            <div className="text-2xl pb-4 xl:pb-2 xl:pl-5 font-bold">Requests & Payments</div>
            <div id="transaction" className="w-full h-full flex gap-6 pb-6 xl:pb-0  xl:flex-col xl:items-start xl:justify-center  ">
            
                {transactions ? <Payments transactions={transactions} /> : <div className="flex justify-center"> <Loader /></div>}
            </div>
        </div>
    </main>
}