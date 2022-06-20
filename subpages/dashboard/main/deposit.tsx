import React from 'react'
import { useAppSelector } from 'redux/hooks';
import { SelectSelectedAccount } from "redux/reducers/selectedAccount";

function Deposit() {
    const selectedAccount = useAppSelector(SelectSelectedAccount)

    return <div className="sm:flex flex-col items-center justify-center gap-5 ">
        <div className=" text-center w-full">
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