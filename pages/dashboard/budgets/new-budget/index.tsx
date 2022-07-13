import React, { useState, useEffect, useRef, useMemo } from 'react'
import { DropDownItem } from "../../../../types/dropdown";
import Dropdown from "../../../../components/general/dropdown";
import { useWalletKit } from "../../../../hooks";
import Button from '../../../../components/button';
import { useAppDispatch } from "redux/hooks";
import shortid, { generate } from 'shortid'
import useNextSelector from "hooks/useNextSelector";
import { useRouter } from 'next/router';
import { changeDarkMode, selectDarkMode } from 'redux/slices/notificationSlice';
import { Coins } from 'types/coins';
import { useForm, SubmitHandler } from "react-hook-form";
import useBudgetExercise from 'hooks/budgets/useBudgetExercise';
import { GetTime } from 'utils';
import useLoading from 'hooks/useLoading';


interface IFormInput {
    name: string;
    amount: number;
    amount2?: number;
    subName: string;
}
export interface IsubInputs {
    id: string;
    name: string;
    amount: number;
    amount2?: number;
    wallet: DropDownItem;
    wallet2?: DropDownItem;
    subAnotherToken: boolean;
}[]


function NewBudgets() {

    const { register, handleSubmit, setValue } = useForm<IFormInput>();
    const { GetCoins } = useWalletKit()
    const dispatch = useAppDispatch()
    const dark = useNextSelector(selectDarkMode)
    const [anotherToken, setAnotherToken] = useState(false)
    const { create_budget } = useBudgetExercise()
    const navigate = useRouter()
    const DropDownCoins = useMemo(() => Object.values(GetCoins!).map(w => ({ name: w.name, coinUrl: w.coinUrl })), [GetCoins])
    const { parentId } = navigate.query as { parentId: string }
    
    const [wallet, setWallet] = useState<DropDownItem>(DropDownCoins[0])
    const [wallet2, setWallet2] = useState<DropDownItem>(DropDownCoins[0])

    const onSubmit: SubmitHandler<IFormInput> = async data => {
        const coin = wallet
        const coin2 = wallet2
        const subbudgets = inputs
        console.log(coin, coin2, data, subbudgets);
        
        let secondCoin = null, secondAmount = null, id = generate();

        if (data.amount2 && data.amount2 > 0) {
            secondCoin = coin2.name
            secondAmount = data.amount2
        }

        await create_budget({
            txs: [],
            id: id,
            amount: data.amount,
            created_at: GetTime(),
            name: data.name,
            parentId,
            token: coin.name,
            secondAmount,
            secondToken: secondCoin,
            subbudgets: subbudgets.map(s => ({
                amount: s.amount,
                created_at: GetTime(),
                id: s.id,
                name: s.name,
                parentId: id,
                secondAmount: s.amount2 ?? null,
                secondToken: s.amount2 && s.wallet2 && s.amount2 > 0 ? s.wallet2.name : null,
                token: s.wallet.name,
                txs: [],
            })),
        })

        navigate.push('/dashboard/budgets')
    }


    const [inputs, setInputs] = useState<IsubInputs[]>([])


    const addNewInput = () => {
        setInputs([...inputs, {
            id: generate(),
            name: "",
            wallet: GetCoins[1],
            wallet2: GetCoins[1],
            amount: 0,
            amount2: 0,
            subAnotherToken: false,
        }])
    }

    const deleteInput = (id: string) => {
        setInputs(inputs.filter(s => s.id !== id))
    }
    const updateAnotherToken = (id: string, subAnotherToken: boolean) => {
        setInputs(inputs.map(s => s.id === id ? { ...s, subAnotherToken } : s))
    }
    const updateInputName = (id: string, name: string) => {
        setInputs(inputs.map(s => s.id === id ? { ...s, name } : s))
    }

    const updateInputAmount = (id: string, amount: number) => {
        setInputs(inputs.map(s => s.id === id ? { ...s, amount } : s))
    }

    const updateInputAmount2 = (id: string, amount2: number) => {
        setInputs(inputs.map(s => s.id === id ? { ...s, amount2 } : s))
    }

    const updateInputWallet = (id: string, wallet: DropDownItem) => {
        setInputs(inputs.map(s => s.id === id ? { ...s, wallet } : s))
    }
    const updateInputWallet2 = (id: string, wallet2: DropDownItem) => {
        setInputs(inputs.map(s => s.id === id ? { ...s, wallet2 } : s))
    }

    const [isLoading, OnSubmit] = useLoading(onSubmit)


    return <div className="w-full relative pt-20">
        <button onClick={() => navigate.back()} className="absolute left-0 w-[4rem] top-0 tracking-wider font-bold transition-all hover:text-primary hover:transition-all flex items-center text-xl gap-2">
            {/* <img src="/icons/cross_greylish.png" alt="" /> */}
            <span className="text-4xl pb-1">&#171;</span> Back
        </button>
        <div className="w-1/2 mx-auto">
            <div className="text-2xl text-center font-bold">Add Budgets</div>
            <form onSubmit={handleSubmit(OnSubmit)} className="px-12 flex flex-col gap-4">
                <div className="flex flex-col">
                    <span className="text-left  text-greylish dark:text-white pb-2 ml-1" >Budget Name</span>
                    <input type="text" required  {...register("name", { required: true })} className="border w-full bg-white dark:bg-darkSecond py-2 px-1 rounded-lg" />
                </div>
                <div className="flex w-full gap-8 pt-4">
                    <div className="flex flex-col  w-full">
                        <span className="text-left  text-greylish dark:text-white pb-2 ml-1" >Budget Token</span>
                        <Dropdown className="!py-[0.35rem] border dark:border-white dark:bg-darkSecond text-sm !rounded-lg" nameActivation={true} selected={wallet ?? DropDownCoins[0]} list={DropDownCoins} onSelect={val => {
                            setWallet(val)
                        }} />
                    </div>
                    <div className="flex flex-col w-full">
                        <span className="text-left  text-greylish dark:text-white pb-2 ml-1" >Budget Amount</span>
                        <input required {...register("amount", { required: true, valueAsNumber: true })} className="outline-none unvisibleArrow bg-white pl-2 border  rounded-lg py-2 dark:bg-darkSecond dark:text-white" type="number" step={'any'} min={0} />
                    </div>
                </div>
                {anotherToken &&
                    <div className="flex w-full gap-8 pt-4">
                        <div className="flex flex-col w-full">
                            <span className="text-left  text-greylish dark:text-white pb-2 ml-1" >Budget Token</span>
                            <Dropdown className="!py-[0.35rem] border dark:border-white bg-white dark:bg-darkSecond text-sm !rounded-lg" nameActivation={true} selected={wallet2 ?? DropDownCoins[0]} list={DropDownCoins} onSelect={val => {
                                setWallet2(val);
                            }} />
                        </div>
                        <div className="flex flex-col w-full">
                            <div className="flex justify-between relative">
                                <span className="text-left  text-greylish dark:text-white pb-2 ml-1" >Budget Amount</span>
                                <div className="absolute -top-[-2.75rem] -right-[2rem]">
                                    <img src={`/icons/${dark ? 'trashicon_white' : 'trashicon'}.png`} className=" w-5 h-5 cursor-pointer" onClick={() => {
                                        setAnotherToken(false)
                                        //setRefreshPage(generate())
                                    }} />
                                </div>
                            </div>
                            <input {...register("amount2", { required: true, valueAsNumber: true })} className="outline-none unvisibleArrow bg-white pl-2 border rounded-lg py-2 dark:bg-darkSecond dark:text-white" type="number" step={'any'} min={0} />
                        </div>
                    </div>}
                {!anotherToken &&
                    <div className="text-primary  cursor-pointer " onClick={() => setAnotherToken(true)}>
                        <span className="flex gap-2 items-center bg-opacity-5 font-semibold  pl-1 text-center rounded-xl ">
                            <span className="w-5 h-5 border rounded-full border-primary  text-primary  flex items-center justify-center">+</span> Add another token
                        </span>
                    </div>
                }
                {inputs.map((input, index) => {
                    // return <Subinput key={e.index} incomingIndex={e.index} indexs={i} />
                    return <div key={input.id}> <div className="flex flex-col">
                        <div className="flex justify-between relative">
                            <span className="text-left  text-greylish dark:text-white pb-2 ml-1" >Subbudget Name</span>
                            <div className="absolute -top-[-2.5rem] -right-[2rem]">
                                {<img src={`/icons/${dark ? 'trashicon_white' : 'trashicon'}.png`} className="w-5 h-5 cursor-pointer" onClick={() => {
                                    deleteInput(input.id)
                                    //setRefreshPage(generate())
                                }} />}
                            </div></div>
                        <input type="text" className="bg-white dark:bg-darkSecond border w-full py-2 px-1 rounded-lg" onChange={(e) => updateInputName(input.id, e.target.value)} />
                    </div>
                        <div className="flex w-full gap-8  pt-4">
                            <div className="flex flex-col w-full">

                                <span className="text-left  text-greylish dark:text-white pb-2 ml-1" >Subbudget Token</span>
                                <Dropdown className="!py-[0.35rem] border dark:border-white bg-white dark:bg-darkSecond text-sm !rounded-lg" nameActivation={true} selected={input.wallet ?? Object.values(GetCoins!).map(w => ({ name: w.name, coinUrl: w.coinUrl }))[0]} list={Object.values(GetCoins!).map(w => ({ name: w.name, coinUrl: w.coinUrl }))} onSelect={val => {
                                    updateInputWallet(input.id, val)

                                }} />
                            </div>
                            <div className="flex flex-col w-full">
                                <span className="text-left  text-greylish dark:text-white pb-2 ml-1" >Subbudget Amount</span>
                                <input className="outline-none unvisibleArrow bg-white pl-2 border rounded-lg py-2 dark:bg-darkSecond dark:text-white" type="number" name={`amount__${index}`} required step={'any'} min={0} onChange={(e) => updateInputAmount(input.id, parseInt(e.target.value))} />
                            </div>
                        </div>
                        {input.subAnotherToken && <div className="flex w-full gap-8  pt-4">
                            <div className="flex flex-col w-full">
                                <span className="text-left  text-greylish dark:text-white pb-2 ml-1" >Subbudget Token</span>
                                <Dropdown className="!py-[0.35rem] border dark:border-white bg-white dark:bg-darkSecond text-sm !rounded-lg" nameActivation={true} selected={input.wallet2 ?? Object.values(GetCoins!).map(w => ({ name: w.name, coinUrl: w.coinUrl }))[0]} list={Object.values(GetCoins!).map(w => ({ name: w.name, coinUrl: w.coinUrl }))} onSelect={val => {
                                    updateInputWallet2(input.id, val)
                                }} />
                            </div>
                            <div className="flex flex-col w-full">
                                <div className="flex justify-between relative">
                                    <span className="text-left  text-greylish dark:text-white pb-2 ml-1" >Subbudget Amount</span>
                                    <div className="absolute -top-[-2.75rem] -right-[2rem]">
                                        {<img src={`/icons/${dark ? 'trashicon_white' : 'trashicon'}.png`} className="w-5 h-5 cursor-pointer" onClick={() => updateAnotherToken(input.id, false)} />}
                                    </div>
                                </div>
                                <input className="outline-none unvisibleArrow bg-white pl-2 border rounded-lg py-2 dark:bg-darkSecond dark:text-white" type="number" name={`amount__${index}`} required step={'any'} min={0} onChange={(e) => updateInputAmount2(input.id, parseInt(e.target.value))} />
                            </div> </div>}
                        {!input.subAnotherToken && <div className="text-primary  cursor-pointer " onClick={() => updateAnotherToken(input.id, true)}>
                            <span className="flex gap-2 bg-opacity-5 font-semibold py-3 pl-1 text-center rounded-xl ">
                                <span className="w-5 h-5 border rounded-full border-primary  text-primary  flex items-center justify-center">+</span> Add another subbuget
                            </span>
                        </div>}</div>
                })
                }
                {inputs.length < 10 && <div className="text-primary border border-primary rounded-lg px-3 py-1 text-center w-[30.8%] transition hover:bg-primary hover:transition hover:text-white cursor-pointer" onClick={addNewInput}  >Add Subbudget</div>}
                <div className="flex flex-col-reverse sm:grid grid-cols-2 w-[12.5rem] sm:w-full justify-center gap-8  pt-6">
                    <Button version="second" className="!rounded-xl" onClick={() => { navigate.back() }}>Cancel</Button>
                    <Button type="submit" className="!rounded-xl bg-primary  px-3 py-2 text-white flex items-center justify-center" isLoading={isLoading}>Create</Button>
                </div>
            </form>
        </div>
        </div>
}

        export default NewBudgets