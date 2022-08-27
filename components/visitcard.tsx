import { AddressReducer } from "../utils";
import { useRef, useState } from "react";
import Copied from "./copied";


const Visitcard = ({ name, address }: { name?: string, address: string }) => {

    const [tooltip, setTooltip] = useState(false);
    const [divRef, setDivRef] = useState<HTMLDivElement | null>(null)


    return <>
        <div ref={setDivRef} className="px-4 min-w-[14rem] min-h-[40px] cursor-pointer py-2 grid grid-cols-[80%,20%] gap-x-1 bg-[#F9F9F9]  dark:bg-[#252525] rounded-md relative items-center"  onClick={() => {
                navigator.clipboard.writeText(address.trim())
                setTooltip(true)
                setTimeout(() => {
                    setTooltip(false)
                }, 300)
            }}>
            <div className="flex ">
                <h3 className="px-3 font-medium" >{AddressReducer(address)}</h3>
            </div>
            <div className=" rounded-full w-8 h-8 flex items-center justify-center">
                <img src={'/icons/metamaskicon.png'} alt="copy" className="w-8 h-8" />
            </div>
        </div>
        <Copied tooltip={tooltip} triggerRef={divRef} />
    </>
}

export default Visitcard;