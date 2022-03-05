import { IMember, IuseContributor } from "API/useContributors";
import { useState } from "react";
import TeamItem from "../automations/teamItem";

const TeamContainer = (props: IuseContributor & { memberState: [IMember[], React.Dispatch<React.SetStateAction<IMember[]>>] }) => {

    const [num, setNum] = useState(3)

    return <>
        <div className="col-span-4 flex space-x-3 py-2 pt-4 sm:pt-6 pb-1 px-5 items-center justify-start">
            <div className="font-semibold text-[1.5rem] overflow-hidden whitespace-nowrap">
                <div>{props.name}</div>
            </div>
        </div>
        {props.members && props.members.slice(0, num).map(w =>
            <div key={w.id} className="grid grid-cols-2 sm:grid-cols-[30%,30%,1fr] lg:grid-cols-[20%,20%,20%,1fr] py-6 border-b border-black pb-5 px-5 text-sm">
                <TeamItem teamName={props.name} member={w} memberState={props.memberState} />
            </div>
        )}
        {props.members && props.members.length > 3 && num !== 100 ? <button className="py-3 pb-5 px-5 font-bold text-primary" onClick={() => setNum(100)}>
            Show More
        </button> : null}
        {!props.members ? <div className="b-5 px-5 border-b border-black pb-5">No Team Member Yet</div> : undefined}
    </>
}

export default TeamContainer;