import Avatar from "components/avatar";
import { DateInterval, IMember } from "types/dashboard/contributors";
import { useWalletKit } from "hooks";
import { AddressReducer } from "utils";
import dateFormat from "dateformat";

const TeamItem = (props: { member: IMember, memberState: IMember[] }) => {
    const { GetCoins } = useWalletKit()
    return <>
    <div></div>
        <div className="hover:cursor-pointer flex items-center gap-2">
            <Avatar name={props.member.name} />
            <div className="flex flex-col gap-1">
            <div className="font-semibold text-base">
                {props.member.name}
            </div>
            <div className="text-greylish text-sm">{AddressReducer(props.member.address)}</div>
            </div>
        </div>
        <div className="flex space-x-8 items-center">
            {props.member.paymantDate && <>
                <div className="col-span-2 sm:col-span-1 pt-3 sm:pt-0 pl-[2px] truncate text-base">
                    {dateFormat(new Date(props.member.paymantDate), `dd mmmm yyyy`)}
                </div>
                {new Date().getTime() > new Date(props.member.paymantDate).getTime()}
            </>}
        </div>
        <div className="flex space-x-8 items-center">
            {props.member.paymantEndDate && <>
                <div className="col-span-2 sm:col-span-1 pt-3 sm:pt-0 pl-[2px] truncate text-base">
                    {dateFormat(new Date(props.member.paymantEndDate), `dd mmmm yyyy`)}
                </div>
                {new Date().getTime() > new Date(props.member.paymantEndDate).getTime()}
            </>}
        </div>
        <div className={`flex ${props.member.secondaryCurrency && "flex-col"} space-y-4 `}>
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
        </div>
        <div className="pl-[2px] hidden sm:flex items-center text-base ">
            {(props.member.interval === DateInterval.monthly && "Monthly")}
            {(props.member.interval === DateInterval.weekly && "Weekly")}
        </div>
        <div className="pl-[2px] hidden sm:flex items-center text-base">Event</div>

    </>
}

export default TeamItem;