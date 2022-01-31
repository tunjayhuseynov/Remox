import { useContractKit } from "@celo-tools/use-contractkit";
import { AnimatePresence } from "framer-motion";
import { useSelector } from "react-redux";
import { Outlet } from "react-router-dom";
import { ClipLoader } from "react-spinners";
import NotificationCointainer from "../../subpages/notification";
import Visitcard from "../../components/visitcard";
import { selectStorage } from "../../redux/reducers/storage";
import { selectToggle } from "../../redux/reducers/toggles";
import MobileMenu from "../../subpages/dashboard/mobileMenu";
import Navbar, { NavbarDropdown } from "../../subpages/dashboard/navbar";
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
              <NavbarDropdown />
              <div className="relative">
                <NotificationCointainer />
              </div>
            </div>
            <Sidebarlist />
          </div>
        </MobileMenu>
      }
    </AnimatePresence>
    <div className="flex flex-col pt-6 gap-16">
      <Navbar></Navbar>
      <div className="grid grid-cols-2 md:grid-cols-11 md:gap-12">
        <div className="hidden md:block md:col-span-2"><Sidebar /></div>
        <div className="col-span-11 md:col-span-8 pl-2 md:pl-7 pr-2">
          <Suspense fallback={<div className="h-full w-full flex justify-center items-center"><ClipLoader /></div>}>
            <Outlet />
          </Suspense>
        </div>
      </div>
    </div>
  </>
}
