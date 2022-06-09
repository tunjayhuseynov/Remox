import { Fragment, useState, useMemo } from 'react';
import { useAppSelector } from 'redux/hooks'
import { selectContributors } from 'redux/reducers/contributors';
import { SelectBalances, SelectTotalBalance } from 'redux/reducers/currencies';
import { DateInterval, ExecutionType, IMember } from 'apiHooks/useContributors';
import AddStopModal from 'subpages/dashboard/automations/buttons/addStop';
import Modal from 'components/general/modal';
import TeamContainer from 'subpages/dashboard/automations/teamContainer'
import Button from 'components/button';
import TokenBalance from "subpages/dashboard/requests/tokenBalance"
import TotalAmount from "subpages/dashboard/requests/totalAmount"
import { useWalletKit } from 'hooks';
import { Coins } from 'types';
import Loader from 'components/Loader';
import _ from 'lodash';
import date from 'date-and-time'


const Automations = () => {

    const teams = useAppSelector(selectContributors).contributors.map(s => ({ ...s, members: s.members.filter(m => m.execution === ExecutionType.auto) }))
    const [addStopModal, setAddStopModal] = useState(false)
    const memberState = useState<IMember[]>([])
    const { GetCoins } = useWalletKit()
    const balance = useAppSelector(SelectBalances)
    let totalBalance = useAppSelector(SelectTotalBalance)
    let balance2;
    if (totalBalance !== undefined) balance2 = parseFloat(`${totalBalance}`).toFixed(2)

    const totalPrice: { [name: string]: number } = useMemo(() => {
        if (teams && balance.CELO) {
            const list: IMember[] = [];
            teams.forEach(team => {
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
    }, [teams, balance])
    console.log(teams.map(w => w && w.members && w.members.filter(s => s.execution === ExecutionType.auto)).length)
    return <div className="flex flex-col space-y-3">
        <div className="flex justify-between items-center w-full pb-3">
            <div className="text-4xl font-bold">
                Recurring
            </div>
        </div>
        {addStopModal &&
            <Modal onDisable={setAddStopModal}  className={`${memberState[0].length > 0 && '!w-[75%] !pt-4 px-8'} px-2`} >
                <AddStopModal onDisable={setAddStopModal} memberState={memberState[0]} />
            </Modal>}
        <div className="w-full relative">
            <Button className={"absolute right-0 -top-[3.75rem] text-lg  rounded-xl !px-3 xl:w-[15%] py-1"} onClick={() => setAddStopModal(true)}>
                {memberState[0].length > 0 ? 'Confirm' : 'Cancel Payment'}
            </Button>
        </div>
        <div className="rounded-xl shadow-custom px-5 pb-10 pt-6 bg-white dark:bg-darkSecond ">
            <div className='flex  space-y-3 gap-12'>
                <div className='flex flex-col space-y-5 gap-12 lg:gap-4'>
                    <div className='text-xl font-semibold'>Total Recurring Payment</div>
                    {totalPrice ? <div className='text-3xl font-bold !mt-0'>
                        {Object.entries(totalPrice).filter(s => s[1]).reduce((a, [currency, amount]) => {
                            a += amount * (balance[GetCoins[currency as keyof Coins].name as keyof typeof balance]?.tokenPrice ?? 1)
                            return a;
                        }, 0).toFixed(2)} USD
                    </div> : <div><Loader /></div>}
                </div>
                <div className="flex flex-col space-y-5 !mt-0">
                    <div className='text-xl font-semibold'>Token Allocation</div>
                    <div className='grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-4 gap-12'>
                        {totalPrice ?
                            Object.entries(totalPrice).filter(s => s[1]).map(([currency, amount]) => {
                                return <div key={currency} className="flex space-x-2 relative h-fit">
                                    <div className="font-bold text-xl">{amount.toFixed(2)}</div>
                                    <div className="font-bold text-xl flex gap-1 items-center">
                                        <img src={GetCoins[currency as keyof Coins].coinUrl} className="w-[1.563rem] h-[1.563rem] rounded-full" alt="" />
                                        {GetCoins[currency as keyof Coins].name}</div>
                                    <div>
                                    </div>
                                    <div className="absolute -left-1 -bottom-6 text-sm text-greylish opacity-75 text-left">
                                        {(amount * (balance[GetCoins[currency as keyof Coins].name as keyof typeof balance]?.tokenPrice ?? 1)).toFixed(2)} USD
                                    </div>
                                </div>
                            }) : <div className="flex py-1 justify-center"><Loader /></div>
                        }
                    </div>

                </div>
            </div>
        </div>
        <div className="w-full shadow-custom px-5 pt-4 pb-6 rounded-xl bg-white dark:bg-darkSecond">
            <div id="header" className="hidden sm:grid grid-cols-[30%,30%,1fr] lg:grid-cols-[2%,20%,18%,15%,15%,15%,15%] rounded-xl bg-light  dark:bg-dark sm:mb-5 px-5 " >
                <input type="checkbox" className="self-center cursor-pointer w-[1.125rem] h-[1.125rem] checked:before:w-full checked:before:h-full checked:before:bg-primary checked:before:block" onChange={(e) => {
                    if (e.target.checked) {
                        memberState[1](teams.reduce<IMember[]>((a, c) => a.concat(c.members), []))
                    } else {
                        memberState[1]([])
                    }
                }} />
                <div className="font-semibold py-3 pl-2">Name</div>
                <div className="font-semibold py-3">Start Date</div>
                <div className="font-semibold py-3">End Date</div>
                <div className="font-semibold py-3 ">Amount</div>
                <div className="font-semibold py-3">Frequency</div>
                <div className="font-semibold py-3">Labels</div>

            </div>
            <div>
                {teams.map(w => w && w.members && w.members.filter(s => s.execution === ExecutionType.auto).length > 0 ? <Fragment key={w.id}><TeamContainer {...w} memberState={memberState} /></Fragment> : undefined)}
            </div>
            {teams.length === 0 && <div className="text-center text-gray-500 text-lg">No automations found</div>}
        </div>
    </div>
}

export default Automations;