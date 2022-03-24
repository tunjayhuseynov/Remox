import dateFormat from "dateformat";
import { Fragment, useEffect, useMemo, useState } from "react";
import { ClipLoader } from "react-spinners";
import Accordion from "../../../components/accordion";
import { TransactionDirection, TransactionStatus, AltCoins, Coins, CoinsName } from "../../../types";
import { ERC20MethodIds, IBatchRequest, IFormattedTransaction } from "hooks/useTransactionProcess";
import TransactionItem from "../../../components/transactionItem";
import { useAppSelector } from "../../../redux/hooks";
import { selectStorage } from "../../../redux/reducers/storage";
import { CSVLink } from "react-csv";
import _ from "lodash";
import { SelectSelectedAccount } from "../../../redux/reducers/selectedAccount";
import useMultisig from "../../../hooks/useMultisig";
import { selectMultisig, selectMultisigTransactions } from "../../../redux/reducers/multisig";
import { Link, NavLink, useLocation } from "react-router-dom";
import useTransactionProcess from "../../../hooks/useTransactionProcess";
import { HiDownload } from 'react-icons/hi'
import { selectTags } from "redux/reducers/tags";
import { WalletDropdown } from "../../../components/general/walletdropdown"
import { fromWei } from "utils/ray";
import AnimatedTabBar from "components/animatedTabBar";


const Transactions = () => {
    const storage = useAppSelector(selectStorage);
    const selectedAccount = useAppSelector(SelectSelectedAccount)
    const multisigData = useAppSelector(selectMultisigTransactions)
    const multisigSelector = useAppSelector(selectMultisig)
    const { refetch, isMultisig } = useMultisig()
    const { pathname } = useLocation()
    const tags = useAppSelector(selectTags)

    let page: string;
    if (pathname.includes("/pending")) {
        page = "pending"
    } else if (pathname.includes("/rejected")) {
        page = "rejected"
    } else page = "completed"

    const [list, transactions] = useTransactionProcess(true)

    const [transactionVisual, setVisual] = useState<JSX.Element | JSX.Element[]>()

    useEffect(() => {
        if (isMultisig) {
            const interval = setInterval(() => {
                refetch(true, 0, (multisigData?.length || 20))
            }, 60000)
            return () => clearInterval(interval)
        }
    }, [selectedAccount, multisigData])

    useEffect(() => {
        if (list) {
            setTimeout(() => {
                TransactionGenerator.then((e) => {
                    setVisual(e)
                })
            }, 500)
        }
    }, [list])
    const TransactionGenerator = useMemo(() => new Promise<JSX.Element[]>((resolve, reject) => {
        if (!list) return <></>
        const result = list.map((transaction, index) => ProcessAccordion(transaction, selectedAccount, "grid-cols-[25%,45%,30%] sm:grid-cols-[28%,26.5%,25.5%,10%,10%]"))

        resolve(result)
    }), [transactions, tags])

    const path = '/dashboard/transactions'

    const data = [
        {
            to: `/dashboard/transactions/pending`,
            text: "Pending Transactions"
        },
        {
            to: `/dashboard/transactions`,
            text: "Completed Transactions"
        },
        {
            to: `/dashboard/transactions/rejected`,
            text: "Rejected Transactions"
        }
    ]

    return <>
        <div>
            <div className="flex flex-col space-y-5">
                <div className="flex justify-between">
                    <div className="text-2xl font-bold tracking-wider">Transactions</div>
                </div>
                {isMultisig && <>
                <div className="flex pl-5 pt-2 pb-2 w-full ">
                        <AnimatedTabBar data={data} />
                </div>
                </> }
                <div className="pb-5">
                    <div className="w-full pt-2 pb-3 rounded-xl">
                        <div id="header" className="grid grid-cols-[25%,45%,30%] sm:grid-cols-[30%,25%,15%,15%,15%] border-b border-black pb-3 " >
                            <div className="sm:hidden text-xs font-medium pt-2">Recipient/Sender</div>
                            <div className="hidden sm:block text-xs sm:text-base font-medium pt-2">{page !== "completed" ? "Your Confirmation" : "Recipient/Sender"}</div>
                            <div className="text-xs sm:text-base font-medium pt-2">{page !== "completed" ? "Action" : "Paid Amount"}</div>
                            <div className="font-medium hidden md:block pt-2">{page !== "completed" ? "Signatures" : "Details"}</div>
                            <div>
                                {!isMultisig && <WalletDropdown list={[{name: ""}]}/>}
                            </div>
                            {!isMultisig && <> <div className="place-self-end ">
                                {list && <CSVLink className="font-normal px-2 sm:px-5 py-2 rounded-xl cursor-pointer bg-greylish bg-opacity-10 flex items-center justify-center xl:space-x-5" filename={"remox_transactions.csv"} data={list.map(w => {
                                    let tx = w.rawData
                                    let feeToken = Object.entries(CoinsName).find(s => s[0] === tx.tokenSymbol)?.[1]
                                    return {
                                        'Sent From:': tx.from,
                                        'Amount:': parseFloat(fromWei(tx.value.toString())).toFixed(4) + ` ${feeToken ? Coins[feeToken].name : "Unknown"}`,
                                        'To:': tx.to,
                                        'Date': dateFormat(new Date(parseInt(tx.timeStamp) * 1e3), "mediumDate"),
                                        "Gas": `${fromWei((parseFloat(tx.gasUsed) * parseFloat(tx.gasPrice)).toString())} ${tx.tokenSymbol === "cUSD" ? "cUSD" : "CELO"}`,
                                        "Block Number": tx.blockNumber,
                                        "Transaction Hash": tx.hash,
                                        "Block Hash": tx.blockHash,
                                        "Input": tx.input
                                    }
                                })}>
                                    <div className={'hidden xl:block'}>Export</div>
                                    <HiDownload />
                                </CSVLink>}
                            </div></>}
                        </div>
                        {
                            isMultisig && page !== "completed" && <div>
                                {multisigData ?
                                    multisigData.length > 0 ? <>
                                        {multisigData.filter(w => w.method && !w.executed && (page !== "rejected" ? w.confirmations.length > 0 : w.confirmations.length === 0)).map((w, i) => {

                                            const method = w.method!.split('').reduce((acc, w, i) => {
                                                if (i === 0) return acc + w.toUpperCase()
                                                if (w !== w.toLowerCase() && i > 0) return acc + " " + w
                                                return acc + w;
                                            }, '')

                                            return <Accordion key={(w.id?.toString() ?? Math.random().toString()) + w.data} grid={"grid-cols-[25%,45%,30%] sm:grid-cols-[28%,26.5%,45.5%]"} dataCount={1} method={method} status={w.executed ? TransactionStatus.Completed : w.confirmations.length > 0 ? TransactionStatus.Pending : TransactionStatus.Rejected}>
                                                <div className="pl-5 grid sm:grid-cols-[20%,30%,25%,25%,] lg:grid-cols-[28.5%,26%,25%,20.5%] min-h-[75px] py-6 items-center">
                                                    <div>
                                                        {w.executed ? <div className="text-white bg-green-500 border-2 border-green-500 rounded-xl px-3 py-1 text-center text-xs w-[125px]">Submitted</div> : null}
                                                        {w.executed ? null : w.confirmations.includes(storage!.accountAddress) ? <div className="text-white bg-primary border-2 border-primary rounded-xl px-3 py-1 text-center text-xs max-w-[175px]">You've Confirmed</div> : <div className="border-2 text-center border-primary  px-3 py-1 rounded-xl text-xs max-w-[175px]">You've not confirmed yet</div>}
                                                    </div>
                                                    <div className="flex flex-col space-y-1">
                                                        {/* <div>
                                                    <div className="border-b border-black inline">
                                                        {method}
                                                    </div>
                                                </div> */}
                                                        {w.owner ? <div className="truncate pr-10  text-base">{w.method?.toLowerCase().includes('transfer') ? 'To' : 'Owner'}: {w.owner}</div> : null}
                                                        {w.valueOfTransfer ? <div className="truncate pr-10  text-base">Value: {w.valueOfTransfer} {(Object.values(Coins).find((s: AltCoins) => s.contractAddress.toLowerCase() === w.destination.toLowerCase()) as AltCoins)?.name}</div> : null}
                                                        {w.newOwner ? <div className="truncate pr-10  text-base">New Owner: {w.newOwner}</div> : null}
                                                        {w.requiredCount ? <div className="truncate pr-10  text-base">New Signature Threshold: {+w.requiredCount}</div> : null}
                                                    </div>
                                                    <div className="font-semibold ">
                                                        {w.confirmations.length} <span className="font-medium">out of</span> {w.method?.toLowerCase().includes("transfer") ? multisigSelector?.sign : multisigSelector?.internalSign}
                                                    </div>
                                                    <div className="flex justify-end cursor-pointer items-start md:pr-0 ">
                                                        <Link to={`/dashboard/multisig/${w.id}`}><div className={`text-primary px-6 max-h-[80px] w-full border-2 border-primary rounded-xl py-2 hover:bg-primary hover:text-white`}>View Details</div></Link>
                                                    </div>
                                                </div>
                                            </Accordion>
                                        })}

                                    </> : <div className="flex flex-col justify-center">
                                        <div className="text-center py-3"><ClipLoader /></div>
                                        <div className="text-center text-xs text-gray-500">It can take longer</div>
                                    </div> : <div className="text-center py-3">No Transaction Yet</div>}
                            </div>
                        }
                        {page === "completed" && (list && transactionVisual ? transactionVisual : <div className="text-center py-2"><ClipLoader /></div>)}
                    </div>
                </div>
            </div>

        </div>
    </>
}


export default Transactions;


export const ProcessAccordion = (transaction: IFormattedTransaction, account: string, grid: string) => {
    const direction = transaction.rawData.from.toLowerCase() === account.toLowerCase()
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
    let directionType;
    switch (transaction.id) {
        case ERC20MethodIds.swap:
            directionType = TransactionDirection.Swap
            break;
        case ERC20MethodIds.automatedTransfer:
            directionType = direction ? TransactionDirection.AutomationOut : TransactionDirection.AutomationIn
            break;
        case ERC20MethodIds.batchRequest:
        case ERC20MethodIds.transferFrom:
        case ERC20MethodIds.noInput:
        case ERC20MethodIds.transferWithComment:
        case ERC20MethodIds.transfer:
            directionType = direction ? TransactionDirection.Out : TransactionDirection.In
            break;
        case ERC20MethodIds.moolaBorrow:
            directionType = TransactionDirection.Borrow;
            break;
        case ERC20MethodIds.moolaDeposit:
            directionType = TransactionDirection.Deposit;
            break;
        case ERC20MethodIds.moolaRepay:
            directionType = TransactionDirection.Repay;
            break;
        case ERC20MethodIds.moolaWithdraw:
            directionType = TransactionDirection.Withdraw;
            break;
        default:
            break;
    }

    return <Fragment key={transaction.rawData.hash}>
        <Accordion grid={grid} direction={directionType} date={transaction.rawData.timeStamp} dataCount={transactionCount} status={TransactionStatus.Completed}>
            <div>
                {TXs.map((s, i) => <TransactionItem key={`${transaction.hash}${i}`} transaction={s} isMultiple={s.id === ERC20MethodIds.batchRequest} />)}
            </div>
        </Accordion>
    </Fragment>
}
