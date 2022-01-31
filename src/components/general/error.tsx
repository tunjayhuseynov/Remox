import { Dispatch } from "react";
import { useAppSelector } from "../../redux/hooks";
import { selectErrorText } from "../../redux/reducers/notificationSlice";
import Button from "../button";


const Error = ({ onClose }: { onClose: Dispatch<boolean> }) => {
    const title = useAppSelector(selectErrorText)

    return <div className="absolute flex flex-col top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white px-10 py-5 shadow-xl gap-8 z-[100]">
        <div className="flex justify-center relative">
            <div className="absolute -right-7 top-1 cursor-pointer text-gray-400" onClick={() => onClose(false)}>X</div>
            <img src="/icons/error.svg" width="200" alt="" />
        </div>
        <div className="flex justify-center">{title}</div>
        <Button className="px-16 py-4 font-bold" onClick={() => onClose(false)}>
            Close
        </Button>
    </div>
}


export default Error;