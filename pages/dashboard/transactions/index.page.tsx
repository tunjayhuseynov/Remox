import dateFormat from "dateformat";
import { forwardRef, Fragment, useState, useTransition } from "react";
import Accordion from "components/accordion";
import { TransactionStatus, AltCoins, CoinsName, Coins } from "types";
import { ERC20MethodIds, IBatchRequest, IFormattedTransaction } from "hooks/useTransactionProcess";
import { CSVLink } from "react-csv";
import _ from "lodash";
import { selectTags } from "redux/slices/tags";
import { WalletDropdown } from "components/general/walletdropdown"
import { TransactionDirectionDeclare } from "utils";
import { useModalSideExit, useWalletKit } from "hooks";
import { useRouter } from "next/router";
import { useSelector } from "react-redux";
import useNextSelector from "hooks/useNextSelector";
import { useAppSelector } from "redux/hooks";
import { useInView } from 'react-intersection-observer'
import { SelectAccounts, SelectCumlativeTxs as SelectCumulativeTxs, SelectDarkMode, SelectProviderAddress, SelectTransactions } from "redux/slices/account/remoxData";
import { IMultisigSafeTransaction, ITransactionMultisig } from "hooks/walletSDK/useMultisig";
import Loader from "components/Loader";
import { motion } from "framer-motion"
import useAsyncEffect from "hooks/useAsyncEffect";
import Filter from "./_components/filter";
import SingleTransactionItem from "./_components/SingleTransactionItem";
import MultisigTx from "./_components/MultisigTransactionItem";
import { TablePagination } from "@mui/material";


const Transactions = () => {
    const STABLE_INDEX = 6;
    const selectedAccount = useAppSelector(SelectProviderAddress)
    const accountsRaw = useAppSelector(SelectAccounts)
    const accounts = accountsRaw.map((a) => a.address)
    const Txs = useAppSelector(SelectCumulativeTxs)
    const router = useRouter()
    const { type } = router.query as { type: string[] | undefined }
    const { GetCoins, fromMinScale, Address } = useWalletKit()
    const darkMode = useSelector(SelectDarkMode)
    const [isOpen, setOpen] = useState(false)
    const [isPending, startTransition] = useTransition()

    const [pagination, setPagination] = useState(STABLE_INDEX)

    const [address, setAddress] = useState<string>()

    useAsyncEffect(async () => {
        const val = await Address
        if (val) setAddress(val)
    }, [Address])

    // const { ref } = useInView({
    //     onChange: (inView) => {
    //         if (inView && Txs.length > pagination) {
    //             startTransition(() => { setPagination(pagination + STABLE_INDEX) })
    //         }
    //     }
    // })

    const list = useAppSelector(SelectTransactions)

    const [changedAccount, setChangedAccount] = useState<string[]>([])
    const [filterRef, exceptRef] = useModalSideExit<boolean>(isOpen, setOpen, false)
    return <>
        <div>
            <div className="flex flex-col space-y-5 gap-14" >
                <div>
                    <div className="flex justify-between">
                        <div className="text-3xl font-bold">Transactions</div>
                        <div>
                            <TablePagination
                                component="div"
                                rowsPerPageOptions={[]}
                                count={Txs.length}
                                page={(pagination / STABLE_INDEX) - 1}
                                onPageChange={(e, newPage) => setPagination((newPage + 1) * STABLE_INDEX)}
                                rowsPerPage={STABLE_INDEX}
                            // onRowsPerPageChange={handleChangeRowsPerPage}
                            />
                        </div>
                    </div>
                    <div className="flex justify-between">
                        <div className="flex space-x-5">
                            <div className="py-1">
                                <div className="cursor-pointer rounded-md dark:bg-darkSecond bg-white border-2 dark:border-gray-500 border-gray-200 px-5 py-2 font-semibold">
                                    + Add Filter
                                </div>
                            </div>
                            <div className="w-[1px] h-full dark:bg-gray-500 bg-gray-500"></div>
                        </div>
                        {list && <div className="py-1">
                            <CSVLink className="cursor-pointer rounded-md dark:bg-darkSecond bg-white border-2 dark:border-gray-500 border-gray-200 px-5 py-2 font-semibold flex items-center space-x-5" filename={"remox_transactions.csv"} data={list.map(w => {
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
                                <img className={`w-[1rem] h-[1rem] !m-0 `} src={darkMode ? '/icons/import_white.png' : '/icons/import.png'} alt='Import' />
                                <div >Export All</div>
                            </CSVLink>
                        </div>}
                    </div>
                    <div className="mt-5">
                        <table className="w-full">
                            <thead>
                                <tr className="pl-5 grid grid-cols-[12.5%,repeat(6,minmax(0,1fr))] text-gray-500 dark:text-gray-300 text-sm font-normal bg-gray-100 dark:bg-darkSecond rounded-md">
                                    <th className="py-3 self-center text-left">Date</th>
                                    <th className="py-3 self-center text-left">Wallet</th>
                                    <th className="py-3 self-center text-left">Type</th>
                                    <th className="py-3 self-center text-left">Amount</th>
                                    <th className="py-3 self-center text-left">Labels</th>
                                    <th className="py-3 self-center text-left">Signatures</th>
                                    <th className="py-3 flex justify-start">
                                        <div className="w-28 py-1 px-1 cursor-pointer border border-primary text-primary rounded-md flex items-center justify-center space-x-2">
                                            <div>
                                                <img src="/icons/refresh_primary.png" alt="" className="w-3 h-3" />
                                            </div>
                                            <span className="tracking-wider">
                                                Refresh
                                            </span>
                                        </div>
                                    </th>
                                </tr>
                                {Txs?.slice(pagination - STABLE_INDEX, pagination).map((tx) => {
                                    if ((tx as IFormattedTransaction)['hash']) {
                                        const txData = (tx as IFormattedTransaction)
                                        return <ProcessAccordion key={txData.rawData.hash} transaction={txData} accounts={changedAccount} color={"bg-white dark:bg-darkSecond"} />
                                    } else {
                                        const txData = (tx as ITransactionMultisig | IMultisigSafeTransaction)
                                        const account = accountsRaw.find(s => s.address.toLowerCase() === txData.contractAddress.toLowerCase())
                                        const isSafe = "safeTxHash" in txData
                                        return <MultisigTx multisigAccount={account} key={isSafe ? txData.safeTxHash : txData.contractAddress + txData.hashOrIndex} accounts={accounts} Address={address} GetCoins={GetCoins} tx={tx as ITransactionMultisig} />
                                    }
                                })}
                            </thead>
                        </table>
                        <div className="flex justify-between">
                            <div></div>
                            <div>
                                <TablePagination
                                    component="div"
                                    rowsPerPageOptions={[]}
                                    count={Txs.length}
                                    page={(pagination / STABLE_INDEX) - 1}
                                    onPageChange={(e, newPage) => setPagination((newPage + 1) * STABLE_INDEX)}
                                    rowsPerPage={STABLE_INDEX}
                                // onRowsPerPageChange={handleChangeRowsPerPage}
                                />
                            </div>
                        </div>
                    </div>
                    {/*<div className="flex gap-2">
                        <div className="mr-3">
                            <WalletDropdown selected={selectedAccount ?? ""} onChange={(wallets) => {
                                setChangedAccount([...wallets.map((wallet) => wallet.address)])
                            }} />
                        </div>
                        <div>
                            {list && <CSVLink className="font-normal py-2 px-4 rounded-xl cursor-pointer flex justify-center items-center bg-white dark:bg-darkSecond xl:space-x-5" filename={"remox_transactions.csv"} data={list.map(w => {
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
                        </div>
                        <div className="relative">
                            <div ref={exceptRef} onClick={() => setOpen(!isOpen)} className="font-normal   py-2 px-4 rounded-xl cursor-pointer flex justify-center items-center bg-white dark:bg-darkSecond xl:space-x-5">
                                <img className={`w-[1.5rem] h-[1.5rem] !m-0`} src={darkMode ? '/icons/filter_white.png' : '/icons/filter.png'} alt='Import' />
                            </div>
                            {isOpen && <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} ref={filterRef} className='absolute bg-white dark:bg-darkSecond  w-[30rem] h-[18rem] rounded-2xl sm:-right-0 -bottom-1 translate-y-full shadow-xl z-50'>
                                <Filter />
                            </motion.div>}
                        </div>
                    </div>
                </div>*/}
                </div>
            </div>
        </div>
    </>
}


export default Transactions;

export const ProcessAccordion = forwardRef<HTMLDivElement, { transaction: IFormattedTransaction, accounts: string[], color: string }>(({ transaction, accounts, color }, ref) => {
    const isBatch = transaction.id === ERC20MethodIds.batchRequest
    const TXs: IFormattedTransaction[] = [];
    if (isBatch) {
        const groupBatch = _((transaction as IBatchRequest).payments).groupBy("to").value()
        Object.entries(groupBatch).forEach(([key, value]) => {
            let tx: IBatchRequest = {
                timestamp: transaction.timestamp,
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

    return <>
        {isBatch && TXs.map((s, i) => <SingleTransactionItem key={`${transaction.hash}${i}`} date={transaction.rawData.timeStamp} transaction={s} direction={directionType} status={TransactionStatus.Completed} isMultiple={isBatch} />)}
        {!isBatch && <SingleTransactionItem key={`${transaction.hash}`} date={transaction.rawData.timeStamp} transaction={transaction} direction={directionType} status={TransactionStatus.Completed} isMultiple={isBatch} />}
    </>
})

