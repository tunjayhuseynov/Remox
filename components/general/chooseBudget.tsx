import { useEffect, useState, useMemo } from 'react';
import { useDispatch } from 'react-redux';
import Dropdown from 'components/general/dropdown';
import Button from 'components/button';
import { useAppSelector } from 'redux/hooks';
import { SelectAccounts, SelectAllBudgets, SelectProviderAddress, setSelectedAccountAndBudget } from 'redux/slices/account/remoxData';
import { ToastRun } from 'utils/toast';
import { IBudgetORM, ISubbudgetORM } from 'pages/api/budget/index.api';
import { useWalletKit } from 'hooks';
import { IAccountORM } from "pages/api/account/index.api";


interface IProps { 
    submit: (account: IAccountORM | undefined, 
        budget?: IBudgetORM | null, 
        subbudget?: ISubbudgetORM | null) => Promise<void>
}

function ChooseBudget({submit} : IProps) {

    const budgets = useAppSelector(SelectAllBudgets);
    const providerAddress = useAppSelector(SelectProviderAddress);
    const accounts = useAppSelector(SelectAccounts)

    const { Address } = useWalletKit()
    const [subbudgets, setSubbudgets] = useState<ISubbudgetORM[]>([])
    const [loading, setLoading] = useState(false)

    const dispatch = useDispatch()

    const currentWallet = useMemo(() => accounts.find(s => s.address.toLowerCase() === providerAddress?.toLowerCase()), [providerAddress])

    const [selectedAccount, setAccount] = useState(currentWallet);
    
    useEffect(() => setAccount(currentWallet), [currentWallet])

    const [selectedBudget, setBudget] = useState<IBudgetORM>();
    const [selectedSubbudget, setSubbudget] = useState<ISubbudgetORM>();


    useEffect(() => {
        if (selectedBudget) {
            setSubbudgets(budgets.find(b => b.id === selectedBudget.id)?.subbudgets || [])
        }
    }, [selectedBudget])

    const onSubmit = async () => {
        try{
            setLoading(true)
            const address = await Address
            if (!selectedAccount) return ToastRun(<>Wallet not selected</>, "warning")
            if (selectedAccount.signerType === "single" && selectedAccount.address.toLowerCase() !== address?.toLowerCase()) {
                ToastRun(<>You are not connected to the wallet you&apos;ve selected</>, "warning")
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
            
            submit(selectedAccount, selectedBudget, selectedSubbudget)

        } catch (error: any) {
            throw new Error(error)
        }

    }


    return <>
        <div className="bg-light dark:bg-dark h-full relative pr-1 overflow-y-auto overflow-x-hidden bottom-0 right-0 cursor-default opacity-100 z-[9999999999999]">
            <div className="w-[25%] mx-auto py-8 flex flex-col gap-5 ">
                <div className="text-xl font-semibold py-6 text-center">
                    Choose account and budget
                </div>
                <div className='flex flex-col space-y-5'>
                    <div className="flex flex-col gap-2 w-full">
                        <div className=" gap-5 w-full">
                            <Dropdown
                                label="Choose Wallet"
                                list={accounts as any[]}
                                selected={selectedAccount as any}
                                setSelect={setAccount as any} />
                        </div>
                    </div>
                    {budgets.length > 0 && <div className="flex flex-col gap-2 w-full">
                        <Dropdown
                            selectClass={'py-2'}
                            label="Choose Budget"
                            list={budgets}
                            selected={selectedBudget}
                            setSelect={setBudget}
                        />
                    </div>}
                    {subbudgets.length > 0 && <div className="flex flex-col gap-2 w-full">
                        <Dropdown
                            label="Choose Subbudget"
                            list={subbudgets}
                            selected={selectedSubbudget}
                            setSelect={setSubbudget}
                        />
                    </div>}
                    <div className="w-full pt-4">
                        <Button
                            type="submit"
                            isLoading={loading}
                            onClick={() => onSubmit()}
                            className={'flex w-full items-center justify-center !py-2 rounded-xl'} >
                            Execute
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    </>
}

export default ChooseBudget