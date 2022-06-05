import { getAuth } from "firebase/auth";
import { auth } from "firebaseConfig";
import { useEffect, useState } from "react";
import { useLazyGetAccountTransactionsQuery } from "redux/api/remox";
import useAsyncEffect from "./useAsyncEffect";
import { IFormattedTransaction } from "./useTransactionProcess";
import useWalletKit from "./walletSDK/useWalletKit";

export default function useTransaction(accounts: string[]) {
    const { blockchain } = useWalletKit()
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


    useAsyncEffect(async () => {
        try {
            if (accounts.length === 0) throw new Error("No accounts")
            const txs = await MultipleTransaction()
            setTxs(txs)
        } catch (error) {
            console.error(error)
            setTxs([])
        }
    }, [accounts])

    return { MultipleTransaction, list: txs }
}
