import BigNumber from "bignumber.js"
import { IBudget } from "firebaseConfig";
import { MethodIds, MethodNames, ITransactionMultisig } from "hooks/walletSDK/useMultisig"
import { ITag } from "pages/api/tags/index.api";
import { AltCoins, Coins } from "types";
import { Blockchains, BlockchainType } from "types/blockchains";
import { GnosisConfirmation, GnosisDataDecoded, GnosisTransaction, GnosisTransactionTransfers } from "types/GnosisSafe";
import { DecimalConverter } from "./api";

export const EVM_WALLET_SIZE = 39;
export const SOLANA_WALLET_SIZE = 43;

export interface ParsedMultisigData {
    method: MethodIds,
    requiredCount?: number,
    owner?: string,
    newOwner?: string,
    value?: string
}
export interface basedParsedSafeTx {
    type: "transfer" | "settings"
    safe: string,
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
    confirmations: GnosisConfirmation[],
    signatures: string,
    txType: string
    transfers: GnosisTransactionTransfers[] | [],

}

export interface GnosisSettingsTx extends basedParsedSafeTx {
    dataDecoded: GnosisDataDecoded,
}

export interface GnosisTransferTx extends basedParsedSafeTx {
    dataDecoded: GnosisDataDecoded | null,
    to: string,
    coin: AltCoins
    value: string | number | null,
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
            confirmations: string[], Value: BigNumber, blockchain: BlockchainType["name"],
            parsedData: ParsedMultisigData | null, timestamp: number,
            contractAddress: string, contractOwnerAmount: number, contractThreshold: number,
            contractInternalThreshold: number, name: string, created_at: number,
            budgets: IBudget[], coins: Coins
        }
) => {

    let size = 0;
    if (blockchain === 'solana') size = SOLANA_WALLET_SIZE
    else size = EVM_WALLET_SIZE
    // let from = blockchain === "solana" ? fromLamport : fromWei
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
        tags: tags.filter(s => s.transactions.some(s => s.address.toLowerCase() === contractAddress.toLowerCase())),
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
                if (coin) {
                    obj.valueOfTransfer = DecimalConverter(value.toString(), coin.decimals).toString()
                }
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

    if (tx.dataDecoded === null && tx.value !== null) {
        const coin = coins.find((c) => c.address.toLowerCase() === blockchain?.nativeToken.toLowerCase())!
        const parsedTx: GnosisTransferTx = {
            type: "transfer",
            safe: tx.safe,
            value: (+tx.value / 10 ** coin.decimals).toString(),
            data: tx.data,
            nonce: tx.nonce,
            to: tx.to,
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
            dataDecoded: tx.dataDecoded,
            coin: coin,
            transfers: tx.transfers
        }

        return parsedTx
    } else if (tx.dataDecoded !== null && tx.to === tx.safe) {
        const parsedTx: GnosisSettingsTx = {
            type: "settings",
            safe: tx.safe,
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
            dataDecoded: tx.dataDecoded,
            transfers: tx.transfers,
        }
        return parsedTx
    }
    else if (tx.dataDecoded !== null && tx.to !== tx.safe && tx.transfers.length === 0) {
        const coin = coins.find((c) => c.address.toLowerCase() === tx.to.toLowerCase())!


        const parsedTx: GnosisTransferTx = {
            type: "transfer",
            safe: tx.safe,
            data: tx.data,
            to: tx.dataDecoded.parameters[0].value,
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
            dataDecoded: tx.dataDecoded,
            value: tx.dataDecoded.parameters[1].value,
            coin: coin,
            transfers: []
        }

        return parsedTx
    }
}