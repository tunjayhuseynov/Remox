import React,{useState} from 'react'
import { IFormattedTransaction } from "hooks/useTransactionProcess";
import { useRouter } from "next/router";
import { useAppSelector } from 'redux/hooks'
import { selectContributors } from 'redux/reducers/contributors';
import { ExecutionType } from 'rpcHooks/useContributors';
import { changeDarkMode, selectDarkMode } from 'redux/reducers/notificationSlice';


function Payments({ transactions }: { transactions: IFormattedTransaction[] }) {
    const recurring = useAppSelector(selectContributors).contributors.map(s =>  s.members)
    // const teams = useAppSelector(selectContributors).contributors.map(s => ({ ...s, members: s.members.filter(m => m.) }))
    const dark = useAppSelector(selectDarkMode)
    const router = useRouter()



    const data = [
        {
            header: "Signings Needed",
            icon: dark ? "signature_white" : "signature",
            value: 2,
            router:"/dashboard"
        },
        {
            header: "Pending Requests",
            icon: dark ? "payment_white" : "payment",
            value: 10,
            router:"/dashboard/requests"
        },
        {
            header: "Approve Requests",
            icon: dark ? "charity_white" : "charity",
            value: 15,
            router:"/dashboard/requests/approved"
        },
        {
            header: "Recurring Payments",
            icon: dark ? "swap_white" : "swap",
            value: recurring.map(w => w.filter(s => s.execution === ExecutionType.auto)).length,
            router: "/dashboard/automations",
        }

    ]


  return <>
    {data.map((item, index) => {
      return  <div key={index} className="  w-1/2  xl:w-[85%] xl:mx-5 ">
            <div className="w-full shadow-custom px-7 xl:px-5 py-3 rounded-xl bg-white transition-all dark:bg-darkSecond hover:transition-all hover:!bg-[#f0f0f0] dark:hover:!bg-[#131313]  hover:shadow-lg">
                <div className="flex items-center  gap-7 ">
                    <div className="hidden lg:block w-7 h-7"><img src={`/icons/${item.icon}.png`} alt="" /></div>
                    <div className="flex flex-col gap-1 justify-start items-start">
                        <div className="text-xl w-full font-medium text-greylish dark:text-white">{item.header}</div>
                        <div className="text-3xl font-bold">{item.value}</div>
                        <div className="text-primary hover:text-[#ff4513] flex items-center justify-center gap-4 cursor-pointer" onClick={() =>{router.push(`/${item.router}`)}} >View All <img className="w-4 h-4" src="/icons/next_primary.png" alt="" /></div>
                    </div>
                </div>
            </div>
        </div>
    }
)}
  </>

//
}
export default Payments