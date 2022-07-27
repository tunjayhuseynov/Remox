import { useState } from "react";
import { useDispatch } from "react-redux";
import { changeError, changeSuccess } from "redux/slices/notificationSlice";
import Button from "components/button";
import Upload from "components/upload";
import { useWalletKit } from 'hooks'
import Dropdown from "components/general/dropdown";
import { DropDownItem } from "types";
import { useForm, SubmitHandler } from "react-hook-form";
import useMultisig from "hooks/walletSDK/useMultisig";
import useLoading from "hooks/useLoading";
import { IOwnerFormInput } from ".";
import { useRouter } from "next/router";

const ReplaceOwner = ({ onDisable, ownerAddress }: { onDisable: React.Dispatch<boolean>, ownerAddress: string }) => {
    // const { register, handleSubmit } = useForm<IOwnerFormInput>();
    // const { blockchain } = useWalletKit();
    // const { replaceOwner } = useMultisig()
    // const router = useRouter()
    // const {account, }

    // const dispatch = useDispatch()
    // const [file, setFile] = useState<File>()
    // const [photoIsUpload, setPhotoIsUpload] = useState<boolean>(true)
    // const imageType: DropDownItem[] = [{ name: "Upload Photo" }, { name: "NFT" }]
    // const [selectedImage, setSelectedImage] = useState(imageType[0])


    // const onSubmit: SubmitHandler<IOwnerFormInput> = async (data) => {
    //     const Photo = file

    //     if (address) {
    //         try {
    //             await replaceOwner(ownerAddress, address)
    //             dispatch(changeSuccess({ activate: true, text: "Successfully" }))
    //             onDisable(false)
    //         } catch (error: any) {
    //             console.error(error)
    //             dispatch(changeError({ activate: true, text: error?.data?.message }))
    //             onDisable(false)
    //         }
    //     }
    // }

    // const [isLoading, OnSubmit] = useLoading(onSubmit)


    // return <form onSubmit={handleSubmit(OnSubmit)} className=" flex flex-col space-y-6">
    //     <div className="font-bold text-2xl text-center">Replace Owner</div>

    //     <div className="flex flex-col space-y-1">
    //         <span className="text-greylish">Choose Owner Profile Photo</span>
    //         <Dropdown parentClass={'bg-white w-full rounded-lg h-[3.4rem]'} className={'!rounded-lg h-[3.4rem] dark:border-white'} childClass={'!rounded-lg'} list={imageType} selected={selectedImage} onSelect={(e) => {
    //             setSelectedImage(e)
    //             if (e.name === "NFT") setPhotoIsUpload(false)
    //             else setPhotoIsUpload(true)
    //         }} />
    //     </div>
    //     {<div className="flex flex-col mb-4 space-y-1 w-full">
    //         <div className="text-xs text-left  dark:text-white">{!photoIsUpload ? "NFT Address" : "Your Photo"} </div>
    //         <div className={`  w-full border rounded-lg`}>
    //             {!photoIsUpload ? <input type="text" {...register("nftAddress", { required: true })} className="bg-white dark:bg-darkSecond rounded-lg h-[3.4rem]  w-full px-1" /> : <Upload className={'!h-[3.4rem] block border-none w-full'} setFile={setFile} />}
    //         </div>
    //     </div>}
    //     {blockchain === 'celo' && !photoIsUpload && <div className="flex flex-col mb-4 gap-1 w-full">
    //         <div className="text-xs text-left  dark:text-white">Token ID</div>
    //         <div className={`w-full border rounded-lg`}>
    //             <input type="number" {...register("nftTokenId", { required: true, valueAsNumber: true })} className="bg-white dark:bg-darkSecond rounded-lg h-[3.4rem] unvisibleArrow  w-full px-1" />
    //         </div>
    //     </div>}
    //     <div className="flex flex-col space-y-1">
    //         <span className="text-greylish">Owner Name</span>
    //         <div>
    //             <input {...register("name", { required: true })} type="text" className="w-full px-3 py-3 border rounded-lg dark:bg-darkSecond" />
    //         </div>
    //     </div>
    //     <div className="flex flex-col space-y-1">
    //         <span className="text-greylish">Owner Wallet Address</span>
    //         <div>
    //             <input  {...register("address", { required: true })} type="text" className="w-full px-3 py-3 border rounded-lg dark:bg-darkSecond" />
    //         </div>
    //     </div>
    //     <div className="flex flex-col space-y-1">
    //         <span className="text-greylish">Owner Email Address (optional)</span>
    //         <div>
    //             <input {...register("email", { required: true })} type="text" className="w-full px-3 py-3 border rounded-lg dark:bg-darkSecond" />
    //         </div>
    //     </div>
    //     <div className="flex justify-center">
    //         <div className="grid grid-cols-2 gap-5 w-[60%] ">
    //             <Button version="second" className={'!rounded-xl'} onClick={() => { onDisable(false) }}>Close</Button>
    //             <Button type="submit" className="!px-3 !py-2 !rounded-xl" isLoading={isLoading}>
    //                 Save
    //             </Button>
    //         </div>
    //     </div>
    // </form>
}

export default ReplaceOwner;