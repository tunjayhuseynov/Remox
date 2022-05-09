import axios from 'axios'
import { getAuth } from 'firebase/auth'
import { useWalletKit } from 'hooks'
import { useEffect, useState } from 'react'
import { useLazyGetAccountSpendingQuery } from 'redux/api'
import { IMoneyFlow, ITagFlow } from 'redux/reducers/accountstats'
import { ATag } from 'subpages/dashboard/insight/boxmoney'


export default function useInsight({ selectedDate, selectedAccounts }: { selectedDate: number, selectedAccounts: string[] }) {
    const { blockchain } = useWalletKit()
    const auth = getAuth()

    const [isLoading, setLoading] = useState(false)
    const [totalBalance, setTotalBalance] = useState<number>(0)
    const [averageSpend, setAverageSpend] = useState<number>(0)
    const [accountAge, setAccountAge] = useState<number>(0)
    const [lastIn, setIn] = useState<IMoneyFlow>()
    const [lastOut, setOut] = useState<IMoneyFlow>();
    const [accountInTag, setAccountInTag] = useState<ITagFlow>()
    const [accountOutTag, setAccountOutTag] = useState<ITagFlow>()
    const [TotalBalancePercentage, setTotalBalancePercentage] = useState<number>(0);

    const [spendingFetch] = useLazyGetAccountSpendingQuery()

    useEffect(() => {
        setLoading(true)
        spendingFetch({
            addresses: selectedAccounts,
            blockchain,
            authId: auth.currentUser?.uid
        }).unwrap().then(response => {
            const {
                AverageSpend,
                AccountIn,
                AccountOut,
                AccountAge,
                AccountTotalBalanceChangePercent,
                TotalBalance,
                AccountInTag,
                AccountOutTag
            } = response

            setTotalBalance(TotalBalance)
            setAverageSpend(AverageSpend)
            setAccountAge(AccountAge)
            setIn(AccountIn)
            setOut(AccountOut)
            setAccountInTag(AccountInTag)
            setAccountOutTag(AccountOutTag)
            setTotalBalancePercentage(AccountTotalBalanceChangePercent)
            setLoading(false)
        })
    }, [selectedAccounts])

    return {
        isLoading,
        totalBalance, averageSpend, accountAge, lastIn: ChooseTimeframe(selectedDate, lastIn) as number | undefined, lastOut: ChooseTimeframe(selectedDate, lastOut) as number | undefined, TotalBalancePercentage,
        selectedDate, selectedAccounts, accountInTag: ChooseTimeframe(selectedDate, accountInTag) as ATag[] | undefined, accountOutTag: ChooseTimeframe(selectedDate, accountOutTag) as ATag[] | undefined
    }
}

const ChooseTimeframe = (date: number, flow?: IMoneyFlow | ITagFlow) => {
    if (flow) {
        if (date === 30) {
            return flow.month
        } else if (date === 90) {
            return flow.quart
        } else if (date === 365) return flow.year
        else return flow.currentMonth
    }
}