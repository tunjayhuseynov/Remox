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


const TransactionHistory = ({ transactions }: { transactions: IFormattedTransaction[] }) => {

    const selectedAccount = useAppSelector(SelectSelectedAccount)


    return <div className="flex flex-col shadow-custom max-h-full px-5 pt-5 pb-4 rounded-xl">
        <div className="flex justify-between">
            <div className="font-semibold text-lg text-black tracking-wide">Recent Transactions</div>
            <div><Link to="/dashboard/transactions" className="text-primary border border-primary px-10 py-2 rounded-xl">View All</Link></div>
        </div>
        <div className="grid grid-cols-1 pt-5">
            {transactions && transactions.slice(0, 7).map((transaction, index) => {
                const direction = transaction.rawData.from.toLowerCase() === selectedAccount.toLowerCase()
                const isSwap = transaction.id === ERC20MethodIds.swap
                const transactionCount = transaction.id === ERC20MethodIds.batchRequest ? (transaction as IBatchRequest).payments.length : 1
                return <Fragment key={transaction.rawData.hash}>
                    <Accordion grid={"grid-cols-[25%,45%,30%] sm:grid-cols-[27%,33%,15%,15%]"} direction={isSwap ? TransactionDirection.Swap : direction ? TransactionDirection.Out : TransactionDirection.In} date={transaction.rawData.timeStamp} dataCount={transactionCount} status={TransactionStatus.Completed}>
                        <div>
                            <TransactionItem transaction={transaction} isMultiple={transactionCount > 1} />
                        </div>
                    </Accordion>
                </Fragment>
            })}
        </div>
    </div>

}



export default TransactionHistory;