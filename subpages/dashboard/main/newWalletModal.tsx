import React from 'react'
import { useFirestoreSearchField } from 'rpcHooks/useFirebase';
import { IUser } from 'firebaseConfig';
import Button from "components/button";
import AnimatedTabBar from 'components/animatedTabBar';
import { useState, useEffect } from "react";
import useMultiWallet from 'hooks/useMultiWallet';
import { useWalletKit } from 'hooks'
import { useRouter } from 'next/router';
import Paydropdown from "subpages/pay/paydropdown";
import Upload from "components/upload";

function NewWalletModal({ onDisable }: { onDisable: React.Dispatch<boolean> }) {
    const [text, setText] = useState('Import Wallet')
    const [value, setValue] = useState('')
    const [value2, setValue2] = useState('')
    const navigate = useRouter()
    const { Connect, Address } = useWalletKit();
    const [stream, setStream] = useState(false)
    const { search, isLoading } = useFirestoreSearchField<IUser>()
    const { addWallet } = useMultiWallet()
    const [selectedItem, setItem] = useState<any>(null)
    const [address, setAddress] = useState<string | null>(null)
    const [file, setFile] = useState<File>()

    useEffect(() => setAddress(Address), [Address])

    const data = [
        {
            to: "",
            text: "Import Wallet"
        },
        {
            to: "",
            text: "Connect Wallet"
        }
    ]

    const connectEvent = () => {
        addWallet().catch(e => console.error(e))
    }
    if (text === "Connect Wallet") {
        connectEvent()
        onDisable(false)
    }

    const paymentname = ["Upload Photo", "NFT"]
    const paymentname2 = ["Celo", "Solana"]

    return <>
        <div>
            <div className="sm:flex flex-col items-center justify-center ">

                <div className=" text-center w-full">
                    <div className="text-2xl font-bold">Add New Wallet</div>
                </div>
                <div className="flex justify-between w-[60%]  xl:w-[38%] py-7"><AnimatedTabBar data={data} setText={setText} setStream={setStream} /></div>

                {text === "Import Wallet" && <div className="flex flex-col w-[62%] gap-8">
                    <div className="flex flex-col gap-1">
                        <div className="text-sm">Choose Profile Photo Type</div>
                        <Paydropdown paymentname={paymentname} value={value} setValue={setValue} />
                    </div>
                    {value && <div className="flex flex-col mb-4 space-y-1 w-full">
                        <div className="text-xs text-left  dark:text-white">{value === "NFT" ? "NFT Address" : "Your Photo"} </div>
                        <div className={`  w-full border rounded-lg`}>
                            {value === "NFT" ? <input type="text" className="bg-white dark:bg-darkSecond rounded-lg h-[3.4rem]  w-full px-1" /> : <Upload className={'!h-[3.4rem] block border-none w-full'} setFile={setFile} />}
                        </div>
                    </div>}
                    <div className="flex flex-col gap-1">
                        <div className="text-sm">Choose Wallet Provider</div>
                        <Paydropdown paymentname={paymentname2} value={value2} setValue={setValue2} />
                    </div>
                    <div className="flex flex-col gap-1">
                        <div className="text-sm">Wallet Name</div>
                        <input type="text" placeholder="Remox DAO" className="border w-full py-3 text-base rounded-md px-3 dark:bg-darkSecond" />
                    </div>
                    <div className="flex flex-col gap-1">
                        <div className="text-sm">Wallet Address</div>
                        <input type="text" placeholder="Wallet Adress" className="border w-full py-3 text-base rounded-md px-3 dark:bg-darkSecond" />
                    </div>
                    <div className="grid grid-cols-2 gap-x-10 pt-5 justify-center">
                        <Button version="second" className="px-6 py-3 rounded-md" onClick={() => { onDisable(false) }}>
                            Close
                        </Button>
                        <Button type='submit' className="px-6 py-3 rounded-md"  >
                            Save
                        </Button>
                    </div>
                </div>}
                {/* {text==="Connect Wallet" && <Button onClick={connectEvent} className={'my-5 mx-5'}>Select Provider</Button> } */}
            </div>
        </div>

    </>
}

export default NewWalletModal