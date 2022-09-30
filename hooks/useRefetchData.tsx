import { useEffect, useState } from 'react'
import { useDispatch } from 'react-redux'
import useCurrency from '../rpcHooks/useCurrency'
import useWalletKit from './walletSDK/useWalletKit'
import { useLazyGetAccountBalancePriceQuery } from 'redux/api'
import useAsyncEffect from './useAsyncEffect'
import { useAppSelector } from 'redux/hooks'
import { SelectProviderAddress, updateAllCurrencies, updateUserBalance } from 'redux/slices/account/remoxData'

const useRefetchData = () => {
    const dispatch = useDispatch()

    const selectedAccount = useAppSelector(SelectProviderAddress)

    const [balanceFetch] = useLazyGetAccountBalancePriceQuery()

    const { blockchain } = useWalletKit()

    const fetchedCurrencies = useCurrency(blockchain.currencyCollectionName)


    const [isBalanceDone, setBalanceDone] = useState<boolean>(false)


    // useAsyncEffect(async () => {
    //     if (selectedAccount) {
    //         const response = await balanceFetch({ addresses: [selectedAccount], blockchain: blockchain.name }).unwrap();
    //         const prices = response.AllPrices
    //         const totalBalance = response.TotalBalance
    //         dispatch(updateTotalBalance(totalBalance))
    //         dispatch(updateUserBalance(prices))
    //         setBalanceDone(true)
    //     }
    // }, [selectedAccount])

    useEffect(() => { fetching() }, [fetchedCurrencies, selectedAccount])

    const fetching = async () => {
        if (fetchedCurrencies && fetchedCurrencies.length > 0) {
            dispatch(updateAllCurrencies(
                fetchedCurrencies
            ))
        }

    }

    return { fetching, isAppLoaded: isBalanceDone };
}

export default useRefetchData;
