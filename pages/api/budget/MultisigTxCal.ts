import axios from "axios";
import axiosRetry from "axios-retry";
import { IBudget, IBudgetTX } from "firebaseConfig";
import { adminApp } from "firebaseConfig/admin";
import { IBatchRequest, ITransfer, ERC20MethodIds, IFormattedTransaction } from "hooks/useTransactionProcess";
import { ITransactionMultisig } from "hooks/walletSDK/useMultisig";
import { AltCoins, Coins } from "types";
import { BlockchainType } from "types/blockchains";
import { BASE_URL, DecimalConverter } from "utils/api";


export const MultisigTxCal = async (budget: IBudget, tx: Pick<IBudgetTX, "hashOrIndex" | "protocol" | "contractAddress">, blockchainType: BlockchainType, userId: string) => {
    try {
        let totalFirstCoinPending = 0, totalSecondCoinPending = 0;
        let totalFirstCoinSpent = 0, totalSecondCoinSpent = 0;

        const CoinsRes = await adminApp.firestore().collection(blockchainType.currencyCollectionName).get()
        const coins = CoinsRes.docs.map(s => s.data() as AltCoins)

        if (tx.protocol === "Celo Terminal" || tx.protocol === "GnosisSafe") {
            let txRes: IFormattedTransaction | null = null;
            const { data } = await axios.get<ITransactionMultisig>(BASE_URL + "/api/multisig/tx", {
                params: {
                    blockchain: blockchainType.name,
                    id: userId,
                    index: tx.hashOrIndex,
                    address: tx.contractAddress,
                    name: tx.protocol,
                    providerName: tx.protocol
                }
            })
            axiosRetry(axios, { retries: 10 });

            txRes = data.tx as IFormattedTransaction;
        
            if (txRes) {
                if (txRes.method === ERC20MethodIds.batchRequest || txRes.method === ERC20MethodIds.automatedBatchRequest) {
                    const x = txRes as unknown as IBatchRequest
                    if (data.rejection?.isExecuted === false || data.isExecuted == false) {
                        x.payments.forEach(p => {
                            if (p.coin.symbol === budget.token) {
                                totalFirstCoinPending += DecimalConverter(p.amount, p.coin.decimals)
                            }
                            if (p.coin.symbol === budget.secondToken) {
                                totalSecondCoinPending += DecimalConverter(p.amount, p.coin.decimals)
                            }
                        })
                    } else {
                        x.payments.forEach(p => {
                            if (p.coin.symbol === budget.token) {
                                totalFirstCoinSpent += DecimalConverter(p.amount, p.coin.decimals)
                            }
                            if (p.coin.symbol === budget.secondToken) {
                                totalSecondCoinSpent += DecimalConverter(p.amount, p.coin.decimals)
                            }
                        })
                    }
                } else if (txRes.method === ERC20MethodIds.transfer || txRes.method === ERC20MethodIds.transferFrom || txRes.method === ERC20MethodIds.automatedTransfer || txRes.method === ERC20MethodIds.deposit) {
                    const x = txRes as unknown as ITransfer
                    if (data.rejection?.isExecuted === false || data.isExecuted == false) {
                        if (budget.token === x.coin.symbol) {
                            totalFirstCoinPending += DecimalConverter(x.amount, x.coin.decimals)
                        } else if (budget.secondToken === x.coin.symbol) {
                            totalSecondCoinPending += DecimalConverter(x.amount, x.coin.decimals)
                        }
                    } else {
                        if (budget.token === x.coin.symbol) {
                            totalFirstCoinSpent += DecimalConverter(x.amount, x.coin.decimals)
                        } else if (budget.secondToken === x.coin.symbol) {
                            totalSecondCoinSpent += DecimalConverter(x.amount, x.coin.decimals)
                        }
                    }
                }
            }

        } else if (tx.protocol === "Goki") {

        }


        return {
            totalFirstCoinPending,
            totalSecondCoinPending,
            totalFirstCoinSpent,
            totalSecondCoinSpent,
            budgetTx: tx
        }
    } catch (error) {
        console.log(error)
        throw new Error(error as any)
    }
}