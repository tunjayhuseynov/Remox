import { useAppDispatch, useAppSelector } from 'redux/hooks';
import { selectStorage } from 'redux/reducers/storage';
import { Squash as Hamburger } from 'hamburger-react'
import { selectToggle, setMenu } from 'redux/reducers/toggles';
import NotificationCointainer from '../notification'
import { SelectSelectedAccount } from 'redux/reducers/selectedAccount';
import Visitcard from 'components/visitcard';
import { changeDarkMode, selectDarkMode } from 'redux/reducers/notificationSlice';
import useMultiWallet from "hooks/useMultiWallet";
import Loader from 'components/Loader';


const Navbar = () => {

    const storage = useAppSelector(selectStorage)
    const menuBar = useAppSelector(selectToggle)
    const dispatch = useAppDispatch()
    const selectedAccount = useAppSelector(SelectSelectedAccount)
    const dark = useAppSelector(selectDarkMode)
    const { data } = useMultiWallet()

 

    return <div className="grid grid-cols-[250px,1fr,1fr] md:grid-cols-[250px,1fr] gap-12 pl-4 pr-20">
        <div className="md:hidden ">
            <div className="inline-block" onClick={() => dispatch(setMenu(!menuBar.mobileMenu))}>
                <Hamburger toggled={menuBar.mobileMenu} hideOutline={true} />
            </div>
        </div>
        <div className="h-[50px] flex justify-center md:justify-start items-center  lg:pl-6">
            <img src={!dark ? "/logo.png" : "/logo_white.png"} alt="" width="150" />
        </div>
        <div className="hidden md:block place-self-end">
            <div className="flex gap-x-5">
                {storage && selectedAccount !== storage.accountAddress && !data?.some(s => s.address.toLowerCase() === selectedAccount.toLowerCase()) && <Visitcard name={'Multisig'} address={selectedAccount} />}
                {storage ? <Visitcard  address={storage.accountAddress} /> : <Loader />}
                <div className="relative self-center">
                    <NotificationCointainer />
                </div>
            </div>
        </div>
    </div>
}

export default Navbar;  