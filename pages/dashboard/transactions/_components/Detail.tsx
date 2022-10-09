import { useEffect, Dispatch, Fragment, useState, useMemo } from 'react'
import { createPortal } from "react-dom"
import { useModalSideExit } from "hooks";
import { AnimatePresence, motion } from "framer-motion";
import { ERC20MethodIds, IAddOwner, IAutomationCancel, IAutomationTransfer, IBatchRequest, IChangeThreshold, IFormattedTransaction, IRemoveOwner, ISwap, ITransfer } from "hooks/useTransactionProcess";
import { AltCoins, TransactionDirection } from "types";
import { IAccount, IBudget } from "firebaseConfig";
import { ITag } from "pages/api/tags/index.api";
import { CoinDesignGenerator } from './CoinsGenerator';
import dateFormat from "dateformat";
import { AddressReducer } from 'utils';
import { DecimalConverter } from 'utils/api';
import ClickAwayListener from '@mui/base/ClickAwayListener';
import Dropdown from 'components/general/dropdown';
import { useAppDispatch, useAppSelector } from 'redux/hooks';
import { SelectAllBudgets, SelectFiatPreference, SelectFiatSymbol, SelectHistoricalPrices, SelectNotes, SelectPriceCalculationFn, SelectAlldRecurringTasks } from 'redux/slices/account/selector';
import { Add_Tx_To_Budget_Thunk, Remove_Tx_From_Budget_Thunk } from 'redux/slices/account/thunks/budgetThunks/budget';
import { IBudgetORM, ISubbudgetORM } from 'pages/api/budget/index.api';
import Tooltip from '@mui/material/Tooltip';
import { NG } from 'utils/jsxstyle';
import { FiRepeat } from 'react-icons/fi'
import useLoading from 'hooks/useLoading';
import Loader from 'components/Loader';
import { ToastRun } from 'utils/toast';

interface IProps {
    // date: string;
    // blockchain: BlockchainType,
    transaction: IFormattedTransaction;
    isMultisig: boolean;
    direction: TransactionDirection,
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
    budget?: IBudgetORM,
    txIndex: number,
}

const Detail = ({
    openDetail, setOpenDetail, transaction, account, tags,
    isRejected, isExecuted, signers, threshold, timestamp, gasFee, isMultisig, action, budget, direction, txIndex
}: IProps) => {

    const [mounted, setMounted] = useState(false)
    const [budgetLoading, setBudgetLoading] = useState(false)
    const [selectedBudget, setSelectedBudget] = useState<IBudgetORM | undefined>(budget)
    // const [selectedBudgetLabel, setSelectedBudgetLabel] = useState<ISubbudgetORM | undefined>(budget)
    const notes = useAppSelector(SelectNotes)

    const selectedNote = useMemo(() => {
        return notes.find(s => s.address.toLowerCase() === transaction.address.toLowerCase() && s.hashOrIndex.toLowerCase() === transaction.hash.toLowerCase())
    }, [])

    const calculatePrice = useAppSelector(SelectPriceCalculationFn)

    const fiatPreference = useAppSelector(SelectFiatPreference)
    const symbol = useAppSelector(SelectFiatSymbol)
    const hp = useAppSelector(SelectHistoricalPrices)
    const budgets = useAppSelector(SelectAllBudgets)
    const streamings = useAppSelector(SelectAlldRecurringTasks)

    const dispatch = useAppDispatch()

    const date = new Date(timestamp)
    const dateString = `${date.getFullYear()}/${date.getMonth() + 1}/${date.getDate()}`
    const getHpCoinPrice = (coin: AltCoins) => hp[coin.symbol]?.[fiatPreference].find(h => h.date === dateString)?.price

    useEffect(() => {
        setMounted(true)

        return () => setMounted(false)
    }, [])

    let transfer = [ERC20MethodIds.transfer, ERC20MethodIds.noInput, ERC20MethodIds.transferFrom, ERC20MethodIds.transferWithComment, ERC20MethodIds.repay, ERC20MethodIds.borrow, ERC20MethodIds.deposit, ERC20MethodIds.withdraw].indexOf(transaction.id ?? "") > -1 ? transaction as ITransfer : null;
    const transferBatch = transaction.id === ERC20MethodIds.batchRequest ? transaction as unknown as IBatchRequest : null;
    const automation = transaction.id === ERC20MethodIds.automatedTransfer ? transaction as unknown as IAutomationTransfer : null;
    const automationBatch = transaction.id === ERC20MethodIds.automatedBatchRequest ? transaction as unknown as IBatchRequest : null;
    const automationCanceled = transaction.id === ERC20MethodIds.automatedCanceled ? streamings.find(s => (s as IAutomationTransfer).streamId == (transaction as IAutomationCancel).streamId) as IAutomationTransfer : null;
    const swap = transaction.id === ERC20MethodIds.swap ? transaction as unknown as ISwap : null;

    const addOwner = transaction.id === ERC20MethodIds.addOwner ? transaction as unknown as IAddOwner : null;
    const removeOwner = transaction.id === ERC20MethodIds.removeOwner ? transaction as unknown as IRemoveOwner : null;
    const changeThreshold = transaction.id === ERC20MethodIds.changeThreshold ? transaction as unknown as IChangeThreshold : null;
    const changeInternalThreshold = transaction.id === ERC20MethodIds.changeInternalThreshold ? transaction as unknown as IChangeThreshold : null;

    const amount = transfer ?
        +transfer.amount :
        automation ?
            +automation.amount :
            automationBatch ?
                +automationBatch.payments.reduce((acc, curr) => acc + +curr.amount, 0) :
                automationCanceled ? +automationCanceled.amount : transferBatch?.payments.reduce((acc, curr) => acc + +curr.amount, 0) ?? 0;

    const budgetChangeFn = (val: IBudgetORM) => async () => {
        // if (!account?.provider) return ToastRun(<>Cannot get the multisig provider</>, "error")
        setBudgetLoading(true)
        if (budget) {
            await dispatch(Remove_Tx_From_Budget_Thunk({
                budget: budget,
                isExecuted: isExecuted,
                txIndex: txIndex,
                tx: {
                    amount: amount,
                    contractAddress: transaction.address,
                    contractType: isMultisig ? "multi" : "single",
                    hashOrIndex: transaction.hash,
                    timestamp: timestamp,
                    protocol: account?.provider ?? null,
                    token: transfer?.coin.symbol ?? automation?.coin.symbol ?? automationBatch?.payments[0].coin.symbol ?? automationCanceled?.coin.symbol ?? transferBatch?.payments[0].coin.symbol ?? "",
                    isSendingOut: isMultisig ? true : direction === TransactionDirection.In ? false : true
                }
            })).unwrap()
        }

        await dispatch(Add_Tx_To_Budget_Thunk({
            budget: val,
            txIndex: txIndex,
            tx: {
                amount: amount,
                contractAddress: transaction.address,
                contractType: isMultisig ? "multi" : "single",
                hashOrIndex: transaction.hash,
                timestamp: timestamp,
                protocol: account?.provider ?? null,
                token: transfer?.coin.symbol ?? automation?.coin.symbol ?? automationBatch?.payments[0].coin.symbol ?? automationCanceled?.coin.symbol ?? transferBatch?.payments[0].coin.symbol ?? "",
                isSendingOut: isMultisig ? true : direction === TransactionDirection.In ? false : true
            },
            isExecuted: isExecuted,
        })).unwrap()
        setBudgetLoading(false)
    }

    const handleClickAway = () => {
        setOpenDetail(false);
    };

    const RemoveBudget = async () => {
        if (!selectedBudget) return ToastRun(<>Cannot get the budget</>, "error")
        await dispatch(Remove_Tx_From_Budget_Thunk({
            budget: selectedBudget,
            txIndex: txIndex,
            isExecuted: isExecuted,
            tx: {
                amount: amount,
                contractAddress: transaction.address,
                contractType: isMultisig ? "multi" : "single",
                hashOrIndex: transaction.hash,
                timestamp: timestamp,
                protocol: account?.provider ?? null,
                token: transfer?.coin.symbol ?? automation?.coin.symbol ?? automationBatch?.payments[0].coin.symbol ?? automationCanceled?.coin.symbol ?? transferBatch?.payments[0].coin.symbol ?? "",
                isSendingOut: isMultisig ? true : direction === TransactionDirection.In ? false : true
            }
        })).unwrap()
        setSelectedBudget(undefined)
    }

    const [isRemovingBudget, removeBudget] = useLoading(RemoveBudget)

    return mounted ? createPortal(
        <AnimatePresence>
            {openDetail &&
                <motion.div initial={{ x: "100%", opacity: 0.5 }} animate={{ x: 15, opacity: 1 }} exit={{ x: "100%", opacity: 0.5 }} transition={{ type: "spring", stiffness: 400, damping: 40 }} className="fixed shadow-custom h-[100vh] w-[35%] scrollbar-thin overflow-y-auto overflow-x-hidden top-0 right-0 cursor-default ">
                    <ClickAwayListener onClickAway={handleClickAway} mouseEvent={'onMouseUp'}>
                        <div>
                            <div className="w-full h-full backdrop-blur-[2px]" onClick={() => setOpenDetail(false)}></div>
                            <div className="flex flex-col space-y-10 min-h-[325px] sm:min-h-[auto] px-12 py-12 justify-center sm:justify-between sm:items-stretch items-center bg-white dark:bg-darkSecond">
                                <button onClick={() => setOpenDetail(false)} className=" absolute left-full w-[2rem] top-0 translate-x-[-170%] translate-y-[25%] opacity-45">
                                    <img src="/icons/cross_greylish.png" alt="" />
                                </button>
                                <div className='flex flex-col space-y-3'>
                                    <div className="flex flex-col sm:flex-row justify-center sm:items-center text-xl font-semibold pt-2">Transaction Details</div>
                                    <div className='flex flex-col'>
                                        <div className="flex flex-col sm:flex-row justify-center sm:items-center text-2xl font-semibold pt-4">
                                            {swap && <div>Swap</div>}
                                            {transfer && <div>
                                                {direction === TransactionDirection.In ? "+" : "-"}
                                                {symbol}<NG fontSize={1.5} number={DecimalConverter(+transfer.amount, transfer.coin.decimals) * (getHpCoinPrice(transfer.coin) ?? calculatePrice({ ...transfer.coin, coin: transfer.coin, amount: DecimalConverter(+transfer.amount, transfer.coin.decimals) }))} />
                                            </div>}
                                            {transferBatch && <div>-{symbol}<NG fontSize={1.5} number={transferBatch.payments.reduce((a, c) => a + (DecimalConverter(c.amount, c.coin.decimals) * (getHpCoinPrice(c.coin) ?? calculatePrice({ ...c.coin, coin: c.coin, amount: DecimalConverter(c.amount, c.coin.decimals) }))), 0)} /></div>}
                                            {automation && <div>-{symbol}<NG fontSize={1.5} number={DecimalConverter(automation.amount, automation.coin.decimals) * (getHpCoinPrice(automation.coin) ?? calculatePrice({ ...automation.coin, coin: automation.coin, amount: DecimalConverter(automation.amount, automation.coin.decimals) }))} /></div>}
                                            {automationBatch && <div>-{symbol}<NG fontSize={1.5} number={automationBatch.payments.reduce((a, c) => a + (DecimalConverter(c.amount, c.coin.decimals) * (getHpCoinPrice(c.coin) ?? calculatePrice({ ...c.coin, coin: c.coin, amount: DecimalConverter(c.amount, c.coin.decimals) }))), 0)} /></div>}
                                            {automationCanceled && <div>-{symbol}<NG fontSize={1.5} number={DecimalConverter(automationCanceled.amount, automationCanceled.coin.decimals) * (getHpCoinPrice(automationCanceled.coin) ?? calculatePrice({ ...automationCanceled.coin, coin: automationCanceled.coin, amount: DecimalConverter(automationCanceled.amount, automationCanceled.coin.decimals) }))} /></div>}
                                            {addOwner && <div>Add Owner</div>}
                                            {removeOwner && <div>Remove Owner</div>}
                                            {changeThreshold && <div>Change Threshold</div>}
                                            {changeInternalThreshold && <div>Change Internal Threshold</div>}
                                        </div>
                                        <div className="pt-3 flex flex-col gap-7 items-center">
                                            {transfer && (
                                                <CoinDesignGenerator transfer={transfer} timestamp={timestamp} />
                                            )}
                                            {
                                                transferBatch && (
                                                    <div className="flex space-x-5">
                                                        {transferBatch.payments.map((transfer, index) => <CoinDesignGenerator key={index} transfer={transfer} timestamp={timestamp} />)}
                                                    </div>
                                                )
                                            }
                                            {
                                                automationBatch && (
                                                    <div className="flex space-x-5">
                                                        {automationBatch.payments.map((transfer, index) => <CoinDesignGenerator key={index} transfer={transfer} timestamp={timestamp} />)}
                                                    </div>
                                                )
                                            }
                                            {
                                                automationCanceled && (
                                                    <CoinDesignGenerator transfer={automationCanceled} timestamp={timestamp} />
                                                )
                                            }
                                            {automation && (
                                                <CoinDesignGenerator transfer={automation} timestamp={timestamp} />
                                            )}
                                            {swap && (
                                                <div className="flex space-x-5 items-center">
                                                    <CoinDesignGenerator transfer={{ amount: swap.amountIn, coin: swap.coinIn }} timestamp={timestamp} />
                                                    <FiRepeat />
                                                    <CoinDesignGenerator transfer={{ amount: swap.amountOutMin, coin: swap.coinOutMin }} timestamp={timestamp} />
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                                <div className="flex justify-between items-center w-full">
                                    <div className="text-greylish text-sm">Status</div>
                                    <div className="flex space-x-1 items-center font-semibold">
                                        <div className={`w-2 h-2 ${isExecuted ? "bg-green-500" : isRejected ? "bg-red-600" : "bg-primary"} rounded-full`} />
                                        <div>{isExecuted ? "Approved" : isRejected ? "Rejected" : "Pending"}</div>
                                    </div>
                                </div>
                                {/* <div className="flex justify-start items-center w-full"><div className="text-sm text-greylish">Created by Orkhan Aslanov</div></div> */}
                                <div className="flex justify-between items-center w-full">
                                    <div className="text-greylish text-sm">Signatures</div>
                                    <div className="flex items-center space-x-2">
                                        <div className="text-gray-300 flex text-sm">
                                            {isExecuted ? threshold : signers.length} <span className="font-thin">/</span> {threshold}
                                        </div>
                                        <div className="h-4 w-28 rounded-lg bg-gray-300 relative" >
                                            <div className={`absolute left-0 top-0 h-4 ${isExecuted ? "bg-green-500" : signers.length === 0 ? "bg-red-600" : "bg-primary"} rounded-lg`} style={{
                                                width: isExecuted ? "100%" : Math.min(((signers.length / threshold) * 100), 100).toFixed(2) + "%"
                                            }} />
                                        </div>
                                    </div>
                                </div>
                                <div className="flex justify-between  w-full">
                                    <div className="text-greylish text-sm">Signers</div>
                                    <div>
                                        <div className="flex flex-col items-center justify-center gap-2">
                                            {signers.map(s => <span key={s} className='text-sm'>{AddressReducer(s)}</span>)}
                                            {signers.length === 0 && <span className="text-gray-300 text-sm">No signers</span>}
                                        </div>
                                    </div>
                                </div>
                                <div className="flex justify-between items-center w-full text-sm">
                                    <div className="text-greylish">Created</div>
                                    <div>{dateFormat(new Date(timestamp * 1e3), "mmm dd")}</div>
                                </div>
                                {/* <div className="flex justify-between items-center w-full"><div className="text-greylish">Closed On</div><div>{time}, 14:51:52</div></div> */}
                                <div className="flex justify-between items-center w-full text-sm">
                                    <div className="text-greylish">{swap ? "Swap from" : "Send from"}</div>
                                    <div className="flex gap-1">
                                        {(((account?.image?.imageUrl as string) ?? account?.image?.nftUrl) && !swap) && <div className={`hidden sm:flex items-center justify-center`}>
                                            <div className={`bg-greylish bg-opacity-10 w-8 h-8 flex items-center justify-center rounded-full font-medium `}>
                                                <img src={(account?.image?.imageUrl as string) ?? account?.image?.nftUrl} alt="" className="w-full h-full rounded-full border-greylish" />
                                            </div>
                                        </div>}
                                        <div className={`sm:flex flex-col justify-center items-start`}>
                                            {!isMultisig && <div className="text-lg dark:text-white">
                                                {swap &&
                                                    <div className="flex space-x-2">
                                                        <img src={swap.coinIn.logoURI} className="w-5 h-5 rounded-full" />
                                                        <span>{swap.coinIn.symbol}</span>
                                                    </div>
                                                }
                                                {transfer &&
                                                    <div className="text-sm">
                                                        {transfer.to.toLowerCase() === account?.address.toLowerCase() ? AddressReducer(transfer.rawData.from) : (account?.name || AddressReducer(account?.address || transaction.address))}
                                                    </div>
                                                }
                                                {!transfer && !swap && <div>{account?.name || AddressReducer(account?.address || transaction.address)}</div>}
                                            </div>}
                                        </div>
                                    </div>
                                </div>
                                <div className="flex justify-between w-full">
                                    <div className="text-greylish text-sm">Send To</div>
                                    <div>
                                        <div className={`flex gap-x-1 items-center text-sm font-medium`}>
                                            {swap &&
                                                <div className="flex space-x-2">
                                                    <img src={swap.coinOutMin.logoURI} className="w-5 h-5 rounded-full" />
                                                    <span>{swap.coinOutMin.symbol}</span>
                                                </div>
                                            }
                                            {transfer && <div>{transfer.to.toLowerCase() === account?.address ? (account?.name ?? AddressReducer(account?.address)) : AddressReducer(transfer.to)}</div>}
                                            {transferBatch && <div className='flex flex-col'>{transferBatch.payments.map((s, index) => <div key={index}>{AddressReducer(s.to)}</div>)}</div>}
                                            {automation && <div>{AddressReducer(automation.to)}</div>}
                                            {automationBatch && <div className='flex flex-col'>{automationBatch.payments.map((s, index) => <div key={index}>{AddressReducer(s.to)}</div>)}</div>}
                                            {automationCanceled && <div>{AddressReducer(automationCanceled.to)}</div>}
                                            {addOwner && <div>Add Owner</div>}
                                            {removeOwner && <div>Remove Owner</div>}
                                            {changeThreshold && <div>Change Threshold</div>}
                                            {changeInternalThreshold && <div>Change Internal Threshold</div>}
                                        </div>
                                    </div>
                                </div>
                                <div className="flex justify-between items-center w-full text-sm">
                                    <div className="text-greylish">Gas fee</div>
                                    {gasFee &&
                                        <div className="flex gap-1 items-center text-sm space-x-2">
                                            {DecimalConverter(gasFee.amount, gasFee.currency?.decimals ?? 18).toFixed(4)} {gasFee.currency && (<img src={gasFee.currency.logoURI} className=" w-[1.5rem] h-[1.5rem] rounded-full" alt="" />)} {gasFee.currency?.symbol}
                                        </div>
                                    }
                                </div>

                                <div className="flex justify-between items-center w-ful text-sm">
                                    <div className="text-greylish">Type</div>
                                    <div>
                                        {action}
                                    </div>
                                </div>
                                <div className="flex justify-between items-center w-full text-sm">
                                    <div className="text-greylish">Tx Hash</div>
                                    <div className="cursor-pointer" onClick={async () => {
                                        if (transaction.hash) {
                                            await navigator.clipboard.writeText(transaction.hash)
                                            ToastRun("Copied to clipboard", "success")
                                        }
                                    }}>{AddressReducer(transaction.hash)}</div>
                                </div>
                                {!swap && <div className="flex justify-between items-center w-full relative z-[9999959559] text-sm">
                                    <div className="text-greylish">Budget</div>
                                    <div className='w-[10rem]'>
                                        {budgets.length > 0 && !selectedBudget && <Dropdown
                                            runFn={budgetChangeFn}
                                            sx={{
                                                height: '2.5rem',
                                            }}
                                            loading={budgetLoading}
                                            selected={selectedBudget}
                                            setSelect={setSelectedBudget}
                                            list={budgets}
                                        />}
                                        {selectedBudget && !isRemovingBudget && <div className="justify-end flex space-x-2">
                                            <div>
                                                {selectedBudget.name}
                                            </div>
                                            <div className="hover:text-red-500 cursor-pointer" onClick={removeBudget}>
                                                X
                                            </div>
                                        </div>}
                                        {isRemovingBudget && <div className="text-right">
                                            <Loader />
                                        </div>}
                                        {budgets.length === 0 && !selectedBudget && <div className="text-sm text-right">No created budget</div>}
                                    </div>
                                </div>}
                                {/* {selectedBudget && <div className="flex justify-between items-center w-full relative z-[9999959559]">
                                    <div className="text-greylish">Budget Label</div>
                                    <div className='w-[15rem]'>
                                        <Dropdown
                                            runFn={budgetChangeFn}
                                            loading={budgetLoading}
                                            selected={selectedBudget}
                                            setSelect={setSelectedBudget}
                                            list={budgets}
                                        />
                                    </div>
                                </div>} */}
                                {tags.length > 0 && <div className="flex justify-between items-center w-full">
                                    <div className="text-greylish">Tags</div>
                                    <div className="flex">
                                        {tags.map((tag, index) => {
                                            return <div key={tag.id} className="flex space-x-1 items-center">
                                                <div className="w-[0.7rem] h-[0.7rem] rounded-full" style={{ backgroundColor: tag.color }}></div>
                                                <div className="!mt-0 text-base">{tag.name}</div>
                                            </div>
                                        })}
                                    </div>
                                </div>}
                                {selectedNote && selectedNote.attachLink && <div className="flex justify-between items-center w-full">
                                    <div className="text-greylish">Attach Link</div>
                                    <Tooltip title={selectedNote.attachLink!}>
                                        <div className='underline text-blue-500 cursor-pointer' onClick={() => window.open(selectedNote.attachLink!, "_blank")}>Go To The Link</div>
                                    </Tooltip>
                                </div>}
                                {selectedNote && selectedNote.notes && <div className="flex justify-between items-center w-full">
                                    <div className="text-greylish">Description</div>
                                    <div>{selectedNote.notes}</div>
                                </div>}
                                {/* <div className="flex justify-between items-center w-full"><div className="text-primary py-2 px-2 border curosr-pointer border-primary rounded-lg" >Split Transaction</div><div></div></div> */}
                            </div>
                        </div>
                    </ClickAwayListener>
                </motion.div>}
        </AnimatePresence>, document.querySelector("body")!)
        : null
}

export default Detail;