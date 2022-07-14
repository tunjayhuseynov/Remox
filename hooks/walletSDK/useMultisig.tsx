import { useCallback, useMemo, useState } from "react";
import { toTransactionObject } from '@celo/connect';
import { Keypair, PACKET_DATA_SIZE, PublicKey, SystemInstruction, SystemProgram, Transaction } from "@solana/web3.js";
import { useContractKit } from "@celo-tools/use-contractkit";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { auth, IAccount, IIndividual, Image, IMember, IOrganization } from 'firebaseConfig';
import { SelectSelectedAccount } from "redux/slices/account/selectedAccount";
import { addAccount, selectStorage } from "redux/slices/account/storage";
import { setInternalSign, setSign } from "redux/slices/account/multisig";
import { stringToSolidityBytes } from "@celo/contractkit/lib/wrappers/BaseWrapper";
import { fromWei, lamport, toLamport } from "utils/ray";
import * as borsh from '@project-serum/borsh';
import *  as spl from 'easy-spl'
import BN from 'bn.js'
import { GokiSDK } from '@gokiprotocol/client'
import { SolanaCoins } from "types";
import useSolanaProvider from "./useSolanaProvider";
import useNextSelector from "hooks/useNextSelector";
import { GetTime } from "utils";
import { process } from "uniqid"
import { Create_Account } from "crud/account";
import useRemoxAccount from "hooks/accounts/useRemoxAccount";
import { Add_Member_To_Account_Thunk, Remove_Member_From_Account_Thunk, Replace_Member_In_Account_Thunk } from "redux/slices/account/thunks/account";
import { useAppDispatch, useAppSelector } from "redux/hooks";
import { IPaymentInput } from "pages/api/payments/send";
import { SelectBlockchain } from "redux/slices/account/remoxData";

// import {
//     Payment
// } from 'batch-payment/src'

const multiProxy = import("rpcHooks/ABI/MultisigProxy.json");
const multisigContract = import("rpcHooks/ABI/Multisig.json")

export interface ITransactionMultisig {
    name: string;
    destination: string,
    contractAddress: string,
    contractOwnerAmount: number,
    contractThresholdAmount: number,
    contractInternalThresholdAmount: number,
    data?: string,
    executed: boolean,
    confirmations: string[],
    value: string,
    id?: number | string,
    requiredCount?: string,
    owner?: string,
    newOwner?: string,
    valueOfTransfer?: string,
    method?: string,
    timestamp: number,
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


    let selectedAccount = useNextSelector(SelectSelectedAccount, "")
    const blockchain = useAppSelector(SelectBlockchain)
    const storage = useNextSelector(selectStorage, null)

    const dispatch = useAppDispatch()
    const [transactions, setTransactions] = useState<ITransactionMultisig[]>()

    const { Add_Account_2_Organization, Add_Account_2_Individual, remoxAccount } = useRemoxAccount(selectedAccount, blockchain ?? "celo")

    // const { data } = useFirestoreRead<MultisigType>("multisigs", auth.currentUser?.uid ?? "")

    const isMultisig = selectedAccount?.toLowerCase() !== storage?.lastSignedProviderAddress.toLowerCase()

    //Celo
    const { address, kit } = useContractKit()


    //solana
    const { connection } = useConnection();
    const { publicKey, signTransaction, signAllTransactions, sendTransaction } = useWallet();
    const { Provider } = useSolanaProvider()


    const initGokiSolana = async () => {
        const provider = Provider;
        if (!provider) throw new Error("Provider not initialized")

        const sdk = GokiSDK.load({ provider })

        return { sdk, provider };
    }


    const FetchTransactions = async (multisigAddress: string, skip: number, take: number) => {
        // let transactionArray: ITransactionMultisig[] = []
        // try {
        //     if (blockchain === 'solana') {
        //         const { sdk } = await initGokiSolana();
        //         const wallet = await sdk.loadSmartWallet(new PublicKey(multisigAddress));
        //         if (wallet.data) {
        //             const owners = wallet.data.owners.map(s => s.toBase58()) as string[];
        //             const program = new BorshInstructionCoder(sdk.programs.SmartWallet.idl)
        //             for (let index = 0; index < wallet.data.numTransactions.toNumber(); index++) {
        //                 const tx = await wallet.fetchTransactionByIndex(index);
        //                 if (tx) {
        //                     for (let index = 0; index < tx.instructions.length; index++) {
        //                         let method = MethodIds[MethodNames.transfer], confirmations: string[] = [], destination = "", executed = false, value = new BigNumber(0), newOwner, owner, requiredCount;
        //                         const buffer = Buffer.from(tx.instructions[index].data);
        //                         const idlData = program.decode(buffer);
        //                         executed = tx.executedAt.toNumber() != -1;
        //                         confirmations = wallet.data.owners.filter((s, i) => tx.signers[i]).map(s => s.toBase58())
        //                         if (idlData) {
        //                             const { data, name } = idlData;
        //                             switch (name) {
        //                                 case "setOwners":
        //                                     let updatedOwners = (data as any).owners.map((s: any) => s.toBase58()) as string[]
        //                                     if (updatedOwners.length > owners.length) {
        //                                         method = MethodIds[MethodNames.addOwner]
        //                                         owner = updatedOwners.find(s => !owners.includes(s))
        //                                     }
        //                                     else if (updatedOwners.length == owners.length) {
        //                                         method = MethodIds[MethodNames.replaceOwner]
        //                                         newOwner = updatedOwners.find(s => !owners.includes(s))
        //                                     } else {
        //                                         method = MethodIds[MethodNames.removeOwner]
        //                                         owner = owners.find(s => !updatedOwners.includes(s))
        //                                     }
        //                                     break;
        //                                 case "changeThreshold":
        //                                     method = MethodIds[MethodNames.changeRequirement]
        //                                     const threshold = (data as any).threshold.toNumber();
        //                                     requiredCount = threshold;
        //                                 default:
        //                                     break;
        //                             }
        //                         } else {
        //                             try {
        //                                 const data = SystemInstruction.decodeTransfer({
        //                                     data: buffer,
        //                                     programId: tx.instructions[0].programId,
        //                                     keys: tx.instructions[0].keys,
        //                                 })
        //                                 method = MethodIds[MethodNames.transfer]
        //                                 destination = SolanaCoins.SOL.contractAddress;
        //                                 owner = data.toPubkey.toBase58()
        //                                 value = new BigNumber(data.lamports.toString())
        //                             } catch (error) {
        //                                 try {
        //                                     const data = decodeTransferCheckedInstructionUnchecked({
        //                                         data: buffer,
        //                                         programId: tx.instructions[0].programId,
        //                                         keys: tx.instructions[0].keys,
        //                                     })
        //                                     method = MethodIds[MethodNames.transfer]
        //                                     owner = data.keys.destination?.pubkey.toBase58() ?? ""
        //                                     destination = data.keys.mint?.pubkey.toBase58() ?? ""
        //                                     value = new BigNumber(data.data.amount.toString()).dividedBy(10 ** data.data.decimals).multipliedBy(lamport)
        //                                 } catch (error) {
        //                                     console.error("There is no option for this tx: ", tx)
        //                                     continue;
        //                                 }
        //                             }
        //                         }

        //                         const parsedTx = MultisigTxParser({
        //                             data: "",
        //                             blockchain,
        //                             confirmations,
        //                             destination,
        //                             executed,
        //                             index,
        //                             Value: value,
        //                             parsedData: {
        //                                 method,
        //                                 newOwner,
        //                                 owner,
        //                                 requiredCount
        //                             }
        //                         })
        //                         transactionArray.push(parsedTx)

        //                     }
        //                 }
        //             }
        //         }
        //     } else if (blockchain === 'celo') {
        //         const kitMultiSig = await kit.contracts.getMultiSig(multisigAddress);
        //         let total = await kitMultiSig.getTransactionCount(true, true)
        //         if (total > skip) {
        //             total -= skip;
        //         }
        //         let limit = total - take - 1 > 0 ? total - take - 1 : 0;
        //         for (let index = total - 1; index > limit; index--) {
        //             let tx = await kitMultiSig.getTransaction(index)

        //             if (!tx || (tx && !tx['data'])) continue;

        //             const obj = MultisigTxParser({
        //                 index, destination: tx.destination,
        //                 data: tx.data, executed: tx.executed,
        //                 confirmations: tx.confirmations, Value: tx.value, blockchain
        //             })

        //             transactionArray.push(obj)
        //         }
        //     }

        //     setTransactions(transactionArray)
        //     return transactionArray
        // } catch (e: any) {
        //     console.error(e)
        //     throw new Error(e);
        // }
    }



    const createMultisigAccount = useCallback(async (owners: string[], name: string, sign: string, internalSign: string, image: Image | null, type: "organization" | "individual") => {
        const { sdk } = await initGokiSolana();
        let proxyAddress, provider: IAccount["provider"];
        if(!blockchain) throw new Error("Blockchain is not selected")
        if (blockchain === 'solana' && publicKey) {
            const smartWalletBase = Keypair.generate();
            const wlt = await sdk.newSmartWallet({
                owners: [publicKey.toBase58(), ...owners].map(o => new PublicKey(o)),
                numOwners: owners.length + 1,
                threshold: new BN(sign),
                base: smartWalletBase
            })

            const tx = wlt.tx;

            await tx.confirm()

            // proxyAddress = {
            //     pda: "",
            //     multisig: wlt.smartWalletWrapper.key.toBase58(),
            //     signature: "",
            //     type: SolanaMultisig.GOKI
            // } as SolanaMultisigData
            proxyAddress = wlt.smartWalletWrapper.key.toBase58()
            provider = "Goki"
            wlt.smartWalletWrapper.reloadData()

        } else {
            const { abi: proxyABI, bytecode: proxyBytecode } = await multiProxy
            const { abi: multiSigABI, bytecode: multiSigBytecode } = await multisigContract
            const tx0 = toTransactionObject(
                kit.connection,
                (new kit.web3.eth.Contract(proxyABI as any)).deploy({ data: proxyBytecode }) as any)

            const tx1 = toTransactionObject(
                kit.connection,
                (new kit.web3.eth.Contract(multiSigABI as any)).deploy({ data: multiSigBytecode }) as any)

            const res0 = await tx0.sendAndWaitForReceipt({ from: address!, gasPrice: kit.web3.utils.toWei("0.5", 'Gwei') })
            const res1 = await tx1.sendAndWaitForReceipt({ from: address!, gasPrice: kit.web3.utils.toWei("0.5", 'Gwei') })
            if (!res0.contractAddress || !res1.contractAddress) {
                throw new Error("MultiSig deploy failure");
            }
            proxyAddress = res0.contractAddress
            const multiSigAddress = res1.contractAddress

            new Promise(resolve => setTimeout(resolve, 500))
            const initializerAbi = multiSigABI.find((abi) => abi.type === 'function' && abi.name === 'initialize')
            const callData = kit.web3.eth.abi.encodeFunctionCall(
                initializerAbi as any,
                [[address, ...owners] as any, sign as any, internalSign as any]
            )

            const proxy = new kit.web3.eth.Contract(proxyABI as any, proxyAddress)
            const txInit = toTransactionObject(
                kit.connection,
                proxy.methods._setAndInitializeImplementation(multiSigAddress, callData)
            )
            const txChangeOwner = toTransactionObject(
                kit.connection,
                proxy.methods._transferOwnership(proxyAddress)
            )
            await txInit.sendAndWaitForReceipt({ from: address!, gasPrice: kit.web3.utils.toWei("0.5", 'Gwei') })
            await txChangeOwner.sendAndWaitForReceipt({ from: address!, gasPrice: kit.web3.utils.toWei("0.5", 'Gwei') })
            provider = "CeloTerminal"
        }

        let myResponse: IAccount = {
            created_date: GetTime(),
            blockchain: blockchain,
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

        await Create_Account(myResponse)

        if (type === "organization") {
            await Add_Account_2_Organization(myResponse)
        } else if (type === "individual") {
            await Add_Account_2_Individual(myResponse)
        }

        dispatch(addAccount(myResponse))

        return myResponse;
    }, [blockchain])

    const importMultisigAccount = async (contractAddress: string, name = "", image: Image | null, type: "organization" | "individual") => {
        try {
            if(!blockchain) throw new Error("Blockchain is not selected")
            if ((remoxAccount?.accounts as IAccount[]).some(s => s.address.toLowerCase() === contractAddress.toLowerCase())) throw new Error("This address already exist");
            let members: string[] = [], provider: IAccount["provider"] = null;
            if (blockchain === 'solana') {
                const { sdk } = await initGokiSolana();
                const wallet = await sdk.loadSmartWallet(new PublicKey(contractAddress));

                if (wallet.data) {
                    members = wallet.data.owners.map(o => o.toBase58())
                    for (let index = 0; index < wallet.data.owners.length; index++) {
                        const w = wallet.data.owners[index];
                        if (w.toBase58().toLowerCase() === publicKey?.toBase58().toLowerCase()) break;
                        if (index === wallet.data.owners.length - 1) {
                            throw new Error("You are not an owner in this multisig address")
                        }
                    }
                }
                provider = "Goki"
            } else if (blockchain === 'celo') {
                const multiSig = await kit.contracts.getMultiSig(contractAddress);

                const isOwner = await multiSig.isowner(kit.defaultAccount!)
                const owners = await multiSig.getOwners()
                members = [...owners];
                provider = "CeloTerminal"
                if (!isOwner) throw new Error("You are not an owner in this multisig address");
            }

            let myResponse: IAccount = {
                created_date: GetTime(),
                blockchain: blockchain,
                address: contractAddress,
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

            await Create_Account(myResponse)

            if (type === "organization") {
                await Add_Account_2_Organization(myResponse)
            } else if (type === "individual") {
                await Add_Account_2_Individual(myResponse)
            }

            return myResponse
        } catch (e: any) {
            throw new Error(e);
        }
    }

    const getSignAndInternal = async () => {
        if (isMultisig) {
            try {
                if (blockchain === 'solana') {
                    const { sdk } = await initGokiSolana();
                    const wallet = await sdk.loadSmartWallet(new PublicKey(selectedAccount));
                    if (wallet.data) {
                        dispatch(setSign(wallet.data.threshold.toNumber()))
                        dispatch(setInternalSign(wallet.data.threshold.toNumber()))
                        return { sign: wallet.data.threshold.toNumber(), internalSigns: wallet.data.threshold.toNumber() }
                    }
                    throw new Error("Wallet has no data")
                }
                else if (blockchain === "celo") {
                    const multiSig = await kit.contracts.getMultiSig(selectedAccount);
                    const executinTransactions = await multiSig.getRequired()
                    const changingMultiSigProperties = await multiSig.getInternalRequired()
                    if (executinTransactions.c && changingMultiSigProperties.c) {
                        dispatch(setSign(executinTransactions.c[0]))
                        dispatch(setInternalSign(changingMultiSigProperties.c[0]))
                        return { sign: executinTransactions.c[0], internalSigns: changingMultiSigProperties.c[0] }
                    }
                }
                throw new Error(`Invalid multiSignature`)
            } catch (e: any) {
                throw new Error(e);
            }
        }
    }

    const removeOwner = useCallback(async (ownerAddress: string) => {
        if (isMultisig && remoxAccount) {
            try {
                if (blockchain === 'solana') {
                    const { sdk } = await initGokiSolana();
                    const wallet = await sdk.loadSmartWallet(new PublicKey(selectedAccount));
                    if (wallet.data) {
                        const tx = wallet.setOwners(wallet.data.owners.filter(o => o.toBase58().toLowerCase() !== ownerAddress.toLowerCase()))
                        const pending = await wallet.newTransactionFromEnvelope({ tx })
                        await pending.tx.confirm()
                        return true;
                    }
                    throw new Error("Wallet has no data")
                } else if (blockchain === 'celo') {
                    selectedAccount = selectedAccount.toLowerCase()
                    const kitMultiSig = await kit.contracts.getMultiSig(selectedAccount); // MultiSig Address with Celo Kit
                    const web3MultiSig = await kit._web3Contracts.getMultiSig(selectedAccount); // MultiSig Address with Web3

                    const isAddressExist = kit.web3.utils.isAddress(ownerAddress);
                    if (!isAddressExist) throw new Error("There is not any wallet belong this address");

                    const tx = toTransactionObject(
                        kit.connection,
                        web3MultiSig.methods.removeOwner(ownerAddress)
                    );

                    const ss = await kitMultiSig.submitOrConfirmTransaction(selectedAccount, tx.txo);
                    await ss.sendAndWaitForReceipt({ gasPrice: kit.web3.utils.toWei("0.5", 'Gwei') });
                }


                // await Remove_Member(ownerAddress)
                dispatch(Remove_Member_From_Account_Thunk({
                    accountAddress: selectedAccount,
                    memberAddress: ownerAddress,
                    remoxAccount: remoxAccount
                }))

                return true
            } catch (error) {
                console.error(error)
                throw new Error("Error removing owner")
            }

        }
    }, [isMultisig])


    const changeSigns = useCallback(async (sign: number, internalSign: number, isSign = true, isInternal = true) => {
        if (isMultisig) {
            try {
                if (blockchain === 'solana') {
                    const { sdk } = await initGokiSolana();
                    const wallet = await sdk.loadSmartWallet(new PublicKey(selectedAccount));
                    if (wallet.data) {
                        const tx = await wallet.changeThreshold(sign)
                        const pending = await wallet.newTransactionFromEnvelope({ tx })
                        await pending.tx.confirm()
                        return true;
                    }
                    throw new Error("Wallet has no data")
                }

                selectedAccount = selectedAccount.toLowerCase()
                const kitMultiSig = await kit.contracts.getMultiSig(selectedAccount);
                const web3MultiSig = await kit._web3Contracts.getMultiSig(selectedAccount);

                const countOwners = (await kitMultiSig.getOwners()).length
                if (sign > countOwners) {
                    throw new Error("Requested Sign exceeds the number of owners");
                }
                if (internalSign > countOwners) {
                    throw new Error("Requested Internal Sign exceeds the number of owners");
                }

                if (isSign) {
                    const tx = toTransactionObject(
                        kit.connection,
                        web3MultiSig.methods.changeRequirement(sign)
                    );

                    const ss = await kitMultiSig.submitOrConfirmTransaction(selectedAccount, tx.txo);
                    await ss.sendAndWaitForReceipt({ gasPrice: kit.web3.utils.toWei("0.5", 'Gwei') });
                }

                if (isInternal) {
                    const txInteral = toTransactionObject(
                        kit.connection,
                        web3MultiSig.methods.changeInternalRequirement(internalSign)
                    );

                    const ssInternal = await kitMultiSig.submitOrConfirmTransaction(selectedAccount, txInteral.txo);
                    await ssInternal.sendAndWaitForReceipt({ gasPrice: kit.web3.utils.toWei("0.5", 'Gwei') });
                }
                return true;
            } catch (error) {
                console.error(error)
                throw new Error("Error changing signs")
            }

        }
    }, [isMultisig])


    const addOwner = useCallback(async (newOwner: string, name = "", image: Image | null = null, mail: string | null = null) => {
        if (isMultisig && remoxAccount) {
            try {
                if (blockchain === 'solana') {
                    const { sdk } = await initGokiSolana();
                    const wallet = await sdk.loadSmartWallet(new PublicKey(selectedAccount));
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
                } else if (blockchain === 'celo') {
                    selectedAccount = selectedAccount.toLowerCase()
                    const isAddressExist = kit.web3.utils.isAddress(newOwner);
                    if (!isAddressExist) throw new Error("There is not any wallet belong this address");

                    const kitMultiSig = await kit.contracts.getMultiSig(selectedAccount); // MultiSig Address with Celo Kit
                    const web3MultiSig = await kit._web3Contracts.getMultiSig(selectedAccount); // MultiSig Address with Web3

                    const tx = toTransactionObject(
                        kit.connection,
                        web3MultiSig.methods.addOwner(newOwner)
                    );

                    const ss = await kitMultiSig.submitOrConfirmTransaction(selectedAccount, tx.txo);
                    await ss.sendAndWaitForReceipt({ gasPrice: kit.web3.utils.toWei("0.5", 'Gwei') });
                }

                // await Add_Member(newOwner, name, image, mail)
                dispatch(Add_Member_To_Account_Thunk(
                    {
                        accountAddress: selectedAccount,
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
    }, [isMultisig])


    const getOwners = async () => {
        if (isMultisig) {
            try {
                if (blockchain === 'solana') {

                    // const multisigData = data?.addresses.find(s => (s.address as SolanaMultisigData).multisig.toLowerCase() === selectedAccount?.toLowerCase())
                    // if (multisigData) {
                    //     const address = multisigData.address as SolanaMultisigData
                    //     const tx = await connection.getTransaction(address.signature)
                    //     const txData = tx?.transaction.message.instructions[0].data
                    //     if (txData) {
                    //         const baseData = base58.decode(txData)
                    //         const parsedData = deserialize<any>(SetWhiteListSchema, WhiteList, Buffer.from(baseData))
                    //         return parsedData.signers.map((s: any) => s.address)
                    //     }
                    // }

                    const { sdk } = await initGokiSolana();
                    const wallet = await sdk.loadSmartWallet(new PublicKey(selectedAccount));
                    if (wallet.data) {
                        const owners = await wallet.data.owners.map(s => s.toBase58())
                        return owners
                    }
                    throw new Error("Wallet has no data")
                }
                const multiSig = await kit.contracts.getMultiSig(selectedAccount); // MultiSig Address with Celo Kit
                return await multiSig.getOwners()
            } catch (e: any) {
                throw new Error(e);
            }
        }
    }

    const replaceOwner = useCallback(async (oldOwner: string, newOwner: string) => {
        if (isMultisig && remoxAccount) {
            try {
                selectedAccount = selectedAccount.toLowerCase()

                if (blockchain === 'solana') {
                    // const sdk = await initGokiSolana();
                    // const wallet = await sdk.loadSmartWallet(new PublicKey(selectedAccount));
                    // if (wallet.data) {
                    //     const owners = wallet.data.owners.map(s => s.toBase58())
                    //     if (!owners.includes(oldOwner)) throw new Error("Owner is not in the list of owners")
                    //     const newOwners = owners.map(s => s === oldOwner ? new PublicKey(newOwner) : s)
                    //     const ownersTx = wallet.setOwners(newOwners.map(s => new PublicKey(s)))
                    //     const pending = await wallet.newTransactionFromEnvelope(
                    //         {
                    //             tx: ownersTx
                    //         }
                    //     )
                    //     await pending.tx.confirm()
                    //     return true;
                    // }
                    throw new Error("Wallet has no data")
                } else if (blockchain === "celo") {
                    const isAddressExist = kit.web3.utils.isAddress(oldOwner.toLowerCase());
                    if (!isAddressExist) throw new Error("There is not any wallet belong this address");

                    const kitMultiSig = await kit.contracts.getMultiSig(selectedAccount); // MultiSig Address with Celo Kit
                    const web3MultiSig = await kit._web3Contracts.getMultiSig(selectedAccount); // MultiSig Address with Web3

                    const tx = toTransactionObject(
                        kit.connection,
                        web3MultiSig.methods.replaceOwner(oldOwner.toLowerCase(), newOwner.toLowerCase())
                    );

                    const ss = await kitMultiSig.submitOrConfirmTransaction(selectedAccount, tx.txo);
                    await ss.sendAndWaitForReceipt({ gasPrice: kit.web3.utils.toWei("0.5", 'Gwei') });
                }

                // await Replace_Member(oldOwner, newOwner)
                dispatch(Replace_Member_In_Account_Thunk({
                    accountAddress: selectedAccount,
                    newMemberAdress: newOwner,
                    oldMemberAddress: oldOwner,
                    remoxAccount: remoxAccount
                }))

            } catch (error) {
                console.error(error)
                throw new Error("Error replacing owner")
            }
        }
    }, [isMultisig])



    const submitTransaction = async (multisigAddress: string, inputs: IPaymentInput[]) => {
        let token;
        try {
            if (blockchain === 'solana') {
                // const multisigData = data?.addresses.find(s => (s.address as SolanaMultisigData).multisig.toLowerCase() === selectedAccount?.toLowerCase())
                // const inputSent = {
                //     sender: publicKey?.toBase58(),
                //     amount: input[0].amount,
                //     receiver: input[0].recipient,
                //     vault_pda: (multisigData?.address as SolanaMultisigData).pda,
                // };
                // const response = await instantSendNative(inputSent);
                // console.log(response);

                // if (multisigData) {
                //     for (const input of inputs) {
                //         if (input.coin.name !== CoinsName.SOL) {
                //             const data = {
                //                 sender: publicKey?.toBase58(), //source account
                //                 amount: input.amount,
                //                 receiver: input.recipient,
                //                 token: input.coin.contractAddress,
                //                 Vault_pda: (multisigData.address as SolanaMultisigData).pda,
                //                 start_time: Math.floor(Date.now() / 1000) + 80,
                //                 end_time: Math.floor(Date.now() / 1000) + 90,
                //             };
                //             const response = await startTokenStream(data);
                //             console.log(response);
                //         } else {
                //             const data = {
                //                 sender: publicKey?.toBase58(),
                //                 amount: input.amount,
                //                 receiver: input.recipient,
                //                 Vault_pda: (multisigData.address as SolanaMultisigData).pda,
                //             };
                //             console.log(data)
                //             const response = await instantSendNative(data);
                //             console.log(response);
                //         }
                //     }
                // }

                // return { message: "Success" }


                const { sdk } = await initGokiSolana();
                const wallet = await sdk.loadSmartWallet(new PublicKey(selectedAccount));
                if (wallet.data) {
                    const txs = new Transaction()
                    for (let index = 0; index < inputs.length; index++) {
                        const { amount, coin: Coin, recipient } = inputs[index];
                        const coin = SolanaCoins[Coin]
                        if (coin.contractAddress && publicKey && signAllTransactions && signTransaction) {
                            // const tx = await spl.token.transferTokenInstructions(connection, new PublicKey(coin.contractAddress), new PublicKey(selectedAccount), new PublicKey(recipient), Number(amount))
                            const tx = spl.token.transferTokenRawInstructions(new PublicKey(coin.contractAddress), new PublicKey(selectedAccount), new PublicKey(recipient), publicKey, toLamport(amount), 9)
                            // const wrappedTx = await spl.util.wrapInstructions(connection, tx, publicKey)
                            txs.add(...tx)
                            continue
                        }

                        let params: any = {
                            fromPubkey: new PublicKey(selectedAccount),
                            toPubkey: new PublicKey(recipient),
                            lamports: toLamport(amount),
                        };
                        txs.add(SystemProgram.transfer(params))
                    }
                    const pending = await wallet.newTransaction({ instructions: txs.instructions })
                    await pending.tx.confirm()
                    return { message: "sucess" }
                }
                throw new Error("Wallet has no data")
            }

            const web3MultiSig = await kit._web3Contracts.getMultiSig(multisigAddress);

            if (inputs.length === 1) {
                const { amount, recipient: toAddress, coin: Coin } = inputs[0]
                const coin = SolanaCoins[Coin]
                let value = kit.web3.utils.toWei(amount.toString(), 'ether');

                token = await kit.contracts.getErc20(coin.contractAddress)

                const celoObj = token.transfer(toAddress, value);
                const txs = toTransactionObject(
                    kit.connection,
                    web3MultiSig.methods.submitTransaction(token.address, "0", stringToSolidityBytes(celoObj.txo.encodeABI())),
                );

                await txs.sendAndWaitForReceipt({ from: address!, gasPrice: kit.web3.utils.toWei("0.5", 'Gwei') })
            } else {
                // const data = await GenerateBatchPay(inputs) /// It is batch for Multisig
                // const txs = toTransactionObject(
                //     kit.connection,
                //     web3MultiSig.methods.submitTransaction(Contracts.BatchRequest.address, "0", stringToSolidityBytes(data.txo.encodeABI())),
                // );

                // await txs.sendAndWaitForReceipt({ from: address!, gasPrice: kit.web3.utils.toWei("0.5", 'Gwei') })
            }
            return { message: "sucess" }
        } catch (e: any) {
            throw new Error(e);
        }
    }

    const revokeTransaction = async (multisigAddress: string, transactionId: string) => {
        try {
            if (blockchain === 'solana') {
                const { sdk } = await initGokiSolana();
                const wallet = await sdk.loadSmartWallet(new PublicKey(selectedAccount));
                if (wallet.data) {
                    const tx = await wallet.approveTransaction(new PublicKey(transactionId), publicKey!)
                    const pending = await wallet.newTransactionFromEnvelope({ tx })
                    await pending.tx.confirm()
                    return { message: "sucess" }
                }
                throw new Error("Wallet has no data")
            }

            const web3MultiSig = await kit._web3Contracts.getMultiSig(multisigAddress);

            const tx = toTransactionObject(
                kit.connection,
                web3MultiSig.methods.revokeConfirmation(transactionId)
            );

            await tx.sendAndWaitForReceipt({ from: address!, gasPrice: kit.web3.utils.toWei("0.5", 'Gwei') })

            return { message: "success" }
        } catch (e: any) {
            throw new Error(e);
        }
    }

    const confirmTransaction = async (multisigAddress: string, transactionId: string | number) => {
        try {
            if (blockchain === 'solana') {
                const { sdk } = await initGokiSolana();
                const wallet = await sdk.loadSmartWallet(new PublicKey(selectedAccount));
                if (wallet.data) {
                    const tx = await wallet.approveTransaction(new PublicKey(transactionId), publicKey!)
                    const pending = await wallet.newTransactionFromEnvelope({ tx })
                    await pending.tx.confirm()
                    return { message: "sucess" }
                }
                throw new Error("Wallet has no data")
            }


            const web3MultiSig = await kit._web3Contracts.getMultiSig(multisigAddress);

            const tx = toTransactionObject(
                kit.connection,
                web3MultiSig.methods.confirmTransaction(transactionId)
            );

            await tx.sendAndWaitForReceipt({ from: address!, gasPrice: kit.web3.utils.toWei("0.5", 'Gwei') })
            return { message: "success" }
        } catch (e: any) {
            throw new Error(e);
        }
    }

    const executeTransaction = async (multisigAddress: string, transactionId: string | number) => {
        try {
            if (blockchain === 'solana') {
                const { sdk } = await initGokiSolana();
                const wallet = await sdk.loadSmartWallet(new PublicKey(selectedAccount));
                if (wallet.data) {
                    const tx = await wallet.executeTransaction({ transactionKey: new PublicKey(transactionId), owner: publicKey! })
                    const pending = await wallet.newTransactionFromEnvelope({ tx })
                    await pending.tx.confirm()
                    return { message: "sucess" }
                }
                throw new Error("Wallet has no data")
            }

            const web3MultiSig = await kit._web3Contracts.getMultiSig(multisigAddress);

            const tx = toTransactionObject(
                kit.connection,
                web3MultiSig.methods.executeTransaction(transactionId)
            );

            await tx.sendAndWaitForReceipt({ from: address!, gasPrice: kit.web3.utils.toWei("0.5", 'Gwei') })
            return { message: "success" }
        } catch (e: any) {
            throw new Error(e);
        }
    }

    const getTransaction = async (multisigAddress: string, transactionId: string) => {
        // try {

        //     let txResult: ITransactionMultisig;
        //     if (blockchain === 'solana') {

        //         const { sdk } = await initGokiSolana();
        //         const wallet = await sdk.loadSmartWallet(new PublicKey(selectedAccount));
        //         if (wallet.data && wallet.data.owners) {
        //             const tx = await wallet.fetchTransactionByIndex(Number(transactionId))

        //             if (!tx) throw new Error(`Error fetching transaction`);
        //             // txResult = {
        //             //     id: transactionId,
        //             //     confirmations: tx.signers.reduce<string[]>((a, c, i) => {
        //             //         if (wallet.data) {
        //             //             a.push(wallet.data.owners[i].toBase58())
        //             //         }
        //             //         return a;
        //             //     }, []),
        //             //     method: tx.instructions[0].programId.toBase58(),

        //             // }
        //             // return { txResult }
        //             return {}

        //         }
        //         throw new Error("Wallet has no data")
        //     }

        //     const kitMultiSig = await kit.contracts.getMultiSig(multisigAddress);

        //     let tx = await kitMultiSig.getTransaction(parseInt(transactionId))
        //     txResult = {
        //         id: parseInt(transactionId),
        //         destination: tx.destination,
        //         data: tx.data,
        //         executed: tx.executed,
        //         confirmations: tx.confirmations,
        //         value: tx.value.toString(),
        //     }

        //     let value = fromWei(tx.value)
        //     txResult.value = value
        //     txResult.requiredCount = ""
        //     txResult.owner = ""
        //     txResult.newOwner = ""
        //     txResult.valueOfTransfer = ""

        //     let methodId = tx.data.slice(0, 10)
        //     txResult.method = MethodIds[methodId as keyof typeof MethodIds]

        //     if (methodId == "0x2e6c3721" || methodId == "0xba51a6df") {
        //         txResult.requiredCount = tx.data.slice(tx.data.length - 2)
        //     } else {
        //         txResult.owner = "0x" + tx.data.slice(35, 74);

        //         if (methodId == "0xe20056e6") txResult.newOwner = "0x" + tx.data.slice(98)
        //         if (methodId == "0xa9059cbb") {
        //             let hex = tx.data.slice(100).replace(/^0+/, '')
        //             let value = parseInt(hex, 16)
        //             txResult.valueOfTransfer = fromWei(value.toString())
        //         }
        //     }

        //     delete txResult.data
        //     return { txResult }
        // } catch (e: any) {
        //     throw new Error(e);
        // }
    }


    return {
        createMultisigAccount, importMultisigAccount,
        getSignAndInternal, removeOwner, changeSigns, addOwner, getOwners, replaceOwner,
        submitTransaction, revokeTransaction, confirmTransaction, executeTransaction,
        getTransaction, FetchTransactions, transactions
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

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
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


