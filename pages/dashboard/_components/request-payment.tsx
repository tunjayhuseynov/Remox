import React, { useState } from 'react'
import { IFormattedTransaction } from "hooks/useTransactionProcess";
import { useRouter } from "next/router";
import { useAppSelector } from 'redux/hooks'
import { SelectDarkMode, SelectMultisig, SelectNonCanceledRecurringTasks, SelectRequests } from 'redux/slices/account/remoxData';
import { AiFillRightCircle } from 'react-icons/ai'


function Payments() {
    const recurring = useAppSelector(SelectNonCanceledRecurringTasks)
    const requests = useAppSelector(SelectRequests)

    const dark = useAppSelector(SelectDarkMode)
    const router = useRouter()
    let multisig = useAppSelector(SelectMultisig)

    const data = [
        {
            header: "Signings needed",
            icon: "signature_1",
            value: multisig?.signingNeedTxs?.length ?? 0,
            router: "/dashboard"
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
            router: "/dashboard/automations",
        }

    ]

    return <>
        {data.map((item, index) => {
            return <div key={index} className="w-full self-end cursor-pointer">
                <div className="w-full shadow-15 px-7 py-1 rounded-md bg-white transition-all dark:bg-darkSecond hover:transition-all hover:bg-[#f9f9f9] dark:hover:!bg-[#191919]">
                    <div className="flex items-center gap-7 ">
                        <div className="hidden lg:block w-6 h-6"><img src={`/icons/dashboard_side/${item.icon}.png`} alt="" /></div>
                        <div className="flex flex-col justify-start items-start py-1">
                            <div className="w-full font-medium text-greylish text-sm">{item.header}</div>
                            <div className="text-xl font-semibold">{item.value}</div>
                            <div className="text-primary hover:text-[#ff4513] flex items-center justify-center text-xs gap-2 cursor-pointer font-semibold" onClick={() => { router.push(`/${item.router}`) }} >View All <AiFillRightCircle /></div>
                        </div>
                    </div>
                </div>
            </div>
        }
        )}
    </>
}
export default Payments