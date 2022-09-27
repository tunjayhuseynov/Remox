import { useEffect, useMemo, useState } from 'react';
import Dropdown from 'components/general/dropdown';
import Siderbarlist from './sidebarlist'
import Button from 'components/button';
import { useRouter } from 'next/router';
import { useAppSelector } from 'redux/hooks';
import { SelectAccounts, SelectAccountType, SelectAllOrganizations, SelectFiatSymbol, SelectIndividual, SelectOrganization, SelectTotalBalance } from 'redux/slices/account/remoxData';
import { SetComma } from 'utils';
import makeBlockie from 'ethereum-blockies-base64';

const Sidebar = () => {

    const allOrganizations = useAppSelector(SelectAllOrganizations)
    const organization = useAppSelector(SelectOrganization)
    const individual = useAppSelector(SelectIndividual)
    const selectedAccountType = useAppSelector(SelectAccountType)
    const accounts = useAppSelector(SelectAccounts)
    const totalBalance = useAppSelector(SelectTotalBalance)

    const navigator = useRouter()
    const [showBar, setShowBar] = useState<boolean>(true)
    const symbol = useAppSelector(SelectFiatSymbol)

    const organizationList = useMemo(() => {
        if (individual) return [{ id: "0", name: "+ Add Organization", secondValue: "", image: "", onClick: () => { navigator.push('/create-organization') } }]
        const list = [...allOrganizations.map(e => {
            return {
                id: e.id,
                name: e.name,
                image: (typeof e.image?.imageUrl === 'string' ? e.image.imageUrl : null) || e.image?.nftUrl || makeBlockie(e.id),
                secondValue: `${symbol}${SetComma(0/*e.totalBalance*/)}`,
                onClick: () => {
                    navigator.push(`/organization/${e.id}`)
                }
            }
        })]
        list.push({ id: "0", name: "Add Organization", secondValue: "", image: "", onClick: () => { navigator.push('/create-organization') } })
        return list;
    }, [allOrganizations, selectedAccountType])


    const currentOrganization = organization ? organizationList.find(e => e.id === organization.id) : undefined;

    const [selectedItem, setItem] = useState<{
        id: string;
        name: string;
        secondValue: string;
        image: string;
        onClick: () => void;
    }>()

    useEffect(() => {
        if (selectedAccountType === "individual") {
            setItem({
                id: "0",
                name: individual?.name ?? "",
                image: (typeof individual?.image?.imageUrl === 'string' ? individual.image.imageUrl : null) ?? individual?.image?.nftUrl ?? makeBlockie(individual!.id),
                secondValue: `${symbol}${totalBalance.toFixed(2)}`,
                onClick: () => { }
            })
        } else {
            setItem(currentOrganization)
        }
    }, [totalBalance])

    return <>
        <div className={`hover:scrollbar-thumb-gray-200   dark:hover:scrollbar-thumb-greylish fixed w-[17.5%] 2xl:w-[15%] 3xl:w-[15%] scrollbar-thin h-full hidden md:block z-[1] md:col-span-2 transitiion-all  flex-none  overflow-y-auto pt-32 bg-[#FFFFFF]  dark:bg-darkSecond shadow-15`}>
            <div className='flex flex-col px-9'>
                <div className='flex items-center gap-3'>
                    <Dropdown
                        parentClass="w-full bg-white dark:bg-darkSecond truncate"
                        list={organizationList}
                        selected={selectedItem}
                        setSelect={setItem as any}
                        textClass={'!h-6'}
                        sx={{ '.MuiSelect-select ': { paddingTop: '5px !important', paddingBottom: '5px !important', paddingLeft: '7px', maxHeight: '50px' } }}
                    />
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
    </>
}

export default Sidebar;