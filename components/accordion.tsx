import { motion } from "framer-motion";
import { Fragment, useState,useRef } from "react";
import { IoIosArrowDown } from "react-icons/io";
import { TransactionDirection, TransactionStatus } from "../types";
import dateFormat from 'dateformat';
import { ERC20MethodIds, IBatchRequest, IFormattedTransaction } from "hooks/useTransactionProcess";
import { TransactionDirectionDeclare } from "utils";
import TransactionItem from "../subpages/dashboard/transactions/transactionItem";
import _ from "lodash";

const variants = {
    close: {
        height: 0
    },
    open: {
        height: "auto"
    }
}

const Accordion = ({ children, date, dataCount, status, direction, grid = "grid-cols-[37%,25%,38%]", method,color }: { method?: string, children: JSX.Element, date?: string, dataCount: number, status: TransactionStatus, direction?: TransactionDirection, grid?: string,color?:string }) => {

    const [isOpen, setOpen] = useState(false)
    const click = () => {
        setOpen(!isOpen)
    }

 
    return <div>
        <div className={`flex space-x-1 items-center ${color}  rounded-xl px-3 my-3 cursor-pointer`} onClick={click}>
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
                            {/* {TransactionDirection.Swap === direction ? "Swapped" : ""}
                            {TransactionDirection.In === direction ? "Received" : ""}
                            {TransactionDirection.Borrow === direction ? "Borrowed" : ""}
                            {TransactionDirection.Withdraw === direction ? "Withdrawn" : ""}
                            {TransactionDirection.Repay === direction ? "Repaid" : ""}
                            {TransactionDirection.Deposit === direction ? "Deposited" : ""}
                            {TransactionDirection.AutomationOut === direction ? "Executed (A)" : ""}
                            {TransactionDirection.AutomationIn === direction ? "Received (A)" : ""}
                            {TransactionDirection.Out === direction ? "Executed" : ""} on  */}
                            {dateFormat(new Date(parseInt(date) * 1e3), "mediumDate") + `, 14:50` }</>}
                </div>

                <div className="flex ">
                <div className={` pr-2 grid grid-cols-[10%,90%] ${grid !== "grid-cols-[37%,33%,30%]" ? "justify-start" : "justify-end"} gap-x-2 items-center`}>
                    {status === TransactionStatus.Completed && <div className="bg-green-400 w-2 h-2 rounded-full"></div>}
                    {status === TransactionStatus.Pending && <div className="bg-primary w-2 h-2 rounded-full"></div>}
                    {status === TransactionStatus.Rejected && <div className="bg-red-600 w-2 h-2 rounded-full"></div>}
                    <div>{status === "Completed" && "Approved" }</div>
                </div>
                <div className=" grid grid-cols-[20%,60%,20%] h-4  text-greylish w-full">
                        <div className="">| {status === TransactionStatus.Completed ? "3"  : status === TransactionStatus.Pending && "2"} / 3</div>
                        <div className="relative rounded-xl bg-greylish bg-opacity-10 w-full h-full">
                            {status === TransactionStatus.Pending  ? <div className="absolute rounded-xl h-full bg-primary w-[66%]"></div>: status === TransactionStatus.Completed && <div className="absolute rounded-xl h-full bg-green-600 w-full"></div>}
                        </div>
                    </div>
                </div>
            </div>
        </div>
        <motion.div className="overflow-hidden" variants={variants} initial={"close"} animate={isOpen ? "open" : "close"}>
            {children}
        </motion.div>
    </div>
}

export default Accordion;


export const ProcessAccordion = (transaction: IFormattedTransaction, accounts: string[], grid: string, color: string) => {
    const isBatch = transaction.id === ERC20MethodIds.batchRequest
    const TXs: IFormattedTransaction[] = [];
    if (isBatch) {
        const groupBatch = _((transaction as IBatchRequest).payments).groupBy("to").value()
        Object.entries(groupBatch).forEach(([key, value]) => {
            let tx: IBatchRequest = {
                method: transaction.method,
                id: transaction.id,
                hash: transaction.hash,
                rawData: transaction.rawData,
                payments: value
            }
            TXs.push(tx)
        })
    } else {
        TXs.push(transaction)
    }
    const transactionCount = transaction.id === ERC20MethodIds.batchRequest ? TXs.length : 1
    let directionType = TransactionDirectionDeclare(transaction, accounts);

    return <Fragment key={transaction.rawData.hash}>
        <Accordion grid={grid} color={color} direction={directionType} date={transaction.rawData.timeStamp} dataCount={transactionCount} status={TransactionStatus.Completed}>
            <div>
                {TXs.map((s, i) => <TransactionItem key={`${transaction.hash}${i}`} transaction={s} date={transaction.rawData.timeStamp}   status={TransactionStatus.Completed} isMultiple={s.id === ERC20MethodIds.batchRequest} />)}
            </div>
        </Accordion>
    </Fragment>
}
