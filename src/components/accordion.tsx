import { motion } from "framer-motion";
import { useState } from "react";
import { IoIosArrowDown } from "react-icons/io";
import { TransactionDirection, TransactionStatus } from "../types";
import dateFormat from 'dateformat';

const variants = {
    close: {
        height: 0
    },
    open: {
        height: "auto"
    }
}

const Accordion = ({ children, date, dataCount, status, direction, grid = "grid-cols-[37%,33%,30%]", method }: { method?: string, children: JSX.Element, date?: string, dataCount: number, status: TransactionStatus, direction?: TransactionDirection, grid?: string }) => {

    const [isOpen, setOpen] = useState(false)

    const click = () => {
        setOpen(!isOpen)
    }
    return <div>
        <div className="flex space-x-1 items-center bg-greylish bg-opacity-10 rounded-xl px-3 my-3 cursor-pointer" onClick={click}>
            <div >
                <IoIosArrowDown className='transition' style={isOpen ? { transform: "rotate(180deg)" } : undefined} />
            </div>
            <div className={`py-3 grid  px-2 ${grid} items-center w-full`}>
                <div>
                    {dataCount === 1 ? "1 Payment" : `${dataCount} Payments`}
                </div>
                <div className="text-sm text-greylish">
                    {method}
                    {direction !== undefined && date &&
                        <>
                            {TransactionDirection.Swap === direction ? "Swapped" : ""}
                            {TransactionDirection.In === direction ? "Received" : ""}
                            {TransactionDirection.Borrow === direction ? "Borrowed" : ""}
                            {TransactionDirection.Withdraw === direction ? "Withdrawn" : ""}
                            {TransactionDirection.Repay === direction ? "Repaid" : ""}
                            {TransactionDirection.Deposit === direction ? "Deposited" : ""}
                            {TransactionDirection.AutomationOut === direction ? "Executed (A)" : ""}
                            {TransactionDirection.AutomationIn === direction ? "Received (A)" : ""}
                            {TransactionDirection.Out === direction ? "Executed" : ""} on {dateFormat(new Date(parseInt(date) * 1e3), "mediumDate")}</>}
                </div>
                <div className={`grid grid-cols-[10%,90%] ${grid !== "grid-cols-[37%,33%,30%]" ? "justify-start" : "justify-end"} gap-x-2 items-center`}>
                    {status === TransactionStatus.Completed && <div className="bg-green-400 w-2 h-2 rounded-full"></div>}
                    {status === TransactionStatus.Pending && <div className="bg-primary w-2 h-2 rounded-full"></div>}
                    {status === TransactionStatus.Rejected && <div className="bg-red-600 w-2 h-2 rounded-full"></div>}
                    <div>{status}</div>
                </div>
                <div></div>
            </div>
        </div>
        <motion.div className="overflow-hidden" variants={variants} initial={"close"} animate={isOpen ? "open" : "close"}>
            {children}
        </motion.div>
    </div>
}

export default Accordion;