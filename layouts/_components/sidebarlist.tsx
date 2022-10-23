import { useRouter } from 'next/router';
import { useDispatch } from 'react-redux'
import { useAppSelector } from 'redux/hooks';
import React from "react";
import { changeDarkMode, SelectDarkMode, SelectIsModerator, setResetRemoxData } from 'redux/slices/account/remoxData';
import MuiAccordionDetails from '@mui/material/AccordionDetails';
import DarkModeOutlinedIcon from '@mui/icons-material/DarkModeOutlined';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import LightModeOutlinedIcon from '@mui/icons-material/LightModeOutlined';
import SettingsOutlinedIcon from '@mui/icons-material/SettingsOutlined';
import LogoutOutlinedIcon from '@mui/icons-material/LogoutOutlined';
import MuiAccordion, { AccordionProps } from '@mui/material/Accordion';
import AccordionSummary from '@mui/material/AccordionSummary';
import { styled } from '@mui/material/styles';
import { AiOutlinePoweroff } from 'react-icons/ai';
import { FiPower } from 'react-icons/fi';


const Li = ({ children, onClick, className, text, showbar }: { children?: Array<any>, onClick?: () => void, className?: string, text?: string, showbar?: boolean }) => <li onClick={onClick} className={`py-3 rounded-md mb-2 pl-[.835rem] text-left font-sans font-semibold  xl:text-lg leading-4 xl:mb-2 cursor-pointer ${className} tracking-wide bg-light dark:bg-dark`} title={`${showbar ? '' : text}`} >
    <div className="flex gap-3 items-center text-sm !font-medium">{children}</div>
</li>

const Accordion = styled((props: AccordionProps) => (
    <MuiAccordion disableGutters elevation={0} square {...props} />
))(({ theme }) => ({
    minHeight: '30px',

}));

const AccordionDetails = styled(MuiAccordionDetails)(({ theme }) => ({
    padding: theme.spacing(0),

}));

const Sidebarlist = ({ showbar }: { showbar: boolean }) => {
    const dispatch = useDispatch()
    const darkMode = useAppSelector(SelectDarkMode)
    const router = useRouter()
    const isModerator = useAppSelector(SelectIsModerator);

    const darkModee = () => {
        const mode = localStorage.getItem('darkMode')
        if (mode === 'true') {
            dispatch(changeDarkMode(false))
        }
        else {
            dispatch(changeDarkMode(true))
        }
    }

    const handleChange = (panel: string) => (event: React.SyntheticEvent, newExpanded: boolean) => {
        setExpanded(newExpanded ? panel : false);
    };
    const [expanded, setExpanded] = React.useState<string | false>('');

    const handleChange2 = (panel: string) => (event: React.SyntheticEvent, newExpanded: boolean) => {
        setExpanded2(newExpanded ? panel : false);
    };
    const [expanded2, setExpanded2] = React.useState<string | false>('');

    const handleChange3 = (panel: string) => (event: React.SyntheticEvent, newExpanded: boolean) => {
        setExpanded3(newExpanded ? panel : false);
    };
    const [expanded3, setExpanded3] = React.useState<string | false>('');


    return <>
        <ul className={`w-full`}>
            <NavLink to="/dashboard" end={true} className={({ isActive }) => `${isActive ? 'text-primary' : ''} `}>{({ isActive }) => <Li className={'hover:bg-[#e2e2e2] dark:hover:bg-[#2E2E2E] hover:transaction-all transaction-all !mb-4 !mt-4'} text={"Dashboard"} showbar={showbar}><DashboardSVG active={isActive} darkMode={darkMode} />{showbar && 'Dashboard'}</Li>}</NavLink>
            <Accordion expanded={expanded2 === 'panel2'} onChange={handleChange2('panel2')} sx={{ borderRadius: '5px', marginBottom: '10px' }}>
                <AccordionSummary expandIcon={<ExpandMoreIcon />}
                    aria-controls="panel2d-content"
                    className="hover:bg-[#f9f9f9] dark:bg-darkSecond dark:hover:bg-dark  !min-h-[1.875rem] !py-0 !rounded-md"
                    id="panel2d-header" sx={{ borderRadius: '5px', border: !darkMode ? '1px solid #D6D6D6' : '1px solid #3C3C3C', paddingLeft: '11px', paddingRight: '7px', '.MuiAccordionSummary-content': { margin: '0px !important' } }}>
                    <span className="font-sans font-medium  text-xs leading-4 ">Payments</span>
                </AccordionSummary>
                <AccordionDetails >
                    <div>
                        <NavLink to="/dashboard/budgets" className={({ isActive }) => `${isActive ? 'text-primary' : ''}`}>{({ isActive }) => <Li text={"Budgets"} className={' !mb-0 hover:bg-[#e2e2e2] dark:hover:bg-[#2E2E2E] hover:transaction-all transaction-all rounded-none'} showbar={showbar}><BudgetsSVG active={isActive} darkMode={darkMode} />{showbar && 'Budgets'}</Li>}</NavLink>
                        <NavLink to={isModerator ? "/dashboard/payroll" : "/dashboard/payroll"} className={({ isActive }) => `  ${isActive ? 'text-primary' : ''}`}>{({ isActive }) => <Li text={"Payroll"} className={' !mb-0 hover:bg-[#e2e2e2] dark:hover:bg-[#2E2E2E] hover:transaction-all transaction-all rounded-none'} showbar={showbar}><PayrollSVG active={isActive} darkMode={darkMode} />{showbar && 'Payroll'}</Li>}</NavLink>
                        <NavLink to={isModerator ? "/dashboard/requests" : "/dashboard/requests"} className={({ isActive }) => `  ${isActive ? 'text-primary' : ''}`}>{({ isActive }) => <Li text={"Request"} className={' !mb-0 hover:bg-[#e2e2e2] dark:hover:bg-[#2E2E2E] hover:transaction-all transaction-all rounded-none'} showbar={showbar}><RequestsSVG active={isActive} darkMode={darkMode} />{showbar && 'Requests'}</Li>}</NavLink>
                        <NavLink to={isModerator ? "/dashboard/contributors" : "/dashboard/contributors"} className={({ isActive }) => `  ${isActive ? 'text-primary' : ''}`}>{({ isActive }) => <Li text={"Contributors"} className={' !mb-0 hover:bg-[#e2e2e2] dark:hover:bg-[#2E2E2E] hover:transaction-all transaction-all rounded-none'} showbar={showbar}><TeamsSVG active={isActive} darkMode={darkMode} />{showbar && 'Contributors'}</Li>}</NavLink>
                        <NavLink to="/dashboard/streaming" className={({ isActive }) => `${isActive ? 'text-primary' : ''}`}>{({ isActive }) => <Li className={' !mb-0 hover:bg-[#e2e2e2] dark:hover:bg-[#2E2E2E] hover:transaction-all transaction-all rounded-b-md rounded-t-none'} text={"Recurring"} showbar={showbar}><AutomationsSVG active={isActive} darkMode={darkMode} />{showbar && 'Streaming'}</Li>}</NavLink>
                    </div>
                </AccordionDetails>
            </Accordion>

            <Accordion expanded={expanded === 'panel1'} onChange={handleChange('panel1')} sx={{ borderRadius: '5px', marginBottom: '10px' }}>
                <AccordionSummary expandIcon={<ExpandMoreIcon />}
                    aria-controls="panel1d-content"
                    className="hover:bg-[#f9f9f9] dark:bg-darkSecond dark:hover:bg-dark !min-h-[1.875rem] !pb-0 !py-0 !rounded-md"
                    id="panel1d-header" sx={{ borderRadius: '5px', border: !darkMode ? '1px solid #D6D6D6' : '1px solid #3C3C3C', paddingLeft: '11px', paddingRight: '7px', '.MuiAccordionSummary-content': { margin: '0px !important' } }}>
                    <span className="font-sans font-medium text-xs leading-4 ">Analytics</span>
                </AccordionSummary>
                <AccordionDetails  >
                    <div>
                        <NavLink to="/dashboard/transactions" className={({ isActive }) => `${isActive ? 'text-primary' : ''}`}>{({ isActive }) => <Li className={' !mb-0 hover:bg-[#e2e2e2] dark:hover:bg-[#2E2E2E] hover:transaction-all transaction-all rounded-none'} text={"Transactions"} showbar={showbar}><TransactionsSVG active={isActive} darkMode={darkMode} />{showbar && 'Transactions'}</Li>}</NavLink>
                        <NavLink to="/dashboard/assets" className={({ isActive }) => `${isActive ? 'text-primary' : ''}`}>{({ isActive }) => <Li className={' !mb-0 hover:bg-[#e2e2e2] dark:hover:bg-[#2E2E2E] hover:transaction-all transaction-all rounded-none'} text={"Assets"} showbar={showbar}><AssetsSVG active={isActive} darkMode={darkMode} />{showbar && 'Assets'}</Li>}</NavLink>
                        {/* <NavLink to="/dashboard/insight" className={({ isActive }) => `${isActive ? 'text-primary' : ''}`}>{({ isActive }) => <Li className={' !mb-0 hover:bg-[#e2e2e2] dark:hover:bg-[#2E2E2E] hover:transaction-all transaction-all rounded-b-md rounded-t-none'} text={"Insight"} showbar={showbar}><InsightSVG active={isActive} darkMode={darkMode} />{showbar && 'Insights'}</Li>}</NavLink> */}
                    </div>
                </AccordionDetails>
            </Accordion>


            <Accordion expanded={expanded3 === 'panel3'} onChange={handleChange3('panel3')} sx={{ borderRadius: '5px', marginBottom: '16px' }}>
                <AccordionSummary expandIcon={<ExpandMoreIcon />}
                    aria-controls="panel3d-content"
                    className="hover:bg-[#f9f9f9] dark:bg-darkSecond dark:hover:bg-dark !min-h-[1.875rem] !py-0 !rounded-md"
                    id="panel3d-header" sx={{ borderRadius: '5px', border: !darkMode ? '1px solid #D6D6D6' : '1px solid #3C3C3C', paddingLeft: '11px', paddingRight: '7px', '.MuiAccordionSummary-content': { margin: '0px !important' } }}>
                    <span className="font-sans font-medium  text-xs  leading-4 ">Investments</span>
                </AccordionSummary>
                <AccordionDetails >
                    <div>
                        {/* <NavLink to="/dashboard/risk" className={({ isActive }) => `${isActive ? 'text-primary' : ''}`}>{({ isActive }) => <Li className={' !mb-0 hover:bg-[#e2e2e2] dark:hover:bg-[#2E2E2E] hover:transaction-all transaction-all rounded-none'} text={"Risk Assessment"} showbar={showbar}><RiskSVG active={isActive} darkMode={darkMode} />{showbar && 'Risk Assessment'}</Li>}</NavLink> */}
                        {/* <NavLink to="/dashboard/lend-and-borrow" className={({ isActive }) => `${isActive ? 'text-primary' : ''}`}>{({ isActive }) => <Li className={' !mb-0 hover:bg-[#e2e2e2] dark:hover:bg-[#2E2E2E] hover:transaction-all transaction-all rounded-none'} text={"Lend and Borrow"} showbar={showbar}><BorrowSVG active={isActive} darkMode={darkMode} />{showbar && 'Lend & Borrow'}</Li>}</NavLink> */}
                        <NavLink to={isModerator ? "/dashboard/swap" : "/dashboard/swap"} className={({ isActive }) => `${isActive ? 'text-primary' : ''}`}>{({ isActive }) => <Li text={"Swap"} className={' !mb-0 hover:bg-[#e2e2e2] dark:hover:bg-[#2E2E2E] hover:transaction-all transaction-all rounded-b-md rounded-t-none'} showbar={showbar}><SwapSVG active={isActive} darkMode={darkMode} />{showbar && 'Swap'}</Li>}</NavLink>
                    </div>
                </AccordionDetails>
            </Accordion>
            {showbar && <><div className=" border-b dark:border-[#454545] my-4 w-full"></div>
                <div className="flex gap-7 items-center justify-center  pt-1 pb-5">
                    <NavLink to="/dashboard/settings" className={({ isActive }) => `${isActive ? 'text-primary' : ''}`}>{({ isActive }) => <SettingSVG active={isActive} darkMode={darkMode} />}</NavLink>
                    {!darkMode ? <DarkModeOutlinedIcon onClick={darkModee} className=" hover:text-greylish self-center cursor-pointer !text-xl" /> : <LightModeOutlinedIcon onClick={darkModee} className="hover:text-greylish  self-center cursor-pointer !text-xl" />}
                    <span className="cursor-pointer text-red" onClick={() => {
                        dispatch(setResetRemoxData())
                        router.push('/')
                    }}><FiPower />
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

const DashboardSVG = ({ active = false, darkMode = true }) => <img className={`w-4 h-4`} src={active ? '/icons/sidebar/dashboard_active.png' : darkMode ? '/icons/sidebar/dashboard_white.png' : '/icons/sidebar/dashboard.png'} alt='Dashboard' />

const AutomationsSVG = ({ active = false, darkMode = true }) => <img className={`w-4 h-4 mb-1`} src={active ? '/icons/sidebar/refresh_active.png' : darkMode ? '/icons/sidebar/refresh_white.png' : '/icons/sidebar/refresh.png'} alt="Automations" />

const PayrollSVG = ({ active = false, darkMode = true }) => <img className={`w-4 h-4`} src={active ? '/icons/sidebar/payroll_active.png' : darkMode ? '/icons/sidebar/payroll_white.png' : '/icons/sidebar/payroll.png'} alt="Payroll" />

const RequestsSVG = ({ active = false, darkMode = true }) => <img className={`w-4 h-4`} src={active ? "/icons/sidebar/requests_active.png" : darkMode ? '/icons/sidebar/requests_white.png' : '/icons/sidebar/requests.png'} alt="Requests" />

const TransactionsSVG = ({ active = false, darkMode = true }) => <img className={`w-4 h-4`} src={active ? "/icons/sidebar/transaction_active.png" : darkMode ? '/icons/sidebar/transaction_white.png' : '/icons/sidebar/transaction.png'} alt="Transaction" />

const SwapSVG = ({ active = false, darkMode = true }) => <img className={`w-4 h-4`} src={active ? '/icons/sidebar/swap_active.png' : darkMode ? '/icons/sidebar/swap_white.png' : '/icons/sidebar/swap.png'} alt="Swap" />

const BorrowSVG = ({ active = false, darkMode = true }) => <img className={`w-4 h-4`} src={active ? '/icons/sidebar/borrow_active.png' : darkMode ? '/icons/sidebar/borrow_white.png' : '/icons/sidebar/borrow.png'} alt="Swap" />

const AssetsSVG = ({ active = false, darkMode = true }) => <img className={`w-4 h-4`} src={active ? '/icons/sidebar/managment_active.png' : darkMode ? '/icons/sidebar/managment_white.png' : '/icons/sidebar/managment.png'} alt="Asset" />

const RiskSVG = ({ active = false, darkMode = true }) => <img className={`w-4 h-4`} src={active ? '/icons/sidebar/risk_active.png' : darkMode ? '/icons/sidebar/risk.png' : '/icons/sidebar/risk_white.png'} alt="Risk" />

const TeamsSVG = ({ active = false, darkMode = true }) => <img className={`w-4 h-4`} src={active ? '/icons/sidebar/team_active.png' : darkMode ? '/icons/sidebar/team_white.png' : '/icons/sidebar/team.png'} alt="Teams" />

const BudgetsSVG = ({ active = false, darkMode = true }) => <img className={`w-4 h-4`} src={active ? '/icons/sidebar/budget_active.png' : darkMode ? '/icons/sidebar/budget_white.png' : '/icons/sidebar/budget.png'} alt="Budgets" />

const SettingSVG = ({ active = false, darkMode = true }) => <SettingsOutlinedIcon className={`${active ? 'text-primary' : darkMode ? 'text-white' : 'text-black'} hover:text-greylish !text-xl`} />

const InsightSVG = ({ active = false, darkMode = true }) => <img className={`w-4 h-4`} src={active ? "/icons/sidebar/insight_active.png" : darkMode ? '/icons/sidebar/insight_white.png' : '/icons/sidebar/insight.png'} alt="Insight" />

const LogoutSVG = ({ darkMode = true }) => <LogoutOutlinedIcon className={`${darkMode ? 'text-white' : 'text-black'} hover:text-greylish !text-xl`} />

export default Sidebarlist;


