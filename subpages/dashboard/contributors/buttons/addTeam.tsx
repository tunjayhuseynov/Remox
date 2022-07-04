import { useRef, useState } from "react";
import { useAppDispatch } from "redux/hooks"
import { changeSuccess } from 'redux/slices/notificationSlice'
import Button from "../../../../components/button";
import useContributors from "hooks/useContributors";
import { useForm, SubmitHandler } from "react-hook-form";

export interface IFormInput {
name: string;
}
const AddTeams = ({ onDisable }: { onDisable: React.Dispatch<boolean> }) => {
    const { register, handleSubmit } = useForm<IFormInput>();
    const { addTeam, isLoading } = useContributors()
    const [error, setError] = useState(false)

    const teamName = useRef<HTMLInputElement>(null)
    const dispatch = useAppDispatch()

    const create = async () => {
        if (teamName.current && teamName.current.value.trim()) {
            try {
                setError(false)
                await addTeam(teamName.current.value.trim())
                dispatch(changeSuccess({ activate: true, text: "Successfully created" }))
                onDisable(false)
            } catch (error) {
                console.error(error)
                setError(true)
            }
        }
    }

    const onSubmit: SubmitHandler<IFormInput> = data => console.log(data)

    return <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col items-center justify-center space-y-10 w-[35%] mx-auto">
        <div className="text-2xl self-center pt-5 font-semibold ">Add Team</div>
        <div className="flex flex-col w-[85%] pt-24">
            <div>Team Name</div>
            <div>
                <input {...register("name", { required: true })}  type="text" className="border pl-3 w-full rounded-xl h-10 py-6 text-lg outline-none dark:bg-darkSecond" />
            </div>
            {error && <div className="text-red-600"> Something went wrong</div>}
        </div>
        <div className="flex  gap-x-10 justify-center w-full">
        <Button version="second" onClick={()=> onDisable(false)}  className="px-14 !py-2 font-light">
                Close
            </Button>
            <Button type="submit" onClick={create} isLoading={isLoading} className="px-14 !py-2 font-light">
                Save
            </Button>
        </div>
    </form>
}

export default AddTeams;