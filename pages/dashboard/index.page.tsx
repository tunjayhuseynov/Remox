import Loader from "components/Loader"
import { useTransactionProcess } from "hooks"
import { Payments, Statistics } from "./_components"


export default function Dashboard() {

    return <main className="flex gap-4 2xl:gap-10 flex-col xl:flex-row">
        <div className="h-1/2 w-[73%] 2xl:w-[62.5%]">
            <div className="max-h-full">
                <Statistics />
            </div>
        </div>
        <div className="w-full h-full xl:w-[37.5%] xl:mt-[4rem]">
            <div className="text-xl pb-4 xl:pl-12 2xl:pl-20 font-semibold">Requests & Payments</div>
            <div id="transaction" className="w-full h-full flex gap-8 pb-6 xl:pb-0  xl:flex-col xl:items-start xl:justify-end">
                <Payments />
            </div>
        </div>
    </main>
}
