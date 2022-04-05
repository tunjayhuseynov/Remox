import useContributors from 'API/useContributors'
import { useCallback, useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { selectContributors, setContributors } from 'redux/reducers/contributors'
import useBalance from '../API/useBalance'
import useCurrency from '../API/useCurrency'
import { useLazyGetTransactionsQuery } from '../redux/api'
import { updateAllCurrencies, updateTotalBalance, updateUserBalance } from '../redux/reducers/currencies'
import { SelectSelectedAccount } from '../redux/reducers/selectedAccount'
import { selectStorage } from '../redux/reducers/storage'
import { SelectTransactions, setTransactions } from '../redux/reducers/transactions'
import useRequest from 'API/useRequest'
import useRequestHook from 'hooks/useRequest'
import { addRequests } from 'redux/reducers/requests'
import { useListenTags } from 'API/useTags'
import { setTags } from 'redux/reducers/tags'
import useCalculation from './useCalculation'
import useWalletKit from './useWalletKit'

const useRefetchData = () => {
    const dispatch = useDispatch()
    const storage = useSelector(selectStorage)
    const selectedAccount = useSelector(SelectSelectedAccount)
    const transactionStore = useSelector(SelectTransactions)

    const fetchedCurrencies = useCurrency()
    const contributors = useContributors()
    const { data } = useRequest()
    const { setGenLoading } = useRequestHook()
    const { fetchBalance, fetchedBalance, isLoading: balanceLoading } = useBalance(selectedAccount)
    const tagData = useListenTags()

    const { GetTransactions, txs } = useWalletKit()
    // const [transactionTrigger, { data: transactionData, isFetching: transactionFetching }] = useLazyGetTransactionsQuery()

    const { AllPrices, TotalBalance } = useCalculation(fetchedBalance, fetchedCurrencies)

    useEffect(() => {
        if (data) {
            setTimeout(() => {
                dispatch(addRequests(data!.requests))
            }, 1500)
        }
    }, [data])

    useEffect(() => {
        if (txs && txs.length > 0) {
            if (transactionStore?.[0]?.hash !== txs[0]?.hash || transactionStore?.[transactionStore.length - 1]?.hash !== txs[txs.length - 1]?.hash) {
                dispatch(setTransactions(txs))
            }
        } else if (txs && txs.length === 0) dispatch(setTransactions(txs))
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
        if (fetchedCurrencies && fetchedCurrencies.length > 0 && ((storage?.accountAddress === selectedAccount && fetchedBalance && !balanceLoading) || (storage?.accountAddress !== selectedAccount))) {

            if (fetchedBalance && !balanceLoading) {
                let balance = fetchedBalance as { [name: string]: string; } | undefined;

                if (balance) {

                    const prices = AllPrices()
                    const totalBalance = TotalBalance()

                    dispatch(updateTotalBalance(totalBalance))

                    setTimeout(() => {
                        dispatch(updateUserBalance(prices))
                    }, 1000);
                }
            }
        }

    }, [fetchedBalance, balanceLoading])

    useEffect(() => {
        fetching()
    }, [fetchedCurrencies, selectedAccount])

    const fetching = async () => {
        if (fetchedCurrencies && fetchedCurrencies.length > 0) {
            dispatch(updateAllCurrencies(
                fetchedCurrencies
            ))
            //dispatch(updateTotalBalance(undefined))
            fetchBalance().catch(() => {
                fetchBalance().catch((error) => { console.error(error) })
            })
        }

    }

    useEffect(() => {
        let timer = setInterval(() => {
            GetTransactions()
        }, 10000)

        return () => { clearInterval(timer) }
    }, [selectedAccount])

    return [fetching];
}

export default useRefetchData;