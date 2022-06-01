import { Dispatch, SetStateAction, useEffect, useState } from "react";
import { BsFillTrashFill } from "react-icons/bs";
import { DropDownItem } from "../../types/dropdown";
import Dropdown from "components/general/dropdown";
import { useWalletKit } from "hooks";
import { useDispatch } from "react-redux";
import { addPayInput, changePayInput, removePayInput, SelectInputAmount, SelectIsBaseOnDollar } from "redux/reducers/payinput";
import { generate } from "shortid";
import { useSelector } from "react-redux";
import Loader from "components/Loader";
import Paydropdown from '../../subpages/pay/paydropdown';

const Input = ({ incomingIndex, text, stream, request = false,setSelectedType,onChangeType }: { incomingIndex: string, text?: string, stream?: boolean, request?: boolean,setSelectedType?: Dispatch<SetStateAction<boolean>>,onChangeType?:(value: boolean) => void }) => {
    const { GetCoins } = useWalletKit()
    const dispatch = useDispatch()

    const isBasedOnDollar = useSelector(SelectIsBaseOnDollar)
    const inputAmounts = useSelector(SelectInputAmount)
    const [value, setValue] = useState('Pay with Token Amounts')
    const [index] = useState<string>(incomingIndex)
    const [name, setName] = useState<string>("")
    const [surname, setSurname] = useState<string>("")
    const [address, setAddress] = useState<string>("")
    const [amount, setAmount] = useState<number>()
    const [wallet, setWallet] = useState<DropDownItem>({
        name: Object.values(GetCoins)[0].name,
        coinUrl: Object.values(GetCoins)[0].coinUrl
    })

    const [amount2, setAmount2] = useState<number>()
    const [wallet2, setWallet2] = useState<DropDownItem>()

    const [anotherToken, setAnotherToken] = useState(false)

    useEffect(() => {
        dispatch(changePayInput({
            index,
            name,
            surname,
            address,
            amount,
            wallet,
            amount2,
            wallet2,
        }))
    }, [name,surname, address, amount, wallet, amount2, wallet2])

    const paymentname = ["Pay with USD-based Amounts", "Pay with Token Amounts"]

    return <>
        <div className="flex flex-col ">
            <span className="text-left  text-greylish pb-2 ml-2"> {request ? "First Name" : "Receiver Name"} <span className="text-black" >(Optional)</span> </span>
            <input className="col-span-4 py-3 md:col-span-1 border dark:border-darkSecond px-3  rounded-md dark:bg-darkSecond" placeholder="Name" defaultValue={name} type="text" name={`name__${index}`} onChange={(e) => { setName(e.target.value) }} /> {/* onBlur={(e) => setRefreshPage(generate())}*/}
        </div>
        {request && <><div className="flex flex-col ">
            <span className="text-left  text-greylish pb-2 ml-2"> Last Surname<span className="text-black"> (Optional)</span> </span>
            <input className="col-span-4 py-3 md:col-span-1 border dark:border-darkSecond px-3  rounded-md dark:bg-darkSecond" placeholder="Surname" defaultValue={surname} type="text" name={`name__${index}`} onChange={(e) => { setSurname(e.target.value) }} /> {/* onBlur={(e) => setRefreshPage(generate())}*/}
        </div>
        <div className="flex flex-col">
            <span className="text-left  text-greylish pb-2 ml-2">Amount Type</span>
            <Paydropdown setSelectedType={setSelectedType} onChangeType={onChangeType} paymentname={paymentname} value={value} setValue={setValue} />
        </div> </>}
        <div className="flex flex-col ">
            <span className="text-left  text-greylish pb-2 ml-2" >{request ? "Wallet Adress" : "Receiver Wallet Adress"}</span>
            <input className="col-span-4 py-3 md:col-span-1 border dark:border-darkSecond px-3  rounded-md dark:bg-darkSecond" placeholder="0x30....c40d263" defaultValue={address} type="text" name={`address__${index}`} onChange={(e) => { setAddress(e.target.value) }} required /> {/* onBlur={(e) => setRefreshPage(generate())}*/}
        </div>
        <div className="flex flex-col ">
            <span className="text-left  text-greylish pb-2 ml-2" >Token</span>
            {!wallet && !GetCoins ? <Loader /> : <Dropdown className="sm:h-[3rem] border bg-white text-sm !rounded-md" onSelect={val => {
                setWallet(val)
            }} nameActivation={true} selected={wallet ?? Object.values(GetCoins!).map(w => ({ name: w.name, coinUrl: w.coinUrl }))[0]} list={Object.values(GetCoins!).map(w => ({ name: w.name, coinUrl: w.coinUrl }))} />}
        </div>
        <div className="flex flex-col ">
            <span className="text-left  text-greylish pb-2 ml-2" >Amount</span>
            {stream && text === "Recurring" ? <div className={`col-span-4 sm:h-[3rem] md:col-span-1 border   bg-gray-300 dark:border-darkSecond dark:bg-darkSecond text-black dark:text-white rounded-md grid ${isBasedOnDollar ? "grid-cols-[40%,15%,45%]" : "grid-cols-[50%,50%]"}`}>
                <input className="outline-none unvisibleArrow  bg-gray-300 pl-2 dark:bg-darkSecond dark:text-white" readOnly defaultValue={amount} type="number" name={`amount__${index}`} onChange={(e) => {
                    setAmount(Number(e.target.value))
                }} required step={'any'} min={0} />
                {isBasedOnDollar && <span className="text-xs self-center bg-white  text-right opacity-70 dark:text-white">USD as</span>}
            </div> : <div className={`col-span-4 sm:h-[3rem] md:col-span-1 border  bg-white dark:border-darkSecond dark:bg-darkSecond text-black dark:text-white rounded-md grid ${isBasedOnDollar ? "grid-cols-[40%,15%,45%]" : "grid-cols-[50%,50%]"}`}>
                <input className="outline-none unvisibleArrow bg-white pl-2 dark:bg-darkSecond dark:text-white" placeholder="Your Amount here" defaultValue={amount} type="number" name={`amount__${index}`} onChange={(e) => {
                    setAmount(Number(e.target.value))
                }} required step={'any'} min={0} />
                {isBasedOnDollar && <span className="text-xs self-center bg-white text-right opacity-70 dark:text-white">USD as</span>}
            </div>}
        </div>
        {/* <div className="hidden md:flex items-center">
            {inputAmounts > 1 && <BsFillTrashFill className="text-red-500 cursor-pointer" onClick={() => {
                dispatch(removePayInput(index))
                //setRefreshPage(generate())
            }} />}
        </div> */}

        {amount2 || anotherToken ? <>
            <div className="flex flex-col ">
                <span className="text-left  text-greylish pb-2 ml-2" >Token</span>
                {!wallet2 && !GetCoins ? <Loader /> : <Dropdown className="sm:h-[3rem] bg-white border text-sm !rounded-md" onSelect={val => {
                    setWallet2(val)
                }} nameActivation={true} selected={wallet2 ?? Object.values(GetCoins).map(w => ({ name: w.name, coinUrl: w.coinUrl }))[0]} list={Object.values(GetCoins).map(w => ({ name: w.name, coinUrl: w.coinUrl }))} />}
            </div>
            <div className="flex flex-col ">
                <span className="text-left  text-greylish pb-2 ml-2" >Amount</span>
                {stream && text === "Recurring"  ? <div className={`col-span-4 sm:h-[3rem] md:col-span-1 bg-gray-300 border dark:border-darkSecond dark:bg-darkSecond text-black dark:text-white py-1 rounded-md grid ${isBasedOnDollar ? "grid-cols-[40%,15%,45%]" : "grid-cols-[50%,50%]"}`}>
                    <input className="outline-none unvisibleArrow bg-gray-300 pl-2 dark:bg-darkSecond dark:text-white" readOnly defaultValue={amount2} type="number" name={`amount__${index + 1}`} onChange={(e) => {
                        setAmount2(Number(e.target.value))
                    }} step={'any'} min={0} />
                    {isBasedOnDollar && <span className="text-xs self-center opacity-70 dark:text-white">USD as</span>}
                </div> : <div className={`col-span-4 sm:h-[3rem] md:col-span-1 bg-white border dark:border-darkSecond dark:bg-darkSecond text-black dark:text-white py-1 rounded-md grid ${isBasedOnDollar ? "grid-cols-[40%,15%,45%]" : "grid-cols-[50%,50%]"}`}>
                    <input className="outline-none unvisibleArrow pl-2 dark:bg-darkSecond dark:text-white" placeholder="Your Amount here" defaultValue={amount2} type="number" name={`amount__${index + 1}`} onChange={(e) => {
                        setAmount2(Number(e.target.value))
                    }} step={'any'} min={0} />
                    {isBasedOnDollar && <span className="text-xs self-center opacity-70 dark:text-white">USD as</span>}
                </div>}
            </div>
        </>
            :
            (text === "One-Time"  || request) && <div className="text-primary text-sm cursor-pointer " onClick={() => setAnotherToken(true)}>
                <span className="flex gap-2 bg-opacity-5 font-semibold  pl-1 text-center rounded-xl ">
                    <span className="w-5 h-5 border rounded-full border-primary  text-primary  flex items-center justify-center">+</span> Add another token
                </span>
            </div>
        }

    </>
}
export default Input;