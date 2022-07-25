import React, { useState } from 'react'
import { DropDownItem } from "types/dropdown";
import Dropdown from "components/general/dropdown";
import { useWalletKit } from "hooks";
import Button from 'components/button';
import { useRouter } from 'next/router';
import { IsubInputs } from '../new-budget'
import shortid, { generate } from 'shortid'
import { AltCoins } from 'types';


function EditBudget() {
    const { GetCoins } = useWalletKit()
    const [anotherToken, setAnotherToken] = useState(false)
    const [anotherToken2, setAnotherToken2] = useState(false)
    const [subBudget, setSubBudget] = useState(GetCoins[0])
    const navigate = useRouter()
    const [wallet, setWallet] = useState<AltCoins>(GetCoins[0])
    const [subInputs, setSubInputs] = useState<IsubInputs[]>([])



    const addNewInput = () => {
        setSubInputs([...subInputs, {
            id: generate(),
            name: "",
            wallet: GetCoins[0],
            wallet2: GetCoins[0],
            amount: 0,
            amount2: 0,
            subAnotherToken: false,
        }])
    }
    //
    if (subInputs.length < 1) { addNewInput() }

    const updateAnotherToken = (id: string, subAnotherToken: boolean) => {
        setSubInputs(subInputs.map(s => s.id === id ? { ...s, subAnotherToken } : s))
    }
    const updateInputName = (id: string, name: string) => {
        setSubInputs(subInputs.map(s => s.id === id ? { ...s, name } : s))
    }

    const updateInputAmount = (id: string, amount: number) => {
        setSubInputs(subInputs.map(s => s.id === id ? { ...s, amount } : s))
    }

    const updateInputAmount2 = (id: string, amount2: number) => {
        setSubInputs(subInputs.map(s => s.id === id ? { ...s, amount2 } : s))
    }

    const updateInputWallet = (id: string, wallet: AltCoins) => {
        setSubInputs(subInputs.map(s => s.id === id ? { ...s, wallet } : s))
    }
    const updateInputWallet2 = (id: string, wallet2: AltCoins) => {
        setSubInputs(subInputs.map(s => s.id === id ? { ...s, wallet2 } : s))
    }


    return <div className="w-full relative pt-20">
        <button onClick={() => navigate.back()} className="absolute left-0 w-[4rem] top-0 tracking-wider font-bold transition-all hover:text-primary hover:transition-all flex items-center text-xl gap-2">
            {/* <img src="/icons/cross_greylish.png" alt="" /> */}
            <span className="text-4xl pb-1">&#171;</span> Back
        </button>
        <div className="w-1/2 mx-auto">
            <div className="text-2xl text-center font-medium">Edit Budgets</div>
            <div className="px-12 flex flex-col gap-4">
                <div className="flex flex-col">
                    <span className="text-left  text-greylish pb-2 ml-1" >Budget Name</span>
                    <input type="text" className="border w-full py-2 px-1 rounded-lg" />
                </div>
                <div className="flex w-full gap-8 pt-4">
                    <div className="flex flex-col w-full">
                        {/* <span className="text-left  text-greylish pb-2 ml-1" >Budget Token</span> */}
                        <Dropdown className="!py-[0.6rem] border bg-white dark:bg-darkSecond text-sm rounded-lg" label="Budget Token" selected={wallet} list={Object.values(GetCoins)} setSelect={setWallet} />
                    </div>
                    <div className="flex flex-col w-full">
                        <span className="text-left  text-greylish pb-2 ml-1" >Budget Amount</span>
                        <input className="outline-none unvisibleArrow bg-white pl-2 border rounded-lg py-2 dark:bg-darkSecond dark:text-white" type="number" step={'any'} min={0} />
                    </div>
                </div>
                {/* {<div className="flex w-full gap-8 pt-4">
                    <div className="flex flex-col w-full">
                        {/* <span className="text-left  text-greylish pb-2 ml-1" >Budget Token</span> 
                        <Dropdown className="!py-[0.6rem] border bg-white dark:bg-darkSecond text-sm rounded-lg" label="Budget Token" selected={wallet ?? Object.values(GetCoins!).map(w => ({ name: w.name, coinUrl: w.coinUrl }))[0]} list={Object.values(GetCoins!).map(w => ({ name: w.name, coinUrl: w.coinUrl }))} setSelect={val => {
                            setWallet(val)
                        }} />
                    </div>
                    <div className="flex flex-col w-full">
                        <span className="text-left  text-greylish pb-2 ml-1" >Budget Amount</span>
                        <input className="outline-none unvisibleArrow bg-white pl-2 border rounded-lg py-2 dark:bg-darkSecond dark:text-white" type="number" step={'any'} min={0} />
                    </div>
                </div> */}
                {subInputs.map((input, index) => {
                    return <div key={input.id}> <div className="flex flex-col">
                        <div className="flex justify-between relative">
                            <span className="text-left  text-greylish dark:text-white pb-2 ml-1" >Subbudget Name</span>
                            <div className="absolute -top-[-2.5rem] -right-[2rem]">
                            </div></div>
                        <input type="text" className="bg-white dark:bg-darkSecond border w-full py-2 px-1 rounded-lg" onChange={(e) => updateInputName(input.id, e.target.value)} />
                    </div>
                        <div className="flex w-full gap-8  pt-4">
                            <div className="flex flex-col w-full">

                                {/* <span className="text-left  text-greylish dark:text-white pb-2 ml-1" >Subbudget Token</span> */}
                                <Dropdown className="!py-[0.35rem] border dark:border-white bg-white dark:bg-darkSecond text-sm !rounded-lg" label="Subbudget Token" selected={input.wallet} list={Object.values(GetCoins)} runFn={val => () => updateInputWallet(input.id, val)} />
                            </div>
                            <div className="flex flex-col w-full">
                                <span className="text-left  text-greylish dark:text-white pb-2 ml-1" >Subbudget Amount</span>
                                <input className="outline-none unvisibleArrow bg-white pl-2 border rounded-lg py-2 dark:bg-darkSecond dark:text-white" type="number" name={`amount__${index}`} required step={'any'} min={0} onChange={(e) => updateInputAmount(input.id, parseInt(e.target.value))} />
                            </div>
                        </div>
                        {input.subAnotherToken && <div className="flex w-full gap-8  pt-4">
                            <div className="flex flex-col w-full">
                                {/* <span className="text-left  text-greylish dark:text-white pb-2 ml-1" >Subbudget Token</span> */}
                                <Dropdown className="!py-[0.35rem] border dark:border-white bg-white dark:bg-darkSecond text-sm !rounded-lg" selected={subBudget} list={Object.values(GetCoins) as AltCoins[]} label="Subbudget Token" setSelect={setSubBudget} />
                            </div>
                            <div className="flex flex-col w-full">
                                <div className="flex justify-between relative">
                                    <span className="text-left  text-greylish dark:text-white pb-2 ml-1" >Subbudget Amount</span>
                                    <div className="absolute -top-[-2.75rem] -right-[2rem]">

                                    </div>
                                </div>
                                <input className="outline-none unvisibleArrow bg-white pl-2 border rounded-lg py-2 dark:bg-darkSecond dark:text-white" type="number" name={`amount__${index}`} required step={'any'} min={0} onChange={(e) => updateInputAmount2(input.id, parseInt(e.target.value))} />
                            </div>
                        </div>}
                    </div>
                })}

                <div className="flex flex-col-reverse sm:grid grid-cols-2 w-[12.5rem] sm:w-full justify-center gap-8 pt-6">
                    <Button version="second" className="!rounded-xl" onClick={() => navigate.back()}>Cancel</Button>
                    <Button type="submit" className="bg-primary px-3 py-2 text-white flex items-center justify-center !rounded-xl" onClick={() => { navigate.push('/dashboard/budgets') }}>Edit</Button>
                </div>
            </div>

        </div>
    </div>
}

export default EditBudget