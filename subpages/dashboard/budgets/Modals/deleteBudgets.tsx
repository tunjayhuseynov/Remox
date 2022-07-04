import { useDispatch } from "react-redux";
import useMultisigProcess from "hooks/useMultisigProcess";
import { changeError, changeSuccess } from "redux/slices/notificationSlice";
import Avatar from "components/avatar";
import Button from "components/button";


const DeletBudget = ({ name, address, onDisable }: { name?: string, address?: string, onDisable: React.Dispatch<boolean> }) => {

    const { refetch, isLoading, removeOwner } = useMultisigProcess();

    const dispatch = useDispatch()

    return <div className="flex flex-col space-y-10 items-center">
    <div className="text-2xl text-primary">Are You Sure?</div>
    <div className="flex items-center justify-center text-xl">
       Your Are About Delete This Budget
    </div>
    <div className="flex justify-center items-center space-x-4">
        <Button version="second" className="!rounded-xl border-2  w-[7rem] h-[2.5rem] !px-1 !py-0" onClick={() => {onDisable(false)}}>No</Button>
        <Button className="!rounded-xl   w-[7rem] h-[2.5rem] !px-1 !py-0">Yes</Button>
    </div>
</div>
}

export default DeletBudget;