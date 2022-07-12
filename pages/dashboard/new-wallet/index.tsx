import React from 'react'
import Button from "components/button";
import AnimatedTabBar from 'components/animatedTabBar';
import { useState, useEffect } from "react";
import useMultiWallet from 'hooks/useMultiWallet';
import { useWalletKit } from 'hooks'
import { useRouter } from 'next/router';
import Upload from "components/upload";
import Dropdown from "components/general/dropdown";
import { DropDownItem } from "types";
import { useForm, SubmitHandler } from "react-hook-form";

export interface IFormInput {
    nftAddress?: string;
    nftTokenId?: number;
    name: string;
    address: string;

}
function NewWalletModal() {
    const { register, handleSubmit } = useForm<IFormInput>();
    const navigate = useRouter()
    const index = (navigate.query.index as string | undefined) ? +navigate.query.index! : 0
    const { blockchain } = useWalletKit();
    const { addWallet } = useMultiWallet()
    const [file, setFile] = useState<File>()
    const [organizationIsUpload, setOrganizationIsUpload] = useState<boolean>(true)
    const paymentname: DropDownItem[] = [{ name: "Upload Photo" }, { name: "NFT" }]
    const paymentname2: DropDownItem[] = [{ name: "Celo" }, { name: "Solana" }]
    const [selectedPayment, setSelectedPayment] = useState(paymentname[0])
    const [selectedPayment2, setSelectedPayment2] = useState(paymentname2[0])

    const data = [
        {
            to: "/dashboard/new-wallet",
            text: "Import Wallet"
        },
        {
            to: "/dashboard/new-wallet?index=1&noAnimation=true",
            text: "Connect Wallet"
        }
    ]

    const connectEvent = async () => {
        try {
            await addWallet()
        } catch (error) {

        }
        navigate.back();
    }

    useEffect(() => {
        if (index == 1) {
            connectEvent()
        }
    }, [index])


    const onSubmit: SubmitHandler<IFormInput> = data => {
        const photo = file;
        const provider = selectedPayment2.name;
        console.log(data, photo, provider)
    }

    return <div className="w-full mx-auto relative">
        <button onClick={() => navigate.back()} className="absolute left-0 w-[4rem] top-0 tracking-wider font-bold transition-all hover:text-primary hover:transition-all flex items-center text-xl gap-2">
            {/* <img src="/icons/cross_greylish.png" alt="" /> */}
            <span className="text-4xl pb-1">&#171;</span> Back
        </button>
        <div className=" w-1/2 mx-auto sm:flex flex-col items-center justify-center ">
            <div className=" text-center w-full pt-4">
                <div className="text-2xl font-bold">Add New Wallet</div>
            </div>
            <div className="flex justify-between w-[60%]  xl:w-[38%] py-7"><AnimatedTabBar data={data} index={index} /></div>

            {index === 0 && <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col w-[62%] gap-7">
                <div className="flex flex-col gap-1">
                    <div className="text-sm">Choose Profile Photo Type</div>
                    <Dropdown parentClass={'bg-white dark:bg-darkSecond  w-full rounded-lg h-[3.4rem]'} className={'!rounded-lg h-[3.4rem]  dark:border-white'} childClass={'!rounded-lg'} list={paymentname} selected={selectedPayment} onSelect={(e) => {
                        setSelectedPayment(e)
                        if (e.name === "NFT") setOrganizationIsUpload(false)
                        else setOrganizationIsUpload(true)
                    }} />
                </div>
                {<div className={`flex flex-col  gap-1 w-full`}>
                    <div className="text-xs text-left  dark:text-white">{!organizationIsUpload ? "NFT Address" : "Your Photo"} </div>
                    <div className={`  w-full border rounded-lg`}>
                        {!organizationIsUpload ? <input type="text" {...register("nftAddress", { required: true })} className="bg-white dark:bg-darkSecond rounded-lg h-[3.4rem]  w-full px-1" /> : <Upload className={'!h-[3.4rem] block border-none w-full'} setFile={setFile} />}
                    </div>
                </div>}
                {blockchain === 'celo' && !organizationIsUpload && <div className="flex flex-col  gap-1 w-full">
                    <div className="text-xs text-left  dark:text-white">Token ID</div>
                    <div className={`w-full border rounded-lg`}>
                        <input type="number" {...register("nftTokenId", { required: true })} className="bg-white dark:bg-darkSecond rounded-lg h-[3.4rem] unvisibleArrow  w-full px-1" />
                    </div>
                </div>}
                <div className="flex flex-col gap-1">
                    <div className="text-sm">Choose Wallet Provider</div>
                    <Dropdown parentClass={'bg-white w-full rounded-lg h-[3.4rem]'} className={'!rounded-lg h-[3.4rem] dark:border-white'} childClass={'!rounded-lg'} list={paymentname2} selected={selectedPayment2} onSelect={(e) => {
                        setSelectedPayment2(e)
                    }} />
                </div>
                <div className="flex flex-col gap-1">
                    <div className="text-sm">Wallet Name</div>
                    <input type="text" {...register("name", { required: true })} placeholder="Remox DAO" className="border w-full py-3 text-base rounded-md px-3 dark:bg-darkSecond" />
                </div>
                <div className="flex flex-col gap-1">
                    <div className="text-sm">Wallet Address</div>
                    <input type="text" {...register("address", { required: true })} placeholder="Wallet Adress" className="border w-full py-3 text-base rounded-md px-3 dark:bg-darkSecond" />
                </div>
                <div className="grid grid-cols-2 gap-x-10 pt-1 pb-2 justify-center">
                    <Button version="second" className="px-6 py-3 rounded-md" onClick={() => { navigate.back() }}>
                        Close
                    </Button>
                    <Button type='submit' className="px-6 py-3 rounded-md"  >
                        Save
                    </Button>
                </div>
            </form>}

        </div>


    </div>
}

export default NewWalletModal