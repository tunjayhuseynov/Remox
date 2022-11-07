import { createContext, Dispatch, useState, useEffect, useRef } from 'react'
import { useRefetchData } from 'hooks'
import Loader from 'components/Loader'
import { useAppDispatch, useAppSelector } from 'redux/hooks'
import { SelectAccountType, SelectBlockchain, SelectIsRemoxDataFetching, SelectProviderAddress, SelectRemoxAccount } from 'redux/slices/account/remoxData'
import { launchApp } from 'redux/slices/account/thunks/launch'
import { auth, IAccount, IOrganization } from 'firebaseConfig'
import { useRouter } from 'next/router'
import { Get_Individual } from 'crud/individual'
import Navbar from './_components/navbar'
import Sidebar from './_components/sidebar'


export const DashboardContext = createContext<{ refetch: () => void, setMainAnimate?: Dispatch<boolean>, mainAnimate?: boolean }>({ refetch: () => { } })



export default function DashboardLayout({ children }: { children: JSX.Element }) {
    const router = useRouter()


    const isFetching = useAppSelector(SelectIsRemoxDataFetching)
    const [mainAnimate, setMainAnimate] = useState<boolean>(true)

    const dispatch = useAppDispatch()
    const accountType = useAppSelector(SelectAccountType)
    const address = useAppSelector(SelectProviderAddress)
    const remoxAccount = useAppSelector(SelectRemoxAccount)
    const blockchain = useAppSelector(SelectBlockchain)



    useEffect(() => {
        (async () => {
            if (!auth.currentUser) return await router.push("/")
            const individual = await Get_Individual(auth.currentUser.uid)
            if (address && auth.currentUser && blockchain && individual && accountType && remoxAccount) {
                dispatch(launchApp({
                    accountType: accountType,
                    addresses: (remoxAccount.accounts as IAccount[]),
                    blockchain: blockchain,
                    id: remoxAccount.id,
                    storage: {
                        lastSignedProviderAddress: address,
                        signType: accountType,
                        uid: auth.currentUser.uid,
                        individual: individual,
                        organization: accountType === "organization" ? (remoxAccount as IOrganization) : null,
                    }
                }))
            } else {
                router.push("/")
            }
        })()
    }, [])

    const { fetching, isAppLoaded } = useRefetchData()


    if (isFetching) return <div className="w-screen h-screen flex items-center justify-center">
        <Loader />
    </div>
    return <>
        <DashboardContext.Provider value={{ refetch: fetching, setMainAnimate, mainAnimate }}>
            <div className="flex flex-col min-h-screen ">
                <div className="fixed w-full bg-white dark:bg-darkSecond z-50 shadow-15">
                    <Navbar></Navbar>
                </div>
                <div className="flex">
                    <div className='w-[16.875%] 2xl:w-[18%] 3xl:w-[15%]'>
                        <Sidebar />
                    </div>
                    <main key={router.asPath} id='main' className={`relative w-[83.125%] 2xl:w-[82%] 3xl:w-[85%] transition-all pt-[3rem] overflow-y-hidden h-screen`}>
                        <div className='w-full overflow-y-auto overflow-x-hidden h-full hover:scrollbar-thumb-gray-200 dark:hover:scrollbar-thumb-greylish scrollbar-thin pr-8 pt-[4rem] pl-[4.25rem] pb-8'>
                            {children}
                        </div>
                    </main>
                </div>
            </div>
        </DashboardContext.Provider>
    </>
}