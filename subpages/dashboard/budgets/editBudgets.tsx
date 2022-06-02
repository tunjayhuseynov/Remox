import React, { useState } from 'react'
import { DropDownItem } from "../../../types/dropdown";
import Dropdown from "components/general/dropdown";
import { useWalletKit } from "hooks";
import Button from 'components/button';

function EditBudget({setNewBudget,setSign}:{setNewBudget: React.Dispatch<boolean>,setSign?: React.Dispatch<boolean>}) {
    const { GetCoins } = useWalletKit()
    const [anotherToken, setAnotherToken] = useState(false)
    const [anotherToken2, setAnotherToken2] = useState(false)
    const [subBudget, setSubBudget] = useState(false)
    const [wallet, setWallet] = useState<DropDownItem>({
        name: Object.values(GetCoins)[0].name,
        coinUrl: Object.values(GetCoins)[0].coinUrl
    })


    return (
        <div>
            <div className="text-2xl text-center font-medium">Edit Budgets</div>
            <div className="px-12 flex flex-col gap-4">
                <div className="flex flex-col">
                    <span className="text-left  text-greylish pb-2 ml-1" >Budget Name</span>
                    <input type="text" className="border w-full py-2 px-1 rounded-lg" />
                </div>
                <div className="flex w-full gap-8 pt-4">
                <div className="flex flex-col w-full">
                    <span className="text-left  text-greylish pb-2 ml-1" >Budget Token</span>
                    <Dropdown className="!py-[0.6rem] border bg-white dark:bg-darkSecond text-sm rounded-lg" nameActivation={true} selected={wallet ?? Object.values(GetCoins!).map(w => ({ name: w.name, coinUrl: w.coinUrl }))[0]} list={Object.values(GetCoins!).map(w => ({ name: w.name, coinUrl: w.coinUrl }))}  onSelect={val => {
                setWallet(val)
            }}/>
                </div>
                <div className="flex flex-col w-full">
                    <span className="text-left  text-greylish pb-2 ml-1" >Budget Amount</span>
                        <input className="outline-none unvisibleArrow bg-white pl-2 border rounded-lg py-2 dark:bg-darkSecond dark:text-white"  type="number" step={'any'} min={0} />
                </div>
                </div>
                <div className="flex flex-col-reverse sm:grid grid-cols-2 w-[12.5rem] sm:w-full justify-center gap-8 pt-6">
                    <Button version="second" className="!rounded-xl" onClick={() => setNewBudget(false)}>Cancel</Button>
                    <Button type="submit" className="bg-primary px-3 py-2 text-white flex items-center justify-center !rounded-xl" onClick={() => {setSign && setSign(true); setNewBudget(false)}}>Edit</Button>
                </div>
            </div>

        </div>
    )
}

export default EditBudget