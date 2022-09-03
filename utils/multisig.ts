import BigNumber from "bignumber.js"
import { MethodIds, MethodNames, ITransactionMultisig, IMultisigSafeTransaction } from "hooks/walletSDK/useMultisig"
import { ITag } from "pages/api/tags/index.api";
import blockchain from "redux/slices/account/reducers/blockchain";
import { AltCoins, Coins } from "types";
import { Blockchains, BlockchainType } from "types/blockchains";
import { GnosisConfirmation, GnosisDataDecoded, GnosisTransaction } from "types/GnosisSafe";
import { fromLamport, fromWei } from "./ray"

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
        contractOwnerAmount, contractThreshold, contractInternalThreshold, name, created_at
    }:
        {
            index: number, destination: string, data: string, executed: boolean,
            tags: ITag[], txHashOrIndex: string,
            confirmations: string[], Value: BigNumber, blockchain: BlockchainType["name"],
            parsedData: ParsedMultisigData | null, timestamp: number,
            contractAddress: string, contractOwnerAmount: number, contractThreshold: number,
            contractInternalThreshold: number, name: string, created_at: number
        }
) => {

    let size = 0;
    if (blockchain === 'solana') size = SOLANA_WALLET_SIZE
    else size = EVM_WALLET_SIZE
    let from = blockchain === "solana" ? fromLamport : fromWei
    let obj: ITransactionMultisig = {
        name,
        hashOrIndex: txHashOrIndex,
        destination: destination,
        data: data,
        executed: executed,
        confirmations: confirmations,
        value: Value.toString(),
        timestamp: timestamp,
        created_at: created_at,
        contractAddress: contractAddress,
        contractInternalThresholdAmount: contractInternalThreshold,
        contractOwnerAmount: contractOwnerAmount,
        contractThresholdAmount: contractThreshold,
        method: data.substring(0, 10),
        tags: tags.filter(s => s.transactions.some(s => s.address.toLowerCase() === contractAddress.toLowerCase()))
    }

    let value = from(Value)
    obj.value = value
    obj.id = index
    obj.requiredCount = ""
    obj.owner = ""
    obj.newOwner = ""
    obj.valueOfTransfer = ""

    if (!parsedData) {
        let methodId = data.slice(0, 10)
        obj.method = MethodIds[methodId as keyof typeof MethodIds]
        if (methodId == MethodNames.changeInternalRequirement || methodId == MethodNames.changeRequirement) {
            obj.requiredCount = data.slice(data.length - 2)
        } else {
            obj.owner = "0x" + data.slice(35, 35 + size);

            if (methodId == MethodNames.replaceOwner) obj.newOwner = "0x" + data.slice(98)
            if (methodId == MethodNames.transfer) {
                let hex = data.slice(100).replace(/^0+/, '')
                let value = parseInt(hex, 16)
                obj.valueOfTransfer = from(value)
            }
        }
    } else {
        obj.method = parsedData.method
        obj.requiredCount = parsedData.requiredCount?.toString()
        obj.owner = parsedData.owner
        obj.newOwner = parsedData.newOwner
        obj.valueOfTransfer = parsedData.value
    }

    delete obj.data
    return obj;
}

export const parseSafeTransaction = (tx: GnosisTransaction, Coins: Coins, blockchainName: string) => {
    const coins: AltCoins[] = Object.values(Coins);
    const blockchain = Blockchains.find((b) => b.name === blockchainName);

    if(tx.dataDecoded === null && tx.value !== "0") {  
        const coin = coins.find((c) => c.address.toLowerCase() === blockchain?.nativeToken.toLowerCase())!
        const parsedTx : IMultisigSafeTransaction = {
            type: "transfer",
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
            }
}

        return parsedTx
    } else if(tx.dataDecoded !== null && tx.to === tx.safe ){
        const parsedTx : IMultisigSafeTransaction = {
            type: tx.dataDecoded.method,
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

        }
        return parsedTx
    } else if (tx.dataDecoded !== null && tx.to !== tx.safe){
        const coin = coins.find((c) => c.address.toLowerCase() === tx.to.toLowerCase())!
        const parsedTx : IMultisigSafeTransaction  = {
            type: "transfer",
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
        }

        return parsedTx
    }  else if(tx.dataDecoded === null && tx.to === tx.safe) {

        const parsedTx : IMultisigSafeTransaction  = {
            type: "rejectionTransaction",
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
        }

        return parsedTx
    }
}