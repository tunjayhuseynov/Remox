import {
    MetaMaskConnector,
    CeloExtensionWalletConnector,
    LedgerConnector,
    WalletConnectConnector,
    PrivateKeyConnector,
    InjectedConnector
} from '@celo/react-celo/lib/connectors'
import { CeloContract } from '@celo/contractkit'
import { useDispatch, useSelector } from 'react-redux';
import { isMobile, isAndroid } from 'react-device-detect';
import { FirestoreRead, FirestoreWrite, useFirestoreRead } from 'rpcHooks/useFirebase';
import { auth, IIndividual, IOrganization, IUser } from 'firebaseConfig';
import useWalletKit from './walletSDK/useWalletKit';
import { useAppDispatch, useAppSelector } from 'redux/hooks';
import { SelectAccounts, SelectAccountType, SelectProviderAddress, SelectRemoxAccount, SelectStorage } from 'redux/slices/account/selector';
import { Connector, Mainnet, WalletTypes } from '@celo/react-celo';
import { useCelo, useCeloInternal } from '@celo/react-celo/lib/use-celo';
import { Create_Account_For_Individual, Create_Account_For_Organization } from 'redux/slices/account/thunks/account';
import { GetTime } from 'utils';
import { generate } from 'shortid';
import { Refresh_Data_Thunk } from 'redux/slices/account/thunks/refresh/refresh';
import { setProviderAddress, setPS } from 'redux/slices/account/remoxData';
import { Blockchains } from 'types/blockchains';


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
    const { Connect, Wallet, Address } = useWalletKit()
    const { network } = useCelo()
    const { initConnector } = useCeloInternal()
    const dispatch = useAppDispatch()
    const storage = useSelector(SelectStorage)

    const providerAddress = useAppSelector(SelectProviderAddress)
    const remoxAccount = useAppSelector(SelectRemoxAccount)
    const accountType = useAppSelector(SelectAccountType)
    const accounts = useAppSelector(SelectAccounts)

    const actionAfterConnectorSet = async (connector: Connector | void) => {
        try {
            const blockchain = Blockchains.find(s => s.chainId === network.chainId) ?? Blockchains[0]
            const isOrganization = accountType === 'organization'
            if (!remoxAccount) throw new Error("No remox account selected")
            if (!providerAddress) throw new Error("No provider address selected")
            const incomingData = await FirestoreRead<IUser>(isOrganization ? "organizations" : "individuals", remoxAccount.id)
            if (!incomingData) {
                throw new Error("No Data In Users")
            }

            if (connector && connector.kit.connection.defaultAccount && storage) {
                if (providerAddress === connector.kit.connection.defaultAccount) throw new Error("Provider address already set")

                const account = connector.kit.connection.defaultAccount

                if (accounts.find(a => a.address.toLowerCase() === account.toLowerCase())) throw new Error("Account already added")

                dispatch(setPS(true))


                if (account) {
                    if (!isOrganization) {
                        await dispatch(Create_Account_For_Individual({
                            individual: remoxAccount as IIndividual,
                            account: {
                                mail: null,
                                address: account,
                                blockchain: blockchain.name,
                                created_date: GetTime(),
                                pendingMembersObjects: [],
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
                        })).unwrap()
                    } else {
                        await dispatch(Create_Account_For_Organization({
                            organization: remoxAccount as IOrganization,
                            account: {
                                mail: null,
                                address: account,
                                blockchain: blockchain.name,
                                created_date: GetTime(),
                                pendingMembersObjects: [],
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
                        })).unwrap()
                    }
                    await dispatch(Refresh_Data_Thunk()).unwrap()
                    dispatch(setProviderAddress(account))
                    dispatch(setPS(false))
                }
            }
        } catch (error) {
            console.log(error)
            dispatch(setPS(false))
            throw new Error(error as any)
        }
    }

    const addWallet = async () => {
        try {
            const connector = await Connect()
            if (!connector) throw new Error("No Connector")
            await actionAfterConnectorSet(connector as Connector)
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
                return new MetaMaskConnector(Mainnet, false, CeloContract.GoldToken)
            case WalletTypes.Injected:
                return new InjectedConnector(Mainnet, false, CeloContract.GoldToken)
            case WalletTypes.PrivateKey:
                return new PrivateKeyConnector(Mainnet, (privateKey ?? ""), CeloContract.GoldToken)
            case WalletTypes.CeloExtensionWallet:
                return new CeloExtensionWalletConnector(Mainnet, CeloContract.GoldToken)
            case WalletTypes.Ledger:
                return new LedgerConnector(Mainnet, (index ?? 0), CeloContract.GoldToken)
            case WalletTypes.WalletConnect:
                return new WalletConnectConnector(Mainnet, false, CeloContract.GoldToken, {
                    connect: {
                        chainId: Mainnet.chainId
                    },
                }, isAndroid)
            case WalletTypes.CeloWallet:
                return new WalletConnectConnector(Mainnet, false, CeloContract.GoldToken, {
                    connect: {
                        chainId: Mainnet.chainId
                    },
                }, false, undefined, 1)
            case WalletTypes.CeloDance:
                return new WalletConnectConnector(Mainnet, false, CeloContract.GoldToken, {
                    connect: {
                        chainId: Mainnet.chainId
                    },
                }, isMobile, getDeepLink, 1)
            case WalletTypes.Valora:
                return new WalletConnectConnector(Mainnet, false, CeloContract.GoldToken, {
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
