import { AddressReducer } from "../utils";
import { useRef, useState } from "react";
import Copied from "./copied";


const Visitcard = ({ name, address }: { name: string, address: string }) => {

    const [tooltip, setTooltip] = useState(false);
    const [divRef, setDivRef] = useState<HTMLDivElement | null>(null)


    return <>
        <div ref={setDivRef} className="grid grid-cols-[80%,1fr] gap-x-1 px-4 min-w-[150px] py-2 bg-gray-50 dark:bg-darkSecond rounded-xl relative ">
            <div className="flex flex-col">
                <h3 className="text-lg">{name}</h3>
                <p className="text-xs" >{AddressReducer(address)}</p>
            </div>
            <div className="bg-primary p-2 w-7 h-7 self-center rounded-full cursor-pointer" onClick={() => {
                navigator.clipboard.writeText(address.trim())
                setTooltip(true)
                setTimeout(() => {
                    setTooltip(false)
                }, 300)
            }}>
                <img src={'/icons/copy.svg'} alt="copy" className="w-[12px] h-[12px]" />
            </div>
        </div>
        <Copied tooltip={tooltip} triggerRef={divRef} />
    </>
}

export default Visitcard;