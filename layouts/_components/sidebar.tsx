import { useContext, useEffect, useMemo, useRef, useState } from 'react';
import { useDispatch } from 'react-redux';
import Dropdown from 'components/general/dropdown';
import Siderbarlist from './sidebarlist'
import Modal from 'components/general/modal';
import { changeError, changeSuccess } from 'redux/slices/notificationSlice';
import { DropDownItem } from 'types';
import Button from 'components/button';
import useMultisig, { SolanaMultisigData } from 'hooks/walletSDK/useMultisig';
import { useRouter } from 'next/router';
import { useWalletKit } from 'hooks';
import { useAppSelector } from 'redux/hooks';
import { SelectAccounts, SelectAccountType, SelectAllOrganizations, SelectIndividual, SelectOrganization } from 'redux/slices/account/remoxData';
import Create from 'pages/dashboard/multisig/_components/create';
import { SelectTotalBalance } from 'redux/slices/currencies';
import { SetComma } from 'utils';

const Sidebar = () => {

    const { importMultisigAccount } = useMultisig()
    const allOrganizations = useAppSelector(SelectAllOrganizations)
    const organization = useAppSelector(SelectOrganization)
    const individual = useAppSelector(SelectIndividual)
    const selectedAccountType = useAppSelector(SelectAccountType)
    const totalBalance = useAppSelector(SelectTotalBalance)
    const accounts = useAppSelector(SelectAccounts)

    const navigator = useRouter()
    const accountType = useAppSelector(SelectAccountType)
    const [showBar, setShowBar] = useState<boolean>(true)
    const dispatch = useDispatch()

    const [isAccountModal, setAccountModal] = useState(false)
    const [isImportModal, setImportModal] = useState(false)
    const [isCreateModal, setCreateModal] = useState(false)
    // const { setMainAnimate } = useContext(DashboardContext) as { setMainAnimate: React.Dispatch<React.SetStateAction<boolean>> }
    // if(showBar){
    //     setMainAnimate(true)
    // }else{
    //     setMainAnimate(false)
    // }

    const importInputRef = useRef<HTMLInputElement>(null)
    const importNameInputRef = useRef<HTMLInputElement>(null)

    const importClick = async () => {
        if (importInputRef.current && importInputRef.current.value) {
            try {
                await importMultisigAccount(importInputRef.current.value, (importNameInputRef.current?.value ?? ""), null, accountType!)
                dispatch(changeSuccess({ activate: true, text: "Successfully imported" }))
                setImportModal(false)
            } catch (error: any) {
                console.error(error)
                dispatch(changeError({ activate: true, text: (error || "Something went wrong") }))
                setImportModal(false)
            }
        }
    }

    const organizationList = useMemo(() => {
        if (individual) return []
        const list = [...allOrganizations.map(e => {
            return {
                id: e.id,
                name: e.name,
                image: e.image,
                secondValue: `$${SetComma(e.totalBalance)}`,
                onClick: () => {
                    navigator.push(`/organization/${e.id}`)
                }
            }
        })]
        if (list.length > 0) {
            list.push({ id: "0", name: "Add Organization", secondValue: "", image: null, onClick: () => { navigator.push('/create-organization') } })
        }
        return list;
    }, [allOrganizations, selectedAccountType])

    // const list = [
    //     { name: "Treasury vault 0", secondValue: '$2,800', image: "nftmonkey" },
    //     { name: "Treasury vault 1", secondValue: '$3,700', image: "" },
    //     { name: "Add Organization", onClick: () => { navigator.push('/create-organization') } }
    // ]

    const currentOrganization = organization ? organizationList.find(e => e.id === organization.id) : undefined;

    const [selectedItem, setItem] = useState(selectedAccountType === "organization" ? currentOrganization : {
        id: "0",
        name: individual?.name ?? "",
        image: individual?.image ?? null,
        secondValue: `$${SetComma(accounts.reduce((acc, e) => acc + e.totalValue, 0))}`,
        onClick: () => { }
    })


    return <>
        <div className={`h-full hidden md:block z-[1] md:col-span-2 transitiion-all ${showBar ? 'w-[17.188rem] ' : 'w-[6rem]'} flex-none fixed pt-28 bg-light dark:bg-dark`}>
            <div className="grid grid-rows-[95%,1fr] pb-4 pl-4 lg:pl-10 h-full">
                <div>
                    <Dropdown
                        // className="min-w-[13.5rem]bg-white dark:bg-darkSecond truncate"
                        // label='Account'
                        className="w-full"
                        list={organizationList as any}
                        selected={selectedItem as any}
                        setSelect={setItem as any}
                    />
                    <Siderbarlist showbar={showBar} />
                    <Button className="px-8 !py-1 ml-7  min-w-[60%]" onClick={() => {
                        navigator.push("/dashboard/choose-budget?page=pay")
                    }}>Send</Button>
                </div>

            </div>
        </div>

        {isAccountModal && <Modal onDisable={setAccountModal} disableX={true}>
            <div className="flex flex-col gap-8 mt-[-2rem]">
                <div className="text-center font-semibold pt-4 text-xl">Multi-Signature Account</div>
                <div className="flex space-x-3 border border-greylish  py-3 rounded-md cursor-pointer items-center justify-center" onClick={() => {
                    setCreateModal(true)
                    setAccountModal(false)
                }}>
                    <span>Create Multisig Account</span>
                </div>
                <div className="flex space-x-3 border border-greylish  py-3 rounded-md cursor-pointer items-center justify-center" onClick={() => {
                    setImportModal(true)
                    setAccountModal(false)
                }}>
                    <span>Import Multisig Account</span>
                </div>
                <div className="flex items-center justify-center"><Button onClick={() => setAccountModal(false)} className=" w-[30%] !px-4 !py-2">Cancel</Button></div>
            </div>
        </Modal>}
        {isImportModal && <Modal onDisable={setImportModal} disableX={true}>
            <div className="flex flex-col gap-4 mt-[-2rem]">
                <div className="text-center font-semibold text-xl">Import MultiSig Account</div>
                <div className="flex flex-col">
                    <span className="text-greylish opacity-35 pl-3">MultiSig Name</span>
                    <input ref={importNameInputRef} type="text" className="border p-3 rounded-md border-greylish dark:bg-darkSecond outline-none" placeholder="Multisig name" />
                </div>
                <div className="flex flex-col">
                    <span className="text-greylish opacity-35 pl-3">MultiSig Address</span>
                    <input ref={importInputRef} type="text" className="border p-3 rounded-md border-greylish dark:bg-darkSecond outline-none" placeholder="Multisig Address" />
                </div>
                <div className="flex justify-center gap-5">
                    <Button className="!px-10 !py-2" version="second" onClick={() => setImportModal(false)}>
                        Cancel
                    </Button>
                    <Button className="!px-10 !py-2" onClick={importClick} >
                        Import
                    </Button>
                </div>
            </div>
        </Modal>}
        {
            isCreateModal && <Modal onDisable={setCreateModal} disableX={true}>
                <Create setCreateModal={setCreateModal} />
            </Modal>
        }
        {/* {isSuccess && <Success onClose={(val: boolean) => dispatch(changeSuccess({ activate: val }))} />}
        {isError && <Error onClose={(val: boolean) => dispatch(changeError({ activate: val }))} />} */}
    </>
}

export default Sidebar;