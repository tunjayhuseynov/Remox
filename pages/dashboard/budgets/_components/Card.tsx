import React, { useEffect, useMemo, useState } from 'react'
import { useAppSelector } from 'redux/hooks';
import { SelectDarkMode } from 'redux/slices/account/remoxData';
import BudgetDetails from './BudgetDetail';
import { useWalletKit } from "hooks";
import { IBudgetORM } from 'pages/api/budget/index.api';
import { useRouter } from 'next/router';
import { ProgressBarWidth, SetComma } from 'utils';
import Modal from 'components/general/modal';
import DeleteBudget from './DeleteBudget';
import { VscEdit } from 'react-icons/vsc';
import { GiCancel } from 'react-icons/gi';
import { AiFillRightCircle } from 'react-icons/ai';
import EditBudget from './EditBudget';
import { fiatList } from 'components/general/PriceInputField';
import CurrencyElement from 'components/general/CurrencyElement';

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


    const usedPercent = useMemo(() => budgetCoins.totalUsedAmount * 100 / budgetCoins.totalAmount, [item])
    const usedPercentStyle = useMemo(() => ProgressBarWidth(usedPercent), [item, usedPercent])

    const pendingPercent = useMemo(() => budgetCoins.totalPending * 100 / budgetCoins.totalAmount, [item])
    const pendingPercentStyle = useMemo(() => ProgressBarWidth(pendingPercent), [item, pendingPercent])


    useEffect(() => {
        if (detailModal) {
            document.querySelector('body')!.style.overflowY = "hidden"
        } else {
            document.querySelector('body')!.style.overflowY = ""
        }


    }, [detailModal])

    const firstFiat = fiatList.find(f => f.name === item.fiatMoney)?.logo
    const secondFiat = fiatList.find(f => f.name === item.secondFiatMoney)?.logo

    return (
        <>
            <BudgetDetails item={item} close={setDetailModal} visibility={detailModal} />
            <tr className='pl-5 grid grid-cols-[repeat(7,minmax(0,1fr))] text-gray-500 dark:text-gray-300 text-sm font-normal bg-white dark:bg-darkSecond rounded-md my-6 py-8 h-[7.5rem]'>
                {/* {openNotify && createPortal(<div className="w-full h-full !my-0 !ml-0 blur-sm absolute left-0 top-0 z-[98]"></div>, document.body)} */}

                <td className='self-center'>
                    <span className='font-medium text-black dark:text-white text-sm'>{item.name}</span>
                </td>
                <td>
                    <div className='flex flex-col justify-center h-full space-y-3'>
                        <div className='space-x-3 font-medium text-lg'>
                            <CurrencyElement fiat={item.fiatMoney} coin={GetCoins[budgetCoins.coin]} amount={budgetCoins.totalAmount} />
                        </div>
                        {budgetCoins.second &&
                            <div className='flex items-center space-x-3 font-medium text-lg'>
                                <CurrencyElement coin={GetCoins[budgetCoins.second.secondCoin]} fiat={item.secondFiatMoney} amount={budgetCoins.second.secondTotalAmount} />
                            </div>}
                    </div>
                </td>
                <td>
                    <div className='flex flex-col justify-center h-full space-y-3'>
                        <div className='space-x-3 font-medium text-lg'>
                            <CurrencyElement fiat={item.fiatMoney} coin={GetCoins[budgetCoins.coin]} amount={budgetCoins.totalUsedAmount} />
                        </div>
                        {budgetCoins.second &&
                            <div className='flex items-center space-x-3 font-medium text-lg'>
                                <CurrencyElement coin={GetCoins[budgetCoins.second.secondCoin]} fiat={item.secondFiatMoney} amount={budgetCoins.second.secondTotalUsedAmount} />
                            </div>}
                    </div>
                </td>
                <td>
                    <div className='flex flex-col justify-center h-full space-y-3'>
                        <div className='space-x-3 font-medium text-lg'>
                            <CurrencyElement fiat={item.fiatMoney} coin={GetCoins[budgetCoins.coin]} amount={budgetCoins.totalPending} />
                        </div>
                        {budgetCoins.second &&
                            <div className='flex items-center space-x-3 font-medium text-lg'>
                                <CurrencyElement coin={GetCoins[budgetCoins.second.secondCoin]} fiat={item.secondFiatMoney} amount={budgetCoins.second.secondTotalPending} />
                            </div>}
                    </div>
                </td>
                <td>
                    <div className='flex flex-col justify-center h-full space-y-3'>
                        <div className='space-x-3 font-medium text-lg'>
                            <CurrencyElement fiat={item.fiatMoney} coin={GetCoins[budgetCoins.coin]} amount={budgetCoins.totalAmount - (budgetCoins.totalPending + budgetCoins.totalUsedAmount)} />
                        </div>
                        {budgetCoins.second &&
                            <div className='flex items-center space-x-3 font-medium text-lg'>
                                <CurrencyElement coin={GetCoins[budgetCoins.second.secondCoin]} fiat={item.secondFiatMoney} amount={budgetCoins.second.secondTotalAmount - (budgetCoins.second.secondTotalPending + budgetCoins.second.secondTotalUsedAmount)} />
                            </div>
                            }
                    </div>
                </td>
                <td className='self-center relative'>
                    <div className="rounded-xl w-full h-3 relative bg-greylish bg-opacity-40 overflow-hidden">
                        <div className='absolute left-0 top-0 w-full h-full flex'>
                            <div className="h-full bg-primary rounded-l-xl" style={usedPercentStyle}></div>
                            <div className="stripe-1 object-cover h-full" style={pendingPercentStyle}></div>
                            <div className='relative w-full'>
                            </div>
                        </div>
                        {/* <div className="w-[15%] h-full bg-greylish bg-opacity-10 rounded-r-xl"></div> */}
                    </div>
                    <div className='absolute right-0 -bottom-1 translate-y-full font-semibold text-xs'>
                        {usedPercent + pendingPercent}%
                    </div>
                </td>
                <td className='self-center'>
                    <div className='flex justify-end pr-5 space-x-4 items-center'>
                        <VscEdit size={"1rem"} className="cursor-pointer hover:text-green-500" onClick={() => setEditBudget(true)} />
                        <GiCancel size={"1rem"} className="cursor-pointer hover:text-red-500" onClick={() => setDelBudget(true)} />
                        <AiFillRightCircle size={"1.85rem"} className="cursor-pointer text-primary hover:text-secondary" onClick={() => setDetailModal(true)} />
                    </div>
                </td>
                <Modal onDisable={setEditBudget} openNotify={editBudget} disableX={true}>
                    <EditBudget budget={item} onBack={() => setEditBudget(false)} />
                </Modal>
                {
                    delBudget &&
                    <Modal onDisable={setDelBudget} animatedModal={false} disableX={true} className={'!w-[30%] !pt-4'}>
                        <DeleteBudget onDisable={setDelBudget} budget={item}></DeleteBudget>
                    </Modal>
                }
            </tr>
        </>
    );
}

export default BudgetCard