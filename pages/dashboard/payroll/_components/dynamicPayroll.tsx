import Button from 'components/button';
import { Fragment, useState, useMemo, useEffect } from 'react';
import { Coins } from 'types';
import { DateInterval, IMember } from 'types/dashboard/contributors';
import date from 'date-and-time'
import { useAppSelector } from 'redux/hooks';
import _ from 'lodash';
import { useWalletKit } from 'hooks';
import Runpayroll from './modalpay/Runpayroll';
import TotalAmount from "pages/dashboard/requests/_components/totalAmount"
import Modal from 'components/general/modal';
import TokenBalance from 'pages/dashboard/requests/_components/tokenBalance';
import { SelectBalance, SelectContributorMembers, SelectSelectedAccountAndBudget } from 'redux/slices/account/selector';
import TeamItem from './teamItem';
import { IPaymentInput } from 'pages/api/payments/send/index.api';
import { ToastRun } from 'utils/toast';


export default function DynamicPayroll() {
    const [runmodal, setRunmodal] = useState<boolean>(false)
    const [confirm, setConfirm] = useState(false)

    let contributors = useAppSelector(SelectContributorMembers)
    const [selectedContributors, setSelectedContributors] = useState<IMember[]>([]);

    const selectedAccountAndBudget = useAppSelector(SelectSelectedAccountAndBudget)

    useEffect(() => {
        if (!runmodal) {
            setSelectedContributors([])
        }
    }, [runmodal])

    const { GetCoins, SendTransaction } = useWalletKit()
    const balance = useAppSelector(SelectBalance)

    const totalPrice: { [name: string]: number } = useMemo(() => {
        if (contributors) {
            const list: IMember[] = [];
            const first = Object.entries(_(list).groupBy('currency').value()).map(([currency, members]) => {
                let totalAmount = members.reduce((acc, curr) => {
                    if (new Date(curr.paymantDate).getTime() > new Date().getTime() && new Date(curr.paymantDate).getMonth() !== new Date().getMonth()) {
                        return acc;
                    }
                    let amount = Number(curr.amount)
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
                    let amount = Number(curr!.secondaryAmount!)
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

    const monthlyTotalPayment = useMemo(() => {
        return Object.entries(totalPrice).filter(s => s[1]).reduce((a, [currency, amount]) => {
            a += amount * (balance[GetCoins[currency as keyof Coins].name as keyof typeof balance]?.tokenPrice ?? 1)
            return a;
        }, 0).toFixed(2)
    }, [totalPrice, balance])

    const tokenAllocation = useMemo(() => {
        return Object.entries(totalPrice).filter(s => s[1]).map(([currency, amount]) => {
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
        })
    }, [totalPrice, balance])

    const confirmFunc = () => {
        setConfirm(!confirm)
        if (confirm && contributors.length > 0) {
            setRunmodal(true)
        }
    }


    const confirmSubmit = async () => {
        try {
            if (!selectedAccountAndBudget.account) throw new Error('No account selected')
            const arr = [...selectedContributors]
            const inputs: IPaymentInput[] = []
            arr.forEach(curr => {
                if (new Date(curr.paymantDate).getTime() < new Date().getTime() && new Date(curr.paymantDate).getMonth() !== new Date().getMonth()) {
                    const days = date.subtract(new Date(), new Date(curr.paymantDate)).toDays()
                    let amount = Number(curr.amount)
                    if (curr.interval === DateInterval.weekly) {
                        amount *= Math.max(1, Math.floor(days / 7))
                    } else if (curr.interval === DateInterval.monthly) {
                        amount *= Math.max(1, Math.floor(days / 30))
                    }
                    curr = { ...curr, amount: amount.toString() }

                    inputs.push({
                        amount: Number(curr.amount),
                        coin: curr.currency,
                        recipient: curr.address,
                    })
                }
            })

            await SendTransaction(selectedAccountAndBudget.account, inputs, {
                budget: selectedAccountAndBudget.budget,
                subbudget: selectedAccountAndBudget.subbudget,
            })
        } catch (error) {
            ToastRun((error as any).message, 'error')
        }
    }

    return <div className="w-full h-full flex flex-col space-y-4">

        {runmodal &&
            <Modal onDisable={setRunmodal} animatedModal={false} className={`${selectedContributors.length > 0 && '!w-[75%] !pt-4 px-8'} px-2`}>
                {selectedContributors.length > 0 ? <div className="px-10">
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
                            {
                                selectedContributors.map(w =>
                                    <Fragment key={w.id}>
                                        <Runpayroll {...w} runmodal={runmodal} memberState={[selectedContributors, setSelectedContributors]} />
                                    </Fragment>
                                )
                            }
                        </div>
                    </div>
                    <div className="flex flex-col space-y-3 pt-10">
                        <div className="text-2xl font-semibold tracking-wide">Review Treasury Impact</div>
                        <div className="w-full flex flex-col p-5 ">
                            <div className="grid grid-cols-[20%,80%]  pb-2">
                                <div className="font-semibold text-lg text-greylish">Treasury Balance</div>
                                <div className="font-semibold text-lg text-greylish">Token Allucation</div>
                            </div>
                            <div className="grid grid-cols-[20%,20%,20%,20%,20%]">
                                <div className="flex flex-col items-start   mb-3">
                                    <TotalAmount coinList={selectedContributors} />
                                </div>
                                <div>
                                    <TokenBalance coinList={selectedContributors} />
                                </div>
                            </div>
                        </div>
                    </div>
                    <Button className={'w-full py-3 mt-10'} onClick={confirmSubmit}>Confirm and Run Payroll</Button>
                </div> :
                    <div className="text-primary text-2xl font-semibold pt-12  px-2">Please, choose members</div>}
            </Modal>
        }
        {contributors.length > 0 ?
            <>
                <div className="w-full relative">
                    <Button className={"absolute right-0 -top-[3.75rem]  rounded-xl px-5 py-1"} onClick={confirmFunc}>
                        {selectedContributors.length > 0 && confirm ? 'Confirm' : 'Run Payroll'}
                    </Button>
                </div>
                <div className=" px-5 py-6 border-b">
                    <div className='flex '>
                        <div className='flex flex-col space-y-5 gap-12 lg:gap-4 pr-8 border-r'>
                            <div className='text-xl text-greylish dark:text-white font-bold'>Monthly Total Payment</div>
                            <div className='text-3xl font-bold !mt-1'>
                                ${monthlyTotalPayment} USD
                            </div>
                        </div>
                        <div className="flex flex-col space-y-5 pl-8 !mt-0">
                            <div className='text-xl text-greylish dark:text-white font-bold'>Token Allocation</div>
                            <div className='grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-4 gap-12'>
                                {tokenAllocation}
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
                        {contributors.map(w =>
                            <div key={w.id} className="grid grid-cols-2 sm:grid-cols-[30%,30%,1fr] lg:grid-cols-[18%,11%,14%,15%,12%,12%,18%] py-6 border-b border-greylish border-opacity-10 pb-5 px-5 text-sm">
                                <TeamItem member={w} memberState={[selectedContributors, setSelectedContributors]} confirm={confirm} />
                            </div>
                        )}
                    </div>
                </div>
            </> :
            <div className="w-full h-[70%] flex flex-col  items-center justify-center gap-6">
                <img src="/icons/noData.png" alt="" className="w-[10rem] h-[10rem]" />
                <div className="text-greylish font-bold dark:text-white text-2xl">No Data</div>
            </div>
        }

    </div>

}
