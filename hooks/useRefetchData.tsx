import useContributors from 'apiHooks/useContributors'
import { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { setContributors } from 'redux/reducers/contributors'
import useCurrency from '../apiHooks/useCurrency'
import { IBalanceMembers, setOrderBalance, updateAllCurrencies, updateTotalBalance, updateUserBalance } from '../redux/reducers/currencies'
import { SelectSelectedAccount } from '../redux/reducers/selectedAccount'
import { selectStorage } from '../redux/reducers/storage'
import { SelectParsedTransactions, setParsedTransactions, setTransactions } from '../redux/reducers/transactions'
import useRequest from 'apiHooks/useRequest'
import useRequestHook from 'hooks/useRequest'
import { addRequests } from 'redux/reducers/requests'
import { useListenTags } from 'apiHooks/useTags'
import { setTags } from 'redux/reducers/tags'
import useWalletKit, { BlockchainType } from './walletSDK/useWalletKit'
import axios from 'axios'
import { IFormattedTransaction } from './useTransactionProcess'
import { getAuth } from 'firebase/auth'
import useInsight from 'apiHooks/useInsight'
import { setAccountStats } from 'redux/reducers/accountstats'
import { useLazyGetAccountBalancePriceQuery, useLazyGetAccountTransactionsQuery } from 'redux/api'

const useRefetchData = () => {
    const dispatch = useDispatch()
    const storage = useSelector(selectStorage)
    const selectedAccount = useSelector(SelectSelectedAccount)
    const [accounts, setAccounts] = useState<string[]>([selectedAccount])

    const [txsFetch] = useLazyGetAccountTransactionsQuery()
    const [balanceFetch] = useLazyGetAccountBalancePriceQuery()

    const fetchedCurrencies = useCurrency()
    const contributors = useContributors()
    const { data } = useRequest()
    // const { setGenLoading } = useRequestHook()

    const tagData = useListenTags()
    const auth = getAuth()
    const { Address, blockchain } = useWalletKit()
    const [txs, setTxs] = useState<IFormattedTransaction[]>([])

    const insight = useInsight({ selectedDate: 0, selectedAccounts: accounts })

    const [isTxDone, setTxDone] = useState<boolean>(false)
    const [isBalanceDone, setBalanceDone] = useState<boolean>(false)

    useEffect(() => {
        if (selectedAccount) {
            setAccounts([selectedAccount])
        }
    }, [selectedAccount])

    useEffect(() => {
        if (!insight.isLoading) {
            dispatch(setAccountStats(insight))
        }
    }, [insight])


    useEffect(() => {
        if (data) {
            setTimeout(() => {
                dispatch(addRequests(data!.requests))
            }, 1500)
        }
    }, [data])

    useEffect(() => {
        if (txs && txs.length > 0) {
            dispatch(setParsedTransactions(txs))
            setTxDone(true)
        }
    }, [txs])

    useEffect(() => {
        if (contributors) {
            setTimeout(() => {
                dispatch(setContributors({ data: contributors, secretKey: storage?.encryptedMessageToken }))
            }, 1500)
        }
    }, [contributors])

    useEffect(() => {
        if (tagData && tagData?.tags && tagData?.tags.length > 0) {
            setTimeout(() => {
                dispatch(setTags(tagData.tags))
            }, 1500)
        }
    }, [tagData])

    useEffect(() => {
        balanceFetch({ addresses: accounts, blockchain: blockchain }).unwrap().then(response => {
            const prices = response.AllPrices
            const totalBalance = response.TotalBalance
            dispatch(updateTotalBalance(totalBalance))
            dispatch(updateUserBalance(prices))
            dispatch(setOrderBalance(Object.values(prices as IBalanceMembers).sort((a, b) => (b.amount * b.tokenPrice).toLocaleString().localeCompare((a.amount * a.tokenPrice).toLocaleString()))))
            setBalanceDone(true)
        })
    }, [accounts])

    useEffect(() => {
        fetching()
    }, [fetchedCurrencies, selectedAccount])

    const fetching = async () => {
        if (fetchedCurrencies && fetchedCurrencies.length > 0) {
            dispatch(updateAllCurrencies(
                fetchedCurrencies
            ))
        }

    }

    useEffect(() => {
        if (Address) {
            txsFetch({ addresses: accounts, blockchain: blockchain, authId: auth.currentUser?.uid }).unwrap().then((res) => {
                setTxs(res)
            }).catch((error) => { console.error(error) })
        }
    }, [selectedAccount])

    return { fetching, isAppLoaded: isTxDone && isBalanceDone };
}

export default useRefetchData;
