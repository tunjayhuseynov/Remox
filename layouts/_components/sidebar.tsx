import { useEffect, useMemo, useState } from 'react';
import Siderbarlist from './sidebarlist'
import Button from 'components/button';
import { useRouter } from 'next/router';
import { useAppDispatch, useAppSelector } from 'redux/hooks';
import { SelectAccounts, SelectAccountType, SelectAllOrganizations, SelectFiatPreference, SelectFiatSymbol, SelectID, SelectIndividual, SelectOrganization, SelectProviderAddress, SelectTotalBalance, setAccountType, setProviderID } from 'redux/slices/account/remoxData';
import makeBlockie from 'ethereum-blockies-base64';
import { launchApp } from 'redux/slices/account/thunks/launch';
import { auth, IAccount } from 'firebaseConfig';
import { setStorage } from 'redux/slices/account/storage';
import { ToastRun } from 'utils/toast';
import { Blockchains } from 'types/blockchains';
import { GetFiatPrice } from 'utils/const';
// import { AiOutlineDown } from 'react-icons/ai';
import { AnimatePresence, motion } from 'framer-motion';
import { ClickAwayListener } from '@mui/material';
import { IPrice } from 'utils/api';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { NG } from 'utils/jsxstyle';

const Sidebar = () => {

    const allOrganizations = useAppSelector(SelectAllOrganizations)
    const organization = useAppSelector(SelectOrganization)
    const individual = useAppSelector(SelectIndividual)
    const selectedAccountType = useAppSelector(SelectAccountType)
    const id = useAppSelector(SelectID)
    const fiat = useAppSelector(SelectFiatPreference)
    const accounts = useAppSelector(SelectAccounts)
    const totalBalance = useAppSelector(SelectTotalBalance)
    const dispatch = useAppDispatch()
    const selectedAddress = useAppSelector(SelectProviderAddress)

    const navigator = useRouter()
    const [showBar, setShowBar] = useState<boolean>(true)
    const symbol = useAppSelector(SelectFiatSymbol)

    const [sidedown, setSidedown] = useState(false)

    let organizationList = [
        ...(organization ? allOrganizations.map(e => {
            // let pc = e?.priceCalculation ?? "current";
            // let fiat = e?.fiatMoneyPreference ?? "USD";

            let tb = 0;
            if (id === e.id) {
                tb = totalBalance
            }
            else {
                e.accounts.forEach((account) => {
                    (account as any).coins.forEach((coin: IPrice[0]) => {
                        tb += (coin.amount * GetFiatPrice(coin, fiat)) //generatePriceCalculation(coin, hp, pc, fiat);
                    })
                })
            }

            return {
                id: e.id,
                name: e.name,
                image: (typeof e.image?.imageUrl === 'string' ? e.image.imageUrl : null) || e.image?.nftUrl || makeBlockie(e.id),
                secondValue: <>{symbol}<NG number={tb} decimalSize={100} fontSize={0.625} /></>,
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
        // { id: "0", name: "+ Add Organization", secondValue: "", image: "", onClick: () => { navigator.push('/create-organization') } }
    ]

    const currentOrganization = organization ? organizationList.find(e => e.id === organization.id) : undefined;

    const selectedItem = currentOrganization ?? {
        id: individual?.id ?? "0",
        name: individual?.name ?? "name",
        image: individual?.image?.imageUrl || individual?.image?.nftUrl || makeBlockie(individual?.id ?? "random"),
        secondValue: <>{symbol}<NG number={totalBalance} decimalSize={100} fontSize={0.625} /></>,
        onClick: () => { }
    }

    const filteredOrganization = organizationList.filter(s => s.id !== selectedItem.id)

    return <>
        <div className={`hover:scrollbar-thumb-gray-200 dark:hover:scrollbar-thumb-greylish scrollbar-thin fixed w-[16.875%] 2xl:w-[18%] 3xl:w-[15%] h-full hidden md:block z-[1] md:col-span-2 transitiion-all  flex-none  overflow-y-auto pt-28 bg-[#FFFFFF]  dark:bg-darkSecond shadow-15`}>
            <div className='flex flex-col px-9'>
                <div className='space-y-1 border border-[#D6D6D6] dark:border-greylish rounded-md w-full px-3 py-1 cursor-pointer relative'>
                    <div className='grid grid-cols-[25%,61%,1fr]' onClick={() => setSidedown(!sidedown)}>
                        <div className='self-center'>
                            <img src={selectedItem.image ?? makeBlockie(selectedItem.name ?? "random")} className='w-[1.875rem] h-[1.875rem] object-cover rounded-full' alt="" />
                        </div>
                        <div className='flex flex-col pl-1'>
                            <div className='text-sm 2xl:text-xs'>{selectedItem.name}</div>
                            <div className='text-xxs text-greylish'>{selectedItem.secondValue}</div>
                        </div>
                        <div className='flex items-center justify-end'>
                            <ExpandMoreIcon className={`text-greylish dark:text-white text-opacity-50 transition-all ${sidedown ? "rotate-180" : "rotate-0"}`} />
                        </div>
                    </div>
                    <AnimatePresence>
                        {sidedown && <div className='absolute overflow-hidden -bottom-1 bg-white dark:bg-darkSecond translate-y-full w-full left-0 z-[999999999999] border border-[#D6D6D6] dark:border-greylish rounded-md'>
                            <ClickAwayListener onClickAway={() => setSidedown(false)}>
                                <motion.div className="overflow-auto max-h-[200px]" animate={{ opacity: 1 }} initial={{ opacity: 0 }} transition={{ duration: .33 }} exit={{ opacity: 0 }}>
                                    <div>
                                        {filteredOrganization.map((e, i) => {
                                            return <div key={e.id} className="flex flex-col dark:hover:bg-white dark:hover:bg-opacity-5" onClick={() => e.onClick()}>
                                                <div className={`${i === 0 ? "rounded-t-md" : ""} grid grid-cols-[25%,55%,1fr] px-3 py-1 border border-[#D6D6D6] dark:border-greylish border-b`}>
                                                    <div className="self-center">
                                                        <img src={e.image ?? makeBlockie(e.name ?? "random")} className='w-[1.875rem] h-[1.875rem] object-cover rounded-full' alt="" />
                                                    </div>
                                                    <div className='flex flex-col pl-1'>
                                                        <div className='text-sm 2xl:text-xs'>{e.name}</div>
                                                        <div className='text-xxs text-greylish'>{e.secondValue}</div>
                                                    </div>
                                                    <div className='flex items-center justify-end'>
                                                        {/* <AiOutlineDown className='text-greylish dark:text-white text-opacity-50' /> */}
                                                    </div>
                                                </div>
                                            </div>
                                        })}
                                        <div className="flex flex-col dark:hover:bg-white dark:hover:bg-opacity-5" onClick={() => { navigator.push('/create-organization') }}>
                                            <div className={`rounded-b-md px-3 py-2 border border-[#D6D6D6] dark:border-greylish border-b`}>
                                                {/* <div className="items-center flex justify-center">
                                                    <div className="w-3 h-3 rounded-full border border-primary"></div>
                                                    {/* <img src={e.image ?? makeBlockie(e.name ?? "random")} className='w-7 h-7 object-cover rounded-full' alt="" /> u
                                                    
                                                </div> 
                                                */}
                                                <div className='flex pl-1 items-center'>
                                                    <div className='text-xs font-semibold text-primary'>+ Add Organization</div>
                                                    {/* <div className='text-xxs text-greylish'>{e.secondValue}</div> */}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </motion.div>
                            </ClickAwayListener>
                        </div>}
                    </AnimatePresence>
                    {/* <Dropdown
                        parentClass="w-full bg-white dark:bg-darkSecond truncate"
                        list={organizationList}
                        selected={selectedItem}
                        // setSelect={setItem as any}
                        className="text-sm"
                        textClass={'!h-5 text-xs'}
                        sx={{ '.MuiSelect-select ': { paddingTop: '5px !important', paddingBottom: '5px !important', paddingLeft: '7px', maxHeight: '50px' } }}></Dropdown> */}
                </div>
                <div className="grid grid-rows-[95%,1fr] pb-4  h-full">
                    <div>
                        <Siderbarlist showbar={showBar} />
                        <Button className="px-8 !py-[.5rem] !text-sm  mb-10  w-full font-medium" onClick={() => {
                            navigator.push("/dashboard/choose-budget?page=pay")
                        }}>Send</Button>
                    </div>
                </div>
            </div>
        </div>
    </>;
}

export default Sidebar;