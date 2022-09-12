import { IBudget, IBudgetTX } from "firebaseConfig";
import { adminApp } from "firebaseConfig/admin";
import { GenerateTransaction, IBatchRequest, CeloInputReader, ITransfer, ERC20MethodIds } from "hooks/useTransactionProcess";
import { AltCoins, Coins } from "types";
import { BlockchainType } from "types/blockchains";
import { DecimalConverter } from "utils/api";
import Web3 from 'web3'
import { AbiItem } from "web3-utils";
const CeloTerminal = import("rpcHooks/ABI/CeloTerminal.json")


export const MultisigTxCal = async (budget: IBudget, tx: Pick<IBudgetTX, "hashOrIndex" | "protocol" | "contractAddress">, blockchainType: BlockchainType, coin?: string, secondCoin?: string) => {
    try {
        let totalBudgetPending = 0, totalBudgetUsed = 0;
        let totalFirstCoinPending = 0, totalSecondCoinPending = 0;
        let totalFirstCoinSpent = 0, totalSecondCoinSpent = 0;

        const CoinsRes = await adminApp.firestore().collection(blockchainType.currencyCollectionName).get()
        const coins = CoinsRes.docs.map(s => s.data() as AltCoins)

        if (tx.protocol === "Celo Terminal") {
            const celoTerminal = await CeloTerminal;
            // const transaction = (await axios.get(blockchainType.rpcUrl + "/api?module=transaction&action=gettxinfo&txhash=" + tx.hash)).data;
            // const logs = transaction?.result?.logs
            // if (logs && logs.length > 0) {
            const web3 = new Web3(blockchainType.rpcUrl);
            // const hexIndex = logs[0].topics[1]
            const index = tx.hashOrIndex //web3.utils.hexToNumber(hexIndex)
            const contract = new web3.eth.Contract(celoTerminal.abi as AbiItem[], tx.contractAddress)
            const multisigTx = (await contract.methods.transactions(index).call())
            const data = multisigTx.data
            const executed = multisigTx.executed

            const txRes = await CeloInputReader(data, {
                blockchain: blockchainType,
                transaction: GenerateTransaction({
                    to: multisigTx.destination,
                    contractAddress: multisigTx.destination,
                }),
                tags: [],
                Coins: coins.reduce<Coins>((a, c) => {
                    a[c.symbol] = c;
                    return a;
                }, {}),
                address: tx.contractAddress,
            })

            if (txRes) {
                if (txRes.method === ERC20MethodIds.batchRequest || txRes.method === ERC20MethodIds.automatedBatchRequest) {
                    const x = txRes as unknown as IBatchRequest
                    if (executed == false) {
                        totalBudgetPending += x.payments.reduce((acc, curr) => {
                            if (coin && curr.coin.symbol !== coin) return acc;
                            if (secondCoin && curr.coin.symbol !== secondCoin) return acc;
                            return acc + (DecimalConverter(curr.amount, curr.coin.decimals) * curr.coin.priceUSD);
                        }, 0)
                    } else {
                        totalBudgetUsed += x.payments.reduce((acc, curr) => {
                            if (coin && curr.coin.symbol !== coin) return acc;
                            if (secondCoin && curr.coin.symbol !== secondCoin) return acc;
                            return acc + (DecimalConverter(curr.amount, curr.coin.decimals) * curr.coin.priceUSD);
                        }, 0)
                    }
                } else if (txRes.method === ERC20MethodIds.transfer || txRes.method === ERC20MethodIds.transferFrom || txRes.method === ERC20MethodIds.automatedTransfer) {
                    const x = txRes as unknown as ITransfer
                    if (executed == false) {
                        if (budget.token === x.coin.symbol || budget.secondToken === x.coin.symbol) {
                            totalBudgetPending += (DecimalConverter(x.amount, x.coin.decimals) * x.coin.priceUSD)
                        }
                        if (budget.token === x.coin.symbol) {
                            totalFirstCoinPending += DecimalConverter(x.amount, x.coin.decimals)
                        } else if (budget.secondToken === x.coin.symbol) {
                            totalSecondCoinPending += DecimalConverter(x.amount, x.coin.decimals)
                        }
                    } else {
                        if (budget.token === x.coin.symbol || budget.secondToken === x.coin.symbol) {
                            totalBudgetUsed += (DecimalConverter(x.amount, x.coin.decimals) * x.coin.priceUSD)
                        }
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
            totalBudgetPending,
            totalBudgetUsed,
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