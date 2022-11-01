import { styled } from '@mui/material/styles';
import ArrowForwardIosSharpIcon from '@mui/icons-material/ArrowForwardIosSharp';
import MuiAccordion, { AccordionProps } from '@mui/material/Accordion';
import MuiAccordionSummary, {
    AccordionSummaryProps,
} from '@mui/material/AccordionSummary';
import MuiAccordionDetails from '@mui/material/AccordionDetails';
import { Dispatch, useState } from 'react';
import "react-multi-date-picker/styles/backgrounds/bg-dark.css"
import { ClickAwayListener } from '@mui/material';
import { AnimatePresence, motion } from 'framer-motion';
import { MdKeyboardArrowDown } from 'react-icons/md';
export interface ITransactionFilter {
    children: JSX.Element | JSX.Element[],
    title: string | JSX.Element,
    isOpen: boolean,
    setOpen: Dispatch<boolean>,
    width?: number,
    childWidth?: number,
}

const Filter = ({ children, isOpen, setOpen, title, width = 5.625, childWidth }: ITransactionFilter) => {


    return <div className="relative">
        <div onClick={() => setOpen(!isOpen)} className="font-semibold text-xs pl-2 pr-1 py-2 border rounded-md bg-white dark:bg-darkSecond grid grid-cols-[80%,1fr] cursor-pointer" style={{
            minWidth: `${width}rem`
        }}>
            <div className="font-semibold text-xs">
                {title}
            </div>
            <div className="self-center">
                <MdKeyboardArrowDown size={18} />
            </div>
        </div>
        <AnimatePresence>
            {isOpen && <ClickAwayListener onClickAway={() => setOpen(false)}>
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: .33 }} className="absolute bg-white dark:bg-darkSecond px-2 py-4 border rounded-md -bottom-2 translate-y-full z-[9999999]" style={{
                    width: childWidth ? `${childWidth}rem` : "auto"
                }}>
                    {children}
                </motion.div>
            </ClickAwayListener>}
        </AnimatePresence>
    </div>
}

export default Filter