import { ERC20MethodIds, IAutomationTransfer, IBatchRequest, IFormattedTransaction, InputReader, ISwap, ITransfer, ITransferComment } from "hooks/useTransactionProcess";
import { useEffect, useRef, useState } from "react";
import { useSelector } from "react-redux";
import { SelectSelectedAccount } from "redux/slices/account/selectedAccount";
import { SelectBalances, SelectTotalBalance } from 'redux/slices/currencies';
import { AddressReducer } from "../../../utils";
import Button from "components/button";
import useGelato from "rpcHooks/useGelato";
import { selectTags } from "redux/slices/tags";
import { BN } from "utils/ray";
import { useModalSideExit, useWalletKit } from "hooks";
import Link from "next/link";
import { useRouter } from "next/router";
import { TransactionDirection, TransactionStatus } from "../../../types";
import { selectDarkMode } from "redux/slices/notificationSlice";
import Paydropdown from '../../pay/paydropdown';
import Details from "subpages/dashboard/transactions/details";
import dateFormat from 'dateformat';
import Dropdown from 'components/general/dropdown';
import { DropDownItem } from 'types';

const TransactionItem = ({ transaction, isMultiple, direction, status, date }: { date: string, transaction: IFormattedTransaction, isMultiple?: boolean, direction?: TransactionDirection, status: string }) => {

    const [detect, setDetect] = useState(true);
    const [details, setDetails] = useState(false)
    const [value, setValue] = useState('Marketing')

    const divRef = useRef<HTMLDivElement>(null)
    const typeRef = useRef<HTMLDivElement>(null)
    const type2Ref = useRef<HTMLDivElement>(null)
    const tagcolorRef = useRef<HTMLDivElement>(null)
    const tagnameRef = useRef<HTMLDivElement>(null)
    const selectedAccount = useSelector(SelectSelectedAccount)
    const { getDetails } = useGelato()
    const tags = useSelector(selectTags);
    const [Transaction, setTransaction] = useState(transaction);
    const [IsMultiple, setIsMultiple] = useState(isMultiple);
    const { GetCoins, fromMinScale } = useWalletKit()
    const router = useRouter()
    const darkMode = useSelector(selectDarkMode)

    const paymentname: DropDownItem[] = [{ name: "Development" }, { name: "Security" }]
    const [selectedPayment, setSelectedPayment] = useState(paymentname[0])


    const isSwap = Transaction.id === ERC20MethodIds.swap;
    const isComment = Transaction.id === ERC20MethodIds.transferWithComment;
    const isAutomation = Transaction.id === ERC20MethodIds.automatedTransfer;
    const isTransfer = [
        ERC20MethodIds.transfer, ERC20MethodIds.transferFrom,
        ERC20MethodIds.moolaBorrow, ERC20MethodIds.moolaDeposit,
        ERC20MethodIds.moolaWithdraw, ERC20MethodIds.moolaRepay
    ].indexOf(Transaction.id) > -1;
    let peer = Transaction.rawData.from.toLowerCase() === selectedAccount.toLowerCase() ? Transaction.rawData.to : Transaction.rawData.from;
    let SwapData;
    let TransferData;
    let MultipleData;
    let Comment;

    if (isComment) {
        Comment = (Transaction as ITransferComment).comment
    }
    if (isTransfer && !IsMultiple) {
        TransferData = Transaction as ITransfer
    }
    if (isSwap && !IsMultiple) {
        SwapData = Transaction as ISwap
    }

    if (IsMultiple) {
        MultipleData = Transaction as IBatchRequest
        peer = MultipleData.payments[0].to
    }

    useEffect(() => {
        if (divRef.current && window.innerWidth / divRef.current.clientWidth > 2) {
            setDetect(false)
        }
        if (isAutomation) {
            (
                async () => {
                    const data = Transaction as IAutomationTransfer
                    const details = await getDetails(data.taskId)
                    const reader = InputReader(details[1], Transaction.rawData, tags, GetCoins)

                    if (reader && reader.id === ERC20MethodIds.moolaRepay) console.log(reader)
                    const formattedTx = {
                        rawData: data.rawData,
                        hash: data.hash,
                        ...reader
                    } as IFormattedTransaction
                    if (reader && reader.id === ERC20MethodIds.batchRequest) setIsMultiple(true)
                    setTransaction(formattedTx)
                }
            )()
        }
    }, [transaction])




    return <>
        <div ref={divRef} className={`grid ${detect ? 'grid-cols-[25%,45%,30%] sm:grid-cols-[20%,15%,12%,18%,25%,10%] items-center' : 'grid-cols-[27%,48%,25%]'} min-h-[4.688rem] py-2 `}>
            <div className="flex space-x-3 items-center overflow-hidden">
                <div className={`hidden sm:flex ${detect ? "items-center" : "items-start"} ${!isSwap && !IsMultiple && ''} justify-center`}>
                    <div className={`bg-greylish bg-opacity-10 ${detect ? "w-[2.813rem] h-[2.813rem] text-lg" : "w-[1.563rem] h-[1.563rem] text-xs"} flex items-center justify-center rounded-full font-bold `}>
                        {!isSwap ? <span> {isComment ? (Comment as string).slice(0, 2) : "Un"} </span> : <span>S</span>}
                    </div>
                </div>
                <div className={`sm:flex flex-col ${detect ? "justify-center" : "justify-start"} items-start `}>
                    <div className="text-greylish text-base font-semibold dark:text-white">
                        {!isSwap ? <span> {isComment ? `${Comment}` : "Treasury Vault "} </span> : <span> Swap </span>}
                    </div>
                    {/* {peer && !isSwap && <div className="text-sm text-greylish dark:text-white">
                        {AddressReducer(peer)}
                    </div>} */}
                </div>
            </div>
            {detect &&
                //   <Paydropdown className2={''} className={''} paymentname={paymentname}  value={value} setValue={setValue} />
                <Dropdown parentClass={' w-[65%]  bg-light !z-[9999]'} childClass={'rounded-lg  bg-light'} list={paymentname} selected={selectedPayment} onSelect={(e) => {
                    setSelectedPayment(e)
                }} />

            }
            <div className="flex items-center  gap-1"><img src={`/icons/${type2Ref.current?.innerText.toLowerCase()}.png`} className="rounded-full w-[2.5rem] h-[2.5rem]" />
                {detect && <div className="">
                    <div className="flex flex-col  text-xl"> {direction !== undefined &&
                        <span ref={typeRef} >
                            {TransactionDirection.Swap === direction ? "Swap" : ""}
                            {TransactionDirection.In === direction ? "Receive" : ""}
                            {TransactionDirection.Borrow === direction ? "Borrow" : ""}
                            {TransactionDirection.Withdraw === direction ? "Withdrawn" : ""}
                            {TransactionDirection.Repay === direction ? "Repaid" : ""}
                            {TransactionDirection.Deposit === direction ? "Deposit" : ""}
                            {TransactionDirection.AutomationOut === direction ? "Execute (A)" : ""}
                            {TransactionDirection.AutomationIn === direction ? "Receive (A)" : ""}
                            {TransactionDirection.Out === direction ? "Send" : ""}
                        </span>}
                        <span className="flex gap-2 items-center text-greylish text-sm"> <div ref={type2Ref}> {direction !== undefined &&
                            <>
                                {TransactionDirection.Swap === direction ? "Ubeswap" : ""}
                                {TransactionDirection.In === direction ? "Remox" : ""}
                                {TransactionDirection.Borrow === direction ? "Moola" : ""}
                                {TransactionDirection.Withdraw === direction ? "Withdrawn" : ""}
                                {TransactionDirection.Repay === direction ? "Repaid" : ""}
                                {TransactionDirection.Deposit === direction ? "Deposit" : ""}
                                {TransactionDirection.AutomationOut === direction ? "Execute (A)" : ""}
                                {TransactionDirection.AutomationIn === direction ? "Receive (A)" : ""}
                                {TransactionDirection.Out === direction ? "Remox" : ""}

                            </>}
                        </div>
                        </span>
                    </div>
                </div>}
            </div>

            <div className="text-base">
                <div>
                    {!isSwap && TransferData && !IsMultiple && <div className={`flex ${detect ? "grid-cols-[20%,80%]" : "grid-cols-[45%,55%]"}   space-x-4`}>
                        <div className={`flex flex-col ${detect ? "grid-cols-[15%,85%]" : "grid-cols-[25%,75%]"} gap-x-2  text-xl font-medium`}>
                            <span>
                                {BN(fromMinScale(TransferData.amount)).toFixed(2)}
                            </span>
                            <span className="text-greylish dark:text-white text-sm">
                                $342
                            </span>
                        </div>
                        <div className={`flex ${detect ? "grid-cols-[10%,90%]" : "grid-cols-[30%,70%]"} gap-x-2  text-xl font-medium`}>
                            {TransferData.coin ?
                                <>
                                    <div>
                                        <img src={TransferData.coin.coinUrl} className="rounded-full w-[1.8rem] h-[1.8rem]" />
                                    </div>
                                    <div>
                                        {TransferData.coin.name ?? "Unknown Coin"}
                                    </div>
                                </>
                                : <div>Unknown Coin</div>
                            }

                        </div>
                    </div>}
                    {!isSwap && MultipleData && MultipleData.payments.map((payment, index) => {

                        return <div key={index} className={`flex ${detect ? "grid-cols-[20%,80%]" : "grid-cols-[45%,55%]"} items-center mx-7 space-x-4`}>
                            <div className={`flex ${detect ? "grid-cols-[15%,85%]" : "grid-cols-[25%,75%]"} gap-x-2 items-center`}>
                                <div className="w-[0.625rem] h-[0.625rem] rounded-full bg-primary self-center">
                                </div>
                                <span>
                                    {parseFloat(fromMinScale(payment.amount)).toFixed(2)}
                                </span>
                            </div>
                            <div className={`flex ${detect ? "grid-cols-[10%,90%]" : "grid-cols-[30%,70%]"} gap-x-2 items-center`}>
                                {payment.coinAddress ? <>
                                    <div>
                                        <img src={payment.coinAddress.coinUrl} className="rounded-full w-[1.125rem] h-[1.125rem]" />
                                    </div>
                                    <div>
                                        {payment.coinAddress.name}
                                    </div>
                                </> : <div>Unknown Token</div>}
                            </div>
                        </div>
                    })}
                    {isSwap && SwapData && <div className="flex flex-col">
                        <div className={`flex ${detect ? "grid-cols-[20%,80%]" : "grid-cols-[45%,55%]"}  mx-7 space-x-4`}>
                            <div className={`flex ${detect ? "grid-cols-[15%,85%]" : "grid-cols-[25%,75%]"} gap-x-2 `}>
                                <div className="flex flex-col">
                                    <span>
                                        {parseFloat(fromMinScale(SwapData.amountIn)).toFixed(2)}
                                    </span>
                                    <span className="text-greylish text-sm">
                                        $2345
                                    </span>
                                </div>

                            </div>
                            <div className={`flex ${detect ? "grid-cols-[10%,90%]" : "grid-cols-[30%,70%]"} gap-x-2 `}>
                                {SwapData.coinIn ? <>
                                    <div>
                                        <img src={SwapData.coinIn.coinUrl} className="rounded-full w-[1.5rem] h-[1.5rem] " />
                                    </div>
                                    <div>
                                        {SwapData.coinIn.name}
                                    </div>
                                </> :
                                    <div>Unknown Coin</div>
                                }
                            </div>
                        </div>
                        <div className="flex   ml-20 pl-2">
                            <div className="py-1 rounded-lg ">
                                <img src="/icons/swap.png" alt="" className="w-[1.125rem] h-[1.125rem] dark:invert dark:brightness-0" />
                            </div>
                        </div>
                        <div className={`flex ${detect ? "grid-cols-[20%,80%]" : "grid-cols-[45%,55%]"}  mx-7 space-x-4`}>
                            <div className={` `}>
                                <div className="flex flex-col">
                                    <span>
                                        {parseFloat(fromMinScale(SwapData.amountOutMin)).toFixed(2)}
                                    </span>
                                    <span className="text-greylish text-sm">
                                        $2345
                                    </span>
                                </div>
                            </div>
                            <div className={`flex ${detect ? "grid-cols-[10%,90%]" : "grid-cols-[30%,70%]"} gap-x-2 `}>
                                {SwapData.coinOutMin ? <>
                                    <div>
                                        <img src={SwapData.coinOutMin.coinUrl} className="rounded-full w-[1.5rem] h-[1.5rem] " />
                                    </div>
                                    <div>
                                        {SwapData.coinOutMin.name}
                                    </div>

                                </> : <div>Unknown Coin</div>}
                            </div>
                        </div>
                    </div>}
                </div>
            </div>
            {detect &&
                <div className="flex flex-col space-y-1">
                    {Transaction.tags && Transaction.tags.map((tag, index) => {
                        return <div key={tag.id} className="flex space-x-3 items-center">
                            <div className="w-[0.8rem] h-[0.8rem] rounded-full" style={{ backgroundColor: tag.color }}></div>
                            <div className="!ml-1 text-base">{tag.name}</div>
                        </div>
                    })}
                    {<div className="flex items-center gap-2 text-primary font-bold cursor-pointer "> <span className="w-5 h-5 border rounded-full border-primary  text-primary  flex items-center justify-center">+</span> Add Label</div>}
                </div>}
            <div className=" flex justify-end cursor-pointer items-start md:pr-0 gap-5">
                <Button className="shadow-none px-8 py-1 !rounded-md">Sign</Button>

                <Details Transaction={Transaction} TransferData={TransferData} isSwap={isSwap} isComment={isComment} Type={typeRef.current?.innerText} Comment={Comment} status={status} time={dateFormat(new Date(parseInt(date) * 1e3), "mediumDate")} address={AddressReducer(peer)} />
            </div>

        </div>
    </>
}
export default TransactionItem;
//() => router.push(`/dashboard/transactions/details/${Transaction.rawData.hash}`)