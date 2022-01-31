import useContributors from 'API/useContributors'
import { useCallback, useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { selectContributors, setContributors } from 'redux/reducers/contributors'
import { setTimeout } from 'timers'
import useBalance from '../API/useBalance'
import useCurrency from '../API/useCurrency'
import { useLazyGetTransactionsQuery } from '../redux/api'
import { updateAllCurrencies, updateUserBalance } from '../redux/reducers/currencies'
import { SelectSelectedAccount } from '../redux/reducers/selectedAccount'
import { selectStorage } from '../redux/reducers/storage'
import { SelectTransactions, setTransactions } from '../redux/reducers/transactions'
import { Coins } from '../types/coins'
import { GetBalanceResponse, MultisigBalanceResponse } from '../types/sdk'

const useRefetchData = (disableInterval = false) => {
    const dispatch = useDispatch()
    const storage = useSelector(selectStorage)
    const selectedAccount = useSelector(SelectSelectedAccount)
    const transactionStore = useSelector(SelectTransactions)

    const fetchedCurrencies = useCurrency()
    const contributors = useContributors()
    const { fetchBalance, fetchedBalance, isLoading: balanceLoading } = useBalance(selectedAccount)

    const [transactionTrigger, { data: transactionData, isFetching: transactionFetching }] = useLazyGetTransactionsQuery()

    useEffect(() => {
        if (transactionData && transactionData.result.length > 0 && !transactionFetching) {
            if (transactionStore?.result[0].hash !== transactionData.result[0].hash || transactionStore?.result[transactionStore.result.length - 1].hash !== transactionData.result[transactionData.result.length - 1].hash) {
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
        if (fetchedCurrencies && fetchedCurrencies.length > 0 && ((storage?.accountAddress === selectedAccount && fetchedBalance && !balanceLoading) || (storage?.accountAddress !== selectedAccount))) {

            const celo = fetchedCurrencies.find(c => c.name === 'CELO')
            const cusd = fetchedCurrencies.find(c => c.name === 'cUSD')
            const ceur = fetchedCurrencies.find(c => c.name === 'cEUR')
            const ube = fetchedCurrencies.find(c => c.name === 'UBE')
            const moo = fetchedCurrencies.find(c => c.name === 'MOO')
            const mobi = fetchedCurrencies.find(c => c.name === 'MOBI')
            const poof = fetchedCurrencies.find(c => c.name === 'POOF')
            const creal = fetchedCurrencies.find(c => c.name === 'cREAL')

            if (fetchedBalance) {
                let balance = fetchedBalance as { [name: string]: string; } | undefined;

                if (balance && celo && cusd && ceur && ube && moo && mobi && poof && creal) {

                    let pCelo;
                    let pCusd;
                    let pCeur;
                    let pUbe;
                    let pMoo;
                    let pMobi;
                    let pPoof;
                    let pReal;
                    balance = balance as GetBalanceResponse;
                    pCelo = parseFloat(balance.CELO);
                    pCusd = parseFloat(balance.cUSD);
                    pCeur = parseFloat(balance.cEUR);
                    pUbe = parseFloat(balance.UBE);
                    pMoo = parseFloat(balance.MOO);
                    pMobi = parseFloat(balance.MOBI);
                    pPoof = parseFloat(balance.POOF);
                    pReal = parseFloat(balance.cREAL);


                    const celoPrice = pCelo * (celo.price ?? 0);
                    const cusdPrice = pCusd * (cusd.price ?? 0);
                    const ceurPrice = pCeur * (ceur.price ?? 0);
                    const ubePrice = pUbe * (ube.price ?? 0);
                    const mooPrice = pMoo * (moo.price ?? 0);
                    const mobiPrice = pMobi * (mobi.price ?? 0);
                    const poofPrice = pPoof * (poof.price ?? 0);
                    const cRealPrice = pReal * (creal.price ?? 0);

                    const total = celoPrice + cusdPrice + mooPrice + + ceurPrice + ubePrice + mobiPrice + poofPrice + cRealPrice;

                    const updatedBalance = [
                        { amount: pCelo, per_24: celo.percent_24, percent: (celoPrice * 100) / total, coins: Coins.CELO, tokenPrice: +celo.price },
                        { amount: pCusd, per_24: cusd.percent_24, percent: (cusdPrice * 100) / total, coins: Coins.cUSD, tokenPrice: +cusd.price },
                        { amount: pCeur, per_24: ceur.percent_24, percent: (ceurPrice * 100) / total, coins: Coins.cEUR, tokenPrice: +ceur.price },
                        { amount: pUbe, per_24: ube.percent_24, percent: (ubePrice * 100) / total, coins: Coins.UBE, tokenPrice: +ube.price },
                        { amount: pMoo, per_24: moo.percent_24, percent: (mooPrice * 100) / total, coins: Coins.MOO, tokenPrice: +moo.price },
                        { amount: pMobi, per_24: mobi.percent_24, percent: (mobiPrice * 100) / total, coins: Coins.MOBI, tokenPrice: +mobi.price },
                        { amount: pPoof, per_24: poof.percent_24, percent: (poofPrice * 100) / total, coins: Coins.POOF, tokenPrice: +poof.price },
                        { amount: pReal, per_24: creal.percent_24, percent: (cRealPrice * 100) / total, coins: Coins.cREAL, tokenPrice: +creal.price }
                    ]

                    dispatch(updateUserBalance(updatedBalance))
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

            fetchBalance()
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