import { Dispatch } from "react";
import { useAppSelector } from "../../redux/hooks";
import { selectSuccessText } from "../../redux/slices/notificationSlice";
import Button from "../button";

const Success = ({ onClose, className, onAction }: { onClose: Dispatch<boolean>, className?: string, onAction?: () => void }) => {
    const title = useAppSelector(selectSuccessText)

    return <div className={`absolute flex flex-col top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white dark:bg-darkSecond px-10 py-5 shadow-xl gap-8 z-[100] ${className}`}>
        <div className="flex justify-center relative">
            <div className="absolute -right-7 top-1 cursor-pointer text-gray-400" onClick={() => onClose(false)}>X</div>
            <img src="/success.svg" alt="" />
        </div>
        <div className="flex justify-center">{title}</div>
        <Button className="px-16 py-4 font-bold" onClick={() => { if (onAction) onAction(); onClose(false); }}>
            Close
        </Button>
    </div>
}


export default Success;