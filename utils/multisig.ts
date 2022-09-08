import BigNumber from "bignumber.js"
import InputDataDecoder, { InputData } from "ethereum-input-data-decoder";
import { IBudget } from "firebaseConfig";
import { CeloInputReader, ERC20MethodIds, GenerateTransaction } from "hooks/useTransactionProcess";
import { MethodIds, MethodNames, ITransactionMultisig, IMultisigSafeTransaction } from "hooks/walletSDK/useMultisig"
import { ITag } from "pages/api/tags/index.api";
import { AltCoins, Coins } from "types";
import { Blockchains, BlockchainType } from "types/blockchains";
import { GnosisConfirmation, GnosisDataDecoded, GnosisTransaction } from "types/GnosisSafe";
import { DecimalConverter } from "./api";
import erc20 from 'rpcHooks/ABI/erc20.json'

export const EVM_WALLET_SIZE = 39;
export const SOLANA_WALLET_SIZE = 43;

export interface ParsedMultisigData {
    method: MethodIds,
    requiredCount?: number,
    owner?: string,
    newOwner?: string,
    value?: string
}


/**
 * 
 * @param index 
 * @param destination 
 * @param data the data begins with the method ID
 * @param executed 
 * @param confirmations 
 * @param Value 
 */
export const MultisigTxParser = async (
    {
        index, destination, data, executed,
        tags, txHashOrIndex,
        confirmations, Value, blockchain, parsedData, timestamp, contractAddress,
        contractOwnerAmount, contractThreshold, contractInternalThreshold, name, created_at, coins, budgets, contractOwners
    }:
        {
            index: number, destination: string, data: string, executed: boolean,
            tags: ITag[], txHashOrIndex: string,
            confirmations: string[], Value: BigNumber, blockchain: BlockchainType,
            parsedData: ParsedMultisigData | null, timestamp: number,
            contractAddress: string, contractOwnerAmount: number, contractThreshold: number,
            contractInternalThreshold: number, name: string, created_at: number,
            budgets: IBudget[], coins: Coins, contractOwners: string[]
        }
) => {

    let obj: ITransactionMultisig = {
        name,
        hashOrIndex: txHashOrIndex,
        destination: destination,
        isExecuted: executed,
        confirmations: confirmations,
        timestamp: timestamp,
        contractAddress: contractAddress,
        contractInternalThresholdAmount: contractInternalThreshold,
        contractThresholdAmount: contractThreshold,
        contractOwnerAmount: contractOwnerAmount,
        contractOwners: contractOwners,
        tags: tags.filter(s => s.transactions.some(s => s.address.toLowerCase() === contractAddress.toLowerCase() && s.hash === txHashOrIndex)),
        budget: budgets.find(s => s.txs.some(a => a.contractAddress.toLowerCase() === contractAddress.toLowerCase() && a.hashOrIndex === index.toString())) ?? null,
        tx: {
            address: destination,
            hash: txHashOrIndex,
            id: ERC20MethodIds.noInput,
            method: ERC20MethodIds.noInput,
        }
    }

    if (!parsedData) {
        const reader = await CeloInputReader(data, {
            tags: tags,
            blockchain: blockchain,
            Coins: coins,
            transaction: GenerateTransaction({
                contractAddress: destination,
                hash: txHashOrIndex,
                to: destination
            })
        })
        obj.tx = reader
    } else {
        if (parsedData.requiredCount) {
            obj.tx = {
                amount: parsedData!.requiredCount.toString(),
                hash: txHashOrIndex,
                id: ERC20MethodIds.changeThreshold,
                method: ERC20MethodIds.changeThreshold,
            }
        } else if (parsedData.newOwner) {
            obj.tx = {
                address: parsedData!.newOwner,
                hash: txHashOrIndex,
                id: ERC20MethodIds.addOwner,
                method: ERC20MethodIds.addOwner,
            }
        } else if (parsedData.owner && parsedData.value) {
            obj.tx = {
                to: parsedData!.owner,
                amount: parsedData!.value,
                coin: Object.values(coins).find(s => s.address.toLowerCase() === destination.toLowerCase()),
                hash: txHashOrIndex,
                id: ERC20MethodIds.transfer,
                method: ERC20MethodIds.transfer,
            }
        } else if (parsedData.owner) {
            obj.tx = {
                address: parsedData!.owner,
                hash: txHashOrIndex,
                id: ERC20MethodIds.removeOwner,
                method: ERC20MethodIds.removeOwner,
            }
        }
    }

    return obj;
}

export const parseSafeTransaction = (tx: GnosisTransaction, Coins: Coins, blockchainName: string, contractAddress: string, contractThreshold: number, tags: ITag[],) => {
    const coins: AltCoins[] = Object.values(Coins);
    const blockchain = Blockchains.find((b) => b.name === blockchainName);

    if (tx.dataDecoded === null && tx.value !== "0") {
        const coin = coins.find((c) => c.address.toLowerCase() === blockchain?.nativeToken.toLowerCase())!
        const parsedTx: IMultisigSafeTransaction = {
            type: ERC20MethodIds.transfer,
            data: tx.data,
            nonce: tx.nonce,
            executionDate: tx.executionDate,
            submissionDate: tx.submissionDate,
            modified: tx.modified,
            blockNumber: tx.blockNumber,
            transactionHash: tx.transactionHash,
            safeTxHash: tx.safeTxHash,
            executor: tx.executor,
            isExecuted: tx.isExecuted,
            isSuccessful: tx.isSuccessful,
            confirmations: tx.confirmations,
            signatures: tx.signatures,
            txType: tx.txType,
            settings: null,
            transfer: {
                dataDecoded: null,
                to: tx.to,
                coin: coin,
                value: tx.value,
            },
            contractAddress: contractAddress,
            contractThresholdAmount: contractThreshold,
            tags: tags.filter(s => s.transactions.some(s => s.address.toLowerCase() === contractAddress.toLowerCase() && s.hash === tx.safeTxHash)),
        }

        return parsedTx
    } else if (tx.dataDecoded !== null && tx.to === tx.safe) {
        let id;
        switch (tx.dataDecoded.method) {
            case "addOwnerWithThreshold":
                id = ERC20MethodIds.addOwner;
                break;
            case "changeThreshold":
                id = ERC20MethodIds.changeThreshold;
                break;
            case "rejectionTransaction":
                id = ERC20MethodIds.rejection;
                break;
            case "removeOwner":
                id = ERC20MethodIds.removeOwner;
                break;
            default:
                id = ERC20MethodIds.transfer;
                break;
        }
        const parsedTx: IMultisigSafeTransaction = {
            type: id,
            data: tx.data,
            nonce: tx.nonce,
            executionDate: tx.executionDate,
            submissionDate: tx.submissionDate,
            modified: tx.modified,
            blockNumber: tx.blockNumber,
            transactionHash: tx.transactionHash,
            safeTxHash: tx.safeTxHash,
            executor: tx.executor,
            isExecuted: tx.isExecuted,
            isSuccessful: tx.isSuccessful,
            confirmations: tx.confirmations,
            signatures: tx.signatures,
            txType: tx.txType,
            settings: {
                dataDecoded: tx.dataDecoded,
            },
            transfer: null,
            contractAddress: contractAddress,
            contractThresholdAmount: contractThreshold,
            tags: tags.filter(s => s.transactions.some(s => s.address.toLowerCase() === contractAddress.toLowerCase() && s.hash === tx.safeTxHash)),
        }
        return parsedTx
    } else if (tx.dataDecoded !== null && tx.to !== tx.safe) {
        const coin = coins.find((c) => c.address.toLowerCase() === tx.to.toLowerCase())!
        const parsedTx: IMultisigSafeTransaction = {
            type: ERC20MethodIds.transfer,
            data: tx.data,
            nonce: tx.nonce,
            executionDate: tx.executionDate,
            submissionDate: tx.submissionDate,
            modified: tx.modified,
            blockNumber: tx.blockNumber,
            transactionHash: tx.transactionHash,
            safeTxHash: tx.safeTxHash,
            executor: tx.executor,
            isExecuted: tx.isExecuted,
            isSuccessful: tx.isSuccessful,
            confirmations: tx.confirmations,
            signatures: tx.signatures,
            txType: tx.txType,
            settings: null,
            transfer: {
                dataDecoded: tx.dataDecoded,
                to: tx.dataDecoded.parameters[0].value,
                coin: coin,
                value: tx.dataDecoded.parameters[1].value,
            },
            contractAddress: contractAddress,
            contractThresholdAmount: contractThreshold,
            tags: tags.filter(s => s.transactions.some(s => s.address.toLowerCase() === contractAddress.toLowerCase() && s.hash === tx.safeTxHash)),
        }

        return parsedTx
    } else if (tx.dataDecoded === null && tx.to === tx.safe) {

        const parsedTx: IMultisigSafeTransaction = {
            type: ERC20MethodIds.rejection,
            data: tx.data,
            nonce: tx.nonce,
            executionDate: tx.executionDate,
            submissionDate: tx.submissionDate,
            modified: tx.modified,
            blockNumber: tx.blockNumber,
            transactionHash: tx.transactionHash,
            safeTxHash: tx.safeTxHash,
            executor: tx.executor,
            isExecuted: tx.isExecuted,
            isSuccessful: tx.isSuccessful,
            confirmations: tx.confirmations,
            signatures: tx.signatures,
            txType: tx.txType,
            settings: null,
            transfer: null,
            contractAddress: contractAddress,
            contractThresholdAmount: contractThreshold,
            tags: tags.filter(s => s.transactions.some(s => s.address.toLowerCase() === contractAddress.toLowerCase() && s.hash === tx.safeTxHash)),
        }

        return parsedTx
    }
}