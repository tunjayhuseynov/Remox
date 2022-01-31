import { AddressReducer } from "../utils";
import { useRef, useState } from "react";
import Copied from "./copied";


const Visitcard = ({ name, address }: { name: string, address: string }) => {

    const [tooltip, setTooltip] = useState(false);
    const [divRef, setDivRef] = useState<HTMLDivElement | null>(null)


    return <>
        <div ref={setDivRef} className="px-5 py-1 flex flex-col bg-gray-50 rounded-xl relative ">
            <h3 className="text-lg">{name}</h3>
            <p className="text-xs" >{AddressReducer(address)}</p>
            <div className="bg-primary p-2 rounded-xl cursor-pointer absolute translate-x-1/2 -translate-y-1/2  right-0 top-1/2" onClick={() => {
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