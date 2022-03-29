import { useEffect, useState } from "react";
import useModalSideExit from '../../hooks/useModalSideExit';
import { IoIosArrowDown } from 'react-icons/io';
import useMultiWallet from "hooks/useMultiWallet";
import { ClipLoader } from "react-spinners";
import { WalletTypes } from "@celo-tools/use-contractkit";
import { WordSplitter } from "utils";

export const WalletDropdown = ({ selected, onChange }: { selected: string, onChange: (walletName: string, walletAddress: string) => void }) => {
    const [isOpen, setOpen] = useState(false)
    const divRef = useModalSideExit<boolean>(isOpen, setOpen,false)
    const { data } = useMultiWallet()
    const [checked, setChecked] = useState<{
        name: WalletTypes;
        address: string;
    }>()

    useEffect(() => {
        if (data) {
            setChecked(data?.find(s => s.address.toLowerCase() === selected.toLowerCase()))
        }
    }, [data])

    if (!data) return <div> <ClipLoader /></div>
    return <div className="relative">
        <div onClick={() => setOpen(!isOpen)} className="font-normal px-2 sm:px-5 py-2 rounded-xl cursor-pointer bg-greylish bg-opacity-10 flex space-x-1 items-center justify-center ">
            <span>{WordSplitter(checked?.name || "")}</span>
            <div>
                <IoIosArrowDown className='transition' style={isOpen ? { transform: "rotate(180deg)" } : undefined} />
            </div>
        </div>
        {isOpen && <div ref={divRef} className="absolute min-w-[150%] rounded-xl sm:-right-0 -bottom-1 translate-y-full shadow-xl z-50">
            <ul>
                {data && data.map((w) => {
                    return <li key={w.address} onClick={() => { onChange(w.name, w.address); setChecked(w) }} className="navbarli text-left flex flex-col space-y-1 border-b-2 transition  px-5 py-4 bg-white dark:bg-darkSecond cursor-pointer first:rounded-t-xl last:rounded-b-xl">
                        <div className="flex space-x-2">
                            <input type="radio" className="w-4 h-4 accent-[#ff501a] cursor-pointer peer" name="paymentType" checked={(!(!checked) && w.address.toLowerCase() === checked.address.toLowerCase())} onChange={(e) => { setChecked(w) }} value="wallet" />
                            <label className="font-semibold text-sm peer-checked:text-primary cursor-pointer">
                                {WordSplitter(w?.name || "")}
                            </label>
                        </div>
                        <label className="font-semibold text-[0.75rem] text-greylish peer-checked:text-primary cursor-pointer">
                            {w.address}
                        </label>
                    </li>
                })}
            </ul>
        </div>
        }
    </div>
}