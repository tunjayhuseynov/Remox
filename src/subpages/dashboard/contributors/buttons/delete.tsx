import { Dispatch, useState } from "react";

import { changeSuccess } from "redux/reducers/notificationSlice";
import { useAppDispatch } from "redux/hooks";
import Button from "../../../../components/button";

const Delete = ({ name, onCurrentModal, onDelete, onSuccess }: { name: string, onCurrentModal: Dispatch<boolean>, onDelete: () => Promise<void>, onSuccess?: Dispatch<boolean> }) => {
    const [loading, setLoading] = useState(false)
    const dispatch = useAppDispatch()
    return <div className="flex flex-col space-y-6">
        <div className="flex items-center justify-center text-xl">
            Delete {name}?
        </div>
        <div className="flex justify-center items-center space-x-4">
            <Button version="second" className="border-2 border-red-500 hover:bg-red-500 text-red-500 w-[80px] h-[27px] px-1 py-0" onClick={() => onCurrentModal(false)}>Close</Button>
            <Button className="bg-red-500 hover:bg-red-500 hover:text-white border-red-500 text-white w-[80px] h-[27px] px-1 py-0" onClick={async () => {
                setLoading(true);
                try {
                    //onSuccess(true) 
                    await onDelete()
                    setLoading(false)
                    dispatch(changeSuccess({ activate: true, text: "Successfully Deleted" }))
                    //onCurrentModal(false)
                } catch (error) {
                    console.error(error)
                    setLoading(false)
                }
            }} isLoading={loading}>Delete</Button>
        </div>
    </div>
}

export default Delete;