import { useAppDispatch, useAppSelector } from 'redux/hooks';
import Visitcard from 'components/visitcard';
import useMultiWallet from "hooks/useMultiWallet";
import { IAccount } from 'firebaseConfig';
import NotificationCointainer from './Notification';
import { SelectAccounts, SelectBlockchain, SelectDarkMode, SelectFiatPreference, SelectID, SelectProviderAddress, setRequest, setResetRemoxData } from 'redux/slices/account/remoxData';
import { useWalletKit } from 'hooks';
import { useEffect, useMemo, useState } from 'react';
import useAsyncEffect from 'hooks/useAsyncEffect';
import Image from 'next/image';
import { SelectBalance } from 'redux/slices/account/remoxData';
import Web3 from 'web3'
import { Tx_Refresh_Data_Thunk } from 'redux/slices/account/thunks/refresh/txRefresh';
import { useCelo } from '@celo/react-celo';
import { useFirestoreRead } from 'rpcHooks/useFirebase';
import { IRequest } from 'rpcHooks/useRequest';
import { Blockchains } from 'types/blockchains';

const Navbar = () => {

    const selectedAccount = useAppSelector(SelectProviderAddress)
    const accounts = useAppSelector(SelectAccounts)
    const preference = useAppSelector(SelectFiatPreference)
    const balance = useAppSelector(SelectBalance)
    const dark = useAppSelector(SelectDarkMode)
    const { SpiralAPR } = useWalletKit()
    const { data } = useMultiWallet()
    const [APR, setAPR] = useState<number | undefined>()
    const dispatch = useAppDispatch()
    const { address } = useCelo()

    const id = useAppSelector(SelectID)

    const requests = useFirestoreRead<{ requests: IRequest[] }>("requests", id ?? "0")

    useEffect(() => {
        if (requests.data && requests.data.requests.length > 0) {
            dispatch(setRequest(requests.data.requests))
        }
    }, [requests])

    useEffect(() => {
        if (!address) {
            dispatch(setResetRemoxData())
        }
    }, [address])

    useAsyncEffect(async () => {
        const blockchain = Blockchains.find(s => s.name === "celo")!
        const apr = await SpiralAPR(blockchain)
        if (apr && balance["gCELO"]) {
            const coin = balance["gCELO"];
            const total = (coin.amount * coin.priceUSD * +apr) / 100;
            setAPR(total / 15)
        }
    }, [])

    useEffect(() => {
        // let web3 = new Web3(blockchain.wsUrl);
        // let addresses = (accounts as IAccount[]).map(s => s.address)
        // if (addresses.length > 0) {
        //     web3.eth.subscribe('logs', {
        //         address: addresses,
        //     }, function (error, result) {
        //         console.log(error, result)
        //     }).on("data", function (log) {
        //         dispatch(Tx_Refresh_Data_Thunk())
        //     })
        // }

        // return () => {
        //     web3.eth.clearSubscriptions(function () {
        //         console.log("cleared")
        //     })
        // }

    }, [accounts])

    return <div className="grid grid-cols-[250px,1fr,1fr] md:grid-cols-[250px,1fr] gap-12 pl-4 pr-8">
        <div className="h-[73px] flex justify-center md:justify-start items-center lg:pl-6">
            <img src={dark ? "/logo_beta.svg" : "/logo_white_beta.svg"} alt="" width="150" className="cursor-pointer" />
        </div>
        <div className="hidden md:flex items-center justify-end">
            <div className="flex gap-x-4">
                {accounts.find(s=>s.blockchain === "celo") &&
                    <div className="relative group hover:shadow-navbarShadow rounded-md">
                        <div className="rounded-md flex items-center px-3 py-2 space-x-3 bg-[#F9F9F9] dark:bg-[#252525] cursor-pointer" onClick={() => window.open("https://app.spirals.so/", "_blank")}>
                            <div className="font-medium text-sm dark:text-white text-dark">
                                {APR?.toLocaleString()} tCO2
                            </div>
                            <div className='flex items-center'>
                                <Image src="/icons/companies/spirals.svg" width="25" height="25" />
                            </div>
                        </div>
                        <div className="absolute group-hover:flex hidden shadow-xl -bottom-3 rounded-md translate-y-full space-x-1 bg-[#F9F9F9] dark:bg-[#252525] px-4 py-3 right-0 w-[11rem] items-center font-medium text-sm justify-between">
                            <span>Stake on</span> <img src={dark ? "/icons/companies/spiralsLogoDark.svg" : "/icons/companies/spiralsLogo.svg"} className="h-[1.25rem]" alt="" />
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
