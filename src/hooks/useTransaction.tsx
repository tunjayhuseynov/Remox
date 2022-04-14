import { useEffect, useState } from "react";
import { useLazyGetTransactionsQuery } from "redux/api"
import { GetTransactions, Transactions } from "types/sdk";
import useTransactionProcess from "./useTransactionProcess";

export default function useTransaction(accounts: string[]) {

    const [transactionTrigger, { data: transactionData, isFetching: transactionFetching }] = useLazyGetTransactionsQuery()

    const MultipleTransaction = async () => {
        const list = []
        for (let index = 0; index < accounts.length; index++) {
            const element = accounts[index];
            const txs = await transactionTrigger(element).unwrap()
            list.push(txs)
        }

        return list;
    }

    const [txs, setTxs] = useState<Transactions[]>()
    const [list, transactions] = useTransactionProcess(txs)

    useEffect(() => {
        (
            async () => {
                const txs = await MultipleTransaction()
                setTxs(txs.reduce((a, c) => Object.assign(a, c.result), []))
            }
        )()
    }, [accounts])

    return { MultipleTransaction, list, transactionData, transactionFetching }
}
