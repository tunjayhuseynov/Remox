import { MetaMaskConnector, CeloExtensionWalletConnector, LedgerConnector, WalletConnectConnector, PrivateKeyConnector } from '@celo-tools/use-contractkit/lib/connectors/connectors'
import { Mainnet, useContractKit, useContractKitInternal, Connector, WalletTypes } from "@celo-tools/use-contractkit";
import { CeloContract } from '@celo/contractkit'
import { useDispatch, useSelector } from 'react-redux';
import { changeAccount } from "../redux/reducers/selectedAccount";
import { selectStorage, setStorage } from "../redux/reducers/storage";
import { isMobile, isAndroid } from 'react-device-detect';
import { FirestoreRead, FirestoreWrite, useFirestoreRead } from 'API/useFirebase';
import { IUser } from 'firebaseConfig';
import { getAuth } from 'firebase/auth';
import useWalletKit from './walletSDK/useWalletKit';


export enum WalletIds {
    Valora = 'd01c7758d741b363e637a817a09bcf579feae4db9f5bb16f599fdd1f66e2f974',
    CeloWallet = '36d854b702817e228d5c853c528d7bdb46f4bb041d255f67b82eb47111e5676b',
    CeloDance = 'TODO',
    CeloTerminal = '8f8506b7f191a8ab95a8295fc8ca147aa152b1358bee4283d6ad2468d97e0ca4',
}

const getDeepLink = (uri: string) => {
    return `celo://wallet/wc?uri=${uri}`;
};

export default function useMultiWallet() {
    const { Connect, blockchain, Wallet } = useWalletKit()
    const { initConnector } = useContractKitInternal()
    const dispatch = useDispatch()
    const storage = useSelector(selectStorage)
    const user = getAuth()
    const data = useFirestoreRead<IUser>('users', user.currentUser!.uid).data?.multiwallets;

    const actionAfterConnectorSet = async (connector: Connector | void) => {
        const incomingData = await FirestoreRead<IUser>("users", user!.currentUser!.uid)
        if (!incomingData) {
            throw new Error("No Data In Users")
        }

        if (connector && connector.account && storage) {
            if (!incomingData.address.some(address => address === connector.account) && !incomingData.multiwallets.some(s => s.address === connector.account)) {
                const arr = [...incomingData.address, connector.account]
                await FirestoreWrite<Pick<IUser, "address" | "multiwallets">>().updateDoc("users", user!.currentUser!.uid, {
                    address: arr,
                    multiwallets: [...incomingData.multiwallets, { name: connector.type, address: connector.account, blockchain }]
                })
            }
            dispatch(setStorage({
                ...storage,
                accountAddress: connector.account,
            }))
            dispatch(changeAccount(connector.account))
        }
    }

    const addWallet = async () => {
        try {
            const connector = await Connect()
            await actionAfterConnectorSet(connector)
            return connector;
        } catch (error: any) {
            console.error(error)
            throw new Error(error.message)
        }
    }

    const walletSwitch = async (type: string, { index, privateKey }: { index?: number, privateKey?: string } = {}) => {
        let connector;
        let lastConnection;
        if (Wallet) lastConnection = WalletFinder(Wallet, { index: index, privateKey: privateKey });
        try {
            connector = WalletFinder(type, { index: index, privateKey: privateKey })

            await initConnector(connector)

            if (connector) {
                await actionAfterConnectorSet(connector)
            }
        } catch (error: any) {
            console.error(error)
            throw new Error(error.message)
        }
    }

    const WalletFinder = (type: string, { index, privateKey }: { index?: number, privateKey?: string } = {}) => {
        switch (type) {
            case WalletTypes.MetaMask:
                return new MetaMaskConnector(Mainnet, CeloContract.GoldToken)
            case WalletTypes.PrivateKey:
                return new PrivateKeyConnector(Mainnet, (privateKey ?? ""), CeloContract.GoldToken)
            case WalletTypes.CeloExtensionWallet:
                return new CeloExtensionWalletConnector(Mainnet, CeloContract.GoldToken)
            case WalletTypes.Ledger:
                return new LedgerConnector(Mainnet, (index ?? 0), CeloContract.GoldToken)
            case WalletTypes.WalletConnect:
                return new WalletConnectConnector(Mainnet, CeloContract.GoldToken, {
                    connect: {
                        chainId: Mainnet.chainId
                    },
                }, isAndroid)
            case WalletTypes.CeloWallet:
                return new WalletConnectConnector(Mainnet, CeloContract.GoldToken, {
                    connect: {
                        chainId: Mainnet.chainId
                    },
                }, false, undefined, 1)
            case WalletTypes.CeloDance:
                return new WalletConnectConnector(Mainnet, CeloContract.GoldToken, {
                    connect: {
                        chainId: Mainnet.chainId
                    },
                }, isMobile, getDeepLink, 1)
            case WalletTypes.Valora:
                return new WalletConnectConnector(Mainnet, CeloContract.GoldToken, {
                    connect: {
                        chainId: Mainnet.chainId
                    },
                }, isMobile, getDeepLink, 1)
            default:
                throw new Error("None of the wallets are supported")
        }
    }

    return { walletSwitch, addWallet, data, Wallet }
}
