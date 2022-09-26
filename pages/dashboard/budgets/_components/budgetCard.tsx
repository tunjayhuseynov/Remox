import React, { useEffect, useMemo, useState } from 'react'
import { useAppSelector } from 'redux/hooks';
import { SelectDarkMode } from 'redux/slices/account/remoxData';
import BudgetDetails from './budgetDetails';
import { useWalletKit } from "hooks";
import { IBudgetORM } from 'pages/api/budget/index.api';
import { useRouter } from 'next/router';
import { ProgressBarWidth, SetComma } from 'utils';
import Modal from 'components/general/modal';
import DeleteBudget from './Modals/deleteBudgets';
import { VscEdit } from 'react-icons/vsc';
import { GiCancel } from 'react-icons/gi';
import { AiFillRightCircle } from 'react-icons/ai';

const variants = {
    init: {
        opacity: 0,
    },
    animate: {
        opacity: 1,
        transition: {
            duration: .3,
            ease: "easeInOut"
        }
    },
    exit: {
        opacity: 0,
    }
}

function BudgetCard({ item, }: { item: IBudgetORM }) {
    // const [openNotify, setNotify] = useState(false)
    const [details, setDetails] = useState(false)
    const [detailModal, setDetailModal] = useState(false)
    const { GetCoins } = useWalletKit()
    const dark = useAppSelector(SelectDarkMode)
    const navigate = useRouter()
    const [delBudget, setDelBudget] = useState(false)
    const [editBudget, setEditBudget] = useState(false)


    const budgetCoins = item.budgetCoins;



    const usedPercent = useMemo(() => ProgressBarWidth(budgetCoins.totalUsedAmount * 100 / budgetCoins.totalAmount), [item])
    const pendingPercent = useMemo(() => ProgressBarWidth(budgetCoins.totalPending * 100 / budgetCoins.totalAmount), [item])


    useEffect(() => {
        if (detailModal) {
            document.querySelector('body')!.style.overflowY = "hidden"
        } else {
            document.querySelector('body')!.style.overflowY = ""
        }


    }, [detailModal])

    return <tr className='pl-5 grid grid-cols-[repeat(7,minmax(0,1fr))] text-gray-500 dark:text-gray-300 text-sm font-normal bg-white dark:bg-darkSecond rounded-md my-6 py-8 h-[7.5rem]'>
        <BudgetDetails item={item} close={setDetailModal} visibility={detailModal} />
        {/* {openNotify && createPortal(<div className="w-full h-full !my-0 !ml-0 blur-sm absolute left-0 top-0 z-[98]"></div>, document.body)} */}

        <td className='self-center'>
            <span className='font-medium text-black dark:text-white text-lg'>{item.name}</span>
        </td>
        <td>
            <div className='flex flex-col justify-center h-full'>
                <div className='flex items-center space-x-3 font-medium text-lg'>
                    <div>
                        <img className="rounded-full w-5 h-5" src={GetCoins[budgetCoins.coin].logoURI} alt={budgetCoins.coin} />
                    </div>
                    <div>{budgetCoins.totalAmount}</div>
                </div>
                {budgetCoins.second &&
                    <div className='flex items-center space-x-3 font-medium text-lg'>
                        <div>
                            <img className="rounded-full w-5 h-5" src={GetCoins[budgetCoins.second.secondCoin].logoURI} alt={budgetCoins.second.secondCoin} />
                        </div>
                        <div>{budgetCoins.second.secondTotalAmount}</div>
                    </div>}
            </div>
        </td>
        <td>
            <div className='flex flex-col justify-center h-full'>
                <div className='flex items-center space-x-3 font-medium text-lg'>
                    <div>
                        <img className="rounded-full w-5 h-5" src={GetCoins[budgetCoins.coin].logoURI} alt={budgetCoins.coin} />
                    </div>
                    <div>{budgetCoins.totalUsedAmount}</div>
                </div>
                {budgetCoins.second &&
                    <div className='flex items-center space-x-3 font-medium text-lg'>
                        <div>
                            <img className="rounded-full w-5 h-5" src={GetCoins[budgetCoins.second.secondCoin].logoURI} alt={budgetCoins.second.secondCoin} />
                        </div>
                        <div>{budgetCoins.second.secondTotalUsedAmount}</div>
                    </div>}
            </div>
        </td>
        <td>
            <div className='flex flex-col justify-center h-full'>
                <div className='flex items-center space-x-3 font-medium text-lg'>
                    <div>
                        <img className="rounded-full w-5 h-5" src={GetCoins[budgetCoins.coin].logoURI} alt={budgetCoins.coin} />
                    </div>
                    <div>{budgetCoins.totalPending}</div>
                </div>
                {budgetCoins.second &&
                    <div className='flex items-center space-x-3 font-medium text-lg'>
                        <div>
                            <img className="rounded-full w-5 h-5" src={GetCoins[budgetCoins.second.secondCoin].logoURI} alt={budgetCoins.second.secondCoin} />
                        </div>
                        <div>{budgetCoins.second.secondTotalPending}</div>
                    </div>}
            </div>
        </td>
        <td>
            <div className='flex flex-col justify-center h-full'>
                <div className='flex items-center space-x-3 font-medium text-lg'>
                    <div>
                        <img className="rounded-full w-5 h-5" src={GetCoins[budgetCoins.coin].logoURI} alt={budgetCoins.coin} />
                    </div>
                    <div>{budgetCoins.totalAmount - (budgetCoins.totalPending + budgetCoins.totalUsedAmount)}</div>
                </div>
                {budgetCoins.second &&
                    <div className='flex items-center space-x-3 font-medium text-lg'>
                        <div>
                            <img className="rounded-full w-5 h-5" src={GetCoins[budgetCoins.second.secondCoin].logoURI} alt={budgetCoins.second.secondCoin} />
                        </div>
                        <div>{budgetCoins.second.secondTotalAmount - (budgetCoins.second.secondTotalPending + budgetCoins.second.secondTotalUsedAmount)}</div>
                    </div>}
            </div>
        </td>
        <td className='self-center'>
            <div className="rounded-xl w-full h-[1.2rem] relative bg-greylish bg-opacity-40 overflow-hidden">
                <div className='absolute left-0 top-0 w-full h-full flex'>
                    <div className="h-full bg-primary rounded-l-xl" style={usedPercent}></div>
                    <div className="stripe-1 object-cover h-full" style={pendingPercent}></div>
                </div>
                {/* <div className="w-[15%] h-full bg-greylish bg-opacity-10 rounded-r-xl"></div> */}
            </div>
        </td>
        <td className='self-center'>
            <div className='flex justify-end pr-10 space-x-5 items-center'>
                <div>
                    <VscEdit size={20} className="cursor-pointer hover:text-green-500"/>
                </div>
                <div>
                    <GiCancel size={20} className="cursor-pointer hover:text-red-500"/>
                </div>
                <div>
                    <AiFillRightCircle size={28} className="cursor-pointer text-primary hover:text-secondary"/>
                </div>
            </div>
        </td>

        {
            delBudget &&
            <Modal onDisable={setDelBudget} animatedModal={false} disableX={true} className={'!w-[30%] !pt-4'}>
                <DeleteBudget onDisable={setDelBudget} budget={item} />
            </Modal>
        }
    </tr>
}

export default BudgetCard