import { useNavigate, NavLink } from 'react-router-dom'
import { BiLogOut } from 'react-icons/bi'
import { useDispatch } from 'react-redux'
import { removeStorage } from '../../redux/reducers/storage'
import { setMenu } from '../../redux/reducers/toggles'
import { removeTransactions } from '../../redux/reducers/transactions'
import { useContractKit } from '@celo-tools/use-contractkit'
import { useSelector } from "react-redux";
import { selectDarkMode } from "redux/reducers/notificationSlice";

const Li = ({ children, onClick, className }: { children?: Array<any>, onClick?: () => void, className?: string }) => <li onClick={onClick} className={`py-2 mb-4 pl-4 text-left font-light text-lg cursor-pointer ${className} hover:bg-greylish hover:bg-opacity-5`}>
    <div className="flex gap-3">{children}</div>
</li>

const Sidebarlist = () => {
    const { destroy } = useContractKit()
    const dispatch = useDispatch()
    const navigator = useNavigate()
    const darkMode = useSelector(selectDarkMode)

    return <>
        <ul>
            <NavLink to="/dashboard" end={true} className={({ isActive }) => `${isActive ? 'text-primary' : ''}`}>{({ isActive }) => <Li><DashboardSVG active={isActive} darkMode={darkMode} />Dashboard</Li>}</NavLink>
            <NavLink to="/dashboard/payroll" className={({ isActive }) => `${isActive ? 'text-primary' : ''}`}>{({ isActive }) => <Li><PayrollSVG active={isActive} darkMode={darkMode} />Payroll</Li>}</NavLink>
            <NavLink to="/dashboard/requests" className={({ isActive }) => `${isActive ? 'text-primary' : ''}`}>{({ isActive }) => <Li><RequestsSVG active={isActive} darkMode={darkMode} />Requests</Li>}</NavLink>
            <NavLink to="/dashboard/transactions" className={({ isActive }) => `${isActive ? 'text-primary' : ''}`}>{({ isActive }) => <Li><TransactionsSVG active={isActive} darkMode={darkMode} />Transactions</Li>}</NavLink>
            <NavLink to="/dashboard/insight" className={({ isActive }) => `${isActive ? 'text-primary' : ''}`}>{({ isActive }) => <Li><InsightSVG active={isActive} darkMode={darkMode} />Insights</Li>}</NavLink>
            <NavLink to="/dashboard/automations" className={({ isActive }) => `${isActive ? 'text-primary' : ''}`}>{({ isActive }) => <Li><AutomationsSVG active={isActive} darkMode={darkMode} />Automations</Li>}</NavLink>
            <NavLink to="/dashboard/swap" className={({ isActive }) => `${isActive ? 'text-primary' : ''}`}>{({ isActive }) => <Li><SwapSVG active={isActive} darkMode={darkMode} />Swap</Li>}</NavLink>
            <NavLink to="/dashboard/lend-and-borrow" className={({ isActive }) => `${isActive ? 'text-primary' : ''}`}>{({ isActive }) => <Li><BorrowSVG active={isActive} darkMode={darkMode} />Lend - Borrow</Li>}</NavLink>
            <NavLink to="/dashboard/assets" className={({ isActive }) => `${isActive ? 'text-primary' : ''}`}>{({ isActive }) => <Li><AssetsSVG active={isActive} darkMode={darkMode} />Assets</Li>}</NavLink>
            <NavLink to="/dashboard/contributors" className={({ isActive }) => `${isActive ? 'text-primary' : ''}`}>{({ isActive }) => <Li><TeamsSVG active={isActive} darkMode={darkMode} />Contributors</Li>}</NavLink>
            <NavLink to="/dashboard/settings" className={({ isActive }) => `${isActive ? 'text-primary' : ''}`}>{({ isActive }) => <Li><SettingSVG active={isActive} darkMode={darkMode} />Settings</Li>}</NavLink>
            <Li onClick={() => {
                dispatch(setMenu(false))
                dispatch(removeTransactions())
                dispatch(removeStorage())
                destroy()
                navigator('/')
            }}><LogoutSVG />Log Out</Li>
        </ul>
    </>
}

const DashboardSVG = ({ active = false, darkMode = true }) => <img className={`w-[24px] h-[24px]`} src={active ? '/icons/sidebar/dashboard_active.png' : darkMode ? '/icons/sidebar/dashboard_white.png' : '/icons/sidebar/dashboard.png'} alt='Dashboard' />

const AutomationsSVG = ({ active = false, darkMode = true }) => <img className={`w-[24px] h-[24px]`} src={active ? '/icons/sidebar/refresh_active.png' : darkMode ? '/icons/sidebar/refresh_white.png' : '/icons/sidebar/refresh.png'} alt="Payroll" />

const PayrollSVG = ({ active = false, darkMode = true }) => <img className={`w-[24px] h-[24px]`} src={active ? '/icons/sidebar/payroll_active.png' : darkMode ? '/icons/sidebar/payroll_white.png' : '/icons/sidebar/payroll.png'} alt="Payroll" />

const RequestsSVG = ({ active = false, darkMode = true }) => <img className={`w-[24px] h-[24px]`} src={active ? "/icons/sidebar/requests_active.png" : darkMode ? '/icons/sidebar/requests_white.png' : '/icons/sidebar/requests.png'} alt="Requests" />

const TransactionsSVG = ({ active = false, darkMode = true }) => <img className={`w-[24px] h-[24px]`} src={active ? "/icons/sidebar/transaction_active.png" : darkMode ? '/icons/sidebar/transaction_white.png' : '/icons/sidebar/transaction.png'} alt="Transaction" />

const SwapSVG = ({ active = false, darkMode = true }) => <img className={`w-[24px] h-[24px]`} src={active ? '/icons/sidebar/swap_active.png' : darkMode ? '/icons/sidebar/swap_white.png' : '/icons/sidebar/swap.png'} alt="Swap" />

const BorrowSVG = ({ active = false, darkMode = true }) => <img className={`w-[24px] h-[24px]`} src={active ? '/icons/sidebar/borrow_active.png' : darkMode ? '/icons/sidebar/borrow_white.png' : '/icons/sidebar/borrow.png'} alt="Swap" />

const AssetsSVG = ({ active = false, darkMode = true }) => <img className={`w-[24px] h-[24px]`} src={active ? '/icons/sidebar/managment_active.png' : darkMode ? '/icons/sidebar/managment_white.png' : '/icons/sidebar/managment.png'} alt="Asset" />

const TeamsSVG = ({ active = false, darkMode = true }) => <img className={`w-[24px] h-[24px]`} src={active ? '/icons/sidebar/team_active.png' : darkMode ? '/icons/sidebar/team_white.png' : '/icons/sidebar/team.png'} alt="Teams" />

const SettingSVG = ({ active = false, darkMode = true }) => <img className={`w-[24px] h-[24px]`} src={active ? '/icons/sidebar/settings_active.png' : darkMode ? '/icons/sidebar/settings_white.png' : '/icons/sidebar/settings.png'} alt="" />

const InsightSVG = ({ active = false, darkMode = true }) => <img className={`w-[24px] h-[24px]`} src={active ? "/icons/sidebar/insight_active.png" : darkMode ? '/icons/sidebar/insight_white.png' : '/icons/sidebar/insight.png'} alt="Insight" />

const LogoutSVG = ({ active = false }) => <BiLogOut className="w-[24px] h-[24px]" />

export default Sidebarlist;

