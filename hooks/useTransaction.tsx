import { getAuth } from "firebase/auth";
import { useEffect, useState } from "react";
import { useLazyGetAccountTransactionsQuery } from "redux/api/remox";
import { IFormattedTransaction } from "./useTransactionProcess";
import useWalletKit from "./walletSDK/useWalletKit";

export default function useTransaction(accounts: string[]) {
    const { blockchain } = useWalletKit()
    const auth = getAuth()
    const [fetch] = useLazyGetAccountTransactionsQuery()

    const MultipleTransaction = async () => {
        try {
            const txs = await fetch({ addresses: accounts, authId: auth.currentUser?.uid, blockchain }).unwrap()
            return txs;
        } catch (error) {
            throw new Error(error as any)
        }
    }

    const [txs, setTxs] = useState<IFormattedTransaction[]>()


    useEffect(() => {
        (
            async () => {
                try {
                    const txs = await MultipleTransaction()
                    setTxs(txs)
                } catch (error) {
                    console.error(error)
                    setTxs([])
                }
            }
        )()
    }, [accounts])

    return { MultipleTransaction, list: txs }
}
