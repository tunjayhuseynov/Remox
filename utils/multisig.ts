import BigNumber from "bignumber.js"
import InputDataDecoder, { InputData } from "ethereum-input-data-decoder";
import { IBudget } from "firebaseConfig";
import { ERC20MethodIds } from "hooks/useTransactionProcess";
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
export const MultisigTxParser = (
    {
        index, destination, data, executed,
        tags, txHashOrIndex,
        confirmations, Value, blockchain, parsedData, timestamp, contractAddress,
        contractOwnerAmount, contractThreshold, contractInternalThreshold, name, created_at, coins, budgets
    }:
        {
            index: number, destination: string, data: string, executed: boolean,
            tags: ITag[], txHashOrIndex: string,
            confirmations: string[], Value: BigNumber, blockchain: BlockchainType,
            parsedData: ParsedMultisigData | null, timestamp: number,
            contractAddress: string, contractOwnerAmount: number, contractThreshold: number,
            contractInternalThreshold: number, name: string, created_at: number,
            budgets: IBudget[], coins: Coins
        }
) => {



    let size = 0;
    if (blockchain.name === 'solana') size = SOLANA_WALLET_SIZE
    else size = EVM_WALLET_SIZE
    // let from = blockchain === "solana" ? fromLamport : fromWei
    let obj: ITransactionMultisig = {
        name,
        hashOrIndex: txHashOrIndex,
        destination: destination,
        data: data,
        isExecuted: executed,
        confirmations: confirmations,
        value: Value.toString(),
        timestamp: timestamp,
        created_at: created_at,
        contractAddress: contractAddress,
        contractInternalThresholdAmount: contractInternalThreshold,
        contractThresholdAmount: contractThreshold,
        contractOwnerAmount: contractOwnerAmount,
        type: data.substring(0, 10),
        tags: tags.filter(s => s.transactions.some(s => s.address.toLowerCase() === contractAddress.toLowerCase() && s.hash === txHashOrIndex)),
        budget: budgets.find(s => s.txs.some(a => a.contractAddress.toLowerCase() === contractAddress.toLowerCase() && a.hashOrIndex === index.toString())) ?? null
    }

    const coin = Object.values(coins).find(s => s.address.toLowerCase() === destination.toLowerCase())

    if (coin) {
        let value = DecimalConverter(Value.toString(), coin.decimals)
        obj.value = value.toString()
    } else {
        obj.value = "0"
    }


    obj.id = index
    obj.requiredCount = ""
    obj.owner = ""
    obj.newOwner = ""
    obj.valueOfTransfer = ""

    if (!parsedData) {
        let method: string | null = null;
        let finalResult: InputData;
        const decoder = new InputDataDecoder(blockchain.multisigProviders[0].abi);
        const result = decoder.decodeData(data);
        if (!result.method) {
            const decoder = new InputDataDecoder(erc20);
            const result = decoder.decodeData(data);
            method = result.method
            finalResult = result
        } else {
            method = result.method
            finalResult = result
        }

        if (method) {
            obj.type = ERC20MethodIds[method as keyof typeof ERC20MethodIds] ?? method
            if (method == "changeInternalRequirement" || method == "changeRequirement") {
                obj.requiredCount = (finalResult.inputs[0] as BigNumber).toString()
            } else if (method == "addOwner") {
                obj.newOwner = finalResult.inputs[0] as string
            } else if (method == "removeOwner") {
                obj.owner = finalResult.inputs[0] as string
            } else if (method == "replaceOwner") {
                obj.owner = finalResult.inputs[0] as string
                obj.newOwner = finalResult.inputs[1] as string
            }
            else if (method == "transfer") {
                obj.valueOfTransfer = (finalResult.inputs[1] as BigNumber).toString()
                obj.owner = finalResult.inputs[0] as string
            }
        }
    } else {
        obj.type = parsedData.method
        obj.requiredCount = parsedData.requiredCount?.toString()
        obj.owner = parsedData.owner
        obj.newOwner = parsedData.newOwner
        obj.valueOfTransfer = parsedData.value
    }

    delete obj.data
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