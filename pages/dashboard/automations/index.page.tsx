import { Fragment, useState, useMemo } from 'react';
import { useAppSelector } from 'redux/hooks'
import { selectContributors } from 'redux/slices/account/contributors';
import { SelectBalances, SelectTotalBalance } from 'redux/slices/currencies';
import { DateInterval, ExecutionType, IMember } from 'types/dashboard/contributors';
import AddStopModal from 'pages/dashboard/automations/_components/_buttons/_addStop';
import Modal from 'components/general/modal';
import TeamContainer from 'pages/dashboard/automations/_components/_teamContainer'
import Button from 'components/button';
import { useWalletKit } from 'hooks';
import { Coins } from 'types';
import Loader from 'components/Loader';
import _ from 'lodash';
import date from 'date-and-time'
import { SelectContributorsAutoPayment, SelectRecurringTasks } from 'redux/slices/account/selector';


const Automations = () => {

    // const teams = useAppSelector(SelectContributorsAutoPayment)
    const tasks = useAppSelector(SelectRecurringTasks)
    const [addStopModal, setAddStopModal] = useState(false)
    const memberState = useState<IMember[]>([])
    const { GetCoins } = useWalletKit()
    const balance = useAppSelector(SelectBalances)
    let totalBalance = useAppSelector(SelectTotalBalance)


    const totalPrice: { [name: string]: number } = useMemo(() => {
        let res: { [name: string]: number } = {}
        tasks.forEach(({ inputs }) => {
            inputs.forEach((curr) => {
                res[curr.coin] = res[curr.coin] ? res[curr.coin] + curr.amount : curr.amount
            })
        })

        return res
    }, [tasks, balance])

    const TotalCalculatedPrice = useMemo(() => {
        return Object.entries(totalPrice).filter(s => s[1]).reduce((a, [currency, amount]) => {
            a += amount * (balance[GetCoins[currency as keyof Coins].name as keyof typeof balance]?.tokenPrice ?? 1)
            return a;
        }, 0).toFixed(2)
    }, [totalPrice])

    return <div className="w-full h-full flex flex-col space-y-3">
        <div className="flex justify-between items-center w-full pb-3">
            <div className="text-4xl font-bold">
                Recurring
            </div>
        </div>
        {addStopModal &&
            <Modal onDisable={setAddStopModal} animatedModal={false} className={`${memberState[0].length > 0 && '!w-[75%] !pt-4 px-8'} px-2`} >
                <AddStopModal onDisable={setAddStopModal} memberState={memberState[0]} />
            </Modal>}
        {tasks.length > 0 ?
            <>
                <div className="w-full relative">
                    <Button className={"absolute right-0 -top-[3.75rem] text-lg  rounded-xl !px-3 xl:w-[15%] py-1"} onClick={() => setAddStopModal(true)}>
                        {memberState[0].length > 0 ? 'Confirm' : 'Cancel Payment'}
                    </Button>
                </div>
                <div className=" px-5 pb-10 pt-6  ">
                    <div className='flex  space-y-3 gap-12'>
                        <div className='flex flex-col space-y-5 gap-12 lg:gap-4'>
                            <div className='text-xl font-semibold'>Total Recurring Payment</div>
                            {totalPrice ? <div className='text-3xl font-bold !mt-0'>
                                {TotalCalculatedPrice} USD
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
                <div className="w-full  px-5 pt-4 pb-6 h-full">
                    {tasks.length > 0 &&
                        <div id="header" className="hidden sm:grid grid-cols-[30%,30%,1fr] lg:grid-cols-[20%,20%,15%,15%,15%,15%] rounded-xl bg-light  dark:bg-dark sm:mb-5 px-5 " >
                            <div className="font-semibold py-3 pl-2">Name</div>
                            <div className="font-semibold py-3">Start Date</div>
                            <div className="font-semibold py-3">End Date</div>
                            <div className="font-semibold py-3 ">Amount</div>
                            <div className="font-semibold py-3">Frequency</div>
                            <div className="font-semibold py-3">Labels</div>
                        </div>
                    }
                    <div>
                        {tasks.map(w => <Fragment key={w.taskId}><TeamContainer task={w} /></Fragment>)}
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

export default Automations;