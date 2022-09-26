import BigNumber from "bignumber.js"
import InputDataDecoder, { InputData } from "ethereum-input-data-decoder";
import { IBudget } from "firebaseConfig";
import { CeloInputReader, ERC20MethodIds, GenerateTransaction } from "hooks/useTransactionProcess";
import { MethodIds, MethodNames, ITransactionMultisig, IMultisigSafeTransaction } from "hooks/walletSDK/useMultisig"
import { ITag } from "pages/api/tags/index.api";
import { AltCoins, Coins } from "types";
import { Blockchains, BlockchainType, MultisigProviders } from "types/blockchains";
import { GnosisConfirmation, GnosisDataDecoded, GnosisTransaction } from "types/GnosisSafe";
import { DecimalConverter } from "./api";
import erc20 from 'rpcHooks/ABI/erc20.json'
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
            }),
            address: contractAddress,
            provider: provider
        })
        obj.tx = reader as any
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
                to: parsedData!.newOwner,
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
                to: parsedData!.owner,
                hash: txHashOrIndex,
                id: ERC20MethodIds.removeOwner,
                method: ERC20MethodIds.removeOwner,
            }
        }
    }

    return obj;
}

export const parseSafeTransaction = async (tx: GnosisTransaction, Coins: Coins, blockchainName: string, contractAddress: string, contractThreshold: number, owners: string[], tags: ITag[],) => {
    const blockchain = Blockchains.find((b) => b.name === blockchainName);
    if (!blockchain) throw new Error("Blockchain not found");
    const transaction: ITransactionMultisig = {
        budget: null,
        confirmations: tx.confirmations.map(s => s.owner),
        contractAddress: contractAddress,
        contractInternalThresholdAmount: contractThreshold,
        contractThresholdAmount: contractThreshold,
        contractOwnerAmount: tx.confirmations.length,
        contractOwners: owners,
        destination: tx.to,
        hashOrIndex: tx.safeTxHash,
        txHash: tx.transactionHash ?? undefined,
        isExecuted: tx.isExecuted,
        timestamp: tx.submissionDate ? GetTime(new Date(tx.submissionDate)) : GetTime(),
        executedAt: tx.executionDate ? GetTime(new Date(tx.executionDate)) : undefined,
        provider: "GnosisSafe",
        name: "GnosisSafe",
        tags: tags.filter(s => s.transactions.find(s => s.address.toLowerCase() === contractAddress.toLowerCase() && s.hash.toLowerCase() === tx.safeTxHash.toLowerCase())),
        tx: await CeloInputReader(tx.data ?? "", {
            address: contractAddress,
            blockchain: blockchain,
            Coins: Coins,
            provider: "GnosisSafe",
            tags: tags,
            transaction: GenerateTransaction({
                hash: tx.safeTxHash,
                to: tx.to,
                contractAddress: contractAddress,
                from: contractAddress,
                value: tx.value,
            }),
        }) as any
    }

    return transaction;
}