import BigNumber from "bignumber.js"
import InputDataDecoder, { InputData } from "ethereum-input-data-decoder";
import { IBudget } from "firebaseConfig";
import CeloInputReader, { ERCMethodIds as ERCMethodIds, GenerateTransaction } from "hooks/useTransactionProcess";
import { MethodIds, MethodNames, ITransactionMultisig, IMultisigSafeTransaction } from "hooks/walletSDK/useMultisig"
import { ITag } from "pages/api/tags/index.api";
import { AltCoins, Coins } from "types";
import { Blockchains, BlockchainType, MultisigProviders } from "types/blockchains";
import { GnosisConfirmation, GnosisDataDecoded, GnosisTransaction } from "types/GnosisSafe";
import { DecimalConverter } from "./api";
import erc20 from 'rpcHooks/ABI/ERC.json'
import { IBudgetORM } from "pages/api/budget/index.api";
import { GetTime } from "utils";

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
        contractOwnerAmount, contractThreshold, contractInternalThreshold, name, created_at, coins, budgets, contractOwners, provider
    }:
        {
            index: number, destination: string, data: string, executed: boolean,
            tags: ITag[], txHashOrIndex: string,
            confirmations: string[], Value: BigNumber, blockchain: BlockchainType,
            parsedData: ParsedMultisigData | null, timestamp: number,
            contractAddress: string, contractOwnerAmount: number, contractThreshold: number,
            contractInternalThreshold: number, name: string, created_at: number,
            budgets: IBudgetORM[], coins: Coins, contractOwners: string[], provider: MultisigProviders
        }
) => {

    let obj: ITransactionMultisig = {
        name,
        hashOrIndex: txHashOrIndex,
        fee: null,
        destination: destination,
        isExecuted: executed,
        confirmations: confirmations,
        provider: 'Celo Terminal',
        timestamp: timestamp,
        contractAddress: contractAddress,
        contractInternalThresholdAmount: contractInternalThreshold,
        contractThresholdAmount: contractThreshold,
        contractOwnerAmount: contractOwnerAmount,
        contractOwners: contractOwners,
        tags: tags.filter(s => s.transactions.find(s => s.address.toLowerCase() === contractAddress.toLowerCase() && s.hash.toLowerCase() === txHashOrIndex.toLowerCase())),
        budget: budgets.find(s => s.txs.some(a => a.contractAddress.toLowerCase() === contractAddress.toLowerCase() && a.hashOrIndex.toLowerCase() === index.toString().toLowerCase())) ?? null,
        tx: {
            to: destination,
            hash: txHashOrIndex,
            id: ERCMethodIds.noInput,
            method: ERCMethodIds.noInput,
        }
    }

    if (!parsedData) {
        const reader = await CeloInputReader({
            input: data,
            tags: tags,
            blockchain: blockchain,
            Coins: coins,
            transaction: GenerateTransaction({
                contractAddress: destination,
                hash: txHashOrIndex,
                to: destination
            }),
            address: contractAddress,
            provider: provider,
            showMultiOut: false
        })
        obj.tx = reader as any
    } else {
        if (parsedData.requiredCount) {
            obj.tx = {
                amount: parsedData!.requiredCount.toString(),
                hash: txHashOrIndex,
                id: ERCMethodIds.changeThreshold,
                method: ERCMethodIds.changeThreshold,
            }
        } else if (parsedData.newOwner) {
            obj.tx = {
                to: parsedData!.newOwner,
                hash: txHashOrIndex,
                id: ERCMethodIds.addOwner,
                method: ERCMethodIds.addOwner,
            }
        } else if (parsedData.owner && parsedData.value) {
            obj.tx = {
                to: parsedData!.owner,
                amount: parsedData!.value,
                coin: Object.values(coins).find(s => s.address.toLowerCase() === destination.toLowerCase()),
                hash: txHashOrIndex,
                id: ERCMethodIds.transfer,
                method: ERCMethodIds.transfer,
            }
        } else if (parsedData.owner) {
            obj.tx = {
                to: parsedData!.owner,
                hash: txHashOrIndex,
                id: ERCMethodIds.removeOwner,
                method: ERCMethodIds.removeOwner,
            }
        }
    }

    return obj;
}

export const parseSafeTransaction = async (tx: GnosisTransaction, txs: GnosisTransaction[], Coins: Coins, blockchainName: string, contractAddress: string, contractThreshold: number, owners: string[], tags: ITag[], nonce: number) => {
    const blockchain = Blockchains.find((b) => b.name === blockchainName);
    if (!blockchain) throw new Error("Blockchain not found");
    let all = txs.filter(s => tx.nonce === s.nonce)
    let mainTx = all.filter(s => s.data)?.[0]

    let rejection: GnosisTransaction | null = null

    if (all.length > 1) {
        const rejectIndex = all.findIndex(s => s.safe === s.to)
        if (rejectIndex !== -1) {
            txs = txs.filter(s => s.nonce !== tx.nonce && s.safe === s.to)
            rejection = all[rejectIndex]
        }
    }

    let reader: any[] = [];

    if (tx.dataDecoded && tx.dataDecoded.method === "multiSend") {
        const values = tx.dataDecoded.parameters
        if (values.length > 0) {
            const decoded = values[0].valueDecoded;
            for (const data of decoded) {
                let parsed = await CeloInputReader({
                    input: data.data ?? "",
                    address: contractAddress,
                    blockchain: blockchain,
                    Coins: Coins,
                    provider: "GnosisSafe",
                    showMultiOut: false,
                    tags: tags,
                    isExecuted: mainTx.isExecuted,
                    transaction: GenerateTransaction({
                        hash: mainTx.transactionHash ?? mainTx.safeTxHash,
                        to: data.to,
                        contractAddress: contractAddress,
                        from: contractAddress,
                        value: data.value,
                    }),
                }) as any
                if (parsed && 'method' in parsed) {
                    reader.push(parsed)
                }
            }
        }
    } else {
        let parsed = await CeloInputReader({
            input: mainTx.data ?? "",
            address: contractAddress,
            blockchain: blockchain,
            Coins: Coins,
            provider: "GnosisSafe",
            showMultiOut: false,
            tags: tags,
            isExecuted: mainTx.isExecuted,
            transaction: GenerateTransaction({
                hash: mainTx.transactionHash ?? mainTx.safeTxHash,
                to: mainTx.to,
                contractAddress: contractAddress,
                from: contractAddress,
                value: mainTx.value,
            }),
        }) as any
        if (parsed && 'method' in parsed) {
            reader.push(parsed)
        }
    }

    const transaction: ITransactionMultisig = {
        budget: null,
        confirmations: mainTx.confirmations.map(s => s.owner),
        contractAddress: contractAddress,
        contractInternalThresholdAmount: contractThreshold,
        contractThresholdAmount: contractThreshold,
        contractOwnerAmount: mainTx.confirmations.length,
        fee: mainTx.fee,
        contractOwners: owners,
        nonce: mainTx.nonce,
        firstNonce: nonce,
        destination: mainTx.to,
        hashOrIndex: mainTx.safeTxHash,
        txHash: mainTx.transactionHash ?? undefined,
        isExecuted: mainTx.isExecuted,
        timestamp: mainTx.submissionDate ? GetTime(new Date(mainTx.submissionDate)) : GetTime(),
        executedAt: mainTx.executionDate ? GetTime(new Date(mainTx.executionDate)) : undefined,
        rejection: rejection,
        provider: "GnosisSafe",
        name: "GnosisSafe",
        tags: tags.filter(s => s.transactions.find(s => s.address.toLowerCase() === contractAddress.toLowerCase() && s.hash.toLowerCase() === mainTx.safeTxHash.toLowerCase())),
        tx: reader.length === 1 ? 'method' in reader[0] ? reader[0] : {
            method: ERCMethodIds.unknown,
            id: ERCMethodIds.unknown,
        } : reader.length > 1 ? {
            method: ERCMethodIds.batchRequest,
            id: ERCMethodIds.batchRequest,
            payments: reader.filter(s => s?.method),
            tags: reader?.map(s => s?.tags)?.flat()?.filter(s => s),
        } : {
            method: ERCMethodIds.unknown,
            id: ERCMethodIds.unknown,
        }
    }

    return transaction;
}