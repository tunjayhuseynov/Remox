import { createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";
import { IAccount } from "firebaseConfig";
import { ERC20MethodIds, IAutomationCancel, IFormattedTransaction } from "hooks/useTransactionProcess";
import { ITransactionMultisig } from "hooks/walletSDK/useMultisig";
import { BlockchainType } from "types/blockchains";
import { addTxToList, removeRecurringTask } from "../remoxData";
import { addRecurringTask } from '../remoxData'

interface IProps { account: IAccount, txHash: string, blockchain: BlockchainType, authId: string }
export const Add_Tx_To_TxList_Thunk = createAsyncThunk<IFormattedTransaction | ITransactionMultisig, IProps>("remoxData/add_tx_to_txlist_thunk", async ({ account, txHash, blockchain, authId }, api) => {
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
        result = await axios.get<IFormattedTransaction>("/api/transactions", {
            params: {
                addresses: account.address,
                txs: txHash,
                id: authId,
                blockchain: blockchain.name,
            }
        })
    }

    const data = result.data;

    if (('tx' in data && data.tx.method === ERC20MethodIds.automatedTransfer) || (!('tx' in data) && data.method === ERC20MethodIds.automatedTransfer)) {
        api.dispatch(addRecurringTask(data))
    }
    if (('tx' in data && data.tx.method === ERC20MethodIds.automatedCanceled) || (!('tx' in data) && data.method === ERC20MethodIds.automatedCanceled)) {
        const id = 'tx' in data ? (data.tx as IAutomationCancel).streamId : (data as IAutomationCancel).streamId;
        api.dispatch(removeRecurringTask({ streamId: id }))
    }

    api.dispatch(addTxToList({
        tx: data,
    }))

    return result.data;
})