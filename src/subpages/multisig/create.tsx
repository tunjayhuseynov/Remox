/// Yuxaridaki nedir?? not alib yeniden yazmisam orda ferqli bi error var maraqli geldi baxaram deye saxladim

import { useDispatch, useSelector } from 'react-redux';
import { changeError, changeSuccess } from '../../redux/reducers/notificationSlice';
import { selectStorage } from '../../redux/reducers/storage';
import Button from '../../components/button';
import useMultisig from 'API/useMultisig';
import { AddressReducer } from "../../utils";
import { useRef, useState, Dispatch } from "react";
import { SelectSelectedAccount } from 'redux/reducers/selectedAccount';

export default function Create({ setCreateModal }: { setCreateModal: Dispatch<boolean> }) {

    const { createMultisigAccount, isLoading } = useMultisig()
    const storage = useSelector(selectStorage)
    const selectedAddress = useSelector(SelectSelectedAccount)

    const addressRef = useRef<HTMLInputElement>(null)
    const nameRef = useRef<HTMLInputElement>(null)

    const [name, setName] = useState<string>("Remox Multisig")
    const [sign, setSign] = useState<number | undefined>(1)
    const [internalSign, setInternalSign] = useState<number | undefined>(1)

    const [owners, setOwners] = useState<{ name: string; address: string; }[]>([])
    const dispatch = useDispatch()

    const addOwner = () => {
        if (addressRef.current?.value && nameRef.current?.value) {
            setOwners([...owners, { name: nameRef.current.value, address: addressRef.current.value }])
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
                setCreateModal(false)
            } catch (error: any) {
                console.error(error)
                dispatch(changeError({ activate: true, text: (error?.data?.message || "Something went wrong") }))
                setCreateModal(false)
            }
        }
    }
    return <div className="flex flex-col gap-6 mt-[-2rem] ">
        <div className="text-center font-semibold text-xl pt-4">Create MultiSig Account</div>
        <div className="flex flex-col overflow-y-auto max-h-[75vh] space-y-5 px-8">
            <div>
                <span className="text-greylish opacity-35">Multisig Name</span>
                <input type="text" className="border p-3 rounded-md  outline-none w-full dark:bg-darkSecond" value={name} onChange={(e) => { setName(e.target.value) }} required />
            </div>
            <div className="w-full">
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
            </div>
            <div className="w-full flex justify-start">
                <div className="cursor-pointer text-center text-primary opacity-80 px-3  dark:opacity-100" onClick={addOwner}>+ Add to Owner</div>
            </div>
            <div className="flex flex-col space-y-8 ">
                <div className="flex gap-5 flex-col ">
                    <span className="text-greylish opacity-3">Added Owners</span>
                    <div className="border flex p-3">
                        <span className="w-[1.563rem] h-[1.563rem] text-center mr-4 font-bold rounded-full bg-greylish bg-opacity-10 flex items-center justify-center self-center">YA</span>
                        <div className="grid grid-col">
                            <h3>Your Account</h3>
                            <p className="opacity-80">{AddressReducer(storage!.accountAddress)}</p>
                        </div>
                    </div>
                    {owners.map((w) => {
                        return <div className="border flex p-3" >
                            <span className="w-[1.563rem] h-[1.563rem] text-center mr-4 font-bold rounded-full bg-greylish bg-opacity-10 flex items-center justify-center self-center">YA</span>
                            <div className="grid grid-col">
                                <h3>{w.name}</h3>
                                <p className="opacity-80">{w.address}</p>
                            </div>
                        </div>
                    })}
                </div>
                <div>
                    <span className="text-greylish opacity-35 ">Minimum confirmations required for any transactions</span>
                    <div className="w-ful flex justify-start items-center">
                        <input type="text" className="border p-3 mr-4 rounded-md outline-none w-[25%] dark:bg-darkSecond" value={sign} onChange={(e) => { if (!isNaN(+e.target.value)) setSign(+e.target.value || undefined) }} required />
                        <p className="text-greylish w-[30%]">out of {owners.length} owners</p>
                    </div>
                </div>
                <div>
                    <span className="text-greylish opacity-35">Signatures required to change MultiSig properties</span>
                    <div className="w-ful flex justify-start items-center">
                        <input type="text" className="border p-3 mr-4 rounded-md outline-none w-[25%] dark:bg-darkSecond" value={internalSign} onChange={(e) => { if (!isNaN(+e.target.value)) setInternalSign(+e.target.value || undefined) }} required />
                        <p className="text-greylish w-[30%]">out of {owners.length} owners</p>
                    </div>
                </div>
            </div>
            <div className="flex items-center justify-center gap-5">
                <Button className="!px-10 !py-2" version="second" onClick={() => setCreateModal(false)}>
                    Cancel
                </Button>
                <Button className="!px-10 !py-2" onClick={createClick} isLoading={isLoading}>
                    Create
                </Button>
            </div>
        </div>
    </div>
}