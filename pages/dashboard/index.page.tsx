import Loader from "components/Loader"
import { useTransactionProcess } from "hooks"
import { Payments, Statistics } from "./_components"


export default function Dashboard() {
    const [transactions] = useTransactionProcess()
    
    return <main className="flex gap-4 2xl:gap-10 flex-col xl:flex-row">
        <div className="h-1/2 w-[73%] 2xl:w-[62.5%]">
            <div className="max-h-full">
                <Statistics transactions={transactions} />
            </div>
        </div>
        <div className="w-full mt-3 h-full xl:w-[30%] xl:h-[70%] xl:pt-[3.5rem]">
            <div className="text-2xl pb-4 xl:pb-2 xl:pl-5 font-bold">Requests & Payments</div>
            <div id="transaction" className="w-full h-full flex gap-6 pb-6 xl:pb-0  xl:flex-col xl:items-start xl:justify-center  ">
                {transactions ? <Payments transactions={transactions} /> : <div className="flex justify-center"> <Loader /></div>}
            </div>
        </div>
    </main>
}
