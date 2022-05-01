import { ExecutionType, IMember } from "API/useContributors";
import { changeError, changeSuccess } from 'redux/reducers/notificationSlice';
import Button from "components/button";
import { useAppDispatch, useAppSelector } from 'redux/hooks';
import TeamItem from "./stopItem";
import useGelato from "API/useGelato";
import useContributors from "hooks/useContributors";
import { encryptMessage } from "utils/hashing";
import { selectStorage } from "redux/reducers/storage";


const AddStopModal = ({ onDisable, memberState }: { onDisable: React.Dispatch<boolean>, memberState: IMember[] }) => {

    const dispatch = useAppDispatch()
    const { cancelTask, loading } = useGelato()
    const { removeMember, isLoading, editMember } = useContributors()
    const storage = useAppSelector(selectStorage)

    const create = async () => {
        try {
            for (const member of memberState) {
                await cancelTask(member.taskId!)
                let mem = {...member}
                mem.name = encryptMessage(`${mem.name}`, storage?.encryptedMessageToken)
                mem.address = encryptMessage(mem.address, storage?.encryptedMessageToken)
                mem.amount = encryptMessage(mem.amount, storage?.encryptedMessageToken)
                if (mem.secondaryAmount) {
                    mem.secondaryAmount = encryptMessage(mem.secondaryAmount, storage?.encryptedMessageToken)
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
        <div className="flex flex-col space-y-8 pt-10">
            <div className="header"><p className="tracking-wider text-gray-500 text-lg">The following automations will be stoped</p></div>
            <div id="header" className="hidden sm:grid grid-cols-[30%,30%,1fr] lg:grid-cols-[33%,33%,1fr] border-b border-black sm:pb-5 px-5" >
                <div className="font-normal">Name</div>
                <div className="font-normal hidden lg:block">Amount</div>
                <div className="font-normal">Frequency</div>
            </div>
            <div>
                {memberState && memberState.map(w =>
                    <div key={w.id} className="grid grid-cols-2 sm:grid-cols-[30%,30%,1fr] lg:grid-cols-[33%,33%,1fr] py-6 border-b border-black pb-5 text-sm">
                        <TeamItem member={w} memberState={memberState} />
                    </div>
                )}
            </div>
            <div className="flex justify-center gap-16">
                <Button type="submit" version="second" onClick={() => onDisable(false)} className="px-8">
                    Go back
                </Button>
                <Button type="submit" onClick={create} className="px-8 py-3" isLoading={loading || isLoading}>
                    Confirm
                </Button>
            </div>

        </div>
    </>
}

export default AddStopModal