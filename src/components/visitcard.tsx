import { AddressReducer } from "../utils";
import { useRef, useState } from "react";
import Copied from "./copied";


const Visitcard = ({ name, address }: { name: string, address: string }) => {

    const [tooltip, setTooltip] = useState(false);
    const [divRef, setDivRef] = useState<HTMLDivElement | null>(null)


    return <>
        <div ref={setDivRef} className="px-4 min-w-[7.815rem] py-2 grid grid-cols-[80%,20%] gap-x-1 bg-white shadow dark:bg-darkSecond rounded-xl relative items-center">
            <div className="flex flex-col">
                <h3 className="text-lg">{name}</h3>
                <p className="text-xs" >{AddressReducer(address)}</p>
            </div>
            <div className="bg-primary p-2 rounded-full w-8 h-8 cursor-pointer flex items-center justify-center" onClick={() => {
                navigator.clipboard.writeText(address.trim())
                setTooltip(true)
                setTimeout(() => {
                    setTooltip(false)
                }, 300)
            }}>
                <img src={'/icons/copy.svg'} alt="copy" className="w-3 h-3" />
            </div>
        </div>
        <Copied tooltip={tooltip} triggerRef={divRef} />
    </>
}

export default Visitcard;