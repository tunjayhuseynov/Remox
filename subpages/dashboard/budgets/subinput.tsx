import React, { useState } from 'react'
import { DropDownItem } from "../../../types/dropdown";
import Dropdown from "../../../components/general/dropdown";
import { useWalletKit } from "../../../hooks";
import Button from '../../../components/button';
import { useAppDispatch } from "redux/hooks";
import { addSubInput, SelectInputs } from "redux/reducers/subinput";
import shortid, { generate } from 'shortid'
import useNextSelector from "hooks/useNextSelector";
function Subinput({index}:{index:number}) {
    const { GetCoins } = useWalletKit()
    const [anotherToken2, setAnotherToken2] = useState(false)
    const [wallet, setWallet] = useState<DropDownItem>({
        name: Object.values(GetCoins)[0].name,
        coinUrl: Object.values(GetCoins)[0].coinUrl
    })
    const [wallet2, setWallet2] = useState<DropDownItem>({
        name: Object.values(GetCoins)[0].name,
        coinUrl: Object.values(GetCoins)[0].coinUrl
    })

  return <>
 {index !== 0 && <> <div  className="flex flex-col">
      <span className="text-left  text-greylish pb-2 ml-1" >Subbudget Name</span>
      <input type="text" className="border w-full py-2 px-1 rounded-lg" />
  </div>
  <div className="flex w-full gap-8  pt-4">
      <div className="flex flex-col w-full">
          <span className="text-left  text-greylish pb-2 ml-1" >Subbudget Token</span>
          <Dropdown className="!py-[0.6rem] border bg-white dark:bg-darkSecond text-sm rounded-lg" nameActivation={true} selected={wallet ?? Object.values(GetCoins!).map(w => ({ name: w.name, coinUrl: w.coinUrl }))[0]} list={Object.values(GetCoins!).map(w => ({ name: w.name, coinUrl: w.coinUrl }))} onSelect={val => {
              setWallet(val)
          }} />
      </div>
      <div className="flex flex-col w-full">
          <span className="text-left  text-greylish pb-2 ml-1" >Subbudget Amount</span>
          <input className="outline-none unvisibleArrow bg-white pl-2 border rounded-lg py-2 dark:bg-darkSecond dark:text-white" type="number" step={'any'} min={0} />
      </div>
  </div>
  {anotherToken2 && <div className="flex w-full gap-8  pt-4">
      <div className="flex flex-col w-full">
          <span className="text-left  text-greylish pb-2 ml-1" >Subbudget Token</span>
          <Dropdown className="!py-[0.6rem] border bg-white dark:bg-darkSecond text-sm rounded-lg" nameActivation={true} selected={wallet2 ?? Object.values(GetCoins!).map(w => ({ name: w.name, coinUrl: w.coinUrl }))[0]} list={Object.values(GetCoins!).map(w => ({ name: w.name, coinUrl: w.coinUrl }))} onSelect={val => {
              setWallet2(val)
          }} />
      </div>
      <div className="flex flex-col w-full">
          <span className="text-left  text-greylish pb-2 ml-1" >Subbudget Amount</span>
          <input className="outline-none unvisibleArrow bg-white pl-2 border rounded-lg py-2 dark:bg-darkSecond dark:text-white" type="number" step={'any'} min={0} />
      </div> </div>}
  {!anotherToken2 && <div className="text-primary  cursor-pointer " onClick={() => setAnotherToken2(true)}>
      <span className="flex gap-2 bg-opacity-5 font-semibold py-3 pl-1 text-center rounded-xl ">
          <span className="w-5 h-5 border rounded-full border-primary  text-primary  flex items-center justify-center">+</span> Add another subbuget
      </span>
  </div>}</>}
</>
}

export default Subinput