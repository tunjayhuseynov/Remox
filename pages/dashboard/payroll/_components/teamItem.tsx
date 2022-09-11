import Avatar from "components/avatar";
import dateFormat from "dateformat";
import { DateInterval, ExecutionType, IMember } from "types/dashboard/contributors";
import { AddressReducer } from "utils";

const TeamItem = (props: { member: IMember, confirm: boolean, memberState: [IMember[], React.Dispatch<React.SetStateAction<IMember[]>>] }) => {

    return <>
        <div className="pl-[2px] flex space-x-8">
            <div className={`flex space-x-3 items-center `}>
                {props.member.execution !== ExecutionType.auto && props.confirm &&
                    <input type="checkbox" checked={(props.member.execution !== ExecutionType.manual && !(!props.member.taskId)) || props.memberState[0].some(s => s.id === props.member.id)} className="relative cursor-pointer w-[0.8rem] h-[0.8rem] checkboxborder bg-white outline outline-1 outline-gray-400 checked:before:absolute checked:before:w-full checked:before:h-full checked:before:bg-primary checked:before:block" onChange={(e) => {
                        const members = [...props.memberState[0]]
                        if (!props.member.taskId && props.member.execution === ExecutionType.manual) {
                            if (e.target.checked) {
                                members.push(props.member)
                                props.memberState[1](members)
                            } else {
                                props.memberState[1](members.filter(m => props.member.id !== m.id))
                            }
                        }
                    }
                    } />}
                <div className="hover:cursor-pointer flex items-center space-x-1">
                    <Avatar name={props.member.name} surname="" />
                    <div className="flex flex-col gap-1 text-sm xl:text-base">
                        <div>
                            {props.member.name}
                        </div>
                        <div className="text-greylish text-sm">
                            {AddressReducer(props.member.address)}
                        </div>
                    </div>
                </div>
            </div>
        </div>
        <div className="flex space-x-8 items-center">
            {props.member.paymantDate && <>
                <div className="col-span-2 sm:col-span-1 pt-3 sm:pt-0 pl-[2px] truncate text-sm xl:text-base">
                    {dateFormat(new Date(props.member.paymantDate), `dd mmmm yyyy`)}
                </div>
                {/* {new Date().getTime() > new Date(props.member.paymantDate).getTime() && (!props.member.taskId) && <div title={(props.member.execution === ExecutionType.auto) ? `The start date of automation must be in a future date, please change it` : `Late Payment`}>
                    <img src="/icons/warningmark.svg" className="max-w-[1.25rem] max-h-[1.25rem]" alt="" />
                </div>} */}
            </>}
        </div>
        <div className="flex space-x-8 items-center">
            {props.member.paymantEndDate && <>
                <div className="col-span-2 sm:col-span-1 pt-3 sm:pt-0 pl-[2px] truncate text-sm xl:text-base">
                    {dateFormat(new Date(props.member.paymantEndDate), `dd mmmm yyyy`)}
                </div>
            </>}
        </div>
        <div className={`flex ${props.member.secondaryUsdBase && "flex-col"}  space-y-4 items-center`}>
            <div className="pl-[2px] flex items-center justify-center gap-1">
                <div className="text-sm xl:text-base">{props.member.amount}</div>
                {/* {props.member.usdBase ? <div className="flex items-center gap-1 ">USD as  <img src={CeloCoins[props.member.currency].coinUrl} width="20" height="20" alt="" className="rounded-full" /> {CeloCoins[props.member.currency].name}</div> : */}
                    <div className="flex gap-1 items-center">
                        {/* <img src={CeloCoins[props.member.currency].coinUrl} width="20" height="20" alt="" className="rounded-full text-base" /> */}
                        {/* {CeloCoins[props.member.currency].name} */}
                    </div>
                {/* } */}
            </div>
            {props.member.secondaryCurrency && props.member.secondaryAmount &&
                <div className="pl-[2px] flex items-center justify-center gap-1">
                    <div className="text-sm xl:text-base">{props.member.secondaryAmount}</div>
                    {
                    /* {props.member.usdBase ? <div className="flex items-center gap-1 ">USD as  <img src={CeloCoins[props.member.secondaryCurrency].coinUrl} width="20" height="20" alt="" className="rounded-full" /> {CeloCoins[props.member.secondaryCurrency].name}</div> : */}
                        <div className="flex gap-1 items-center">
                            {/* <img src={CeloCoins[props.member.secondaryCurrency].coinUrl} width="20" height="20" alt="" className="rounded-full text-base" /> */}
                            {/* {CeloCoins[props.member.secondaryCurrency].name} */}
                        </div>
                    {/* } */}
                </div>
            }
        </div>
        <div className="pl-[2px] hidden sm:flex items-center text-sm xl:text-base">
            {(props.member.interval === DateInterval.monthly && "Monthly")}
            {(props.member.interval === DateInterval.weekly && "Weekly")}
        </div>
        <div className="flex items-center text-sm xl:text-base">{props.member.execution === "auto" ? "Streaming" : "Manual"}</div>
        <div className="flex items-center text-sm xl:text-base">{props.member.compensation}</div>

    </>
}

export default TeamItem;