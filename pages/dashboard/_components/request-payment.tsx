import React, { useState } from 'react'
import { IFormattedTransaction } from "hooks/useTransactionProcess";
import { useRouter } from "next/router";
import { useAppSelector } from 'redux/hooks'
import { ExecutionType } from 'types/dashboard/contributors';
import { SelectContributorMembers, SelectDarkMode, SelectMultisig, SelectNonCanceledRecurringTasks, SelectRecurringTasks } from 'redux/slices/account/remoxData';
import { AiFillRightCircle } from 'react-icons/ai'


function Payments({ transactions }: { transactions: IFormattedTransaction[] }) {
    const recurring = useAppSelector(SelectNonCanceledRecurringTasks)

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
            value: multisig?.pendingTxs.length ?? 0,
            router: "/dashboard/requests"
        },
        {
            header: "Approve requests",
            icon: "cash-payment_1",
            value: multisig?.approvedTxs.length ?? 0,
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
            return <div key={index} className="w-1/2 xl:w-[90%] 2xl:w-[85%] self-end cursor-pointer">
                <div className="w-full shadow-15 px-7 py-1 rounded-md bg-white transition-all dark:bg-darkSecond hover:transition-all hover:bg-[#f9f9f9] dark:hover:!bg-[#191919]">
                    <div className="flex items-center gap-7 ">
                        <div className="hidden lg:block w-7 h-7"><img src={`/icons/dashboard_side/${item.icon}.png`} alt="" /></div>
                        <div className="flex flex-col gap-1 justify-start items-start">
                            <div className="text-lg w-full font-medium text-greylish">{item.header}</div>
                            <div className="text-2xl font-semibold">{item.value}</div>
                            <div className="text-primary hover:text-[#ff4513] flex items-center justify-center text-sm gap-2 cursor-pointer font-semibold" onClick={() => { router.push(`/${item.router}`) }} >View All <AiFillRightCircle /></div>
                        </div>
                    </div>
                </div>
            </div>
        }
        )}
    </>
}
export default Payments