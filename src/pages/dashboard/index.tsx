import { AnimatePresence } from "framer-motion";
import { useSelector } from "react-redux";
import { Outlet } from "react-router-dom";
import { ClipLoader } from "react-spinners";
import NotificationCointainer from "../../subpages/notification";
import Visitcard from "../../components/visitcard";
import { selectStorage } from "../../redux/reducers/storage";
import { selectToggle } from "../../redux/reducers/toggles";
import MobileMenu from "../../subpages/dashboard/mobileMenu";
import Navbar from "../../subpages/dashboard/navbar";
import Sidebar from "../../subpages/dashboard/sidebar";
import Sidebarlist from "../../subpages/dashboard/sidebarlist";
import { Suspense } from "react";

export default function Dashboard() {
  const toggle = useSelector(selectToggle)
  const storage = useSelector(selectStorage)

  return <>
    <AnimatePresence>
      {toggle.mobileMenu &&
        <MobileMenu>
          <div className="flex flex-col space-y-10 px-10">
            <div className="actions flex flex-col items-center justify-evenly space-y-5">
              {storage ? <Visitcard name="Remox" address={storage.accountAddress} /> : <ClipLoader />}
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
      <div className="flex space-x-11 flex-shrink flex-grow relative">
        <Sidebar />
        <div className="col-span-11 md:col-span-8 flex-grow pr-20 overflow-hidden pl-[17.188rem] pt-32">
          <Suspense fallback={<div className="h-full w-full flex justify-center items-center"><ClipLoader /></div>}>
            <Outlet />
          </Suspense>
        </div>
      </div>
    </div>

  </>
}
