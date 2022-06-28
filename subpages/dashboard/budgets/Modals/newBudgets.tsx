import React, { useState, useEffect, useRef } from 'react'
import { DropDownItem } from "../../../../types/dropdown";
import Dropdown from "../../../../components/general/dropdown";
import { useWalletKit } from "../../../../hooks";
import Button from '../../../../components/button';
import { useAppDispatch } from "redux/hooks";
import { addSubInput, SelectInputs, resetSubInput, changeSubInput, ISubInput } from "redux/reducers/subinput";
import shortid, { generate } from 'shortid'
import useNextSelector from "hooks/useNextSelector";
import Subinput from '../subinput';
import { changeDarkMode, selectDarkMode } from 'redux/reducers/notificationSlice';
import { Coins } from 'types/coins';
import { useForm, SubmitHandler } from "react-hook-form";


interface IFormInput {
    name: string;
}

function NewBudgets({ setNewBudget, setSign }: { setNewBudget: React.Dispatch<boolean>, setSign?: React.Dispatch<boolean> }) {
    const { register, handleSubmit, setValue } = useForm<IFormInput>();
    const { GetCoins } = useWalletKit()
    const dispatch = useAppDispatch()
    const dark = useNextSelector(selectDarkMode)
    const [anotherToken, setAnotherToken] = useState(false)
    const MyInputs = useNextSelector(SelectInputs)
    const [name, setName] = useState<string>("")
    const [amount, setAmount] = useState<number>(0)
    const [wallet, setWallet] = useState<DropDownItem>()
    const [amount2, setAmount2] = useState<number>(0)
    const [wallet2, setWallet2] = useState<DropDownItem>()

    const Budget = [
        {
            Amount: amount,
            Coin: wallet,
            Amount2: amount2,
            Coin2: wallet2
        }
    ]




    useEffect(() => {
        return () => {
            dispatch(resetSubInput())
        }
    }, [])


    const onSubmit: SubmitHandler<IFormInput> = data => {
        const BudgetVal = Budget
        const SubBudgets = MyInputs
        console.log(data, BudgetVal, SubBudgets);
    }

    return (
        <div>
            <div className="text-2xl text-center font-bold">Add Budgets</div>
            <form onSubmit={handleSubmit(onSubmit)} className="px-12 flex flex-col gap-4">
                <div className="flex flex-col">
                    <span className="text-left  text-greylish pb-2 ml-1" >Budget Name</span>
                    <input type="text" required  {...register("name", { required: true })} className="border dark:border-none w-full bg-white dark:bg-darkSecond py-2 px-1 rounded-lg" onChange={(e) => { setName(e.target.value) }} />
                </div>
                <div className="flex w-full gap-8 pt-4">
                    <div className="flex flex-col  w-full">
                        <span className="text-left  text-greylish pb-2 ml-1" >Budget Token</span>
                        <Dropdown className="!py-[0.35rem] border dark:border-none dark:bg-darkSecond text-sm !rounded-lg" nameActivation={true} selected={wallet ?? Object.values(GetCoins!).map(w => ({ name: w.name, coinUrl: w.coinUrl }))[0]} list={Object.values(GetCoins!).map(w => ({ name: w.name, coinUrl: w.coinUrl }))} onSelect={val => {
                            setWallet(val)
                        }} />
                    </div>
                    <div className="flex flex-col w-full">
                        <span className="text-left  text-greylish pb-2 ml-1" >Budget Amount</span>
                        <input required className="outline-none unvisibleArrow bg-white pl-2 border dark:border-none rounded-lg py-2 dark:bg-darkSecond dark:text-white" type="number" step={'any'} min={0} onChange={(e) => { setAmount(parseInt(e.target.value)) }} />
                    </div>
                </div>
                {anotherToken && <div className="flex w-full gap-8   pt-4">
                    <div className="flex flex-col w-full">
                        <span className="text-left  text-greylish pb-2 ml-1" >Budget Token</span>
                        <Dropdown className="!py-[0.35rem] border dark:border-none bg-white dark:bg-darkSecond text-sm !rounded-lg" nameActivation={true} selected={wallet2 ?? Object.values(GetCoins!).map(w => ({ name: w.name, coinUrl: w.coinUrl }))[0]} list={Object.values(GetCoins!).map(w => ({ name: w.name, coinUrl: w.coinUrl }))} onSelect={val => {
                            setWallet2(val);
                        }} />
                    </div>
                    <div className="flex flex-col w-full">
                        <div className="flex justify-between relative">
                            <span className="text-left  text-greylish pb-2 ml-1" >Budget Amount</span>
                            <div className="absolute -top-[-2.75rem] -right-[2rem]">
                                {<img src={`/icons/${dark ? 'trashicon_white' : 'trashicon'}.png`} className="w-5 h-5 cursor-pointer" onClick={() => {
                                    setAnotherToken(false)
                                    //setRefreshPage(generate())
                                }} />}
                            </div>
                        </div>
                        <input className="outline-none unvisibleArrow bg-white pl-2 border dark:border-none rounded-lg py-2 dark:bg-darkSecond dark:text-white" type="number" step={'any'} min={0} onChange={(e) => { setAmount2(parseInt(e.target.value)) }} />
                    </div> </div>}
                {!anotherToken && <div className="text-primary  cursor-pointer " onClick={() => setAnotherToken(true)}>
                    <span className="flex gap-2 items-center bg-opacity-5 font-semibold  pl-1 text-center rounded-xl ">
                        <span className="w-5 h-5 border rounded-full border-primary  text-primary  flex items-center justify-center">+</span> Add another token
                    </span>
                </div>}
                {MyInputs && MyInputs.map((e, i) => {
                    return <Subinput key={e.index} incomingIndex={e.index} indexs={i} />
                })

                }
                {MyInputs && MyInputs.length < 10 && <div className="text-primary border border-primary rounded-lg px-3 py-1 text-center w-[30.8%] transition hover:bg-primary hover:transition hover:text-white cursor-pointer" onClick={() => {
                    dispatch(addSubInput({
                        index: shortid()
                    }))
                }}  >Add Subbudget</div>}
                <div className="flex flex-col-reverse sm:grid grid-cols-2 w-[12.5rem] sm:w-full justify-center gap-8  pt-6">
                    <Button version="second" className="!rounded-xl" onClick={() => { setNewBudget(false) }}>Cancel</Button>
                    <Button type="submit" className=" !rounded-xl bg-primary  px-3 py-2 text-white flex items-center justify-center" >Create</Button>
                </div>
            </form>

        </div>
    )
}

export default NewBudgets