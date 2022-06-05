
import { useDispatch, useSelector } from 'react-redux';
import { changeError, changeSuccess, selectDarkMode } from 'redux/reducers/notificationSlice';
import { selectStorage } from 'redux/reducers/storage';
import Button from 'components/button';
import useMultisig from 'hooks/walletSDK/useMultisig';
import { AddressReducer } from "utils";
import { useRef, useState, Dispatch } from "react";
import { SelectSelectedAccount } from 'redux/reducers/selectedAccount';
import { useRouter } from "next/router";
import { useAppSelector } from "redux/hooks";
import { useWalletKit } from "hooks";
import Paydropdown from "subpages/pay/paydropdown";
import AnimatedTabBar from 'components/animatedTabBar';
import Upload from "components/upload";

function CreateMultisig() {

    const { data, importMultisigAccount, createMultisigAccount, isLoading } = useMultisig()
    const storage = useSelector(selectStorage)
    const { Address, Wallet, blockchain } = useWalletKit();
    const address = Address
    const dispatch = useDispatch()
    const navigate = useRouter()
    const addressRef = useRef<HTMLInputElement>(null)
    const nameRef = useRef<HTMLInputElement>(null)
    const dark = useAppSelector(selectDarkMode)
    const [name, setName] = useState<string>("Remox Multisig")
    const [sign, setSign] = useState<number | undefined>(1)
    const [internalSign, setInternalSign] = useState<number | undefined>(1)
    const [value, setValue] = useState('')
    const [value2, setValue2] = useState('')
    const [selectedType, setSelectedType] = useState(false)
    const [newOwner, setNewOwner] = useState(false)
    const [text, setText] = useState('Create Multisig')
    const [owners, setOwners] = useState<{ name: string; address: string; }[]>([])
    const [file, setFile] = useState<File>()

    const importInputRef = useRef<HTMLInputElement>(null)
    const importNameInputRef = useRef<HTMLInputElement>(null)




    const addOwner = () => {
        if (addressRef.current?.value && nameRef.current?.value) {
            setOwners([...owners, { name: nameRef.current.value, address: addressRef.current.value }])
            nameRef.current.value = ""
            addressRef.current.value = ""
        }
    }

    const createClick = async () => {
        if (sign && internalSign && owners.length + 1 >= sign && owners.length + 1 >= internalSign) {
            try {
                await createMultisigAccount(
                    owners.map(owner => owner.address),
                    name,
                    sign.toString(),
                    internalSign.toString()
                )

                dispatch(changeSuccess({ activate: true, text: "Successfully" }))

            } catch (error: any) {
                console.error(error)
                dispatch(changeError({ activate: true, text: (error?.data?.message || "Something went wrong") }))

            }
        }
    }

    const importClick = async () => {
        if (importInputRef.current && importInputRef.current.value) {
            try {
                await importMultisigAccount(importInputRef.current.value, (importNameInputRef.current?.value ?? ""))
                dispatch(changeSuccess({ activate: true, text: "Successfully imported" }))

            } catch (error: any) {
                console.error(error)
                dispatch(changeError({ activate: true, text: (error || "Something went wrong") }))

            }
        }
    }

    const paymentdata = [
        {
            to: "",
            text: "Create Multisig"
        },
        {
            to: "",
            text: "Import Multisig"
        }
    ]

    const paymentname = ["Upload Photo", "NFT"]
    const paymentname2 = ["Celo", "Solana"]

    return <div className="h-screen w-full">
        <header className="flex md:px-40 h-[4.688rem] justify-center md:justify-start items-center absolute top-0 w-full">
            <div>
                <img src={dark ? "/logo.png" : "/logo_white.png"} alt="" width="135" />
            </div>
        </header>
        <form className="py-[6.25rem] sm:py-0 sm:h-full " >
            <section className="flex flex-col items-center h-full  gap-6 pt-20">
                <div className="flex flex-col items-center justify-center gap-4">
                    <div className="text-xl sm:text-3xl  dark:text-white text-center font-semibold">Set Account Details</div>
                    <div className="flex  pt-2 w-full justify-between">
                        <AnimatedTabBar data={paymentdata} setText={setText} className={'!text-lg'} />
                    </div>
                </div>
                <div className="flex flex-col px-3 gap-1 items-center justify-center min-w-[25%]">
                    <div className="flex flex-col mb-4 space-y-1 w-full">
                        <div className="text-xs text-left  dark:text-white">Choose Organisation Profile Photo Type</div>
                        <div className={` flex items-center gap-3 w-full rounded-lg`}>
                            <Paydropdown setSelectedType={setSelectedType} paymentname={paymentname} value={value} setValue={setValue} />
                        </div>
                    </div>
                    {value && <div className="flex flex-col mb-4 space-y-1 w-full">
                        <div className="text-xs text-left  dark:text-white">{value === "NFT" ? "NFT Address" : "Your Photo"} </div>
                        <div className={`  w-full border rounded-lg`}>
                            {value === "NFT" ? <input type="text" className="bg-white dark:bg-darkSecond rounded-lg h-[3.4rem]  w-full px-1" /> : <Upload className={'!h-[3.4rem] block border-none w-full'} setFile={setFile} />}
                        </div>
                    </div>}
                    <div className="flex flex-col mb-4 space-y-1 w-full">
                        <div className="text-xs  text-left  dark:text-white">Choose Wallet Provider</div>
                        <div className={` flex items-center gap-3 w-full rounded-lg`}>
                            <Paydropdown setSelectedType={setSelectedType} paymentname={paymentname2} value={value2} setValue={setValue2} />
                        </div>
                    </div>
                    {text === "Import Multisig" && <div className="flex flex-col mb-4 space-y-1 w-full">
                        <div className="text-xs  text-left  dark:text-white">Multisig Adress</div>
                        <div className={` flex items-center gap-3 w-full border rounded-lg`}>
                            <input ref={importInputRef} type="text" className="bg-white dark:bg-darkSecond  h-[3.4rem] rounded-lg w-full px-1" placeholder="Multisig Address" />
                        </div>
                    </div>}
                    <div className="flex flex-col mb-4 space-y-1 w-full">
                        <div className="text-xs  text-left  dark:text-white">Wallet Name</div>
                        <div className={` flex items-center gap-3 w-full border rounded-lg`}>
                            {text === "Create Multisig" ? <input type="text" placeholder="Remox DAO" className="bg-white dark:bg-darkSecond  h-[3.4rem] rounded-lg w-full px-1" onChange={(e) => { setName(e.target.value) }} required /> : <input ref={importNameInputRef} type="text" className="bg-white dark:bg-darkSecond  h-[3.4rem] rounded-lg w-full px-1" placeholder="Wallet name" />}
                        </div>
                    </div>
                    {newOwner && text === "Create Multisig" && <div className="flex flex-col mb-4 space-y-1 w-full">
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
                    <div className="flex flex-col  space-y-1 w-full">
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
                    {!newOwner && text === "Create Multisig" && <div className="flex flex-col items-start mb-4  w-full ">
                        <div className="cursor-pointer text-center text-primary opacity-80 px-3  dark:opacity-100" onClick={() => { setNewOwner(true) }}>+ Add to Owner</div>
                    </div>}
                    {text === "Create Multisig" && owners.map((w) => {
                        return <div className="flex flex-col  space-y-1 w-full">
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
                    {text === "Create Multisig" && <div className="flex flex-col mb-4 space-y-1 w-full">
                        <span className="text-greylish opacity-35 ">Minimum confirmations required for any transactions</span>
                        <div className="w-ful flex justify-start items-center">
                            <input type="text" className="border p-3 mr-4 rounded-md outline-none w-[25%] dark:bg-darkSecond" value={sign} onChange={(e) => { if (!isNaN(+e.target.value)) setSign(+e.target.value || undefined) }} required />
                            <p className="text-greylish w-[30%]">out of {owners.length + 1} owners</p>
                        </div>
                    </div>}
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-2 gap-8 min-w-[26%] pb-5">
                    <Button version="second" onClick={() => navigate.push('/create-organisation')}>Back</Button>
                    {text === "Create Multisig" ? <Button type="submit" onClick={createClick}>Create</Button> : <Button type="submit" onClick={importClick}>Import</Button>}
                </div>
            </section>
        </form>
    </div>

}


CreateMultisig.disableLayout = true
CreateMultisig.disableGuard = true
export default CreateMultisig