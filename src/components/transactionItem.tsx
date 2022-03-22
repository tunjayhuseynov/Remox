import { ERC20MethodIds, IAutomationTransfer, IBatchRequest, IFormattedTransaction, InputReader, ISwap, ITransfer, ITransferComment } from "hooks/useTransactionProcess";
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { SelectSelectedAccount } from "redux/reducers/selectedAccount";
import { AddressReducer } from "../utils";
import Button from "components/button";
import useGelato from "API/useGelato";
import { selectTags } from "redux/reducers/tags";
import { fromWei } from "utils/ray";

const TransactionItem = ({ transaction, isMultiple }: { transaction: IFormattedTransaction, isMultiple?: boolean }) => {

    const [detect, setDetect] = useState(true);
    const divRef = useRef<HTMLDivElement>(null)
    const selectedAccount = useSelector(SelectSelectedAccount)
    const { getDetails } = useGelato()
    const tags = useSelector(selectTags);
    const [Transaction, setTransaction] = useState(transaction);
    const [IsMultiple, setIsMultiple] = useState(isMultiple);

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
                    const reader = InputReader(details[1], Transaction.rawData, tags)
                    const formattedTx = {
                        rawData: data.rawData,
                        hash: data.hash,
                        ...reader
                    } as IFormattedTransaction
                    if(reader && reader.id === ERC20MethodIds.batchRequest) setIsMultiple(true)
                    setTransaction(formattedTx)
                }
            )()
        }
    }, [])

    return <div ref={divRef} className={`grid ${detect ? 'grid-cols-[25%,45%,30%] sm:grid-cols-[36%,32.3%,10.7%,20%] pl-5' : 'grid-cols-[27%,48%,25%]'} min-h-[75px] py-4 `}>
        <div className="flex space-x-3 overflow-hidden">
            <div className={`hidden sm:flex ${detect ? "items-center" : "items-start"} ${!isSwap && !IsMultiple && 'pt-3'} justify-center`}>
                <div className={`bg-greylish bg-opacity-10 ${detect ? "w-[45px] h-[45px] text-lg" : "w-[25px] h-[25px] text-xs"} flex items-center justify-center rounded-full font-bold `}>
                    {!isSwap ? <span> {isComment ? (Comment as string).slice(0, 2) : "Un"} </span> : <span>S</span>}
                </div>
            </div>
            <div className={`sm:flex flex-col ${detect ? "justify-center" : "justify-start"} items-start `}>
                <div className="text-greylish dark:text-white">
                    {!isSwap ? <span> {isComment ? `${Comment}` : "Unknown"} </span> : <span> Swap </span>}
                </div>
                {peer && !isSwap && <div className="text-sm text-greylish dark:text-white">
                    {AddressReducer(peer)}
                </div>}
            </div>
        </div>
        <div className="text-base">
            <div>
                {!isSwap && TransferData && !IsMultiple && <div className={`flex ${detect ? "grid-cols-[20%,80%]" : "grid-cols-[45%,55%]"} items-center mx-7 space-x-4`}>
                    <div className={`flex ${detect ? "grid-cols-[15%,85%]" : "grid-cols-[25%,75%]"} gap-x-2 items-center`}>
                        <div className="w-[10px] h-[10px] rounded-full bg-primary self-center">
                        </div>
                        <span>
                            {parseFloat(fromWei(TransferData.amount)).toFixed(2)}
                        </span>
                    </div>
                    <div className={`flex ${detect ? "grid-cols-[10%,90%]" : "grid-cols-[30%,70%]"} gap-x-2 items-center`}>
                        {TransferData.coin ?
                            <>
                                <div>
                                    <img src={TransferData.coin.coinUrl} className="rounded-full w-[18px] h-[18x]" />
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
                            <div className="w-[10px] h-[10px] rounded-full bg-primary self-center">
                            </div>
                            <span>
                                {parseFloat(fromWei(payment.amount)).toFixed(2)}
                            </span>
                        </div>
                        <div className={`flex ${detect ? "grid-cols-[10%,90%]" : "grid-cols-[30%,70%]"} gap-x-2 items-center`}>
                            {payment.coinAddress ? <>
                                <div>
                                    <img src={payment.coinAddress.coinUrl} className="rounded-full w-[18px] h-[18x]" />
                                </div>
                                <div>
                                    {payment.coinAddress.name}
                                </div>
                            </> : <div>Unknown Token</div>}
                        </div>
                    </div>
                })}
                {isSwap && SwapData && <div className="flex flex-col">
                    <div className={`flex ${detect ? "grid-cols-[20%,80%]" : "grid-cols-[45%,55%]"} items-center mx-7 space-x-4`}>
                        <div className={`flex ${detect ? "grid-cols-[15%,85%]" : "grid-cols-[25%,75%]"} gap-x-2 items-center`}>
                            <div className="w-[10px] h-[10px] rounded-full bg-primary self-center">
                            </div>
                            <span>
                                {parseFloat(fromWei(SwapData.amountIn)).toFixed(2)}
                            </span>
                        </div>
                        <div className={`flex ${detect ? "grid-cols-[10%,90%]" : "grid-cols-[30%,70%]"} gap-x-1 items-center`}>
                            {SwapData.coinIn ? <>
                                <div>
                                    <img src={SwapData.coinIn.coinUrl} className="rounded-full w-[18px] h-[18x]" />
                                </div>
                                <div>
                                    {SwapData.coinIn.name}
                                </div>
                            </> :
                                <div>Unknown Coin</div>
                            }
                        </div>
                    </div>
                    <div className="mx-7">
                        <div className="py-1 rounded-lg -translate-x-[4px]">
                            <img src="/icons/arrowdown.svg" alt="" className="w-[18px] h-[18px] dark:invert dark:brightness-0" />
                        </div>
                    </div>
                    <div className={`flex ${detect ? "grid-cols-[20%,80%]" : "grid-cols-[45%,55%]"} items-center mx-7 space-x-4`}>
                        <div className={`grid ${detect ? "grid-cols-[15%,85%]" : "grid-cols-[25%,75%]"} gap-x-2 items-center`}>
                            <div className="w-[10px] h-[10px] rounded-full bg-primary self-center">
                            </div>
                            <span>
                                {parseFloat(fromWei(SwapData.amountOutMin)).toFixed(2)}
                            </span>
                        </div>
                        <div className={`flex ${detect ? "grid-cols-[10%,90%]" : "grid-cols-[30%,70%]"} gap-x-1 items-center`}>
                            {SwapData.coinOutMin ? <>
                                <div>
                                    <img src={SwapData.coinOutMin.coinUrl} className="rounded-full w-[18px] h-[18x]" />
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
            <div className="flex flex-col space-y-3">
                {Transaction.tags && Transaction.tags.map((tag, index) => {
                    return <div key={tag.id} className="flex space-x-3">
                        <div className="w-[18px] h-[18px] rounded-full" style={{ backgroundColor: tag.color }}></div>
                        <div>{tag.name}</div>
                    </div>
                })}
            </div>}
        <div className="flex justify-end cursor-pointer items-start md:pr-0 ">
            <Link to={`/dashboard/transactions/${Transaction.rawData.hash}`}> <Button version="second" className="px-8 py-2" >View Details</Button></Link>
        </div>
    </div>
}
export default TransactionItem;