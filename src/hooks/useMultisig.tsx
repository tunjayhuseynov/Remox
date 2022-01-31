import { useCallback, useEffect, useState } from "react"
import { useDispatch, useSelector } from "react-redux"
import { selectMultisigTransactions, setTransactions } from "../redux/reducers/multisig"
import { SelectSelectedAccount } from '../redux/reducers/selectedAccount'
import { selectStorage } from "../redux/reducers/storage"
import useFetchMultisig from '../API/useMultisig'

const useMultisig = () => {
    let selectedAccount = useSelector(SelectSelectedAccount)
    const storage = useSelector(selectStorage)
    const multiSlice = useSelector(selectMultisigTransactions)

    const [owners, setOwners] = useState<string[]>()
    const [signAndInternal, setSignAndInternal] = useState<{
        sign: number;
        internalSigns: number;
    }>()

    const { transactions, FetchTransactions, isLoading, addOwner, replaceOwner, changeSigns, removeOwner, getOwners, getSignAndInternal } = useFetchMultisig()

    const isMultisig = selectedAccount.toLowerCase() !== storage!.accountAddress.toLowerCase()

    const dispatch = useDispatch()

    const fetchTxs = useCallback((disabledTransactionDispatch = false, skip = 0, take = 10) => {
        if (!disabledTransactionDispatch) dispatch(setTransactions([]))
        FetchTransactions(selectedAccount, skip, take)
    }, [isMultisig, selectedAccount])

    useEffect(() => {
        if (transactions) {
            if (transactions.length === 0) {
                dispatch(setTransactions(undefined))
            } else if (!multiSlice?.some(s => s.id === transactions[transactions.length - 1]?.id)) {
                dispatch(setTransactions(transactions))
            }
        }
    }, [transactions])

    useEffect(() => {
        if (isMultisig) {
            getOwners().then((owners) => setOwners(owners))
            fetchTxs()
            getSignAndInternal().then((signAndInternal) => setSignAndInternal(signAndInternal))
        }
    }, [selectedAccount])

    const refetch = (disabledTransactionDispatch = false, skip = 0, take = 10) => {
        fetchTxs(disabledTransactionDispatch, skip, take)
        // fetch({ address: selectedAccount })
        // signFethch({ address: selectedAccount })
        getSignAndInternal()
    }



    return { transactions, isMultisig, isLoading, fetchTxs, refetch, owners, signAndInternal, addOwner, replaceOwner, changeSigns, removeOwner, }
}

export default useMultisig;