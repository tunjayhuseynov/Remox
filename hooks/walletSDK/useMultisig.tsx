import { useCallback, useState } from "react";
import { toTransactionObject } from '@celo/connect';
import { GokiSDK } from '@gokiprotocol/client'
import * as anchor from "@project-serum/anchor";
import { SolanaProvider } from "@saberhq/solana-contrib";
import { PACKET_DATA_SIZE, PublicKey } from "@solana/web3.js";
import { useContractKit } from "@celo-tools/use-contractkit";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { FirestoreRead, FirestoreWrite, useFirestoreRead } from "apiHooks/useFirebase";
import { auth } from 'firebaseConfig';
import { SelectSelectedAccount } from "redux/reducers/selectedAccount";
import { useSelector } from "react-redux";
import { selectStorage } from "redux/reducers/storage";
import { useDispatch } from "react-redux";
import multisig, { setInternalSign, setSign } from "redux/reducers/multisig";
import useCeloPay, { PaymentInput } from "apiHooks/useCeloPay";
import { stringToSolidityBytes } from "@celo/contractkit/lib/wrappers/BaseWrapper";
import { Contracts } from "apiHooks/Contracts/Contracts";
import { fromWei, toLamport } from "utils/ray";
import * as borsh from '@project-serum/borsh';
import { deserialize } from 'borsh'
import { selectBlockchain } from "redux/reducers/network";
import { createVault } from 'zebecprotocol-sdk'
import { SetWhiteListSchema, WhiteList } from 'zebecprotocol-sdk/multisig/native/schema'

const multiProxy = import("apiHooks/ABI/MultisigProxy.json");
const multisigContract = import("apiHooks/ABI/Multisig.json")

export interface TransactionMultisig {
    destination: string,
    data?: string,
    executed: boolean,
    confirmations: string[],
    value: string,
    id?: number | string,
    requiredCount?: string,
    owner?: string,
    newOwner?: string,
    valueOfTransfer?: string,
    method?: string
}

export enum MethodIds {
    "0x173825d9" = 'removeOwner',
    "0xe20056e6" = 'replaceOwner',
    "0x7065cb48" = 'addOwner',
    "0xa9059cbb" = 'transfer',
    "0x2e6c3721" = 'changeInternalRequirement',
    "0xba51a6df" = 'changeRequirement'
}

export type SolanaMultisigData = {
    pda: string,
    multisig: string,
    signature: string,
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


    let selectedAccount = useSelector(SelectSelectedAccount)
    const blockchain = useSelector(selectBlockchain)
    const storage = useSelector(selectStorage)
    const [isLoading, setLoading] = useState(false)

    const dispatch = useDispatch()
    const [transactions, setTransactions] = useState<TransactionMultisig[]>()

    const { data } = useFirestoreRead<MultisigType>("multisigs", auth.currentUser?.uid ?? "")

    const isMultisig = selectedAccount.toLowerCase() !== storage?.accountAddress.toLowerCase()

    //Celo
    const { address, kit } = useContractKit()
    const { GenerateBatchPay } = useCeloPay()


    //solana
    const { connection } = useConnection();
    const { publicKey, signTransaction, signAllTransactions, sendTransaction } = useWallet();

    const initGokiSolana = async () => {
        if (!publicKey || !signAllTransactions || !signTransaction) throw new Error("Wallet not initialized");
        const anchorProvider = new anchor.AnchorProvider(connection, {
            publicKey,
            signAllTransactions,
            signTransaction
        }, {})
        anchor.setProvider(anchorProvider);

        const provider = SolanaProvider.init({
            connection: connection,
            wallet: {
                publicKey,
                signAllTransactions,
                signTransaction
            },
            opts: anchorProvider.opts,
        });

        const sdk = GokiSDK.load({ provider })

        return sdk;
    }


    const FetchTransactions = async (multisigAddress: string, skip: number, take: number) => {
        let transactionArray: TransactionMultisig[] = []
        let obj: TransactionMultisig;
        try {
            console.log("Fetching transactions")
            if (blockchain === 'solana') {

                return []
                throw new Error("Wallet not initialized")
            }

            const kitMultiSig = await kit.contracts.getMultiSig(multisigAddress);
            let total = await kitMultiSig.getTransactionCount(true, true)
            if (total > skip) {
                total -= skip;
            }
            let limit = total - take - 1 > 0 ? total - take - 1 : 0;
            for (let index = total - 1; index > limit; index--) {
                let tx = await kitMultiSig.getTransaction(index)

                if (!tx || (tx && !tx['data'])) continue;

                obj = {
                    destination: tx.destination,
                    data: tx.data,
                    executed: tx.executed,
                    confirmations: tx.confirmations,
                    value: tx.value.toString(),
                }

                let value = fromWei(tx.value)
                obj.value = value
                obj.id = index
                obj.requiredCount = ""
                obj.owner = ""
                obj.newOwner = ""
                obj.valueOfTransfer = ""

                let methodId = tx.data.slice(0, 10)
                obj.method = MethodIds[methodId as keyof typeof MethodIds]

                if (methodId == "0x2e6c3721" || methodId == "0xba51a6df") {
                    obj.requiredCount = tx.data.slice(tx.data.length - 2)
                } else {
                    obj.owner = "0x" + tx.data.slice(35, 74);

                    if (methodId == "0xe20056e6") obj.newOwner = "0x" + tx.data.slice(98)
                    if (methodId == "0xa9059cbb") {
                        let hex = tx.data.slice(100).replace(/^0+/, '')
                        let value = parseInt(hex, 16)
                        obj.valueOfTransfer = fromWei(value)
                    }
                }

                delete obj.data
                transactionArray.push(obj)
            }
            setTransactions(transactionArray)
            return transactionArray
        } catch (e: any) {
            console.error(e)
            throw new Error(e);
        }
    }



    const createMultisigAccount = useCallback(async (owners: string[], name: string, sign: string, internalSign: string) => {
        // const sdk = await initSolana();
        let proxyAddress;
        if (blockchain === 'solana') {

            const input = {
                sender: publicKey?.toBase58(),
                owners: [publicKey?.toBase58(), ...owners].map(x => ({ wallet_address: x })),
                min_confirmation_required: Number(sign),
            };
            const { data } = await createVault(input, sendTransaction, connection);

            proxyAddress = {
                pda: data.Vault_pda,
                multisig: data.multisig_vault,
                signature: data.transactionhash
            }
            // GOKI
            // const wlt = await sdk.newSmartWallet({
            //     owners: owners.map(o => new PublicKey(o)),
            //     numOwners: owners.length,
            //     threshold: toBN(sign)
            // })

            // return wlt.smartWalletWrapper.key.toBase58()
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
        }
        if (data) {
            await FirestoreWrite<MultisigType>().updateDoc("multisigs", auth.currentUser!.uid, { addresses: [...data?.addresses, { name: name, address: proxyAddress, blockchain: blockchain }] })
        } else {
            await FirestoreWrite<MultisigType>().createDoc("multisigs", auth.currentUser!.uid, { addresses: [{ name: name, address: proxyAddress, blockchain: blockchain }] })
        }

        return proxyAddress;
    }, [blockchain])

    const importMultisigAccount = async (contractAddress: string, name = "") => {
        try {

            if (blockchain === 'solana') {


                // GOKI
                // const sdk = await initSolana();
                // const wallet = await sdk.loadSmartWallet(new PublicKey(contractAddress));

                // if (wallet.data) {
                //     for (let index = 0; index < wallet.data.owners.length; index++) {
                //         const w = wallet.data.owners[index];
                //         if (w.toBase58().toLowerCase() === publicKey?.toBase58().toLowerCase()) break;
                //         if (index === wallet.data.owners.length - 1) {
                //             throw new Error("You are not an owner in this multisig address")
                //         }
                //     }
                // }
                if (data?.addresses.some(s => (s.address as SolanaMultisigData).multisig.toLocaleLowerCase() === contractAddress.toLocaleLowerCase())) throw new Error("This address already exist");
            } else if (blockchain === 'celo') {
                const multiSig = await kit.contracts.getMultiSig(contractAddress);

                const isOwner = await multiSig.isowner(kit.defaultAccount!)
                if (!isOwner) throw new Error("You are not an owner in this multisig address");
                if (data?.addresses.some(s => (s.address as string).toLocaleLowerCase() === contractAddress.toLocaleLowerCase())) throw new Error("This address already exist");
            }




            if (data) {
                await FirestoreWrite<MultisigType>().updateDoc("multisigs", auth.currentUser!.uid, { addresses: [...data?.addresses, { name: name, address: contractAddress, blockchain }] })
            } else {
                await FirestoreWrite<MultisigType>().createDoc("multisigs", auth.currentUser!.uid, { addresses: [{ name: name, address: contractAddress, blockchain }] })
            }
            return true
        } catch (e: any) {
            throw new Error(e);
        }
    }

    const getSignAndInternal = async () => {
        if (isMultisig) {
            try {
                if (blockchain === 'solana') {

                    const multisigData = data?.addresses.find(s => (s.address as SolanaMultisigData).multisig.toLowerCase() === selectedAccount?.toLowerCase())
                    if (multisigData) {
                        const address = multisigData.address as SolanaMultisigData
                        const tx = await connection.getTransaction(address.signature)
                        const txData = tx?.transaction.message.instructions[0].data
                        if (txData) {
                           const parsedData = deserialize(SetWhiteListSchema, WhiteList, Buffer.from(txData))
                           console.log(parsedData)
                        }
                    }

                    // Goki
                    // const sdk = await initSolana();
                    // const wallet = await sdk.loadSmartWallet(new PublicKey(selectedAccount));
                    // if (wallet.data) {
                    //     dispatch(setSign(wallet.data.threshold.toNumber()))
                    //     dispatch(setInternalSign(wallet.data.threshold.toNumber()))
                    //     return { sign: wallet.data.threshold.toNumber(), internalSigns: wallet.data.threshold.toNumber() }
                    // }
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
        if (isMultisig) {
            try {
                if (blockchain === 'solana') {
                    const sdk = await initGokiSolana();
                    const wallet = await sdk.loadSmartWallet(new PublicKey(selectedAccount));
                    if (wallet.data) {
                        const tx = await wallet.setOwners(wallet.data.owners.filter(o => o.toBase58().toLowerCase() !== ownerAddress.toLowerCase()))
                        const pending = await wallet.newTransactionFromEnvelope({ tx })
                        await pending.tx.confirm()
                        return true;
                    }
                    throw new Error("Wallet has no data")
                }

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
                    const sdk = await initGokiSolana();
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


    const addOwner = useCallback(async (newOwner: string) => {
        if (isMultisig) {
            try {

                if (blockchain === 'solana') {
                    const sdk = await initGokiSolana();
                    const wallet = await sdk.loadSmartWallet(new PublicKey(selectedAccount));
                    if (wallet.data) {
                        const owners = await wallet.setOwners(wallet.data.owners.concat([new PublicKey(newOwner)]))
                        const pending = await wallet.newTransactionFromEnvelope(
                            {
                                tx: owners
                            }
                        )
                        await pending.tx.confirm()
                        return true;
                    }
                    throw new Error("Wallet has no data")
                }

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

                    const multisigData = data?.addresses.find(s => (s.address as SolanaMultisigData).multisig.toLowerCase() === selectedAccount?.toLowerCase())
                    if (multisigData) {
                        const address = multisigData.address as SolanaMultisigData
                        const tx = await connection.getTransaction(address.signature)
                        const txData = tx?.transaction.message.instructions[0].data
                        if (txData) {
                           const parsedData = deserialize(SetWhiteListSchema, WhiteList, Buffer.from(txData))
                           console.log(parsedData)
                        }
                    }

                    // const sdk = await initGokiSolana();
                    // const wallet = await sdk.loadSmartWallet(new PublicKey(selectedAccount));
                    // if (wallet.data) {
                    //     const owners = await wallet.data.owners.map(s => s.toBase58())
                    //     return owners
                    // }
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
        if (isMultisig) {
            try {
                selectedAccount = selectedAccount.toLowerCase()

                if (blockchain === 'solana') {
                    const sdk = await initGokiSolana();
                    const wallet = await sdk.loadSmartWallet(new PublicKey(selectedAccount));
                    if (wallet.data) {
                        const owners = await wallet.data.owners.map(s => s.toBase58())
                        if (!owners.includes(oldOwner)) throw new Error("Owner is not in the list of owners")
                        const newOwners = owners.map(s => s === oldOwner ? new PublicKey(newOwner) : s)
                        const ownersTx = await wallet.setOwners(newOwners.map(s => new PublicKey(s)))
                        const pending = await wallet.newTransactionFromEnvelope(
                            {
                                tx: ownersTx
                            }
                        )
                        await pending.tx.confirm()
                        return true;
                    }
                    throw new Error("Wallet has no data")
                }

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
            } catch (error) {
                console.error(error)
                throw new Error("Error replacing owner")
            }
        }
    }, [isMultisig])



    const submitTransaction = async (multisigAddress: string, input: PaymentInput[]) => {
        let token;
        try {
            if (blockchain === 'solana') {

                const data = await connection.getAccountInfo(new PublicKey("6EJZA92sTqxcUKy6WAzrv73vXhVmMt9mrhEyLMoKojsF"))
                console.log(data?.owner.toBase58())

                return { message: "sucess" }

                // const data = {
                //     sender: publicKey?.toBase58(),
                //     amount: input[0].amount,
                //     receiver: input[0].recipient,
                //     vault_pda: "DAMKbiGiyfne6Kvw9wMRWk4M6D1cr7BiggCP5H9sJXik",
                //   };
                //   const response = await instantSendNative(data);
                //   console.log(response);


                // const sdk = await initSolana();
                // const wallet = await sdk.loadSmartWallet(new PublicKey(selectedAccount));
                // if (wallet.data) {
                //     const txs = new Transaction()
                //     for (let index = 0; index < input.length; index++) {
                //         const { amount, coin, recipient } = input[index];

                //         if (coin.contractAddress && publicKey && signAllTransactions && signTransaction) {
                //             const tx = await spl.token.transferTokenInstructions(connection, new PublicKey(coin.contractAddress), new PublicKey(selectedAccount), new PublicKey(recipient), Number(amount))
                //             txs.add(...tx)
                //             continue
                //         }

                //         let params: any = {
                //             fromPubkey: new PublicKey(selectedAccount),
                //             toPubkey: new PublicKey(recipient),
                //             lamports: toLamport(amount),
                //         };
                //         txs.add(SystemProgram.transfer(params))
                //     }
                //     const pending = await wallet.newTransaction({ instructions: txs.instructions })
                //     await pending.tx.confirm()
                //     return { message: "sucess" }
                // }
                // throw new Error("Wallet has no data")
            }

            const web3MultiSig = await kit._web3Contracts.getMultiSig(multisigAddress);

            if (input.length === 1) {
                const { amount, recipient: toAddress, coin } = input[0]
                let value = kit.web3.utils.toWei(amount, 'ether');

                token = await kit.contracts.getErc20(coin.contractAddress)

                const celoObj = token.transfer(toAddress, value);
                const txs = toTransactionObject(
                    kit.connection,
                    web3MultiSig.methods.submitTransaction(token.address, "0", stringToSolidityBytes(celoObj.txo.encodeABI())),
                );

                await txs.sendAndWaitForReceipt({ from: address!, gasPrice: kit.web3.utils.toWei("0.5", 'Gwei') })
            } else {
                const data = await GenerateBatchPay(input)
                const txs = toTransactionObject(
                    kit.connection,
                    web3MultiSig.methods.submitTransaction(Contracts.BatchRequest.address, "0", stringToSolidityBytes(data.txo.encodeABI())),
                );

                await txs.sendAndWaitForReceipt({ from: address!, gasPrice: kit.web3.utils.toWei("0.5", 'Gwei') })
            }
            return { message: "sucess" }
        } catch (e: any) {
            throw new Error(e);
        }
    }

    const revokeTransaction = async (multisigAddress: string, transactionId: string) => {
        try {
            if (blockchain === 'solana') {
                const sdk = await initGokiSolana();
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
                const sdk = await initGokiSolana();
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
                const sdk = await initGokiSolana();
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
        try {

            let txResult: TransactionMultisig;
            if (blockchain === 'solana') {

                const sdk = await initGokiSolana();
                const wallet = await sdk.loadSmartWallet(new PublicKey(selectedAccount));
                if (wallet.data && wallet.data.owners) {
                    const tx = await wallet.fetchTransactionByIndex(Number(transactionId))

                    if (!tx) throw new Error(`Error fetching transaction`);
                    console.log(tx)
                    // txResult = {
                    //     id: transactionId,
                    //     confirmations: tx.signers.reduce<string[]>((a, c, i) => {
                    //         if (wallet.data) {
                    //             a.push(wallet.data.owners[i].toBase58())
                    //         }
                    //         return a;
                    //     }, []),
                    //     method: tx.instructions[0].programId.toBase58(),

                    // }
                    // return { txResult }
                    return {}

                }
                throw new Error("Wallet has no data")
            }

            const kitMultiSig = await kit.contracts.getMultiSig(multisigAddress);

            let tx = await kitMultiSig.getTransaction(parseInt(transactionId))
            txResult = {
                id: parseInt(transactionId),
                destination: tx.destination,
                data: tx.data,
                executed: tx.executed,
                confirmations: tx.confirmations,
                value: tx.value.toString(),
            }

            let value = fromWei(tx.value)
            txResult.value = value
            txResult.requiredCount = ""
            txResult.owner = ""
            txResult.newOwner = ""
            txResult.valueOfTransfer = ""

            let methodId = tx.data.slice(0, 10)
            txResult.method = MethodIds[methodId as keyof typeof MethodIds]

            if (methodId == "0x2e6c3721" || methodId == "0xba51a6df") {
                txResult.requiredCount = tx.data.slice(tx.data.length - 2)
            } else {
                txResult.owner = "0x" + tx.data.slice(35, 74);

                if (methodId == "0xe20056e6") txResult.newOwner = "0x" + tx.data.slice(98)
                if (methodId == "0xa9059cbb") {
                    let hex = tx.data.slice(100).replace(/^0+/, '')
                    let value = parseInt(hex, 16)
                    txResult.valueOfTransfer = fromWei(value.toString())
                }
            }

            delete txResult.data
            return { txResult }
        } catch (e: any) {
            throw new Error(e);
        }
    }

    return {
        createMultisigAccount, importMultisigAccount,
        getSignAndInternal, removeOwner, changeSigns, addOwner, getOwners, replaceOwner,
        submitTransaction, revokeTransaction, confirmTransaction, executeTransaction,
        getTransaction, FetchTransactions, transactions, data, isLoading
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