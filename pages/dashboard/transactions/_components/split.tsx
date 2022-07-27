
import React from 'react'
import { useEffect, useState } from "react";
import Dropdown from "components/general/dropdown";
import { DropDownItem } from "types/dropdown";
import _ from "lodash";
import { useWalletKit } from "hooks";
import { useSelector } from "react-redux";
import { useAppDispatch } from "redux/hooks";
import { changeSplitInput, removeSplitInput } from "redux/slices/split";

function Split({ incomingIndex, indexs }: { incomingIndex: string, indexs: number; }) {
    const { GetCoins, fromMinScale } = useWalletKit()
    const [openNotify, setNotify] = useState(false)
    const [index] = useState<string>(incomingIndex)
    const dispatch = useAppDispatch()

    const [amount, setAmount] = useState<number>()
    const [wallet, setWallet] = useState<DropDownItem>()

    const paymentname: DropDownItem[] = [{ name: "Select" }, { name: "Security" }, { name: "Development" }]
    const [selectedPayment, setSelectedPayment] = useState(paymentname[0])

    useEffect(() => {
        dispatch(changeSplitInput({
            index,
            budget: selectedPayment.name,
            amount,
            wallet,

        }))
    }, [selectedPayment, amount, wallet,])



    return <>
        <div className="flex flex-col gap-6 justify-center items-center   w-full">
            <div className="flex justify-between items-center w-full px-1">
                <span className="text-lg font-medium">Split {indexs + 1}</span>
                {indexs !== 0 && <div className="cursor-pointer text-red-600 font-bold" onClick={() => {
                    dispatch(removeSplitInput(index))
                    //setRefreshPage(generate())
                }} >Delete</div>}

            </div>
            <div className="flex w-full justify-between">
                <div className="flex flex-col w-[45%]">
                    {/* <span className="text-left  text-greylish pb-2 pl-1" >Token</span> */}
                    <Dropdown
                        className="!py-[0.5rem] border dark:border-none dark:bg-darkSecond text-sm !rounded-lg"
                        selected={wallet}
                        label="Select Token"
                        list={Object.values(GetCoins)}
                        setSelect={setWallet}
                    />
                </div>
                <div className="flex flex-col w-[45%]">
                    <span className="text-left  text-greylish pb-2 pl-1" >Amount</span>
                    <input type="number" className="outline-none unvisibleArrow  border rounded-lg py-3 pl-2 dark:bg-darkSecond dark:text-white" placeholder="0" step={'any'} min={0} defaultValue={amount} name={`amount__${index}`} onChange={(e) => {
                        setAmount(Number(e.target.value))
                    }} />
                </div>
            </div>
            <div className="flex flex-col w-full pb-4">
                {/* <span className="text-left  text-greylish pb-2 pl-1" >Budget</span> */}
                <Dropdown
                    parentClass={'bg-white w-full rounded-lg h-[3.4rem]'}
                    className={'!rounded-lg h-[3.4rem]'}
                    label="Budget"
                    list={paymentname}
                    selected={selectedPayment} 
                    setSelect={setSelectedPayment} />
            </div>
        </div>

    </>
}

export default Split