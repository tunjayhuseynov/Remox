import { useState } from "react";
import { useDispatch } from "react-redux";
import useMultisigProcess from "hooks/useMultisigProcess";
import { changeError, changeSuccess } from "redux/reducers/notificationSlice";
import Button from "components/button";
import Paydropdown from "subpages/pay/paydropdown";
import Upload from "components/upload";
import { useWalletKit } from 'hooks'

const ReplaceOwner = ({ onDisable, ownerAddress }: { onDisable: React.Dispatch<boolean>, ownerAddress: string }) => {
    const {blockchain } = useWalletKit();
    const { replaceOwner, isLoading, refetch } = useMultisigProcess()
    const [value, setValue] = useState('')
    const dispatch = useDispatch()
    const [file, setFile] = useState<File>()

    const [address, setAddress] = useState(ownerAddress);
    const paymentname = ["Upload Photo", "NFT"]

    return <div className=" flex flex-col space-y-6">
        <div className="font-bold text-2xl text-center">Replace Owner</div>
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
        {blockchain === 'celo' &&  value === "NFT" && <div className="flex flex-col mb-4 gap-1 w-full">
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
        <div className="flex justify-center">
            <div className="grid grid-cols-2 gap-5 w-[60%] ">
                <Button version="second" className={'!rounded-xl'} onClick={() => { onDisable(false) }}>Close</Button>
                <Button className="!px-3 !py-2 !rounded-xl" isLoading={isLoading} onClick={async () => {
                    if (address) {
                        try {
                            await replaceOwner(ownerAddress, address)
                            dispatch(changeSuccess({ activate: true, text: "Successfully" }))
                            refetch()
                            onDisable(false)
                        } catch (error: any) {
                            console.error(error)
                            dispatch(changeError({ activate: true, text: error?.data?.message }))
                            onDisable(false)
                        }
                    }
                }}>
                    Save
                </Button>
            </div>
        </div>
    </div>
}

export default ReplaceOwner;