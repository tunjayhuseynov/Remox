import React, { Dispatch, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { generate } from 'shortid';
import { useCreateAddressMutation, useGetMultisigAddressesQuery } from '../../redux/api';
import { changeError, changeSuccess } from '../../redux/reducers/notificationSlice';
import { selectStorage } from '../../redux/reducers/storage';
import Button from '../../components/button';

export default function Create({ setCreateModal }: { setCreateModal: Dispatch<boolean> }) {

    const [createMultisig, { isLoading: createLoading }] = useCreateAddressMutation()
    const { data, refetch, isFetching } = useGetMultisigAddressesQuery()


    const [ownerAmount, setOwnerAmount] = useState(1)
    const storage = useSelector(selectStorage)
    const owners = useRef<string[]>([])

    const [sign, setSign] = useState<number | undefined>(1)
    const [internalSign, setInternalSign] = useState<number | undefined>(1)
    const dispatch = useDispatch()


    const createClick = async () => {
        if (sign && internalSign && owners.current.length + 1 >= sign && owners.current.length + 1 >= internalSign) {
            try {
                const res = await createMultisig({
                    phrase: "",//storage!.encryptedPhrase,
                    owners: owners.current,
                    required: sign,
                    internalRequired: internalSign
                }).unwrap()
                refetch()
                dispatch(changeSuccess({ activate: true, text: "Successfully" }))
                // dispatch(changeAccount(res.multiSigAddress.address))
                setCreateModal(false)
            } catch (error: any) {
                console.error(error)
                dispatch(changeError({ activate: true, text: (error?.data?.message || "Something went wrong") }))
                setCreateModal(false)
            }
        }
    }

    return <div className="flex flex-col gap-4 mt-[-2rem]">
        <div className="text-center font-semibold">Create MultiSig Account</div>
        <div className="flex flex-col overflow-y-auto max-h-[75vh] space-y-5">
            <span className="text-black opacity-35 pl-3">Owners</span>
            <div className="w-full">
                <input type="text" className="border p-3 rounded-md border-black outline-none w-full text-greylish" value={storage!.accountAddress} disabled />
            </div>
            {
                Array(ownerAmount).fill(' ').map((e, i) => {
                    return <div className="w-full" key={generate()}>
                        <input type="text" onChange={(e) => { owners.current[i] = e.target.value }} className="border p-3 rounded-md border-black outline-none w-full" placeholder="0xabc..." />
                    </div>
                })
            }
            <div className="cursor-pointer text-center text-greylish opacity-80 px-3" onClick={() => { setOwnerAmount(ownerAmount + 1) }}>+ Add Owner</div>
            <div className="flex flex-col space-y-8">
                <div>
                    <span className="text-greylish opacity-35 pl-3">Signatures required to execute TXs</span>
                    <input type="text" className="border p-3 rounded-md border-black outline-none w-full" value={sign} onChange={(e) => { if (!isNaN(+e.target.value)) setSign(+e.target.value || undefined) }} />
                </div>
                <div>
                    <span className="text-greylish opacity-35 pl-3">Signatures required to change MultiSig properties</span>
                    <input type="text" className="border p-3 rounded-md border-black outline-none w-full" value={internalSign} onChange={(e) => { if (!isNaN(+e.target.value)) setInternalSign(+e.target.value || undefined) }} />

                </div>
            </div>
            <div className="text-center">
                <Button className="px-10 py-2" onClick={createClick} isLoading={createLoading}>
                    Create
                </Button>
            </div>
        </div>
    </div>
}
