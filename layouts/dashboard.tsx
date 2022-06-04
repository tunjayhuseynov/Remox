import { createContext } from 'react'
import { useSelector } from "react-redux"
import { changeError, changeSuccess, selectError, selectSuccess } from "redux/reducers/notificationSlice"
import { selectStorage } from "redux/reducers/storage"
import { selectToggle } from "redux/reducers/toggles"
import { AnimatePresence } from "framer-motion";
import MobileMenu from "subpages/dashboard/mobileMenu"
import Visitcard from "components/visitcard"
import NotificationCointainer from "subpages/notification"
import Sidebarlist from "subpages/dashboard/sidebarlist"
import Sidebar from "subpages/dashboard/sidebar"
import { useDispatch } from 'react-redux'
import Success from 'components/general/success'
import Error from 'components/general/error'
import Navbar from 'subpages/dashboard/navbar'
import { setUnlock } from 'redux/reducers/unlock';
import { useIdleTimer } from 'react-idle-timer'
import { useRefetchData } from 'hooks'
import Loader from 'components/Loader'

export const DashboardContext = createContext<{ refetch: () => void }>({ refetch: () => { } })


export default function DashboardLayout({ children }: { children: JSX.Element }) {

    const storage = useSelector(selectStorage)
    const toggle = useSelector(selectToggle)
    const isSuccess = useSelector(selectSuccess)
    const isError = useSelector(selectError)
    const dispatch = useDispatch()

    const { fetching, isAppLoaded } = useRefetchData()

    useIdleTimer({
        timeout: 1000 * 60 * 45,
        onIdle: () => dispatch(setUnlock(false)),
    })

    if (!isAppLoaded) return <div className="w-screen h-screen flex items-center justify-center">
        <Loader />
    </div>
    return <>
        <DashboardContext.Provider value={{ refetch: fetching }}>
            <AnimatePresence>
                {toggle.mobileMenu &&
                    <MobileMenu>
                        <div className="flex flex-col space-y-10 px-10">
                            <div className="actions flex flex-col items-center justify-evenly space-y-5">
                                {storage ? <Visitcard name="Remox" address={storage.accountAddress} /> : <Loader />}
                                <div className="relative">
                                    <NotificationCointainer />
                                </div>
                            </div>
                            <Sidebarlist />
                        </div>
                    </MobileMenu>
                }
            </AnimatePresence>
            <div className="flex flex-col min-h-screen overflow-hidden">
                <div className="fixed w-full pt-6 pb-3 bg-light dark:bg-dark z-50"><Navbar></Navbar></div>
                <div className="flex space-x-11 flex-shrink flex-grow ">
                    <Sidebar />
                    <div className="relative col-span-11 md:col-span-8 flex-grow pr-16 xl:pr-20 overflow-hidden pl-[14.188rem]  xl:pl-[17.188rem] pt-32">
                        {children}
                    </div>
                </div>
            </div>
            {(isSuccess || isError) &&
                <div className="fixed left-0 top-0 w-screen h-screen">
                    {isSuccess && <Success onClose={(val: boolean) => dispatch(changeSuccess({ activate: val }))} />}
                    {isError && <Error onClose={(val: boolean) => dispatch(changeError({ activate: val }))} />}
                </div>
            }
        </DashboardContext.Provider>
    </>
}
