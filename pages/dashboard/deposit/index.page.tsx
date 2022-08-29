import React from 'react'
import { useRouter } from "next/router";

function Deposit({ onDisable }: { onDisable: React.Dispatch<boolean> }) {
    const navigate = useRouter()
    const selectedAccount = navigate.query.address;
    const id = navigate.query.id;

    return <div className="w-full mx-auto relative">
        <button onClick={() => navigate.back()} className="absolute left-0 w-[4rem] top-0 tracking-wider font-bold transition-all hover:text-primary hover:transition-all flex items-center text-xl gap-2">
            <span className="text-4xl pb-1">&#171;</span> Back
        </button>
        <div className="sm:flex w-[40%] mx-auto flex-col items-center justify-center gap-5 ">
            <div className=" text-center w-full pt-5 pb-16">
                <div className="text-2xl font-bold">Deposit</div>
            </div>
            <div className="">
                <img src="/icons/qrCode.png" alt="" className="w-[14rem] h-[14rem]" />
            </div>
            <div className="bg-[#D6D6D6] bg-opacity-20 w-full py-2 px-1  flex items-center justify-center gap-3 rounded-lg border">
                <div className="w-8 h-8 rounded-full bg-greylish bg-opacity-40"></div>
                <div className="text-greylish">{selectedAccount}</div>
                <div className="flex gap-3">
                    <div className="text-2xl font-semibold">
                        <img src="/icons/copyicon.png" alt="" className="w-5 h-5 cursor-pointer" /></div>
                    <img src="/icons/edit.png" className="w-5 h-5 cursor-pointer" alt="" />
                </div>
            </div>
        </div>
    </div>
}

export default Deposit