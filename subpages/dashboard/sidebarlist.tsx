import { useState } from 'react';
import { useSelector } from "react-redux";
import { selectDarkMode,changeDarkMode } from "redux/reducers/notificationSlice";
import Button from "components/button"
import { useWalletKit } from 'hooks';
import { useRouter } from 'next/router';
import Link from "next/link";
import { removeStorage } from '../../redux/reducers/storage'
import { setMenu } from '../../redux/reducers/toggles'
import { useDispatch } from 'react-redux'
import { useContractKit } from '@celo-tools/use-contractkit'
import { removeTransactions } from '../../redux/reducers/transactions'
import { useAppSelector } from '../../redux/hooks';
import Pay from 'subpages/pay/pay';


const Li = ({ children, onClick, className }: { children?: Array<any>, onClick?: () => void, className?: string }) => <li onClick={onClick} className={`py-1 mb-2 pl-4 text-left font-semibold text-[1.2rem] 2xl:text-lg 2xl:mb-3 cursor-pointer ${className} hover:bg-greylish hover:bg-opacity-5`}>
    <div className="flex gap-3 items-center">{children}</div>
</li>

const Sidebarlist = () => {
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
        <ul className="pt-24">
            <NavLink to="/dashboard" end={true} className={({ isActive }) => `${isActive ? 'text-primary' : ''}`}>{({ isActive }) => <Li><DashboardSVG active={isActive} darkMode={darkMode} />Dashboard</Li>}</NavLink>
            {blockchain !== "solana" && <>
                <NavLink to="/dashboard/payroll" className={({ isActive }) => `${isActive ? 'text-primary' : ''}`}>{({ isActive }) => <Li><PayrollSVG active={isActive} darkMode={darkMode} />Payroll</Li>}</NavLink>
                <NavLink to="/dashboard/requests" className={({ isActive }) => `${isActive ? 'text-primary' : ''}`}>{({ isActive }) => <Li><RequestsSVG active={isActive} darkMode={darkMode} />Requests</Li>}</NavLink>
                <NavLink to="/dashboard/contributors" className={({ isActive }) => `${isActive ? 'text-primary' : ''}`}>{({ isActive }) => <Li><TeamsSVG active={isActive} darkMode={darkMode} />Contributors</Li>}</NavLink>
                <NavLink to="/dashboard/budgets" className={({ isActive }) => `${isActive ? 'text-primary' : ''}`}>{({ isActive }) => <Li><BudgetsSVG active={isActive} darkMode={darkMode} />Budgets</Li>}</NavLink>
            </>}
            <NavLink to="/dashboard/transactions" className={({ isActive }) => `${isActive ? 'text-primary' : ''}`}>{({ isActive }) => <Li><TransactionsSVG active={isActive} darkMode={darkMode} />Transactions</Li>}</NavLink>
            <NavLink to="/dashboard/assets" className={({ isActive }) => `${isActive ? 'text-primary' : ''}`}>{({ isActive }) => <Li><AssetsSVG active={isActive} darkMode={darkMode} />Assets</Li>}</NavLink>
            <NavLink to="/dashboard/insight" className={({ isActive }) => `${isActive ? 'text-primary' : ''}`}>{({ isActive }) => <Li><InsightSVG active={isActive} darkMode={darkMode} />Insights</Li>}</NavLink>
            {blockchain !== 'solana' && <NavLink to="/dashboard/automations" className={({ isActive }) => `${isActive ? 'text-primary' : ''}`}>{({ isActive }) => <Li><AutomationsSVG active={isActive} darkMode={darkMode} />Recurring</Li>}</NavLink>}

            <NavLink to="/dashboard/swap" className={({ isActive }) => `${isActive ? 'text-primary' : ''}`}>{({ isActive }) => <Li><SwapSVG active={isActive} darkMode={darkMode} />Swap</Li>}</NavLink>

            <NavLink to="/dashboard/lend-and-borrow" className={({ isActive }) => `${isActive ? 'text-primary' : ''}`}>{({ isActive }) => <Li><BorrowSVG active={isActive} darkMode={darkMode} />Lend - Borrow</Li>}</NavLink>

            <div className="w-full border my-4"></div>

            <div className="flex gap-6 items-center justify-center pr-10 py-3 pb-6">
            <NavLink to="/dashboard/settings" className={({ isActive }) => `${isActive ? 'text-primary' : ''}`}>{({ isActive }) =><SettingSVG active={isActive} darkMode={darkMode} />}</NavLink>
            <img  onClick={darkModee} src={!dark ? '/icons/navbar/dark.png' : '/icons/navbar/dark_active.png'} className="w-6 h-6 self-center cursor-pointer" alt='dark' />
            <span className="cursor-pointer text-red"  onClick={() => {
                        dispatch(setMenu(false))
                        dispatch(removeTransactions())
                        dispatch(removeStorage())
                        destroy()
                        router.push('/')
                    }}><LogoutSVG darkMode={darkMode} />
                    </span>
            </div>
        </ul>
    </>
}

const NavLink = ({ children, to, className, end = false }: { end?: boolean, to: string, className: ({ isActive }: { isActive: boolean }) => string, children: ({ isActive }: { isActive: boolean }) => JSX.Element }) => {
    const router = useRouter()
    const path = router.pathname

    return <a href="placeholder" className={className({ isActive: end ? path === to : path.includes(to) })} onClick={(e) => {
        e.preventDefault()
        router.push(to)
    }}>
        {children({ isActive: end ? path === to : path.includes(to) })}
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

const LogoutSVG = ({  darkMode = true }) => <img className={`w-[1.60rem] h-[1.60rem]`} src={ darkMode ? '/icons/sidebar/power_white.png' : '/icons/sidebar/power.png'} alt="logout" />
export default Sidebarlist;


