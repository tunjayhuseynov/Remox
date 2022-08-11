import React, { Dispatch, SetStateAction } from 'react'
import { DateInterval, ExecutionType, IMember, IContributor } from "types/dashboard/contributors";
import Avatar from "components/avatar";
import dateFormat from "dateformat";
import { CeloCoins } from "types";

function Runpayroll(props: IContributor["members"][0] & { memberState: [IMember[], Dispatch<SetStateAction<IMember[]>>], runmodal: boolean }) {
    return <>
        <div key={props.id} >
            {<div className="grid grid-cols-2 sm:grid-cols-[30%,30%,1fr] lg:grid-cols-[16%,13%,14%,17%,12%,12%,18%] py-6 border-b border-greylish border-opacity-10 pb-5 px-5 text-sm">
                <div className="pl-[2px] flex items-center">
                    <div className="flex space-x-3 items-center">
                        <div className="hover:cursor-pointer flex items-center space-x-1">
                            <Avatar name={props.name} surname="" />
                            <div className=" text-base">
                                {props.name}
                            </div>
                        </div>
                    </div>
                </div>
                <div className="flex space-x-8 items-center">
                    {props.paymantDate && <>
                        <div className="col-span-2 sm:col-span-1 pt-3 sm:pt-0 pl-[2px] truncate text-base">
                            {dateFormat(new Date(props.paymantDate), `dd mmmm yyyy`)}
                        </div>
                        {/* {new Date().getTime() > new Date(props.member.paymantDate).getTime() && (!props.member.taskId) && <div title={(props.member.execution !== ExecutionType.manual) ? `The start date of automation must be in a future date, please change it` : `Late Payment`}>
                    <img src="/icons/warningmark.svg" className="max-w-[1.25rem] max-h-[1.25rem]" alt="" />
                </div>} */}
                    </>}
                </div>
                <div className="flex space-x-8 items-center">
                    {props.paymantEndDate && <>
                        <div className="col-span-2 sm:col-span-1 pt-3 sm:pt-0 pl-[2px] truncate text-base">
                            {dateFormat(new Date(props.paymantEndDate), `dd mmmm yyyy`)}
                        </div>
                    </>}
                </div>
                <div className="flex flex-col h-full">
                    <div className="h-full flex items-center  gap-1">
                        <div className=" text-base">{props.amount}</div>

                        {props.usdBase ? <div className="flex items-center gap-1 ">USD as  <img src={CeloCoins[props.currency].coinUrl} width="20" height="20" alt="" className="rounded-full" /> {CeloCoins[props.currency].name}</div> :
                            <div className="flex gap-1 items-center">
                                <img src={CeloCoins[props.currency].coinUrl} width="20" height="20" alt="" className="rounded-full text-base" />
                                {CeloCoins[props.currency].name}
                            </div>}
                        <div>

                        </div>
                    </div>
                    {props.secondaryCurrency && <div className="pl-[2px] flex items-center justify-start gap-1">
                        <div className="text-base">{props.secondaryAmount}</div>
                        {props.secondaryUsdBase ? <div className="flex items-center gap-1 ">USD as  <img src={CeloCoins[props.secondaryCurrency].coinUrl} width="20" height="20" alt="" className="rounded-full" /> {CeloCoins[props.secondaryCurrency].name}</div> :
                            <div className="flex gap-1 items-center">

                                {CeloCoins[props.secondaryCurrency].name}
                            </div>}

                        <div>

                        </div>
                    </div>}
                </div>
                <div className="pl-[2px] hidden sm:flex items-center text-base">
                    {(props.interval === DateInterval.monthly && "Monthly")}
                    {(props.interval === DateInterval.weekly && "Weekly")}
                </div>
                <div className="flex items-center text-base">{props.execution === ExecutionType.manual ? "Manual" : "Streaming"}</div>
                <div className="flex items-center text-base">{props.compensation}</div>

            </div>}
        </div>
        {!props.memberState[0] ? <div className="b-5 px-5 border-b border-black pb-5">No Team Member Yet</div> : undefined}
    </>
}

export default Runpayroll

