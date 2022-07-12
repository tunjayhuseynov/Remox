import { ExecutionType, IMember, IContributor } from "rpcHooks/useContributors";
import { useState } from "react";
import TeamItem from "../payroll/teamItem";


const TeamContainer = (props: IContributor & { memberState: [IMember[], React.Dispatch<React.SetStateAction<IMember[]>>],confirm:boolean }) => {

    const [num, setNum] = useState(10)



    return <>
        {/* {props.confirm && <input type="checkbox"  className="relative -top-[3.3rem] left-[1.2rem] cursor-pointer checkboxborder bg-white outline outline-1 outline-gray-400  w-[0.95rem] h-[0.95rem] checked:before:absolute checked:before:w-full checked:before:h-full checked:before:bg-primary checked:before:block" onChange={(e) => {
            const members = [ ...props.memberState[0]]
            if (e.target.checked) {
                
                props.members?.forEach(m => {
                    if (!members.some(x => x.id === m.id) && !m.taskId) {
                        console.log(m)
                         m.execution !== ExecutionType.auto && members.push(m)

                    }
                    m.execution !== ExecutionType.auto &&  props.memberState[1](members)
                })

            } else {
                 props.memberState[1](members.filter(m => !props.members?.some(x => x.id === m.id )&& m.execution !== ExecutionType.auto))
            }
        }} />} */}
        {props.members && props.members.slice(0, num).map(w =>
            <div key={w.id} className="grid grid-cols-2 sm:grid-cols-[30%,30%,1fr] lg:grid-cols-[18%,11%,14%,15%,12%,12%,18%] py-6 border-b border-greylish border-opacity-10 pb-5 px-5 text-sm">
                 <TeamItem teamName={props.name} member={w} memberState={props.memberState} confirm={props.confirm} />
            </div>
        )}
        {props.members && props.members.length > 10 && num !== 100 ? <button className="py-3 pb-5 px-5 font-bold text-primary" onClick={() => setNum(100)}>
            Show More
        </button> : null}
        {!props.members ? <div className="b-5 px-5 border-b border-black pb-5">No Team Member Yet</div> : undefined}
    </>
}

export default TeamContainer;