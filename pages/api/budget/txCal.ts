import axios from "axios";
import { IBudget, IBudgetTX } from "firebaseConfig";
import { adminApp } from "firebaseConfig/admin";
import { GenerateTransaction, IBatchRequest, InputReader, ITransfer } from "hooks/useTransactionProcess";
import { AltCoins, Coins } from "types";
import { BlockchainType } from "types/blockchains";
import Web3 from 'web3'
import { AbiItem } from "web3-utils";
const CeloTerminal = import("rpcHooks/ABI/CeloTerminal.json")


export const TxCal = async (budget: IBudget, tx: IBudgetTX, blockchainType: BlockchainType) => {
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
        const multisigTx = (await contract.methods.transactions(index))
        const data = multisigTx.data
        const executed = multisigTx.executed

        const txRes = InputReader(data, {
            transaction: GenerateTransaction({
                tokenSymbol: coins.find(s => s.address.toLowerCase() === multisigTx.destination.toLowerCase())?.name,
            }), tags: [], Coins: coins.reduce<Coins>((a, c) => {
                a[c.symbol] = c;
                return a;
            }, {})
        })

        if (txRes) {
            if (txRes.method === "batchRequest") {
                const x = txRes as IBatchRequest
                if (executed == false) {
                    totalBudgetPending += x.payments.reduce((acc, curr) => acc + +web3.utils.fromWei(curr.amount, "ether"), 0)
                } else {
                    totalBudgetUsed += x.payments.reduce((acc, curr) => acc + +web3.utils.fromWei(curr.amount, "ether"), 0)
                }
            } else if (txRes.method === "transfer") {
                const x = txRes as ITransfer
                if (executed == false) {
                    totalBudgetPending += +web3.utils.fromWei(x.amount, "ether")
                    if (budget.token === x.coin.name) {
                        totalFirstCoinPending += +web3.utils.fromWei(x.amount, "ether")
                    } else if (budget.secondToken === x.coin.name) {
                        totalSecondCoinPending += +web3.utils.fromWei(x.amount, "ether")
                    }
                }
                else {
                    totalBudgetUsed += +web3.utils.fromWei(x.amount, "ether")
                    if (budget.token === x.coin.name) {
                        totalFirstCoinSpent += +web3.utils.fromWei(x.amount, "ether")
                    } else if (budget.secondToken === x.coin.name) {
                        totalSecondCoinSpent += +web3.utils.fromWei(x.amount, "ether")
                    }
                }
            }
        }
        // }

    } else if (tx.protocol === "Goki") {

    }


    return {
        totalBudgetPending,
        totalBudgetUsed,
        totalFirstCoinPending,
        totalSecondCoinPending,
        totalFirstCoinSpent,
        totalSecondCoinSpent,
    }
}