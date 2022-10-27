import { useAppDispatch, useAppSelector } from 'redux/hooks';
import Visitcard from 'components/visitcard';
import useMultiWallet from "hooks/useMultiWallet";
import Loader from 'components/Loader';
import useNextSelector from 'hooks/useNextSelector';
import { IAccount } from 'firebaseConfig';
import NotificationCointainer from './Notification';
import { SelectBlockchain, SelectDarkMode, SelectFiatPreference, SelectProviderAddress } from 'redux/slices/account/remoxData';
import { useWalletKit } from 'hooks';
import { useMemo, useState } from 'react';
import useAsyncEffect from 'hooks/useAsyncEffect';
import Image from 'next/image';
import { SelectBalance } from 'redux/slices/account/remoxData';
import { GetFiatPrice } from 'utils/const';


const Navbar = () => {

    const selectedAccount = useAppSelector(SelectProviderAddress)
    const blockchain = useAppSelector(SelectBlockchain)
    const preference = useAppSelector(SelectFiatPreference)
    const balance = useAppSelector(SelectBalance)
    const dark = useNextSelector(SelectDarkMode)
    const { SpiralAPR } = useWalletKit()
    const { data } = useMultiWallet()
    const [APR, setAPR] = useState<number | undefined>()

    useAsyncEffect(async () => {
        if (blockchain.name === "celo") {
            const apr = await SpiralAPR()
            if (apr && balance["gCELO"]) {
                const coin = balance["gCELO"];
                const total = (coin.amount * coin.priceUSD * +apr) / 100;
                setAPR(total / 15)
            }
        }
    }, [])

    return <div className="grid grid-cols-[250px,1fr,1fr] md:grid-cols-[250px,1fr] gap-12 pl-4 pr-8">
        <div className="h-[73px] flex justify-center md:justify-start items-center  lg:pl-6">
            <img src={dark ? "/logo.png" : "/logo_white.png"} alt="" width="150" />
        </div>
        <div className="hidden md:flex items-center justify-end">
            <div className="flex gap-x-4">
                {blockchain.name === "celo" &&
                    <div className="rounded-md flex items-center px-3 py-2 space-x-3 bg-[#F9F9F9]  dark:bg-[#252525]" >
                        <div className="font-medium text-sm dark:text-white text-dark">
                            {APR?.toLocaleString()} tCO2
                        </div>
                        <div className='flex items-center'>
                            <Image src="/icons/companies/spirals.svg" width="25" height="25" />
                        </div>
                    </div>}
                <Visitcard name={'Multisig'} address={selectedAccount ?? ""} />
                <div className="relative items-center flex justify-center">
                    <NotificationCointainer />
                </div>
            </div>
        </div>
    </div>
}

export default Navbar;  
