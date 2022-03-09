import dateFormat from "dateformat";
import { Fragment, useEffect, useMemo, useState } from "react";
import { ClipLoader } from "react-spinners";
import Web3 from "web3";
import TransactionItem from "../../../components/transactionItem";
import { useAppSelector } from "../../../redux/hooks";
import { selectStorage } from "../../../redux/reducers/storage";
import { AltCoins, Coins, CoinsName, TransactionDirection } from "../../../types";
import { TransactionStatus } from "../../../types/dashboard/transaction";
import { CSVLink } from "react-csv";
import _ from "lodash";
import { SelectSelectedAccount } from "../../../redux/reducers/selectedAccount";
import useMultisig from "../../../hooks/useMultisig";
import { selectMultisig, selectMultisigTransactions } from "../../../redux/reducers/multisig";
import { Link, NavLink, useLocation } from "react-router-dom";
import Accordion from "../../../components/accordion";
import useTransactionProcess, { ERC20MethodIds, IBatchRequest, IFormattedTransaction } from "../../../hooks/useTransactionProcess";
import { fromWei } from "web3-utils";
import { HiDownload } from 'react-icons/hi'
import { selectTags } from "redux/reducers/tags";

const Transactions = () => {
    const storage = useAppSelector(selectStorage);
    const selectedAccount = useAppSelector(SelectSelectedAccount)
    const multisigData = useAppSelector(selectMultisigTransactions)
    const multisigSelector = useAppSelector(selectMultisig)
    const { refetch, isMultisig } = useMultisig()
    const { pathname } = useLocation()
    const tags = useAppSelector(selectTags)

    let page : string;
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
        const result = list.map((transaction, index) => {
            const direction = transaction.rawData.from.toLowerCase() === selectedAccount.toLowerCase()
            const isSwap = transaction.id === ERC20MethodIds.swap
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
                        payments: value,
                        tags: transaction.tags,
                    }
                    TXs.push(tx)
                })
            } else {
                TXs.push(transaction)
            }
            const transactionCount = transaction.id === ERC20MethodIds.batchRequest ? TXs.length : 1
            return <Fragment key={transaction.rawData.hash}>
                <Accordion grid={"grid-cols-[25%,45%,30%] sm:grid-cols-[38%,31%,15%,6%]"} direction={isSwap ? TransactionDirection.Swap : direction ? TransactionDirection.Out : TransactionDirection.In} date={transaction.rawData.timeStamp} dataCount={transactionCount} status={TransactionStatus.Completed}>
                    <div>
                        {TXs.map((s, i) => <TransactionItem key={`${transaction.hash}${i}`} transaction={s} isMultiple={s.id === ERC20MethodIds.batchRequest} />)}
                    </div>
                </Accordion>
            </Fragment>
        })

        resolve(result)
    }), [transactions, tags])

    const path = '/dashboard/transactions'

    return <>
        <div>
            <div className="flex flex-col space-y-5">
                <div className="flex justify-between">
                    <div className="text-2xl font-bold tracking-wider">Transactions</div>
                </div>
                {isMultisig &&
                    <div className="flex pl-10 w-full relative after:absolute after:w-full after:h-[1px] after:bg-black after:bottom-[1px] after:left-0 after:z-10">
                        <NavLink to={path + "/pending"} className={({ isActive }) => isActive ? 'text-primary border-b-[3px] border-primary z-50 mx-5' : 'mx-5'}>
                            <div className="flex gap-x-3 pb-3 font-semibold tracking-wider">
                                <span>Pending Transactions</span>
                            </div>
                        </NavLink>
                        <NavLink to={path} end className={({ isActive }) => `mx-5 ${isActive && "text-primary border-b-[3px] border-primary z-50"}`}>
                            <div className="flex gap-x-3 pb-3 font-semibold tracking-wider">
                                Completed Transactions
                            </div>
                        </NavLink>
                        <NavLink to={path + "/rejected"} className={({ isActive }) => isActive ? 'text-primary border-b-[3px] border-primary z-50 mx-5' : 'mx-5'}>
                            <div className="flex gap-x-3 pb-3 font-semibold tracking-wider">
                                <span>Rejected Transactions</span>
                            </div>
                        </NavLink>
                    </div>
                }
                <div className="py-5">
                    <div className="w-full pt-4 pb-3 rounded-xl">
                        <div id="header" className="grid grid-cols-[25%,45%,30%] sm:grid-cols-[39%,31%,15%,15%] border-b border-black pb-3 " >
                            <div className="sm:hidden text-xs font-medium">Recipient/Sender</div>
                            <div className="hidden sm:block text-xs sm:text-base font-medium">{page !== "completed" ? "Your Confirmation" : "Recipient/Sender"}</div>
                            <div className="text-xs sm:text-base font-medium">{page !== "completed" ? "Action" : "Paid Amount"}</div>
                            <div className="font-medium hidden md:block">{page !== "completed" ? "Signatures" : "Details"}</div>
                            {!isMultisig && <> <div className="place-self-end ">
                                {list && <CSVLink className="font-normal px-2 sm:px-5 py-1 rounded-xl cursor-pointer bg-greylish bg-opacity-10 flex items-center justify-center xl:space-x-5" filename={"remox_transactions.csv"} data={list.map(w => {
                                    let tx = w.rawData
                                    let feeToken = Object.entries(CoinsName).find(s => s[0] === tx.tokenSymbol)?.[1]
                                    return {
                                        'Sent From:': tx.from,
                                        'Amount:': parseFloat(Web3.utils.fromWei(tx.value.toString(), 'ether')).toFixed(4) + ` ${feeToken ? Coins[feeToken].name : "Unknown"}`,
                                        'To:': tx.to,
                                        'Date': dateFormat(new Date(parseInt(tx.timeStamp) * 1e3), "mediumDate"),
                                        "Gas": `${fromWei((parseFloat(tx.gasUsed) * parseFloat(tx.gasPrice)).toString(), "ether")} ${tx.tokenSymbol === "cUSD" ? "cUSD" : "CELO"}`,
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

                                            return <Accordion key={(w.id?.toString() ?? Math.random().toString()) + w.data} grid={"grid-cols-[25%,45%,30%] sm:grid-cols-[38%,31%,15%,6%]"} dataCount={1} method={method} status={w.executed ? TransactionStatus.Completed : w.confirmations.length > 0 ? TransactionStatus.Pending : TransactionStatus.Rejected}>
                                                <div className="pl-5 grid sm:grid-cols-[20%,30%,25%,25%] lg:grid-cols-[38%,32%,15%,15%] min-h-[75px] py-6 items-center">
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
                                                        <Link to={`/dashboard/multisig/${w.id}`}><div className={`text-primary px-6 max-h-[80px] border-2 border-primary rounded-xl py-2 hover:bg-primary hover:text-white`}>View Details</div></Link>
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
                        {page === "completed" && ( list && transactionVisual ? transactionVisual : <div className="text-center py-2"><ClipLoader /></div>)}
                    </div>
                </div>
            </div>

        </div>
    </>
}

export default Transactions;