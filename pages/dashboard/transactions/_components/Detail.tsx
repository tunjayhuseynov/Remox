import { useEffect, Dispatch, Fragment, useState } from 'react'
import { createPortal } from "react-dom"
import { useModalSideExit } from "hooks";
import { AnimatePresence, motion } from "framer-motion";
import { ERC20MethodIds, IAddOwner, IAutomationCancel, IAutomationTransfer, IBatchRequest, IChangeThreshold, IFormattedTransaction, IRemoveOwner, ISwap, ITransfer } from "hooks/useTransactionProcess";
import { AltCoins } from "types";
import { IAccount, IBudget } from "firebaseConfig";
import { ITag } from "pages/api/tags/index.api";
import { CoinDesignGenerator } from './CoinsGenerator';
import dateFormat from "dateformat";
import { AddressReducer } from 'utils';
import { DecimalConverter } from 'utils/api';

interface IProps {
    // date: string;
    // blockchain: BlockchainType,
    transaction: IFormattedTransaction;
    isMultisig: boolean;
    // direction?: TransactionDirection;
    // status: string;
    account?: IAccount,
    tags: ITag[],
    // txPositionInRemoxData: number,
    openDetail: boolean,
    setOpenDetail: Dispatch<boolean>,
    // isApproved: boolean,
    // isPending: boolean,
    isRejected: boolean,
    isExecuted: boolean,
    signers: string[],
    threshold: number,
    timestamp: number,
    gasFee?: {
        amount: number,
        currency?: AltCoins
    },
    action: string,
    budget?: IBudget
}

const Detail = ({
    openDetail, setOpenDetail, transaction, account, tags,
    isRejected, isExecuted, signers, threshold, timestamp, gasFee, isMultisig, action, budget
}: IProps) => {

    const [mounted, setMounted] = useState(false)


    const [divRef, exceptRef] = useModalSideExit(openDetail, setOpenDetail, false)

    useEffect(() => {
        if (openDetail) {
            document.querySelector('body')!.style.overflowY = "hidden"
        } else {
            document.querySelector('body')!.style.overflowY = ""
        }
    }, [openDetail])

    useEffect(() => {
        setMounted(true)

        return () => setMounted(false)
    }, [])

    let transfer = [ERC20MethodIds.transfer, ERC20MethodIds.noInput, ERC20MethodIds.transferFrom, ERC20MethodIds.transferWithComment, ERC20MethodIds.repay, ERC20MethodIds.borrow, ERC20MethodIds.deposit, ERC20MethodIds.withdraw].indexOf(transaction.id ?? "") > -1 ? transaction as ITransfer : null;
    const transferBatch = transaction.id === ERC20MethodIds.batchRequest ? transaction as unknown as IBatchRequest : null;
    const automation = transaction.id === ERC20MethodIds.automatedTransfer ? transaction as unknown as IAutomationTransfer : null;
    const automationBatch = transaction.id === ERC20MethodIds.automatedBatchRequest ? transaction as unknown as IBatchRequest : null;
    const automationCanceled = transaction.id === ERC20MethodIds.automatedCanceled ? transaction as unknown as IAutomationCancel : null;
    const swap = transaction.id === ERC20MethodIds.swap ? transaction as unknown as ISwap : null;

    const addOwner = transaction.id === ERC20MethodIds.addOwner ? transaction as unknown as IAddOwner : null;
    const removeOwner = transaction.id === ERC20MethodIds.removeOwner ? transaction as unknown as IRemoveOwner : null;
    const changeThreshold = transaction.id === ERC20MethodIds.changeThreshold ? transaction as unknown as IChangeThreshold : null;
    const changeInternalThreshold = transaction.id === ERC20MethodIds.changeInternalThreshold ? transaction as unknown as IChangeThreshold : null;




    return mounted ? createPortal(
        <AnimatePresence>
            {openDetail &&
                <motion.div initial={{ x: "100%", opacity: 0.5 }} animate={{ x: 15, opacity: 1 }} exit={{ x: "100%", opacity: 0.5 }} transition={{ type: "spring", stiffness: 400, damping: 40 }} className="z-[9999] fixed shadow-custom h-[100vh] w-[35%]  overflow-y-auto overflow-x-hidden top-0 right-5 cursor-default ">
                    <div ref={divRef}>
                        <div className="w-full h-full backdrop-blur-[2px]" onClick={() => setOpenDetail(false)}></div>
                        <div className="flex flex-col space-y-10 min-h-[325px] sm:min-h-[auto] px-12 py-12 justify-center sm:justify-between sm:items-stretch items-center bg-white dark:bg-darkSecond ">
                            <button onClick={() => setOpenDetail(false)} className=" absolute left-full w-[2rem] top-0 translate-x-[-170%] translate-y-[25%] opacity-45">
                                <img src="/icons/cross_greylish.png" alt="" />
                            </button>
                            <div className='flex flex-col space-y-3'>
                                <div className="flex flex-col sm:flex-row justify-center sm:items-center text-xl font-semibold pt-2">Transaction Details</div>
                                <div className='flex flex-col'>
                                    <div className="flex flex-col sm:flex-row justify-center sm:items-center text-xl font-semibold pt-4">
                                        {swap && <div>Swap</div>}
                                        {transfer && <div>-${DecimalConverter(+transfer.amount * transfer.coin.priceUSD, transfer.coin.decimals)}</div>}
                                        {transferBatch && <div>-${transferBatch.payments.reduce((a, c) => a + (+c.amount * c.coin.priceUSD), 0)}</div>}
                                        {automation && <div>-${+automation.amount * automation.coin.priceUSD}</div>}
                                        {automationBatch && <div>-${automationBatch.payments.reduce((a, c) => a + (+c.amount * c.coin.priceUSD), 0)}</div>}
                                        {automationCanceled && <div>-${+automationCanceled.payments.reduce((a, c) => a + (+c.amount * c.coin.priceUSD), 0)}</div>}
                                        {addOwner && <div>Add Owner</div>}
                                        {removeOwner && <div>Remove Owner</div>}
                                        {changeThreshold && <div>Change Threshold</div>}
                                        {changeInternalThreshold && <div>Change Internal Threshold</div>}
                                    </div>
                                    <div className="pt-3 flex flex-col gap-7 items-center">
                                        {transfer && (
                                            CoinDesignGenerator({ transfer })
                                        )}
                                        {
                                            transferBatch && (
                                                <div className="flex space-x-5">
                                                    {transferBatch.payments.map((transfer) => <Fragment>{CoinDesignGenerator({ transfer })}</Fragment>)}
                                                </div>
                                            )
                                        }
                                        {
                                            automationBatch && (
                                                <div className="flex space-x-5">
                                                    {automationBatch.payments.map((transfer) => <Fragment>{CoinDesignGenerator({ transfer })}</Fragment>)}
                                                </div>
                                            )
                                        }
                                        {
                                            automationCanceled && (
                                                <div className="flex space-x-5">
                                                    {automationCanceled.payments.map((transfer) => <Fragment>{CoinDesignGenerator({ transfer })}</Fragment>)}
                                                </div>
                                            )
                                        }
                                        {automation && (
                                            CoinDesignGenerator({ transfer: automation })
                                        )}
                                        {swap && (
                                            <div className="flex flex-col space-y-5">
                                                {CoinDesignGenerator({ transfer: { amount: swap.amountIn, coin: swap.coinIn } })}
                                                <img src="/icons/swap.png" className="w-5 h-5" />
                                                {CoinDesignGenerator({ transfer: { amount: swap.amountOutMin, coin: swap.coinOutMin } })}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                            <div className="flex justify-between items-center w-full">
                                <div className="text-greylish">Status</div>
                                <div className="flex space-x-1 items-center font-semibold">
                                    <div className={`w-2 h-2 ${isExecuted ? "bg-green-500" : isRejected ? "bg-red-600" : "bg-primary"} rounded-full`} />
                                    <div>{isExecuted ? "Approved" : isRejected ? "Rejected" : "Pending"}</div>
                                </div>
                            </div>
                            {/* <div className="flex justify-start items-center w-full"><div className="text-sm text-greylish">Created by Orkhan Aslanov</div></div> */}
                            <div className="flex justify-between items-center w-full">
                                <div className="text-greylish">Signatures</div>
                                <div className="flex items-center space-x-2">
                                    <div className="text-gray-300 flex">
                                        {isExecuted ? threshold : signers.length} <span className="font-thin">/</span> {threshold}
                                    </div>
                                    <div className="h-4 w-28 rounded-lg bg-gray-300 relative" >
                                        <div className={`absolute left-0 top-0 h-4 ${isExecuted ? "bg-green-500" : signers.length === 0 ? "bg-red-600" : "bg-primary"} rounded-lg`} style={{
                                            width: isExecuted ? "100%" : Math.min(((signers.length / threshold) * 100), 100).toFixed(2) + "%"
                                        }} />
                                    </div>
                                </div>
                            </div>
                            <div className="flex justify-between  w-full"><div className="text-greylish">Signers</div>
                                <div>
                                    <div className="flex flex-col items-center justify-center gap-2">
                                        {signers.map(s => <span className='text-sm'>{s}</span>)}{signers.length === 0 && <span className="text-gray-300 text-sm">No signers</span>}
                                    </div>
                                </div>
                            </div>
                            <div className="flex justify-between items-center w-full">
                                <div className="text-greylish">Created</div>
                                <div>{dateFormat(new Date(timestamp * 1e3), "mmm dd")}</div>
                            </div>
                            {/* <div className="flex justify-between items-center w-full"><div className="text-greylish">Closed On</div><div>{time}, 14:51:52</div></div> */}
                            <div className="flex justify-between items-center w-full">
                                <div className="text-greylish">Send From</div>
                                <div className="flex gap-1">
                                    {((account?.image?.imageUrl as string) ?? account?.image?.nftUrl) && <div className={`hidden sm:flex items-center justify-center`}>
                                        <div className={`bg-greylish bg-opacity-10 w-8 h-8 flex items-center justify-center rounded-full font-medium `}>
                                            <img src={(account?.image?.imageUrl as string) ?? account?.image?.nftUrl} alt="" className="w-full h-full rounded-full border-greylish" />
                                        </div>
                                    </div>}
                                    <div className={`sm:flex flex-col justify-center items-start `}>
                                        {!isMultisig && <div className="text-lg dark:text-white">
                                            {swap && <div>Swap</div>}
                                            {transfer && <div>{transfer.to.toLowerCase() === account?.address ? transfer.to : (account?.name ?? account?.address)}</div>}
                                            {!transfer && <div>{account?.name ?? account?.address}</div>}
                                        </div>}
                                    </div>
                                </div>
                            </div>
                            <div className="flex justify-between w-full">
                                <div className="text-greylish">Send To</div>
                                <div>
                                    <div className={`flex gap-x-1 items-center text-sm font-medium`}>
                                        {swap && <div>Swap</div>}
                                        {transfer && <div>{transfer.to.toLowerCase() === account?.address ? (account?.name ?? account?.address) : transfer.to}</div>}
                                        {transferBatch && <div>-${transferBatch.payments.reduce((a, c) => a + (+c.amount * c.coin.priceUSD), 0)}</div>}
                                        {automation && <div>-${+automation.amount * automation.coin.priceUSD}</div>}
                                        {automationBatch && <div>-${automationBatch.payments.reduce((a, c) => a + (+c.amount * c.coin.priceUSD), 0)}</div>}
                                        {automationCanceled && <div>-${+automationCanceled.payments.reduce((a, c) => a + (+c.amount * c.coin.priceUSD), 0)}</div>}
                                        {addOwner && <div>Add Owner</div>}
                                        {removeOwner && <div>Remove Owner</div>}
                                        {changeThreshold && <div>Change Threshold</div>}
                                        {changeInternalThreshold && <div>Change Internal Threshold</div>}
                                    </div>
                                </div>
                            </div>
                            <div className="flex justify-between items-center w-full"><div className="text-greylish">Gas fee</div>
                                {gasFee &&
                                    <div className="flex gap-1 items-center text-sm space-x-2">
                                        {DecimalConverter(gasFee.amount, gasFee.currency?.decimals ?? 18)} {gasFee.currency && (<img src={gasFee.currency.logoURI} className=" w-[1.5rem] h-[1.5rem] rounded-full" alt="" />)} {gasFee.currency?.symbol}
                                    </div>
                                }
                            </div>

                            <div className="flex justify-between items-center w-full">
                                <div className="text-greylish">Type</div>
                                <div>
                                    {action}
                                </div>
                            </div>
                            <div className="flex justify-between items-center w-full">
                                <div className="text-greylish">Tx Hash</div>
                                <div>{AddressReducer(transaction.hash)}</div>
                            </div>
                            <div className="flex justify-between items-center w-full">
                                <div className="text-greylish">Budget</div>
                                <div>{budget ? budget.name : ''}</div>
                            </div>
                            <div className="flex justify-between items-center w-full">
                                <div className="text-greylish">Tags</div>
                                <div className="flex">
                                    {tags.map((tag, index) => {
                                        return <div key={tag.id} className="flex space-x-1 items-center">
                                            <div className="w-[0.7rem] h-[0.7rem] rounded-full" style={{ backgroundColor: tag.color }}></div>
                                            <div className="!mt-0 text-base">{tag.name}</div>
                                        </div>
                                    })}
                                </div>
                            </div>
                            <div className="flex justify-between items-center w-full">
                                <div className="text-greylish">Description</div>
                                <div>Hello paycheck</div>
                            </div>
                            {/* <div className="flex justify-between items-center w-full"><div className="text-primary py-2 px-2 border curosr-pointer border-primary rounded-lg" >Split Transaction</div><div></div></div> */}
                        </div>
                    </div>
                </motion.div>}
        </AnimatePresence>, document.querySelector("body")!)
        : null
}

export default Detail;