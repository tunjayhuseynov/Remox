import { createContext, useEffect } from 'react'
import Sidebar from "subpages/dashboard/sidebar"
import Navbar from 'subpages/dashboard/navbar'
import { useRefetchData } from 'hooks'
import Loader from 'components/Loader'
import { useAppDispatch, useAppSelector } from 'redux/hooks'
import { SelectAccountType, SelectBlockchain, SelectIsRemoxDataFetching, SelectProviderAddress } from 'redux/slices/account/remoxData'
import { launchApp } from 'redux/slices/account/thunks/launch'
import { auth } from 'firebaseConfig'
import useIndividual from 'hooks/accounts/useIndividual'

export const DashboardContext = createContext<{ refetch: () => void }>({ refetch: () => { } })


export default function DashboardLayout({ children }: { children: JSX.Element }) {

    const isFetching = useAppSelector(SelectIsRemoxDataFetching)

    const dispatch = useAppDispatch()
    const accountType = useAppSelector(SelectAccountType)
    const address = useAppSelector(SelectProviderAddress)
    const blockchain = useAppSelector(SelectBlockchain)

    const { individual, isIndividualFetching } = useIndividual(address ?? "0", blockchain ?? "celo")

    useEffect(() => {
        if (address && auth.currentUser && blockchain && !isIndividualFetching && individual && accountType && accountType === "individual") {
            dispatch(launchApp({
                accountType: accountType,
                addresses: [address],
                blockchain: blockchain,
                id: auth.currentUser.uid,
                storage: {
                    lastSignedProviderAddress: address,
                    signType: accountType,
                    uid: auth.currentUser.uid,
                    individual: individual,
                    organization: null
                }
            }))
        }
    }, [individual])

    const { fetching, isAppLoaded } = useRefetchData()

    // useIdleTimer({
    //     timeout: 1000 * 60 * 45,
    //     onIdle: () => dispatch(setUnlock(false)),
    // })

    if (isFetching) return <div className="w-screen h-screen flex items-center justify-center">
        <Loader />
    </div>
    return <>
        <DashboardContext.Provider value={{ refetch: fetching }}>
            <div className="flex flex-col min-h-screen overflow-hidden">
                <div className="fixed w-full pt-6 pb-6 bg-light dark:bg-dark z-50">
                    <Navbar></Navbar>
                </div>
                <div className="flex space-x-11 flex-shrink flex-grow ">
                    <Sidebar />
                    <div className="relative col-span-11 md:col-span-8 flex-grow pr-16 xl:pr-20 overflow-hidden pl-[14.188rem]  xl:pl-[17.188rem] pt-28">
                        {children}
                    </div>
                </div>
            </div>
        </DashboardContext.Provider>
    </>
}
