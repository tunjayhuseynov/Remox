import { useModalSideExit } from 'hooks';
import React, { Dispatch, SetStateAction, useState } from 'react'
import { IoIosArrowDown } from 'react-icons/io';


function paydropdown({ paymentname, value, setValue, className,className2, setSelectedType, onChangeType, selectedExecution, usdbase }: { paymentname: string[], value: string, setValue: Dispatch<SetStateAction<string>>, className?: string,className2?: string, setSelectedType?: Dispatch<SetStateAction<boolean>>, selectedExecution?: boolean, usdbase?: boolean, onChangeType?: (value: boolean) => void }) {
    const [isOpen, setOpen] = useState(false)
    const [customRef, expectRef] = useModalSideExit<boolean>(isOpen, setOpen, false)

    return <div className="relative w-full">
        <div ref={expectRef} onClick={() => setOpen(!isOpen)} className={` ${className} w-full font-normal  px-2 sm:px-2 ${value ? 'py-3' : 'py-5'} text-base rounded-md bg-white dark:bg-darkSecond cursor-pointer bg-sec border  flex space-x-1  items-center justify-between`}>
            <span className="flex items-center justify-center">{value}</span>
            <div>
                <IoIosArrowDown className='transition w-[0.7em] h-[0.7rem]' style={isOpen ? { transform: "rotate(180deg)" } : undefined} />
            </div>
        </div>
        {isOpen && <div ref={customRef} className={`${className2} absolute flex w-full  rounded-lg  -bottom-1 translate-y-full bg-white dark:bg-darkSecond  z-[9999]`}>
            <ul className="w-full ">
                {paymentname.map((payment, index) => {
                    return <li key={index} onClick={() => {
                        setSelectedType !== undefined && payment === "Pay with USD-based Amounts" ? setSelectedType(false) : setSelectedType !== undefined && payment === "Pay with Token Amounts" ? setSelectedType(true) : null
                        onChangeType !== undefined && payment === "Pay with USD-based Amounts" ? onChangeType(true) : onChangeType !== undefined && payment === "Pay with Token Amounts" ? onChangeType(false) : null
                        setSelectedType !== undefined && payment === "Manual" ? setSelectedType(false) : setSelectedType !== undefined && payment === "Automated" ? setSelectedType(true) : null
                        setValue(payment);
                        setOpen(false)
                    }} className=" sm:h-10  flex flex-col items-center text-center justify-center w-full space-y-1 transition  border rounded-lg cursor-pointer px-3 py-3 ">
                        <div className="flex text-start items-center justify-start w-full">
                            <label className=" text-start  flex items-center justify-start cursor-pointer w-full ">
                                {payment}
                            </label>
                        </div>
                    </li>
                })}
            </ul>
        </div>}

    </div>
}

export default paydropdown