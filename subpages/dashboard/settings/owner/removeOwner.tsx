import { useDispatch } from "react-redux";
import useMultisigProcess from "hooks/useMultisigProcess";
import { changeError, changeSuccess } from "redux/slices/notificationSlice";
import Avatar from "components/avatar";
import Button from "components/button";


const RemoveOwner = ({ name, address, onDisable }: { name: string, address: string, onDisable: React.Dispatch<boolean> }) => {

    const { refetch, isLoading, removeOwner } = useMultisigProcess();

    const dispatch = useDispatch()

    return <div className="flex flex-col space-y-8 items-center">
    <div className="text-2xl text-primary">Are You Sure?</div>
    <div className="flex items-center justify-center text-xl">
       Your Are About Delete This Owner
    </div>
    <div className="flex justify-center items-center space-x-4">
        <Button version="second" className="border-2  w-[7rem] h-[2.5rem] !px-1 !py-0" onClick={() => {onDisable(false)}}>No</Button>
        <Button className="  w-[7rem] h-[2.5rem] !px-1 !py-0">Yes</Button>
    </div>
</div>
    // <div className="-my-5 flex flex-col space-y-7">
    //     <div className="font-bold text-xl">Delete Owner</div>
    //     <div className="flex flex-col space-y-3">
    //         <div>
    //             Review the owner
    //         </div>
    //         <div className="flex items-center space-x-2">
    //             <div>
    //                 <Avatar className="bg-opacity-10 font-bold text-xs" name="Ow" />
    //             </div>
    //             <div className="flex flex-col">
    //                 <div>{name}</div>
    //                 <div className="font-thin text-sm">Address: {address.toLowerCase()}</div>
    //             </div>
    //         </div>
    //     </div>
    //     <div className="flex justify-center">
    //         <div className="grid grid-cols-1 gap-5 w-[35%] ">
    //             <Button className="!px-3 !py-2 bg-red-500 hover:text-red-500 hover:bg-white hover:border-red-500" isLoading={isLoading} onClick={async () => {
    //                 try {
    //                     await removeOwner(address)
    //                     refetch()
    //                     dispatch(changeSuccess({activate: true, text: "Successfully"}))
    //                     onDisable(false)
    //                 } catch (error: any) {
    //                     console.error(error)
    //                     dispatch(changeError({ activate: true, text: error?.data?.message }))
    //                     onDisable(false)
    //                 }
    //             }}>
    //                 Delete
    //             </Button>
    //         </div>
    //     </div>
    // </div>



}

export default RemoveOwner;