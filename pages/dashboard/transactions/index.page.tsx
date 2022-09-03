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
import { SelectCumlativeTxs as SelectCumulativeTxs, SelectDarkMode, SelectProviderAddress, SelectTransactions } from "redux/slices/account/remoxData";
import { IMultisigSafeTransaction, ITransactionMultisig } from "hooks/walletSDK/useMultisig";
import Loader from "components/Loader";
import { motion } from "framer-motion"
import useAsyncEffect from "hooks/useAsyncEffect";
import Filter from "./_components/filter";
import SingleTransactionItem from "./_components/SingleTransactionItem";
import MultisigTx from "./_components/MultisigTransactionItem";

const Transactions = () => {
    const selectedAccount = useAppSelector(SelectProviderAddress)
    const Txs = useAppSelector(SelectCumulativeTxs)
    const router = useRouter()
    const { type } = router.query as { type: string[] | undefined }
    const { GetCoins, fromMinScale, Address } = useWalletKit()
    const darkMode = useSelector(SelectDarkMode)
    const [isOpen, setOpen] = useState(false)
    const [isPending, startTransition] = useTransition()

    const [pagination, setPagination] = useState(20)

    const [address, setAddress] = useState<string>()

    useAsyncEffect(async () => {
        const val = await Address
        if (val) setAddress(val)
    }, [Address])

    const { ref } = useInView({
        onChange: (inView) => {
            if (inView && Txs.length > pagination) {
                startTransition(() => { setPagination(pagination + 20) })
            }
        }
    })

    const list = useAppSelector(SelectTransactions)

    const [changedAccount, setChangedAccount] = useState<string[]>([])
    const [filterRef, exceptRef] = useModalSideExit<boolean>(isOpen, setOpen, false)
    return <>
        <div>
            <div className="flex flex-col space-y-5 gap-14" >
                <div className="flex justify-between">
                    <div className="text-3xl font-bold">Transactions</div>
                    <div className="flex gap-2">
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
                </div>
                {/* <div className="flex  py-2 w-full ">
                    <AnimatedTabBar data={data} index={0} />
                </div> */}
                <div className="!mt-0">
                    <div className="w-full  pb-3 rounded-xl" >
                        <div id="header" className="grid grid-cols-[25%,45%,30%] sm:grid-cols-[20%,15%,12%,18%,25%,10%] border-b dark:border-greylish  pb-3 " >
                            <div className="text-base font-medium pt-2">Wallet</div>
                            <div className="text-base font-medium pt-2">Budget</div>
                            <div className="text-base  font-medium pt-2">Type</div>
                            <div className="text-base sm:text-base font-medium pt-2">Amount</div>
                            <div className="text-base font-medium pt-2">Labels</div>
                            {/* <div className="font-medium hidden md:block pt-2">{page !== "completed" ? "Signatures" : "Details"}</div> */}
                            <div className="py-1 px-2 cursor-pointer border border-primary text-primary rounded-lg flex items-center justify-center gap-2"> <img src="/icons/refresh_primary.png" alt="" className="w-4 h-4" /> Refresh</div>
                        </div>
                        <div>
                            {Txs?.slice(0, pagination).map((tx, index, arr) => {
                                let obj: { ref?: any } = {}
                                if (arr.length - 10 === index) {
                                    obj['ref'] = ref
                                }
                                if ((tx as IFormattedTransaction)['hash']) {
                                    const txData = (tx as IFormattedTransaction)
                                    return <ProcessAccordion {...obj} key={txData.rawData.hash} transaction={txData} accounts={changedAccount} grid={"grid-cols-[25%,45%,30%] sm:grid-cols-[18%,30%,30%,22%]"} color={"bg-white dark:bg-darkSecond"} />
                                } else {
                                    const txData = (tx as ITransactionMultisig | IMultisigSafeTransaction)
                                    const isSafe = "safeTxHash" in txData
                                    return <MultisigTx key={isSafe ? txData.safeTxHash : txData.contractAddress + txData.hashOrIndex}  {...obj} Address={address} GetCoins={GetCoins} tx={tx as ITransactionMultisig} />
                                }
                            })}
                        </div>
                        {
                            isPending && <div className="py-5 text-center">
                                <Loader />
                            </div>
                        }
                        {/* <div ref={ref}>
                            {page === "completed" && list.slice(0, pagination).map(s => ProcessAccordion(s, changedAccount, "grid-cols-[25%,45%,30%] sm:grid-cols-[22%,26%,30%,22%]", "bg-white dark:bg-darkSecond"))}
                        </div> */}
                    </div>
                </div>
            </div>

        </div>
    </>
}


export default Transactions;

export const ProcessAccordion = forwardRef<HTMLDivElement, { transaction: IFormattedTransaction, accounts: string[], grid: string, color: string }>(({ transaction, accounts, grid, color }, ref) => {
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

    return <Fragment>
        <Accordion ref={ref} grid={grid} color={color} direction={directionType} date={transaction.rawData.timeStamp} dataCount={transactionCount} status={TransactionStatus.Completed}>
            <div>
                {isBatch && TXs.map((s, i) => <SingleTransactionItem key={`${transaction.hash}${i}`} date={transaction.rawData.timeStamp} transaction={s} direction={directionType} status={TransactionStatus.Completed} isMultiple={isBatch} />)}
                {!isBatch && <SingleTransactionItem key={`${transaction.hash}`} date={transaction.rawData.timeStamp} transaction={transaction} direction={directionType} status={TransactionStatus.Completed} isMultiple={isBatch} />}
            </div>
        </Accordion>
    </Fragment>
})

