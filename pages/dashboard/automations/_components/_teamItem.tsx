import Avatar from "components/avatar";
import dateFormat from "dateformat";
import { DateInterval, IMember } from "types/dashboard/contributors";
import { useDispatch } from "react-redux";
import { useWalletKit } from "hooks";
import { AddressReducer } from "utils";
import { ITasking } from "redux/slices/account/remoxData";


const TeamItem = ({ task }: { task: ITasking }) => {
    const { GetCoins } = useWalletKit()
    return <>

        <div className="flex space-x-3 items-center">
            {/* <input type="checkbox" checked={props.memberState[0].some(s => s.id === props.member.id)} className="relative cursor-pointer max-w-[1.25rem] max-h-[1.25rem] checked:before:absolute checked:before:w-full checked:before:h-full checked:before:bg-primary checked:before:block" onChange={(e) => {
                const members = [...props.memberState[0]]
                if (e.target.checked) {
                    if (!members.some(s => s.id === props.member.id)) {
                        members.push(props.member)
                        props.memberState[1](members)
                    }
                } else {
                    props.memberState[1](members.filter(m => props.member.id !== m.id))
                }
            }
            } /> */}

        </div>
        <div className="hover:cursor-pointer flex items-center gap-2">
            <Avatar name={task.sender} surname="" />
            <div className="flex flex-col gap-1">
                <div className="font-semibold text-base">
                    {task.sender}
                </div>
                <div className="text-greylish text-sm">{AddressReducer(task.sender)}</div>
            </div>
        </div>
        <div className="flex space-x-8 items-center">
            {task.from && <>
                <div className="col-span-2 sm:col-span-1 pt-3 sm:pt-0 pl-[2px] truncate text-base">
                    {dateFormat(new Date(task.from * 1e3), `dd mmmm yyyy`)}
                </div>
                {new Date().getTime() > new Date(task.from * 1e3).getTime()}
            </>}
        </div>
        <div className="flex space-x-8 items-center">
            {task.from && <>
                <div className="col-span-2 sm:col-span-1 pt-3 sm:pt-0 pl-[2px] truncate text-base">
                    {dateFormat(new Date(task.from * 1e3), `dd mmmm yyyy`)}
                </div>
                {new Date().getTime() > new Date(task.from * 1e3).getTime()}
            </>}
        </div>
        {/* <div className={`flex ${props.member.secondaryCurrency && "flex-col"} space-y-4 `}>
            <div className={` flex gap-1 items-center justify-start`}>
                <div>
                    <img src={GetCoins[props.member.currency].coinUrl} width="15" height="15" alt="" className="rounded-full" />
                </div>
                <div className="font-semibold text-base">{props.member.amount}</div>
                {props.member.usdBase ? <div>USD as {GetCoins[props.member.currency].name}</div> :
                    <div className="text-base font-semibold">
                        {GetCoins[props.member.currency].name}
                    </div>}
            </div>
            {props.member.secondaryCurrency && <div className=" flex items-center justify-start gap-1 text-base">
                <div>
                    <img src={GetCoins[props.member.secondaryCurrency].coinUrl} width="15" height="15" alt="" className="rounded-full" />
                </div>
                <div className="text-base font-semibold">{props.member.secondaryAmount}</div>
                {props.member.usdBase ? <div>USD as {GetCoins[props.member.secondaryCurrency].name}</div> :
                    <div className="text-base font-semibold">
                        {GetCoins[props.member.secondaryCurrency].name}
                    </div>}
            </div>}
        </div> */}
        <div className="pl-[2px] hidden sm:flex items-center text-base ">
            {(task.interval === DateInterval.monthly && "Monthly")}
            {(task.interval === DateInterval.weekly && "Weekly")}
        </div>
        <div className="pl-[2px] hidden sm:flex items-center text-base">Event</div>

    </>
}

export default TeamItem;