import { useEffect, useContext, useState, SetStateAction, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import Dropdown from 'components/general/dropdown';
import Modal from 'components/general/modal';
import { changeError, changeSuccess } from 'redux/slices/notificationSlice';
import { changeAccount, SelectSelectedAccount } from 'redux/slices/account/selectedAccount';
import { DropDownItem } from 'types';
import Button from 'components/button';
import useMultisig, { SolanaMultisigData } from 'hooks/walletSDK/useMultisig';
import useMultiWallet from 'hooks/useMultiWallet';
import { WordSplitter } from 'utils';
import { useRouter } from 'next/router';
import { useWalletKit } from 'hooks';
import { DashboardContext } from 'layouts/dashboard';
import { motion, AnimatePresence } from "framer-motion"
import ReactDOM, { createPortal } from 'react-dom';
import { useAppSelector } from 'redux/hooks';
import { SelectAllBudgets, SelectBudgetExercises } from 'redux/slices/account/remoxData';
import { IBudgetORM } from 'pages/api/budget';

function ChooseBudget() {
    const { Disconnect, blockchain } = useWalletKit()
    const { importMultisigAccount } = useMultisig()

    const budgetState = useAppSelector(SelectAllBudgets);

    const budgets = useMemo(() => {
        return budgetState.map(budgets => ({
            name: budgets.name,
            id: budgets.id,
        }))
    }, [budgetState])

    const [subbudgets, setSubbudgets] = useState<DropDownItem[]>([])


    const navigator = useRouter()
    const { addWallet, data: wallets, Wallet, walletSwitch } = useMultiWallet()
    const { setMainAnimate } = useContext(DashboardContext) as { setMainAnimate: React.Dispatch<React.SetStateAction<number>> }
    const [list, setList] = useState<DropDownItem[]>([])
    const dispatch = useDispatch()
    const [isAccountModal, setAccountModal] = useState(false)

    const [selectedAccount, setAccount] = useState<DropDownItem>({
        name: wallets[0].id
    });
    const [selectedBudget, setBudget] = useState<DropDownItem>();
    const [selectedSubbudget, setSubbudget] = useState<DropDownItem>();


    useEffect(() => {
        if (selectedBudget) {
            setSubbudgets(budgetState.find(b => b.id === selectedBudget.id)?.subbudgets.map(sb => ({
                name: sb.name,
                id: sb.id,
            })) || [])
        }
    }, [selectedBudget])

    useEffect(() => {
        setList([
            { name: "Treasury vault 0", totalValue: '$2,800', photo: "nftmonkey" },
            { name: "Treasury vault 1", totalValue: '$3,700', photo: "" },
            { name: "Add Organization", onClick: () => { navigator.push('/create-organization') } }
        ])
    }, [])

    return <>
        <div className="bg-light dark:bg-dark h-full relative pr-1 w-[85%] overflow-y-auto  overflow-x-hidden bottom-0 right-0  cursor-default ">
            <div className="w-[25%] mx-auto py-8 flex flex-col gap-5 ">
                <button onClick={() => navigator.back()} className="absolute right-full w-[4rem] top-0 translate-x-[175%] translate-y-[25%] tracking-wider font-bold transition-all hover:text-primary hover:transition-all text-xl flex items-center gap-2">
                    {/* <img src="/icons/cross_greylish.png" alt="" /> */}
                    <span className="text-4xl pb-1">&#171;</span> Back
                </button>
                <div className="text-2xl font-semibold py-6 text-center">
                    Remox Pay
                </div>
                <div className="flex flex-col gap-2 w-full">
                    <div className="text-greylish dark:text-white">Choose Wallet</div>
                    <div className=" gap-5 w-full">
                        <Dropdown parentClass={'!rounded-lg'} className="w-full  bg-white dark:bg-darkSecond !rounded-lg h-[3.4rem] truncate" photoDisplay={true} childClass="flex gap-2" list={list} selected={selectedAccount} onSelect={(w) => {
                            setAccount(w)
                        }} />
                    </div>
                </div>
                {budgets.length > 0 && <div className="flex flex-col gap-2 w-full">
                    <div className="text-greylish dark:text-white">Choose Budget</div>
                    <Dropdown parentClass={'bg-white dark:bg-darkSecond w-full rounded-lg h-[3.4rem]'} className={'!rounded-lg h-[3.4rem]'} list={budgets} selected={selectedBudget} onSelect={(e) => {
                        setBudget(e)
                    }} />
                </div>}
                {subbudgets.length > 0 && <div className="flex flex-col gap-2 w-full">
                    <div className="text-greylish dark:text-white">Choose Subbudget</div>
                    <Dropdown parentClass={'bg-white dark:bg-darkSecond w-full rounded-lg h-[3.4rem]'} className={'!rounded-lg h-[3.4rem]'} list={subbudgets} selected={selectedSubbudget} onSelect={(e) => {
                        setSubbudget(e)
                    }} />
                </div>}
                <div className="grid grid-cols-2 w-full pt-4 gap-4 ">
                    <Button version="second" className={'!py-2 px-9 w-full rounded-xl'} onClick={() => { navigator.back() }}>Close</Button>
                    {/* <ForwardButton setNotify={setNotify} openNotify={openNotify} setModals={setModals} onDisable={onDisable} ref={exceptRef} /> */}
                    <div className="w-full">
                        <Button type="submit" className={'!py-2 px-10 w-full rounded-xl'} onClick={() => { navigator.push("/dashboard/pay")}}>Next</Button>
                    </div>
                </div>
            </div>
        </div>
    </>
}

export default ChooseBudget