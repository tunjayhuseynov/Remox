import { Dispatch, useEffect, useState } from "react";
import { BsFillTrashFill } from "react-icons/bs";
import { DropDownItem } from "../../types/dropdown";
import Dropdown from "components/general/dropdown";
import { useWalletKit } from "hooks";
import { useDispatch } from "react-redux";
import { addPayInput, changePayInput, removePayInput, SelectInputAmount, SelectIsBaseOnDollar } from "redux/reducers/payinput";
import { generate } from "shortid";
import { useSelector } from "react-redux";
import Loader from "components/Loader";


const Input = ({ incomingIndex }: { incomingIndex: string }) => {
    const { GetCoins } = useWalletKit()
    const dispatch = useDispatch()

    const isBasedOnDollar = useSelector(SelectIsBaseOnDollar)
    const inputAmounts = useSelector(SelectInputAmount)

    const [index] = useState<string>(incomingIndex)
    const [name, setName] = useState<string>("")
    const [address, setAddress] = useState<string>("")
    const [amount, setAmount] = useState<number>()
    const [wallet, setWallet] = useState<DropDownItem>({
        name: Object.values(GetCoins)[0].name,
        coinUrl: Object.values(GetCoins)[0].coinUrl
    })

    const [amount2, setAmount2] = useState<number>()
    const [wallet2, setWallet2] = useState<DropDownItem>()

    const [anotherToken, setAnotherToken] = useState(false)

    useEffect(()=>{
        dispatch(changePayInput({
            index, 
            name,
            address,
            amount,
            wallet,
            amount2,
            wallet2,
        }))
    }, [name, address, amount, wallet, amount2, wallet2])

    return <>
        <input className="col-span-4 sm:h-[3rem] md:col-span-1 border dark:border-darkSecond px-3 py-1 rounded-md dark:bg-darkSecond" placeholder="Name" defaultValue={name} type="text" name={`name__${index}`} onChange={(e) => { setName(e.target.value) }} /> {/* onBlur={(e) => setRefreshPage(generate())}*/}
        <input className="col-span-4 sm:h-[3rem] md:col-span-1 border dark:border-darkSecond px-3 py-1 rounded-md dark:bg-darkSecond" placeholder="Address" defaultValue={address} type="text" name={`address__${index}`} onChange={(e) => { setAddress(e.target.value) }} required /> {/* onBlur={(e) => setRefreshPage(generate())}*/}
        <div className={`col-span-4 sm:h-[3rem] md:col-span-1 border dark:border-darkSecond dark:bg-darkSecond text-black dark:text-white rounded-md grid ${isBasedOnDollar ? "grid-cols-[40%,15%,45%]" : "grid-cols-[50%,50%]"}`}>
            <input className="outline-none unvisibleArrow pl-2 dark:bg-darkSecond dark:text-white" placeholder="Amount" defaultValue={amount} type="number" name={`amount__${index}`} onChange={(e) => {
                setAmount(Number(e.target.value))
            }} required step={'any'} min={0} />
            {isBasedOnDollar && <span className="text-xs self-center opacity-70 dark:text-white">USD as</span>}
            {!wallet && !GetCoins ? <Loader /> : <Dropdown className="sm:h-[3rem] border-transparent text-sm border-none" onSelect={val => {
                setWallet(val)
            }} nameActivation={true} selected={wallet ?? Object.values(GetCoins!).map(w => ({ name: w.name, coinUrl: w.coinUrl }))[0]} list={Object.values(GetCoins!).map(w => ({ name: w.name, coinUrl: w.coinUrl }))} />}

        </div>
        <div className="hidden md:flex items-center">
            {inputAmounts > 1 && <BsFillTrashFill className="text-red-500 cursor-pointer" onClick={() => {
                dispatch(removePayInput(index))
                //setRefreshPage(generate())
            }} />}
        </div>
        <div className="hidden md:block"></div>
        <div className="hidden md:block"></div>
        {amount2 || anotherToken ? <div className={`col-span-4 md:col-span-1 border dark:border-darkSecond dark:bg-darkSecond text-black dark:text-white py-1 rounded-md grid ${isBasedOnDollar ? "grid-cols-[40%,15%,45%]" : "grid-cols-[50%,50%]"}`}>
            <input className="outline-none unvisibleArrow pl-2 dark:bg-darkSecond dark:text-white" placeholder="Amount" defaultValue={amount2} type="number" name={`amount__${index + 1}`} onChange={(e) => {
                setAmount2(Number(e.target.value))

            }} step={'any'} min={0} />
            {isBasedOnDollar && <span className="text-xs self-center opacity-70 dark:text-white">USD as</span>}
            {!wallet2 && !GetCoins ? <Loader /> : <Dropdown className="border-transparent text-sm border-none" onSelect={val => {
                setWallet2(val)
            }} nameActivation={true} selected={wallet2 ?? Object.values(GetCoins).map(w => ({ name: w.name, coinUrl: w.coinUrl }))[0]} list={Object.values(GetCoins).map(w => ({ name: w.name, coinUrl: w.coinUrl }))} />}

        </div>
            :
            <div className="text-primary text-sm cursor-pointer col-span-2 md:col-span-1" onClick={() => setAnotherToken(true)}>
                <span className="bg-greylish bg-opacity-5 font-semibold py-3 px-5 text-center rounded-xl ">
                    + Add another token
                </span>
            </div>
        }
        <div className="hidden md:block"></div>

        <div className="hidden md:block"></div>
        <div className="hidden md:block"></div>
        <div className="hidden md:block"></div>
        <div className="hidden md:block mt-5"></div>
    </>
}
export default Input;