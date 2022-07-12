import React, { Dispatch, SetStateAction } from 'react'
import { DateInterval, ExecutionType, IMember, IContributor } from "rpcHooks/useContributors";
import { useState } from "react";
import TeamItem from "../../payroll/teamItem";
import Runitem from './runitem';
import Avatar from "components/avatar";
import dateFormat from "dateformat";
import { CeloCoins } from "types";

function Runpayroll(props: IContributor & { memberState:[IMember[], Dispatch<SetStateAction<IMember[]>>],runmodal:boolean }) {
   const [num, setNum] = useState(5)

   
  return <>

      {props.memberState[0].length > 0 && props.memberState[0].slice(0, num).map(w => w.execution === ExecutionType.manual &&
        <div key={w.id} >
        {  <div className="grid grid-cols-2 sm:grid-cols-[30%,30%,1fr] lg:grid-cols-[16%,13%,14%,17%,12%,12%,18%] py-6 border-b border-greylish border-opacity-10 pb-5 px-5 text-sm">
         <div className="pl-[2px] flex items-center">
            <div className="flex space-x-3 items-center">
                <div className="hover:cursor-pointer flex items-center space-x-1">
                    <Avatar name={w.name} />
                    <div className=" text-base">
                        {w.name}
                    </div>
                </div>
            </div>
        </div>
        <div className="flex space-x-8 items-center">
            {w.paymantDate && <>
                <div className="col-span-2 sm:col-span-1 pt-3 sm:pt-0 pl-[2px] truncate text-base">
                    {dateFormat(new Date(w.paymantDate), `dd mmmm yyyy`)}
                </div>
                {/* {new Date().getTime() > new Date(props.member.paymantDate).getTime() && (!props.member.taskId) && <div title={(props.member.execution !== ExecutionType.manual) ? `The start date of automation must be in a future date, please change it` : `Late Payment`}>
                    <img src="/icons/warningmark.svg" className="max-w-[1.25rem] max-h-[1.25rem]" alt="" />
                </div>} */}
            </>}
        </div>
        <div className="flex space-x-8 items-center">
            {w.paymantEndDate && <>
                <div className="col-span-2 sm:col-span-1 pt-3 sm:pt-0 pl-[2px] truncate text-base">
                    {dateFormat(new Date(w.paymantEndDate), `dd mmmm yyyy`)}
                </div>
            </>}
        </div>
        <div className="flex flex-col h-full">
            <div className="h-full flex items-center  gap-1">
                <div className=" text-base">{w.amount}</div>
                
                {w.usdBase ? <div className="flex items-center gap-1 ">USD as  <img src={CeloCoins[w.currency].coinUrl} width="20" height="20" alt="" className="rounded-full" /> {CeloCoins[w.currency].name}</div> :
                    <div className="flex gap-1 items-center">
                         <img src={CeloCoins[w.currency].coinUrl} width="20" height="20" alt="" className="rounded-full text-base" />
                        {CeloCoins[w.currency].name}
                    </div>}
                <div>
                   
                </div>
            </div>
            {w.secondaryCurrency && <div className="pl-[2px] flex items-center justify-start gap-1">
                <div className="text-base">{w.secondaryAmount}</div>
                {w.secondaryUsdBase ?  <div className="flex items-center gap-1 ">USD as  <img src={CeloCoins[w.secondaryCurrency].coinUrl} width="20" height="20" alt="" className="rounded-full" /> {CeloCoins[w.secondaryCurrency].name}</div>  :
                    <div className="flex gap-1 items-center">
                      
                        {CeloCoins[w.secondaryCurrency].name}
                    </div>}
                   
                <div>
                   
                </div>
            </div>}
        </div>
        <div className="pl-[2px] hidden sm:flex items-center text-base">
            {(w.interval === DateInterval.monthly && "Monthly")}
            {(w.interval === DateInterval.weekly && "Weekly")}
        </div>
        <div className="flex items-center text-base">{w.execution=== ExecutionType.manual ? "Manual" : "Streaming"}</div>
        <div className="flex items-center text-base">{w.compensation}</div>
        
          </div>}
          </div>
      )}
      {props.memberState[0] && props.memberState[0].length > 5 && num !== 100 ? <button className="py-3 pb-5 px-5 font-bold text-primary" onClick={() => setNum(100)}>
          Show More
      </button> : null}
      {!props.memberState[0] ? <div className="b-5 px-5 border-b border-black pb-5">No Team Member Yet</div> : undefined}
  </>
}

export default Runpayroll

