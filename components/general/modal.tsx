import React, { useEffect, useRef, useState } from "react";
import ReactDOM, { createPortal } from 'react-dom';
import { motion, AnimatePresence } from "framer-motion"
import ClickAwayListener from '@mui/base/ClickAwayListener';

interface IProps {
    children?: JSX.Element | JSX.Element[],
    onDisable: React.Dispatch<boolean>,
    title?: string,
    className?: string,
    disableX?: boolean,
    openNotify?: boolean,
    animatedModal?: boolean,
}

const Modal = ({ children, onDisable, title, className, disableX = false, animatedModal = true, openNotify }: IProps) => {
    const [mounted, setMounted] = useState(false)
    const ref = useRef<HTMLDivElement>(null)

    useEffect(() => {
        setMounted(true)

        return () => setMounted(false)
    }, [])


    useEffect(() => {
        if (openNotify) {
            document.querySelector('body')!.style.overflowY = "hidden"
        } else {
            document.querySelector('body')!.style.overflowY = ""
        }
    }, [openNotify])

    useEffect(() => {
        if (!animatedModal) {
            document.querySelector('body')!.style.overflowY = "hidden"
            return () => {
                document.querySelector('body')!.style.overflowY = ""
            }
        }
    }, [animatedModal])


    return <>
        {mounted ? animatedModal ? ReactDOM.createPortal(
            <AnimatePresence>{
                openNotify &&
                <motion.div
                    ref={ref}
                    initial={{ x: "-100%" }}
                    animate={{ x: 0 }}
                    exit={{ x: "-100%" }}
                    transition={{ type: "tween", duration: .33 }}
                    className="bg-light dark:bg-dark absolute h-full w-full overflow-x-hidden cursor-default top-[73px] z-[9999999] pt-10 flex flex-col  left-0 ">

                    {!disableX && <button onClick={() => { onDisable(false); }} className="z-[9999] pl-[4.25rem] w-[4rem] tracking-wider font-bold transition-all hover:transition-all text-xl flex items-center gap-2">
                        <span className="text-4xl pb-1 ">&#171;</span> Back
                    </button>}
                    <div className="overflow-x-hidden hover:scrollbar-thumb-gray-200 dark:hover:scrollbar-thumb-greylish scrollbar-thin h-full pb-10">
                        {children}
                    </div>
                </motion.div>}
            </AnimatePresence>, document.querySelector("#main") ?? document.body)
            :
            ReactDOM.createPortal(<>
                <ClickAwayListener onClickAway={() => onDisable(false)}>
                    <>
                        <div className="w-full h-full !my-0 !ml-0 bg-white dark:bg-dark dark:bg-opacity-60  bg-opacity-60 absolute left-0 top-0 z-[98]" onClick={() => onDisable(false)} style={{
                            top: `${window.scrollY}px`,
                        }}>
                        </div>
                        <div className={`z-[9999] absolute ${className} px-5  overflow-auto max-h-[95vh] max-w-[90vw] pt-14 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white dark:bg-dark w-[90%] sm:w-[60%] lg:w-auto shadow-custom rounded-xl `} style={{ top: `${window.scrollY + (window.innerHeight / 2)}px` }}>
                            <div className="relative pb-10" >
                                {children}
                                {!(!title) && <div className="absolute right-full top-2 font-bold translate-x-[105%] w-1/2">
                                    {title}
                                </div>}
                                {!disableX && <button onClick={() => onDisable(false)} className=" absolute left-full w-[2rem] top-0 translate-x-[-130%] translate-y-[15%] opacity-45">
                                    <img src="/icons/cross_greylish.png" alt="" />
                                </button>}
                            </div>
                        </div>
                    </>
                </ClickAwayListener>
            </>, document.body) : null}
    </>

}

export default Modal;
