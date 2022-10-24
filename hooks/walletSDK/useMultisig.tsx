import { useCallback } from "react";
import { Connection, Keypair, PublicKey, SystemProgram, Transaction, TransactionInstruction } from "@solana/web3.js";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { auth, IAccount, Image, IMember } from 'firebaseConfig';
import { stringToSolidityBytes } from "@celo/contractkit/lib/wrappers/BaseWrapper";
import * as borsh from '@project-serum/borsh';
import BN from 'bn.js'
import { GokiSDK, GOKI_ADDRESSES, GOKI_IDLS, Programs } from '@gokiprotocol/client'
import useSolanaProvider from "./useSolanaProvider";
import { GetTime } from "utils";
import { process } from "uniqid"
import { Create_Account_For_Individual, Create_Account_For_Organization, Add_Member_To_Account_Thunk, Remove_Member_From_Account_Thunk, Replace_Member_In_Account_Thunk, Add_Member_To_Pending_List_Thunk } from "redux/slices/account/thunks/account";
import { useAppDispatch, useAppSelector } from "redux/hooks";
import { SelectAccounts, SelectBlockchain, SelectID, SelectOrganization, SelectProviderAddress, SelectRemoxAccount } from "redux/slices/account/remoxData";
import { AbiItem } from "rpcHooks/ABI/AbiItem";
import Web3 from 'web3'
import { SolanaReadonlyProvider } from "@saberhq/solana-contrib";
import { SolanaSerumEndpoint } from "components/Wallet";
import { newProgramMap } from "@saberhq/anchor-contrib";
import { utils } from "@project-serum/anchor";
import BigNumber from "bignumber.js";
import { SelectIndividual } from 'redux/slices/account/remoxData';
import { Multisig_Fetch_Thunk } from "redux/slices/account/thunks/multisig";
import { useCelo } from "@celo/react-celo";
import { ITag } from "pages/api/tags/index.api";
import { AltCoins, GnosisConfirmation, GnosisDataDecoded, GnosisTransaction } from "types";
import { ethers } from "ethers";
import EthersAdapter from "@gnosis.pm/safe-ethers-lib";
import Safe, {
    AddOwnerTxParams,
    RemoveOwnerTxParams,
    SafeFactory,
    SafeTransactionOptionalProps,
} from "@gnosis.pm/safe-core-sdk";
import {
    getMultiSendCallOnlyDeployment,
    getCreateCallDeployment
} from '@gnosis.pm/safe-deployments'
import { SafeAccountConfig } from "@gnosis.pm/safe-core-sdk";
import SafeServiceClient from "@gnosis.pm/safe-service-client";
import {
    MetaTransactionData,
    SafeTransactionData,
    SafeTransactionDataPartial,
} from "@gnosis.pm/safe-core-sdk-types";
import { EthSignSignature } from "@gnosis.pm/safe-core-sdk";
import { IAutomationBatchRequest, IAutomationCancel, IAutomationTransfer, IBatchRequest, ISwap, ITransfer, ITransferComment, ITransferFrom } from "hooks/useTransactionProcess";
import { IBudgetORM } from "pages/api/budget/index.api";
import { nanoid } from "@reduxjs/toolkit";
import { Add_Tx_To_TxList_Thunk } from "redux/slices/account/thunks/transaction";
import { MultisigProviders } from "types/blockchains";
import { ISendTx } from "pages/api/payments/send/index.api";
import axios from "axios";
import { hexToNumberString, toChecksumAddress } from "web3-utils";
import { Refresh_Balance_Thunk } from "redux/slices/account/thunks/refresh/balance";
import { Refresh_Accounts_Thunk } from "redux/slices/account/thunks/refresh/account";


let multiProxy = import("rpcHooks/ABI/MultisigProxy.json");
let multisigContract = import("rpcHooks/ABI/CeloTerminal.json")

export interface ITransactionMultisig {
    provider: MultisigProviders,
    name: string;
    destination: string,
    hashOrIndex: string,
    indexPlace?: number,
    txHash?: string,
    nonce?: number,
    firstNonce?: number,
    contractAddress: string,
    contractOwnerAmount: number,
    contractOwners: string[],
    contractThresholdAmount: number,
    contractInternalThresholdAmount: number,
    isExecuted: boolean,
    confirmations: string[],
    timestamp: number,
    executedAt?: number,
    tags: ITag[],
    budget: IBudgetORM | null
    rejection?: GnosisTransaction | null,

    tx: Omit<
        Partial<ITransfer> &
        Partial<ITransferComment> &
        Partial<ITransferFrom> &
        Partial<IAutomationTransfer> &
        Partial<IAutomationCancel> &
        Partial<IAutomationBatchRequest> &
        Partial<ISwap> &
        Partial<IBatchRequest>, "rawData" | "tags" | "budget" | "timestamp">

    // data?: string,
    // value: string,
    // id?: number | string,
    // requiredCount?: string,
    // owner?: string,
    // newOwner?: string,
    // valueOfTransfer?: string,
    // type: string,
    // created_at: number,
}

export interface IMultisigSafeTransaction {
    type: string,
    data: string | null,
    nonce: number,
    executionDate: string | null,
    submissionDate: string,
    modified: string | null,
    blockNumber: number | null,
    transactionHash: string | null,
    safeTxHash: string,
    executor: string | null,
    isExecuted: boolean,
    isSuccessful: boolean | null,
    signatures: string,
    txType: string
    confirmations: GnosisConfirmation[],
    settings: GnosisSettingsTx | null,
    transfer: GnosisTransferTx | null,
    contractAddress: string,
    contractThresholdAmount: number,
    tags: ITag[],
}

export interface GnosisSettingsTx {
    dataDecoded: GnosisDataDecoded,
}

export interface GnosisTransferTx {
    dataDecoded: GnosisDataDecoded | null,
    to: string,
    coin: AltCoins
    value: string | number,
}


export enum MethodIds {
    "0x173825d9" = 'removeOwner',
    "0xe20056e6" = 'replaceOwner',
    "0x7065cb48" = 'addOwner',
    "0xa9059cbb" = 'transfer',
    "0x2e6c3721" = 'changeInternalRequirement',
    "0xba51a6df" = 'changeRequirement'
}

export enum MethodNames {
    "removeOwner" = '0x173825d9',
    "replaceOwner" = '0xe20056e6',
    "addOwner" = '0x7065cb48',
    "transfer" = '0xa9059cbb',
    "changeInternalRequirement" = '0x2e6c3721',
    "changeRequirement" = '0xba51a6df'
}

enum SolanaMultisig {
    GOKI = "GOKI",
    ZEBEC = "ZEBEC"
}

export type SolanaMultisigData = {
    pda: string,
    multisig: string,
    signature: string,
    type: SolanaMultisig
}

export type CeloMultisigData = string;

export type MultisigAddressType = {
    name: string,
    address: CeloMultisigData | SolanaMultisigData,
    blockchain: string
}

export type MultisigType = {
    addresses: MultisigAddressType[]
}

export default function useMultisig() {

    const blockchain = useAppSelector(SelectBlockchain)
    const individual = useAppSelector(SelectIndividual)
    const organization = useAppSelector(SelectOrganization)
    const accounts = useAppSelector(SelectAccounts)
    const remoxAccount = useAppSelector(SelectRemoxAccount)

    const dispatch = useAppDispatch()

    //Celo
    const { kit } = useCelo()
    const providerKit = kit.connection.web3.givenProvider

    //solana
    const { connection } = useConnection();
    const { publicKey, sendTransaction } = useWallet();
    const { Provider } = useSolanaProvider()

    const selectedId = useAppSelector(SelectID)


    const selectedAddress = useAppSelector(SelectProviderAddress)


    const initGokiSolana = async () => {
        const provider = Provider;
        if (!provider) throw new Error("Provider not initialized")

        const sdk = GokiSDK.load({ provider })

        return { sdk, provider };
    }

    const txServiceUrl = blockchain.multisigProviders.find((s) => s.name === "GnosisSafe")?.txServiceUrl

    const GokiProgram = (multisigAddress?: string) => {
        const connection = new Connection(SolanaSerumEndpoint, "finalized");
        const Provider = new SolanaReadonlyProvider(connection)

        const allAddresses = { ...GOKI_ADDRESSES };
        if (multisigAddress) {
            allAddresses.SmartWallet = new PublicKey(multisigAddress)
        }

        return newProgramMap<Programs>(Provider, GOKI_IDLS, allAddresses);
    }

    const createMultisigAccount = useCallback(async (owners: { name: string; address: string }[], name: string, sign: number, internalSign: number, image: Image | null, type: "organization" | "individual", provider: MultisigProviders) => {
        let proxyAddress: string;

        if (!blockchain) throw new Error("Blockchain is not selected")
        if (!auth.currentUser) throw new Error("User is not logged in")

        if (type === "organization") {
            if (!organization) throw new Error("Organization is not selected")
        } else {
            if (!individual) throw new Error("Individual is not selected")
        }

        if (provider === "Goki" && publicKey) {

            const programs = GokiProgram();

            const smartWalletBase = Keypair.generate();

            const [smartWallet, bump] = await PublicKey.findProgramAddress(
                [utils.bytes.utf8.encode("GokiSmartWallet"), smartWalletBase.publicKey.toBuffer()],
                GOKI_ADDRESSES.SmartWallet
            );

            const instruction = programs.SmartWallet.instruction.createSmartWallet(
                bump,
                owners.length,
                owners.map(o => new PublicKey(o.address)),
                new BN(sign),
                new BN(0),
                {
                    accounts: {
                        base: smartWalletBase.publicKey,
                        smartWallet,
                        payer: publicKey,
                        systemProgram: SystemProgram.programId,
                    },
                }
            )

            const transaction = new Transaction()
            transaction.add(instruction)

            const signature = await sendTransaction(transaction, connection);
            const latestBlockHash = await connection.getLatestBlockhash();
            await connection.confirmTransaction({
                blockhash: latestBlockHash.blockhash,
                lastValidBlockHeight: latestBlockHash.lastValidBlockHeight,
                signature: signature
            });

            proxyAddress = smartWalletBase.publicKey.toBase58();
            provider = "Goki"

        } else if (provider === "GnosisSafe") {
            const web3Provider = providerKit
            const ethersProvider = new ethers.providers.Web3Provider(web3Provider);
            const safeOwner = ethersProvider.getSigner();
            const ethAdapter = new EthersAdapter({
                ethers,
                signer: safeOwner,
            });

            // const multiSendDeployment =
            //     getMultiSendCallOnlyDeployment({
            //         network: "42220",
            //     }) || getMultiSendCallOnlyDeployment()



            // const masterCopy = getCreateCallDeployment({
            //     network: "42220",
            // })

            // const contractAddress = multiSendDeployment?.networkAddresses["42220"] ?? multiSendDeployment?.defaultAddress

            // const network = {
            //     [4220]: {
            //         multiSendAddress: contractAddress ?? "",
            //         safeMasterCopyAddress: masterCopy?.networkAddresses["42220"],
            //         safeProxyFactoryAddress: "0xC22834581EbC8527d974F8a1c97E1bEA4EF910BC",
            //     }
            // }

            const safeFactory = await SafeFactory.create({
                ethAdapter,
                isL1SafeMasterCopy: false,
                safeVersion: "1.3.0",
                // contractNetworks: blockchain.name === "celo" ? network : undefined
            });

            const safeAccountConfig: SafeAccountConfig = {
                owners: owners.map((owner) => owner.address),
                threshold: internalSign,
            };

            const safeSdk = await safeFactory.deploySafe({ safeAccountConfig });

            const safeAddress = safeSdk.getAddress();

            proxyAddress = safeAddress;

            provider = "GnosisSafe"

        } else {
            if (!selectedAddress) throw new Error("Address is not selected")

            const { abi: proxyABI, bytecode: proxyBytecode } = await multiProxy
            const { abi: multiSigABI, bytecode: multiSigBytecode } = await multisigContract

            const web3 = new Web3(providerKit)

            const proxy = await new web3.eth.Contract(proxyABI as AbiItem[]).deploy({ data: proxyBytecode }).send({
                from: selectedAddress,
                gas: 1000000,
                gasPrice: "500000000",
            })

            const multisig = await new web3.eth.Contract(multiSigABI as AbiItem[]).deploy({ data: multiSigBytecode }).send({
                from: selectedAddress,
                gas: 1000000,
                gasPrice: "500000000",
            })

            proxyAddress = proxy.options.address;
            let multisigAddress = multisig.options.address;

            let initData = multisig.methods.initialize(owners.map(s => s.address), new BigNumber(sign), new BigNumber(internalSign)).encodeABI()

            await proxy.methods._setAndInitializeImplementation(multisigAddress, initData).send({
                from: selectedAddress,
                gas: 250000,
                gasPrice: "500000000",
            })

            await proxy.methods._transferOwnership(proxyAddress).send({
                from: selectedAddress,
                gas: 25000,
                gasPrice: "500000000",
            })

            provider = "Celo Terminal"
        }

        let myResponse: IAccount = {
            created_date: GetTime(),
            blockchain: blockchain.name,
            createdBy: auth.currentUser?.uid,
            mail: null,
            pendingMembersObjects: [],
            address: proxyAddress,
            id: nanoid(),
            members: owners.map<IMember>(s => ({
                address: toChecksumAddress(s.address),
                id: process(),
                name: s.name,
                image: null,
                mail: "",
            })),
            image: image,
            name: name,
            provider,
            signerType: "multi"
        }


        if (type === "organization") {
            await dispatch(Create_Account_For_Organization({
                account: myResponse,
                organization: organization!
            }))
        } else if (type === "individual") {
            await dispatch(Create_Account_For_Individual({
                account: myResponse,
                individual: individual!
            }))
        }

        return myResponse;
    }, [blockchain])

    const importMultisigAccount = async (contractAddress: string, name = "", image: Image | null, type: "organization" | "individual", provider: MultisigProviders) => {
        try {
            if (!blockchain) throw new Error("Blockchain is not selected")
            if (accounts.some(s => s.address.toLowerCase() === contractAddress.toLowerCase())) throw new Error("This address already exist");
            if (!auth.currentUser) throw new Error("User is not logged in")

            let members: string[] = [];

            if (provider === "Goki") {
                if (!publicKey) throw new Error("Public key is not selected")

                const programs = GokiProgram(contractAddress);

                const data = await programs.SmartWallet.account.smartWallet.fetch(new PublicKey(contractAddress));

                members = data.owners.map(o => o.toBase58())

                if (members.includes(publicKey.toBase58())) throw new Error("You are already a member of this account");

                provider = "Goki"

            } else if (provider === "Celo Terminal") {
                const web3 = new Web3(providerKit)

                const Multisig = await multisigContract

                const contract = new web3.eth.Contract(Multisig.abi.map(item => Object.assign({}, item, { selected: false })) as AbiItem[], contractAddress)

                const isOwner = await contract.methods.isOwner().call();
                const owners = await contract.methods.getOwners().call();

                members = [...owners];
                if (!isOwner) throw new Error("You are not an owner in this multisig address");
            } else if (provider === "GnosisSafe") {
                const web3Provider = providerKit
                const ethersProvider = new ethers.providers.Web3Provider(web3Provider);
                const safeOwner = ethersProvider.getSigner();

                const ethAdapter = new EthersAdapter({
                    ethers,
                    signer: safeOwner,
                });

                const safeAddress = contractAddress;

                const safeSdk = await Safe.create({
                    ethAdapter,
                    safeAddress,
                    isL1SafeMasterCopy: false,
                });

                const owners = await safeSdk.getOwners();

                members = [...owners];
            }

            let myResponse: IAccount = {
                created_date: GetTime(),
                blockchain: blockchain.name,
                address: contractAddress,
                mail: null,
                createdBy: auth.currentUser.uid,
                pendingMembersObjects: [],
                id: process(name.split(" ").join("")),
                members: members.map<IMember>(s => ({
                    address: s,
                    id: nanoid(),
                    name: "",
                    image: null,
                    mail: "",
                })),
                image: image,
                name: name,
                provider,
                signerType: "multi"
            }

            if (type === "organization") {
                dispatch(Create_Account_For_Organization({
                    account: myResponse,
                    organization: organization!
                }))
            } else if (type === "individual") {
                dispatch(Create_Account_For_Individual({
                    account: myResponse,
                    individual: individual!
                }))
            }

            await dispatch(Multisig_Fetch_Thunk({
                accounts: accounts,
                blockchain: blockchain.name,
                addresses: accounts.filter(s => s.signerType === "multi").map(s => s.address),
                fetchable: true
            })).unwrap()

            return myResponse
        } catch (e: any) {
            throw new Error(e);
        }
    }


    const removeOwner = useCallback(async (account: IAccount, ownerAddress: string, provider: MultisigProviders, newInternalSign?: number) => {
        try {
            if (!remoxAccount) throw new Error("Account is not selected")
            if (!blockchain) throw new Error("Blockchain is not selected")
            if (!selectedId) throw new Error("Selected id is not selected")

            if (provider === "Goki") {
                const { sdk } = await initGokiSolana();
                const wallet = await sdk.loadSmartWallet(new PublicKey(account.address));
                if (wallet.data) {
                    const tx = wallet.setOwners(wallet.data.owners.filter(o => o.toBase58().toLowerCase() !== ownerAddress.toLowerCase()))
                    const pending = await wallet.newTransactionFromEnvelope({ tx })
                    await pending.tx.confirm()
                    return true;
                }
                throw new Error("Wallet has no data")
            } else if (provider === "Celo Terminal") {
                if (!selectedAddress) throw new Error("Address is not selected")

                const web3 = new Web3(providerKit)

                const Multisig = await multisigContract

                const contract = new web3.eth.Contract(Multisig.abi.map(item => Object.assign({}, item, { selected: false })) as AbiItem[], account.address)

                await contract.methods.removeOwner(ownerAddress).send({
                    from: selectedAddress,
                    gas: 25000,
                    gasPrice: "5000000000",
                })
            } else if (provider === "GnosisSafe") {
                if (!txServiceUrl) throw new Error("Tx service is not selected")
                const web3Provider = providerKit
                const provider = new ethers.providers.Web3Provider(web3Provider);
                const safeOwner = provider.getSigner();
                const ethAdapter = new EthersAdapter({
                    ethers,
                    signer: safeOwner,
                });



                const safeSdk = await Safe.create({
                    ethAdapter,
                    safeAddress: account.address,
                    isL1SafeMasterCopy: false,
                });

                const threshold = await safeSdk.getThreshold();

                const params: RemoveOwnerTxParams = {
                    ownerAddress,
                    threshold: newInternalSign ? newInternalSign : threshold,
                };

                const safeService = new SafeServiceClient({
                    txServiceUrl,
                    ethAdapter,
                });

                const senderAddress = await safeOwner.getAddress();

                const safeTransaction = await safeSdk.getRemoveOwnerTx(params);

                const safeTxHash = await safeSdk.getTransactionHash(safeTransaction);

                const senderSignature = await safeSdk.signTransactionHash(safeTxHash);

                await safeService.proposeTransaction({
                    safeAddress: account.address,
                    safeTransactionData: safeTransaction.data,
                    safeTxHash,
                    senderAddress: senderAddress,
                    senderSignature: senderSignature.data,
                });

                dispatch(Add_Tx_To_TxList_Thunk({
                    account: account,
                    authId: selectedId,
                    blockchain: blockchain,
                    txHash: safeTxHash,
                    // tags: tags,
                }))
            }


            // dispatch(Add_Member_To_Removing_List_Thunk({
            //     accountId: account.id,
            //     memberAddress: ownerAddress,
            // }))

            return true
        } catch (error) {
            console.error(error)
            throw new Error("Error while removing owner")
        }
    }, [])


    const changeSigns = useCallback(async (account: IAccount, sign: number, internalSign: number, isSign = true, isInternal = true, provider: MultisigProviders) => {
        try {
            if (!blockchain) throw new Error("Blockchain is not selected")
            if (!selectedId) throw new Error("Account is not selected")
            if (provider === "Goki") {
                const { sdk } = await initGokiSolana();
                const wallet = await sdk.loadSmartWallet(new PublicKey(account.address));
                if (wallet.data) {
                    const tx = wallet.changeThreshold(sign)
                    const pending = await wallet.newTransactionFromEnvelope({ tx })
                    await pending.tx.confirm()
                    return true;
                }
                throw new Error("Wallet has no data")
            } else if (provider === "Celo Terminal") {
                if (!selectedAddress) throw new Error("Address is not selected")

                const web3 = new Web3(providerKit)

                const Multisig = await multisigContract

                const contract = new web3.eth.Contract(Multisig.abi.map(item => Object.assign({}, item, { selected: false })) as AbiItem[], account.address)


                const countOwners = (await contract.methods.getOwners().call()).length
                if (sign > countOwners) {
                    throw new Error("Requested Sign exceeds the number of owners");
                }
                if (internalSign > countOwners) {
                    throw new Error("Requested Internal Sign exceeds the number of owners");
                }

                if (isSign) {
                    await contract.methods.changeRequirement(sign).send({
                        from: selectedAddress,
                        gas: 25000,
                        gasPrice: "5000000000",
                    }).on('confirmation', function (num: number, receipt: any) {
                        if (num > 23) {
                            dispatch(Add_Tx_To_TxList_Thunk({
                                account: account,
                                authId: selectedId,
                                blockchain: blockchain,
                                txHash: receipt.transactionHash,
                            }))
                        }
                    });
                }

                if (isInternal) {
                    await contract.methods.changeInternalRequirement(internalSign).send({
                        from: selectedAddress,
                        gas: 25000,
                        gasPrice: "5000000000",
                    })
                }
                return true;
            } else if (provider === "GnosisSafe") {
                if (!txServiceUrl) throw new Error("Tx service is not selected")
                const web3Provider = providerKit
                const provider = new ethers.providers.Web3Provider(web3Provider);
                const safeOwner = provider.getSigner();
                const ethAdapter = new EthersAdapter({
                    ethers,
                    signer: safeOwner,
                });

                const safeSdk = await Safe.create({
                    ethAdapter,
                    safeAddress: account.address,
                    isL1SafeMasterCopy: false,
                });

                const safeService = new SafeServiceClient({
                    txServiceUrl,
                    ethAdapter,
                });

                const senderAddress = await safeOwner.getAddress();

                const safeTransaction = await safeSdk.getChangeThresholdTx(internalSign);
                const safeTxHash = await safeSdk.getTransactionHash(safeTransaction);

                const senderSignature = await safeSdk.signTransactionHash(safeTxHash);

                await safeService.proposeTransaction({
                    safeAddress: account.address,
                    safeTransactionData: safeTransaction.data,
                    safeTxHash,
                    senderAddress: senderAddress,
                    senderSignature: senderSignature.data,
                });

                dispatch(Add_Tx_To_TxList_Thunk({
                    account: account,
                    authId: selectedId,
                    blockchain: blockchain,
                    txHash: safeTxHash,
                    // tags: tags,
                }))

                return safeTxHash;
            }

        } catch (error) {
            console.error(error)
            throw new Error("Error changing signs")
        }
    }, [])


    const addOwner = useCallback(async (account: IAccount, newOwner: string, name = "", image: Image | null = null, mail: string | null = null, provider: MultisigProviders) => {
        if (remoxAccount) {
            try {
                if (!blockchain) throw new Error("Blockchain is not selected")
                if (!selectedId) throw new Error("Account is not selected")
                if (provider === "Goki") {
                    const { sdk } = await initGokiSolana();
                    const wallet = await sdk.loadSmartWallet(new PublicKey(account.address));
                    if (wallet.data) {
                        const newOwnerAddress = new PublicKey(newOwner)
                        const Allowners = [...wallet.data.owners, newOwnerAddress];
                        const owners = wallet.setOwners(Allowners)
                        const pending = await wallet.newTransactionFromEnvelope(
                            {
                                tx: owners
                            }
                        )
                        await pending.tx.confirm()
                        return true;
                    }
                    throw new Error("Wallet has no data")
                } else if (provider === "Celo Terminal") {

                    const web3 = new Web3(providerKit)

                    const Multisig = await multisigContract

                    const contract = new web3.eth.Contract(Multisig.abi.map(item => Object.assign({}, item, { selected: false })) as AbiItem[], account.address)

                    await contract.methods.addOwner(newOwner).send({
                        from: selectedAddress,
                        gas: 25000,
                        gasPrice: "5000000000",
                    }).on('confirmation', function (num: number, receipt: any) {
                        if (num > 23) {
                            dispatch(Add_Tx_To_TxList_Thunk({
                                account: account,
                                authId: selectedId,
                                blockchain: blockchain,
                                txHash: receipt.transactionHash,
                            }))
                        }
                    });
                } else if (provider === "GnosisSafe") {
                    if (!txServiceUrl) throw new Error("Tx service is not selected")
                    const web3Provider = providerKit
                    const provider = new ethers.providers.Web3Provider(web3Provider);
                    const safeOwner = provider.getSigner();
                    const ethAdapter = new EthersAdapter({
                        ethers,
                        signer: safeOwner,
                    });


                    const safeSdk = await Safe.create({
                        ethAdapter,
                        safeAddress: account.address,
                        isL1SafeMasterCopy: false,
                    });

                    const threshold = await safeSdk.getThreshold();

                    const params: AddOwnerTxParams = {
                        ownerAddress: newOwner,
                        threshold: threshold,
                    };

                    const safeService = new SafeServiceClient({
                        txServiceUrl,
                        ethAdapter,
                    });

                    const senderAddress = await safeOwner.getAddress();

                    const safeTransaction = await safeSdk.getAddOwnerTx(params);

                    const safeTxHash = await safeSdk.getTransactionHash(safeTransaction);

                    const senderSignature = await safeSdk.signTransactionHash(safeTxHash);

                    await safeService.proposeTransaction({
                        safeAddress: account.address,
                        safeTransactionData: safeTransaction.data,
                        safeTxHash,
                        senderAddress: senderAddress,
                        senderSignature: senderSignature.data,
                    });

                    dispatch(Add_Tx_To_TxList_Thunk({
                        account: account,
                        authId: selectedId,
                        blockchain: blockchain,
                        txHash: safeTxHash,
                        // tags: tags,
                    }))
                    return safeTxHash;
                }


                // await Add_Member(newOwner, name, image, mail)
                dispatch(Add_Member_To_Pending_List_Thunk({
                    accountId: account.id,
                    memberAddress: newOwner,
                    memberObject: {
                        id: nanoid(),
                        address: newOwner,
                        name,
                        image,
                        mail,
                    }
                }))

                return true
            } catch (error) {
                console.error(error)
                throw new Error("Error adding owner")
            }

        }
    }, [])


    const replaceOwner = useCallback(async (multisigAddress: string, oldOwner: string, newOwner: string, provider: MultisigProviders) => {
        try {
            if (!remoxAccount) throw new Error("Account is not selected")
            if (!blockchain) throw new Error("Blockchain is not selected")

            if (provider === "Goki") {
                const { sdk } = await initGokiSolana();
                const wallet = await sdk.loadSmartWallet(new PublicKey(multisigAddress));
                if (wallet.data) {
                    const owners = wallet.data.owners.map(s => s.toBase58())
                    if (!owners.includes(oldOwner)) throw new Error("Owner is not in the list of owners")
                    const newOwners = owners.map(s => s === oldOwner ? new PublicKey(newOwner) : s)
                    const ownersTx = wallet.setOwners(newOwners.map(s => new PublicKey(s)))
                    const pending = await wallet.newTransactionFromEnvelope(
                        {
                            tx: ownersTx
                        }
                    )
                    await pending.tx.confirm()
                    return true;
                }
                throw new Error("Wallet has no data")
            } else if (provider === "Celo Terminal") {
                const web3 = new Web3(providerKit)

                const Multisig = await multisigContract

                const contract = new web3.eth.Contract(Multisig.abi.map(item => Object.assign({}, item, { selected: false })) as AbiItem[], multisigAddress)

                await contract.methods.replaceOwner(oldOwner.toLowerCase(), newOwner.toLowerCase()).send({
                    from: selectedAddress,
                    gas: 25000,
                    gasPrice: "5000000000",
                })
            }

            // await Replace_Member(oldOwner, newOwner)
            dispatch(Replace_Member_In_Account_Thunk({
                accountAddress: multisigAddress,
                newMemberAdress: newOwner,
                oldMemberAddress: oldOwner,
                remoxAccount: remoxAccount
            }))

        } catch (error) {
            console.error(error)
            throw new Error("Error replacing owner")
        }
    }, [])

    const submitTransaction = async (account: IAccount, input: ISendTx | ISendTx[], provider: MultisigProviders, optionals?: SafeTransactionOptionalProps, tags?: ITag[]) => {
        try {
            if (!blockchain) throw new Error("Blockchain is not selected")
            if (!selectedId) throw new Error("Account is not selected")
            if (provider === "Goki") {
                const { sdk } = await initGokiSolana();
                const wallet = await sdk.loadSmartWallet(new PublicKey(account.address));
                if (wallet.data && !Array.isArray(input)) {
                    const txs = new Transaction()
                    txs.add(...(input.data as TransactionInstruction[]))
                    const pending = await wallet.newTransaction({ instructions: txs.instructions })
                    const reciept = await pending.tx.confirm()
                    return reciept.signature
                }
                throw new Error("Wallet has no data")
            } else if (provider === "Celo Terminal") {
                if (Array.isArray(input)) throw new Error("Celo Terminal just supports one transaction at a time")
                if (!input.destination) throw new Error("Destination is not selected")
                if (!selectedAddress) throw new Error("Address is not selected")
                const web3 = new Web3(providerKit)

                const Multisig = await multisigContract


                const contract = new web3.eth.Contract(Multisig.abi.map(item => Object.assign({}, item, { selected: false })) as AbiItem[], account.address)

                const txHash = await contract.methods.submitTransaction(input.destination, "0", stringToSolidityBytes(input.data as string)).encodeABI()
                // .send({
                //     from: address,
                //     gas: 250000,
                //     gasPrice: "5000000000",
                // }).on('confirmation', function (num: number, receipt: any) {
                //     dispatch(Add_Tx_To_TxList_Thunk({
                //         account: account,
                //         authId: selectedId,
                //         blockchain: blockchain,
                //         txHash: receipt.transactionHash,
                //     }))
                // })
                const tx = await web3.eth.sendTransaction({
                    from: selectedAddress,
                    to: account.address,
                    value: "0",
                    data: txHash,
                    gas: 250000,
                    gasPrice: "5000000000",
                }).on('confirmation', function (num: number, receipt: any) {
                    if (num > 23) {
                        dispatch(Add_Tx_To_TxList_Thunk({
                            account: account,
                            authId: selectedId,
                            blockchain: blockchain,
                            txHash: receipt.transactionHash,
                            tags: tags
                        }))
                    }
                })

                return hexToNumberString(tx.logs[0].topics[1]);
            } else if (provider === "GnosisSafe") {
                if (!txServiceUrl) throw new Error("Tx service is not selected")
                const web3Provider = providerKit
                const provider = new ethers.providers.Web3Provider(web3Provider);
                const safeOwner = provider.getSigner();
                const ethAdapter = new EthersAdapter({
                    ethers,
                    signer: safeOwner,
                });

                const multiSendDeployment =
                    getMultiSendCallOnlyDeployment({
                        network: "42220",
                    }) || getMultiSendCallOnlyDeployment()

                const contractAddress = multiSendDeployment?.networkAddresses["42220"] ?? multiSendDeployment?.defaultAddress
                const { data } = await axios.get(blockchain.multisigProviders.find(s => s.name === "GnosisSafe")?.txServiceUrl as string + `api/v1/safes/${account.address}/creation/`)
                const network = {
                    [4220]: {
                        multiSendAddress: contractAddress ?? "",
                        safeMasterCopyAddress: data.masterCopy,
                        safeProxyFactoryAddress: data.factoryAddress,
                    }
                }

                const safeSdk = await Safe.create({
                    ethAdapter,
                    safeAddress: account.address,
                    isL1SafeMasterCopy: false,
                    contractNetworks: blockchain.name === "celo" ? network : undefined,
                });

                const safeService = new SafeServiceClient({
                    txServiceUrl,
                    ethAdapter,
                });

                const senderAddress = await safeOwner.getAddress();
                let safeHash = "";
                const nonce = await safeService.getNextNonce(account.address)
                if (!Array.isArray(input)) {
                    const transaction: SafeTransactionDataPartial = {
                        to: toChecksumAddress(input.destination ?? ""),
                        data: input.data as string,
                        value: input.value?.toString() ?? "0",
                        safeTxGas: optionals?.safeTxGas,
                        baseGas: optionals?.baseGas, // Optional
                        gasPrice: optionals?.gasPrice, // Optional
                        gasToken: optionals?.gasToken, // Optional
                        refundReceiver: optionals?.refundReceiver, // Optional
                        nonce: nonce, // Optional
                    };

                    const safeTransaction = await safeSdk.createTransaction(transaction);

                    const safeTxHash = await safeSdk.getTransactionHash(safeTransaction);

                    const senderSignature = await safeSdk.signTransactionHash(safeTxHash);

                    await safeService.proposeTransaction({
                        safeAddress: account.address,
                        safeTransactionData: safeTransaction.data,
                        safeTxHash,
                        senderAddress,
                        senderSignature: senderSignature.data,
                    });
                    safeHash = safeTxHash;

                } else {
                    const transactions: MetaTransactionData[] = input.map((tx) => {
                        return {
                            to: toChecksumAddress(tx.destination ?? ""),
                            data: tx.data as string,
                            value: tx.value?.toString() ?? "0",
                        };
                    });
                    const options: SafeTransactionOptionalProps = {
                        safeTxGas: optionals?.safeTxGas, // Optional
                        baseGas: optionals?.baseGas, // Optional
                        gasPrice: optionals?.gasPrice, // Optional
                        gasToken: optionals?.gasToken, // Optional
                        refundReceiver: optionals?.refundReceiver, // Optional
                        nonce: nonce, // Optional
                    };

                    const safeTransaction = await safeSdk.createTransaction(
                        transactions,
                        options
                    );

                    const safeTxHash = await safeSdk.getTransactionHash(safeTransaction);

                    const senderSignature = await safeSdk.signTransactionHash(safeTxHash);

                    await safeService.proposeTransaction({
                        safeAddress: account.address,
                        safeTransactionData: safeTransaction.data,
                        safeTxHash,
                        senderAddress,
                        senderSignature: senderSignature.data,
                        origin,
                    });
                    safeHash = safeTxHash;

                }
                dispatch(Add_Tx_To_TxList_Thunk({
                    account: account,
                    authId: selectedId,
                    blockchain: blockchain,
                    txHash: safeHash,
                    tags: tags,
                }))

                return safeHash;
            }
            throw new Error("Blockchain is not selected")
        } catch (e: any) {
            throw new Error(e.message);
        }
    }

    const revokeTransaction = async (account: IAccount, transactionId: string, provider: MultisigProviders, safeTxHash?: string) => {
        try {
            if (!blockchain) throw new Error("Blockchain is not selected")
            if (!selectedAddress) throw new Error("Account is not selected")
            if (provider === "Goki") {
                const { sdk } = await initGokiSolana();
                const wallet = await sdk.loadSmartWallet(new PublicKey(account.address));
                if (wallet.data) {
                    const tx = wallet.program.instruction.unapprove({
                        accounts: {
                            smartWallet: wallet.key,
                            transaction: new PublicKey(transactionId),
                            owner: publicKey!,
                        },
                    })

                    const pending = await wallet.newTransaction({ instructions: [tx] })
                    const transaction = await pending.tx.confirm()
                    return transaction;
                }
                throw new Error("Wallet has no data")
            } else if (provider === "Celo Terminal") {
                const web3 = new Web3(providerKit)

                const Multisig = await multisigContract

                const contract = new web3.eth.Contract(Multisig.abi.map(item => Object.assign({}, item, { selected: false })) as AbiItem[], account.address)


                const data = contract.methods.revokeConfirmation(transactionId).encodeABI()

                const tx = await web3.eth.sendTransaction({
                    from: selectedAddress,
                    to: account.address,
                    value: "0",
                    data: data,
                    gas: 250000,
                    gasPrice: "5000000000",
                })


                return tx.transactionHash;
            }
            else if (provider === "GnosisSafe") {
                if (!txServiceUrl) throw new Error("Tx service is not selected")
                const web3Provider = providerKit
                const provider = new ethers.providers.Web3Provider(web3Provider);
                const safeOwner = provider.getSigner();
                const ethAdapter = new EthersAdapter({
                    ethers,
                    signer: safeOwner,
                });

                const safeService = new SafeServiceClient({ txServiceUrl, ethAdapter });

                const transaction = await safeService.getTransaction(safeTxHash!);

                const nonce = transaction.nonce;

                const safeSdk = await Safe.create({
                    ethAdapter,
                    safeAddress: account.address,
                    isL1SafeMasterCopy: false,
                });

                const rejectionTransaction = await safeSdk.createRejectionTransaction(
                    nonce
                );

                const transactionHash = await safeSdk.getTransactionHash(rejectionTransaction);
                const sign = await safeSdk.signTransactionHash(transactionHash);
                rejectionTransaction.addSignature(sign);
                const hash = await safeService.proposeTransaction({
                    safeAddress: account.address,
                    safeTransactionData: rejectionTransaction.data,
                    safeTxHash: transactionHash,
                    senderAddress: await safeOwner.getAddress(),
                    senderSignature: sign.data,
                })
                return transactionHash;
            }
        } catch (e: any) {
            throw new Error(e);
        }
    }

    const confirmTransaction = async (multisigAddress: string, transactionId: string, providerName: MultisigProviders, isExecutable?: boolean) => {
        try {
            if (!selectedAddress) throw new Error("No address selected")
            if (!blockchain) throw new Error("Blockchain is not selected")
            if (providerName === "Goki") {
                const { sdk } = await initGokiSolana();
                const wallet = await sdk.loadSmartWallet(new PublicKey(multisigAddress));
                if (wallet.data) {
                    const tx = wallet.approveTransaction(new PublicKey(transactionId), publicKey!)
                    const pending = await wallet.newTransactionFromEnvelope({ tx })
                    await pending.tx.confirm()
                    return { message: "sucess" }
                }
                throw new Error("Wallet has no data")
            } else if (providerName === "GnosisSafe") {
                if (!txServiceUrl) throw new Error("Tx service is not selected")
                const web3Provider = providerKit
                const provider = new ethers.providers.Web3Provider(web3Provider);
                const safeOwner = provider.getSigner();
                const ethAdapter = new EthersAdapter({
                    ethers,
                    signer: safeOwner,
                });

                const safeService = new SafeServiceClient({ txServiceUrl, ethAdapter });

                const transaction = await safeService.getTransaction(transactionId)

                const safeAddress = transaction.safe;

                const safeSdk = await Safe.create({
                    ethAdapter,
                    safeAddress,
                    isL1SafeMasterCopy: false,
                });

                const threshold = await safeSdk.getThreshold();

                let signature = await safeSdk.signTransactionHash(
                    transaction!.safeTxHash
                );

                await safeService.confirmTransaction(
                    transaction!.safeTxHash,
                    signature.data
                );

                const onwerAddress = await safeOwner.getAddress();

                const ethSignuture = new EthSignSignature(onwerAddress, signature.data);

                // if (transaction!.confirmations!.length + 1 >= threshold) {
                //     const receipt = await executeTransaction(multisigAddress, transactionId, providerName, ethSignuture)

                // }

            } else if (providerName === "Celo Terminal") {
                let web3 = new Web3(providerKit)

                let Multisig = await multisigContract

                let contract = new web3.eth.Contract(Multisig.abi.map(item => Object.assign({}, item, { selected: false })) as AbiItem[], multisigAddress)
                await contract.methods.confirmTransaction(+transactionId).send({
                    from: selectedAddress,
                    gas: 500000,
                    gasPrice: "500000000",
                })


                return { message: "success" }
            }
        } catch (e: any) {
            throw new Error(e);
        }
    }

    const executeTransaction = async (account: IAccount, transactionId: string, provider: MultisigProviders, ethSignuture?: EthSignSignature) => {
        try {
            if (!blockchain) throw new Error("Blockchain is not selected")
            if (provider === "Goki") {
                const { sdk } = await initGokiSolana();
                const wallet = await sdk.loadSmartWallet(new PublicKey(account.address));
                if (wallet.data) {
                    const tx = await wallet.executeTransaction({ transactionKey: new PublicKey(transactionId!), owner: publicKey! })
                    const pending = await wallet.newTransactionFromEnvelope({ tx })
                    await pending.tx.confirm()
                    return { message: "sucess" }
                }
                throw new Error("Wallet has no data")
            } else if (provider === "Celo Terminal") {
                let web3 = new Web3(providerKit)

                let Multisig = await multisigContract

                let contract = new web3.eth.Contract(Multisig.abi.map(item => Object.assign({}, item, { selected: false })) as AbiItem[], account.address)

                const tx = await contract.methods.executeTransaction(+transactionId).send({
                    from: selectedAddress,
                    gas: 500000,
                    gasPrice: "500000000",
                })
                return tx.transactionHash as string
            } else if (provider === "GnosisSafe") {
                if (!txServiceUrl) throw new Error("Tx service is not selected")
                const web3Provider = providerKit
                const provider = new ethers.providers.Web3Provider(web3Provider);
                const safeOwner = provider.getSigner();
                const ethAdapter = new EthersAdapter({
                    ethers,
                    signer: safeOwner,
                });

                const safeService = new SafeServiceClient({ txServiceUrl, ethAdapter });

                const transaction = await safeService.getTransaction(transactionId)

                const safeAddress = transaction.safe;

                const safeSdk = await Safe.create({
                    ethAdapter,
                    safeAddress,
                    isL1SafeMasterCopy: false,
                });


                const safeTransaction = await safeSdk.createTransaction(
                    {
                        to: transaction.to,
                        value: transaction.value,
                        data: transaction.data ?? "",
                        nonce: transaction.nonce,
                        safeTxGas: transaction.safeTxGas,
                    }
                );

                transaction.confirmations?.forEach((confirmation) => {
                    const signature = new EthSignSignature(
                        confirmation.owner,
                        confirmation.signature
                    );
                    safeTransaction.addSignature(signature);
                });

                // safeTransaction.addSignature(ethSignuture!);
                const executeTxResponse = await safeSdk.executeTransaction(
                    {
                        addSignature: safeTransaction.addSignature,
                        data: {
                            baseGas: safeTransaction.data.baseGas,
                            data: safeTransaction.data.data,
                            gasPrice: safeTransaction.data.gasPrice,
                            gasToken: safeTransaction.data.gasToken,
                            nonce: safeTransaction.data.nonce,
                            operation: safeTransaction.data.operation,
                            refundReceiver: safeTransaction.data.refundReceiver,
                            safeTxGas: transaction.safeTxGas,
                            to: safeTransaction.data.to,
                            value: safeTransaction.data.value,
                        },
                        encodedSignatures: safeTransaction.encodedSignatures,
                        signatures: safeTransaction.signatures,
                    },
                    {
                        gasPrice: "500000000",
                        gasLimit: 500000,
                        from: await safeOwner.getAddress(),
                    }
                );

                const receipt =
                    executeTxResponse.transactionResponse &&
                    (await executeTxResponse.transactionResponse.wait());

                return receipt;
            }
            dispatch(Refresh_Balance_Thunk({
                blockchain: blockchain,
            }))
            dispatch(Refresh_Accounts_Thunk({
                id: account.id,
            }))

            return { message: "success" }
        } catch (e: any) {
            throw new Error(e);
        }
    }


    return {
        createMultisigAccount, importMultisigAccount, removeOwner, changeSigns, addOwner, replaceOwner,
        submitTransaction, revokeTransaction, confirmTransaction, executeTransaction
    }
}


export interface TXAccountMetaFields {
    pubkey: PublicKey
    isSigner: boolean
    isWritable: boolean
}

export interface TXAccountMetaJSON {
    pubkey: string
    isSigner: boolean
    isWritable: boolean
}

export class TXAccountMeta {
    readonly pubkey: PublicKey
    readonly isSigner: boolean
    readonly isWritable: boolean

    constructor(fields: TXAccountMetaFields) {
        this.pubkey = fields.pubkey
        this.isSigner = fields.isSigner
        this.isWritable = fields.isWritable
    }

    static layout(property?: string) {
        return borsh.struct(
            [
                borsh.publicKey("pubkey"),
                borsh.bool("isSigner"),
                borsh.bool("isWritable"),
            ],
            property
        )
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    static fromDecoded(obj: any) {
        return new TXAccountMeta({
            pubkey: obj.pubkey,
            isSigner: obj.isSigner,
            isWritable: obj.isWritable,
        })
    }

    static toEncodable(fields: TXAccountMetaFields) {
        return {
            pubkey: fields.pubkey,
            isSigner: fields.isSigner,
            isWritable: fields.isWritable,
        }
    }

    toJSON(): TXAccountMetaJSON {
        return {
            pubkey: this.pubkey.toString(),
            isSigner: this.isSigner,
            isWritable: this.isWritable,
        }
    }

    static fromJSON(obj: TXAccountMetaJSON): TXAccountMeta {
        return new TXAccountMeta({
            pubkey: new PublicKey(obj.pubkey),
            isSigner: obj.isSigner,
            isWritable: obj.isWritable,
        })
    }

    toEncodable() {
        return TXAccountMeta.toEncodable(this)
    }
}


export interface TXInstructionFields {
    programId: PublicKey
    keys: Array<TXAccountMetaFields>
    data: Array<number>
}

export interface TXInstructionJSON {
    programId: string
    keys: Array<TXAccountMetaJSON>
    data: Array<number>
}

export class TXInstruction {
    readonly programId: PublicKey
    readonly keys: Array<TXAccountMeta>
    readonly data: Array<number>

    constructor(fields: TXInstructionFields) {
        this.programId = fields.programId
        this.keys = fields.keys.map((item) => new TXAccountMeta({ ...item }))
        this.data = fields.data
    }

    static layout(property?: string) {
        return borsh.struct(
            [
                borsh.publicKey("programId"),
                borsh.vec(TXAccountMeta.layout(), "keys"),
                borsh.vecU8("data"),
            ],
            property
        )
    }

    static fromDecoded(obj: any) {
        return new TXInstruction({
            programId: obj.programId,
            keys: obj.keys.map((item: any) => TXAccountMeta.fromDecoded(item)),
            data: Array.from(obj.data),
        })
    }

    static toEncodable(fields: TXInstructionFields) {
        return {
            programId: fields.programId,
            keys: fields.keys.map((item) => TXAccountMeta.toEncodable(item)),
            data: Buffer.from(fields.data),
        }
    }

    toJSON(): TXInstructionJSON {
        return {
            programId: this.programId.toString(),
            keys: this.keys.map((item) => item.toJSON()),
            data: this.data,
        }
    }

    static fromJSON(obj: TXInstructionJSON): TXInstruction {
        return new TXInstruction({
            programId: new PublicKey(obj.programId),
            keys: obj.keys.map((item) => TXAccountMeta.fromJSON(item)),
            data: obj.data,
        })
    }

    toEncodable() {
        return TXInstruction.toEncodable(this)
    }
}


