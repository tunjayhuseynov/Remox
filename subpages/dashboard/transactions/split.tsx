
import React, { Dispatch, SetStateAction } from 'react'
import { Fragment, useEffect, useState, useRef } from "react";
import Dropdown from "components/general/dropdown";
import { DropDownItem } from "types/dropdown";
import _ from "lodash";
import { useTransactionProcess, useWalletKit } from "hooks";
import { useSelector } from "react-redux";
import { selectDarkMode } from "redux/reducers/notificationSlice";
import useProfile from "apiHooks/useProfile";
import { useModalSideExit } from "hooks";
import Paydropdown from 'subpages/pay/paydropdown';

function Split({split,split2,split3,setSplit,setSplit2,setSplit3}:{split:boolean,split2:boolean,split3:boolean,setSplit:React.Dispatch<React.SetStateAction<boolean>>,setSplit2:React.Dispatch<React.SetStateAction<boolean>>,setSplit3:React.Dispatch<React.SetStateAction<boolean>>}) {
    const { GetCoins, fromMinScale } = useWalletKit()
    const dark = useSelector(selectDarkMode)
    const { profile, UpdateSeenTime } = useProfile()
    const [openNotify, setNotify] = useState(false)

    const [value2, setValue2] = useState('')
    const [value3, setValue3] = useState('')
    const [value4, setValue4] = useState('')

    const [wallet2, setWallet2] = useState<DropDownItem>({
        name: Object.values(GetCoins)[0].name,
        coinUrl: Object.values(GetCoins)[0].coinUrl
    })
    const [wallet3, setWallet3] = useState<DropDownItem>({
        name: Object.values(GetCoins)[0].name,
        coinUrl: Object.values(GetCoins)[0].coinUrl
    })
    const [wallet4, setWallet4] = useState<DropDownItem>({
        name: Object.values(GetCoins)[0].name,
        coinUrl: Object.values(GetCoins)[0].coinUrl
    })

    useEffect(() => {
        if (openNotify) {
            UpdateSeenTime(new Date().getTime())
        }
    }, [openNotify])


    const [divRef, exceptRef] = useModalSideExit(openNotify, setNotify, false)

    const paymentname2 = ["Marketing", "Security","Development"]
    const paymentname3 = ["Marketing", "Security","Development"]
    const paymentname4 = ["Marketing", "Security","Development"]

  return <>
  {split && <div className="flex flex-col gap-10 justify-center items-center  pb-8 px-16 w-full">
  <div className="flex justify-between items-center w-full px-1">
      <span className="text-lg font-medium">Split 2</span>
      <span className="text-red-600 cursor-pointer" onClick={()=>{setSplit(false)}}>Delete</span>

  </div>
  <div className="flex w-full justify-between ">
      <div className="flex flex-col w-[45%]">
          <span className="text-left  text-greylish pb-2 pl-1" >Token</span>
       <Dropdown className=" border bg-white text-sm rounded-lg" onSelect={val => {
              setWallet2(val)
          }} nameActivation={true} selected={wallet2 ?? Object.values(GetCoins!).map(w => ({ name: w.name, coinUrl: w.coinUrl }))[0]} list={Object.values(GetCoins!).map(w => ({ name: w.name, coinUrl: w.coinUrl }))} />
      </div>
      <div className="flex flex-col w-[45%]">
          <span className="text-left  text-greylish pb-2 pl-1" >Amount</span>
          <input className="outline-none unvisibleArrow  border rounded-xl py-[.4rem] pl-2 dark:bg-darkSecond dark:text-white" placeholder="0"   step={'any'} min={0} />
      </div>
  </div>
  <div className="flex flex-col w-full pb-4">
  <span className="text-left  text-greylish pb-2 pl-1" >Budget</span>
  <Paydropdown  paymentname={paymentname2} value={value2} setValue={setValue2} className={'!py-3'}  />
  {split2  ? <div className="border-b w-full pt-8"></div> : <div className="pt-8 cursor-pointer self-start text-primary flex items-center justify-center gap-1" onClick={()=>{setSplit2(true)}} ><span className=" px-2 border border-primary rounded-full ">+</span>Add Split</div> }
  </div>
</div>}
{split2 && <div className="flex flex-col gap-10 justify-center items-center  pb-8  px-16 w-full">
  <div className="flex justify-between items-center w-full px-1">
      <span className="text-lg font-medium">Split 3</span>
      <span className="text-red-600 cursor-pointer" onClick={()=> setSplit2(false)}>Delete</span>

  </div>
  <div className="flex w-full justify-between ">
      <div className="flex flex-col w-[45%]">
          <span className="text-left  text-greylish pb-2 pl-1" >Token</span>
       <Dropdown className=" border bg-white text-sm rounded-lg" onSelect={val => {
              setWallet3(val)
          }} nameActivation={true} selected={wallet3 ?? Object.values(GetCoins!).map(w => ({ name: w.name, coinUrl: w.coinUrl }))[0]} list={Object.values(GetCoins!).map(w => ({ name: w.name, coinUrl: w.coinUrl }))} />
      </div>
      <div className="flex flex-col w-[45%]">
          <span className="text-left  text-greylish pb-2 pl-1" >Amount</span>
          <input className="outline-none unvisibleArrow  border rounded-xl py-[.4rem] pl-2 dark:bg-darkSecond dark:text-white" placeholder="0"   step={'any'} min={0} />
      </div>
  </div>
  <div className="flex flex-col w-full pb-4">
  <span className="text-left  text-greylish pb-2 pl-1" >Budget</span>
  <Paydropdown  paymentname={paymentname3} value={value3} setValue={setValue3} className={'!py-3'}  />
  {split3  ? <div className="border-b w-full pt-8"></div> : <div className="pt-8 cursor-pointer self-start text-primary flex items-center justify-center gap-1" onClick={()=>{setSplit3(true)}} ><span className=" px-2 border border-primary rounded-full ">+</span>Add Split</div> }
  </div>
 
</div>}
</> 
}

export default Split