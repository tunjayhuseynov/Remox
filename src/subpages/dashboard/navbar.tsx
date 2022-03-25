import ClipLoader from "react-spinners/ClipLoader";
import { useAppDispatch, useAppSelector } from '../../redux/hooks';
import { selectStorage } from '../../redux/reducers/storage';
import { Squash as Hamburger } from 'hamburger-react'
import { selectToggle, setMenu } from '../../redux/reducers/toggles';
import NotificationCointainer from '../notification'
import { SelectSelectedAccount } from '../../redux/reducers/selectedAccount';
import Visitcard from '../../components/visitcard';
import "index.css"
import { changeDarkMode, selectDarkMode } from 'redux/reducers/notificationSlice';
import Module from "module";


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

    return <div className="grid grid-cols-[250px,1fr,1fr] md:grid-cols-[250px,1fr,1fr,1fr,1fr] gap-12 pl-4 pr-20">
        <div className="md:hidden ">
            <div className="inline-block" onClick={() => dispatch(setMenu(!menuBar.mobileMenu))}>
                <Hamburger toggled={menuBar.mobileMenu} hideOutline={true} />
            </div>
        </div>
        <div className="h-[3.125rem] flex justify-center md:justify-start items-center  lg:pl-6">
            <img src={!dark ? "/logo.png" : "/logo_white.png"} alt="" width="150" />
        </div>
        <div className="search col-span-3 hidden md:block">
            {/* <div className="w-full h-12 shadow backdrop-blur bg-gray-50 dark:bg-darkSecond rounded-lg flex items-center pl-3 gap-3">
                <BsSearch />
                <input type="text" placeholder={'Search'} className="flex-grow bg-transparent outline-none " />
            </div> */}
        </div>
        <div className="actions hidden md:flex items-center justify-evenly ">
            <div className="flex space-x-5 items-center justify-center">
                <div className="w-12 h-12 bg-white dark:bg-darkSecond flex items-center justify-center rounded-xl cursor-pointer" onClick={darkMode}>
                    {/* <img src="/icons/navbar/dark.svg" className="dark:brightness-0 dark:invert" /> */}
                    <img src={ !dark ? '/icons/navbar/dark.png' : '/icons/navbar/dark_active.png'} className="w-[1.125rem] h-[1.125rem]" alt='dark' />
                </div>
                {storage ? selectedAccount !== storage.accountAddress ? <Visitcard name={'Multisig'} address={selectedAccount} /> : "" : ""}
                {storage ? <Visitcard name={"You"} address={storage.accountAddress} /> : <ClipLoader />}
                <div className="relative">
                    <NotificationCointainer />
                </div>
            </div>
        </div>
    </div>
}

export default Navbar;  