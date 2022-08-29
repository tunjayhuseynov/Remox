import _ from "lodash";
// import { TransactionHook, TransactionHookByDateInOut } from '../../../hooks/useTransactionProcess'
import { IFormattedTransaction } from "hooks/useTransactionProcess";
import { useAppSelector } from "redux/hooks";
import Button from "components/button";
import { ProcessAccordion } from "components/accordion";
import { useRouter } from "next/router";
import { useState } from "react";
import { SelectAccounts } from "redux/slices/account/selector";


const TransactionHistory = ({ transactions }: { transactions: IFormattedTransaction[] }) => {

    const selectedAccount = useAppSelector(SelectAccounts)
    const [accounts] = useState<string[]>(selectedAccount.map(s => s.address))
    const router = useRouter()

    return <div className="flex flex-col shadow-custom bg-white dark:bg-darkSecond max-h-full px-5 pt-5 pb-4 rounded-xl">
        <div className="flex justify-between">
            <div className="font-semibold text-lg tracking-wide">Recent Transactions</div>
            <div>
                <Button version="second" className="px-10 !py-2" onClick={() => router.push("/dashboard/transactions")}>
                    View All
                </Button>
            </div>
        </div>
        <div className="grid grid-cols-1 pt-5">
            {transactions && transactions.slice(0, 7).map((transaction, index) => ProcessAccordion(transaction, accounts, "grid-cols-[25%,50%,25%] lg:grid-cols-[]", "bg-light dark:bg-dark"))}
        </div>
    </div>

}


export default TransactionHistory;



