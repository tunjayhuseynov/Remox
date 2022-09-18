import React, { useState, useEffect, useRef, useMemo } from 'react'
import Dropdown from "../../../../components/general/dropdown";
import { useWalletKit } from "../../../../hooks";
import Button from '../../../../components/button';
import { useAppDispatch, useAppSelector } from "redux/hooks";
import { generate } from 'shortid'
import { useRouter } from 'next/router';
import { SelectDarkMode } from 'redux/slices/account/remoxData';

import { AltCoins, Coins } from 'types/coins';
import { useForm, SubmitHandler } from "react-hook-form";
import { GetTime } from 'utils';
import useLoading from 'hooks/useLoading';
import { Create_Budget_Thunk } from 'redux/slices/account/thunks/budgetThunks/budget';
import { AiOutlinePlusCircle } from 'react-icons/ai'

interface IFormInput {
    name: string;
    amount: number;
    amount2?: number;
    subName: string;
}
export interface ISubInputs {
    id: string;
    name: string;
    amount: number;
    amount2: number;
    wallet: AltCoins;
    wallet2: AltCoins;
    subAnotherToken: boolean;
}[]


function NewBudgets() {

    const { register, handleSubmit } = useForm<IFormInput>();
    const { GetCoins } = useWalletKit()
    const dispatch = useAppDispatch()
    const dark = useAppSelector(SelectDarkMode)
    const [anotherToken, setAnotherToken] = useState(false)
    const navigate = useRouter()
    const { parentId } = navigate.query as { parentId: string }

    const [wallet, setWallet] = useState(GetCoins[0])
    const [wallet2, setWallet2] = useState(GetCoins[0])

    const onSubmit: SubmitHandler<IFormInput> = async data => {
        const coin = wallet
        const coin2 = wallet2
        const subbudgets = inputs
    
        let secondCoin = null, secondAmount = null, id = generate();

        if (data.amount2 && data.amount2 > 0) {
            secondCoin = coin2.symbol
            secondAmount = data.amount2
        }

        await dispatch(Create_Budget_Thunk({
            budget: {
                txs: [],
                id: id,
                amount: data.amount,
                created_at: GetTime(),
                name: data.name,
                parentId,
                token: coin.symbol,
                secondAmount,
                secondToken: secondCoin,
                subbudgets: subbudgets.map(s => ({
                    amount: s.amount,
                    created_at: GetTime(),
                    id: s.id,
                    name: s.name,
                    parentId: id,
                    secondAmount: s.amount2 ?? null,
                    secondToken: (s.amount2 && s.wallet2 && s.amount2 > 0) ? s.wallet2.symbol : null,
                    token: s.wallet.symbol,
                    txs: [],
                })),
            }
        })).unwrap()

        navigate.push('/dashboard/budgets')
    }


    const [inputs, setInputs] = useState<ISubInputs[]>([])


    const addNewInput = () => {
        setInputs([...inputs, {
            id: generate(),
            name: "",
            wallet: GetCoins[0],
            wallet2: GetCoins[0],
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

    const updateInputWallet = (id: string, wallet: AltCoins) => {
        console.log(id, wallet);
        setInputs(inputs.map(s => s.id === id ? { ...s, wallet } : s))
    }
    const updateInputWallet2 = (id: string, wallet2: AltCoins) => {
        setInputs(inputs.map(s => s.id === id ? { ...s, wallet2 } : s))
    }

    const [isLoading, OnSubmit] = useLoading(onSubmit)


    return <div className="w-full relative pt-20 pb-10">
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
                <div className="grid grid-cols-2 w-full gap-8 pt-4 h-[6rem]">
                    <div className='grid grid-rows-[40%,60%]'>
                        <div></div>
                        {/* <span className="text-left  text-greylish dark:text-white pb-2 ml-1" >Budget Token</span> */}
                        <Dropdown
                            parentClass='h-full'
                            sx={{
                                height: "3rem",
                            }}
                            label="Budget Token"
                            selected={wallet}
                            list={Object.values(GetCoins) as AltCoins[]}
                            setSelect={setWallet}
                        />
                    </div>
                    <div className="grid grid-rows-[40%,60%] w-full">
                        <span className="text-left  text-greylish dark:text-white pb-2 ml-1" >Budget Amount</span>
                        <input required {...register("amount", { required: true, valueAsNumber: true })} className="outline-none unvisibleArrow bg-white pl-2 border  rounded-lg py-2 dark:bg-darkSecond dark:text-white" type="number" step={'any'} min={0} />
                    </div>
                </div>
                {anotherToken &&
                    <div className="grid grid-cols-2 w-full gap-8 pt-4">
                        <div className='grid grid-rows-[40%,60%]'>
                            <div></div>
                            <Dropdown
                                parentClass='h-full'
                                sx={{
                                    height: "3rem",
                                }}
                                label="Budget Token"
                                selected={wallet2}
                                list={Object.values(GetCoins) as AltCoins[]}
                                setSelect={setWallet2} />
                        </div>
                        <div className="grid grid-rows-[40%,60%] w-full">
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
                        <span className="flex gap-2 items-center bg-opacity-5 font-semibold  pl-1 text-center rounded-xl">
                            <AiOutlinePlusCircle className='text-primary' />  Add another token
                        </span>
                    </div>
                }
                {inputs.map((input, index) => {
                    // return <Subinput key={e.index} incomingIndex={e.index} indexs={i} />
                    return <div key={input.id}>
                        <div className="flex flex-col mt-12">
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
                        <div className="grid grid-cols-2 w-full gap-8 pt-4 h-[6rem]">
                            <div className="grid grid-rows-[40%,60%]">
                                <div></div>
                                {/* <span className="text-left  text-greylish dark:text-white pb-2 ml-1" >Subbudget Token</span> */}
                                <Dropdown
                                    // className="!py-[0.35rem] border dark:border-white bg-white dark:bg-darkSecond text-sm !rounded-lg"
                                    label="Subbudget Token"
                                    selected={input.wallet}
                                    list={Object.values(GetCoins)}
                                    runFn={(val) => () => updateInputWallet(input.id, val)}
                                />
                            </div>
                            <div className="grid grid-rows-[40%,60%] w-full">
                                <span className="text-left  text-greylish dark:text-white pb-2 ml-1" >Subbudget Amount</span>
                                <input className="outline-none unvisibleArrow bg-white pl-2 border rounded-lg py-2 dark:bg-darkSecond dark:text-white" type="number" name={`amount__${index}`} required step={'any'} min={0} onChange={(e) => updateInputAmount(input.id, parseFloat(e.target.value))} />
                            </div>
                        </div>
                        {input.subAnotherToken && <div className="grid grid-cols-2 w-full gap-8 pt-4 h-[6rem]">
                            <div className="grid grid-rows-[40%,60%]">
                                <div></div>
                                {/* <span className="text-left  text-greylish dark:text-white pb-2 ml-1" >Subbudget Token</span> */}
                                <Dropdown
                                    // className="!py-[0.35rem] border dark:border-white bg-white dark:bg-darkSecond text-sm !rounded-lg"
                                    label='Subbudget Token'
                                    selected={input.wallet2}
                                    list={Object.values(GetCoins) as AltCoins[]}
                                    runFn={val => () => updateInputWallet2(input.id, val)}
                                />
                            </div>
                            <div className="grid grid-rows-[40%,60%] w-full">
                                <div className="flex justify-between relative">
                                    <span className="text-left  text-greylish dark:text-white pb-2 ml-1" >Subbudget Amount</span>
                                    <div className="absolute -top-[-2.75rem] -right-[2rem]">
                                        {<img src={`/icons/${dark ? 'trashicon_white' : 'trashicon'}.png`} className="w-5 h-5 cursor-pointer" onClick={() => updateAnotherToken(input.id, false)} />}
                                    </div>
                                </div>
                                <input className="outline-none unvisibleArrow bg-white pl-2 border rounded-lg py-2 dark:bg-darkSecond dark:text-white" type="number" name={`amount__${index}`} required step={'any'} min={0} onChange={(e) => updateInputAmount2(input.id, parseFloat(e.target.value))} />
                            </div>
                        </div>
                        }
                        {!input.subAnotherToken && <div className="text-primary  cursor-pointer mt-6" onClick={() => updateAnotherToken(input.id, true)}>
                            <span className="flex gap-2 items-center bg-opacity-5 font-semibold  pl-1 text-center rounded-xl">
                                <AiOutlinePlusCircle className='text-primary' />  Add another subbuget
                            </span>
                        </div>}</div>
                })
                }
                {inputs.length < 10 &&
                    <div className="text-primary border mt-10 border-primary rounded-lg px-3 py-1 text-center w-[30.8%] transition hover:bg-primary hover:transition hover:text-white cursor-pointer" onClick={addNewInput}  >
                        Add Subbudget
                    </div>}
                <div className="flex flex-col-reverse sm:grid grid-cols-2 w-[12.5rem] sm:w-full justify-center gap-8  pt-6">
                    <Button version="second" className="!rounded-xl" onClick={() => { navigate.back() }}>Cancel</Button>
                    <Button type="submit" className="!rounded-xl bg-primary  px-3 py-2 text-white flex items-center justify-center" isLoading={isLoading}>Create</Button>
                </div>
            </form>
        </div>
    </div>
}

export default NewBudgets