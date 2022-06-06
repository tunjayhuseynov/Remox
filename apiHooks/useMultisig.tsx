import { useContractKit } from '@celo-tools/use-contractkit';
import { toTransactionObject } from '@celo/connect';
import { useCallback, useContext, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { SelectSelectedAccount } from 'redux/reducers/selectedAccount';
import { selectStorage } from 'redux/reducers/storage';
import { auth } from 'firebaseConfig';
import { FirestoreWrite, useFirestoreRead } from './useFirebase';
import { setInternalSign, setSign } from "../redux/reducers/multisig"
import { AltCoins, CeloCoins, Coins } from 'types';
import { StableToken } from '@celo/contractkit';
import { stringToSolidityBytes } from '@celo/contractkit/lib/wrappers/BaseWrapper';
import { DashboardContext } from 'layouts/dashboard';
import useCeloPay, { PaymentInput } from './useCeloPay';
import { Contracts } from './Contracts/Contracts';
import { fromWei } from 'utils/ray';
import useNextSelector from 'hooks/useNextSelector';


export enum MultisigMethodIds {
    "0x173825d9" = 'removeOwner',
    "0xe20056e6" = 'replaceOwner',
    "0x7065cb48" = 'addOwner',
    "0xa9059cbb" = 'transfer',
    "0x2e6c3721" = 'changeInternalRequirement',
    "0xba51a6df" = 'changeRequirement'
}

export interface Transaction {
    destination: string,
    data?: string,
    executed: boolean,
    confirmations: string[],
    value: string,
    id?: number,
    requiredCount?: string,
    owner?: string,
    newOwner?: string,
    valueOfTransfer?: string,
    method?: string
}

export default function useMultisig() {
    let selectedAccount = useNextSelector(SelectSelectedAccount, "")
    const storage = useNextSelector(selectStorage, null)
    const { kit, address } = useContractKit()
    const [isLoading, setLoading] = useState(false)
    const { data } = useFirestoreRead<{ addresses: { name: string, address: string }[] }>("multisigs", auth.currentUser?.uid ?? "0")
    const [transactions, setTransactions] = useState<Transaction[]>()
    const { refetch } = useContext(DashboardContext) as { refetch: () => Promise<void> }
    const { GenerateBatchPay } = useCeloPay()



    const dispatch = useDispatch()

    const isMultisig = selectedAccount.toLowerCase() !== storage?.lastSignedProviderAddress.toLowerCase()

    const FetchTransactions = async (multisigAddress: string, skip: number, take: number) => {
        setLoading(true)
        let transactionArray: Transaction[] = []
        let obj: Transaction;
        try {
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
                obj.method = MultisigMethodIds[methodId as keyof typeof MultisigMethodIds]

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
            setLoading(false)
            setTransactions(transactionArray)
            return transactionArray
        } catch (e: any) {
            console.error(e)
            setLoading(false)
            throw new Error(e);
        }
    }


    const createMultisigAccount = async (owners: string[], name: string, sign: string, internalSign: string) => {
        setLoading(true)
        try {
            if (Number(sign) > owners.length + 1 || Number(internalSign) > owners.length + 1) {
                throw new Error("Minimum sign count must be greater than the number of owners");
            }

            const proxyAddress = "" // await CreateMultisigAccount(owners, name, sign, internalSign)

            if (data) {
                await FirestoreWrite().updateDoc("multisigs", auth.currentUser!.uid, { addresses: [...data?.addresses, { name: name, address: proxyAddress }] })
            } else {
                await FirestoreWrite().createDoc("multisigs", auth.currentUser!.uid, { addresses: [{ name: name, address: proxyAddress }] })
            }
            await refetch()
            setLoading(false)
            return { multiSigAddress: proxyAddress }
        } catch (e: any) {
            setLoading(false)
            throw new Error(e.message);
        }
    }

    const importMultisigAccount = async (contractAddress: string, name = "") => {
        setLoading(true)
        try {
            const multiSig = await kit.contracts.getMultiSig(contractAddress);

            const isOwner = await multiSig.isowner(kit.defaultAccount!)
            if (!isOwner) throw new Error("You are not owner in this multisig address");
            if (data?.addresses.some(s => s.address.toLocaleLowerCase() === contractAddress.toLocaleLowerCase())) throw new Error("This address already exist");

            if (data) {
                await FirestoreWrite().updateDoc("multisigs", auth.currentUser!.uid, { addresses: [...data?.addresses, { name: name, address: contractAddress }] })
            } else {
                await FirestoreWrite().createDoc("multisigs", auth.currentUser!.uid, { addresses: [{ name: name, address: contractAddress }] })
            }
            setLoading(false)
            return true
        } catch (e: any) {
            setLoading(false)
            throw new Error(e);
        }
    }


    const getSignAndInternal = async () => {
        if (isMultisig) {
            setLoading(true)
            try {
                const multiSig = await kit.contracts.getMultiSig(selectedAccount);
                const executinTransactions = await multiSig.getRequired()
                const changingMultiSigProperties = await multiSig.getInternalRequired()
                if (executinTransactions.c && changingMultiSigProperties.c) {
                    dispatch(setSign(executinTransactions.c[0]))
                    dispatch(setInternalSign(changingMultiSigProperties.c[0]))
                    setLoading(false)
                    return { sign: executinTransactions.c[0], internalSigns: changingMultiSigProperties.c[0] }
                }
                setLoading(false)
                throw new Error(`Invalid multiSignature`)
            } catch (e: any) {
                setLoading(false)
                throw new Error(e);
            }
        }
    }

    const removeOwner = useCallback(async (ownerAddress: string) => {
        if (isMultisig) {
            setLoading(true)
            try {
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
                setLoading(false)
                return true
            } catch (error) {
                setLoading(false)
                console.error(error)
                throw new Error("Error removing owner")
            }

        }
    }, [isMultisig])

    const changeSigns = useCallback(async (sign: number, internalSign: number, isSign = true, isInternal = true) => {
        if (isMultisig) {
            setLoading(true)
            try {
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
                setLoading(false)
                return true;
            } catch (error) {
                setLoading(false)
                console.error(error)
                throw new Error("Error changing signs")
            }


        }
    }, [isMultisig])

    const addOwner = useCallback(async (newOwner: string) => {
        if (isMultisig) {
            setLoading(true)
            try {
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
                setLoading(false)
                return true
            } catch (error) {
                setLoading(false)
                console.error(error)
                throw new Error("Error adding owner")
            }

        }
    }, [isMultisig])

    const getOwners = async () => {
        if (isMultisig) {
            setLoading(true)
            try {
                const multiSig = await kit.contracts.getMultiSig(selectedAccount); // MultiSig Address with Celo Kit
                setLoading(false)
                return await multiSig.getOwners()
            } catch (e: any) {
                setLoading(false)
                throw new Error(e);
            }
        }
    }

    const replaceOwner = useCallback(async (oldOwner: string, newOwner: string) => {
        if (isMultisig) {
            setLoading(true)
            try {
                selectedAccount = selectedAccount.toLowerCase()
                const isAddressExist = kit.web3.utils.isAddress(oldOwner.toLowerCase());
                if (!isAddressExist) throw new Error("There is not any wallet belong this address");

                const kitMultiSig = await kit.contracts.getMultiSig(selectedAccount); // MultiSig Address with Celo Kit
                const web3MultiSig = await kit._web3Contracts.getMultiSig(selectedAccount); // MultiSig Address with Web3

                const tx = toTransactionObject(
                    kit.connection,
                    web3MultiSig.methods.replaceOwner(oldOwner.toLowerCase(), newOwner.toLowerCase())
                );

                const ss = await kitMultiSig.submitOrConfirmTransaction(selectedAccount, tx.txo);
                setLoading(false)
                await ss.sendAndWaitForReceipt({ gasPrice: kit.web3.utils.toWei("0.5", 'Gwei') });
            } catch (error) {
                setLoading(false)
                console.error(error)
                throw new Error("Error replacing owner")
            }
        }
    }, [isMultisig])



    const submitTransaction = async (multisigAddress: string, input: PaymentInput[]) => {
        let token;
        try {
            setLoading(true)
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
            setLoading(false);
            return { message: "sucess" }
        } catch (e: any) {
            setLoading(false)
            throw new Error(e);
        }
    }

    const revokeTransaction = async (multisigAddress: string, transactionId: string | number) => {
        setLoading(true)
        try {
            const web3MultiSig = await kit._web3Contracts.getMultiSig(multisigAddress);

            const tx = toTransactionObject(
                kit.connection,
                web3MultiSig.methods.revokeConfirmation(transactionId)
            );

            await tx.sendAndWaitForReceipt({ from: address!, gasPrice: kit.web3.utils.toWei("0.5", 'Gwei') })

            setLoading(false)
            return { message: "success" }
        } catch (e: any) {
            setLoading(false)
            throw new Error(e);
        }
    }

    const confirmTransaction = async (multisigAddress: string, transactionId: string | number) => {
        setLoading(true)
        try {

            const web3MultiSig = await kit._web3Contracts.getMultiSig(multisigAddress);

            const tx = toTransactionObject(
                kit.connection,
                web3MultiSig.methods.confirmTransaction(transactionId)
            );

            await tx.sendAndWaitForReceipt({ from: address!, gasPrice: kit.web3.utils.toWei("0.5", 'Gwei') })
            setLoading(false)
            return { message: "success" }
        } catch (e: any) {
            setLoading(false)
            throw new Error(e);
        }
    }

    const executeTransaction = async (multisigAddress: string, transactionId: string | number) => {
        setLoading(true)
        try {
            const web3MultiSig = await kit._web3Contracts.getMultiSig(multisigAddress);

            const tx = toTransactionObject(
                kit.connection,
                web3MultiSig.methods.executeTransaction(transactionId)
            );

            await tx.sendAndWaitForReceipt({ from: address!, gasPrice: kit.web3.utils.toWei("0.5", 'Gwei') })
            setLoading(false)
            return { message: "success" }
        } catch (e: any) {
            setLoading(false)
            throw new Error(e);
        }
    }

    const getTransaction = async (multisigAddress: string, transactionId: string) => {
        try {
            const kitMultiSig = await kit.contracts.getMultiSig(multisigAddress);

            let tx = await kitMultiSig.getTransaction(parseInt(transactionId))
            let txResult: Transaction;
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
            txResult.method = MultisigMethodIds[methodId as keyof typeof MultisigMethodIds]

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

    return { importMultisigAccount, createMultisigAccount, data, isLoading, transactions, FetchTransactions, addOwner, replaceOwner, changeSigns, removeOwner, getOwners, getSignAndInternal, getTransaction, submitTransaction, revokeTransaction, confirmTransaction, executeTransaction };
}
