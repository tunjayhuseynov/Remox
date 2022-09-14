import React, { useEffect, useContext, useState } from "react";
import { useAppSelector } from '../../redux/hooks';
import ReactDOM, { createPortal } from 'react-dom';
import { motion, AnimatePresence } from "framer-motion"
import { SelectDarkMode } from 'redux/slices/account/remoxData';

interface IProps {
    children?: JSX.Element | JSX.Element[],
    onDisable: React.Dispatch<React.SetStateAction<boolean>>,
    title?: string,
    className?: string,
    disableX?: boolean,
    openNotify?: boolean,
    animatedModal?: boolean,
}

const Modal = ({ children, onDisable, title, className, disableX = false, animatedModal = true, openNotify }: IProps) => {
    const [mounted, setMounted] = useState(false)

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
                    initial={{ x: "100%" }}
                    animate={{ x: 15 }}
                    exit={{ x: "100%" }}
                    transition={{ type: "tween", duration: .33 }}
                    className="bg-light dark:bg-dark z-[9999] fixed h-full w-full overflow-x-hidden cursor-default top-[73px] pt-10 flex flex-col space-y-16 left-0 ml-[18.45rem] pr-[18.45rem]">

                    <button onClick={() => { onDisable(false); }} className="z-[9999] w-[4rem] tracking-wider font-bold transition-all hover:text-primary hover:transition-all text-xl flex items-center gap-2 px-10">
                        {/* <img src="/icons/cross_greylish.png" alt="" /> */}
                        <span className="text-4xl pb-1">&#171;</span> Back
                    </button>
                    <div>
                        {children}
                    </div>
                </motion.div>}
            </AnimatePresence>, document.querySelector('#main')!)
            :
            ReactDOM.createPortal(<>
                <div className="w-full h-full !my-0 !ml-0 bg-white dark:bg-dark dark:bg-opacity-60  bg-opacity-60 absolute left-0 top-0 z-[98]" onClick={() => onDisable(false)} style={{
                    top: `${window.scrollY}px`,
                }}>
                </div>
                <div className={`z-[9999] absolute ${className} px-5  overflow-auto max-h-[95vh] max-w-[90vw] pt-14 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white dark:bg-dark w-[90%] sm:w-[60%] lg:w-auto lg:min-w-[33%] shadow-custom rounded-xl `} style={{ top: `${window.scrollY + (window.innerHeight / 2)}px` }}>
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
            </>, document.body) : null}
    </>

}

export default Modal;
