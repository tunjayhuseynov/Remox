
import { useDispatch, useSelector } from 'react-redux';
import { selectDarkMode } from 'redux/slices/notificationSlice';
import Button from 'components/button';
import { AddressReducer } from "utils";
import { useRef, useState } from "react";
import { useRouter } from "next/router";
import { useAppSelector } from "redux/hooks";
import { useWalletKit } from "hooks";
import AnimatedTabBar from 'components/animatedTabBar';
import Upload from "components/upload";
import { useForm, SubmitHandler } from "react-hook-form";
import Dropdown from "components/general/dropdown";
import { DropDownItem } from "types";
import { ToastRun } from 'utils/toast';
import useMultisig from 'hooks/walletSDK/useMultisig';
import useNextSelector from 'hooks/useNextSelector';
import { selectStorage } from 'redux/slices/account/storage';
import { UploadImage } from 'rpcHooks/useFirebase';
import { UploadNFTorImageForUser } from 'hooks/singingProcess/utils';
import { IAccount, Image } from 'firebaseConfig';

interface IFormInput {
    nftAddress?: string;
    nftTokenId?: number;
    name: string;
    multisigAddress?: string;
    confirmOwners?: number;
}

function CreateMultisig() {

    const { register, handleSubmit } = useForm<IFormInput>();

    const { Address: address, blockchain } = useWalletKit();
    const { createMultisigAccount, importMultisigAccount } = useMultisig()
    // const {
    //     createMultisigAccount
    // } = useMultisig()
    const storage = useNextSelector(selectStorage)

    const navigate = useRouter()
    const index = (navigate.query.index as string | undefined) ? +navigate.query.index! : 0
    const isCreate = index === 0;

    const addressRef = useRef<HTMLInputElement>(null)
    const nameRef = useRef<HTMLInputElement>(null)
    const dark = useAppSelector(selectDarkMode)
    const [sign, setSign] = useState<number | undefined>(1)
    const [newOwner, setNewOwner] = useState(false)

    const [owners, setOwners] = useState<{ name: string; address: string; }[]>([])
    const [file, setFile] = useState<File>()
    
    const imageTypes: DropDownItem[] = [{ id: "image", name: "Upload Photo" }, { id: "nft", name: "NFT" }]
    const [selectedImage, setSelectedImage] = useState(imageTypes[0])
    let multisigIsUpload = selectedImage.id === "image"

    const onSubmit: SubmitHandler<IFormInput> = async (data) => {
        try {
            const orgPhoto = file ?? null
            const Owners = owners
            if (multisigIsUpload && !orgPhoto) throw new Error("No file uploaded")
            if (Owners.length === 0) throw new Error("No owners added")

            let image: Parameters<typeof UploadNFTorImageForUser>[0] | undefined;
            if (orgPhoto || data.nftAddress) {
                image =
                {
                    image: {
                        blockchain,
                        imageUrl: orgPhoto ?? data.nftAddress!,
                        nftUrl: data.nftAddress ?? "",
                        tokenId: data.nftTokenId ?? null,
                        type: multisigIsUpload ? "image" : "nft"
                    },
                    name: `organizations/${data.name}`
                }

                await UploadNFTorImageForUser(image)
            }

            let multisig: IAccount;
            if (isCreate) {
                multisig =
                    await createMultisigAccount(
                        Owners.map(s => s.address),
                        data.name,
                        data.confirmOwners ?? 1,
                        data.confirmOwners ?? 1,
                        image?.image ?? null,
                        storage?.organization ? "organization" : "individual"
                    )
            } else {
                multisig =
                    await importMultisigAccount(
                        data.multisigAddress!,
                        data.name,
                        image?.image ?? null,
                        storage?.organization ? "organization" : "individual"
                    )
            }

            navigate.push('/dashboard')

        } catch (error) {
            const err = error as any
            console.error(err)
            ToastRun(<div>{err.message}</div>, "error")
        }
    };


    const addOwner = () => {
        if (addressRef.current?.value && nameRef.current?.value) {
            setOwners([...owners, { name: nameRef.current.value, address: addressRef.current.value }])
            nameRef.current.value = ""
            addressRef.current.value = ""
        }
    }


    const pages = [
        {
            to: "/create-multisig",
            text: "Create Multisig"
        },
        {
            to: "/create-multisig?index=1&noAnimation=true",
            text: "Import Multisig"
        }
    ]


    return <div className="h-screen w-full">
        <header className="flex md:px-40 h-[4.688rem] justify-center md:justify-start items-center absolute top-0 w-full">
            <div>
                <img src={dark ? "/logo.png" : "/logo_white.png"} alt="" width="135" />
            </div>
        </header>
        <form onSubmit={handleSubmit(onSubmit)} className="py-[6.25rem] sm:py-0 sm:h-full " >
            <section className="flex flex-col items-center h-full  gap-6 pt-20">
                <div className="flex flex-col items-center justify-center gap-4">
                    <div className="text-xl sm:text-3xl  dark:text-white text-center font-semibold">Set Account Details</div>
                    <div className="flex  pt-2 w-full justify-between">
                        <AnimatedTabBar data={pages} index={index} className={'!text-lg'} />
                    </div>
                </div>
                <div className="flex flex-col px-3 gap-1 items-center justify-center min-w-[25%]">
                    <div className="flex flex-col mb-4 space-y-1 w-full">
                        {/* <div className="text-xs text-left  dark:text-white">Choose Organisation Profile Photo Type</div> */}
                        <div className={` flex items-center gap-3 w-full rounded-lg`}>
                            <Dropdown parentClass={'bg-white dark:bg-darkSecond w-full rounded-lg h-[3.4rem]'} label="Choose Organisation Profile Photo Type" className={'!rounded-lg h-[3.4rem]'} list={imageTypes} selected={selectedImage} setSelect={setSelectedImage} />
                        </div>
                    </div>
                    {<div className="flex flex-col mb-4 space-y-1 w-full">
                        <div className="text-xs text-left  dark:text-white">{!multisigIsUpload ? "NFT Address" : "Your Photo"} </div>
                        <div className={`  w-full border rounded-lg`}>
                            {!multisigIsUpload ? <input type="text" {...register("nftAddress", { required: true })} className="bg-white dark:bg-darkSecond rounded-lg h-[3.4rem]  w-full px-1" /> : <Upload className={'!h-[3.4rem] block border-none w-full'} setFile={setFile} />}
                        </div>
                    </div>}
                    {blockchain === 'celo' && !multisigIsUpload && <div className="flex flex-col mb-4 gap-1 w-full">
                        <div className="text-xs text-left  dark:text-white">Token ID</div>
                        <div className={`w-full border rounded-lg`}>
                            <input type="number" {...register("nftTokenId", { required: true, valueAsNumber: true })} className="bg-white dark:bg-darkSecond rounded-lg h-[3.4rem] unvisibleArrow  w-full px-1" />
                        </div>
                    </div>}
                    {!isCreate && <div className="flex flex-col mb-4 space-y-1 w-full">
                        <div className="text-xs  text-left  dark:text-white">Multisig Adress</div>
                        <div className={` flex items-center gap-3 w-full border rounded-lg`}>
                            <input type="text" {...register("multisigAddress", { required: true })} className="bg-white dark:bg-darkSecond  h-[3.4rem] rounded-lg w-full px-1" placeholder="Multisig Address" />
                        </div>
                    </div>}
                    <div className="flex flex-col mb-4 space-y-1 w-full">
                        <div className="text-xs  text-left  dark:text-white">Wallet Name</div>
                        <div className={` flex items-center gap-3 w-full border rounded-lg`}>
                            {<input type="text"  {...register("name", { required: true })} placeholder="Remox DAO" className="bg-white dark:bg-darkSecond h-[3.4rem] rounded-lg w-full px-1" />}
                        </div>
                    </div>
                    {newOwner && isCreate && <div className="flex flex-col mb-4 space-y-1 w-full">
                        <span className="text-greylish opacity-35">Add Owners</span>
                        <div className="flex gap-5">
                            <div className={` w-[25%]`}>
                                <div className="w-full mb-4" >
                                    <input ref={nameRef} type="text" className="border p-3 rounded-md  outline-none w-full dark:bg-darkSecond" placeholder="Name" />
                                </div>
                            </div>
                            <div className={` w-[75%]`}>
                                <div className="w-full mb-4">
                                    <input ref={addressRef} type="text" className="border p-3 rounded-md w-full  outline-none  dark:bg-darkSecond" placeholder="0xabc..." />
                                </div>
                            </div>
                        </div>
                        <div className="flex flex-col items-start mb-4  w-full ">
                            <div className="cursor-pointer text-center text-primary opacity-80 px-3  dark:opacity-100" onClick={addOwner}>+ Add to Owner</div>
                        </div>
                    </div>}
                    <div className="flex flex-col space-y-1 w-full">
                        <span className="text-greylish opacity-35">Add Owners</span>
                        <div className="flex gap-5">
                            <div className={` w-[25%]`}>
                                <div className="w-full mb-4" >
                                    <input type="text" readOnly className="cursor-pointer border p-3 rounded-md  outline-none w-full dark:bg-darkSecond" value="Your Name" />
                                </div>
                            </div>
                            <div className={` w-[75%]`}>
                                <div className="w-full mb-4">
                                    <input type="text" readOnly className="cursor-pointer  border p-3 rounded-md w-full bg-greylish bg-opacity-20  outline-none  dark:bg-darkSecond" value={address !== null ? AddressReducer(address) : ""} />
                                </div>
                            </div>
                        </div>
                    </div>
                    {!newOwner && isCreate && <div className="flex flex-col items-start mb-4  w-full ">
                        <div className="cursor-pointer text-center text-primary opacity-80 px-3  dark:opacity-100" onClick={() => { setNewOwner(true) }}>+ Add to Owner</div>
                    </div>}
                    {isCreate && owners.map((w, i) => {
                        return <div key={i} className="flex flex-col  space-y-1 w-full">
                            <div className="flex gap-5">
                                <div className={` w-[25%]`}>
                                    <div className="w-full mb-4" >
                                        <input type="text" className="cursor-pointer border p-3 rounded-md  outline-none w-full dark:bg-darkSecond" value={w.name} />
                                    </div>
                                </div>
                                <div className={` w-[75%]`}>
                                    <div className="w-full mb-4">
                                        <input type="text" className="cursor-pointer  border p-3 rounded-md w-full bg-greylish bg-opacity-20  outline-none  dark:bg-darkSecond" value={w.address !== null ? AddressReducer(w.address) : ""} />
                                    </div>
                                </div>
                            </div>
                        </div>
                    })}
                    {isCreate && <div className="flex flex-col mb-4 space-y-1 w-full">
                        <span className="text-greylish opacity-35 ">Minimum confirmations required for any transactions</span>
                        <div className="w-ful flex justify-start items-center">
                            <input type="number" {...register("confirmOwners", { required: true, valueAsNumber: true })} className="unvisibleArrow border p-3 mr-4 rounded-md outline-none w-[25%] dark:bg-darkSecond" max={owners.length + 1} value={sign} onChange={(e) => { if (!isNaN(+e.target.value)) setSign(+e.target.value || undefined) }} required />
                            <p className="text-greylish w-[30%]">out of {owners.length + 1} owners</p>
                        </div>
                    </div>}
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-2 gap-8 min-w-[26%] pb-5">
                    <Button version="second" onClick={() => navigate.push('/create-organisation')}>Back</Button>
                    {isCreate ? <Button type="submit">Create</Button> : <Button type="submit">Import</Button>}
                </div>
            </section>
        </form>
    </div>

}


CreateMultisig.disableLayout = true
CreateMultisig.disableGuard = true
export default CreateMultisig