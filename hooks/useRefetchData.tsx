import { useEffect, useState } from 'react'
import { useDispatch } from 'react-redux'
import useCurrency from '../rpcHooks/useCurrency'
import { IBalanceMembers, setOrderBalance, updateAllCurrencies, updateTotalBalance, updateUserBalance } from '../redux/slices/currencies'
import useRequest from 'rpcHooks/useRequest'
import { addRequests } from 'redux/slices/requests'
import { setTags } from 'redux/slices/tags'
import useWalletKit from './walletSDK/useWalletKit'
import { useLazyGetAccountBalancePriceQuery } from 'redux/api'
import useAsyncEffect from './useAsyncEffect'
import { useAppSelector } from 'redux/hooks'
import { SelectProviderAddress } from 'redux/slices/account/remoxData'

const useRefetchData = () => {
    const dispatch = useDispatch()

    const selectedAccount = useAppSelector(SelectProviderAddress)

    const [balanceFetch] = useLazyGetAccountBalancePriceQuery()

    const fetchedCurrencies = useCurrency()

    const { blockchain } = useWalletKit()

    const [isBalanceDone, setBalanceDone] = useState<boolean>(false)


    useAsyncEffect(async () => {
        if (selectedAccount) {
            const response = await balanceFetch({ addresses: [selectedAccount], blockchain: blockchain }).unwrap();
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

    return { fetching, isAppLoaded: isBalanceDone };
}

export default useRefetchData;
