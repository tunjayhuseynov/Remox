import { createAsyncThunk, nanoid } from "@reduxjs/toolkit";
import axios from "axios";
import { IAccount } from "firebaseConfig";
import { ERCMethodIds, IAutomationCancel, IFormattedTransaction } from "hooks/useTransactionProcess";
import { ITransactionMultisig } from "hooks/walletSDK/useMultisig";
import { ITag } from "pages/api/tags/index.api";
import { BlockchainType } from "types/blockchains";
import { addTxToList, removeRecurringTask } from "../remoxData";
import { addRecurringTask } from '../remoxData'
import { AddTransactionToTag } from "./tags";

interface IProps { account: IAccount, txHash: string, blockchain: BlockchainType, authId: string, tags?: ITag[] }
export const Add_Tx_To_TxList_Thunk = createAsyncThunk<IFormattedTransaction | ITransactionMultisig, IProps>("remoxData/add_tx_to_txlist_thunk", async ({ account, txHash, blockchain, authId, tags }, api) => {
    let result;
    if (account.signerType === "multi") {
        result = await axios.get<ITransactionMultisig>("/api/multisig/tx", {
            params: {
                blockchain: blockchain.name,
                id: authId,
                index: txHash,
                address: account.address,
                name: account.name,
                providerName: account.provider
            }
        })
    } else {
        result = await axios.get<IFormattedTransaction[]>("/api/transactions", {
            params: {
                addresses: [account.address],
                txs: [txHash],
                id: authId,
                blockchain: blockchain.name,
            }
        })
    }

    const data = 'tx' in result.data ? result.data : result.data[0];

    if (('tx' in data && data.tx.method === ERCMethodIds.automatedTransfer) || (!('tx' in data) && data.method === ERCMethodIds.automatedTransfer)) {
        api.dispatch(addRecurringTask(data))
    }
    if (('tx' in data && data.tx.method === ERCMethodIds.automatedCanceled) || (!('tx' in data) && data.method === ERCMethodIds.automatedCanceled)) {
        const id = 'tx' in data ? (data.tx as IAutomationCancel).streamId : (data as IAutomationCancel).streamId;
        api.dispatch(removeRecurringTask({ streamId: id }))
    }

    if (tags && tags.length > 0) {
        for (const tag of tags) {
            const obj = {
                id: nanoid(),
                address: account.address,
                hash: txHash,
                blockchain: account.blockchain,
                contractType: account.signerType,
                provider: account.provider
            }
            data.tags.find(s => s.id === tag.id)?.transactions.push(obj) || data.tags.push({
                color: tag.color,
                id: tag.id,
                isDefault: tag.isDefault,
                name: tag.name,
                transactions: [obj]
            })

            await api.dispatch(
                AddTransactionToTag({
                    tagId: tag.id,
                    transaction: obj,
                })
            ).unwrap();
        }
    }

    api.dispatch(addTxToList({
        tx: data,
    }))

    return data;
})