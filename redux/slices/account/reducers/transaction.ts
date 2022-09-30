import { IFormattedTransaction } from "hooks/useTransactionProcess";
import { IMultisigSafeTransaction, ITransactionMultisig } from "hooks/walletSDK/useMultisig";
import { MultisigProviders } from "types/blockchains";
import { IRemoxData } from "../remoxData";

interface IConfirmationProp {
    contractAddress: string;
    txid: string;
    ownerAddress: string,
    provider: MultisigProviders;
}

export default {
    addConfirmation: (state: IRemoxData, action: { payload: IConfirmationProp }) => {
        state.cumulativeTransactions = state.cumulativeTransactions.map((tx) => {
            if (!("tx" in tx)) return tx;
            if (tx.contractAddress === action.payload.contractAddress && tx.hashOrIndex === action.payload.txid) {
                if (action.payload.provider === "Celo Terminal" && tx.confirmations.length + 1 >= tx.contractThresholdAmount) {
                    tx.isExecuted = true;
                }
                tx.confirmations.push(action.payload.ownerAddress);
            }
            return tx;
        });
    },
    removeConfirmation: (state: IRemoxData, action: { payload: IConfirmationProp }) => {
        state.cumulativeTransactions = state.cumulativeTransactions.filter(tx => !('tx' in tx && tx.contractAddress === action.payload.contractAddress && tx.hashOrIndex === action.payload.txid))
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