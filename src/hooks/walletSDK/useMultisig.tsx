import { useCallback, useState } from "react";
import { BlockchainType } from "./useWalletKit";
import { toTransactionObject } from '@celo/connect';
import { GokiSDK } from '@gokiprotocol/client'
import { toBN } from 'web3-utils';
import * as anchor from "@project-serum/anchor";
import { SolanaProvider } from "@saberhq/solana-contrib";
import { PublicKey, SystemProgram, Transaction } from "@solana/web3.js";
import { useContractKit } from "@celo-tools/use-contractkit";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { FirestoreRead, FirestoreWrite, useFirestoreRead } from "API/useFirebase";
import { auth } from 'Firebase';
import { SelectSelectedAccount } from "redux/reducers/selectedAccount";
import { useSelector } from "react-redux";
import { selectStorage } from "redux/reducers/storage";
import { useDispatch } from "react-redux";
import { setInternalSign, setSign } from "redux/reducers/multisig";
import { CeloCoins } from "types";
import useCeloPay, { PaymentInput } from "API/useCeloPay";
import { stringToSolidityBytes } from "@celo/contractkit/lib/wrappers/BaseWrapper";
import { Contracts } from "API/Contracts/Contracts";
import { fromWei, toLamport } from "utils/ray";
import * as spl from 'easy-spl'
import { StableToken } from "@celo/contractkit";

const multiProxy = import("API/ABI/MultisigProxy.json");
const multisigContract = import("API/ABI/Multisig.json")

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


export default function useMultisig(blockchain: BlockchainType) {


    let selectedAccount = useSelector(SelectSelectedAccount)
    const storage = useSelector(selectStorage)
    const [isLoading, setLoading] = useState(false)

    const dispatch = useDispatch()
    const [transactions, setTransactions] = useState<TransactionMultisig[]>()

    const { data } = useFirestoreRead<{ addresses: { name: string, address: string }[] }>("multisigs", auth.currentUser?.uid ?? "")



    const isMultisig = selectedAccount.toLowerCase() !== storage!.accountAddress.toLowerCase()

    //Celo
    const { address, kit } = useContractKit()
    const { GenerateBatchPay } = useCeloPay()


    //solana
    const { connection } = useConnection();
    const { publicKey, signTransaction, signAllTransactions } = useWallet();

    const initSolana = async () => {
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
                const sdk = await initSolana()
                const wallet = await sdk.loadSmartWallet(new PublicKey(selectedAccount));
                if (wallet.data) {
                    console.log("Wallet data", wallet.data.numTransactions.toNumber())
                    for (let index = 0; index < wallet.data.numTransactions.toNumber(); index++) {
                        const transaction = await wallet.fetchTransactionByIndex(index);
                        console.log(transaction)
                        // obj = {
                        //     destination: transaction.destination,
                        //     data: transaction.data,
                        //     executed: transaction.executed,
                        //     confirmations: transaction.confirmations,
                        //     value: transaction.value,
                        //     id: transaction.id,
                        //     requiredCount: transaction.requiredCount,
                        //     owner: transaction.owner,
                        //     newOwner: transaction.newOwner,
                        //     valueOfTransfer: transaction.valueOfTransfer,
                        //     method: transaction.method
                        // }
                        // transactionArray.push(obj)
                    }
                    return
                }

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



    const CreateMultisigAccount = useCallback(async (owners: string[], name: string, sign: string, internalSign: string) => {
        const sdk = await initSolana();

        if (blockchain === 'solana') {

            const wlt = await sdk.newSmartWallet({
                owners: owners.map(o => new PublicKey(o)),
                numOwners: owners.length,
                threshold: toBN(sign)
            })

            return wlt.smartWalletWrapper.key.toBase58()
        }

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
        const proxyAddress = res0.contractAddress
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

        if (data) {
            await FirestoreWrite().updateDoc("multisigs", auth.currentUser!.uid, { addresses: [...data?.addresses, { name: name, address: proxyAddress }] })
        } else {
            await FirestoreWrite().createDoc("multisigs", auth.currentUser!.uid, { addresses: [{ name: name, address: proxyAddress }] })
        }
        
        return proxyAddress;
    }, [blockchain])

    const importMultisigAccount = async (contractAddress: string, name = "") => {
        try {

            if (blockchain === 'solana') {
                const sdk = await initSolana();
                const wallet = await sdk.loadSmartWallet(new PublicKey(contractAddress));

                if (wallet.data) {
                    for (let index = 0; index < wallet.data.owners.length; index++) {
                        const w = wallet.data.owners[index];
                        if (w.toBase58().toLowerCase() === publicKey?.toBase58().toLowerCase()) break;
                        if (index === wallet.data.owners.length - 1) {
                            throw new Error("You are not an owner in this multisig address")
                        }
                    }
                }

            } else if (blockchain === 'celo') {
                const multiSig = await kit.contracts.getMultiSig(contractAddress);

                const isOwner = await multiSig.isowner(kit.defaultAccount!)
                if (!isOwner) throw new Error("You are not an owner in this multisig address");
            }


            if (data?.addresses.some(s => s.address.toLocaleLowerCase() === contractAddress.toLocaleLowerCase())) throw new Error("This address already exist");

            if (data) {
                await FirestoreWrite().updateDoc("multisigs", auth.currentUser!.uid, { addresses: [...data?.addresses, { name: name, address: contractAddress }] })
            } else {
                await FirestoreWrite().createDoc("multisigs", auth.currentUser!.uid, { addresses: [{ name: name, address: contractAddress }] })
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
                    const sdk = await initSolana();
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
        if (isMultisig) {
            try {
                if (blockchain === 'solana') {
                    const sdk = await initSolana();
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
                    const sdk = await initSolana();
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
                    const sdk = await initSolana();
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
                    const sdk = await initSolana();
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
        if (isMultisig) {
            try {
                selectedAccount = selectedAccount.toLowerCase()

                if (blockchain === 'solana') {
                    const sdk = await initSolana();
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
                const sdk = await initSolana();
                const wallet = await sdk.loadSmartWallet(new PublicKey(selectedAccount));
                if (wallet.data) {
                    const txs = new Transaction()
                    for (let index = 0; index < input.length; index++) {
                        const { amount, coin, recipient } = input[index];

                        if (coin.contractAddress && publicKey && signAllTransactions && signTransaction) {
                            const tx = await spl.token.transferTokenInstructions(connection, new PublicKey(coin.contractAddress), new PublicKey(selectedAccount), new PublicKey(recipient), Number(amount))
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

            if (input.length === 1) {
                const { amount, recipient: toAddress, coin } = input[0]
                let value = kit.web3.utils.toWei(amount, 'ether');

                if (coin == CeloCoins.CELO) token = await kit.contracts.getGoldToken()
                else if (coin == CeloCoins.cUSD || coin == CeloCoins.cEUR) token = await kit.contracts.getStableToken(coin.name as unknown as StableToken)
                else token = await kit.contracts.getErc20(coin.contractAddress)

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
                const sdk = await initSolana();
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
                const sdk = await initSolana();
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
                const sdk = await initSolana();
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

                const sdk = await initSolana();
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
        CreateMultisigAccount, importMultisigAccount,
        getSignAndInternal, removeOwner, changeSigns, addOwner, getOwners, replaceOwner,
        submitTransaction, revokeTransaction, confirmTransaction, executeTransaction,
        getTransaction, FetchTransactions, transactions, data, isLoading
    }
}
