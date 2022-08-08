import { IMember, IContributor, ExecutionType } from "types/dashboard/contributors";
import { useState } from "react";
import TeamItem from "./_teamItem";
import { ITasking } from "rpcHooks/useTasking";


const TeamContainer = ({ task }: { task: ITasking }) => {
    return <>

        <div className="grid grid-cols-2 sm:grid-cols-[30%,30%,1fr] lg:grid-cols-[2%,20%,18%,15%,15%,15%,15%] py-6 border-b pb-5 px-5 text-sm">
            <TeamItem task={task} />
        </div>
    </>
}

export default TeamContainer;