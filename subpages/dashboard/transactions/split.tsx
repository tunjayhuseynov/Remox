
import React, { Dispatch, SetStateAction } from 'react'
import { Fragment, useEffect, useState, useRef } from "react";
import Dropdown from "components/general/dropdown";
import { DropDownItem } from "types/dropdown";
import _ from "lodash";
import { useTransactionProcess, useWalletKit } from "hooks";
import { useSelector } from "react-redux";
import { selectDarkMode } from "redux/reducers/notificationSlice";
import useProfile from "rpcHooks/useProfile";
import { useModalSideExit } from "hooks";
import Paydropdown from 'subpages/pay/paydropdown';
import { useAppDispatch, useAppSelector } from "redux/hooks";
import { addSplitInput, SelectInputs, resetSplitInput, changeSplitInput, ISplitInput, removeSplitInput } from "redux/reducers/split";

function Split({ incomingIndex, indexs }: { incomingIndex: string, indexs: number; }) {
    const { GetCoins, fromMinScale } = useWalletKit()
    const dark = useSelector(selectDarkMode)
    const { profile, UpdateSeenTime } = useProfile()
    const [openNotify, setNotify] = useState(false)
    const [index] = useState<string>(incomingIndex)
    const dispatch = useAppDispatch()

    const [amount, setAmount] = useState<number>()
    const [wallet, setWallet] = useState<DropDownItem>()

    const paymentname: DropDownItem[] = [{ name: "Select" }, { name: "Security" }, { name: "Development" }]
    const [selectedPayment, setSelectedPayment] = useState(paymentname[0])

    useEffect(() => {
        if (openNotify) {
            UpdateSeenTime(new Date().getTime())
        }
    }, [openNotify])

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
                    <span className="text-left  text-greylish pb-2 pl-1" >Token</span>
                    <Dropdown className="!py-[0.5rem] border dark:border-none dark:bg-darkSecond text-sm !rounded-lg" nameActivation={true} selected={wallet ?? Object.values(GetCoins!).map(w => ({ name: w.name, coinUrl: w.coinUrl }))[0]} list={Object.values(GetCoins!).map(w => ({ name: w.name, coinUrl: w.coinUrl }))} onSelect={val => {
                        setWallet(val)
                    }} />
                </div>
                <div className="flex flex-col w-[45%]">
                    <span className="text-left  text-greylish pb-2 pl-1" >Amount</span>
                    <input type="number" className="outline-none unvisibleArrow  border rounded-lg py-3 pl-2 dark:bg-darkSecond dark:text-white" placeholder="0" step={'any'} min={0} defaultValue={amount} name={`amount__${index}`} onChange={(e) => {
                        setAmount(Number(e.target.value))
                    }} />
                </div>
            </div>
            <div className="flex flex-col w-full pb-4">
                <span className="text-left  text-greylish pb-2 pl-1" >Budget</span>
                <Dropdown parentClass={'bg-white w-full rounded-lg h-[3.4rem]'} className={'!rounded-lg h-[3.4rem]'} childClass={'!rounded-lg'} list={paymentname} selected={selectedPayment} onSelect={(e) => {
                    setSelectedPayment(e)
                }} />
            </div>
        </div>

    </>
}

export default Split