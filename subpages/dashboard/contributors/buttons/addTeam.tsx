import { useState } from "react";
import { useAppDispatch, useAppSelector } from "redux/hooks"
import Button from "../../../../components/button";
import useContributors from "hooks/useContributors";
import { useForm, SubmitHandler } from "react-hook-form";
import { IuseContributor } from "rpcHooks/useContributors";
import { v4 as uuidv4 } from "uuid";
import { GetTime } from "utils";
import { addContributor , SelectStorage } from "redux/slices/account/remoxData";

export interface IFormInput {
    name: string;
}
const AddTeams = ({ onDisable }: { onDisable: React.Dispatch<boolean> }) => {
    const { register, handleSubmit } = useForm<IFormInput>();
    const { addTeam, isLoading } = useContributors()
    const [error, setError] = useState(false)
    const storage = useAppSelector(SelectStorage);  
    const dispatch = useAppDispatch()


    const onSubmit: SubmitHandler<IFormInput> = async (data) => {
        
        if (data.name.trim()) {
            try {
                setError(false)
                const team : IuseContributor = {
                    id: uuidv4(),
                    name: data.name.trim(),
                    members: [],
                    timestamp: GetTime(),
                    userId: storage!.signType === "individual" ? storage!.individual.id : storage!.organization!.id,
                }   
                await addTeam(team);
                dispatch(addContributor([team]));
                onDisable(false)
            } catch (error) {
                console.error(error)
                setError(true)
            }
        }
    }

    return <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col items-center justify-center space-y-10 w-[35%] mx-auto  pt-24">
        <div className="text-2xl self-center pt-5 font-semibold ">Enter Your Team</div>
        <div className="flex flex-col w-[85%]">
            <div>Team Name</div>
            <div>
                <input {...register("name", { required: true })} type="text" className="border pl-3 w-full rounded-xl h-10 py-6 text-lg outline-none dark:bg-darkSecond" />
            </div>
            {error && <div className="text-red-600"> Something went wrong</div>}
        </div>
        <div className="flex  gap-x-10 justify-center w-full">
            <Button version="second" onClick={() => onDisable(false)} className="px-14 !py-2 font-light">
                Close
            </Button>
            <Button type="submit" isLoading={isLoading} className="px-14 !py-2 font-light">
                Save
            </Button>
        </div>
    </form>
}

export default AddTeams;