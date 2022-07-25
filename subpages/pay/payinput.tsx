import { Dispatch, SetStateAction, useEffect, useMemo, useState } from "react";
import { BsFillTrashFill } from "react-icons/bs";
import Dropdown from "components/general/dropdown";
import { useWalletKit } from "hooks";
import { useDispatch } from "react-redux";
import { changeAddress, changeAmount, changeName, changeSecondAmount, changeSecondWallet, changeWallet, IPayInput, removePayInput, removeSeconField, SelectInputAmount, SelectIsBaseOnDollar } from "redux/slices/payinput";
import { useSelector } from "react-redux";

const Input = ({ payInput, index, request = false }: { payInput: IPayInput, index: number, request?: boolean }) => {
    const { GetCoins } = useWalletKit()
    const dispatch = useDispatch()

    const isBasedOnDollar = useSelector(SelectIsBaseOnDollar)
    const inputAmounts = useSelector(SelectInputAmount)
    const coins = useMemo(() => Object.values(GetCoins!).map(w => ({ name: w.name, coinUrl: w.coinUrl })), [GetCoins])


    const [anotherToken, setAnotherToken] = useState(false)


    return <>
        <div className="flex flex-col">
            <span className="text-left text-sm pb-1 ml-1"> {request ? "First Name" : "Receiver Name"} <span className="text-greylish" >(Optional)</span> </span>
            <input className="col-span-4 py-3 md:col-span-1 border dark:border-darkSecond px-3  rounded-md dark:bg-darkSecond" placeholder="Name" defaultValue={payInput.name} type="text" name={`name__${index}`}
                onChange={(e) => { dispatch(changeName({ index: payInput.index, name: e.target.value })) }} />
        </div>
        <div className="flex flex-col">
            <div className="flex relative">
                <span className="text-left text-sm pb-1 ml-1" >{request ? "Wallet Adress" : "Receiver Wallet Adress"}</span>
                <div className="absolute -top-[-3.75rem] -right-[2rem]">
                    {inputAmounts > 1 && <BsFillTrashFill className="text-red-500 cursor-pointer w-5 h-5" onClick={() => {
                        dispatch(removePayInput(payInput.index))
                    }} />}
                </div>
            </div>
            <input className="col-span-4 py-3 md:col-span-1 border dark:border-darkSecond px-3  rounded-md dark:bg-darkSecond" placeholder="0x30....c40d263" defaultValue={payInput.address} type="text" name={`address__${index}`} onChange={(e) => { dispatch(changeAddress({ index: payInput.index, address: e.target.value })) }} required />
        </div>
        <div className="flex flex-col ">
            <span className="text-left text-sm m pb-1 ml-1" >Token</span>
            {<Dropdown className="sm:h-[3rem] border bg-white dark:bg-darkSecond text-sm !rounded-md" setSelect={val => dispatch(changeWallet({ index: payInput.index, wallet: val }))} nameActivation={true} selected={payInput.wallet ?? coins[0]} list={coins} />}
            {!anotherToken && (index === 0 || request) && <div className="text-primary text-sm cursor-pointer pt-4" onClick={() => {
                setAnotherToken(true)
                dispatch(changeSecondWallet({ index: payInput.index, wallet: coins[0] }))
            }}>
                <span className="flex gap-2 bg-opacity-5 font-semibold  pl-1 text-center rounded-xl ">
                    <span className="w-5 h-5 border rounded-full border-primary  text-primary  flex items-center justify-center">+</span> Add another token
                </span>
            </div>}
        </div>
        <div className="flex flex-col ">
            <span className="text-left text-sm m pb-1 ml-1" >Amount</span>
            <div className={`col-span-4 sm:h-[3rem] md:col-span-1 border  bg-white dark:border-darkSecond dark:bg-darkSecond text-black dark:text-white rounded-md grid ${isBasedOnDollar ? "grid-cols-[40%,15%,45%]" : "grid-cols-[50%,50%]"}`}>
                <input className="outline-none unvisibleArrow bg-white pl-2 dark:bg-darkSecond dark:text-white" placeholder="Your Amount here" defaultValue={payInput.amount} type="number" name={`amount__${index}`} onChange={(e) => {
                    dispatch(changeAmount({ index: payInput.index, amount: Number(e.target.value) }))
                }} required step={'any'} min={0} />
                {isBasedOnDollar && <span className="text-xs self-center bg-white text-right opacity-70 dark:text-white">USD as</span>}
            </div>
        </div>
        {(!!(payInput.amount2) || anotherToken) && <>
            <div className="flex flex-col ">
                <span className="text-left text-sm pb-1 ml-1" >Token</span>
                <Dropdown className="sm:h-[3rem] bg-white dark:bg-darkSecond border text-sm !rounded-md" setSelect={val => {
                    dispatch(changeSecondWallet({ index: payInput.index, wallet: val }))
                }} nameActivation={true} selected={payInput.wallet2 ?? coins[0]} list={coins} />
            </div>
            <div className="flex flex-col">
                <div className="flex justify-between relative">
                    <span className="text-left text-sm pb-1 ml-2" >Amount</span>
                    <div className="absolute -top-[-2.75rem] -right-[2rem]">
                        {<BsFillTrashFill className="text-red-500 cursor-pointer w-5 h-5" onClick={() => {
                            setAnotherToken(false)
                            dispatch(removeSeconField(payInput.index))
                        }} />}
                    </div>
                </div>
                <div>
                    {isBasedOnDollar && <span className="text-xs self-center opacity-70 dark:text-white">USD as</span>}
                    <div className={`col-span-4 sm:h-[3rem] md:col-span-1 bg-white border dark:border-darkSecond dark:bg-darkSecond text-black dark:text-white py-1 rounded-md grid ${isBasedOnDollar ? "grid-cols-[40%,15%,45%]" : "grid-cols-[50%,50%]"}`}>
                        <input className={` outline-none unvisibleArrow pl-2 dark:bg-darkSecond dark:text-white`} placeholder="Your Amount here" defaultValue={payInput.amount2} type="number" name={`amount__${index + 1}`} onChange={(e) => {
                            dispatch(changeSecondAmount({ index: payInput.index, amount: Number(e.target.value) }))
                        }} step={'any'} min={0} />
                    </div>
                </div>
            </div>
        </>
        }
    </>
}
export default Input;