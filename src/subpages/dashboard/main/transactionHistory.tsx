import TransactionItem from "../../../components/transactionItem";
import { Link } from "react-router-dom";
import _ from "lodash";
// import { TransactionHook, TransactionHookByDateInOut } from '../../../hooks/useTransactionProcess'
import { Fragment } from "react";
import Accordion from "../../../components/accordion";
import { TransactionDirection, TransactionStatus } from "../../../types";
import { ERC20MethodIds, IBatchRequest, IFormattedTransaction } from "hooks/useTransactionProcess";
import { useAppSelector } from "redux/hooks";
import { SelectSelectedAccount } from "redux/reducers/selectedAccount";
import Button from "components/button";


const TransactionHistory = ({ transactions }: { transactions: IFormattedTransaction[] }) => {

    const selectedAccount = useAppSelector(SelectSelectedAccount)


    return <div className="flex flex-col shadow-custom dark:bg-darkSecond max-h-full px-5 pt-5 pb-4 rounded-xl">
        <div className="flex justify-between">
            <div className="font-semibold text-lg tracking-wide">Recent Transactions</div>
            <div><Link to="/dashboard/transactions" >
                <Button version="second" className="px-10 py-2">
                    View All
                </Button>
            </Link></div>
        </div>
        <div className="grid grid-cols-1 pt-5">
            {transactions && transactions.slice(0, 7).map((transaction, index) => {
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
                            payments: value
                        }
                        TXs.push(tx)
                    })
                } else {
                    TXs.push(transaction)
                }
                const transactionCount = transaction.id === ERC20MethodIds.batchRequest ? TXs.length : 1
                return <Fragment key={transaction.rawData.hash}>
                    <Accordion grid={"grid-cols-[25%,45%,30%] lg:grid-cols-[]"} direction={isSwap ? TransactionDirection.Swap : direction ? TransactionDirection.Out : TransactionDirection.In} date={transaction.rawData.timeStamp} dataCount={transactionCount} status={TransactionStatus.Completed}>
                        <div>
                            {TXs.map((s, i) => <TransactionItem key={`${transaction.hash}${i}`} transaction={s} isMultiple={s.id === ERC20MethodIds.batchRequest} />)}
                        </div>
                    </Accordion>
                </Fragment>
            })}
        </div>
    </div>

}



export default TransactionHistory;