import React from "react"
import "./dist/index.css"
import { localStorageKeys } from "@celo-tools/use-contractkit";
import { useSelector } from "react-redux";
import { Navigate, Route, Routes, useNavigate,useLocation } from "react-router-dom";
import { selectStorage } from "./redux/reducers/storage";
import { selectUnlock } from "./redux/reducers/unlock";
import { lazy, Suspense, useEffect, useLayoutEffect, useMemo, useState } from 'react'
import { ClipLoader } from "react-spinners";
import { selectDarkMode } from "redux/reducers/notificationSlice";

import CreateAccount from "./pages/create-account"
import Unlock from "./pages/unlock";
import Home from "./pages/home";
import Layout from "pages/dashboard/layout";
import RequestLayout from "pages/dashboard/requests/layout";
import TabPage from "pages/dashboard/requests/tab";
import Form from "pages/dashboard/requests/form";
import DynamicPayroll from "pages/dashboard/payroll/dynamic";
import TagsSetting from "pages/dashboard/settings/tags";
import DynamicLendBorrow from "pages/dashboard/lend&borrow/dynamic";
import { ToastContainer } from "react-toastify";
import { useWalletKit } from "hooks";

const MassPay = lazy(() => import("pages/masspay"))
const Automations = lazy(() => import("pages/dashboard/automations"));
const Insight = lazy(() => import("pages/dashboard/insight"))
const Payroll = lazy(() => import("pages/dashboard/payroll"));
const Pay = lazy(() => import("pages/pay"));
const LendBorrow = lazy(() => import("pages/dashboard/lend&borrow"))
const SettingLayout = lazy(() => import("pages/dashboard/settings"));
const OwnerSetting = lazy(() => import("pages/dashboard/settings/owner"));
const SpendingSetting = lazy(() => import("pages/dashboard/settings/spending"));
const ProfileSetting = lazy(() => import("pages/dashboard/settings/profile"));
const Dashboard = lazy(() => import("./pages/dashboard"));
const Main = lazy(() => import("./pages/dashboard/main"));
const Transactions = lazy(() => import("./pages/dashboard/transactions"));
const Assets = lazy(() => import("./pages/dashboard/assets"));
const Contributors = lazy(() => import("./pages/dashboard/contributors"));
const Details = lazy(() => import("./pages/dashboard/transactions/details"));
const Swap = lazy(() => import("./pages/dashboard/swap/index"));
const MultisigTransaction = lazy(() => import("pages/dashboard/multisig/transaction"));


function App() {
  const { Address, Disconnect } = useWalletKit();
  const unlock = useSelector(selectUnlock)
  const storage = useSelector(selectStorage)
  const darkMode = useSelector(selectDarkMode)
  const navigate = useNavigate()

  useLayoutEffect(() => {
    document.documentElement.classList.add(darkMode ? "dark" : "light", darkMode ? "tw-dark" : "tw-light")
    document.documentElement.classList.remove(darkMode ? "light" : "dark", darkMode ? "tw-light" : "tw-dark")
  }, [darkMode])

  useEffect(() => {
    if (localStorage.getItem(localStorageKeys.lastUsedWalletType) && localStorage.getItem(localStorageKeys.lastUsedWalletType) === "PrivateKey") {
      Disconnect().then(s => navigate('/'))
    }
  }, [])

  function useQuery() {
    const { search } = useLocation();
  
    return React.useMemo(() => new URLSearchParams(search), [search]);
  }
  let query = useQuery();

  const address = Address
  return (
    <div>
      <ToastContainer />
      <Suspense fallback={<div className="h-screen w-full flex justify-center items-center"><ClipLoader /></div>}>
        <Routes>
          <Route path="/" element={
            <LockIfUserIn unlock={unlock} storage={!!address && !!storage}>
              <Home blockchain={query.get("blockchain")} />
            </LockIfUserIn>
          } />
         
          <Route path="/create-account" element={<CreateAccount />} />
          <Route path="/unlock" element={
            (!!address) ? <Unlock /> : <Navigate to={'/'} replace />
          } />
          <Route path={'/requests/:id'} element={
            <Form />} />
          <Route path="/dashboard" element={
            <ProtectUser unlock={unlock} storage={!!address && !!storage}>
              <Layout />
            </ProtectUser>} >
            <Route path={'pay'} element={
              <ProtectUser unlock={unlock} storage={!!address && !!storage}>
                <Pay />
              </ProtectUser>} />
            <Route path={'masspayout'} element={
              <ProtectUser unlock={unlock} storage={!!address && !!storage}>
                <MassPay />
              </ProtectUser>} />
            <Route path={'multisig/:id'} element={
              <ProtectUser unlock={unlock} storage={!!address && !!storage}>
                <MultisigTransaction />
              </ProtectUser>} />
            <Route path="" element={
              <Suspense fallback={<div className="h-screen w-full flex justify-center items-center"><ClipLoader /></div>}>
                <Dashboard />
              </Suspense>
            }>
              <Route path="" element={<Main />} />
              <Route path="transactions" element={<Transactions />} />
              <Route path="transactions/pending" element={<Transactions />} />
              <Route path="transactions/rejected" element={<Transactions />} />
              <Route path="assets" element={<Assets />} />
              <Route path="contributors" element={<Contributors />} />
              <Route path="insight" element={<Insight />} />
              <Route path="automations" element={<Automations />} />
              <Route path="swap" element={<Swap />} />
              <Route path="payroll" element={<Payroll />} >
                <Route path="" element={<DynamicPayroll type="manual" />} />
                <Route path="automation" element={<DynamicPayroll type="auto" />} />
              </Route>
              <Route path={'transactions/:id'} element={<Details />} />
              <Route path={'settings'} element={
                <SettingLayout />
              }>
                <Route path={''} element={<OwnerSetting />} />
                <Route path={`spending`} element={<SpendingSetting />} />
                <Route path={`profile`} element={<ProfileSetting />} />
                <Route path={`tags`} element={<TagsSetting />} />
              </Route>
              <Route path="lend-and-borrow" element={<LendBorrow />}>
                <Route path="" element={<DynamicLendBorrow type="lend" />} />
                <Route path="borrow" element={<DynamicLendBorrow type="borrow" />} />
              </Route>
              <Route path={'requests'} element={

                <RequestLayout />
              }>
                <Route path={''} element={<TabPage />} />
                <Route path={`approved`} element={<TabPage />} />
                <Route path={`rejected`} element={<TabPage />} />
              </Route>
            </Route>
          </Route>
        </Routes>
      </Suspense>
    </div >
  );
}


const LockIfUserIn = ({ unlock, storage, children }: { unlock: boolean, storage: boolean, children: JSX.Element }) => {
  if (!unlock && storage) return <Navigate to={'/unlock'} replace />;
  if (unlock && storage) return <Navigate to={'/dashboard'} replace />;

  return children;
}

const ProtectUser = ({ unlock, storage, children }: { unlock: boolean, storage: boolean, children: JSX.Element }) => {
  if (!unlock && !storage) return <Navigate to={'/'} replace />;
  if (!unlock && storage) return <Navigate to={window.location.pathname.includes("/dashboard/") ? `/unlock?redirect=${window.location.pathname}` : '/unlock'} replace />;

  return children;
}


export default App;
