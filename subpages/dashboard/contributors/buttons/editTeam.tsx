import { IuseContributor } from "rpcHooks/useContributors";
import useContributors from "hooks/useContributors";
import { Dispatch, useState } from "react";
import { useAppDispatch } from "redux/hooks";
import { changeError, changeSuccess } from "redux/slices/notificationSlice";
import Button from "../../../../components/button";
import { useForm, SubmitHandler } from "react-hook-form";
import { IFormInput} from './addTeam'

const EditTeam = (props: IuseContributor & { onCurrentModal: Dispatch<boolean> }) => {
    const { register, handleSubmit } = useForm<IFormInput>();
    // const [updateTeam, { isLoading }] = useUpdateTeamMutation()
    const { editTeam, isLoading } = useContributors()
    const [input, setInput] = useState<string>('')
    const dispatch = useAppDispatch()

    const onSubmit: SubmitHandler<IFormInput> = data => console.log(data)

    return <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col items-center justify-center space-y-10">
        <div className="flex items-center justify-center text-xl">
            <div className="text-2xl self-center pt-2 font-semibold ">Edit Team</div>
        </div>

        <div className="flex flex-col w-[85%] ">
        <div className="">
            Team Name
        </div>
            <input type="text" {...register("name", { required: true })} defaultValue={props.name} onChange={(e) => setInput(e.target.value)}className="border pl-3 w-full rounded-xl h-10 py-6 text-lg outline-none dark:bg-darkSecond" required />
        </div>
        <div className="flex  gap-x-10 justify-center w-full">
            <Button version="second" className="px-14 !py-2 font-light" onClick={() => {
                props.onCurrentModal(false)
            }}>
                Close
            </Button>
            <Button className="px-14 !py-2 font-light" isLoading={isLoading} onClick={async () => {
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
    </form>
}

export default EditTeam;