import { useSelector } from "react-redux";
import { selectDarkMode, changeDarkMode } from "redux/slices/notificationSlice";
import { useWalletKit } from 'hooks';
import { useRouter } from 'next/router';
import { removeStorage } from 'redux/slices/account/storage'
import { useDispatch } from 'react-redux'
import { useContractKit } from '@celo-tools/use-contractkit'
import { removeTransactions } from 'redux/slices/account/transactions'
import { useAppSelector } from 'redux/hooks';
import React from "react";

const Li = ({ children, onClick, className, text, showbar }: { children?: Array<any>, onClick?: () => void, className?: string, text?: string, showbar?: boolean }) => <li onClick={onClick} className={`py-1 mb-2 pl-4 text-left font-semibold text-[1.2rem] 2xl:text-lg 2xl:mb-3 cursor-pointer ${className} hover:bg-greylish hover:bg-opacity-5`} title={`${showbar ? '' : text}`} >
    <div className="flex gap-3 items-center">{children}</div>
</li>

const Sidebarlist = ({ showbar }: { showbar: boolean }) => {
    const darkMode = useSelector(selectDarkMode)
    const { blockchain } = useWalletKit()
    const { destroy } = useContractKit()
    const dispatch = useDispatch()
    const dark = useAppSelector(selectDarkMode)
    const router = useRouter()

    const darkModee = () => {
        const mode = localStorage.getItem('darkMode')
        if (mode === 'true') {
            dispatch(changeDarkMode(false))
        }
        else {
            dispatch(changeDarkMode(true))
        }
    }

    return <>
        <ul className={`${showbar ? 'pt-20' : 'pt-24'}`}>
            <NavLink to="/dashboard" end={true} className={({ isActive }) => `${isActive ? 'text-primary' : ''}`}>{({ isActive }) => <Li text={"Dashboard"} showbar={showbar}><DashboardSVG active={isActive} darkMode={darkMode} />{showbar && 'Dashboard'}</Li>}</NavLink>
            {blockchain !== "solana" && <>
                <NavLink to="/dashboard/choose-budget?page=payroll" customPath="/dashboard/payroll" className={({ isActive }) => `${isActive ? 'text-primary' : ''}`}>{({ isActive }) => <Li text={"Payroll"} showbar={showbar}><PayrollSVG active={isActive} darkMode={darkMode} />{showbar && 'Payroll'}</Li>}</NavLink>
                <NavLink to="/dashboard/choose-budget?page=requests" customPath="/dashboard/requests" className={({ isActive }) => `${isActive ? 'text-primary' : ''}`}>{({ isActive }) => <Li text={"Request"} showbar={showbar}><RequestsSVG active={isActive} darkMode={darkMode} />{showbar && 'Requests'}</Li>}</NavLink>
                <NavLink to="/dashboard/contributors" className={({ isActive }) => `${isActive ? 'text-primary' : ''}`}>{({ isActive }) => <Li text={"Contributors"} showbar={showbar}><TeamsSVG active={isActive} darkMode={darkMode} />{showbar && 'Contributors'}</Li>}</NavLink>
                <NavLink to="/dashboard/budgets" className={({ isActive }) => `${isActive ? 'text-primary' : ''}`}>{({ isActive }) => <Li text={"Budgets"} showbar={showbar}><BudgetsSVG active={isActive} darkMode={darkMode} />{showbar && 'Budgets'}</Li>}</NavLink>
            </>}
            <NavLink to="/dashboard/transactions" className={({ isActive }) => `${isActive ? 'text-primary' : ''}`}>{({ isActive }) => <Li text={"Transactions"} showbar={showbar}><TransactionsSVG active={isActive} darkMode={darkMode} />{showbar && 'Transactions'}</Li>}</NavLink>
            <NavLink to="/dashboard/assets" className={({ isActive }) => `${isActive ? 'text-primary' : ''}`}>{({ isActive }) => <Li text={"Assets"} showbar={showbar}><AssetsSVG active={isActive} darkMode={darkMode} />{showbar && 'Assets'}</Li>}</NavLink>
            <NavLink to="/dashboard/insight" className={({ isActive }) => `${isActive ? 'text-primary' : ''}`}>{({ isActive }) => <Li text={"Insight"} showbar={showbar}><InsightSVG active={isActive} darkMode={darkMode} />{showbar && 'Insights'}</Li>}</NavLink>
            <NavLink to="/dashboard/choose-budget?page=swap" customPath="/dashboard/swap" className={({ isActive }) => `${isActive ? 'text-primary' : ''}`}>{({ isActive }) => <Li text={"Swap"} showbar={showbar}><SwapSVG active={isActive} darkMode={darkMode} />{showbar && 'Swap'}</Li>}</NavLink>
            {blockchain !== 'solana' && <NavLink to="/dashboard/choose-budget?page=lend-and-borrow" customPath="/dashboard/lend-and-borrow" className={({ isActive }) => `${isActive ? 'text-primary' : ''}`}>{({ isActive }) => <Li text={"Lend and Borrow"} showbar={showbar}><BorrowSVG active={isActive} darkMode={darkMode} />{showbar && 'Lend - Borrow'}</Li>}</NavLink>}
            {blockchain !== 'solana' && <NavLink to="/dashboard/automations" className={({ isActive }) => `${isActive ? 'text-primary' : ''}`}>{({ isActive }) => <Li text={"Recurring"} showbar={showbar}><AutomationsSVG active={isActive} darkMode={darkMode} />{showbar && 'Recurring'}</Li>}</NavLink>}
            {showbar && <><div className="w-full border-b my-4"></div>

                <div className="flex gap-8 items-center justify-center pr-10 py-3 pb-6">
                    <NavLink to="/dashboard/settings" className={({ isActive }) => `${isActive ? 'text-primary' : ''}`}>{({ isActive }) => <SettingSVG active={isActive} darkMode={darkMode} />}</NavLink>
                    <img onClick={darkModee} src={!dark ? '/icons/navbar/dark.png' : '/icons/navbar/dark_active.png'} className="w-6 h-6 self-center cursor-pointer" alt='dark' />
                    <span className="cursor-pointer text-red" onClick={() => {
                        dispatch(removeTransactions())
                        dispatch(removeStorage())
                        destroy()
                        router.push('/')
                    }}><LogoutSVG darkMode={darkMode} />
                    </span>
                </div></>}
        </ul>
    </>
}

const NavLink = ({ children, to, className, end = false, customPath }: { end?: boolean, to: string, customPath?: string, className: ({ isActive }: { isActive: boolean }) => string, children: ({ isActive }: { isActive: boolean }) => JSX.Element }) => {
    const router = useRouter()
    const path = router.asPath

    return <a href="placeholder" className={className({ isActive: end ? (path === (customPath) || path === (to)) : (path.includes(to) || path.includes(customPath ?? "@")) })} onClick={(e) => {
        e.preventDefault()
        router.push(to)
    }}>
        {children({ isActive: end ? (path === (customPath) || path === (to)) : (path.includes(to) || path.includes(customPath ?? "@")) })}
    </a>

}

const DashboardSVG = ({ active = false, darkMode = true }) => <img className={`w-[1.60rem] h-[1.60rem]`} src={active ? '/icons/sidebar/dashboard_active.png' : darkMode ? '/icons/sidebar/dashboard_white.png' : '/icons/sidebar/dashboard.png'} alt='Dashboard' />

const AutomationsSVG = ({ active = false, darkMode = true }) => <img className={`w-[1.60rem] h-[1.60rem] mb-1`} src={active ? '/icons/sidebar/refresh_active.png' : darkMode ? '/icons/sidebar/refresh_white.png' : '/icons/sidebar/refresh.png'} alt="Automations" />

const PayrollSVG = ({ active = false, darkMode = true }) => <img className={`w-[1.60rem] h-[1.60rem]`} src={active ? '/icons/sidebar/payroll_active.png' : darkMode ? '/icons/sidebar/payroll_white.png' : '/icons/sidebar/payroll.png'} alt="Payroll" />

const RequestsSVG = ({ active = false, darkMode = true }) => <img className={`w-[1.60rem] h-[1.60rem]`} src={active ? "/icons/sidebar/requests_active.png" : darkMode ? '/icons/sidebar/requests_white.png' : '/icons/sidebar/requests.png'} alt="Requests" />

const TransactionsSVG = ({ active = false, darkMode = true }) => <img className={`w-[1.60rem] h-[1.60rem]`} src={active ? "/icons/sidebar/transaction_active.png" : darkMode ? '/icons/sidebar/transaction_white.png' : '/icons/sidebar/transaction.png'} alt="Transaction" />

const SwapSVG = ({ active = false, darkMode = true }) => <img className={`w-[1.60rem] h-[1.60rem]`} src={active ? '/icons/sidebar/swap_active.png' : darkMode ? '/icons/sidebar/swap_white.png' : '/icons/sidebar/swap.png'} alt="Swap" />

const BorrowSVG = ({ active = false, darkMode = true }) => <img className={`w-[1.60rem] h-[1.60rem]`} src={active ? '/icons/sidebar/borrow_active.png' : darkMode ? '/icons/sidebar/borrow_white.png' : '/icons/sidebar/borrow.png'} alt="Swap" />

const AssetsSVG = ({ active = false, darkMode = true }) => <img className={`w-[1.60rem] h-[1.60rem]`} src={active ? '/icons/sidebar/managment_active.png' : darkMode ? '/icons/sidebar/managment_white.png' : '/icons/sidebar/managment.png'} alt="Asset" />

const TeamsSVG = ({ active = false, darkMode = true }) => <img className={`w-[1.60rem] h-[1.60rem]`} src={active ? '/icons/sidebar/team_active.png' : darkMode ? '/icons/sidebar/team_white.png' : '/icons/sidebar/team.png'} alt="Teams" />

const BudgetsSVG = ({ active = false, darkMode = true }) => <img className={`w-[1.60rem] h-[1.60rem]`} src={active ? '/icons/sidebar/budget_active.png' : darkMode ? '/icons/sidebar/budget_white.png' : '/icons/sidebar/budget.png'} alt="Budgets" />

const SettingSVG = ({ active = false, darkMode = true }) => <img className={`w-[1.60rem] h-[1.60rem]`} src={active ? '/icons/sidebar/settings_active.png' : darkMode ? '/icons/sidebar/settings_white.png' : '/icons/sidebar/settings.png'} alt="Settings" />

const InsightSVG = ({ active = false, darkMode = true }) => <img className={`w-[1.60rem] h-[1.60rem]`} src={active ? "/icons/sidebar/insight_active.png" : darkMode ? '/icons/sidebar/insight_white.png' : '/icons/sidebar/insight.png'} alt="Insight" />

const LogoutSVG = ({ darkMode = true }) => <img className={`w-[1.60rem] h-[1.60rem]`} src={darkMode ? '/icons/sidebar/power_white.png' : '/icons/sidebar/power.png'} alt="logout" />

export default Sidebarlist;


