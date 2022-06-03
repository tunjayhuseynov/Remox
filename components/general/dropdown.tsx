import { IoIosArrowDown } from 'react-icons/io'
import { Dispatch, forwardRef, useEffect, useRef, useState, createRef, useMemo } from 'react'
import { DropDownItem } from '../../types/dropdown'
import { MouseEventHandler } from 'react'
import { CoinsURL } from '../../types/coins'
import useModalSideExit from '../../hooks/useModalSideExit'
import { motion } from "framer-motion";
import Loader from 'components/Loader'

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


const Li = forwardRef<HTMLLIElement, { children: Array<any> | any, onClick: MouseEventHandler, className: string, style?: React.CSSProperties | undefined }>(({ children, onClick, className, style }, ref) => <li ref={ref} style={style} onClick={onClick} className={`${className} text-left border dark:border-darkSecond last:rounded-b-xl first:rounded-t-xl px-3 py-2 bg-white dark:bg-darkSecond dark:hover:bg-dark dark:text-white hover:bg-gray-200 cursor-pointer`}>{children}</li>)


const Viewer = ({ displayName, name, address, coinUrl, className, disableAddressDisplay }: { displayName?: string, name: string, address?: string, coinUrl?: CoinsURL, className?: string, disableAddressDisplay?: boolean }) => <div className="flex flex-col">
    <div className="flex flex-col gap-3">
        {displayName && <div className="items-center text-sm text-greylish opacity-80">
            {displayName}
        </div>}
        <div className="text-left flex space-x-2 items-center">
            {coinUrl && <div><img src={coinUrl} className={coinUrl ? `w-[1.25rem] h-[1.25rem]` : ''} alt="" /></div>}
            <div className={`${className ?? ''} font-normal truncate`} title={name}>{name}</div>
        </div>
    </div>
    {!disableAddressDisplay && <div className={`text-left text-[0.625rem] text-gray-500`}>{!address?.startsWith('0x') ? address : address.split('').reduce((a, c, i, arr) => {
        return i < 10 || (arr.length - i) < 4 ? a + c : a.split('.').length - 1 < 6 ? a + '.' : a
    }, '')}</div>}
</div>

const Dropdown = ({ selected, list, toTop = false, photo = false, nameActivation = false, onSelect, className, loader = false, disableAddressDisplay = false, parentClass = '', childClass = '', displayName, onChange }: { disableAddressDisplay?: boolean, parentClass?: string, className?: string, toTop?: boolean,photo?:boolean, selected: DropDownItem, list: Array<DropDownItem>, nameActivation?: boolean, onSelect?: Dispatch<DropDownItem>, onChange?: Function, loader?: boolean, childClass?: string, displayName?: string }) => {
    const [isOpen, setOpen] = useState(false) 
    const liArrRef = useRef<(HTMLLIElement | null)[]>([])
    const [liHeights, setLiHeights] = useState<Array<number>>([])
    const [customRef, expectRef] = useModalSideExit<boolean>(isOpen, setOpen, false)

    useEffect(() => {
        if (liArrRef.current.length > 0 && liHeights.length === 0) {
            setLiHeights(liArrRef.current.map(i => i?.offsetHeight ?? 0))
        }
    })

    return (
        <div className={`relative ${parentClass} `}>
            <div ref={expectRef} onClick={() => list?.length > 0 ? setOpen(!isOpen) : null} className={`flex ${className || ''} ${loader ? 'justify-center' : 'justify-between'} items-center border dark:border-darkSecond rounded-xl py-2 px-3 cursor-pointer`}>
                {!loader ? <div className={`truncate flex items-center gap-2`}>
                {photo && <img src={`/icons/${selected.photo ? selected.photo : ""}.png`} className={`rounded-full w-8 h-8 bg-light dark:bg-greylish`} /> }
                    {Viewer({ name: selected.name, address: selected?.address ?? selected?.amount, coinUrl: selected?.coinUrl, className: selected?.className, disableAddressDisplay: disableAddressDisplay, displayName })}
                </div> : <Loader />}
                {list && list.length > 0 && <div className="ml-1">
                    <IoIosArrowDown className='transition' style={isOpen ? { transform: "rotate(180deg)" } : undefined} />
                </div>}
            </div>
            {<motion.div variants={variants} initial={"close"} animate={isOpen ? "open" : "close"} ref={customRef} className={`absolute left-0 ${toTop ? "top-0 -translate-y-full" : "bottom-0 translate-y-full"} z-10 w-full overflow-hidden`}>
                <ul id="ala" className="flex flex-col overflow-y-auto" style={list.length > 5 ?
                    { height: typeof window !== "undefined" && window.outerWidth > 768 ? `${liHeights.slice(0, 5).reduce((a, c) => a + c, 0)}px` : `${liHeights.slice(0, 3).reduce((a, c) => a + c, 0)}px` }
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
                        return <Li ref={(ref) => { liArrRef.current[i] = ref }} key={w.name + i} className={childClass} onClick={() => {
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