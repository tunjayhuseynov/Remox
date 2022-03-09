import useContributors from 'API/useContributors'
import { useCallback, useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { selectContributors, setContributors } from 'redux/reducers/contributors'
import { setTimeout } from 'timers'
import useBalance from '../API/useBalance'
import useCurrency from '../API/useCurrency'
import { useLazyGetTransactionsQuery } from '../redux/api'
import { updateAllCurrencies, updateTotalBalance, updateUserBalance } from '../redux/reducers/currencies'
import { SelectSelectedAccount } from '../redux/reducers/selectedAccount'
import { selectStorage } from '../redux/reducers/storage'
import { SelectTransactions, setTransactions } from '../redux/reducers/transactions'
import { AltCoins, Coins } from '../types/coins'
import useRequest from 'API/useRequest'
import useRequestHook from 'hooks/useRequest'
import { addRequests } from 'redux/reducers/requests'
import { useListenTags } from 'API/useTags'
import { setTags } from 'redux/reducers/tags'

interface Balance {
    [name: string]: string;
}

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

    const [transactionTrigger, { data: transactionData, isFetching: transactionFetching }] = useLazyGetTransactionsQuery()

    useEffect(() => {
        if (data) {
            setTimeout(() => {
                dispatch(addRequests(data!.requests))
            }, 1500)
        }
    }, [data])

    useEffect(() => {
        if (transactionData && transactionData.result.length > 0 && !transactionFetching) {
            if (transactionStore?.result[0]?.hash !== transactionData.result[0]?.hash || transactionStore?.result[transactionStore.result.length - 1]?.hash !== transactionData.result[transactionData.result.length - 1]?.hash) {
                dispatch(setTransactions(transactionData))
            }
        } else if (transactionData && transactionData.result.length === 0) dispatch(setTransactions(transactionData))
    }, [transactionData, transactionFetching])

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

            const celo = fetchedCurrencies.find(c => c.name === 'CELO')
            const cusd = fetchedCurrencies.find(c => c.name === 'cUSD')
            const ceur = fetchedCurrencies.find(c => c.name === 'cEUR')
            const ube = fetchedCurrencies.find(c => c.name === 'UBE')
            const moo = fetchedCurrencies.find(c => c.name === 'MOO')
            const mobi = fetchedCurrencies.find(c => c.name === 'MOBI')
            const poof = fetchedCurrencies.find(c => c.name === 'POOF')
            const creal = fetchedCurrencies.find(c => c.name === 'cREAL')
            const pact = fetchedCurrencies.find(c => c.name === 'PACT')
            const ari = fetchedCurrencies.find(c => c.name === 'ARI')

            if (fetchedBalance && !balanceLoading) {
                let balance = fetchedBalance as { [name: string]: string; } | undefined;

                if (balance) {

                    let pCelo;
                    let pCusd;
                    let pCeur;
                    let pUbe;
                    let pMoo;
                    let pMobi;
                    let pPoof;
                    let pReal;
                    let pPact;
                    let pAri;
                    balance = balance as Balance;

                    pCelo = parseFloat(balance.CELO) || 0;
                    pCusd = parseFloat(balance.cUSD) || 0;
                    pCeur = parseFloat(balance.cEUR) || 0;
                    pUbe = parseFloat(balance.UBE) || 0;
                    pMoo = parseFloat(balance.MOO) || 0;
                    pMobi = parseFloat(balance.MOBI) || 0;
                    pPoof = parseFloat(balance.POOF) || 0;
                    pReal = parseFloat(balance.cREAL) || 0;
                    pPact = parseFloat(balance.PACT) || 0;
                    pAri = parseFloat(balance.ARI) || 0;


                    const total = fetchedCurrencies.reduce((a, c) => a + (c.price * parseFloat((balance?.[c.name]) ?? "0")), 0);

                    const arrPrices = fetchedCurrencies.map(c => {
                        const amount = parseFloat((balance?.[c.name]) ?? "0");
                        const price = c.price * amount;
                        return {
                            coins: Coins[c.name as unknown as keyof Coins],
                            per_24: c?.percent_24,
                            price,
                            amount,
                            percent: (price * 100) / total,
                            tokenPrice: c.price
                        }
                    })

                    const prices = fetchedCurrencies.reduce<{ [name: string]: { coins: AltCoins, per_24: number, price: number, amount: number, percent: number, tokenPrice: number } }>((a: any, c) => {
                        const amount = parseFloat((balance?.[c.name]) ?? "0");
                        const price = c.price * amount;
                        a[c.name] = {
                            coins: Coins[c.name as unknown as keyof Coins],
                            per_24: c?.percent_24,
                            price,
                            amount,
                            percent: (price * 100) / total,
                            tokenPrice: c.price
                        }
                        return a;
                    }, {})

                    const totalBalance: number = arrPrices.reduce((acc, curr) => acc + (curr.amount * curr.tokenPrice), 0)

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
    }, [fetchedCurrencies])

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
        const execution = () => transactionTrigger(selectedAccount).unwrap().catch(() => { transactionTrigger(selectedAccount).unwrap().catch((error) => { console.error(error) }) })
        execution()
        let timer = setInterval(() => {
            execution()
        }, 10000)

        return () => { clearInterval(timer) }
    }, [selectedAccount])

    return [fetching];
}

export default useRefetchData;