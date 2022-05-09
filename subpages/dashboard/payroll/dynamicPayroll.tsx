import Button from 'components/button';
import { Fragment, useState, useMemo } from 'react';
import TeamContainer from 'subpages/dashboard/payroll/teamContainer'
import { SelectBalances } from 'redux/reducers/currencies';
import { Coins } from 'types';
import { selectContributors } from 'redux/reducers/contributors';
import { DateInterval, ExecutionType, IMember } from 'apiHooks/useContributors';
import date from 'date-and-time'
import { useAppSelector } from 'redux/hooks';
import _ from 'lodash';
import useAllowance from "apiHooks/useAllowance";
import { Contracts } from "apiHooks/Contracts/Contracts";
import useCeloPay, { PaymentInput } from "apiHooks/useCeloPay";
import useGelato from "apiHooks/useGelato";
import useContributors from "hooks/useContributors";
import { encryptMessage } from 'utils/hashing';
import { selectStorage } from 'redux/reducers/storage';
import { useWalletKit } from 'hooks';
import { useRouter } from 'next/router';
import { useDispatch } from 'react-redux';
import { setMemberList } from 'redux/reducers/masspay';
import Loader from 'components/Loader';



export default function DynamicPayroll({ type }: { type: "manual" | "auto" }) {

    let contributors = useAppSelector(selectContributors).contributors.map(s => ({ ...s, members: s.members.filter(m => type === "manual" ? m.execution !== ExecutionType.auto : m.execution === ExecutionType.auto) }))

    const memberState = useState<IMember[]>([])
    const { GetCoins } = useWalletKit()

    const router = useRouter()
    const dispatch = useDispatch()

    const balance = useAppSelector(SelectBalances)

    const { GenerateBatchPay } = useCeloPay()

    const { createTask, loading } = useGelato()

    const { editMember, isLoading } = useContributors()

    const storage = useAppSelector(selectStorage)

    const { allow, loading: allowLoading } = useAllowance()

    const totalPrice: { [name: string]: number } = useMemo(() => {
        if (contributors && balance.CELO) {
            const list: IMember[] = [];
            contributors.forEach(team => {
                team.members?.forEach(member => {
                    list.push(member)
                })
            })
            const first = Object.entries(_(list).groupBy('currency').value()).map(([currency, members]) => {
                let totalAmount = members.reduce((acc, curr) => {
                    if (new Date(curr.paymantDate).getTime() > new Date().getTime() && new Date(curr.paymantDate).getMonth() !== new Date().getMonth()) {
                        return acc;
                    }
                    let amount = parseFloat(curr.amount)
                    if (curr.usdBase) {
                        amount /= (balance[GetCoins[curr.currency as keyof Coins].name as keyof typeof balance]?.tokenPrice ?? 1)
                    }

                    if (new Date(curr.paymantDate).getTime() < new Date().getTime() && new Date(curr.paymantDate).getMonth() !== new Date().getMonth()) {
                        const days = date.subtract(new Date(), new Date(curr.paymantDate)).toDays()

                        if (curr.interval === DateInterval.weekly) {
                            amount *= Math.max(1, Math.floor(days / 7))
                        } else if (curr.interval === DateInterval.monthly) {
                            amount *= Math.max(1, Math.floor(days / 30))
                        }

                        return acc + amount;
                    }

                    if (curr.interval === DateInterval.weekly) {
                        amount *= Math.floor((31 - new Date().getDate()) / 7)
                    }

                    return acc + amount;
                }, 0)

                return {
                    currency,
                    totalAmount
                }
            })

            const second = Object.entries(_(list).groupBy('secondaryCurrency').value()).filter(s => s[0] !== 'undefined').map(([currency, members]) => {
                let totalAmount = members.reduce((acc, curr) => {
                    if (new Date(curr.paymantDate).getTime() > new Date().getTime() && new Date(curr.paymantDate).getMonth() !== new Date().getMonth()) {
                        return acc;
                    }
                    let amount = (parseFloat(curr!.secondaryAmount!))
                    if (curr.secondaryUsdBase) {
                        amount /= (balance[GetCoins[curr.secondaryCurrency! as keyof Coins].name as keyof typeof balance]?.tokenPrice ?? 1)
                    }
                    if (curr.interval === DateInterval.weekly) {
                        amount *= Math.floor((31 - new Date().getDate()) / 7)
                    }

                    return acc + amount

                }, 0)

                return {
                    currency,
                    totalAmount
                }
            })

            let res: any = {}

            first.forEach((item) => {
                if (!res[item.currency]) {
                    res[item.currency] = item.totalAmount
                } else {
                    res[item.currency] += item.totalAmount
                }
            })

            second.forEach((item) => {
                if (!res[item.currency]) {
                    res[item.currency] = item.totalAmount
                } else {
                    res[item.currency] += item.totalAmount
                }
            })

            return res
        }
    }, [contributors, balance])

    return <div className="flex flex-col space-y-4">
        <div className="rounded-xl shadow-custom px-10 pb-10 pt-6 bg-white dark:bg-darkSecond ">
            <div className='flex flex-col space-y-3 '>
                <div className='flex space-x-2'>
                    <div className='text-greylish opacity-90'>Total payout per month:</div>
                    {totalPrice ? <div className='text-greylish'>
                        {Object.entries(totalPrice).filter(s => s[1]).reduce((a, [currency, amount]) => {
                            a += amount * (balance[GetCoins[currency as keyof Coins].name as keyof typeof balance]?.tokenPrice ?? 1)
                            return a;
                        }, 0).toFixed(2)} USD
                    </div> : <div><Loader /></div>}
                </div>
                <div className="flex justify-between">
                    <div className='grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-12'>
                        {totalPrice ?
                            Object.entries(totalPrice).filter(s => s[1]).map(([currency, amount]) => {
                                return <div key={currency} className="flex space-x-2 relative h-fit">
                                    <div className="font-semibold text-xl">{amount.toFixed(2)}</div>
                                    <div className="font-semibold text-xl">{GetCoins[currency as keyof Coins].name}</div>
                                    <div>
                                        <img src={GetCoins[currency as keyof Coins].coinUrl} className="w-[1.563rem] h-[1.563rem] rounded-full" alt="" />
                                    </div>
                                    <div className="absolute right-2 -bottom-6 text-sm text-greylish opacity-75 text-right">
                                        {(amount * (balance[GetCoins[currency as keyof Coins].name as keyof typeof balance]?.tokenPrice ?? 1)).toFixed(2)} USD
                                    </div>
                                </div>
                            }) : <div className="flex py-1 justify-center"><Loader /></div>
                        }
                    </div>
                    <div className="h-[3.438rem]">
                        {memberState[0].length > 0 && <Button onClick={async () => {
                            const arr = [...memberState[0]]
                            if (type === "manual") {

                                arr.forEach(curr => {
                                    if (new Date(curr.paymantDate).getTime() < new Date().getTime() && new Date(curr.paymantDate).getMonth() !== new Date().getMonth()) {
                                        const days = date.subtract(new Date(), new Date(curr.paymantDate)).toDays()
                                        let amount = parseFloat(curr.amount)
                                        if (curr.interval === DateInterval.weekly) {
                                            amount *= Math.max(1, Math.floor(days / 7))
                                        } else if (curr.interval === DateInterval.monthly) {
                                            amount *= Math.max(1, Math.floor(days / 30))
                                        }
                                        curr = { ...curr, amount: amount.toString() }
                                    }
                                })

                                dispatch(setMemberList({data: arr, request: false}))
                                router.push('/dashboard/masspayout')
                            } else {
                                try {
                                    for (let index = 0; index < arr.length; index++) {
                                        const curr = arr[index];

                                        let hash;
                                        const interval = curr!.interval
                                        const days = Math.abs(date.subtract(new Date(curr.paymantDate), new Date(curr.paymantEndDate)).toDays());
                                        const realDays = interval === DateInterval.monthly ? Math.ceil(days / 30) : interval === DateInterval.weekly ? Math.ceil(days / 7) : days;
                                        let realMoney = Number(curr.amount) * realDays

                                        if (curr.usdBase) {
                                            realMoney *= (balance[GetCoins[curr.currency].name]?.tokenPrice ?? 1)
                                        }
                                        await allow(GetCoins[curr.currency].contractAddress, Contracts.Gelato.address, realMoney.toString())
                                        const paymentList: PaymentInput[] = []

                                        paymentList.push({
                                            coin: GetCoins[curr.currency],
                                            recipient: curr.address.trim(),
                                            amount: curr.amount.trim()
                                        })

                                        if (curr.secondaryAmount && curr.secondaryCurrency) {
                                            let realMoney = Number(curr.secondaryAmount) * realDays
                                            if (curr.usdBase) {
                                                realMoney *= (balance[GetCoins[curr.secondaryCurrency].name]?.tokenPrice ?? 1)
                                            }
                                            await allow(GetCoins[curr.secondaryCurrency].contractAddress, Contracts.Gelato.address, realMoney.toString())
                                            paymentList.push({
                                                coin: GetCoins[curr.secondaryCurrency],
                                                recipient: curr.address.trim(),
                                                amount: curr.secondaryAmount.trim()
                                            })
                                        }

                                        const encodeAbi = (await GenerateBatchPay(paymentList)).encodeABI()
                                        hash = await createTask(Math.floor((new Date(curr.paymantDate).getTime() + 600000) / 1e3), interval, Contracts.BatchRequest.address, encodeAbi)

                                        let user = { ...curr }
                                        user.name = encryptMessage(`${user.name}`, storage?.encryptedMessageToken)
                                        user.address = encryptMessage(user.address, storage?.encryptedMessageToken)
                                        user.amount = encryptMessage(user.amount, storage?.encryptedMessageToken)
                                        if (user.secondaryAmount) {
                                            user.secondaryAmount = encryptMessage(user.secondaryAmount, storage?.encryptedMessageToken)
                                        }


                                        await editMember(user.teamId, user.id, { ...user, taskId: hash })
                                    }
                                } catch (error) {
                                    console.error(error)
                                }
                            }
                        }}>
                            Run Payroll
                        </Button>}
                    </div>
                </div>
            </div>
        </div>
        <div className="w-full shadow-custom px-5 pt-4 pb-6 rounded-xl bg-white dark:bg-darkSecond">
            <div id="header" className="hidden sm:grid grid-cols-[30%,30%,1fr] lg:grid-cols-[20%,20%,20%,20%,1fr] rounded-xl bg-light  dark:bg-dark  sm:mb-5 px-5 " >
                <div className="font-normal py-3">Name</div>
                <div className="font-normal py-3 hidden lg:block">Amount</div>
                <div className="font-normal py-3">Frequency</div>
                <div className="font-normal py-3">Next Payment</div>
                <div className="font-normal py-3">End Payment</div>
            </div>
            <div>
                {contributors.map(w => w && w.members && w.members.length > 0 ? <Fragment key={w.id}><TeamContainer {...w} memberState={memberState} /></Fragment> : undefined)}
            </div>
        </div>
    </div>
}
