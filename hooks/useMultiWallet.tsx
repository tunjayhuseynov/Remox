import {
    MetaMaskConnector,
    CeloExtensionWalletConnector,
    LedgerConnector,
    WalletConnectConnector,
    PrivateKeyConnector,
    InjectedConnector
} from '@celo/react-celo/lib/connectors/connectors'
import { CeloContract } from '@celo/contractkit'
import { useDispatch, useSelector } from 'react-redux';
import { changeAccount } from "../redux/slices/account/selectedAccount";
import { selectStorage, setStorage } from "../redux/slices/account/storage";
import { isMobile, isAndroid } from 'react-device-detect';
import { FirestoreRead, FirestoreWrite, useFirestoreRead } from 'rpcHooks/useFirebase';
import { auth, IIndividual, IOrganization, IUser } from 'firebaseConfig';
import useWalletKit from './walletSDK/useWalletKit';
import { useAppDispatch, useAppSelector } from 'redux/hooks';
import { SelectAccounts, SelectAccountType, SelectProviderAddress, SelectRemoxAccount } from 'redux/slices/account/selector';
import { Connector, Mainnet, WalletTypes } from '@celo/react-celo';
import { useCeloInternal } from '@celo/react-celo/lib/use-celo';
import { Create_Account_For_Individual, Create_Account_For_Organization } from 'redux/slices/account/thunks/account';
import { GetTime } from 'utils';
import { generate } from 'shortid';
import { Refresh_Data_Thunk } from 'redux/slices/account/thunks/refresh';
import { setProviderAddress } from 'redux/slices/account/remoxData';


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
    const { Connect, blockchain, Wallet, Address } = useWalletKit()
    const { initConnector } = useCeloInternal()
    const dispatch = useAppDispatch()
    const storage = useSelector(selectStorage)

    const providerAddress = useAppSelector(SelectProviderAddress)
    const remoxAccount = useAppSelector(SelectRemoxAccount)
    const accountType = useAppSelector(SelectAccountType)
    const accounts = useAppSelector(SelectAccounts)

    const actionAfterConnectorSet = async (connector: Connector | void) => {
        const isOrganization = accountType === 'organization'
        if (!remoxAccount) throw new Error("No remox account selected")
        if (!providerAddress) throw new Error("No provider address selected")
        const incomingData = await FirestoreRead<IUser>(isOrganization ? "organizations" : "individuals", remoxAccount.id)
        if (!incomingData) {
            throw new Error("No Data In Users")
        }

        if (connector && connector.account && storage) {
            if (providerAddress === connector.account) throw new Error("Provider address already set")

            const account = connector.account

            if (account) {
                if (!isOrganization) {
                    await dispatch(Create_Account_For_Individual({
                        individual: remoxAccount as IIndividual,
                        account: {
                            mail: null,
                            address: account,
                            blockchain: blockchain.name,
                            created_date: GetTime(),
                            createdBy: auth.currentUser?.uid ?? providerAddress,
                            id: generate(),
                            image: null,
                            name: `Remox #${accounts.length}`,
                            members: [
                                {
                                    address: account,
                                    id: generate(),
                                    image: null,
                                    name: `Remox #${Math.round(Math.random() * 100)}`,
                                    mail: null,
                                }
                            ],
                            provider: null,
                            signerType: "single",
                        }
                    }))
                }
                await dispatch(Refresh_Data_Thunk())
                // dispatch(setProviderAddress(account))
            }
        }
    }

    const addWallet = async () => {
        try {
            if (blockchain.name === "celo") {
                const connector = await Connect()
                if (!connector) throw new Error("No Connector")
                await actionAfterConnectorSet(connector as Connector)
                return connector;
            }
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

            // if (connector) {
            //     await actionAfterConnectorSet(connector)
            // }
        } catch (error: any) {
            console.error(error)
            throw new Error(error.message)
        }
    }

    const WalletFinder = (type: string, { index, privateKey }: { index?: number, privateKey?: string } = {}) => {
        switch (type) {
            case WalletTypes.MetaMask:
                return new MetaMaskConnector(Mainnet, CeloContract.GoldToken)
            case WalletTypes.Injected:
                return new InjectedConnector(Mainnet, CeloContract.GoldToken)
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

    return { walletSwitch, addWallet, data: remoxAccount?.accounts ?? [], Wallet }
}
