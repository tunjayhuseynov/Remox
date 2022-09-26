import dateFormat from "dateformat";
import { forwardRef, useEffect, useState, useTransition } from "react";
import { TransactionStatus, CoinsName, AltCoins } from "types";
import { ERC20MethodIds, IAutomationBatchRequest, IBatchRequest, IFormattedTransaction, ISwap, ITransfer } from "hooks/useTransactionProcess";
import { CSVLink } from "react-csv";
import _ from "lodash";
import { TransactionDirectionDeclare, TransactionDirectionImageNameDeclaration, TransactionTypeDeclare } from "utils";
import { useModalSideExit, useWalletKit } from "hooks";
import { useRouter } from "next/router";
import { useSelector } from "react-redux";
import { useAppDispatch, useAppSelector } from "redux/hooks";
import { SelectAccounts, SelectCumlativeTxs as SelectCumulativeTxs, SelectDarkMode, SelectTags } from "redux/slices/account/remoxData";
import { ITransactionMultisig } from "hooks/walletSDK/useMultisig";
import useAsyncEffect from "hooks/useAsyncEffect";
import SingleTransactionItem from "./_components/SingleTransactionItem";
import MultisigTx from "./_components/MultisigTransactionItem";
import { TablePagination } from "@mui/material";
import { IAccountORM } from "pages/api/account/index.api";
import { BlockchainType } from "types/blockchains";
import { ITag } from "pages/api/tags/index.api";
import Filter from "./_components/Filter";
import { DateObject } from "react-multi-date-picker";
import { AnimatePresence, motion } from "framer-motion";
import { DecimalConverter } from "utils/api";
import { Tx_Refresh_Data_Thunk } from "redux/slices/account/thunks/refresh/txRefresh";
import useLoading from "hooks/useLoading";
import Loader from "components/Loader";


const Transactions = () => {
    const STABLE_INDEX = 6;
    const accountsRaw = useAppSelector(SelectAccounts)
    const tags = useAppSelector(SelectTags)
    const accounts = accountsRaw.map((a) => a.address)
    const Txs = useAppSelector(SelectCumulativeTxs)

    const dispatch = useAppDispatch()
    const { Address, blockchain } = useWalletKit()
    const darkMode = useSelector(SelectDarkMode)
    const [isOpen, setOpen] = useState(false)

    const [pagination, setPagination] = useState(STABLE_INDEX)

    const [address, setAddress] = useState<string>()

    useAsyncEffect(async () => {
        const val = await Address
        if (val) setAddress(val)
    }, [Address])

    // const list = useAppSelector(SelectTransactions)

    const [date, setDate] = useState<DateObject[] | null>(null);
    const [selectedTags, setSelectedTags] = useState<string[]>([]);
    const [selectedBudgets, setSelectedBudgets] = useState<string[]>([]);
    const [selectedAccounts, setSelectedAccounts] = useState<string[]>([]);
    const [selectedDirection, setSelectedDirection] = useState<string>("Any");

    const [specificAmount, setSpecificAmount] = useState<number>();
    const [minAmount, setMinAmount] = useState<number>();
    const [maxAmount, setMaxAmount] = useState<number>();

    useEffect(() => {
        setPagination(STABLE_INDEX)
    }, [date, selectedTags, selectedBudgets, selectedAccounts, selectedDirection, specificAmount, minAmount, maxAmount])

    const refreshFn = async () => {
        await dispatch(Tx_Refresh_Data_Thunk())
    }

    const [refreshLoading, refresh] = useLoading(refreshFn)


    const filterFn = (c: (IFormattedTransaction | ITransactionMultisig)) => {
        if ('tx' in c) {
            const tx = c.tx

            if (selectedDirection !== "Any") {
                if (selectedDirection === "In") return false
                if (selectedDirection === "Out") return true
            }

            if (selectedTags.length > 0 && !c.tags.some(s => selectedTags.includes(s.id))) return false

            if (selectedAccounts.length > 0 && !selectedAccounts.some(s => s.toLowerCase() === c.contractAddress.toLowerCase())) return false

            if (selectedBudgets.length > 0 && !selectedBudgets.some((b) => b === c.budget?.id)) return false

            if (specificAmount && (tx.amount ?? 0) !== specificAmount) return false
            if (minAmount && (tx.amount ?? tx.payments?.reduce((a, c) => a += +c.amount, 0) ?? Number.MAX_VALUE) < minAmount) return false
            if (maxAmount && (tx.amount ?? tx.payments?.reduce((a, c) => a += +c.amount, 0) ?? 0) > maxAmount) return false
            if (date && date.length === 1) {
                const crr = new Date(c.timestamp * 1e3)
                if (`${crr.getFullYear()}${crr.getMonth() + 1}${crr.getDay()}` !== `${date[0].year}${date[0].month.number}${date[0].day}`) return false
            } else if (date && date.length === 2) {
                const crr = new Date(c.timestamp * 1e3)
                if (`${crr.getFullYear()}${crr.getMonth() + 1}${crr.getDay()}` < `${date[0].year}${date[0].month.number}${date[0].day}`) return false
                if (`${crr.getFullYear()}${crr.getMonth() + 1}${crr.getDay()}` > `${date[1].year}${date[1].month.number}${date[1].day}`) return false
            }
            return true
        } else {
            const tx = c as any
            if (selectedDirection !== "Any") {
                if (selectedDirection === "In" && c.address.toLowerCase() === c.rawData.from.toLowerCase()) return false
                if (selectedDirection === "Out" && c.address.toLowerCase() !== c.rawData.from.toLowerCase()) return false
            }

            if (selectedTags.length > 0 && !c.tags.some(s => selectedTags.includes(s.id))) return false

            if (selectedAccounts.length > 0 && !selectedAccounts.some(s => s.toLowerCase() === c.address.toLowerCase())) return false

            if (selectedBudgets.length > 0 && !selectedBudgets.some((b) => b === c.budget?.id)) return false

            if (specificAmount && (tx?.amount ?? 0) !== specificAmount) return false
            if (minAmount && (tx?.amount ?? tx?.payments?.reduce((a: number, c: ITransfer) => a += +c.amount, 0) ?? Number.MAX_VALUE) < minAmount) return false
            if (maxAmount && (tx?.amount ?? tx?.payments?.reduce((a: number, c: ITransfer) => a += +c.amount, 0) ?? 0) > maxAmount) return false
            if (date && date.length === 1) {
                const crr = new Date(c.timestamp * 1e3)
                if (`${crr.getFullYear()}${(crr.getMonth() + 1).toString().padStart(2, "0")}${crr.getDay().toString().padStart(2, "0")}` !== `${date[0].year}${date[0].month.number.toString().padStart(2, "0")}${date[0].day.toString().padStart(2, "0")}`) return false
            } else if (date && date.length === 2) {
                const crr = new Date(c.timestamp * 1e3)

                if (`${crr.getFullYear()}${(crr.getMonth() + 1).toString().padStart(2, "0")}${crr.getDay().toString().padStart(2, "0")}` < `${date[0].year}${date[0].month.number.toString().padStart(2, "0")}${date[0].day.toString().padStart(2, "0")}`) return false
                if (`${crr.getFullYear()}${(crr.getMonth() + 1).toString().padStart(2, "0")}${crr.getDay().toString().padStart(2, "0")}` > `${date[1].year}${date[1].month.number.toString().padStart(2, "0")}${date[1].day.toString().padStart(2, "0")}`) return false
            }
            return true
        }
    }
    const txs = Txs?.filter(filterFn)

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
                                count={txs.length}
                                page={(pagination / STABLE_INDEX) - 1}
                                onPageChange={(e, newPage) => setPagination((newPage + 1) * STABLE_INDEX)}
                                rowsPerPage={STABLE_INDEX}
                            // onRowsPerPageChange={handleChangeRowsPerPage}
                            />
                        </div>
                    </div>
                    <div className="flex justify-between">
                        <div className="flex space-x-5">
                            <div className="py-1 relative" ref={exceptRef} onClick={() => setOpen(true)}>
                                <div className="cursor-pointer rounded-md dark:bg-darkSecond bg-white border-2 dark:border-gray-500 border-gray-200 px-5 py-2 font-semibold">
                                    + Add Filter
                                </div>
                                <div ref={filterRef} className="absolute bottom-0 translate-y-full z-[900]">
                                    <AnimatePresence>
                                        {isOpen &&
                                            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: .33 }}>
                                                <Filter
                                                    date={date}
                                                    setDate={setDate}
                                                    selectedTags={selectedTags}
                                                    setSelectedTags={setSelectedTags}
                                                    selectedBudgets={selectedBudgets}
                                                    setSelectedBudgets={setSelectedBudgets}
                                                    selectedAccounts={selectedAccounts}
                                                    setSelectedAccounts={setSelectedAccounts}
                                                    selectedDirection={selectedDirection}
                                                    setSelectedDirection={setSelectedDirection}
                                                    specificAmount={specificAmount}
                                                    setSpecificAmount={setSpecificAmount}
                                                    minAmount={minAmount}
                                                    setMinAmount={setMinAmount}
                                                    maxAmount={maxAmount}
                                                    setMaxAmount={setMaxAmount}
                                                />
                                            </motion.div>}
                                    </AnimatePresence>
                                </div>
                            </div>
                            <div className="w-[1px] h-full dark:bg-gray-500 bg-gray-500"></div>
                        </div>
                        {txs.length > 0 && <div className="py-1">
                            <CSVLink className="cursor-pointer rounded-md dark:bg-darkSecond bg-white border-2 dark:border-gray-500 border-gray-200 px-5 py-2 font-semibold flex items-center space-x-5" filename={"remox_transactions.csv"} data={txs.map(w => {
                                let directionType = TransactionDirectionDeclare(w, accounts);
                                const [, name, action] = TransactionDirectionImageNameDeclaration(blockchain, directionType, 'tx' in w);
                                let method = 'tx' in w ? w.tx.method : w.method;

                                const from = 'tx' in w ? w.contractAddress : w.rawData.from;

                                let amountCoins: { amount: number, coin: string }[] = [];

                                let swapping: {
                                    amountIn: number,
                                    amountOut: number,
                                    amountInCoin: string,
                                    amountOutCoin: string,
                                } | null = null

                                if (method === ERC20MethodIds.transfer || method === ERC20MethodIds.transferFrom || method === ERC20MethodIds.transferWithComment) {
                                    const coinData = 'tx' in w ? (w.tx as ITransfer).coin : (w as ITransfer).coin;
                                    amountCoins = [{ amount: DecimalConverter('tx' in w ? (w.tx as ITransfer).amount : (w as ITransfer).amount, coinData.decimals), coin: coinData.symbol }];
                                } else if (method === ERC20MethodIds.batchRequest || method === ERC20MethodIds.automatedBatchRequest) {
                                    const payments = 'tx' in w ? (w.tx as unknown as IBatchRequest).payments : (w as IBatchRequest).payments;
                                    amountCoins = payments.map(w => ({ amount: DecimalConverter(w.amount, w.coin.decimals), coin: w.coin.symbol }));
                                } else if (method === ERC20MethodIds.swap) {
                                    const swap = 'tx' in w ? (w.tx as unknown as ISwap) : (w as ISwap);
                                    swapping = {
                                        amountIn: DecimalConverter(swap.amountIn, swap.coinIn.decimals),
                                        amountOut: DecimalConverter(swap.amountOutMin, swap.coinOutMin.decimals),
                                        amountInCoin: swap.coinIn.symbol,
                                        amountOutCoin: swap.coinOutMin.symbol,
                                    }
                                }

                                let timestamp = w.timestamp * 1e3;

                                let gasCoin = 'tx' in w ? "" : w.rawData.tokenSymbol ?? w.rawData.feeCurrency ?? "";
                                let gas = 'tx' in w ? "" : +w.rawData.gasPrice * +w.rawData.gasUsed;
                                let blockNumber = 'tx' in w ? "" : w.rawData.blockNumber;
                                let hash = 'tx' in w ? "" : w.rawData.hash;
                                let blockhash = 'tx' in w ? "" : w.rawData.blockHash;
                                let data = 'tx' in w ? "" : w.rawData.input;

                                return {
                                    'Method': action,
                                    "Provider": name,
                                    'Status': 'tx' in w ? w.isExecuted ? "Success" : w.confirmations.length === 0 ? "Rejected" : "Pending" : "Success",
                                    'Sent From:': from,
                                    'Amount:': swapping ? `${swapping.amountIn} ${swapping.amountInCoin} => ${swapping.amountOut} ${swapping.amountOutCoin}` : amountCoins.map(w => `${w.amount} ${w.coin}`).join(',\n'),
                                    'To:': 'tx' in w ? w.tx.to ?? "" : w.rawData.to,
                                    'Date': dateFormat(new Date(timestamp), "mediumDate"),
                                    "Gas": `${gas} ${gasCoin}`,
                                    "Block Number": blockNumber,
                                    "Transaction Hash": hash,
                                    "Block Hash": blockhash,
                                    "Input": data
                                }
                            })}>
                                <img className={`w-[1rem] h-[1rem] !m-0 `} src={darkMode ? '/icons/import_white.png' : '/icons/import.png'} alt='Import' />
                                <div >{txs.length !== Txs.length ? "Export Filtered" : "Export All"}</div>
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
                                        <div onClick={refresh} className="w-28 py-1 px-1 cursor-pointer border border-primary text-primary rounded-md flex items-center justify-center space-x-2">
                                            <div>
                                                <img src="/icons/refresh_primary.png" alt="" className="w-3 h-3" />
                                            </div>
                                            <span className="tracking-wider">
                                                {refreshLoading ? <><Loader /> Refreshing</> : "Refresh"}
                                            </span>
                                        </div>
                                    </th>
                                </tr>
                                {txs.slice(pagination - STABLE_INDEX, pagination).map((tx, i) => {
                                    if ((tx as IFormattedTransaction)['hash']) {
                                        const address = (tx as IFormattedTransaction).address;
                                        const account = accountsRaw.find(s => s.address.toLowerCase() === address.toLowerCase())
                                        const txData = (tx as IFormattedTransaction)
                                        return <SingleTxContainer txIndexInRemoxData={i + (pagination - STABLE_INDEX)} tags={tags} blockchain={blockchain} key={`${txData.address}${txData.rawData.hash}`} selectedAccount={account} transaction={txData} accounts={accounts} color={"bg-white dark:bg-darkSecond"} />
                                    } else {
                                        const txData = (tx as ITransactionMultisig)
                                        const account = accountsRaw.find(s => s.address.toLowerCase() === txData.contractAddress.toLowerCase())
                                        const isSafe = "safeTxHash" in txData
                                        let directionType = TransactionDirectionDeclare(txData, accounts);
                                        return <MultisigTx txPositionInRemoxData={i + (pagination - STABLE_INDEX)} tags={tags} blockchain={blockchain} direction={directionType} account={account} key={txData.contractAddress + txData.hashOrIndex} address={address} tx={tx as ITransactionMultisig} />
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
                                    count={txs.length}
                                    page={(pagination / STABLE_INDEX) - 1}
                                    onPageChange={(e, newPage) => setPagination((newPage + 1) * STABLE_INDEX)}
                                    rowsPerPage={STABLE_INDEX}
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </>
}


export default Transactions;

interface IProps { transaction: IFormattedTransaction, accounts: string[], selectedAccount?: IAccountORM, color: string, tags: ITag[], blockchain: BlockchainType, txIndexInRemoxData: number }

export const SingleTxContainer = forwardRef<HTMLDivElement, IProps>(({ transaction, accounts, selectedAccount, blockchain, tags, txIndexInRemoxData }, ref) => {
    const isBatch = transaction.id === ERC20MethodIds.batchRequest || transaction.id === ERC20MethodIds.automatedBatchRequest
    const TXs: IFormattedTransaction[] = [];
    if (isBatch) {
        if (transaction.id === ERC20MethodIds.batchRequest) {
            const groupBatch = _((transaction as IBatchRequest).payments).groupBy("to").value()
            Object.entries(groupBatch).forEach(([key, value]) => {
                let tx: IBatchRequest = {
                    timestamp: transaction.timestamp,
                    isError: transaction.isError,
                    method: transaction.method,
                    id: transaction.id,
                    hash: transaction.hash,
                    rawData: transaction.rawData,
                    payments: value,
                    address: transaction.address,
                    tags: transaction.tags,
                    // budget: transaction.budget,
                }
                TXs.push(tx)
            })
        } else {
            const groupBatch = _((transaction as IAutomationBatchRequest).payments).groupBy("address").value()
            Object.entries(groupBatch).forEach(([key, value]) => {
                let tx: IAutomationBatchRequest = {
                    timestamp: transaction.timestamp,
                    isError: transaction.isError,
                    method: transaction.method,
                    id: transaction.id,
                    hash: transaction.hash,
                    rawData: transaction.rawData,
                    payments: value,
                    address: transaction.address,
                    tags: transaction.tags,
                    // budget: transaction.budget,
                }
                TXs.push(tx)
            })
        }
    } else {
        TXs.push(transaction)
    }
    const transactionCount = transaction.id === ERC20MethodIds.batchRequest ? TXs.length : 1
    let directionType = TransactionDirectionDeclare(transaction, accounts);

    return <>
        {isBatch && TXs.map((s, i) => <SingleTransactionItem txPositionInRemoxData={txIndexInRemoxData} tags={tags} blockchain={blockchain} account={selectedAccount} key={`${transaction.address}${transaction.hash}${i}`} date={transaction.rawData.timeStamp} transaction={s} direction={directionType} status={TransactionStatus.Completed} isMultiple={isBatch} />)}
        {!isBatch && <SingleTransactionItem txPositionInRemoxData={txIndexInRemoxData} tags={tags} blockchain={blockchain} account={selectedAccount} key={`${transaction.address}${transaction.hash}`} date={transaction.rawData.timeStamp} transaction={transaction} direction={directionType} status={TransactionStatus.Completed} isMultiple={isBatch} />}
    </>
})

