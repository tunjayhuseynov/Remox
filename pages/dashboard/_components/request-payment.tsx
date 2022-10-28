import React from 'react'
import { useRouter } from "next/router";
import { useAppSelector } from 'redux/hooks'
import { SelectDarkMode, SelectMultisig, SelectNonCanceledRecurringTasks, SelectRequests } from 'redux/slices/account/remoxData';
import { AiFillRightCircle } from 'react-icons/ai'


function Payments() {
    const recurring = useAppSelector(SelectNonCanceledRecurringTasks)
    const requests = useAppSelector(SelectRequests)

    const dark = useAppSelector(SelectDarkMode)
    let multisig = useAppSelector(SelectMultisig)
    const router = useRouter()

    const data = [
        {
            header: "Signings needed",
            icon: "signature_1",
            value: multisig?.signingNeedTxs?.length ?? 0,
            router: "/dashboard/transactions?pending=true"
        },
        {
            header: "Pending requests",
            icon: "payment_1",
            value: requests.pendingRequests.length,
            router: "/dashboard/requests"
        },
        {
            header: "Approve requests",
            icon: "cash-payment_1",
            value: requests.approvedRequests.length,
            router: "/dashboard/requests/approved"
        },
        {
            header: "Recurring payments",
            icon: "subscription-model_1",
            value: recurring.length,
            router: "/dashboard/streaming",
        }
    ]

    return <>
        {data.map((item, index) => {
            return <div key={index} onClick={() => { router.push(`${item.router}`) }} className="cursor-pointer !min-h-[5rem] w-[21.25rem]">
                <div className="w-full shadow-15 px-7 rounded-md bg-white transition-all dark:bg-darkSecond hover:transition-all hover:bg-[#f9f9f9] dark:hover:!bg-[#191919]">
                    <div className="flex items-center gap-7 ">
                        <div className="hidden lg:block w-6 h-6"><img src={`/icons/dashboard_side/${item.icon}.png`} alt="" /></div>
                        <div className="flex flex-col justify-start items-start py-1">
                            <div className="w-full font-medium text-greylish text-sm">{item.header}</div>
                            <div className="text-2xl font-semibold">{item.value}</div>
                            <div className="text-primary hover:text-[#ff4513] flex items-center justify-center text-xs gap-2 cursor-pointer font-semibold" onClick={() => { router.push(`${item.router}`) }} >View All <AiFillRightCircle /></div>
                        </div>
                    </div>
                </div>
            </div>
        }
        )}
    </>
}
export default Payments