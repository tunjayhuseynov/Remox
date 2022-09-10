import { IFormattedTransaction } from "hooks/useTransactionProcess";
import { IMultisigSafeTransaction, ITransactionMultisig } from "hooks/walletSDK/useMultisig";
import { IRemoxData } from "../remoxData";

interface IConfirmationProp {
    contractAddress: string;
    txid: string;
    ownerAddress: string
}

export default {
    addConfirmation: (state: IRemoxData, action: { payload: IConfirmationProp }) => {
        state.cumulativeTransactions = state.cumulativeTransactions.map((tx) => {
            if (!("tx" in tx)) return tx;
            if (tx.contractAddress === action.payload.contractAddress && tx.hashOrIndex === action.payload.txid) {
                tx.confirmations.push(action.payload.ownerAddress);
            }
            return tx;
        });
    },
    changeToExecuted: (state: IRemoxData, action: { payload: IConfirmationProp }) => {
        state.cumulativeTransactions = state.cumulativeTransactions.map((tx) => {
            if (!("tx" in tx)) return tx;
            if (tx.contractAddress === action.payload.contractAddress && tx.hashOrIndex === action.payload.txid) {
                tx.isExecuted = true;
            }
            return tx;
        });
    },
    addTxToList: (state: IRemoxData, action: { payload: { tx: IFormattedTransaction | ITransactionMultisig } }) => {
        state.cumulativeTransactions = [action.payload.tx, ...state.cumulativeTransactions]
    }
}