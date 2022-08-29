import useProfile from "rpcHooks/useProfile";
import { Fragment, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { IoMdNotificationsOutline } from "react-icons/io";
import { generate } from "shortid";
import { fromWei } from "utils/ray";
import useTransactionProcess, { ERC20MethodIds, IBatchRequest, IFormattedTransaction, ISwap, ITransfer } from "../../../hooks/useTransactionProcess";
import { useAppDispatch, useAppSelector } from "../../../redux/hooks";
import { TransactionDirection, TransactionType } from "../../../types";
import { motion, AnimatePresence } from "framer-motion"
import { TransactionDirectionDeclare, TransactionTypeDeclare } from "utils";
import { LendingType } from "rpcHooks/useLending";
import { useModalSideExit } from "hooks";
import Link from "next/link";
import { SelectAccounts, SelectIndividual, SelectRemoxAccount } from "redux/slices/account/selector";
import { useRouter } from "next/router";


enum Status {
    OK,
    Reject,
    Pending
}

const NotificationCointainer = () => {

    const [list] = useTransactionProcess()
    const { UpdateSeenTime } = useProfile()
    const [openNotify, setNotify] = useState(false)
    const navigate = useRouter()

    const accounts = useAppSelector(SelectAccounts);
    const addresses = useMemo(() => accounts.map(a => a.address.toLowerCase()), [accounts]);
    const individual = useAppSelector(SelectIndividual)
    const seenTime = individual?.seenTime ?? 0

    useEffect(() => {
        if (openNotify) {
            UpdateSeenTime(new Date().getTime())
        }
    }, [openNotify])



    const [divRef, exceptRef] = useModalSideExit(openNotify, setNotify, false)



    const NormalTransaction = (tx: IFormattedTransaction, type: string) => {
        if ([ERC20MethodIds.transfer, ERC20MethodIds.transferFrom, ERC20MethodIds.transferWithComment, ERC20MethodIds.noInput].includes(tx.id)) {
            const transaction = tx as ITransfer;

            return `${accounts.some(s => s.address.toLowerCase() === tx.rawData.to) ? "Received" : "Sent"} ${transaction.coin.name} ${fromWei(transaction.amount)}`
        }
        if (ERC20MethodIds.swap === tx.id) {
            const transaction = tx as ISwap;
            return `Swapped from ${transaction.coinIn.name} ${fromWei(transaction.amountIn)} to ${transaction.coinOutMin.name} ${fromWei(transaction.amountOutMin)}`
        }

        if ([ERC20MethodIds.moolaBorrow, ERC20MethodIds.moolaDeposit, ERC20MethodIds.moolaRepay, ERC20MethodIds.moolaWithdraw].includes(tx.id)) {
            const transaction = tx as ITransfer;
            return `${LendingType(type.toLowerCase())} ${transaction.coin.name} ${fromWei(transaction.amount)}`
        }

        if (ERC20MethodIds.batchRequest === tx.id) {
            const transaction = tx as IBatchRequest;

            return `${accounts.some(s => s.address.toLowerCase() === tx.rawData.to) ? "Received" : "Sent"} ${transaction.payments.length} transactions`
        }

        return ""
    }

    return <>
        <div ref={exceptRef} onClick={() => { setNotify(!openNotify) }}>
            <IoMdNotificationsOutline className={openNotify ? "text-primary text-3xl cursor-pointer" : "text-3xl cursor-pointer transition hover:text-primary hover:transition"} />
        </div>
        {list && new Date(individual?.seenTime ?? 0) < new Date(parseInt((list && list.length > 0 ? list[0]?.rawData.timeStamp : "0")) * 1e3) && <div className="absolute w-[0.625rem] h-[0.625rem] bg-primary rounded-full -top-1 -right-1">

        </div>}
        <AnimatePresence>
            {openNotify && <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} ref={divRef} className='absolute bg-white dark:bg-darkSecond min-h-[10rem]  w-[32rem]  rounded-md sm:-right-0 -bottom-7 translate-y-full shadow-15 z-50'>
                <div className="flex flex-col  w-full h-full">
                    <div className="border-b dark:border-greylish py-5 text-lg font-semibold px-5">Notifications</div>
                    <div className="flex flex-col p-2">
                        {list?.map((item, index) => {
                            const isBatch = item.id === ERC20MethodIds.batchRequest
                            const TXs: IFormattedTransaction[] = [];
                            if (isBatch) {
                                const groupBatch = _((item as IBatchRequest).payments).groupBy("to").value()
                                Object.entries(groupBatch).forEach(([key, value]) => {
                                    let tx: IBatchRequest = {
                                        timestamp: item.timestamp,
                                        method: item.method,
                                        id: item.id,
                                        hash: item.hash,
                                        rawData: item.rawData,
                                        payments: value
                                    }
                                    TXs.push(tx)
                                })
                            } else {
                                TXs.push(item)
                            }
                            const transactionCount = item.id === ERC20MethodIds.batchRequest ? TXs.length : 1
                            let direction = TransactionDirectionDeclare(item, addresses);

                            return <div key={item.id} className="py-2 grid grid-cols-[6%,64%,30%] items-center hover:bg-light dark:hover:bg-dark rounded-md">
                                {item.timestamp > seenTime ? <div className="rounded-full w-3 h-3 bg-primary ml-2"></div> : <span></span>}
                                <div className="flex items-center gap-3">
                                    {/* <img src={item.transaction.img} alt="" className="w-10 h-10 rounded-full" /> */}
                                    <div className="flex flex-col items-start">
                                        <div className="text-lg font-medium">
                                            {TransactionDirection.Swap === direction ? "Swap" : ""}
                                            {TransactionDirection.In === direction ? "Receive" : ""}
                                            {TransactionDirection.Borrow === direction ? "Borrow" : ""}
                                            {TransactionDirection.Withdraw === direction ? "Withdrawn" : ""}
                                            {TransactionDirection.Repay === direction ? "Repaid" : ""}
                                            {TransactionDirection.Deposit === direction ? "Deposit" : ""}
                                            {TransactionDirection.AutomationOut === direction ? "Execute (A)" : ""}
                                            {TransactionDirection.AutomationIn === direction ? "Receive (A)" : ""}
                                            {TransactionDirection.Out === direction ? "Send" : ""}
                                        </div>
                                        <div className="font-medium text-[10px] text-primary cursor-pointer" onClick={() => navigate.push('/dashboard/transactions')}>View Transaction</div>
                                    </div>
                                </div>
                                <div className="text-greylish font-light text-[10px] flex justify-end items-center gap-2 pr-3">Jun 4 at 15:34 <span className="text-greylish text-2xl pb-1">&#8250;</span> </div>
                            </div>
                        })}
                    </div>
                    <div className="border-t dark:border-greylish flex items-center justify-center py-5 text-lg font-semibold cursor-pointer text-primary hover:bg-light dark:hover:bg-dark" onClick={() => navigate.push('/dashboard/transactions')}>View All</div>
                </div>
            </motion.div>
            }
            {/* {openNotify &&
                <motion.div initial={{ x: "100%", opacity: 0.5 }} animate={{ x: 15, opacity: 1 }} exit={{ x: "100%", opacity: 0.5 }} transition={{ type: "spring", stiffness: 400, damping: 40 }} ref={divRef} className=" z-40 fixed shadow-custom w-[360px] xl:w-[380px] h-[100vh] pr-1 xl:pr-2 overflow-y-auto overflow-x-hidden top-0 right-0 bg-white dark:bg-darkSecond ">
                    <div className="flex justify-between py-6 px-5 text-center border-t-2 border-b-2 dark:border-greylish dark:bg-darkSecond">
                        <p className="text-greylish opacity-45 text-center text-xl flex items-center">Action Bar</p>
                        {<button onClick={() => setNotify(false)} className="text-center">
                            <img src="/icons/navbar/cross.png" className="w-[1.563rem] h-[1.563rem]" alt="" />
                        </button>}
                    </div>
                    <div className="flex flex-col min-h-[325px] sm:min-h-[auto] justify-center sm:justify-between sm:items-stretch items-center">
                        {
                            list && list.slice(0, 20).map((transaction) => {
                                const direction = transaction.rawData.input.startsWith("0x38ed1739") ? TransactionDirection.Swap : addresses.includes(transaction.rawData.from.trim().toLowerCase()) ? TransactionDirection.Out : TransactionDirection.In
                                let type = TransactionTypeDeclare(transaction, addresses)
                                const surplus = direction === TransactionDirection.In ? '+' : '-'
                                return <Fragment key={transaction.rawData.hash}>
                                    <NotificationItem key={generate()} status={Status.OK} title={type} body={`${NormalTransaction(transaction, type)}`} link={`/dashboard/transactions/${transaction.rawData.hash}`} />
                                </Fragment>
                            })
                        }
                        {(!list || !Object.values(list).length) && <div>No notification yet. We'll notify you</div>}
                    </div>
                </motion.div>
            } */}
        </AnimatePresence>
    </>
}

export default NotificationCointainer;


const NotificationItem = ({ status, title, body, link }: { status: Status, title: TransactionType, body: string, link: string }) => {

    return <div className="grid grid-cols-[15%,70%,15%] min-h-[5.625rem] border-b-2 dark:border-greylish dark:bg-darkSecond items-center px-3 py-2">
        <div>
            {
                status === Status.OK && <div className="w-[0.625rem] h-[0.625rem] rounded-full bg-primary"></div>
            }
        </div>
        <div className="flex flex-col px-3">
            <div className="text-xl pb-1">{title}</div>
            <div className="opacity-50">{body}</div>
        </div>
        <Link href={link}>
            <div className={'text-primary flex items-center justify-center '}>
                View
            </div>
        </Link>
    </div>
}