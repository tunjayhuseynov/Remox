import useProfile from "API/useProfile";
import { Fragment, useCallback, useEffect, useRef, useState } from "react";
import { IoMdNotificationsOutline } from "react-icons/io";
import { Link } from "react-router-dom";
import { SelectSelectedAccount } from "redux/reducers/selectedAccount";
import { generate } from "shortid";
import { fromWei } from "utils/ray";
import useTransactionProcess, { ERC20MethodIds, IBatchRequest, IFormattedTransaction, ISwap, ITransfer } from "../../hooks/useTransactionProcess";
import { useAppDispatch, useAppSelector } from "../../redux/hooks";
import { RootState } from "../../redux/store";
import { TransactionDirection, TransactionType } from "../../types";
import { motion, AnimatePresence } from "framer-motion"
import { TransactionTypeDeclare } from "utils";
import { MoolaType } from "API/useMoola";


enum Status {
    OK,
    Reject,
    Pending
}

const NotificationCointainer = () => {

    const [list] = useTransactionProcess()
    const { profile } = useProfile()
    const [openNotify, setNotify] = useState(false)
    const { UpdateSeenTime } = useProfile()
    const currencies = useAppSelector((state: RootState) => state.currencyandbalance.celoCoins);

    const divRef = useRef<HTMLDivElement>(null)
    const selectedAccount = useAppSelector(SelectSelectedAccount);

    useEffect(() => {
        if (openNotify) {
            UpdateSeenTime(new Date().getTime())
        }
    }, [openNotify])

    const click = useCallback((e) => {
        if (openNotify && divRef.current && !divRef.current.contains(e.target)) {
            setNotify(false)
        }
    }, [openNotify])

    useEffect(() => {
        window.addEventListener('click', click)

        return () => window.removeEventListener('click', click)
    }, [click, divRef])

    const NormalTransaction = (tx: IFormattedTransaction, type: string) => {
        if ([ERC20MethodIds.transfer, ERC20MethodIds.transferFrom, ERC20MethodIds.transferWithComment, ERC20MethodIds.noInput].includes(tx.id)) {
            const transaction = tx as ITransfer;

            return `${tx.rawData.to === selectedAccount ? "Received" : "Sent"} ${transaction.coin.name} ${fromWei(transaction.amount)}`
        }
        if(ERC20MethodIds.swap === tx.id){
            const transaction = tx as ISwap;
            return `Swapped from ${transaction.coinIn.name} ${fromWei(transaction.amountIn)} to ${transaction.coinOutMin.name} ${fromWei(transaction.amountOutMin)}`
        }

        if([ERC20MethodIds.moolaBorrow, ERC20MethodIds.moolaDeposit, ERC20MethodIds.moolaRepay, ERC20MethodIds.moolaWithdraw].includes(tx.id)){
            const transaction = tx as ITransfer;
            return `${MoolaType(type.toLowerCase())} ${transaction.coin.name} ${fromWei(transaction.amount)}`
        }

        if(ERC20MethodIds.batchRequest === tx.id){
            const transaction = tx as IBatchRequest;

            return `${tx.rawData.to === selectedAccount ? "Received" : "Sent"} ${transaction.payments.length} transactions`
        }

        return ""
    }

    return <>
        <IoMdNotificationsOutline className={openNotify ? "text-primary text-3xl cursor-pointer" : "text-3xl cursor-pointer transition hover:text-primary hover:transition"} onClick={() => { setNotify(!openNotify) }} />
        {list && new Date(profile?.seenTime ?? 0) < new Date(parseInt((list && list.length > 0 ? list[0]?.rawData.timeStamp : "0")) * 1e3) && <div className="absolute w-[0.625rem] h-[0.625rem] bg-primary rounded-full -top-1 -right-1">

        </div>}
        <AnimatePresence>
            {openNotify &&
                <motion.div initial={{ x: "100%", opacity: 0.5 }} animate={{ x: 15, opacity: 1 }} exit={{ x: "100%", opacity: 0.5 }} transition={{ type: "spring", stiffness: 400, damping: 30 }} ref={divRef} className=" z-40 fixed shadow-custom w-[360px] h-[100vh] pr-3 overflow-y-auto overflow-x-hidden top-0 right-0 bg-white dark:bg-darkSecond ">
                    <div className="flex justify-between py-6 px-5 text-center border-t-2 border-b-2 dark:border-greylish dark:bg-darkSecond">
                        <p className="text-greylish opacity-45 text-center text-xl flex items-center">Action Bar</p>
                        {<button onClick={() => setNotify(false)} className="text-center">
                            <img src="/icons/navbar/cross.png" className="w-[1.563rem] h-[1.563rem]" alt="" />
                        </button>}
                    </div>
                    <div className="flex flex-col min-h-[325px] sm:min-h-[auto] justify-center sm:justify-between sm:items-stretch items-center">
                        {
                            list && list.slice(0, 20).map((transaction) => {
                                const direction = transaction.rawData.input.startsWith("0x38ed1739") ? TransactionDirection.Swap : transaction.rawData.from.trim().toLowerCase() === selectedAccount.trim().toLowerCase() ? TransactionDirection.Out : TransactionDirection.In
                                let type = TransactionTypeDeclare(transaction, selectedAccount)
                                const surplus = direction === TransactionDirection.In ? '+' : '-'
                                return <Fragment key={transaction.rawData.hash}>
                                    <NotificationItem key={generate()} status={Status.OK} title={type} body={`${NormalTransaction(transaction, type)}`} link={`/dashboard/transactions/${transaction.rawData.hash}`} />
                                </Fragment>
                            })
                        }
                        {(!list || !Object.values(list).length) && <div>No notification yet. We'll notify you</div>}
                    </div>
                </motion.div>
            }
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
        <Link to={link}>
            <div className={'text-primary flex items-center justify-center '}>
                View
            </div>
        </Link>
    </div>
}