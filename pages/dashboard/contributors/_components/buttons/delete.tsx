import { Dispatch, useState } from "react";
import Button from "components/button";

const Delete = ({ name, onCurrentModal, onDelete, onSuccess }: { name: string, onCurrentModal: Dispatch<boolean>, onDelete?: () => Promise<void>, onSuccess?: Dispatch<boolean> }) => {
    const [loading, setLoading] = useState(false)

    const deleteHandler = async () => {
        setLoading(true)
        await onDelete?.()
        setLoading(false)
    }

    return <div className="flex flex-col space-y-10 items-center">
        <div className="text-2xl text-primary">Are You Sure?</div>
        <div className="flex items-center justify-center text-xl">
            Your Are About Delete {name}.
        </div>
        <div className="flex justify-center items-center space-x-4">
            <Button version="second" className="border-2  w-[7rem] h-[3rem] !px-1 !py-0 rounded-lg" onClick={() => onCurrentModal(false)}>No</Button>
            <Button className="w-[7rem] h-[3rem] !px-1 !py-0 rounded-lg" isLoading={loading} onClick={deleteHandler}>Yes</Button>
        </div>
    </div>
}

export default Delete;