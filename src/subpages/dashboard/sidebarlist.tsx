import { useNavigate, NavLink } from 'react-router-dom'
import { BiLogOut } from 'react-icons/bi'
import { useDispatch } from 'react-redux'
import { removeStorage } from '../../redux/reducers/storage'
import { setMenu } from '../../redux/reducers/toggles'
import { removeTransactions } from '../../redux/reducers/transactions'
import { useContractKit } from '@celo-tools/use-contractkit'

const Li = ({ children, onClick, className }: { children?: Array<any>, onClick?: () => void, className?: string }) => <li onClick={onClick} className={`py-2 mb-4 pl-4 text-left font-light text-lg cursor-pointer ${className} hover:bg-greylish hover:bg-opacity-5`}>
    <div className="flex gap-3">{children}</div>
</li>

const Sidebarlist = () => {
    const { destroy } = useContractKit()
    const dispatch = useDispatch()
    const navigator = useNavigate()
    return <>
        <ul>
            <NavLink to="/dashboard" end={true} className={({ isActive }) => `${isActive ? 'text-primary' : ''}`}>{({ isActive }) => <Li><DashboardSVG active={isActive} />Dashboard</Li>}</NavLink>
            <NavLink to="/dashboard/payroll" className={({ isActive }) => `${isActive ? 'text-primary' : ''}`}>{({ isActive }) => <Li><PayrollSVG active={isActive} />Payroll</Li>}</NavLink>
            <NavLink to="/dashboard/requests" className={({ isActive }) => `${isActive ? 'text-primary' : ''}`}>{({ isActive }) => <Li><RequestsSVG active={isActive} />Requests</Li>}</NavLink>
            <NavLink to="/dashboard/transactions" className={({ isActive }) => `${isActive ? 'text-primary' : ''}`}>{({ isActive }) => <Li><TransactionsSVG active={isActive} />Transactions</Li>}</NavLink>
            <NavLink to="/dashboard/swap" className={({ isActive }) => `${isActive ? 'text-primary' : ''}`}>{({ isActive }) => <Li><SwapSVG active={isActive} />Swap</Li>}</NavLink>
            <NavLink to="/dashboard/assets" className={({ isActive }) => `${isActive ? 'text-primary' : ''}`}>{({ isActive }) => <Li><AssetsSVG active={isActive} />Assets</Li>}</NavLink>
            <NavLink to="/dashboard/contributors" className={({ isActive }) => `${isActive ? 'text-primary' : ''}`}>{({ isActive }) => <Li><TeamsSVG active={isActive} />Contributors</Li>}</NavLink>
            <NavLink to="/dashboard/settings" className={({ isActive }) => `${isActive ? 'text-primary' : ''}`}>{({ isActive }) => <Li><SettingSVG active={isActive} />Settings</Li>}</NavLink>
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

const DashboardSVG = ({ active = false }) => <img className={`w-[24px] h-[24px]   ${!active && 'dark:invert dark:brightness-0'}`} src={active ? '/icons/sidebar/dashboard_active.png' : '/icons/sidebar/dashboard.png'} alt='Dashboard' />

const PayrollSVG = ({ active = false }) => <img className={`w-[24px] h-[24px]   ${!active && 'dark:invert dark:brightness-0'}`} src={active ? '/icons/sidebar/payroll_active.png' : '/icons/sidebar/payroll.png'} alt="Payroll" />

const RequestsSVG = ({ active = false }) => <img className={`w-[24px] h-[24px]   ${!active && 'dark:invert dark:brightness-0'}`} src={active ? "/icons/sidebar/requests_active.png" : '/icons/sidebar/requests.png'} alt="Requests" />

const TransactionsSVG = ({ active = false }) => <img className={`w-[24px] h-[24px]   ${!active && 'dark:invert dark:brightness-0'}`} src={active ? "/icons/sidebar/transaction_active.png" : '/icons/sidebar/transaction.png'} alt="Transaction" />

const SwapSVG = ({ active = false }) => <img className={`w-[24px] h-[24px]   ${!active && 'dark:invert dark:brightness-0'}`} src={active ? '/icons/sidebar/swap_active.png' : '/icons/sidebar/swap.png'} alt="Swap" />

const AssetsSVG = ({ active = false }) => <img className={`w-[24px] h-[24px]   ${!active && 'dark:invert dark:brightness-0'}`} src={active ? '/icons/sidebar/managment_active.png' : '/icons/sidebar/managment.png'} alt="Asset" />

const TeamsSVG = ({ active = false }) => <img className={`w-[24px] h-[24px]   ${!active && 'dark:invert dark:brightness-0'}`} src={active ? '/icons/sidebar/team_active.png' : '/icons/sidebar/team.png'} alt="Teams" />

const SettingSVG = ({ active = false }) => <img className={`w-[24px] h-[24px]   ${!active && 'dark:invert dark:brightness-0'}`} src={active ? '/icons/sidebar/settings_active.png' : '/icons/sidebar/settings.png'} alt="" />

const LogoutSVG = ({ active = false }) => <BiLogOut className="w-[24px] h-[24px]" />

export default Sidebarlist;

