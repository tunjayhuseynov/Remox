import { useState } from "react";
import { useDispatch } from "react-redux";
import useMultisigProcess from "hooks/useMultisigProcess";
import { changeError, changeSuccess } from "redux/reducers/notificationSlice";
import Avatar from "components/avatar";
import Button from "components/button";
import Paydropdown from "subpages/pay/paydropdown";
import Upload from "components/upload";
import { useWalletKit } from 'hooks'

const AddOwner = ({ onDisable }: { onDisable: React.Dispatch<boolean> }) => {
    const {blockchain } = useWalletKit();
    const { signAndInternal, owners, addOwner, isLoading, refetch } = useMultisigProcess()
    const [value, setValue] = useState('')
    const [pageIndex, setPageIndex] = useState(0);
    const [file, setFile] = useState<File>()
    const dispatch = useDispatch()


    const [address, setAddress] = useState("");

    const paymentname = ["Upload Photo", "NFT"]

    return <div className=" flex flex-col space-y-6">
        <div className="font-bold text-2xl text-center">Add Owner</div>
        {pageIndex === 0 && <>
            {/* <div className="flex flex-col space-y-3">
                <span>New Owner</span>
                <div>
                    <input type="text" placeholder="Owner Name" className="w-[75%] px-3 py-2 border border-black rounded-lg" />
                </div>
            </div> */}
            <div className="flex flex-col space-y-1">
                <span className="text-greylish">Choose Owner Profile Photo</span>
                <div>
                    <Paydropdown paymentname={paymentname} value={value} setValue={setValue} />
                </div>
            </div>
            {value && <div className="flex flex-col mb-4 space-y-1 w-full">
                <div className="text-xs text-left  dark:text-white">{value === "NFT" ? "NFT Address" : "Your Photo"} </div>
                <div className={`  w-full border rounded-lg`}>
                    {value === "NFT" ? <input type="text" className="bg-white dark:bg-darkSecond rounded-lg h-[3.4rem]  w-full px-1" /> : <Upload className={'!h-[3.4rem] block border-none w-full'} setFile={setFile} />}
                </div>
            </div>}
            {blockchain === 'celo' && value === "NFT" && <div className="flex flex-col mb-4 gap-1 w-full">
                <div className="text-xs text-left  dark:text-white">Token ID</div>
                <div className={`w-full border rounded-lg`}>
                    <input type="number" className="bg-white dark:bg-darkSecond rounded-lg h-[3.4rem] unvisibleArrow  w-full px-1" />
                </div>
            </div>}
            <div className="flex flex-col space-y-1">
                <span className="text-greylish">Owner Name</span>
                <div>
                    <input onChange={(e) => setAddress(e.target.value)} type="text" className="w-full px-3 py-3 border rounded-lg dark:bg-darkSecond" />
                </div>
            </div>
            <div className="flex flex-col space-y-1">
                <span className="text-greylish">Owner Wallet Address</span>
                <div>
                    <input onChange={(e) => setAddress(e.target.value)} type="text" className="w-full px-3 py-3 border rounded-lg dark:bg-darkSecond" />
                </div>
            </div>
            <div className="flex flex-col space-y-1">
                <span className="text-greylish">Owner Email Address (optional)</span>
                <div>
                    <input onChange={(e) => setAddress(e.target.value)} type="text" className="w-full px-3 py-3 border rounded-lg dark:bg-darkSecond" />
                </div>
            </div>
            <div className="flex justify-center pt-4">
                <div className="grid grid-cols-2 gap-5 w-[50%] ">
                    <Button version="second" className={'!px-3 !py-2 !rounded-xl'} onClick={() => onDisable(false)}>Close</Button>
                    <Button className="!px-3 !py-2 !rounded-xl" onClick={() => {
                        if (address) {
                            setPageIndex(1)
                        }
                    }}>
                        Save
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