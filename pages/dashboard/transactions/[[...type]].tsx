import dateFormat from "dateformat";
import { Fragment, useEffect, useMemo, useState } from "react";
import Accordion from "components/accordion";
import { TransactionStatus, AltCoins, CoinsName } from "types";
import { ERC20MethodIds, IBatchRequest, IFormattedTransaction } from "hooks/useTransactionProcess";
import TransactionItem from "subpages/dashboard/transactions/transactionItem";
import { useAppSelector } from "redux/hooks";
import { selectStorage } from "redux/reducers/storage";
import { CSVLink } from "react-csv";
import _ from "lodash";
import { SelectSelectedAccount } from "redux/reducers/selectedAccount";
import useMultisigProcess from "hooks/useMultisigProcess";
import { selectMultisig, selectMultisigTransactions } from "redux/reducers/multisig";
import { HiDownload } from 'react-icons/hi'
import { selectTags } from "redux/reducers/tags";
import { WalletDropdown } from "components/general/walletdropdown"
import AnimatedTabBar from "components/animatedTabBar";
import { TransactionDirectionDeclare } from "utils";
import { useTransaction, useWalletKit } from "hooks";
import useMultiWallet from "hooks/useMultiWallet";
import { useRouter } from "next/router";
import Link from "next/link";
import Loader from "components/Loader";
import { selectDarkMode } from "redux/reducers/notificationSlice";
import { useSelector } from "react-redux";
import Button from "components/button";
import Filter from "subpages/dashboard/transactions/filter";

const Transactions = () => {
    const storage = useAppSelector(selectStorage);
    const selectedAccount = useAppSelector(SelectSelectedAccount)
    const multisigData = useAppSelector(selectMultisigTransactions)
    const multisigSelector = useAppSelector(selectMultisig)
    const { refetch, isMultisig } = useMultisigProcess()
    const router = useRouter()
    const { type } = router.query as { type: string[] | undefined }
    const tags = useAppSelector(selectTags)
    const { GetCoins, fromMinScale } = useWalletKit()
<<<<<<< HEAD
    const darkMode = useSelector(selectDarkMode)
    const [isOpen, setOpen] = useState(false)


=======
 
>>>>>>> 43e5069a8ddc387de07c67ee0c4e6c197f2862b3
    let page: string;
    if (type?.[0].includes("pending")) {
        page = "pending"
    } else if (type?.[0].includes("rejected")) {
        page = "rejected"
    } else page = "completed"



    const [transactionVisual, setVisual] = useState<JSX.Element | JSX.Element[]>()
    const { data: wallets } = useMultiWallet()
    const [changedAccount, setChangedAccount] = useState<string[]>(wallets?.map(s => s.address) ?? [selectedAccount])

    useEffect(()=> setChangedAccount(wallets?.map(s => s.address) ?? [selectedAccount]), [wallets])

    const { list } = useTransaction(changedAccount)

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
        const result = list.map((transaction, index) => ProcessAccordion(transaction, changedAccount, "grid-cols-[25%,45%,30%] sm:grid-cols-[22%,26%,30%,22%]", "bg-white dark:bg-darkSecond"))
        resolve(result)
    }), [list, tags])

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
    <div className="flex flex-col space-y-5 gap-14">
        <div className="flex justify-between">
            <div className="text-3xl font-bold">Transactions</div>
            <div className="flex gap-2">
            {!isMultisig && <div className="mr-3">
                        <WalletDropdown selected={selectedAccount} onChange={(wallets) => {
                            setChangedAccount([...wallets.map((wallet) => wallet.address)])
                        }} />
                    </div>}
                    {!isMultisig && <> <div className="">
                        {list && <CSVLink className="font-normal   py-2 px-4 rounded-xl cursor-pointer flex justify-center items-center bg-white dark:bg-darkSecond xl:space-x-5" filename={"remox_transactions.csv"} data={list.map(w => {
                            let tx = w.rawData
                            let feeToken = Object.entries(CoinsName).find(s => s[0] === tx.tokenSymbol)?.[1]
                            return {
                                'Sent From:': tx.from,
                                'Amount:': parseFloat(fromMinScale(tx.value.toString())).toFixed(4) + ` ${feeToken && GetCoins ? GetCoins[feeToken].name : "Unknown"}`,
                                'To:': tx.to,
                                'Date': dateFormat(new Date(parseInt(tx.timeStamp) * 1e3), "mediumDate"),
                                "Gas": `${fromMinScale((parseFloat(tx.gasUsed) * parseFloat(tx.gasPrice)).toString())} ${tx.tokenSymbol === "cUSD" ? "cUSD" : "CELO"}`,
                                "Block Number": tx.blockNumber,
                                "Transaction Hash": tx.hash,
                                "Block Hash": tx.blockHash,
                                "Input": tx.input
                            }
                        })}>
                            <div className={'hidden'}>Export</div>
                            <img className={`w-[1.5rem] h-[1.5rem] !m-0 `} src={darkMode ? '/icons/import_white.png' : '/icons/import.png'} alt='Import' />
                        </CSVLink>}

                    </div></>}
                    <div className="relative">
                    <div onClick={() => setOpen(!isOpen)} className="font-normal   py-2 px-4 rounded-xl cursor-pointer flex justify-center items-center bg-white dark:bg-darkSecond xl:space-x-5">
                        <img className={`w-[1.5rem] h-[1.5rem] !m-0`} src={darkMode ? '/icons/filter_white.png' : '/icons/filter.png'} alt='Import' />
                    </div>
                    {isOpen && <div className='absolute bg-white dark:bg-darkSecond  min-w-[27rem] min-h-[16rem] rounded-xl sm:-right-0 -bottom-1 translate-y-full shadow-xl z-50'>
                        <Filter/>
                    </div>}
                    </div>
            </div>
        </div>
        {isMultisig && <>
            <div className="flex  py-2 w-full ">
                <AnimatedTabBar data={data} />
            </div>
        </>}
        <div className="!mt-0">
            <div className="w-full  pb-3 rounded-xl">
                <div id="header" className="grid grid-cols-[25%,45%,30%] sm:grid-cols-[20%,15%,12%,18%,25%,10%] border-b dark:border-greylish  pb-3 " >
                <div className=" text-base font-medium pt-2">Wallet</div>
                    <div className=" text-base font-medium pt-2">Budget</div>
                    <div className="text-base  font-medium pt-2">Type</div>
                    <div className="text-base sm:text-base font-medium pt-2">{page !== "completed" ? "Action" : "Amount"}</div>
                    <div className="text-base font-medium pt-2">Labels</div>
                    {/* <div className="font-medium hidden md:block pt-2">{page !== "completed" ? "Signatures" : "Details"}</div> */}
                    <div className="py-1 px-2 cursor-pointer border border-primary text-primary rounded-lg flex items-center justify-center gap-2"> <img src="/icons/refresh_primary.png" alt="" className="w-4 h-4" /> Refresh</div>
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
                                        <div className=" grid sm:grid-cols-[20%,30%,25%,25%,] lg:grid-cols-[28.5%,26%,25%,20.5%] min-h-[75px] py-6 items-center">
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
                                                {w.valueOfTransfer && GetCoins ? <div className="truncate pr-10  text-base">Value: {w.valueOfTransfer} {(Object.values(GetCoins).find((s: AltCoins) => s.contractAddress.toLowerCase() === w.destination.toLowerCase()) as AltCoins)?.name}</div> : null}
                                                {w.newOwner ? <div className="truncate pr-10  text-base">New Owner: {w.newOwner}</div> : null}
                                                {w.requiredCount ? <div className="truncate pr-10  text-base">New Signature Threshold: {+w.requiredCount}</div> : null}
                                            </div>
                                            <div className="font-semibold ">
                                                {w.confirmations.length} <span className="font-medium">out of</span> {w.method?.toLowerCase().includes("transfer") ? multisigSelector?.sign : multisigSelector?.internalSign}
                                            </div>
                                            <div className="flex justify-end cursor-pointer items-start md:pr-0 ">
                                                <Link href={`/dashboard/multisig/${w.id}`}><div className={`text-primary px-6 max-h-[80px] w-full border-2 border-primary rounded-xl py-2 hover:bg-primary hover:text-white`}>View Details</div></Link>
                                            </div>
                                        </div>
                                    </Accordion>
                                })}

                            </> : <div className="flex flex-col justify-center">
                                <div className="text-center py-3"><Loader /></div>
                                <div className="text-center text-xs text-gray-500">It can take longer</div>
                            </div> : <div className="text-center py-3">No Transaction Yet</div>}
                    </div>
                }
                {page === "completed" && (list && transactionVisual ? transactionVisual : <div className="text-center py-2"><Loader /></div>)}
            </div>
        </div>
    </div>

</div>
</>
}


export default Transactions;


export const ProcessAccordion = (transaction: IFormattedTransaction, accounts: string[], grid: string, color: string) => {
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
let directionType = TransactionDirectionDeclare(transaction, accounts);

return <Fragment key={transaction.rawData.hash}>
<Accordion grid={grid} color={color} direction={directionType} date={transaction.rawData.timeStamp} dataCount={transactionCount} status={TransactionStatus.Completed}>
    <div>
        {TXs.map((s, i) => <TransactionItem key={`${transaction.hash}${i}`} date={transaction.rawData.timeStamp} transaction={s} direction={directionType}  status={TransactionStatus.Completed} isMultiple={s.id === ERC20MethodIds.batchRequest} />)}
    </div>
</Accordion>
</Fragment>
}
