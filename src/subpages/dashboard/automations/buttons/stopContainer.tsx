import { IMember, IuseContributor } from "API/useContributors";
import { useState } from "react";
import TeamItem from "./stopItem";

const TeamContainer = ({ memberState }: { memberState: IMember[] }) => {

    const [num, setNum] = useState(3)

    return <>
        <div id="header" className="hidden sm:grid grid-cols-[30%,30%,1fr] lg:grid-cols-[37%,33%,30%,1fr]  sm:pb-5 px-5" >
            <div className="font-normal ml-4">Name</div>
            <div className="font-normal hidden lg:block">Amount</div>
            <div className="font-normal">Frequency</div>
        </div>
        {memberState && memberState.slice(0, num).map(w =>
            <div key={w.id} className="grid grid-cols-2 sm:grid-cols-[30%,30%,1fr] lg:grid-cols-[37%,33%,30%,1fr] py-6 border-b border-black pb-5 px-5 text-sm">
                <TeamItem member={w} memberState={memberState} />
            </div>
        )}
        {memberState && memberState.length > 3 && num !== 100 ? <button className="py-3 pb-5 px-5 font-bold text-primary" onClick={() => setNum(100)}>
            Show More
        </button> : null}
        {!memberState ? <div className="b-5 px-5 border-b border-black pb-5">No Team Member Yet</div> : undefined}
    </>
}


export default TeamContainer;