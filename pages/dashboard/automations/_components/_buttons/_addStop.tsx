import { ExecutionType, IMember } from "types/dashboard/contributors";
import { changeError, changeSuccess } from 'redux/slices/notificationSlice';
import Button from "components/button";
import { useAppDispatch, useAppSelector } from 'redux/hooks';
import TeamItem from "./_stopItem";
import useContributors from "hooks/useContributors";
import { selectStorage } from "redux/slices/account/storage";


const AddStopModal = ({ onDisable, memberState }: { onDisable: React.Dispatch<boolean>, memberState: IMember[] }) => {

    const dispatch = useAppDispatch()

    const { removeMember, isLoading, editMember } = useContributors()
    const storage = useAppSelector(selectStorage)

    const create = async () => {
        try {
            for (const member of memberState) {
                // await cancelTask(member.taskId!)
                let mem = { ...member }
                mem.name = `${mem.name}`
                mem.address = mem.address
                mem.amount = mem.amount
                mem.execution = mem.execution
                if (mem.secondaryAmount) {
                    mem.secondaryAmount = mem.secondaryAmount
                }

                await editMember(mem.teamId, mem.id, {
                    ...mem,
                    taskId: null,
                    execution: ExecutionType.auto
                })
            }

            dispatch(changeSuccess({ activate: true, text: "Automations has been successfully stopped" }))
        } catch (error) {
            console.error(error)
            dispatch(changeError({ activate: true, text: "Failed to stop automations" }))
        }

        onDisable(false)
    }

    return <>
        <div className="flex flex-col space-y-8 px-10">
            {memberState.length > 0 ? <>
                <div className="text-2xl font-semibold py-2 ">Run Payroll</div>
                <div className="w-full shadow-custom px-5 pt-4 pb-6 rounded-xl bg-white dark:bg-darkSecond">
                    <div id="header" className="hidden sm:grid grid-cols-[30%,30%,1fr] lg:grid-cols-[2%,20%,18%,15%,15%,15%,15%] rounded-xl bg-light  dark:bg-dark sm:mb-5 px-5 " >
                        <div></div>
                        <div className="font-normal py-3 ">Name</div>
                        <div className="font-normal py-3">Start Date</div>
                        <div className="font-normal py-3">End Date</div>
                        <div className="font-normal py-3 ">Amount</div>
                        <div className="font-normal py-3">Frequency</div>
                        <div className="font-normal py-3">Labels</div>

                    </div>
                    <div>
                        {memberState && memberState.map(w =>
                            <div key={w.id} className="grid grid-cols-2 sm:grid-cols-[30%,30%,1fr] lg:grid-cols-[2%,20%,18%,15%,15%,15%,15%] py-6 border-b  pb-5 text-sm">
                                <TeamItem member={w} memberState={memberState} />
                            </div>
                        )}
                    </div>
                </div>
                <div>

                </div>
                <Button type="submit" onClick={create} className="w-[85%] self-center py-3 text-2xl !rounded-lg" isLoading={isLoading}>
                    Confirm and Cancel Payment
                </Button>
            </> : <div className="text-2xl font-semibold py-2 pb-8">No Team Member Yet</div>}
        </div>
    </>
}

export default AddStopModal