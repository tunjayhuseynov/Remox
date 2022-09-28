import { useAppDispatch, useAppSelector } from 'redux/hooks';
import { selectStorage } from 'redux/slices/account/storage';
import { Squash as Hamburger } from 'hamburger-react'
import Visitcard from 'components/visitcard';
import useMultiWallet from "hooks/useMultiWallet";
import Loader from 'components/Loader';
import useNextSelector from 'hooks/useNextSelector';
import { IAccount } from 'firebaseConfig';
import NotificationCointainer from './Notification';
import { SelectDarkMode, SelectProviderAddress } from 'redux/slices/account/remoxData';
import { useWalletKit } from 'hooks';
import { useState } from 'react';
import useAsyncEffect from 'hooks/useAsyncEffect';


const Navbar = () => {

    const storage = useAppSelector(selectStorage)
    const selectedAccount = useAppSelector(SelectProviderAddress)
    const dark = useNextSelector(SelectDarkMode)
    const { Address } = useWalletKit()
    const { data } = useMultiWallet()

    const [address, setAddress] = useState(storage?.lastSignedProviderAddress)

    useAsyncEffect(async () => {
        const address = await Address
        if (address) {
            setAddress(address)
        }
    }, [Address])



    return <div className="grid grid-cols-[250px,1fr,1fr] md:grid-cols-[250px,1fr] gap-12 pl-4 pr-8">
        <div className="h-[73px] flex justify-center md:justify-start items-center  lg:pl-6">
            <img src={dark ? "/logo.png" : "/logo_white.png"} alt="" width="150" />
        </div>
        <div className="hidden md:flex items-center  justify-end">
            <div className="flex gap-x-4">
                <Visitcard name={'Multisig'} address={selectedAccount ?? ""} />
                <div className="relative items-center flex justify-center">
                    <NotificationCointainer />
                </div>
            </div>
        </div>
    </div>
}

export default Navbar;  