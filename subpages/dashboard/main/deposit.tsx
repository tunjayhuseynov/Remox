import React from 'react'
import { useAppSelector } from 'redux/hooks';
import { SelectSelectedAccount } from "redux/slices/account/selectedAccount";

function Deposit({ onDisable }: { onDisable: React.Dispatch<boolean> }) {
    const selectedAccount = useAppSelector(SelectSelectedAccount)

    return <div className="sm:flex w-[40%] mx-auto flex-col items-center justify-center gap-5 ">
        <button onClick={() => { onDisable(false);  }} className=" absolute right-full w-[4rem] top-0 translate-x-[175%] translate-y-[25%] tracking-wider font-bold transition-all hover:text-primary hover:transition-all text-xl flex items-center gap-2">
                {/* <img src="/icons/cross_greylish.png" alt="" /> */}
                <span className="text-4xl">&#171;</span> Back
            </button>
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
}

export default Deposit