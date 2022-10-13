import { useEffect, useMemo, useState } from 'react';
import Dropdown from 'components/general/dropdown';
import Siderbarlist from './sidebarlist'
import Button from 'components/button';
import { useRouter } from 'next/router';
import { useAppDispatch, useAppSelector } from 'redux/hooks';
import { SelectAccounts, SelectAccountType, SelectAllOrganizations, SelectFiatSymbol, SelectIndividual, SelectOrganization, SelectProviderAddress, SelectTotalBalance, setAccountType, setProviderID } from 'redux/slices/account/remoxData';
import { SetComma } from 'utils';
import makeBlockie from 'ethereum-blockies-base64';
import { launchApp } from 'redux/slices/account/thunks/launch';
import { auth, IAccount } from 'firebaseConfig';
import { setStorage } from 'redux/slices/account/storage';
import { ToastRun } from 'utils/toast';
import { Blockchains } from 'types/blockchains';

const Sidebar = () => {

    const allOrganizations = useAppSelector(SelectAllOrganizations)
    const organization = useAppSelector(SelectOrganization)
    const individual = useAppSelector(SelectIndividual)
    const selectedAccountType = useAppSelector(SelectAccountType)
    const accounts = useAppSelector(SelectAccounts)
    const totalBalance = useAppSelector(SelectTotalBalance)
    const dispatch = useAppDispatch()
    const selectedAddress = useAppSelector(SelectProviderAddress)

    const navigator = useRouter()
    const [showBar, setShowBar] = useState<boolean>(true)
    const symbol = useAppSelector(SelectFiatSymbol)

    let organizationList = [
        ...(organization ? allOrganizations.map(e => {
            return {
                id: e.id,
                name: e.name,
                image: (typeof e.image?.imageUrl === 'string' ? e.image.imageUrl : null) || e.image?.nftUrl || makeBlockie(e.id),
                secondValue: `${symbol}${SetComma(0/*e.totalBalance*/)}`,
                onClick: () => {
                    if (!individual) return ToastRun(<>You must be logged in as an individual to switch organizations</>, "error")
                    if (!selectedAddress) return ToastRun(<>You must be logged in as an individual to switch organizations</>, "error")
                    if (!auth.currentUser) return ToastRun(<>You must be logged in as an individual to switch organizations</>, "error")
                    dispatch(setAccountType("organization"))
                    dispatch(setProviderID(e.id));
                    dispatch(setStorage({
                        individual: individual,
                        organization: organization,
                        lastSignedProviderAddress: selectedAddress,
                        signType: "organization",
                        uid: auth.currentUser.uid,
                    }))
                    dispatch(launchApp({
                        accountType: "organization",
                        addresses: (e.accounts as IAccount[]),
                        blockchain: Blockchains.find(s => s.name === 'celo')!,
                        id: e.id,
                        storage: {
                            lastSignedProviderAddress: selectedAddress,
                            signType: "organization",
                            uid: auth.currentUser.uid,
                            individual: individual,
                            organization: e,
                        }
                    }))
                    // navigator.push(`/dash`)
                }
            }
        }) : []),
        { id: "0", name: "+ Add Organization", secondValue: "", image: "", onClick: () => { navigator.push('/create-organization') } }
    ]

    const currentOrganization = organization ? organizationList.find(e => e.id === organization.id) : undefined;

    const selectedItem = currentOrganization ?? {
        id: individual?.id ?? "0",
        name: individual?.name ?? "name",
        image: individual?.image?.imageUrl || individual?.image?.nftUrl || makeBlockie(individual?.id ?? "random"),
        secondValue: `${symbol}${totalBalance.toFixed(2)}`,
        onClick: () => { }
    }


    return <>
        <div className={`hover:scrollbar-thumb-gray-200 dark:hover:scrollbar-thumb-greylish scrollbar-thin fixed w-[16.5%] 2xl:w-[15%] 3xl:w-[15%] h-full hidden md:block z-[1] md:col-span-2 transitiion-all  flex-none  overflow-y-auto pt-28 bg-[#FFFFFF]  dark:bg-darkSecond shadow-15`}>
            <div className='flex flex-col px-9'>
                <div className='flex items-center space-y-1'>
                    <Dropdown
                        parentClass="w-full bg-white dark:bg-darkSecond truncate"
                        list={organizationList}
                        selected={selectedItem}
                        // setSelect={setItem as any}
                        className="text-sm"
                        textClass={'!h-5 text-xs'}
                        sx={{ '.MuiSelect-select ': { paddingTop: '5px !important', paddingBottom: '5px !important', paddingLeft: '7px', maxHeight: '50px' } }}></Dropdown>
                </div>
                <div className="grid grid-rows-[95%,1fr] pb-4  h-full">
                    <div>
                        <Siderbarlist showbar={showBar} />
                        <Button className="px-8 !py-[.5rem] !text-lg  mb-10  w-full font-semibold" onClick={() => {
                            navigator.push("/dashboard/choose-budget?page=pay")
                        }}>Send</Button>
                    </div>
                </div>
            </div>
        </div>
    </>;
}

export default Sidebar;