import { createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";
import { IAccount } from "firebaseConfig";
import { IFormattedTransaction } from "hooks/useTransactionProcess";
import { ITransactionMultisig } from "hooks/walletSDK/useMultisig";
import { BlockchainType } from "types/blockchains";
import { addTxToList } from "../remoxData";

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
                Skip: 0,
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
            }
        })
    }

    api.dispatch(addTxToList({
        tx: result.data,
    }))

    return result.data;
})