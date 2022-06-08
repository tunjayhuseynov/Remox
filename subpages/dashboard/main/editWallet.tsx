import React, { useState } from 'react'
import { AddressReducer } from "../../../utils";
import { useAppSelector } from 'redux/hooks';
import { SelectSelectedAccount } from "redux/reducers/selectedAccount";
import Button from "components/button";
import Paydropdown from "subpages/pay/paydropdown";
import Upload from "components/upload";
import { useWalletKit } from "hooks";

function EditWallet({ onDisable }: { onDisable: React.Dispatch<boolean> }) {
    const selectedAccount = useAppSelector(SelectSelectedAccount)
    const [value, setValue] = useState('')
    const [file, setFile] = useState<File>()
    const {blockchain } = useWalletKit()

    const paymentname = ["Upload Photo", "NFT"]

    return (
        <div className="flex flex-col items-center justify-center gap-7">
            <div className="text-2xl font-bold pb-2">Edit Wallet</div>
            <div className="flex flex-col w-[62%] gap-8">
                <div className="flex flex-col gap-1">
                    <div className="text-sm">Choose Profile Picture Photo</div>
                    <Paydropdown paymentname={paymentname} value={value} setValue={setValue} />
                </div>
                {value && <div className="flex flex-col mb-4 space-y-1 w-full">
                    <div className="text-xs text-left  dark:text-white">{value === "NFT" ? "NFT Address" : "Your Photo"} </div>
                    <div className={`  w-full border rounded-lg`}>
                        {value === "NFT" ? <input type="text" className="bg-white dark:bg-darkSecond rounded-lg h-[3.4rem]  w-full px-1" /> : <Upload className={'!h-[3.4rem] block border-none w-full'} setFile={setFile} />}
                    </div>
                </div>}
                {blockchain === 'celo' && value === "NFT" && <div className="flex flex-col mb-4 gap-1 w-full">
                    <div className="text-xs text-left  dark:text-white">Token ID</div>
                    <div className={`w-full border rounded-lg`}>
                        <input type="number" className="bg-white dark:bg-darkSecond rounded-lg h-[3.4rem] unvisibleArrow  w-full px-1" />
                    </div>
                </div>}
                <div className="flex flex-col gap-1">
                    <div className="text-sm">Wallet Name</div>
                    <input type="text" placeholder="Remox DAO" className="border w-full py-3 text-base rounded-md px-3 dark:bg-darkSecond" />
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
            </div>
        </div>
    )
}

export default EditWallet