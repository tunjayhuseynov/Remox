import { IuseContributor } from "API/useContributors";
import useContributors from "hooks/useContributors";
import { Dispatch, useState } from "react";
import { useAppDispatch } from "redux/hooks";
import { changeError, changeSuccess } from "redux/reducers/notificationSlice";
import Button from "../../../../components/button";


const EditTeam = (props: IuseContributor & { onCurrentModal: Dispatch<boolean> }) => {

    // const [updateTeam, { isLoading }] = useUpdateTeamMutation()
    const { editTeam, isLoading } = useContributors()
    const [input, setInput] = useState<string>('')
    const dispatch = useAppDispatch()


    return <div className="grid grid-rows-[25%,25%,50%] grid-cols-[80%] items-center justify-center h-[200px]">
        <div className="text-center self-end font-light">
            Team Name
        </div>
        <div className="place-self-center">
            <input type="text" defaultValue={props.name} onChange={(e) => setInput(e.target.value)} className="text-center px-3 rounded-md py-2 outline-none border-2 border-black border-opacity-50 dark:bg-darkSecond" required />
        </div>
        <div className="grid grid-cols-2 self-end gap-x-5">
            <Button version="second" className="w-full py-3" onClick={() => {
                props.onCurrentModal(false)
            }}>
                Close
            </Button>
            <Button className="w-full px-4 py-3" isLoading={isLoading} onClick={async () => {
                try {
                    // await updateTeam({ id: props.id, body: { title: input } }).unwrap()
                    await editTeam(props.id, input)
                    dispatch(changeSuccess({ activate: true, text: "Successfully Edited" }))
                    props.onCurrentModal(false)
                } catch (error: any) {
                    console.error(error)
                    dispatch(changeError({ activate: true, text: error?.data?.message }))
                }
            }}>
                Save
            </Button>
        </div>
    </div>
}

export default EditTeam;