import { useState } from "react";
import { useDispatch } from "react-redux";
import useMultisigProcess from "hooks/useMultisigProcess";
import { changeError, changeSuccess } from "redux/reducers/notificationSlice";
import Avatar from "components/avatar";
import Button from "components/button";
import Upload from "components/upload";
import { useWalletKit } from 'hooks'
import Dropdown from "components/general/dropdown";
import { DropDownItem } from "types";
import { useForm, SubmitHandler } from "react-hook-form";


export interface IFormInput {
    nftAddress?: string;
    nftTokenId?: number;
    name: string;
    address:string;
    email?:string;

}

const AddOwner = ({ onDisable }: { onDisable: React.Dispatch<boolean> }) => {
    const { register, handleSubmit } = useForm<IFormInput>();
    const { blockchain } = useWalletKit();
    const { signAndInternal, owners, addOwner, isLoading, refetch } = useMultisigProcess()
    const [pageIndex, setPageIndex] = useState(0);
    const [file, setFile] = useState<File>()
    const dispatch = useDispatch()
    const [photoIsUpload, setPhotoIsUpload] = useState<boolean>(true)
    const paymentname: DropDownItem[] = [{ name: "Upload Photo" }, { name: "NFT" }]
    const [selectedPayment, setSelectedPayment] = useState(paymentname[0])

    const [address, setAddress] = useState("");



    const onSubmit: SubmitHandler<IFormInput> = data => {
        const Photo = file
        console.log(data,Photo)

    }

    return <div className=" flex flex-col space-y-6">
        <div className="font-bold text-2xl text-center">Add Owner</div>
        {pageIndex === 0 && <form  onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-6">
            <div className="flex flex-col space-y-1">
                <span className="text-greylish">Choose Owner Profile Photo</span>
                <Dropdown parentClass={'bg-white w-full rounded-lg h-[3.4rem]'} className={'!rounded-lg h-[3.4rem]'} childClass={'!rounded-lg'} list={paymentname} selected={selectedPayment} onSelect={(e) => {
                    setSelectedPayment(e)
                    if (e.name === "NFT") setPhotoIsUpload(false)
                    else setPhotoIsUpload(true)
                }} />
            </div>
            {<div className="flex flex-col  space-y-1 w-full">
                <div className="text-xs text-left  dark:text-white">{!photoIsUpload ? "NFT Address" : "Your Photo"} </div>
                <div className={`  w-full border rounded-lg`}>
                    {!photoIsUpload ? <input type="text" {...register("nftAddress", { required: true })} className="bg-white dark:bg-darkSecond rounded-lg h-[3.4rem]  w-full px-1" /> : <Upload className={'!h-[3.4rem] block border-none w-full'} setFile={setFile} />}
                </div>
            </div>}
            {blockchain === 'celo' && !photoIsUpload  && <div className="flex flex-col gap-1 w-full">
                <div className="text-xs text-left  dark:text-white">Token ID</div>
                <div className={`w-full border rounded-lg`}>
                    <input type="number" {...register("nftTokenId", { required: true })} className="bg-white dark:bg-darkSecond rounded-lg h-[3.4rem] unvisibleArrow  w-full px-1" />
                </div>
            </div>}
            <div className="flex flex-col space-y-1">
                <span className="text-greylish">Owner Name</span>
                <div>
                    <input  {...register("name", { required: true })} type="text" className="w-full px-3 py-3 border rounded-lg dark:bg-darkSecond" />
                </div>
            </div>
            <div className="flex flex-col space-y-1">
                <span className="text-greylish">Owner Wallet Address</span>
                <div>
                    <input {...register("address", { required: true })} type="text" className="w-full px-3 py-3 border rounded-lg dark:bg-darkSecond" />
                </div>
            </div>
            <div className="flex flex-col space-y-1">
                <span className="text-greylish">Owner Email Address (optional)</span>
                <div>
                    <input {...register("email", { required: true })} type="text" className="w-full px-3 py-3 border rounded-lg dark:bg-darkSecond" />
                </div>
            </div>
            <div className="flex justify-center pt-4">
                <div className="grid grid-cols-2 gap-5 w-[50%] ">
                    <Button version="second" className={'!px-3 !py-2 !rounded-xl'} onClick={() => onDisable(false)}>Close</Button>
                    <Button type="submit" className="!px-3 !py-2 !rounded-xl" onClick={() => {
                        if (address) {
                            setPageIndex(1)
                        }
                    }}>
                        Save
                    </Button>
                </div>
            </div>
            </form>}
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