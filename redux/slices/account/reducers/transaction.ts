import { IFormattedTransaction } from "hooks/useTransactionProcess";
import { IMultisigSafeTransaction, ITransactionMultisig } from "hooks/walletSDK/useMultisig";
import { MultisigProviders } from "types/blockchains";
import { IRemoxData } from "../remoxData";

interface IConfirmationProp {
    contractAddress: string;
    txid: string;
    ownerAddress: string,
    provider: MultisigProviders;
    rejection: boolean;
    rejectionHash: string | null;
}

export default {
    addConfirmation: (state: IRemoxData, action: { payload: IConfirmationProp }) => {
        state.cumulativeTransactions = state.cumulativeTransactions.map((tx) => {
            if (!("tx" in tx)) return tx;
            if (!action.payload.rejection && tx.contractAddress === action.payload.contractAddress && tx.hashOrIndex === action.payload.txid) {
                if (action.payload.provider === "Celo Terminal" && tx.confirmations.length + 1 >= tx.contractThresholdAmount) {
                    tx.isExecuted = true;
                }
                tx.confirmations.push(action.payload.ownerAddress);
            }
            if (action.payload.rejection && tx.rejection && tx.contractAddress === action.payload.contractAddress && tx.rejection?.safeTxHash === action.payload.txid) {
                tx.rejection.confirmations.push({
                    owner: action.payload.ownerAddress,
                    signature: "",
                    signatureType: "",
                    submissionDate: new Date().getTime(),
                    transactionHash: "",
                });
            }
            return tx;
        });
    },
    removeConfirmation: (state: IRemoxData, action: { payload: IConfirmationProp }) => {
        if (action.payload.provider === "Celo Terminal") {
            state.cumulativeTransactions = state.cumulativeTransactions.filter(tx => !('tx' in tx && tx.contractAddress === action.payload.contractAddress && tx.hashOrIndex === action.payload.txid))
        } else if (action.payload.provider === "GnosisSafe") {
            state.cumulativeTransactions = state.cumulativeTransactions.map((tx) => {
                if (!("tx" in tx)) return tx;
                if (tx.contractAddress === action.payload.contractAddress && tx.hashOrIndex === action.payload.txid && action.payload.rejectionHash) {
                    if (!tx.rejection) {
                        tx.rejection = {
                            isExecuted: false,
                            baseGas: 0,
                            blockNumber: 0,
                            data: "",
                            confirmationsRequired: 0,
                            confirmations: [
                                {
                                    owner: action.payload.ownerAddress,
                                    signature: "",
                                    signatureType: "",
                                    submissionDate: new Date().getTime(),
                                    transactionHash: "",
                                }
                            ],
                            safeTxHash: action.payload.rejectionHash,
                            dataDecoded: null,
                            ethGasPrice: null,
                            gasPrice: "0",
                            executionDate: null,
                            executor: null,
                            gasToken: "0",
                            fee: null,
                            gasUsed: null,
                            isSuccessful: null,
                            maxFeePerGas: null,
                            maxPriorityFeePerGas: null,
                            modified: null,
                            nonce: 0,
                            operation: 0,
                            origin: null,
                            refundReceiver: "",
                            safe: "",
                            safeTxGas: 0,
                            signatures: "",
                            submissionDate: new Date().toLocaleDateString(),
                            to: action.payload.contractAddress,
                            transactionHash: "",
                            trusted: true,
                            txType: "",
                            value: "0",
                        }
                    }
                }

                return tx;
            })
        }
    },
    changeToExecuted: (state: IRemoxData, action: { payload: IConfirmationProp }) => {
        state.cumulativeTransactions = state.cumulativeTransactions.map((tx) => {
            if (!("tx" in tx)) return tx;
            if (!action.payload.rejection && tx.contractAddress === action.payload.contractAddress && tx.hashOrIndex === action.payload.txid) {
                tx.isExecuted = true;
            }
            if (action.payload.rejection && tx.rejection && tx.contractAddress === action.payload.contractAddress && tx.rejection?.safeTxHash === action.payload.txid) {
                tx.rejection.isExecuted = true
            }
            return tx;
        });
    },

    addTxToList: (state: IRemoxData, action: { payload: { tx: IFormattedTransaction | ITransactionMultisig } }) => {
        state.cumulativeTransactions = [action.payload.tx, ...state.cumulativeTransactions]
    }
}