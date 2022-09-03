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

const multiProxy = import("rpcHooks/ABI/MultisigProxy.json");
const multisigContract = import("rpcHooks/ABI/CeloTerminal.json")

export interface ITransactionMultisig {
    name: string;
    destination: string,
    hashOrIndex: string,
    contractAddress: string,
    contractOwnerAmount: number,
    contractThresholdAmount: number,
    contractInternalThresholdAmount: number,
    data?: string,
    isExecuted: boolean,
    confirmations: string[],
    value: string,
    id?: number | string,
    requiredCount?: string,
    owner?: string,
    newOwner?: string,
    valueOfTransfer?: string,
    method: string,
    timestamp: number,
    created_at: number,
    tags: ITag[],
    budget: IBudget | null
}

export interface IMultisigSafeTransaction {
    type: "transfer" | "changeThreshold" | "addOwnerWithThreshold" | "removeOwner" | "rejectionTransaction",
    data: string | null,
    nonce: number,
    executionDate: string | null,
    submissionDate: string,
    modified: string | null,
    blockNumber: number | null,
    transactionHash: string | null,
    safeTxHash: string,
    executor: string | null,
    isExecuted: boolean ,
    isSuccessful: boolean | null,
    signatures: string,
    txType: string
    confirmations: GnosisConfirmation[],
    settings: GnosisSettingsTx | null,
    transfer: GnosisTransferTx | null,
} 

export interface GnosisSettingsTx  {
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


    const initGokiSolana = async () => {
        const provider = Provider;
        if (!provider) throw new Error("Provider not initialized")

        const sdk = GokiSDK.load({ provider })

        return { sdk, provider };
    }

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
        let proxyAddress, provider: IAccount["provider"];

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

                const contract = new web3.eth.Contract(Multisig.abi as AbiItem[], contractAddress)

                const isOwner = await contract.methods.isOwner().call();
                const owners = await contract.methods.getOwners().call();

                members = [...owners];
                provider = "CeloTerminal"
                if (!isOwner) throw new Error("You are not an owner in this multisig address");
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
            }))

            return myResponse
        } catch (e: any) {
            throw new Error(e);
        }
    }


    const removeOwner = useCallback(async (multisigAddress: string, ownerAddress: string) => {
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

                const contract = new web3.eth.Contract(Multisig.abi as AbiItem[], multisigAddress)

                await contract.methods.removeOwner(ownerAddress).send({
                    from: address,
                    gas: 25000,
                    gasPrice: "5000000000",
                })
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
            }

            if (!address) throw new Error("Address is not selected")

            const web3 = new Web3((window as any).celo);

            const Multisig = await multisigContract

            const contract = new web3.eth.Contract(Multisig.abi as AbiItem[], multisigAddress)


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

                    const contract = new web3.eth.Contract(Multisig.abi as AbiItem[], multisigAddress)

                    await contract.methods.addOwner(newOwner).send({
                        from: address,
                        gas: 25000,
                        gasPrice: "5000000000",
                    })
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

                const contract = new web3.eth.Contract(Multisig.abi as AbiItem[], multisigAddress)

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

    const submitTransaction = async (multisigAddress: string, data: string | TransactionInstruction[], destination: string | null) => {
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
            }

            if (!destination) throw new Error("Destination is not selected")
            if (!address) throw new Error("Address is not selected")
            const web3 = new Web3((window as any).celo);

            const Multisig = await multisigContract

            const contract = new web3.eth.Contract(Multisig.abi as AbiItem[], multisigAddress)

            const txHash = await contract.methods.submitTransaction(destination, "0", stringToSolidityBytes(data as string)).send({
                from: address,
                gas: 250000,
                gasPrice: "5000000000",
            })

            return txHash as string
        } catch (e: any) {
            throw new Error(e);
        }
    }

    const revokeTransaction = async (multisigAddress: string, transactionId: string) => {
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
            }

            const web3 = new Web3((window as any).celo);

            const Multisig = await multisigContract

            const contract = new web3.eth.Contract(Multisig.abi as AbiItem[], multisigAddress)

            await contract.methods.revokeConfirmation(transactionId).send({
                from: address,
                gas: 25000,
                gasPrice: "5000000000",
            })


            return { message: "success" }
        } catch (e: any) {
            throw new Error(e);
        }
    }

    const confirmTransaction = async (multisigAddress: string, transactionId: string | number) => {
        try {
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
            }


            const web3 = new Web3((window as any).celo);

            const Multisig = await multisigContract

            const contract = new web3.eth.Contract(Multisig.abi as AbiItem[], multisigAddress)

            await contract.methods.confirmTransaction(transactionId).send({
                from: address,
                gas: 25000,
                gasPrice: "5000000000",
            })

            return { message: "success" }
        } catch (e: any) {
            throw new Error(e);
        }
    }

    const executeTransaction = async (multisigAddress: string, transactionId: string | number) => {
        try {
            if (!blockchain) throw new Error("Blockchain is not selected")
            if (blockchain.name === 'solana') {
                const { sdk } = await initGokiSolana();
                const wallet = await sdk.loadSmartWallet(new PublicKey(multisigAddress));
                if (wallet.data) {
                    const tx = await wallet.executeTransaction({ transactionKey: new PublicKey(transactionId), owner: publicKey! })
                    const pending = await wallet.newTransactionFromEnvelope({ tx })
                    await pending.tx.confirm()
                    return { message: "sucess" }
                }
                throw new Error("Wallet has no data")
            }

            const web3 = new Web3((window as any).celo);

            const Multisig = await multisigContract

            const contract = new web3.eth.Contract(Multisig.abi as AbiItem[], multisigAddress)

            await contract.methods.executeTransaction(transactionId).send({
                from: address,
                gas: 25000,
                gasPrice: "5000000000",
            })

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


