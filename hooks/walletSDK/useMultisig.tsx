import { useCallback } from "react";
import { Connection, Keypair, PublicKey, SystemProgram, Transaction, TransactionInstruction } from "@solana/web3.js";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { auth, IAccount, IBudget, Image, IMember } from 'firebaseConfig';
import { stringToSolidityBytes } from "@celo/contractkit/lib/wrappers/BaseWrapper";
import * as borsh from '@project-serum/borsh';
import BN from 'bn.js'
import { GokiSDK, GOKI_ADDRESSES, GOKI_IDLS, Programs } from '@gokiprotocol/client'
import useSolanaProvider from "./useSolanaProvider";
import { GetTime } from "utils";
import { process } from "uniqid"
import { Create_Account_For_Individual, Create_Account_For_Organization, Add_Member_To_Account_Thunk, Remove_Member_From_Account_Thunk, Replace_Member_In_Account_Thunk } from "redux/slices/account/thunks/account";
import { useAppDispatch, useAppSelector } from "redux/hooks";
import { SelectAccounts, SelectBlockchain, SelectOrganization, SelectProviderAddress, SelectRemoxAccount } from "redux/slices/account/remoxData";
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
import { AltCoins, GnosisConfirmation, GnosisDataDecoded } from "types";
import { ethers } from "ethers";
import EthersAdapter from "@gnosis.pm/safe-ethers-lib";
import Safe, {
    AddOwnerTxParams,
    RemoveOwnerTxParams,
    SafeFactory,
    SafeTransactionOptionalProps,
} from "@gnosis.pm/safe-core-sdk";
import { SafeAccountConfig } from "@gnosis.pm/safe-core-sdk";
import SafeServiceClient, {
    SafeMultisigTransactionResponse,
} from "@gnosis.pm/safe-service-client";
import {
    MetaTransactionData,
    SafeTransactionData,
    SafeTransactionDataPartial,
} from "@gnosis.pm/safe-core-sdk-types";
import { EthSignSignature } from "@gnosis.pm/safe-core-sdk";
import { IAutomationBatchRequest, IAutomationCancel, IAutomationTransfer, IBatchRequest, IFormattedTransaction, ISwap, ITransfer, ITransferComment, ITransferFrom } from "hooks/useTransactionProcess";
import { Optional } from "@metaplex/js";
import { IBudgetORM } from "pages/api/budget/index.api";


let multiProxy = import("rpcHooks/ABI/MultisigProxy.json");
let multisigContract = import("rpcHooks/ABI/CeloTerminal.json")

export interface ITransactionMultisig {
    provider?: string,
    name: string;
    destination: string,
    hashOrIndex: string,
    contractAddress: string,
    contractOwnerAmount: number,
    contractOwners: string[],
    contractThresholdAmount: number,
    contractInternalThresholdAmount: number,
    isExecuted: boolean,
    confirmations: string[],
    timestamp: number,
    tags: ITag[],
    budget: IBudgetORM | null


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
    const { address } = useCelo()

    //solana
    const { connection } = useConnection();
    const { publicKey, sendTransaction } = useWallet();
    const { Provider } = useSolanaProvider()


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

    const createMultisigAccount = useCallback(async (owners: string[], name: string, sign: number, internalSign: number, image: Image | null, type: "organization" | "individual") => {
        let proxyAddress: string, provider: IAccount["provider"];

        if (!blockchain) throw new Error("Blockchain is not selected")
        if (!auth.currentUser) throw new Error("User is not logged in")

        if (type === "organization") {
            if (!organization) throw new Error("Organization is not selected")
        } else {
            if (!individual) throw new Error("Individual is not selected")
        }

        if (blockchain.name === 'solana' && publicKey) {

            const programs = GokiProgram();

            const smartWalletBase = Keypair.generate();

            const [smartWallet, bump] = await PublicKey.findProgramAddress(
                [utils.bytes.utf8.encode("GokiSmartWallet"), smartWalletBase.publicKey.toBuffer()],
                GOKI_ADDRESSES.SmartWallet
            );

            const instruction = programs.SmartWallet.instruction.createSmartWallet(
                bump,
                owners.length,
                owners.map(o => new PublicKey(o)),
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

        } else if (blockchain.name.includes("evm")) {
            const web3Provider = (window as any).ethereum;
            const ethersProvider = new ethers.providers.Web3Provider(web3Provider);
            const safeOwner = ethersProvider.getSigner();
            const ethAdapter = new EthersAdapter({
                ethers,
                signer: safeOwner,
            });

            const safeFactory = await SafeFactory.create({
                ethAdapter,
                isL1SafeMasterCopy: false,
            });

            const safeAccountConfig: SafeAccountConfig = {
                owners: owners.map((owner) => owner),
                threshold: internalSign,
            };

            const safeSdk = await safeFactory.deploySafe({ safeAccountConfig });

            const safeAddress = safeSdk.getAddress();

            proxyAddress = safeAddress;

            provider = "GnosisSafe"

        } else {
            if (!address) throw new Error("Address is not selected")

            const { abi: proxyABI, bytecode: proxyBytecode } = await multiProxy
            const { abi: multiSigABI, bytecode: multiSigBytecode } = await multisigContract

            const web3 = new Web3((window as any).celo);

            const proxy = await new web3.eth.Contract(proxyABI as AbiItem[]).deploy({ data: proxyBytecode }).send({
                from: address,
                gas: 1000000,
                gasPrice: "5000000000",
            })

            const multisig = await new web3.eth.Contract(multiSigABI as AbiItem[]).deploy({ data: multiSigBytecode }).send({
                from: address,
                gas: 1000000,
                gasPrice: "5000000000",
            })

            proxyAddress = proxy.options.address;
            const multisigAddress = multisig.options.address;

            const initData = multisig.methods.initialize(owners, new BigNumber(sign), new BigNumber(internalSign)).encodeABI()

            await proxy.methods._setAndInitializeImplementation(multisigAddress, initData).send({
                from: address,
                gas: 250000,
                gasPrice: "5000000000",
            })

            await proxy.methods._transferOwnership(proxyAddress).send({
                from: address,
                gas: 25000,
                gasPrice: "5000000000",
            })

            provider = "CeloTerminal"
        }

        let myResponse: IAccount = {
            created_date: GetTime(),
            blockchain: blockchain.name,
            createdBy: auth.currentUser?.uid,
            mail: null,
            address: proxyAddress,
            id: process(name.split(" ").join("")),
            members: owners.map<IMember>(s => ({
                address: s,
                id: process(),
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

        return myResponse;
    }, [blockchain])

    const importMultisigAccount = async (contractAddress: string, name = "", image: Image | null, type: "organization" | "individual") => {
        try {
            if (!blockchain) throw new Error("Blockchain is not selected")
            if (accounts.some(s => s.address.toLowerCase() === contractAddress.toLowerCase())) throw new Error("This address already exist");
            if (!publicKey) throw new Error("Public key is not selected")
            if (!auth.currentUser) throw new Error("User is not logged in")

            let members: string[] = [], provider: IAccount["provider"] = null;

            if (blockchain.name === 'solana') {
                const programs = GokiProgram(contractAddress);

                const data = await programs.SmartWallet.account.smartWallet.fetch(new PublicKey(contractAddress));

                members = data.owners.map(o => o.toBase58())

                if (members.includes(publicKey.toBase58())) throw new Error("You are already a member of this account");

                provider = "Goki"

            } else if (blockchain.name === 'celo') {
                const web3 = new Web3((window as any).celo);

                const Multisig = await multisigContract

                const contract = new web3.eth.Contract(Multisig.abi.map(item => Object.assign({}, item, { selected: false })) as AbiItem[], contractAddress)

                const isOwner = await contract.methods.isOwner().call();
                const owners = await contract.methods.getOwners().call();

                members = [...owners];
                provider = "CeloTerminal"
                if (!isOwner) throw new Error("You are not an owner in this multisig address");
            } else if (blockchain.name.includes('evm')) {
                const web3Provider = (window as any).ethereum;
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

                provider = "GnosisSafe"
            }

            let myResponse: IAccount = {
                created_date: GetTime(),
                blockchain: blockchain.name,
                address: contractAddress,
                mail: null,
                createdBy: auth.currentUser.uid,
                id: process(name.split(" ").join("")),
                members: members.map<IMember>(s => ({
                    address: s,
                    id: process(),
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
            }))

            return myResponse
        } catch (e: any) {
            throw new Error(e);
        }
    }


    const removeOwner = useCallback(async (multisigAddress: string, ownerAddress: string, newInternalSign?: number) => {
        try {
            if (!remoxAccount) throw new Error("Account is not selected")
            if (!blockchain) throw new Error("Blockchain is not selected")

            if (blockchain.name === 'solana') {
                const { sdk } = await initGokiSolana();
                const wallet = await sdk.loadSmartWallet(new PublicKey(multisigAddress));
                if (wallet.data) {
                    const tx = wallet.setOwners(wallet.data.owners.filter(o => o.toBase58().toLowerCase() !== ownerAddress.toLowerCase()))
                    const pending = await wallet.newTransactionFromEnvelope({ tx })
                    await pending.tx.confirm()
                    return true;
                }
                throw new Error("Wallet has no data")
            } else if (blockchain.name === 'celo') {
                if (!address) throw new Error("Address is not selected")

                const web3 = new Web3((window as any).celo);

                const Multisig = await multisigContract

                const contract = new web3.eth.Contract(Multisig.abi.map(item => Object.assign({}, item, { selected: false })) as AbiItem[], multisigAddress)

                await contract.methods.removeOwner(ownerAddress).send({
                    from: address,
                    gas: 25000,
                    gasPrice: "5000000000",
                })
            } else if (blockchain.name.includes('evm')) {
                if (!txServiceUrl) throw new Error("Tx service is not selected")
                const web3Provider = (window as any).ethereum;
                const provider = new ethers.providers.Web3Provider(web3Provider);
                const safeOwner = provider.getSigner();
                const ethAdapter = new EthersAdapter({
                    ethers,
                    signer: safeOwner,
                });



                const safeSdk = await Safe.create({
                    ethAdapter,
                    safeAddress: multisigAddress,
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
                    safeAddress: multisigAddress,
                    safeTransactionData: safeTransaction.data,
                    safeTxHash,
                    senderAddress: senderAddress,
                    senderSignature: senderSignature.data,
                });
            }


            dispatch(Remove_Member_From_Account_Thunk({
                accountAddress: multisigAddress,
                memberAddress: ownerAddress,
                remoxAccount: remoxAccount
            }))

            return true
        } catch (error) {
            console.error(error)
            throw new Error("Error while removing owner")
        }
    }, [])


    const changeSigns = useCallback(async (multisigAddress: string, sign: number, internalSign: number, isSign = true, isInternal = true) => {
        try {
            if (!blockchain) throw new Error("Blockchain is not selected")
            if (blockchain.name === 'solana') {
                const { sdk } = await initGokiSolana();
                const wallet = await sdk.loadSmartWallet(new PublicKey(multisigAddress));
                if (wallet.data) {
                    const tx = await wallet.changeThreshold(sign)
                    const pending = await wallet.newTransactionFromEnvelope({ tx })
                    await pending.tx.confirm()
                    return true;
                }
                throw new Error("Wallet has no data")
            } else if (blockchain.name === 'celo') {
                if (!address) throw new Error("Address is not selected")

                const web3 = new Web3((window as any).celo);

                const Multisig = await multisigContract

                const contract = new web3.eth.Contract(Multisig.abi.map(item => Object.assign({}, item, { selected: false })) as AbiItem[], multisigAddress)


                const countOwners = (await contract.methods.getOwners().call()).length
                if (sign > countOwners) {
                    throw new Error("Requested Sign exceeds the number of owners");
                }
                if (internalSign > countOwners) {
                    throw new Error("Requested Internal Sign exceeds the number of owners");
                }

                if (isSign) {
                    await contract.methods.changeRequirement(sign).send({
                        from: address,
                        gas: 25000,
                        gasPrice: "5000000000",
                    })
                }

                if (isInternal) {
                    await contract.methods.changeInternalRequirement(internalSign).send({
                        from: address,
                        gas: 25000,
                        gasPrice: "5000000000",
                    })
                }
                return true;
            } else if (blockchain.name.includes("evm")) {
                if (!txServiceUrl) throw new Error("Tx service is not selected")
                const web3Provider = (window as any).ethereum;
                const provider = new ethers.providers.Web3Provider(web3Provider);
                const safeOwner = provider.getSigner();
                const ethAdapter = new EthersAdapter({
                    ethers,
                    signer: safeOwner,
                });

                const safeSdk = await Safe.create({
                    ethAdapter,
                    safeAddress: multisigAddress,
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
                    safeAddress: multisigAddress,
                    safeTransactionData: safeTransaction.data,
                    safeTxHash,
                    senderAddress: senderAddress,
                    senderSignature: senderSignature.data,
                });

                return safeTxHash;
            }

        } catch (error) {
            console.error(error)
            throw new Error("Error changing signs")
        }
    }, [])


    const addOwner = useCallback(async (multisigAddress: string, newOwner: string, name = "", image: Image | null = null, mail: string | null = null) => {
        if (remoxAccount) {
            try {
                if (!blockchain) throw new Error("Blockchain is not selected")
                if (blockchain.name === 'solana') {
                    const { sdk } = await initGokiSolana();
                    const wallet = await sdk.loadSmartWallet(new PublicKey(multisigAddress));
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
                } else if (blockchain.name === 'celo') {

                    const web3 = new Web3((window as any).celo);

                    const Multisig = await multisigContract

                    const contract = new web3.eth.Contract(Multisig.abi.map(item => Object.assign({}, item, { selected: false })) as AbiItem[], multisigAddress)

                    await contract.methods.addOwner(newOwner).send({
                        from: address,
                        gas: 25000,
                        gasPrice: "5000000000",
                    })
                } else if (blockchain.name.includes("evm")) {
                    if (!txServiceUrl) throw new Error("Tx service is not selected")
                    const web3Provider = (window as any).ethereum;
                    const provider = new ethers.providers.Web3Provider(web3Provider);
                    const safeOwner = provider.getSigner();
                    const ethAdapter = new EthersAdapter({
                        ethers,
                        signer: safeOwner,
                    });


                    const safeSdk = await Safe.create({
                        ethAdapter,
                        safeAddress: multisigAddress,
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
                        safeAddress: multisigAddress,
                        safeTransactionData: safeTransaction.data,
                        safeTxHash,
                        senderAddress: senderAddress,
                        senderSignature: senderSignature.data,
                    });

                    return safeTxHash;
                }

                // await Add_Member(newOwner, name, image, mail)
                dispatch(Add_Member_To_Account_Thunk(
                    {
                        accountAddress: multisigAddress,
                        memberAddress: newOwner,
                        name,
                        image,
                        mail,
                        remoxAccount: remoxAccount
                    }
                ))

                return true
            } catch (error) {
                console.error(error)
                throw new Error("Error adding owner")
            }

        }
    }, [])


    const replaceOwner = useCallback(async (multisigAddress: string, oldOwner: string, newOwner: string) => {
        try {
            if (!remoxAccount) throw new Error("Account is not selected")
            if (!blockchain) throw new Error("Blockchain is not selected")

            if (blockchain.name === 'solana') {
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
            } else if (blockchain.name === "celo") {
                const web3 = new Web3((window as any).celo);

                const Multisig = await multisigContract

                const contract = new web3.eth.Contract(Multisig.abi.map(item => Object.assign({}, item, { selected: false })) as AbiItem[], multisigAddress)

                await contract.methods.replaceOwner(oldOwner.toLowerCase(), newOwner.toLowerCase()).send({
                    from: address,
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

    const submitTransaction = async (multisigAddress: string, data: string | TransactionInstruction[] | MetaTransactionData[], destination: string | null, optionals?: SafeTransactionOptionalProps,) => {
        try {
            if (!blockchain) throw new Error("Blockchain is not selected")
            if (blockchain.name === 'solana') {
                const { sdk } = await initGokiSolana();
                const wallet = await sdk.loadSmartWallet(new PublicKey(multisigAddress));
                if (wallet.data) {
                    const txs = new Transaction()
                    txs.add(...(data as TransactionInstruction[]))
                    const pending = await wallet.newTransaction({ instructions: txs.instructions })
                    const reciept = await pending.tx.confirm()
                    return reciept.signature
                }
                throw new Error("Wallet has no data")
            } else if (blockchain.name === "celo") {
                if (!destination) throw new Error("Destination is not selected")
                if (!address) throw new Error("Address is not selected")
                const web3 = new Web3((window as any).celo);

                const Multisig = await multisigContract

                const contract = new web3.eth.Contract(Multisig.abi.map(item => Object.assign({}, item, { selected: false })) as AbiItem[], multisigAddress)

                const txHash = await contract.methods.submitTransaction(destination, "0", stringToSolidityBytes(data as string)).send({
                    from: address,
                    gas: 250000,
                    gasPrice: "5000000000",
                })

                return txHash as string
            } else if (blockchain.name.includes("evm")) {
                if (!txServiceUrl) throw new Error("Tx service is not selected")
                const web3Provider = (window as any).ethereum;
                const provider = new ethers.providers.Web3Provider(web3Provider);
                const safeOwner = provider.getSigner();
                const ethAdapter = new EthersAdapter({
                    ethers,
                    signer: safeOwner,
                });

                const safeSdk = await Safe.create({
                    ethAdapter,
                    safeAddress: multisigAddress,
                    isL1SafeMasterCopy: false,
                });

                const safeService = new SafeServiceClient({
                    txServiceUrl,
                    ethAdapter,
                });

                const senderAddress = await safeOwner.getAddress();

                if (data.length > 0) {
                    if (data.length === 1) {
                        const transaction: SafeTransactionDataPartial = {
                            to: (data[0] as MetaTransactionData).to,
                            data: (data[0] as MetaTransactionData).data,
                            value: (data[0] as MetaTransactionData).value,
                            operation: (data[0] as MetaTransactionData).operation,
                            safeTxGas: optionals?.safeTxGas,
                            baseGas: optionals?.baseGas, // Optional
                            gasPrice: optionals?.gasPrice, // Optional
                            gasToken: optionals?.gasToken, // Optional
                            refundReceiver: optionals?.refundReceiver, // Optional
                            nonce: optionals?.nonce, // Optional
                        };

                        const safeTransaction = await safeSdk.createTransaction(transaction);

                        const safeTxHash = await safeSdk.getTransactionHash(safeTransaction);

                        const senderSignature = await safeSdk.signTransactionHash(safeTxHash);

                        await safeService.proposeTransaction({
                            safeAddress: multisigAddress,
                            safeTransactionData: safeTransaction.data,
                            safeTxHash,
                            senderAddress,
                            senderSignature: senderSignature.data,
                        });

                        return safeTxHash;
                    } else {
                        const transactions: MetaTransactionData[] = (data as MetaTransactionData[]).map((tx) => {
                            return {
                                to: tx.to,
                                data: tx.data,
                                value: tx.value,
                                operation: tx.operation,
                            };
                        });

                        const options: SafeTransactionOptionalProps = {
                            safeTxGas: optionals?.safeTxGas, // Optional
                            baseGas: optionals?.baseGas, // Optional
                            gasPrice: optionals?.gasPrice, // Optional
                            gasToken: optionals?.gasToken, // Optional
                            refundReceiver: optionals?.refundReceiver, // Optional
                            nonce: optionals?.nonce, // Optional
                        };

                        const safeTransaction = await safeSdk.createTransaction(
                            transactions,
                            options
                        );

                        const safeTxHash = await safeSdk.getTransactionHash(safeTransaction);

                        const senderSignature = await safeSdk.signTransactionHash(safeTxHash);

                        await safeService.proposeTransaction({
                            safeAddress: multisigAddress,
                            safeTransactionData: safeTransaction.data,
                            safeTxHash,
                            senderAddress,
                            senderSignature: senderSignature.data,
                            origin,
                        });

                        return safeTxHash;
                    }
                }
            }
        } catch (e: any) {
            throw new Error(e);
        }
    }

    const revokeTransaction = async (multisigAddress: string, transactionId: string, safeTxHash?: string) => {
        try {
            if (!blockchain) throw new Error("Blockchain is not selected")
            if (blockchain.name === 'solana') {
                const { sdk } = await initGokiSolana();
                const wallet = await sdk.loadSmartWallet(new PublicKey(multisigAddress));
                if (wallet.data) {
                    const tx = wallet.program.instruction.unapprove({
                        accounts: {
                            smartWallet: wallet.key,
                            transaction: new PublicKey(transactionId),
                            owner: publicKey!,
                        },
                    })

                    const pending = await wallet.newTransaction({ instructions: [tx] })
                    await pending.tx.confirm()
                    return { message: "sucess" }
                }
                throw new Error("Wallet has no data")
            } else if (blockchain.name === "celo") {
                const web3 = new Web3((window as any).celo);

                const Multisig = await multisigContract

                const contract = new web3.eth.Contract(Multisig.abi.map(item => Object.assign({}, item, { selected: false })) as AbiItem[], multisigAddress)

                await contract.methods.revokeConfirmation(transactionId).send({
                    from: address,
                    gas: 25000,
                    gasPrice: "5000000000",
                })


                return { message: "success" }
            }
            else if (blockchain.name.includes("evm")) {
                if (!txServiceUrl) throw new Error("Tx service is not selected")
                const web3Provider = (window as any).ethereum;
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
                    safeAddress: multisigAddress,
                    isL1SafeMasterCopy: false,
                });

                const rejectionTransaction = await safeSdk.createRejectionTransaction(
                    nonce
                );

                const transactionHash = await safeSdk.getTransactionHash(rejectionTransaction);
                return transactionHash;
            }
        } catch (e: any) {
            throw new Error(e);
        }
    }

    const confirmTransaction = async (multisigAddress: string, transactionId: string) => {
        try {
            if (!selectedAddress) throw new Error("No address selected")
            if (!blockchain) throw new Error("Blockchain is not selected")
            if (blockchain.name === 'solana') {
                const { sdk } = await initGokiSolana();
                const wallet = await sdk.loadSmartWallet(new PublicKey(multisigAddress));
                if (wallet.data) {
                    const tx = wallet.approveTransaction(new PublicKey(transactionId), publicKey!)
                    const pending = await wallet.newTransactionFromEnvelope({ tx })
                    await pending.tx.confirm()
                    return { message: "sucess" }
                }
                throw new Error("Wallet has no data")
            } else if (blockchain.name.includes("evm")) {
                if (!txServiceUrl) throw new Error("Tx service is not selected")
                const web3Provider = (window as any).ethereum;
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

                if (transaction!.confirmations!.length + 1 >= threshold) {
                    const receipt = await executeTransaction(multisigAddress, transactionId, ethSignuture)

                }

            } else if (blockchain.name === "celo") {
                let web3 = new Web3((window as any).celo);

                let Multisig = await multisigContract

                let contract = new web3.eth.Contract(Multisig.abi.map(item => Object.assign({}, item, { selected: false })) as AbiItem[], multisigAddress)
                await contract.methods.confirmTransaction(+transactionId).send({
                    from: selectedAddress,
                    gas: 25000,
                    gasPrice: "5000000000",
                })

                return { message: "success" }
            }
        } catch (e: any) {
            throw new Error(e);
        }
    }

    const executeTransaction = async (multisigAddress: string, transactionId: string, ethSignuture?: EthSignSignature) => {
        try {
            if (!blockchain) throw new Error("Blockchain is not selected")
            if (blockchain.name === 'solana') {
                const { sdk } = await initGokiSolana();
                const wallet = await sdk.loadSmartWallet(new PublicKey(multisigAddress));
                if (wallet.data) {
                    const tx = await wallet.executeTransaction({ transactionKey: new PublicKey(transactionId!), owner: publicKey! })
                    const pending = await wallet.newTransactionFromEnvelope({ tx })
                    await pending.tx.confirm()
                    return { message: "sucess" }
                }
                throw new Error("Wallet has no data")
            } else if (blockchain.name === "celo") {
                let web3 = new Web3((window as any).celo);

                let Multisig = await multisigContract

                let contract = new web3.eth.Contract(Multisig.abi.map(item => Object.assign({}, item, { selected: false })) as AbiItem[], multisigAddress)

                await contract.methods.executeTransaction(+transactionId).send({
                    from: address,
                    gas: 25000,
                    gasPrice: "5000000000",
                })

            } else if (blockchain.name.includes("evm")) {
                if (!txServiceUrl) throw new Error("Tx service is not selected")
                const web3Provider = (window as any).ethereum;
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


                const safeTransactionData: SafeTransactionData = {
                    to: transaction!.to,
                    value: transaction!.value,
                    data: transaction!.data!,
                    operation: transaction!.operation,
                    safeTxGas: transaction!.safeTxGas,
                    baseGas: transaction!.baseGas,
                    gasPrice: Number(transaction!.gasPrice),
                    gasToken: transaction!.gasToken,
                    refundReceiver: transaction!.refundReceiver!,
                    nonce: transaction!.nonce,
                };

                const safeTransaction = await safeSdk.createTransaction(
                    safeTransactionData
                );


                transaction.confirmations?.forEach((confirmation) => {
                    const signature = new EthSignSignature(
                        confirmation.owner,
                        confirmation.signature
                    );
                    safeTransaction.addSignature(signature);
                });
                safeTransaction.addSignature(ethSignuture!);

                const executeTxResponse = await safeSdk.executeTransaction(
                    safeTransaction
                );
                const receipt =
                    executeTxResponse.transactionResponse &&
                    (await executeTxResponse.transactionResponse.wait());

                return receipt;
            }


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


