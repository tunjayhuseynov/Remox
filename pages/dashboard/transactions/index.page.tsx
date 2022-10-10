import { forwardRef, useEffect, useState } from "react";
import { TransactionStatus } from "types";
import { ERC20MethodIds, IAutomationBatchRequest, IAutomationCancel, IBatchRequest, IFormattedTransaction, ISwap, ITransfer } from "hooks/useTransactionProcess";
import { CSVLink } from "react-csv";
import _ from "lodash";
import { TransactionDirectionDeclare, TransactionDirectionImageNameDeclaration } from "utils";
import { useModalSideExit, useWalletKit } from "hooks";
import { useRouter } from "next/router";
import { useSelector } from "react-redux";
import { useAppDispatch, useAppSelector } from "redux/hooks";
import { SelectAccounts, SelectAlldRecurringTasks, SelectCumlativeTxs as SelectCumulativeTxs, SelectDarkMode, SelectTags } from "redux/slices/account/remoxData";
import { ITransactionMultisig } from "hooks/walletSDK/useMultisig";
import useAsyncEffect from "hooks/useAsyncEffect";
import SingleTransactionItem from "./_components/SingleTransactionItem";
import MultisigTx from "./_components/MultisigTransactionItem";
import { TablePagination } from "@mui/material";
import { IAccountORM } from "pages/api/account/index.api";
import { BlockchainType } from "types/blockchains";
import { ITag } from "pages/api/tags/index.api";
import Filter from "./_components/Filter";
import { AnimatePresence, motion } from "framer-motion";
import { DecimalConverter } from "utils/api";
import { Tx_Refresh_Data_Thunk } from "redux/slices/account/thunks/refresh/txRefresh";
import useLoading from "hooks/useLoading";
import Loader from "components/Loader";
import DateTime from 'date-and-time'
import dateFormat from "dateformat";
import { IAutomationTransfer } from 'hooks/useTransactionProcess'

const Transactions = () => {
    const STABLE_INDEX = 6;
    const accountsRaw = useAppSelector(SelectAccounts)
    const tags = useAppSelector(SelectTags)
    const accounts = accountsRaw.map((a) => a.address)
    const Txs = useAppSelector(SelectCumulativeTxs)
    const streamings = useAppSelector(SelectAlldRecurringTasks)
    const navigate = useRouter()

    const index = navigate.query?.index as string | undefined;

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

    const [datePicker, setDate] = useState<number[]>([]);
    const [selectedTags, setSelectedTags] = useState<string[]>([]);
    const [selectedBudgets, setSelectedBudgets] = useState<string[]>([]);
    const [selectedAccounts, setSelectedAccounts] = useState<string[]>([]);
    const [selectedDirection, setSelectedDirection] = useState<string>("Any");

    const [specificAmount, setSpecificAmount] = useState<number>();
    const [minAmount, setMinAmount] = useState<number>();
    const [maxAmount, setMaxAmount] = useState<number>();

    useEffect(() => {
        setPagination(index ? +index + (STABLE_INDEX - (+index % STABLE_INDEX)) : STABLE_INDEX)
    }, [datePicker, selectedTags, selectedBudgets, selectedAccounts, selectedDirection, specificAmount, minAmount, maxAmount])

    const refreshFn = async () => {
        setDate([])
        setSelectedTags([])
        setSelectedBudgets([])
        setSelectedAccounts([])
        setSelectedDirection("Any")
        setSpecificAmount(undefined)
        setMinAmount(undefined)
        setMaxAmount(undefined)
        await dispatch(Tx_Refresh_Data_Thunk())
    }

    const [refreshLoading, refresh] = useLoading(refreshFn)


    const filterFn = (c: (IFormattedTransaction | ITransactionMultisig)) => {
        const date = datePicker

        if ('tx' in c) {
            const tx = c.tx
            let amount = tx?.amount && tx?.coin ? DecimalConverter(tx.amount, tx.coin.decimals).toFixed(0).length < 18 ? DecimalConverter(tx.amount, tx.coin.decimals) : undefined : undefined
            if (tx.method === ERC20MethodIds.swap) {
                const swap = tx as ISwap
                amount = swap?.amountIn && swap?.coinIn ? DecimalConverter(swap.amountIn, swap.coinIn.decimals) : undefined
            }

            if (selectedDirection !== "Any") {
                if (selectedDirection === "In") return false
                if (selectedDirection === "Out") return true
            }

            if (selectedTags.length > 0 && !c.tags.some(s => selectedTags.includes(s.id))) return false

            if (selectedAccounts.length > 0 && !selectedAccounts.find(s => s.toLowerCase() === c.contractAddress.toLowerCase())) return false

            if (selectedBudgets.length > 0 && !selectedBudgets.some((b) => b === c.budget?.id)) return false

            if (specificAmount && (+(amount ?? 0)) !== specificAmount) return false
            if (minAmount && (+(amount ?? tx?.payments?.reduce((a, c) => a += DecimalConverter(c.amount, c.coin.decimals), 0) ?? 0)) < minAmount) return false
            if (maxAmount && (+(amount ?? tx?.payments?.reduce((a, c) => a += DecimalConverter(c.amount, c.coin.decimals), 0) ?? Number.MAX_VALUE)) > maxAmount) return false
        } else {
            // console.log(selectedAccounts, c.address)
            const tx = c as any
            let amount = tx?.amount && tx?.coin ? DecimalConverter(tx.amount, tx.coin.decimals).toFixed(0).length < 18 ? DecimalConverter(tx.amount, tx.coin.decimals) : undefined : undefined
            if (tx.method === ERC20MethodIds.swap) {
                const swap = tx as ISwap
                amount = swap?.amountIn && swap?.coinIn ? DecimalConverter(swap.amountIn, swap.coinIn.decimals) : undefined
            }

            if (selectedDirection !== "Any") {
                if (selectedDirection === "In" && c.address.toLowerCase() === c.rawData.from.toLowerCase()) return false
                if (selectedDirection === "Out" && c.address.toLowerCase() !== c.rawData.from.toLowerCase()) return false
            }

            if (selectedTags.length > 0 && !c.tags.some(s => selectedTags.includes(s.id))) return false

            if (selectedAccounts.length > 0 && !selectedAccounts.find(s => s.toLowerCase() === c.address.toLowerCase())) return false

            if (selectedBudgets.length > 0 && !selectedBudgets.some((b) => b === c.budget?.id)) return false
            if (tx.method === ERC20MethodIds.repay) console.log(tx?.payments?.reduce((a: number, c: ITransfer) => a += DecimalConverter(c.amount, c.coin.decimals), 0))
            if (specificAmount && (amount ?? 0) !== specificAmount) return false
            if (minAmount && +(amount ?? tx?.payments?.reduce((a: number, c: ITransfer) => a += DecimalConverter(c.amount, c.coin.decimals), 0) ?? 0) < minAmount) return false
            if (maxAmount && +(amount ?? tx?.payments?.reduce((a: number, c: ITransfer) => a += DecimalConverter(c.amount, c.coin.decimals), 0) ?? Number.MAX_VALUE) > maxAmount) return false
        }

        if (date && date.length === 1) {
            const crr = new Date(c.timestamp * 1e3)
            const dateOne = new Date(date[0])
            const prev = new Date(dateOne.getFullYear(), dateOne.getMonth(), dateOne.getDate())
            const next = new Date(DateTime.addDays(dateOne, -1).getFullYear(), DateTime.addDays(dateOne, -1).getMonth(), DateTime.addDays(dateOne, -1).getDay());

            if (crr.getTime() < prev.getTime() || crr.getTime() > next.getTime()) return false
        } else if (date && date.length === 2) {
            const crr = new Date(c.timestamp * 1e3)
            const dateOne = new Date(date[0])
            const dateTwo = new Date(date[1])
            const prev = new Date(dateOne.getFullYear(), dateOne.getMonth(), dateOne.getDate())
            const next = new Date(DateTime.addDays(dateTwo, 1).getFullYear(), DateTime.addDays(dateTwo, 1).getMonth(), DateTime.addDays(dateTwo, 1).getDate())
            console.log(crr.getTime(), prev.getTime(), next.getTime())
            if (crr.getTime() < prev.getTime()) return false
            if (crr.getTime() > next.getTime()) return false
        }

        return true

    }
    const txs = Txs?.filter(filterFn)

    const [filterRef, exceptRef] = useModalSideExit<boolean>(isOpen, setOpen, false)
    return <>
        <div>
            <div className="flex flex-col space-y-5 gap-14" >
                <div>
                    <div className="flex justify-between">
                        <div className="text-2xl font-semibold">Transactions</div>
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
                        <div className="flex space-x-5 items-center">
                            <div className="relative" ref={exceptRef} onClick={() => setOpen(true)}>
                                <div className="cursor-pointer rounded-md dark:bg-darkSecond bg-white border-2 dark:border-gray-500 border-gray-200 px-4 py-2 font-semibold text-sm">
                                    + Add Filter
                                </div>
                                <div ref={filterRef} className="absolute bottom-0 translate-y-full z-[900]">
                                    <AnimatePresence>
                                        {isOpen &&
                                            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: .33 }}>
                                                <Filter
                                                    date={datePicker}
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
                            <div>|</div>
                            <div className="flex space-x-5">
                                {datePicker.length > 0 &&
                                    <div className="flex items-center bg-primary bg-opacity-50 rounded-md py-2 px-2 font-medium text-sm">
                                        <div>{dateFormat(datePicker[0], "mmm dd, yyyy")}</div>
                                        {datePicker.length > 1 && <div>-</div>}
                                        {datePicker.length > 1 && <div>
                                            {dateFormat(datePicker[1], "mmm dd, yyyy")}
                                        </div>}
                                        <div className="pl-3 cursor-pointer" onClick={() => setDate([])}>X</div>
                                    </div>
                                }
                                {selectedTags.length > 0 &&
                                    <div className="flex items-center bg-primary bg-opacity-50 rounded-md py-2 px-2 font-medium text-sm">
                                        <div>Labels ({selectedTags.length})</div>
                                        <div className="pl-3 cursor-pointer" onClick={() => setSelectedTags([])}>X</div>
                                    </div>
                                }
                                {selectedBudgets.length > 0 &&
                                    <div className="flex items-center bg-primary bg-opacity-50 rounded-md py-2 px-2 font-medium text-sm">
                                        <div>Budgets ({selectedBudgets.length})</div>
                                        <div className="pl-3 cursor-pointer" onClick={() => setSelectedBudgets([])}>X</div>
                                    </div>
                                }
                                {selectedAccounts.length > 0 &&
                                    <div className="flex items-center bg-primary bg-opacity-50 rounded-md py-2 px-2 font-medium text-sm">
                                        <div>Accounts ({selectedAccounts.length})</div>
                                        <div className="pl-3 cursor-pointer" onClick={() => setSelectedAccounts([])}>X</div>
                                    </div>
                                }
                                {specificAmount &&
                                    <div className="flex items-center bg-primary bg-opacity-50 rounded-md py-2 px-2 font-medium text-sm">
                                        <div>Amount: {specificAmount}</div>
                                        <div className="pl-3 cursor-pointer" onClick={() => setSpecificAmount(undefined)}>X</div>
                                    </div>
                                }
                                {selectedDirection !== "Any" &&
                                    <div className="flex items-center bg-primary bg-opacity-50 rounded-md py-2 px-2 font-medium text-sm">
                                        <div>Direction: {selectedDirection}</div>
                                        <div className="pl-3 cursor-pointer" onClick={() => setSelectedDirection("Any")}>X</div>
                                    </div>
                                }
                                {
                                    (minAmount || maxAmount) &&
                                    <div className="flex items-center bg-primary bg-opacity-50 rounded-md py-2 px-2 font-medium text-sm">
                                        {!!minAmount && <div>Min: {minAmount}</div>}
                                        {(!!minAmount && !!maxAmount) && <div>-</div>}
                                        {!!maxAmount && <div>Max: {maxAmount}</div>}
                                        <div className="pl-3 cursor-pointer" onClick={() => {
                                            setMinAmount(undefined)
                                            setMaxAmount(undefined)
                                        }}>X</div>
                                    </div>
                                }
                            </div>
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

                                let startDate: string | null = null
                                let endDate: string | null = null

                                if (method === ERC20MethodIds.transfer || method === ERC20MethodIds.transferFrom || method === ERC20MethodIds.transferWithComment
                                    || method === ERC20MethodIds.deposit || method === ERC20MethodIds.withdraw || method === ERC20MethodIds.borrow || method === ERC20MethodIds.repay
                                ) {
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
                                } else if (method === ERC20MethodIds.automatedTransfer) {
                                    const transfer = 'tx' in w ? (w.tx as unknown as IAutomationTransfer) : (w as IAutomationTransfer);
                                    amountCoins = [{ amount: DecimalConverter(transfer.amount, transfer.coin.decimals), coin: transfer.coin.symbol }];
                                    startDate = dateFormat(transfer.startTime * 1e3, "mmm dd, yyyy HH:MM:ss");
                                    endDate = dateFormat(transfer.endTime * 1e3, "mmm dd, yyyy HH:MM:ss");
                                } else if (method === ERC20MethodIds.automatedCanceled) {
                                    const { streamId } = 'tx' in w ? (w.tx as unknown as IAutomationCancel) : (w as IAutomationCancel);
                                    const transfer = streamings.find(s => (s as IAutomationTransfer).streamId === streamId) as IAutomationTransfer;
                                    if (transfer) {
                                        amountCoins = [{ amount: DecimalConverter(transfer.amount, transfer.coin.decimals), coin: transfer.coin.symbol }];
                                        startDate = dateFormat(transfer.startTime * 1e3, "mmm dd, yyyy HH:MM:ss");
                                        endDate = dateFormat(transfer.endTime * 1e3, "mmm dd, yyyy HH:MM:ss");
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
                                    'Status': 'tx' in w ? w.tx.isError ? "Error" : w.isExecuted ? "Success" : w.confirmations.length === 0 ? "Rejected" : "Pending" : w.isError ? "Error" : "Success",
                                    'Sent From:': from,
                                    'Amount:': swapping ? `${swapping.amountIn} ${swapping.amountInCoin} => ${swapping.amountOut} ${swapping.amountOutCoin}` : amountCoins.map(w => `${w.amount} ${w.coin}`).join(',\n'),
                                    'To:': 'tx' in w ? w.tx.to ?? "" : w.rawData.to,
                                    'Date': method === ERC20MethodIds.automatedTransfer ? `${startDate} - ${endDate}` : dateFormat(new Date(timestamp), "mediumDate"),
                                    "Labels": w.tags.join(', '),
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
                                <tr className="pl-5 grid grid-cols-[8.5%,20%,18%,repeat(4,minmax(0,1fr))] text-gray-500 dark:text-gray-300 text-sm font-normal bg-gray-100 dark:bg-darkSecond rounded-md">
                                    <th className="py-3 self-center text-left">Date</th>
                                    <th className="py-3 self-center text-left">Wallet</th>
                                    <th className="py-3 self-center text-left">Type</th>
                                    <th className="py-3 self-center text-left">Amount</th>
                                    <th className="py-3 self-center text-left">Labels</th>
                                    <th className="py-3 self-center text-left">Signatures</th>
                                    <th className="py-3 flex justify-start">
                                        <div onClick={refresh} className="w-28 py-1 px-1 cursor-pointer border border-primary text-primary rounded-md flex items-center justify-center space-x-2">
                                            {!refreshLoading && <div>
                                                <img src="/icons/refresh_primary.png" alt="" className="w-3 h-3" />
                                            </div>}
                                            <span className="tracking-wider">
                                                {refreshLoading ? <><Loader /></> : "Refresh"}
                                            </span>
                                        </div>
                                    </th>
                                </tr>
                                {txs.slice(pagination - STABLE_INDEX, pagination).map((tx, i) => {
                                    if ((tx as IFormattedTransaction)['hash']) {
                                        const address = (tx as IFormattedTransaction).address;
                                        const account = accountsRaw.find(s => s.address.toLowerCase() === address.toLowerCase())
                                        const txData = (tx as IFormattedTransaction)
                                        return <SingleTxContainer isDetailOpen={!!index} txIndexInRemoxData={i + (pagination - STABLE_INDEX)} tags={tags} blockchain={blockchain} key={`${txData.address}${txData.rawData.hash}`} selectedAccount={account} transaction={txData} accounts={accounts} color={"bg-white dark:bg-darkSecond"} />
                                    } else {
                                        const txData = (tx as ITransactionMultisig)
                                        const account = accountsRaw.find(s => s.address.toLowerCase() === txData.contractAddress.toLowerCase())
                                        const isSafe = "safeTxHash" in txData
                                        let directionType = TransactionDirectionDeclare(txData, accounts);
                                        return <MultisigTx isDetailOpen={!!index} txPositionInRemoxData={i + (pagination - STABLE_INDEX)} tags={tags} blockchain={blockchain} direction={directionType} account={account} key={txData.contractAddress + txData.hashOrIndex} address={address} tx={tx as ITransactionMultisig} />
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

interface IProps { isDetailOpen?: boolean, transaction: IFormattedTransaction, accounts: string[], selectedAccount?: IAccountORM, color: string, tags: ITag[], blockchain: BlockchainType, txIndexInRemoxData: number }

export const SingleTxContainer = forwardRef<HTMLDivElement, IProps>(({ transaction, accounts, selectedAccount, blockchain, tags, txIndexInRemoxData, isDetailOpen }, ref) => {
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
        {isBatch && TXs.map((s, i) => <SingleTransactionItem isDetailOpen={isDetailOpen} txPositionInRemoxData={txIndexInRemoxData} tags={tags} blockchain={blockchain} account={selectedAccount} key={`${transaction.address}${transaction.hash}${i}`} date={transaction.rawData.timeStamp} transaction={s} direction={directionType} status={TransactionStatus.Completed} isMultiple={isBatch} />)}
        {!isBatch && <SingleTransactionItem isDetailOpen={isDetailOpen} txPositionInRemoxData={txIndexInRemoxData} tags={tags} blockchain={blockchain} account={selectedAccount} key={`${transaction.address}${transaction.hash}`} date={transaction.rawData.timeStamp} transaction={transaction} direction={directionType} status={TransactionStatus.Completed} isMultiple={isBatch} />}
    </>
})

