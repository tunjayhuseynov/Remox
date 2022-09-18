import { useState } from "react";
import { useAppDispatch, useAppSelector } from "redux/hooks"
import Button from "../../../../components/button";
import useContributors from "hooks/useContributors";
import { useForm, SubmitHandler } from "react-hook-form";
import { IContributor } from "types/dashboard/contributors";
import { v4 as uuidv4 } from "uuid";
import { GetTime } from "utils";
import { addContributor , SelectStorage } from "redux/slices/account/remoxData";
import { useRouter } from 'next/router';
import InputAdornment from '@mui/material/InputAdornment';
import { TextField } from "@mui/material";
import { MdDone} from "react-icons/md";
import IconTextField from "components/IconTextField";
import Loader from "components/Loader";

const AddTeams = () => {
    const navigate = useRouter()
    const [workstreamName, setWorkstreamName] = useState<string>("");
    const { addTeam, isLoading } = useContributors()
    const [error, setError] = useState(false)
    const storage = useAppSelector(SelectStorage);  
    const dispatch = useAppDispatch()

    

    const submit = async () => {
        if(workstreamName.length == 0 ) {
            setError(true)
            return
        }
        if (workstreamName.trim()) {
            try {
                setError(false)
                const team : IContributor = {
                    id: uuidv4(),
                    name: workstreamName,
                    members: [],
                    timestamp: GetTime(),
                    userId: storage!.signType === "individual" ? storage!.individual.id : storage!.organization!.id,
                }   
                await addTeam(team);
                dispatch(addContributor([team]));
                navigate.back()
            } catch (error) {
                console.error(error)
                setError(true)
            }
        }
    }

    return <div className="w-full mx-auto relative">
    <button onClick={() => navigate.back()} className="absolute left-0 w-[4rem] top-0 tracking-wider font-bold transition-all text-primary hover:transition-all flex items-center text-xl gap-2">
    <span className="text-4xl pb-1">&#171;</span> Back
</button>
     <div className="flex flex-col items-center justify-center space-y-10 w-[35%] mx-auto  pt-24">
        <div className="text-2xl self-center pt-5 font-semibold ">Enter Your Workstream</div>
        <div className="flex flex-col w-[85%]">
            <div>
                <IconTextField
                    label="Workstream Name"
                    onChange={(e) => setWorkstreamName(e.target.value)}
                    value={workstreamName}
                    iconEnd={isLoading ? <Loader/> : <MdDone onClick={() => submit()} className="cursor-pointer rounded-full bg-primary h-7 w-7 p-1 text-white "/>}
                    className={`border pl-3 w-full rounded-xl h-10 py-6 text-lg animate__animated animate__shakeX`}
                />
            </div>
            {error && <div className="text-red-600"> Something went wrong</div>}
        </div>
        <div className="flex  gap-x-10 justify-center w-full">
            <Button version="second" onClick={() => navigate.back()} className="px-14 !py-2 font-light">
                Close
            </Button>
        </div>
    </div>
    </div>
}

export default AddTeams;