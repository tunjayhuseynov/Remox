import { AddressReducer } from "../utils";
import { useRef, useState } from "react";
import Copied from "./copied";
import { SelectBlockchain } from "redux/slices/account/selector";
import { useAppSelector } from "redux/hooks";


const Visitcard = ({ name, address }: { name?: string, address: string }) => {

    const [tooltip, setTooltip] = useState(false);
    const [divRef, setDivRef] = useState<HTMLDivElement | null>(null)
    const blockchain = useAppSelector(SelectBlockchain)

    return <>
        <div ref={setDivRef} className="px-4 min-w-[10rem] min-h-[40px] cursor-pointer py-2 grid grid-cols-[80%,20%] gap-x-1 bg-[#F9F9F9]  dark:bg-[#252525] hover:shadow-custom rounded-md relative items-center" onClick={() => {
            navigator.clipboard.writeText(address.trim())
            setTooltip(true)
            setTimeout(() => {
                setTooltip(false)
            }, 300)
        }}>
            <div className="flex">
                <h3 className="px-3 font-medium text-sm" >{AddressReducer(address)}</h3>
            </div>
            <div className="flex items-center justify-center">
                <img src={blockchain.logoUrl} alt="copy" className="w-6 aspect-square object-cover rounded-full" />
            </div>
        </div>
        <Copied tooltip={tooltip} triggerRef={divRef} />
    </>
}

export default Visitcard;