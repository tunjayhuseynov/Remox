import { IMember, IuseContributor, ExecutionType } from "rpcHooks/useContributors";
import { useState } from "react";
import TeamItem from "../automations/teamItem";


const TeamContainer = (props: IuseContributor & { memberState: [IMember[], React.Dispatch<React.SetStateAction<IMember[]>>] }) => {

    const [num, setNum] = useState(3)

    const filterMembers = props.members.filter(s => s.execution === ExecutionType.auto)

    return <>

        {filterMembers.slice(0, num).map(w =>
            <div key={w.id} className="grid grid-cols-2 sm:grid-cols-[30%,30%,1fr] lg:grid-cols-[2%,20%,18%,15%,15%,15%,15%] py-6 border-b pb-5 px-5 text-sm">
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