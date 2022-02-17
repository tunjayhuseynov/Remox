import { useContractKit } from "@celo-tools/use-contractkit";
import { useSelector } from "react-redux";
import { Navigate, Route, Routes } from "react-router-dom";
import { selectStorage } from "./redux/reducers/storage";
import { selectUnlock } from "./redux/reducers/unlock";
import { lazy, Suspense, useLayoutEffect } from 'react'
import { ClipLoader } from "react-spinners";

import CreateAccount from "./pages/create-account"
import Unlock from "./pages/unlock";
import Home from "./pages/home";
import Layout from "pages/dashboard/layout";
import MassPay from "pages/masspay/masspay";
import { selectDarkMode } from "redux/reducers/notificationSlice";
import RequestLayout from "pages/dashboard/requests/layout";
import TabPage from "pages/dashboard/requests/tab";
import Form from "pages/dashboard/requests/form";

const Payroll = lazy(() => import("pages/dashboard/payroll"));
const Pay = lazy(() => import("pages/pay"));
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
  const { address } = useContractKit();
  const unlock = useSelector(selectUnlock)
  const storage = useSelector(selectStorage)
  const darkMode = useSelector(selectDarkMode)

  useLayoutEffect(() => {
    document.documentElement.classList.add(darkMode ? "dark" : "light", darkMode ? "tw-dark" : "tw-light")
    document.documentElement.classList.remove(darkMode ? "light" : "dark", darkMode ? "tw-light" : "tw-dark")
  }, [darkMode])

  return (
    <div>
      <Suspense fallback={<div className="h-screen w-full flex justify-center items-center"><ClipLoader /></div>}>
        <Routes>
          <Route path="/" element={
            <LockIfUserIn unlock={unlock} storage={!!address && !!storage}>
              <Home />
            </LockIfUserIn>
          } />
          <Route path="/create-account" element={<CreateAccount />} />
          <Route path="/unlock" element={<Unlock />} />
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
              <Route path="swap" element={<Swap />} />
              <Route path="payroll" element={<Payroll />} />
              <Route path={'transactions/:id'} element={<Details />} />
              <Route path={'settings'} element={
                <SettingLayout />
              }>
                <Route path={''} element={<OwnerSetting />} />
                <Route path={`spending`} element={<SpendingSetting />} />
                <Route path={`profile`} element={<ProfileSetting />} />
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
