import { Coins } from "types/coins";
import Avatar from "components/avatar";
import { DateInterval, IMember } from "API/useContributors";

const TeamItem = (props: { member: IMember, memberState: IMember[] }) => {

    return <>
        <div className="pl-4 items-start">
            <div className="flex space-x-3 items-center">
                <div className="hover:cursor-pointer flex items-center space-x-1">
                    <Avatar name={props.member.name} />
                    <div className="text-base">
                        {props.member.name}
                    </div>
                </div>
            </div>
        </div>
        <div className="flex flex-col space-y-4">
            <div className=" pl-[2px] flex items-center justify-start gap-1">
                <div>
                    <img src={Coins[props.member.currency].coinUrl} width="15" height="15" alt="" className="rounded-full" />
                </div>
                <div>{props.member.amount}</div>
                {props.member.usdBase ? <div>USD as {Coins[props.member.currency].name}</div> :
                    <div className="text-base">
                        {Coins[props.member.currency].name}
                    </div>}
            </div>
            {props.member.secondaryCurrency && <div className=" pl-[2px] flex items-center justify-start gap-1">
                <div>
                    <img src={Coins[props.member.secondaryCurrency].coinUrl} width="15" height="15" alt="" className="rounded-full" />
                </div>
                <div>{props.member.secondaryAmount}</div>
                {props.member.usdBase ? <div>USD as {Coins[props.member.secondaryCurrency].name}</div> :
                    <div>
                        {Coins[props.member.secondaryCurrency].name}
                    </div>}
            </div>}
        </div>
        <div className="pl-[2px] hidden sm:flex items-start text-base">
            {(props.member.interval === DateInterval.monthly && "Monthly")}
            {(props.member.interval === DateInterval.weekly && "Weekly")}
        </div>
    </>
}

export default TeamItem;