import React, { useEffect } from "react";
import {useAppSelector } from '../../redux/hooks';
import {selectDarkMode} from 'redux/reducers/notificationSlice';
import ReactDOM, { createPortal } from 'react-dom';


const Modal = ({ children, onDisable, title, className, disableX = false }: { children?: JSX.Element | JSX.Element[], onDisable: React.Dispatch<React.SetStateAction<boolean>>, title?: string, className?: string, disableX?: boolean }) => {
    const dark = useAppSelector(selectDarkMode)
    useEffect(() => {
        document.querySelector('body')!.style.overflowY = "hidden"
        return () => {
            document.querySelector('body')!.style.overflowY = ""
        }
    }, [])
    return ReactDOM.createPortal(    <>
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
                <img src="/icons/cross_greylish.png" alt=""/>
                </button>}
            </div>
        </div>
    </>,document.body)
}

export default Modal;

function body(arg0: JSX.Element, body: any) {
    throw new Error("Function not implemented.");
}
function domNode(arg0: JSX.Element, domNode: any) {
    throw new Error("Function not implemented.");
}

