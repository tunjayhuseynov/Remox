import useProfile from "API/useProfile";
import { Fragment, useCallback, useEffect, useRef, useState } from "react";
import { IoMdNotificationsOutline } from "react-icons/io";
import { Link } from "react-router-dom";
import { SelectSelectedAccount } from "redux/reducers/selectedAccount";
import { generate } from "shortid";
import { fromWei } from "utils/ray";
import useTransactionProcess, { ERC20MethodIds } from "../../hooks/useTransactionProcess";
import { useAppDispatch, useAppSelector } from "../../redux/hooks";
import { RootState } from "../../redux/store";
import { TransactionDirection, TransactionType } from "../../types";


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
 
    return <>
        <IoMdNotificationsOutline className={openNotify ? "text-primary text-3xl cursor-pointer" : "text-3xl cursor-pointer transition hover:text-primary hover:transition"} onClick={()=>{setNotify(!openNotify)}}/>
        {list && new Date(profile?.seenTime ?? 0) < new Date(parseInt((list && list.length > 0 ? list[0]?.rawData.timeStamp : "0")) * 1e3) && <div className="absolute w-[10px] h-[10px] bg-primary rounded-full -top-1 -right-1">

        </div>}
        {openNotify &&
            <div ref={divRef} className=" z-40 fixed shadow-custom w-[360px] h-[100vh] overflow-y-scroll overflow-x-hidden top-0 right-0 bg-white dark:bg-darkSecond ">
                <div className="flex justify-between py-6 px-5 text-center border-t-2 border-b-2 dark:border-greylish dark:bg-darkSecond">
                <p className="text-greylish opacity-45 text-center text-xl flex items-center">Action Bar</p>
                { <button onClick={() => setNotify(false)} className="text-center">
                    <img src="/icons/navbar/cross.png" className="w-[25px] h-[25px]" alt="" />
                </button>}
                </div>
                <div className="flex flex-col min-h-[325px] sm:min-h-[auto] justify-center sm:justify-between sm:items-stretch items-center">
                    {
                        list && list.slice(0, 5).map((transaction) => {
                            const amountUSD = transaction.id !== ERC20MethodIds.swap ? (currencies[transaction.rawData.tokenSymbol]?.price ?? 0) * parseFloat(parseFloat(fromWei(transaction.rawData.value)).toFixed(4)) : -1
                            const direction = transaction.rawData.input.startsWith("0x38ed1739") ? TransactionDirection.Swap : transaction.rawData.from.trim().toLowerCase() === selectedAccount.trim().toLowerCase() ? TransactionDirection.Out : TransactionDirection.In
                            const type = transaction.id === ERC20MethodIds.swap ? TransactionType.Swap : transaction.id === ERC20MethodIds.batchRequest ? TransactionType.MassPayment : TransactionType.IncomingPayment
                            const surplus = direction === TransactionDirection.In ? '+' : '-'
                            return <Fragment key={transaction.rawData.hash}>
                                <NotificationItem key={generate()} status={Status.OK} title={type} body={  amountUSD !== -1 ? "Orkhan has rejected a " + `${surplus} ${amountUSD.toFixed(2)} $` + " payment about 12 hours ago" : ''} link={`/dashboard/transactions/${transaction.rawData.hash}`} />
                            </Fragment>
                        })
                    }
                    {(!list || !Object.values(list).length) && <div>No notification yet. We'll notify you</div>}
                </div>
            </div>
        }
    </>
}

export default NotificationCointainer;


const NotificationItem = ({ status, title, body, link }: { status: Status, title: TransactionType, body: string, link: string }) => {

    return <div className="grid grid-cols-[10%,70%,20%] min-h-[90px] border-b-2 dark:border-greylish dark:bg-darkSecond items-center px-3 py-2">
        <div>
            {
                status === Status.OK && <div className="w-[15px] h-[15px] rounded-full bg-primary"></div>
            }
        </div>
        <div className="flex flex-col">
            <div className="text-xl pb-1">{title}</div>
            <div className="opacity-50 pr-12">{body}</div>
        </div>
        <Link to={link}>
            <div className={'text-primary flex items-center justify-center'}>
                View
            </div>
        </Link>
    </div>
}