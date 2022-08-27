import { createContext, Dispatch, useState } from 'react'
import { useRefetchData } from 'hooks'
import Loader from 'components/Loader'
import { useAppDispatch, useAppSelector } from 'redux/hooks'
import { SelectAccountType, SelectBlockchain, SelectIsRemoxDataFetching, SelectProviderAddress, SelectRemoxAccount } from 'redux/slices/account/remoxData'
import { launchApp } from 'redux/slices/account/thunks/launch'
import { auth, IAccount, IOrganization } from 'firebaseConfig'
import { useRouter } from 'next/router'
import useAsyncEffect from 'hooks/useAsyncEffect'
import { Get_Individual } from 'crud/individual'
import { AnimatePresence, motion } from 'framer-motion'
import Navbar from './_components/navbar'
import Sidebar from './_components/sidebar'

export const DashboardContext = createContext<{ refetch: () => void, setMainAnimate?: Dispatch<boolean>, mainAnimate?: boolean }>({ refetch: () => { } })



export default function DashboardLayout({ children }: { children: JSX.Element }) {
    const router = useRouter()
    // const isSecondAnimation = router.query.secondAnimation == 'true'
    // const noAnimation = router.query.noAnimation === 'true'
    // const variants = {
    //     hidden: { opacity: 0, x: isSecondAnimation ? 1000 : -1000, y: 0 },
    //     enter: {
    //         opacity: 1, x: 0, y: 0, transition: {
    //             duration: 0.33,
    //         }
    //     },
    //     exit: {
    //         opacity: 0, x: isSecondAnimation ? -1000 : -1000, y: 0, transition: {
    //             duration: 0.33,
    //         }
    //     },
    // }

    const isFetching = useAppSelector(SelectIsRemoxDataFetching)
    const [mainAnimate, setMainAnimate] = useState<boolean>(true)

    const dispatch = useAppDispatch()
    const accountType = useAppSelector(SelectAccountType)
    const address = useAppSelector(SelectProviderAddress)
    const remoxAccount = useAppSelector(SelectRemoxAccount)
    const blockchain = useAppSelector(SelectBlockchain)

    useAsyncEffect(async () => {
        if (!auth.currentUser) return router.push("/")
        const individual = await Get_Individual(auth.currentUser.uid)
        if (address && auth.currentUser && blockchain && individual && accountType && remoxAccount) {
            dispatch(launchApp({
                accountType: accountType,
                addresses: (remoxAccount.accounts as IAccount[]).map(a => a.address),
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
        <DashboardContext.Provider value={{ refetch: fetching, setMainAnimate, mainAnimate }}>
            <div className="flex flex-col min-h-screen overflow-hidden">
                <div className="fixed w-full bg-white   dark:bg-darkSecond z-50 shadow-15">
                    <Navbar></Navbar>
                </div>
                <div className="flex space-x-11 flex-shrink flex-grow ">
                    <Sidebar />

                    <main key={router.asPath} className={`relative col-span-11 md:col-span-8 flex-grow pr-16 xl:pr-8 overflow-hidden transition-all  pl-[13.188rem] xl:pl-[18.5rem] pt-28`}>
                        {children}
                    </main>

                </div>
            </div>
        </DashboardContext.Provider>
    </>
}

//variants={noAnimation ? {} : variants}  exit="exit" animate="enter" initial="hidden" transition={{ type: "linear" }}