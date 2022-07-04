import React, { useState } from 'react'
import { AddressReducer } from "../../../utils";
import { useAppSelector } from 'redux/hooks';
import { SelectSelectedAccount } from "redux/reducers/selectedAccount";
import Button from "components/button";
import Paydropdown from "subpages/pay/paydropdown";
import Upload from "components/upload";
import { useWalletKit } from "hooks";
import Dropdown from "components/general/dropdown";
import { DropDownItem } from "types";
import { useForm, SubmitHandler } from "react-hook-form";

export interface IFormInput {
    nftAddress?: string;
    nftTokenId?: number;
    name: string;
    address: string;

}

function EditWallet({ onDisable }: { onDisable: React.Dispatch<boolean> }) {
    const { register, handleSubmit } = useForm<IFormInput>();
    const selectedAccount = useAppSelector(SelectSelectedAccount)
    const [value, setValue] = useState('')
    const [file, setFile] = useState<File>()
    const { blockchain } = useWalletKit()
    const [organizationIsUpload, setOrganizationIsUpload] = useState<boolean>(true)
    const paymentname: DropDownItem[] = [{ name: "Upload Photo" }, { name: "NFT" }]
    const [selectedPayment, setSelectedPayment] = useState(paymentname[0])


    const onSubmit: SubmitHandler<IFormInput> = data => {
        const photo = file;
        console.log(data, photo)
    }

    return (
        <div className="flex flex-col  w-1/2  mx-auto items-center justify-center gap-7">
            <button onClick={() => { onDisable(false); }} className=" absolute right-full w-[4rem] top-0 translate-x-[175%] translate-y-[25%] tracking-wider font-bold transition-all hover:text-primary hover:transition-all text-xl flex items-center gap-2">
                {/* <img src="/icons/cross_greylish.png" alt="" /> */}
                <span className="text-4xl">&#171;</span> Back
            </button>
            <div className="text-2xl font-bold pb-2 pt-5">Edit Wallet</div>
            <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col w-[62%] gap-8">
                <div className="flex flex-col gap-1">
                    <div className="text-sm">Choose Profile Picture Photo</div>
                    <Dropdown parentClass={'bg-white w-full rounded-lg h-[3.4rem]'} className={'!rounded-lg h-[3.4rem]'} childClass={'!rounded-lg'} list={paymentname} selected={selectedPayment} onSelect={(e) => {
                        setSelectedPayment(e)
                        if (e.name === "NFT") setOrganizationIsUpload(false)
                        else setOrganizationIsUpload(true)
                    }} />
                </div>
                {<div className="flex flex-col  space-y-1 w-full">
                    <div className="text-xs text-left  dark:text-white">{!organizationIsUpload ? "NFT Address" : "Your Photo"} </div>
                    <div className={`  w-full border rounded-lg`}>
                        {!organizationIsUpload ? <input type="text" className="bg-white dark:bg-darkSecond rounded-lg h-[3.4rem]  w-full px-1" /> : <Upload className={'!h-[3.4rem] block border-none w-full'} setFile={setFile} />}
                    </div>
                </div>}
                {blockchain === 'celo' && !organizationIsUpload && <div className="flex flex-col  gap-1 w-full">
                    <div className="text-xs text-left  dark:text-white">Token ID</div>
                    <div className={`w-full border rounded-lg`}>
                        <input type="number" className="bg-white dark:bg-darkSecond rounded-lg h-[3.4rem] unvisibleArrow  w-full px-1" />
                    </div>
                </div>}
                <div className="flex flex-col gap-1">
                    <div className="text-sm">Wallet Name</div>
                    <input type="text" {...register("name", { required: true })} placeholder="Remox DAO" className="border w-full py-3 text-base rounded-md px-3 dark:bg-darkSecond" />
                </div>
                <div className="flex flex-col gap-1">
                    <div className="text-sm">Wallet Address</div>
                    <div className="border w-full py-3 text-base rounded-md px-3 dark:bg-darkSecond bg-greylish bg-opacity-30">{AddressReducer(selectedAccount)}</div>
                </div>
                <div className="grid grid-cols-2 gap-x-10 pt-5 justify-center">
                    <Button version="second" className="px-8 py-2 rounded-md" onClick={() => { onDisable(false) }}>
                        Close
                    </Button>
                    <Button type='submit' className="px-8 py-2 rounded-md"  >
                        Save
                    </Button>
                </div>
            </form>
        </div>
    )
}

export default EditWallet