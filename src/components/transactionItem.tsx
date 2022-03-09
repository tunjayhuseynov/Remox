import { ERC20MethodIds, IBatchRequest, IFormattedTransaction, ISwap, ITransfer, ITransferComment } from "hooks/useTransactionProcess";
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { SelectSelectedAccount } from "redux/reducers/selectedAccount";
import transactions from "redux/reducers/transactions";
import { Coins } from "types";
import { fromWei } from 'web3-utils'
import { AddressReducer } from "../utils";

const TransactionItem = ({ transaction, isMultiple }: { transaction: IFormattedTransaction, isMultiple?: boolean }) => {

    const [detect, setDetect] = useState(true);
    const divRef = useRef<HTMLDivElement>(null)
    const selectedAccount = useSelector(SelectSelectedAccount)

    useEffect(() => {
        if (divRef.current && window.innerWidth / divRef.current.clientWidth > 2) {
            setDetect(false)
        }
    }, [])


    const isSwap = transaction.id === ERC20MethodIds.swap;
    const isComment = transaction.id === ERC20MethodIds.transferWithComment;
    let peer = transaction.rawData.from.toLowerCase() === selectedAccount.toLowerCase() ? transaction.rawData.to : transaction.rawData.from;
    let swapData;
    let TransferData;
    let MultipleData;
    let Comment;

    if (isComment) {
        Comment = (transaction as ITransferComment).comment
    }
    if (!isSwap && !isMultiple) {
        TransferData = transaction as ITransfer
    }
    if (isSwap && !isMultiple) {
        swapData = transaction as ISwap
    }

    if (isMultiple) {
        MultipleData = transaction as IBatchRequest
        peer = MultipleData.payments[0].to
    }

    return <div ref={divRef} className={`grid ${detect ? 'grid-cols-[25%,45%,30%] sm:grid-cols-[36%,32.3%,10.7%,20%] pl-5' : 'grid-cols-[27%,48%,25%]'} min-h-[75px] py-4 `}>
        <div className="flex space-x-3 overflow-hidden">
            <div className={`hidden sm:flex ${detect ? "items-center" : "items-start"} ${!isSwap && !isMultiple && 'pt-3'} justify-center`}>
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
                {!isSwap && TransferData && <div className={`flex ${detect ? "grid-cols-[20%,80%]" : "grid-cols-[45%,55%]"} items-center mx-7 space-x-4`}>
                    <div className={`flex ${detect ? "grid-cols-[15%,85%]" : "grid-cols-[25%,75%]"} gap-x-2 items-center`}>
                        <div className="w-[10px] h-[10px] rounded-full bg-primary self-center">
                        </div>
                        <span>
                            {parseFloat(fromWei(TransferData.amount, 'ether')).toFixed(2)}
                        </span>
                    </div>
                    <div className={`flex ${detect ? "grid-cols-[10%,90%]" : "grid-cols-[30%,70%]"} gap-x-2 items-center`}>
                        {Coins[TransferData.rawData.tokenSymbol as keyof Coins] ?
                            <>
                                <div>
                                    <img src={Coins[TransferData.rawData.tokenSymbol as keyof Coins]?.coinUrl} className="rounded-full w-[18px] h-[18x]" />
                                </div>
                                <div>
                                    {Coins[TransferData.rawData.tokenSymbol as keyof Coins]?.name ?? "Unknown Coin"}
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
                                {parseFloat(fromWei(payment.amount, 'ether')).toFixed(2)}
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
                {isSwap && swapData && <div className="flex flex-col">
                    <div className={`flex ${detect ? "grid-cols-[20%,80%]" : "grid-cols-[45%,55%]"} items-center mx-7 space-x-4`}>
                        <div className={`flex ${detect ? "grid-cols-[15%,85%]" : "grid-cols-[25%,75%]"} gap-x-2 items-center`}>
                            <div className="w-[10px] h-[10px] rounded-full bg-primary self-center">
                            </div>
                            <span>
                                {parseFloat(fromWei(swapData.amountIn, 'ether'))}
                            </span>
                        </div>
                        <div className={`flex ${detect ? "grid-cols-[10%,90%]" : "grid-cols-[30%,70%]"} gap-x-1 items-center`}>
                            {swapData.coinIn ? <>
                                <div>
                                    <img src={swapData.coinIn.coinUrl} className="rounded-full w-[18px] h-[18x]" />
                                </div>
                                <div>
                                    {swapData.coinIn.name}
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
                                {parseFloat(fromWei(swapData.amountOutMin, 'ether')).toFixed(2)}
                            </span>
                        </div>
                        <div className={`flex ${detect ? "grid-cols-[10%,90%]" : "grid-cols-[30%,70%]"} gap-x-1 items-center`}>
                            {swapData.coinOutMin ? <>
                                <div>
                                    <img src={swapData.coinOutMin.coinUrl} className="rounded-full w-[18px] h-[18x]" />
                                </div>
                                <div>
                                    {swapData.coinOutMin.name}
                                </div>

                            </> : <div>Unknown Coin</div>}
                        </div>
                    </div>
                </div>}
            </div>
        </div>
        {detect &&
            <div className="flex flex-col space-y-3">
                {transaction.tags && transaction.tags.map((tag, index) => {
                    return <div key={tag.id} className="flex space-x-3">
                        <div className="w-[18px] h-[18px] rounded-full" style={{ backgroundColor: tag.color }}></div>
                        <div>{tag.name}</div>
                    </div>
                })}
            </div>}
        <div className="flex justify-end cursor-pointer items-start md:pr-0 ">
            <Link to={`/dashboard/transactions/${transaction.rawData.hash}`}><div className={`text-primary  ${detect ? "px-6 max-h-[80px] border-2 border-primary hover:bg-primary hover:text-white" : "text-sm hover:text-black dark:hover:text-white"} rounded-xl py-2 transition-colors duration-300`}>View Details</div></Link>
        </div>
    </div>
}

export default TransactionItem;