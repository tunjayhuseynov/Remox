import { auth } from 'firebaseConfig'
import { useWalletKit } from 'hooks'
import { ATag, IMoneyFlow, ISpendingResponse, ITagFlow } from 'pages/api/calculation/spending'
import { useEffect, useState } from 'react'
import { useDispatch } from 'react-redux'
import { useLazyGetAccountSpendingQuery } from 'redux/api'
import { setAccountRawStats } from 'redux/slices/account/accountstats'


export default function useInsight({ selectedDate, selectedAccounts }: { selectedDate: number, selectedAccounts: string[] }) {
    const { blockchain } = useWalletKit()
    const dispatch = useDispatch()

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
        if (selectedAccounts.length > 0) {
            setLoading(true)
            spendingFetch({
                addresses: [...selectedAccounts],
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

                dispatch(setAccountRawStats(response))

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
        }
    }, [selectedAccounts, selectedDate])

    return {
        isLoading,
        totalBalance, averageSpend, accountAge, lastIn: ChooseTimeframe(selectedDate, lastIn) as number | undefined, lastOut: ChooseTimeframe(selectedDate, lastOut) as number | undefined, TotalBalancePercentage,
        selectedDate, selectedAccounts, accountInTag: ChooseTimeframe(selectedDate, accountInTag) as ATag[] | undefined, accountOutTag: ChooseTimeframe(selectedDate, accountOutTag) as ATag[] | undefined
    }
}

export const ChooseTimeframe = (date: number, flow?: IMoneyFlow | ITagFlow) => {
    if (flow) {
        if (date === 7) {
            if ('total' in flow.week) {
                return (flow as IMoneyFlow).week.total
            }
            return flow.week;
        }
        else if (date === 30) {
            if ('total' in flow.month) {
                return (flow as IMoneyFlow).month.total
            }
            return flow.month
        } else if (date === 90) {
            if ('total' in flow.quart) {
                return (flow as IMoneyFlow).quart.total
            }
            return flow.quart
        } else if (date === 365) {
            if ('total' in flow.year) {
                return (flow as IMoneyFlow).year.total
            }
            return flow.year
        }
        else return flow.currentMonth
    }
}