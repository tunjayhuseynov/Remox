import Button from 'components/button';
import { Fragment, useState, useMemo } from 'react';
import TeamContainer from 'subpages/dashboard/payroll/teamContainer'
import { SelectBalances, SelectTotalBalance } from 'redux/reducers/currencies';
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
import Runpayroll from './modalpay/Runpayroll';
import Modal from "../../../components/general/modal";
import TokenBalance from "subpages/dashboard/requests/tokenBalance"
import TotalAmount from "subpages/dashboard/requests/totalAmount"


export default function     DynamicPayroll() {
    const [runmodal, setRunmodal] = useState(false)
    const [confirm, setConfirm] = useState(false)
    let totalBalance = useAppSelector(SelectTotalBalance)
    let balance2;
    if (totalBalance !== undefined) balance2 = parseFloat(`${totalBalance}`).toFixed(2)
    const balanceRedux = useAppSelector(SelectBalances)


    let contributors = useAppSelector(selectContributors).contributors.map(s => ({ ...s, members: s.members.filter(m => m.execution) }))
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

    const confirmFunc = () =>{
        setConfirm(!confirm)
        if(confirm && memberState[0].length > 0 ){
            setRunmodal(true)
        }
}

    return <div className="flex flex-col space-y-4">

        {runmodal && <Modal onDisable={setRunmodal} className={`${memberState[0].length > 0 && '!w-[75%] !pt-4 px-8'} px-2`} >

            {memberState[0].length > 0 ? <div className="px-10">
                <div className="text-2xl font-semibold py-2 pb-8">Run Payroll</div>
                <div className="w-full shadow-custom px-5 pt-4 pb-6 ">
                    <div id="header" className="hidden sm:grid grid-cols-[30%,30%,1fr] sm:grid-cols-[16%,13%,14%,17%,12%,12%,18%]   sm:mb-5 px-5 " >
                        <div className="font-semibold py-3">Name</div>
                        <div className="font-semibold py-3">Start Date</div>
                        <div className="font-semibold py-3">End Date</div>
                        <div className="font-semibold py-3 ">Salary</div>
                        <div className="font-semibold py-3">Frequency</div>
                        <div className="font-semibold py-3">Status</div>
                        <div className="font-semibold py-3">Compensation Type</div>
                    </div>
                    <div>
                        {contributors.map(w => w && w.members && w.members.length > 0 ? <Fragment key={w.id}><Runpayroll {...w} runmodal={runmodal} memberState={memberState} /></Fragment> : undefined)}
                    </div>
                </div>
                <div className="flex flex-col space-y-3 pt-10">
                    <div className="text-2xl font-semibold tracking-wide">Review Treasury Impact</div>
                    <div className="w-full flex flex-col   p-5 ">
                        <div className="grid grid-cols-[20%,80%]  pb-2">
                             <div className="font-semibold text-lg text-greylish">Treasury Balance</div>
                            <div className="font-semibold text-lg text-greylish">Token Allucation</div>
                        </div>
                        <div className="grid grid-cols-[20%,20%,20%,20%,20%]">
                            <div className="flex flex-col items-start   mb-4">
                                <TotalAmount coinList={memberState[0]} />

                            </div>
                            <>
                                <TokenBalance coinList={memberState[0]} />
                            </>
                        </div>
                    </div>
                </div>
                <Button className={'w-full py-3 mt-10'} onClick={
                    async () => {
                        const arr = [...memberState[0]]
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

                        dispatch(setMemberList({ data: arr, request: false }))
                        router.push('/dashboard/masspayout')

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
                                user.name = `${user.name}`
                                user.address = user.address
                                user.amount = user.amount
                                if (user.secondaryAmount) {
                                    user.secondaryAmount = user.secondaryAmount
                                }


                                await editMember(user.teamId, user.id, { ...user, taskId: hash })
                            }
                        } catch (error) {
                            console.error(error)
                        }

                    }
                }>Confirm and Run Payroll</Button>
            </div> : <div className="text-primary text-2xl font-semibold pt-12  px-2">please choose some of the members.!</div>}
        </Modal>}
        <div className="w-full relative">
            <Button className={"absolute right-0 -top-[3.75rem]  rounded-xl px-5 py-1"} onClick={confirmFunc}>
                {memberState[0].length > 0 && confirm ? 'Confirm' : 'Run Payroll'}
            </Button>
        </div>
        <div className=" px-5 py-6 border-b">
            <div className='flex '>
                <div className='flex flex-col space-y-5 gap-12 lg:gap-4 pr-8 border-r'>
                    <div className='text-xl font-bold'>Monthly Total Payment</div>
                    {totalPrice ? <div className='text-3xl font-bold !mt-1'>
                        ${Object.entries(totalPrice).filter(s => s[1]).reduce((a, [currency, amount]) => {
                            a += amount * (balance[GetCoins[currency as keyof Coins].name as keyof typeof balance]?.tokenPrice ?? 1)
                            return a;
                        }, 0).toFixed(2)} USD
                    </div> : <div><Loader /></div>}
                </div>
                <div className="flex flex-col space-y-5 pl-8 !mt-0">
                    <div className='text-xl font-bold'>Token Allocation</div>
                    <div className='grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-4 gap-12'>
                        {totalPrice ?
                            Object.entries(totalPrice).filter(s => s[1]).map(([currency, amount]) => {
                                return <div key={currency} className="flex space-x-2 relative h-fit">
                                    <div className="font-semibold text-xl">{amount.toFixed(2)}</div>
                                    <div className="font-semibold text-xl flex gap-1 items-center">
                                        <img src={GetCoins[currency as keyof Coins].coinUrl} className="w-[1.563rem] h-[1.563rem] rounded-full" alt="" />
                                        {GetCoins[currency as keyof Coins].name}</div>
                                    <div>
                                    </div>
                                    <div className="absolute -left-1 -bottom-6 text-sm text-greylish opacity-75 text-left">
                                        ${(amount * (balance[GetCoins[currency as keyof Coins].name as keyof typeof balance]?.tokenPrice ?? 1)).toFixed(2)} USD
                                    </div>
                                </div>
                            }) : <div className="flex py-1 justify-center"><Loader /></div>
                        }
                    </div>

                </div>
            </div>
        </div>
        <div className="w-full  px-5 pt-4 pb-6 ">
            <div id="header" className="hidden sm:grid grid-cols-[30%,30%,1fr] lg:grid-cols-[18%,11%,14%,15%,12%,12%,18%] rounded-xl bg-light  dark:bg-dark sm:mb-5 px-5 " >
                <div className="font-semibold py-3 pl-8 ">Name</div>
                <div className="font-semibold py-3">Start Date</div>
                <div className="font-semibold py-3">End Date</div>
                <div className="font-semibold py-3 ">Salary</div>
                <div className="font-semibold py-3">Frequency</div>
                <div className="font-semibold py-3">Status</div>
                <div className="font-semibold py-3">Compensation Type</div>
            </div>
            <div>
                {contributors.map(w => w && w.members && w.members.length > 0 ? <Fragment key={w.id}><TeamContainer {...w} memberState={memberState} confirm={confirm} /></Fragment> : undefined)}
            </div>
        </div>
    </div>

}
