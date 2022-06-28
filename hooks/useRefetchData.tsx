import useContributors from 'rpcHooks/useContributors'
import { useEffect, useState } from 'react'
import { useDispatch } from 'react-redux'
import { setContributors } from 'redux/reducers/contributors'
import useCurrency from '../rpcHooks/useCurrency'
import { IBalanceMembers, setOrderBalance, updateAllCurrencies, updateTotalBalance, updateUserBalance } from '../redux/reducers/currencies'
import { SelectSelectedAccount } from '../redux/reducers/selectedAccount'
import { setParsedTransactions } from '../redux/reducers/transactions'
import useRequest from 'rpcHooks/useRequest'
import { addRequests } from 'redux/reducers/requests'
import { useListenTags } from 'rpcHooks/useTags'
import { setTags } from 'redux/reducers/tags'
import useWalletKit from './walletSDK/useWalletKit'
import { IFormattedTransaction } from './useTransactionProcess'
import useInsight from 'rpcHooks/useInsight'
import { setAccountStats } from 'redux/reducers/accountstats'
import { useLazyGetAccountBalancePriceQuery, useLazyGetAccountTransactionsQuery } from 'redux/api'
import { auth } from 'firebaseConfig'
import useNextSelector from './useNextSelector'
import useAsyncEffect from './useAsyncEffect'

const useRefetchData = () => {
    const dispatch = useDispatch()

    const selectedAccount = useNextSelector(SelectSelectedAccount)
    const [accounts, setAccounts] = useState<string[]>(selectedAccount ? [selectedAccount] : [])
    useEffect(() => setAccounts(selectedAccount ? [selectedAccount] : []), [selectedAccount])

    const [txsFetch] = useLazyGetAccountTransactionsQuery()
    const [balanceFetch] = useLazyGetAccountBalancePriceQuery()

    const fetchedCurrencies = useCurrency()
    const contributors = useContributors()
    const { data } = useRequest()
    // const { setGenLoading } = useRequestHook()

    const tagData = useListenTags()
    const { blockchain } = useWalletKit()
    const [txs, setTxs] = useState<IFormattedTransaction[]>([])

    const insight = useInsight({ selectedDate: 0, selectedAccounts: accounts })

    const [isTxDone, setTxDone] = useState<boolean>(false)
    const [isBalanceDone, setBalanceDone] = useState<boolean>(false)

    // useEffect(() => {
    //     if (selectedAccount) {
    //         setAccounts([selectedAccount])
    //     }
    // }, [selectedAccount])

    useEffect(() => { if (!insight.isLoading) dispatch(setAccountStats(insight)) }, [insight])


    useEffect(() => { if (data) setTimeout(() => { dispatch(addRequests(data!.requests)) }, 1500) }, [data])

    useEffect(() => {
        if (txs) {
            dispatch(setParsedTransactions(txs))
            setTxDone(true)
        }
    }, [txs])

    useEffect(() => { if (contributors) setTimeout(() => { dispatch(setContributors({ data: contributors })) }, 1500) }, [contributors])

    useEffect(() => {
        if (tagData && tagData?.tags && tagData?.tags.length > 0) {
            setTimeout(() => {
                dispatch(setTags(tagData.tags))
            }, 1500)
        }
    }, [tagData])

    useAsyncEffect(async () => {
        if (selectedAccount) {
            const response = await balanceFetch({ addresses: ["0x246f4599efd3fa67ac44335ed5e749e518ffd8bb"], blockchain: blockchain }).unwrap();
            const prices = response.AllPrices
            const totalBalance = response.TotalBalance
            dispatch(updateTotalBalance(totalBalance))
            dispatch(updateUserBalance(prices))
            dispatch(setOrderBalance(Object.values(prices as IBalanceMembers).sort((a, b) => (b.amount * b.tokenPrice).toLocaleString().localeCompare((a.amount * a.tokenPrice).toLocaleString()))))
            setBalanceDone(true)
        }
    }, [selectedAccount])

    useEffect(() => { fetching() }, [fetchedCurrencies, selectedAccount])

    const fetching = async () => {
        if (fetchedCurrencies && fetchedCurrencies.length > 0) {
            dispatch(updateAllCurrencies(
                fetchedCurrencies
            ))
        }

    }

    useEffect(() => {
        if (selectedAccount) {
            txsFetch({ addresses: [selectedAccount], blockchain: blockchain, authId: auth.currentUser?.uid }).unwrap().then((res) => {
                setTxs(res)
            }).catch((error) => { console.error(error) })
        }
    }, [selectedAccount])

    return { fetching, isAppLoaded: isTxDone && isBalanceDone };
}

export default useRefetchData;
