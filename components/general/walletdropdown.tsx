import React, { Dispatch, useEffect, useState } from "react";
import useModalSideExit from '../../hooks/useModalSideExit';
import { IoIosArrowDown } from 'react-icons/io';
import useMultiWallet from "hooks/useMultiWallet";
import { WordSplitter } from "utils";
import { IMultiwallet, IUser } from "firebaseConfig";
import Loader from "components/Loader";

export const WalletDropdown = ({ selected, onChange }: { selected: string, onChange: (accounts: IMultiwallet[]) => void }) => {
    const [isOpen, setOpen] = useState(false)
    const [divRef, exceptRef] = useModalSideExit<boolean>(isOpen, setOpen, false)
    const { data } = useMultiWallet()
    const [selectedAccounts, setAccounts] = useState<IMultiwallet[]>(data ?? [])

    useEffect(() => {
        if (data) {
            setAccounts(data)
        }
    }, [data])

    if (!data) return <div> <Loader /></div>
    const l = selectedAccounts.length;
    return <div className="relative">
        <div onClick={() => setOpen(!isOpen)} className="font-normal px-2 sm:px-5 py-2 rounded-xl cursor-pointer bg-greylish bg-opacity-10 flex space-x-1 items-center justify-center " ref={exceptRef}>
            <span>{WordSplitter(`${l === data.length ? "All Wallets" : `${l} Wallet${l > 1 ? "s" : ""}`}` || "")}</span>
            <div>
                <IoIosArrowDown className='transition' style={isOpen ? { transform: "rotate(180deg)" } : undefined} />
            </div>
        </div>
        {isOpen && <div ref={divRef} className="absolute min-w-[150%] rounded-xl sm:-right-0 -bottom-1 translate-y-full shadow-xl z-50">
            <ul>
                {data && data.map((w) => {
                    return <WalletDropdownItem w={w} onChange={onChange} selectedAccount={selectedAccounts} setAccount={setAccounts} />
                })}
            </ul>
        </div>
        }
    </div>
}


const WalletDropdownItem = ({ w, selectedAccount, setAccount, onChange }: { w: IMultiwallet, selectedAccount: IMultiwallet[], setAccount: Dispatch<React.SetStateAction<IMultiwallet[]>>, onChange: (wallets: IMultiwallet[]) => void }) => {


    return <li key={w.address} onClick={() => {
        const list = (s: IMultiwallet[]) => {
            if (s.some(f => f.address.toLowerCase() === w.address.toLowerCase()) && s.length > 1) return s.filter(a => a.address !== w.address)
            if (s.some(f => f.address.toLowerCase() === w.address.toLowerCase()) && s.length === 1) return s;
            return [...s, w]
        }
        onChange(list(selectedAccount));
        setAccount(s => list(s))
    }} className="navbarli text-left flex flex-col space-y-1 border-b-2 transition  px-5 py-4 bg-white dark:bg-darkSecond cursor-pointer first:rounded-t-xl last:rounded-b-xl">
        <div className="flex space-x-2">
            <input type="checkbox" className="w-4 h-4 accent-[#ff501a] cursor-pointer peer" name="paymentType" checked={selectedAccount.some(s => s.address.toLowerCase() === w.address.toLowerCase())} value={w.address} />
            <label className="font-semibold text-sm peer-checked:text-primary cursor-pointer">
                {WordSplitter(w?.name || "")}
            </label>
        </div>
        <label className="font-semibold text-[0.75rem] text-greylish peer-checked:text-primary cursor-pointer">
            {w.address}
        </label>
    </li>

}