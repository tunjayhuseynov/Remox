import { useRef, useState } from "react";
import { useAppDispatch } from "redux/hooks"
import { changeSuccess } from 'redux/reducers/notificationSlice'
import Button from "../../../../components/button";
import useContributors from "hooks/useContributors";

const AddTeams = ({ onDisable }: { onDisable: React.Dispatch<boolean> }) => {

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

    return <div className="flex flex-col justify-center space-y-10">
        <div className="grid grid-cols-2 items-center">
            <div>Team Name</div>
            <div>
                <input ref={teamName} type="text" className="border pl-3 w-full rounded-xl h-10 outline-none dark:bg-darkSecond" />
            </div>
            {error && <div className="text-red-600"> Something went wrong</div>}
        </div>
        <div className="flex justify-center">
            <Button onClick={create} isLoading={isLoading} className="px-14 py-2 font-light">
                Add Team
            </Button>
        </div>

    </div>
}

export default AddTeams;