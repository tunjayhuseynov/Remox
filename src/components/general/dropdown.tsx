import { IoIosArrowDown } from 'react-icons/io'
import { Dispatch, forwardRef, useEffect, useRef, useState } from 'react'
import { DropDownItem } from '../../types/dropdown'
import { MouseEventHandler } from 'react'
import { CoinsURL } from '../../types/coins'
import { ClipLoader } from 'react-spinners'
import useModalSideExit from '../../hooks/useModalSideExit'
import { motion } from "framer-motion";

const variants = {
    close: {
        height: 0,
        transition: {
            staggerChildren: 0,
            duration: 0
        }
    }, 
    open: {
        height: "auto",
        transition: {
            staggerChildren: 0.2,
            type: 'tween'
        }
    }
}

const Li = forwardRef<HTMLLIElement, { children: Array<any> | any, onClick: MouseEventHandler, className: string }>(({ children, onClick, className }, ref) => <li ref={ref} onClick={onClick} className={`${className} text-left border dark:border-darkSecond px-3 py-2 bg-white dark:bg-darkSecond dark:hover:bg-dark dark:text-white hover:bg-gray-200 cursor-pointer`}>{children}</li>)

const Viewer = ({ displayName, name, address, coinUrl, className, disableAddressDisplay }: { displayName?: string, name: string, address?: string, coinUrl?: CoinsURL, className?: string, disableAddressDisplay?: boolean }) => <div className="flex flex-col">
    <div className="flex flex-col">
        {displayName && <div className="items-center text-sm text-greylish opacity-80">
            {displayName}
        </div>}
        <div className="text-left flex space-x-2 items-center">
            {coinUrl && <div><img src={coinUrl} className={coinUrl ? `w-[20px] h-[20px]` : ''} alt="" /></div>}
            <div className={`${className ?? ''} font-normal truncate`} title={name}>{name}</div>
        </div>
    </div>
    {!disableAddressDisplay && <div className={`text-left text-[10px] text-gray-500`}>{!address?.startsWith('0x') ? address : address.split('').reduce((a, c, i, arr) => {
        return i < 10 || (arr.length - i) < 4 ? a + c : a.split('.').length - 1 < 6 ? a + '.' : a
    }, '')}</div>}
</div>

const Dropdown = ({ selected, list,toTop=false, nameActivation = false, onSelect, className, loader = false, disableAddressDisplay = false, parentClass = '', childClass = '', displayName, onChange }: { disableAddressDisplay?: boolean, parentClass?: string, className?: string, toTop?: boolean, selected: DropDownItem, list: Array<DropDownItem>, nameActivation?: boolean, onSelect?: Dispatch<DropDownItem>, onChange?: Function, loader?: boolean, childClass?: string, displayName?: string }) => {
    const [isOpen, setOpen] = useState(false)
    const liRef = useRef<HTMLLIElement>()
    const [liHeight, setLiHeight] = useState(0)
    const customRef = useModalSideExit(isOpen, setOpen)

    useEffect(() => {
        if (liRef.current && liHeight === 0) {
            setLiHeight(liRef.current.offsetHeight)
        }
    })

    return (
        <div className={`relative ${parentClass} `}>
            <div onClick={() => list?.length > 0 ? setOpen(!isOpen) : null} className={`flex ${className || ''} ${loader ? 'justify-center' : 'justify-between'} items-center border dark:border-darkSecond rounded-xl ${isOpen && 'rounded-b-none'} py-2 px-3 cursor-pointer`}>
                {!loader ? <div className="truncate">
                    {Viewer({ name: selected.name, address: selected?.address ?? selected?.amount, coinUrl: selected?.coinUrl, className: selected?.className, disableAddressDisplay: disableAddressDisplay, displayName })}
                </div> : <ClipLoader />}
                {list && list.length > 0 && <div>
                    <IoIosArrowDown className='transition' style={isOpen ? { transform: "rotate(180deg)" } : undefined} />
                </div>}
            </div>
            {<motion.div variants={variants} initial={"close"} animate={isOpen ? "open" : "close"} ref={customRef} className={`absolute left-0 ${toTop ? "top-0 -translate-y-full" : "bottom-0 translate-y-full"} translate-y-full z-10 w-full overflow-hidden`}>
                <ul id="ala" className="flex flex-col overflow-y-auto " style={list.length > 5 ?
                    { height: window.outerWidth > 768 ? `${liHeight * 5}px` : `${liHeight * 3}px` }
                    :
                    { height: 'auto' }
                }>
                    {list?.filter((w) => {
                        if (!nameActivation) {
                            return w?.address !== selected?.address
                        } else if (w.name) {
                            return w?.name !== selected?.name
                        } else if (w.id) {
                            return w?.id !== selected?.id
                        }

                    })?.map((w: DropDownItem, i) => {
                        const obj: { ref?: any } = {}
                        if (i === 0) {
                            obj.ref = liRef
                        }
                        return <Li {...obj} key={w.name} className={childClass} onClick={() => {
                            if (w.onClick) {
                                w.onClick()
                                setOpen(false)
                                return
                            }
                            onSelect!(w);
                            setOpen(false);
                            onChange?.(w, selected);
                        }}>
                            {Viewer({ name: w?.name, address: w?.address ?? w?.amount, coinUrl: w?.coinUrl, className: w?.className, disableAddressDisplay })}
                        </Li>
                    }
                    )}
                </ul>
            </motion.div>}
        </div>
    )
}

export default Dropdown;