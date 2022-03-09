import { IoIosArrowDown, IoMdNotificationsOutline } from 'react-icons/io';
import { BsSearch } from 'react-icons/bs'
import { useState, useEffect, useCallback, useRef, useContext } from 'react'
import { Link } from 'react-router-dom';
import ClipLoader from "react-spinners/ClipLoader";
import { useAppDispatch, useAppSelector } from '../../redux/hooks';
import { selectStorage } from '../../redux/reducers/storage';
import { Squash as Hamburger } from 'hamburger-react'
import { selectToggle, setMenu } from '../../redux/reducers/toggles';
import NotificationCointainer from '../notification'
import useModalSideExit from '../../hooks/useModalSideExit';
import { SelectSelectedAccount } from '../../redux/reducers/selectedAccount';
import Visitcard from '../../components/visitcard';
import Button from '../../components/button';
import "index.css"
import { changeDarkMode, selectDarkMode } from 'redux/reducers/notificationSlice';


const Navbar = () => {
    
   
    const storage = useAppSelector(selectStorage)
    const menuBar = useAppSelector(selectToggle)
    const dispatch = useAppDispatch()
    const selectedAccount = useAppSelector(SelectSelectedAccount)
    const dark = useAppSelector(selectDarkMode)

    const darkMode = () => {
        const mode = localStorage.getItem('darkMode')
        if (mode === 'true') {
            dispatch(changeDarkMode(false))
        }
        else {
            dispatch(changeDarkMode(true))
        }
    }

    return <div className="grid grid-cols-[250px,1fr,1fr] md:grid-cols-[250px,1fr,1fr,1fr,1fr] gap-12 ">
        <div className="md:hidden pl-4">
            <div className="inline-block" onClick={() => dispatch(setMenu(!menuBar.mobileMenu))}>
                <Hamburger toggled={menuBar.mobileMenu} hideOutline={true} />
            </div>
        </div>
        <div className="h-[50px] flex justify-center md:justify-start items-center md:pl-4 lg:pl-10">
            <img src={!dark ? "/logo.png" : "/logo_white.png"} alt="" width="150" />
        </div>
        <div className="search col-span-2 hidden md:block">
            <div className="w-full h-12 shadow backdrop-blur bg-gray-50 dark:bg-darkSecond rounded-lg flex items-center pl-3 gap-3">
                <BsSearch />
                <input type="text" placeholder={'Search'} className="flex-grow bg-transparent outline-none " />
            </div>
        </div>
        <div className="actions hidden md:flex items-center justify-evenly md:col-span-2">
            <div className="flex space-x-5 items-center justify-center">
                <div className="w-12 h-12 bg-gray-50 dark:bg-darkSecond flex items-center justify-center rounded-xl cursor-pointer" onClick={darkMode}>
                    <img src="/icons/navbar/dark.svg" className="dark:brightness-0 dark:invert" />
                </div>
                {storage ? <Visitcard name={selectedAccount !== storage.accountAddress ? 'MultiSig' : "Wallet"} address={selectedAccount} /> : <ClipLoader />}
            </div>
            <NavbarDropdown />
            <div className="relative">
                <NotificationCointainer />
            </div>
        </div>
    </div>
}
 

const Li = ({ children, link }: { children: any, link: string }) => <li className="navbarli text-left border-b-2 transition  px-5 py-4 bg-white dark:bg-darkSecond hover:text-primary  hover:border-b-primary hover:transition cursor-pointer first:rounded-t-xl last:rounded-b-xl"><Link to={link} className='flex gap-2'>{children}</Link></li>

export const NavbarDropdown = () => {
    

    const [isOpen, setOpen] = useState(false)
    const divRef = useModalSideExit(isOpen, setOpen)


    return <div className="relative">
        <Button onClick={() => setOpen(!isOpen)} className="bg-primary text-white px-6 py-3 rounded-xl flex items-center gap-x-2">
            <>
                Move Crypto
                <div>
                    <IoIosArrowDown className='transition' style={isOpen ? { transform: "rotate(180deg)" } : undefined} />
                </div>
            </>
        </Button>
        {isOpen && <div ref={divRef} className="absolute w-[150%] rounded-xl sm:-left-1/4   -bottom-1 translate-y-full shadow-xl z-50">
            <ul>
                <Li link={'/dashboard/pay'}  ><PaySVG/> Pay Someone</Li>
                <Li link="/dashboard/masspayout"><MassPayoutSVG />Payroll</Li>
                <Li link='/dashboard/requests'><RequestMoneySVG /> Request Money</Li>
                <Li link=''><FundSVG /> Add Funds <span className="text-[10px]">coming soon</span> </Li>
            </ul>
        </div>
        }
    </div>
}
 
const PaySVG = () => <img src='/icons/navbar/paysomeonepy.png' className="w-[15px] h-[15px] object-cover" alt="" />

const MassPayoutSVG = () => <img src='/icons/navbar/payroll.png' className="w-[15px] h-[15px] object-cover"  alt="" />

const RequestMoneySVG = () => <img src='/icons/navbar/requestmoney.png' className="w-[15px] h-[15px] object-cover"  alt="" />

const FundSVG = () => <img src='/icons/navbar/addfunds.png' className="w-[15px] h-[15px] object-cover"   alt="" />

export default Navbar;  