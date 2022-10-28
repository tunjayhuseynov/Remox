import { useAppDispatch, useAppSelector } from 'redux/hooks';
import Visitcard from 'components/visitcard';
import useMultiWallet from "hooks/useMultiWallet";
import Loader from 'components/Loader';
import useNextSelector from 'hooks/useNextSelector';
import { IAccount } from 'firebaseConfig';
import NotificationCointainer from './Notification';
import { SelectAccounts, SelectBlockchain, SelectDarkMode, SelectFiatPreference, SelectProviderAddress } from 'redux/slices/account/remoxData';
import { useWalletKit } from 'hooks';
import { useEffect, useMemo, useState } from 'react';
import useAsyncEffect from 'hooks/useAsyncEffect';
import Image from 'next/image';
import { SelectBalance } from 'redux/slices/account/remoxData';
import Web3 from 'web3'
import { Tx_Refresh_Data_Thunk } from 'redux/slices/account/thunks/refresh/txRefresh';

const Navbar = () => {

    const selectedAccount = useAppSelector(SelectProviderAddress)
    const accounts = useAppSelector(SelectAccounts)
    const blockchain = useAppSelector(SelectBlockchain)
    const preference = useAppSelector(SelectFiatPreference)
    const balance = useAppSelector(SelectBalance)
    const dark = useNextSelector(SelectDarkMode)
    const { SpiralAPR } = useWalletKit()
    const { data } = useMultiWallet()
    const [APR, setAPR] = useState<number | undefined>()
    const dispatch = useAppDispatch()

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

    useEffect(() => {
        let web3 = new Web3(blockchain.wsUrl);

        web3.eth.subscribe('logs', {
            address: (accounts as IAccount[]).map(s => s.address),
        }, function (error, result) {
            console.log(error, result)
        }).on("data", function (log) {
            dispatch(Tx_Refresh_Data_Thunk())
        })

        return () => {
            web3.eth.clearSubscriptions(function () {
                console.log("cleared")
            })
        }

    }, [])

    return <div className="grid grid-cols-[250px,1fr,1fr] md:grid-cols-[250px,1fr] gap-12 pl-4 pr-8">
        <div className="h-[73px] flex justify-center md:justify-start items-center  lg:pl-6">
            <img src={dark ? "/logo.png" : "/logo_white.png"} alt="" width="150" />
        </div>
        <div className="hidden md:flex items-center justify-end">
            <div className="flex gap-x-4">
                {blockchain.name === "celo" &&
                    <div className="relative group">
                        <div className="rounded-md flex items-center px-3 py-2 space-x-3 bg-[#F9F9F9] dark:bg-[#252525] cursor-pointer" onClick={() => window.open("https://www.spirals.so/", "_blank")}>
                            <div className="font-medium text-sm dark:text-white text-dark">
                                {APR?.toLocaleString()} tCO2
                            </div>
                            <div className='flex items-center'>
                                <Image src="/icons/companies/spirals.svg" width="25" height="25" />
                            </div>
                        </div>
                        <div className="absolute group-hover:flex hidden shadow-xl -bottom-3 rounded-md translate-y-full space-x-1 bg-[#F9F9F9] dark:bg-[#252525] px-4 py-3 right-0 w-[11rem] items-center font-medium text-sm justify-between">
                            <span>Stake on</span> <img src="/icons/companies/spiralsLogo.svg" className="h-[1.25rem]" alt="" />
                        </div>
                    </div>
                }
                <Visitcard name={'Multisig'} address={selectedAccount ?? ""} />
                <div className="relative items-center flex justify-center">
                    <NotificationCointainer />
                </div>
            </div>
        </div>
    </div>
}

export default Navbar;  
