import { useEffect, useState, useMemo, SyntheticEvent } from 'react';
import { useDispatch } from 'react-redux';
import Dropdown from 'components/general/dropdown';
import { DropDownItem } from 'types';
import Button from 'components/button';
import { useRouter } from 'next/router';
import { useAppSelector } from 'redux/hooks';
import { SelectAccounts, SelectAllBudgets, SelectProviderAddress, setSelectedAccountAndBudget } from 'redux/slices/account/remoxData';
import { ToastRun } from 'utils/toast';

function ChooseBudget() {

    const budgetState = useAppSelector(SelectAllBudgets);
    const providerAddress = useAppSelector(SelectProviderAddress);
    const accounts = useAppSelector(SelectAccounts)

    const router = useRouter()

    const list = useMemo(() => {
        return accounts.map(s => ({
            name: s.name || s.address,
            id: s.id
        }))
    }, [accounts])

    const budgets = useMemo(() => {
        return budgetState.map(budgets => ({
            name: budgets.name,
            id: budgets.id,
        }))
    }, [budgetState])

    const [subbudgets, setSubbudgets] = useState<DropDownItem[]>([])


    const dispatch = useDispatch()

    const currentWallet = useMemo(() => accounts.find(s => s.address === providerAddress), [providerAddress])

    const [selectedAccount, setAccount] = useState<DropDownItem>({
        name: currentWallet?.name || currentWallet?.address || "Select a wallet",
        id: currentWallet?.id
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

    const onSubmit = (e: SyntheticEvent<HTMLFormElement>) => {
        e.preventDefault()
        const page = router.query.page;
        if (!page) return ToastRun(<>Page not found</>)
        if (!selectedAccount) return ToastRun(<>Wallet not selected</>)
        const budget = budgetState.find(b => b.id === selectedBudget?.id);
        dispatch(setSelectedAccountAndBudget({
            account: accounts.find(w => w.id === selectedAccount.id) ?? null,
            budget: budget ?? null,
            subbudget: budget?.subbudgets.find(sb => sb.id === selectedSubbudget?.id) ?? null,
        }))

        router.push(`/dashboard/${page}`)
    }

    return <>
        <div className="bg-light dark:bg-dark h-full relative pr-1 w-[85%] overflow-y-auto  overflow-x-hidden bottom-0 right-0  cursor-default ">
            <div className="w-[25%] mx-auto py-8 flex flex-col gap-5 ">
                <button onClick={() => router.back()} className="absolute right-full w-[4rem] top-0 translate-x-[175%] translate-y-[25%] tracking-wider font-bold transition-all hover:text-primary hover:transition-all text-xl flex items-center gap-2">
                    {/* <img src="/icons/cross_greylish.png" alt="" /> */}
                    <span className="text-4xl pb-1">&#171;</span> Back
                </button>
                <div className="text-2xl font-semibold py-6 text-center">
                    Remox Pay
                </div>
                <form onSubmit={onSubmit}>
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
                        <Button version="second" className={'!py-2 px-9 w-full rounded-xl'} onClick={() => { router.back() }}>Close</Button>
                        {/* <ForwardButton setNotify={setNotify} openNotify={openNotify} setModals={setModals} onDisable={onDisable} ref={exceptRef} /> */}
                        <div className="w-full">
                            <Button type="submit" className={'!py-2 px-10 w-full rounded-xl'} >Next</Button>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    </>
}

export default ChooseBudget