import { createContext, useEffect,useState } from 'react'
import Sidebar from "subpages/dashboard/sidebar"
import Navbar from 'subpages/dashboard/navbar'
import { useRefetchData } from 'hooks'
import Loader from 'components/Loader'
import { useAppDispatch, useAppSelector } from 'redux/hooks'
import { SelectAccountType, SelectBlockchain, SelectIsRemoxDataFetching, SelectProviderAddress } from 'redux/slices/account/remoxData'
import { launchApp } from 'redux/slices/account/thunks/launch'
import { auth } from 'firebaseConfig'
import useIndividual from 'hooks/accounts/useIndividual'
import { useRouter } from 'next/router'
import useAsyncEffect from 'hooks/useAsyncEffect'
import { Get_Individual } from 'crud/individual'

export const DashboardContext = createContext<{ refetch: () => void,setMainAnimate?:React.Dispatch<React.SetStateAction<number>>,mainAnimate?: number }>({ refetch: () => { } })


export default function DashboardLayout({ children }: { children: JSX.Element }) {

    const isFetching = useAppSelector(SelectIsRemoxDataFetching)

    const dispatch = useAppDispatch()
    const accountType = useAppSelector(SelectAccountType)
    const address = useAppSelector(SelectProviderAddress)
    const blockchain = useAppSelector(SelectBlockchain)
    const [mainAnimate,setMainAnimate] = useState<number>(0)
    const router = useRouter()

    // const { individual, isIndividualFetching } = useIndividual(address ?? "0", blockchain ?? "celo")

    useAsyncEffect(async () => {
        const individual = await Get_Individual(auth.currentUser?.uid ?? "0")
        if (address && auth.currentUser && blockchain && individual && accountType && accountType === "individual") {
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
        } else {
            router.push("/")
        }
    }, [])

    const { fetching, isAppLoaded } = useRefetchData()

    // useIdleTimer({
    //     timeout: 1000 * 60 * 45,
    //     onIdle: () => dispatch(setUnlock(false)),
    // })

    if (isFetching) return <div className="w-screen h-screen flex items-center justify-center">
        <Loader />
    </div>
    return <>
        <DashboardContext.Provider value={{ refetch: fetching,setMainAnimate,mainAnimate}}>
            <div className="flex flex-col min-h-screen overflow-hidden">
                <div className="fixed w-full pt-6 pb-6 bg-light dark:bg-dark z-50">
                    <Navbar></Navbar>
                </div>
                <div className="flex space-x-11 flex-shrink flex-grow ">
                    <Sidebar />
                    <main className={` ${mainAnimate === 1 ? "-translate-x-full transition duration-[0.33s] ease-out": mainAnimate === 2 ? 'hidden' : 'translate-x-0 transition-transform duration-[.33s] ease-out'} relative col-span-11 md:col-span-8 flex-grow pr-16 xl:pr-20 overflow-hidden pl-[14.188rem]  xl:pl-[17.188rem] pt-28`}>
                        {children}
                    </main>
                </div>
            </div>
        </DashboardContext.Provider>
    </>
}
