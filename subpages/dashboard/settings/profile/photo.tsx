import React, { Dispatch, SetStateAction, useState } from 'react'
import Button from "components/button";
import Dropdown from "components/general/dropdown";
import { DropDownItem } from "types";
import { useForm, SubmitHandler } from "react-hook-form";
import { useWalletKit } from 'hooks'
import Upload from "components/upload";

export interface IFormInput {
    nftAddress?: string;
    nftTokenId?: number;
}

function Photo({setPhoto,photo}:{setPhoto:Dispatch<SetStateAction<boolean>>,photo:File | undefined }) {
    const { register, handleSubmit } = useForm<IFormInput>();
    const { blockchain } = useWalletKit();
    const [file, setFile] = useState<File>()

    const [photoIsUpload, setPhotoIsUpload] = useState<boolean>(true)
    const paymentname: DropDownItem[] = [{ name: "Upload Photo" }, { name: "NFT" }]
    const [selectedPayment, setSelectedPayment] = useState(paymentname[0])

    const onSubmit: SubmitHandler<IFormInput> = data => {
        const Photo = file
        console.log(data,Photo)
    }

    return <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col space-y-6 items-center w-full">
        <div className="flex  font-semibold tracking-wider text-2xl">
            {photo ? 'Edit' : 'Add'} Your Photo
        </div>
        <div className="flex flex-col gap-6 items-end space-x-12 w-full px-4">
            <div className="flex flex-col space-y-3 w-full">
                <label className="text-greylish dark:text-white">Choose Photo</label>
                <Dropdown parentClass={'bg-white w-full rounded-lg h-[3.4rem]'} className={'!rounded-lg h-[3.4rem]'} childClass={'!rounded-lg'} list={paymentname} selected={selectedPayment} setSelect={(e) => {
                    setSelectedPayment(e)
                    if (e.name === "NFT") setPhotoIsUpload(false)
                    else setPhotoIsUpload(true)
                }} />
            </div>
                    {<div className="flex flex-col  space-y-3 w-full">
            <div className="text-greylish dark:text-white text-left">{!photoIsUpload ? "NFT Address" : "Your Photo"} </div>
            <div className={`  w-full border border-greylish dark:border-greylish rounded-lg`}>
                {!photoIsUpload ? <input type="text" {...register("nftAddress", { required: true})} className="bg-white dark:bg-darkSecond  h-[3.4rem] rounded-lg  w-full px-1" /> : <Upload className={'!h-[3.4rem] block !rounded-lg  border-none w-full'} setFile={setFile} />}
            </div>
        </div>}
        {blockchain === 'celo' && !photoIsUpload && <div className="flex flex-col mb-4 gap-1 w-full">
            <div className="text-greylish bg-opacity-50 text-left  dark:text-white">Token ID</div>
            <div className={`w-full border rounded-lg`}>
                <input type="number" {...register("nftTokenId", { required: true,valueAsNumber: true })} className="bg-white dark:bg-darkSecond rounded-lg h-[3.4rem] unvisibleArrow  w-full px-1" />
            </div>
        </div>}
        </div>
        <div className="flex justify-center gap-8">
            <Button version="second" onClick={() => setPhoto(false)} className="px-8 !py-2">
                Close
            </Button>
            <Button type="submit" className="!py-2"  >
                Save
            </Button>
        </div>
    </form>
}

export default Photo