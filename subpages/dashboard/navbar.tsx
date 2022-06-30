import { useAppDispatch, useAppSelector } from 'redux/hooks';
import { selectStorage } from 'redux/slices/account/storage';
import { Squash as Hamburger } from 'hamburger-react'
import NotificationCointainer from '../notification'
import { SelectSelectedAccount } from 'redux/slices/account/selectedAccount';
import Visitcard from 'components/visitcard';
import { changeDarkMode, selectDarkMode } from 'redux/slices/notificationSlice';
import useMultiWallet from "hooks/useMultiWallet";
import Loader from 'components/Loader';
import useNextSelector from 'hooks/useNextSelector';
import { IAccount } from 'firebaseConfig';


const Navbar = () => {

    const storage = useNextSelector(selectStorage)
    const selectedAccount = useNextSelector(SelectSelectedAccount)
    const dark = useNextSelector(selectDarkMode)

    const dispatch = useAppDispatch()
    const { data } = useMultiWallet()



    return <div className="grid grid-cols-[250px,1fr,1fr] md:grid-cols-[250px,1fr] gap-12 pl-4 pr-20">
        <div className="h-[50px] flex justify-center md:justify-start items-center  lg:pl-6">
            <img src={dark ? "/logo.png" : "/logo_white.png"} alt="" width="150" />
        </div>
        <div className="hidden md:block place-self-end">
            <div className="flex gap-x-5">
                {storage && selectedAccount !== storage.lastSignedProviderAddress && !data?.some(s => (s as IAccount).address.toLowerCase() === selectedAccount?.toLowerCase()) && <Visitcard name={'Multisig'} address={selectedAccount ?? ""} />}
                {storage ? <Visitcard address={storage.lastSignedProviderAddress} /> : <Loader />}
                <div className="relative self-center">
                    <NotificationCointainer />
                </div>
            </div>
        </div>
    </div>
}

export default Navbar;  