import { useEffect, useState, useMemo, SyntheticEvent } from 'react';
import { useDispatch } from 'react-redux';
import Dropdown from 'components/general/dropdown';
import Button from 'components/button';
import { useRouter } from 'next/router';
import { useAppSelector } from 'redux/hooks';
import { SelectAccounts, SelectAllBudgets, SelectProviderAddress, setSelectedAccountAndBudget } from 'redux/slices/account/remoxData';
import { ToastRun } from 'utils/toast';
import { IBudgetORM, ISubbudgetORM } from 'pages/api/budget/index.api';
import { useWalletKit } from 'hooks';

function ChooseBudget() {

    const budgets = useAppSelector(SelectAllBudgets);
    const providerAddress = useAppSelector(SelectProviderAddress);
    const accounts = useAppSelector(SelectAccounts)

    const { Address } = useWalletKit()

    const router = useRouter()

    const [subbudgets, setSubbudgets] = useState<ISubbudgetORM[]>([])


    const dispatch = useDispatch()

    const currentWallet = useMemo(() => accounts.find(s => s.address === providerAddress), [providerAddress])

    const [selectedAccount, setAccount] = useState(currentWallet);
    useEffect(() => setAccount(currentWallet), [currentWallet])

    const [selectedBudget, setBudget] = useState<IBudgetORM>();
    const [selectedSubbudget, setSubbudget] = useState<ISubbudgetORM>();


    useEffect(() => {
        if (selectedBudget) {
            setSubbudgets(budgets.find(b => b.id === selectedBudget.id)?.subbudgets || [])
        }
    }, [selectedBudget])

    const onSubmit = async (e: SyntheticEvent<HTMLFormElement>) => {
        e.preventDefault()
        const address = await Address
        const page = router.query.page;
        if (!page) return ToastRun(<>Page not found</>, "error")
        if (!selectedAccount) return ToastRun(<>Wallet not selected</>, "warning")
        if (selectedAccount.signerType === "single" && selectedAccount.address.toLowerCase() !== address?.toLowerCase()) {
            ToastRun(<>You are not connected to the wallet you've selected</>, "warning")
            return
        }
        if (selectedAccount.signerType === "multi" && !selectedAccount.members.find(s => s.address.toLowerCase() === address?.toLowerCase())) {
            ToastRun(<>Your wallet has no access to this multisig account. Please, switch to a permitted wallet</>, "warning")
            return
        }
        const budget = budgets.find(b => b.id === selectedBudget?.id);
        dispatch(setSelectedAccountAndBudget({
            account: selectedAccount ?? null,
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
                <div className="text-xl font-semibold py-6 text-center">
                    Choose account and budget
                </div>
                <form onSubmit={onSubmit} className='flex flex-col space-y-5'>
                    <div className="flex flex-col gap-2 w-full">
                        {/* <div className="text-greylish dark:text-white">Choose Wallet</div> */}
                        <div className=" gap-5 w-full">
                            <Dropdown
                                label="Choose Wallet"
                                list={accounts as any[]}
                                selected={selectedAccount as any}
                                setSelect={setAccount as any} />
                        </div>
                    </div>
                    {budgets.length > 0 && <div className="flex flex-col gap-2 w-full">
                        {/* <div className="text-greylish dark:text-white">Choose Budget</div> */}
                        <Dropdown
                            selectClass={'py-2'}
                            label="Choose Budget"
                            list={budgets}
                            selected={selectedBudget}
                            setSelect={setBudget}
                        />
                    </div>}
                    {subbudgets.length > 0 && <div className="flex flex-col gap-2 w-full">
                        {/* <div className="text-greylish dark:text-white">Choose Subbudget</div> */}
                        <Dropdown
                            label="Choose Subbudget"
                            list={subbudgets}
                            selected={selectedSubbudget}
                            setSelect={setSubbudget}
                        />
                    </div>}
                    <div className="grid grid-cols-2 w-full pt-4 gap-4 ">
                        <Button version="second" className={'flex items-center justify-center !py-2 w-full rounded-xl'} onClick={() => { router.back() }}>Close</Button>
                        {/* <ForwardButton setNotify={setNotify} openNotify={openNotify} setModals={setModals} onDisable={onDisable} ref={exceptRef} /> */}
                        <div className="w-full">
                            <Button type="submit" className={'flex items-center justify-center !py-2 w-full rounded-xl'} >Next</Button>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    </>
}

export default ChooseBudget