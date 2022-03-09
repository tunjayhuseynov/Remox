import { Dispatch, useEffect, useState } from "react";
import { BsFillTrashFill } from "react-icons/bs";
import { ClipLoader } from "react-spinners";
import { Coins, PoofCoins } from "../../types/coins";
import { DropDownItem } from "../../types/dropdown";
import Dropdown from "components/general/dropdown";
import { useContractKit, WalletTypes } from "@celo-tools/use-contractkit";


const Input = ({ index, name, address, selectedWallet, setWallet, setIndex, overallIndex, amount,amount2, uniqueArr, isBasedOnDollar, setAmount, amountState }: { index: number, name: Array<string>, address: Array<string>, selectedWallet: DropDownItem[], setWallet: Dispatch<DropDownItem[]>, setIndex: Dispatch<number>, overallIndex: number, amount: Array<string>,amount2:Array<string>, uniqueArr: string[], isBasedOnDollar: boolean, setAmount: Dispatch<number[]>, amountState: number[] }) => {
    const { walletType } = useContractKit()
    const [anotherToken, setAnotherToken] = useState(false)

    useEffect(() => {
        if (!selectedWallet[index] && !selectedWallet[index + 1]) {
            const v = Object.values(walletType === WalletTypes.PrivateKey ? PoofCoins : Coins).map(w => ({ name: w.name, type: w.value, coinUrl: w.coinUrl, value: w.value }))[0];
            setWallet([...selectedWallet, v, v])
        }

    }, []) 
    // sonradan elave olunub
    // console.log(amount)
    return <>
        <input className="h-[30px]  sm:h-[40px] sm:w-full md:col-span-1 border dark:border-darkSecond px-3 py-1 rounded-md dark:bg-darkSecond" placeholder="Name" defaultValue={name[index]} type="text" name={`name__${index}`} onChange={(e) => { name[index] = e.target.value; name[index + 1] = e.target.value }} /> {/* onBlur={(e) => setRefreshPage(generate())}*/}
        <input className=" h-[30px]  sm:h-[40px] sm:w-full md:col-span-1 border dark:border-darkSecond px-3 py-1 rounded-md dark:bg-darkSecond" placeholder="Address" defaultValue={address[index]} type="text" name={`address__${index}`} onChange={(e) => { address[index] = e.target.value; address[index + 1] = e.target.value }} required /> {/* onBlur={(e) => setRefreshPage(generate())}*/}
        <div className={` sm:h-[40px] sm:w-full md:col-span-1 border dark:border-darkSecond dark:bg-darkSecond text-black dark:text-white rounded-md grid ${isBasedOnDollar ? "grid-cols-[40%,15%,45%]" : "grid-cols-[50%,50%]"}`}>
            <input className="outline-none unvisibleArrow pl-2 dark:bg-darkSecond dark:text-white" placeholder="Amount" defaultValue={amount[index]} type="number" name={`amount__${index}`} onChange={(e) => {
                amount[index] = e.target.value;
                const arr = [...amountState]
                arr[index] = Number(e.target.value)
                setAmount(arr)
            }} required step={'any'} min={0} />
            {isBasedOnDollar && <span className="text-xs self-center opacity-70 dark:text-white">USD as</span>}
            {!selectedWallet ? <ClipLoader /> : <Dropdown className="border-transparent text-sm border-none" onSelect={val => {
                const wallet = [...selectedWallet];
                wallet[index] = val;
                setWallet(wallet)
            }} nameActivation={true} selected={selectedWallet[index] ?? Object.values(walletType === WalletTypes.PrivateKey ? PoofCoins : Coins).map(w => ({ name: w.name, type: w.value, coinUrl: w.coinUrl, value: w.value }))[0]} list={Object.values(walletType === WalletTypes.PrivateKey ? PoofCoins : Coins).map(w => ({ name: w.name, type: w.value, coinUrl: w.coinUrl, value: w.value }))} />}

        </div>
        <div className="hidden md:flex items-center">
            {overallIndex > 1 && <BsFillTrashFill className="text-red-500 cursor-pointer" onClick={() => {
                name.splice(index, 2);
                address.splice(index, 2);
                amount.splice(index, 2);
                uniqueArr.splice(index, 2);
                setWallet([...selectedWallet.filter((s, t) => t !== index && t !== index + 1)]);
                setIndex(overallIndex - 1)
                //setRefreshPage(generate())
            }} />}
        </div>
        <div className="hidden md:block"></div>
        <div className="hidden md:block"></div>
        {/* sonradan elave olunub amount length */}
        {amount2.length  > 0 || anotherToken ?  <div className={`sm:col-span-1 border dark:border-darkSecond dark:bg-darkSecond text-black dark:text-white py-1 rounded-md grid ${isBasedOnDollar ? "grid-cols-[40%,15%,45%]" : "grid-cols-[50%,50%]"}`}>
            <input className="outline-none unvisibleArrow pl-2 dark:bg-darkSecond dark:text-white" placeholder="Amount" defaultValue={amount[index + 1]} type="number" name={`amount__${index + 1}`} onChange={(e) => {
                amount[index + 1] = e.target.value
                const arr = [...amountState]
                arr[index + 1] = Number(e.target.value)
                setAmount(arr)

            }} step={'any'} min={0} />
            {isBasedOnDollar && <span className="text-xs self-center opacity-70 dark:text-white">USD as</span>}
            {!selectedWallet ? <ClipLoader /> : <Dropdown className="border-transparent text-sm" onSelect={val => {
                const wallet = [...selectedWallet];
                wallet[index + 1] = val;
                setWallet(wallet)
            }} nameActivation={true} selected={selectedWallet[index + 1] ?? Object.values(walletType === WalletTypes.PrivateKey ? PoofCoins : Coins).map(w => ({ name: w.name, type: w.value, coinUrl: w.coinUrl, value: w.value }))[0]} list={Object.values(walletType === WalletTypes.PrivateKey ? PoofCoins : Coins).map(w => ({ name: w.name, type: w.value, coinUrl: w.coinUrl, value: w.value }))} />}

        </div>
            : 
             <div className="text-primary text-sm cursor-pointer col-span-1" onClick={() => setAnotherToken(true)}>
                <span className="bg-greylish bg-opacity-5 font-semibold tracking-wide py-3 px-5 text-center rounded-xl ">
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