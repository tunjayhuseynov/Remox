import React, { useState, useEffect } from 'react'
import { BsFillTrashFill } from "react-icons/bs";
import { DropDownItem } from "../../../types/dropdown";
import Dropdown from "../../../components/general/dropdown";
import { useWalletKit } from "../../../hooks";
import Button from '../../../components/button';
import { useAppDispatch } from "redux/hooks";
import { addSubInput, SelectInputs, removeSubInput, SelectInputAmount, changeSubInput } from "redux/slices/subinput";
import shortid, { generate } from 'shortid'
import useNextSelector from "hooks/useNextSelector";
import { changeDarkMode, selectDarkMode } from 'redux/slices/notificationSlice';
import { useDispatch } from "react-redux";
import { useSelector } from "react-redux";
import { useForm, SubmitHandler } from "react-hook-form";

export interface IFormInput {

    name: string;
    amount: number;
    amount2?: number;

}


function Subinput({ incomingIndex, indexs }: { incomingIndex: string, indexs: number }) {
    const { register, handleSubmit } = useForm<IFormInput>();
    const inputAmounts = useSelector(SelectInputAmount)
    const dark = useNextSelector(selectDarkMode)
    const [index] = useState<string>(incomingIndex)
    const dispatch = useDispatch()
    const { GetCoins } = useWalletKit()
    const [anotherToken2, setAnotherToken2] = useState(false)

    const [name, setName] = useState<string>("")
    const [amount, setAmount] = useState<number>()
    const [amount2, setAmount2] = useState<number>()
    const [wallet, setWallet] = useState<DropDownItem>()
    const [wallet2, setWallet2] = useState<DropDownItem>()

    useEffect(() => {
        dispatch(changeSubInput({
            index,
            name,
            amount,
            wallet,
            amount2,
            wallet2,
        }))
    }, [name, amount, wallet, amount2, wallet2])


    const onSubmit: SubmitHandler<IFormInput> = data => {

        const Wallet = wallet
        const Wallet2 = wallet2

        console.log(data, Wallet, Wallet2)
    }

    return <>
        {indexs !== 0 && <form onSubmit={handleSubmit(onSubmit)} > <div className="flex flex-col">
            <div className="flex justify-between relative">
                <span className="text-left  text-greylish pb-2 ml-1" >Subbudget Name</span>
                <div className="absolute -top-[-2.5rem] -right-[2rem]">
                    {<img src={`/icons/${dark ? 'trashicon_white' : 'trashicon'}.png`} className="w-5 h-5 cursor-pointer" onClick={() => {
                        dispatch(removeSubInput(index))
                        //setRefreshPage(generate())
                    }} />}
                </div></div>

            <input type="text" className="border w-full py-2 px-1 rounded-lg" defaultValue={name} {...register("name", { required: true })} onChange={(e) => { setName(e.target.value) }} />
        </div>
            <div className="flex w-full gap-8  pt-4">
                <div className="flex flex-col w-full">

                    <span className="text-left  text-greylish pb-2 ml-1" >Subbudget Token</span>
                    <Dropdown className="!py-[0.35rem] border bg-white dark:bg-darkSecond text-sm !rounded-lg" nameActivation={true} selected={wallet ?? Object.values(GetCoins!).map(w => ({ name: w.name, coinUrl: w.coinUrl }))[0]} list={Object.values(GetCoins!).map(w => ({ name: w.name, coinUrl: w.coinUrl }))} onSelect={val => {
                        setWallet(val)
                    }} />
                </div>
                <div className="flex flex-col w-full">
                    <span className="text-left  text-greylish pb-2 ml-1" >Subbudget Amount</span>
                    <input {...register("amount", { required: true, valueAsNumber: true  })} className="outline-none unvisibleArrow bg-white pl-2 border rounded-lg py-2 dark:bg-darkSecond dark:text-white" defaultValue={amount} type="number" name={`amount__${index}`} onChange={(e) => {
                        setAmount(Number(e.target.value))
                    }} required step={'any'} min={0} />
                </div>
            </div>
            {anotherToken2 && <div className="flex w-full gap-8  pt-4">
                <div className="flex flex-col w-full">
                    <span className="text-left  text-greylish pb-2 ml-1" >Subbudget Token</span>
                    <Dropdown className="!py-[0.35rem] border bg-white dark:bg-darkSecond text-sm !rounded-lg" nameActivation={true} selected={wallet2 ?? Object.values(GetCoins!).map(w => ({ name: w.name, coinUrl: w.coinUrl }))[0]} list={Object.values(GetCoins!).map(w => ({ name: w.name, coinUrl: w.coinUrl }))} onSelect={val => {
                        setWallet2(val)
                    }} />
                </div>
                <div className="flex flex-col w-full">
                    <div className="flex justify-between relative">
                        <span className="text-left  text-greylish pb-2 ml-1" >Subbudget Amount</span>
                        <div className="absolute -top-[-2.75rem] -right-[2rem]">
                            {<img src={`/icons/${dark ? 'trashicon_white' : 'trashicon'}.png`} className="w-5 h-5 cursor-pointer" onClick={() => {
                                setAnotherToken2(false)
                                //setRefreshPage(generate())
                            }} />}
                        </div>
                    </div>
                    <input {...register("amount2", { required: true, valueAsNumber: true  })} className="outline-none unvisibleArrow bg-white pl-2 border rounded-lg py-2 dark:bg-darkSecond dark:text-white" defaultValue={amount2} type="number" name={`amount__${index}`} onChange={(e) => {
                        setAmount2(Number(e.target.value))
                    }} required step={'any'} min={0} />
                </div> </div>}
            {!anotherToken2 && <div className="text-primary  cursor-pointer " onClick={() => setAnotherToken2(true)}>
                <span className="flex gap-2 bg-opacity-5 font-semibold py-3 pl-1 text-center rounded-xl ">
                    <span className="w-5 h-5 border rounded-full border-primary  text-primary  flex items-center justify-center">+</span> Add another subbuget
                </span>
            </div>}  </form>}
    </>
}

export default Subinput