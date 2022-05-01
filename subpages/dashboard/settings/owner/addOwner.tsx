import { useState } from "react";
import { useDispatch } from "react-redux";
import useMultisigProcess from "hooks/useMultisigProcess";
import { changeError, changeSuccess } from "redux/reducers/notificationSlice";
import Avatar from "components/avatar";
import Button from "components/button";


const AddOwner = ({ onDisable }: { onDisable: React.Dispatch<boolean> }) => {

    const { signAndInternal, owners, addOwner, isLoading, refetch } = useMultisigProcess()

    const [pageIndex, setPageIndex] = useState(0);

    const dispatch = useDispatch()


    const [address, setAddress] = useState("");

    return <div className="-my-5 flex flex-col space-y-7">
        <div className="font-bold text-xl">Add Owner</div>
        {pageIndex === 0 && <>
            {/* <div className="flex flex-col space-y-3">
                <span>New Owner</span>
                <div>
                    <input type="text" placeholder="Owner Name" className="w-[75%] px-3 py-2 border border-black rounded-lg" />
                </div>
            </div> */}
            <div className="flex flex-col space-y-3">
                <span>Wallet Address</span>
                <div>
                    <input onChange={(e) => setAddress(e.target.value)} type="text" placeholder="0xabc..." className="w-full px-3 py-2 border border-black rounded-lg dark:bg-darkSecond" />
                </div>
            </div>
            <div className="flex justify-center">
                <div className="grid grid-cols-2 gap-5 w-[50%] ">
                    <Button version="second" className={'!px-3 !py-2'} onClick={() => onDisable(false)}>Close</Button>
                    <Button className="!px-3 !py-2" onClick={() => {
                        if (address) {
                            setPageIndex(1)
                        }
                    }}>
                        Next
                    </Button>
                </div>
            </div></>}
        {pageIndex === 1 && <>
            <div className="flex border border-primary px-3 py-2 items-center rounded-xl space-x-3">
                <div>
                    <Avatar name="Ow" className="bg-primary text-black bg-opacity-100 font-bold text-xs" />
                </div>
                <div className="flex flex-col">
                    <div>
                        New Owner
                    </div>
                    <div className="text-sm text-greylish">
                        Address: {address}
                    </div>
                    <div className="text-sm text-greylish">
                        Treshold: <span className="font-bold">{signAndInternal?.internalSigns} out of {owners?.length} owners</span>
                    </div>
                </div>
            </div>
            <div className="flex justify-center">
                <div className="grid grid-cols-2 gap-5 w-[50%] ">
                    <Button version="second" className="!px-3 !py-2" onClick={() => setPageIndex(0)}>
                        Back
                    </Button>
                    <Button className="!px-3 !py-2" isLoading={isLoading} onClick={async () => {
                        try {
                            await addOwner(address)
                            refetch()
                            dispatch(changeSuccess({ activate: true, text: "Owner added successfully" }))
                            onDisable(false)
                        } catch (error: any) {
                            console.error(error)
                            dispatch(changeError({ activate: true, text: error?.data?.message }))
                            onDisable(false)
                        }
                    }}>
                        Confirm
                    </Button>
                </div>
            </div></>}
    </div>
}

export default AddOwner;