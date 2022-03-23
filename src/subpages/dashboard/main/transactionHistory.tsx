import { Link } from "react-router-dom";
import _ from "lodash";
// import { TransactionHook, TransactionHookByDateInOut } from '../../../hooks/useTransactionProcess'
import { IFormattedTransaction } from "hooks/useTransactionProcess";
import { useAppSelector } from "redux/hooks";
import { SelectSelectedAccount } from "redux/reducers/selectedAccount";
import Button from "components/button";
import { ProcessAccordion } from "pages/dashboard/transactions";


const TransactionHistory = ({ transactions }: { transactions: IFormattedTransaction[] }) => {

    const selectedAccount = useAppSelector(SelectSelectedAccount)


    return <div className="flex flex-col shadow-custom bg-white dark:bg-darkSecond max-h-full px-5 pt-5 pb-4 rounded-xl">
        <div className="flex justify-between">
            <div className="font-semibold text-lg tracking-wide">Recent Transactions</div>
            <div><Link to="/dashboard/transactions" >
                <Button version="second" className="px-10 py-2">
                    View All
                </Button>
            </Link></div>
        </div>
        <div className="grid grid-cols-1 pt-5">
            {transactions && transactions.slice(0, 7).map((transaction, index) => ProcessAccordion(transaction, selectedAccount, "grid-cols-[25%,50%,25%] lg:grid-cols-[]"))}
        </div>
    </div>

}



export default TransactionHistory;



