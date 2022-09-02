import type { TransactionInstruction } from "@solana/web3.js";
import { NextApiRequest, NextApiResponse } from "next";
import { BatchPay, GenerateSwapData, GenerateTx } from "./_celo";
import { solanaInstructions } from "./_solana";
import { Contracts } from "rpcHooks/Contracts/Contracts";
import { AltCoins, Coins } from "types";
import { Blockchains, BlockchainType } from "types/blockchains";
import { adminApp } from "firebaseConfig/admin";

export interface IPaymentInput {
    coin: string,
    amount: number,
    recipient: string,
    comment?: string,
    from?: string
}

export interface ISwap {
    account: string,
    inputCoin: AltCoins,
    outputCoin: AltCoins,
    amount: string,
    slippage: string,
    deadline: number
}

export interface IPaymentDataBody {
    accountId: string,
    blockchain: BlockchainType["name"],
    executer: string,
    requests: IPaymentInput[],
    swap: ISwap | null,
    isStreaming: boolean,
    startTime: number | null,
    endTime: number | null
}

export interface ISendTx {
    data: string | TransactionInstruction[],
    destination: string | null
}

export default async function Send(
    req: NextApiRequest,
    res: NextApiResponse<ISendTx>
) {
    try {
        if (req.method !== 'POST') throw new Error('Only POST method is allowed')
        const { blockchain, requests, executer, isStreaming, endTime, startTime, swap, accountId } = req.body as IPaymentDataBody
        if (!blockchain) throw new Error("blockchain is required");
        if (requests.length === 0 && !swap) throw new Error("requests is required");

        const Blockchain = Blockchains.find(s => s.name === blockchain)!
        const CoinsReq = await adminApp.firestore().collection(Blockchain.currencyCollectionName).get()
        const coins = CoinsReq.docs.reduce<Coins>((a, c) => {
            a[(c.data() as AltCoins).symbol] = c.data() as AltCoins;
            return a;
        }, {})

        if (blockchain === "solana") {
            const instructions: TransactionInstruction[] = []
            if (swap) {
                const tx = await solanaInstructions(coins, accountId, executer, "", "", 0, swap)
                instructions.push(...tx)
            }
            const instructionsRes = await Promise.all(requests.map(request => {
                if (isStreaming && startTime && endTime) {
                    return solanaInstructions(coins, accountId, executer, request.recipient, request.coin, request.amount, swap, isStreaming, startTime, endTime)
                }

                return solanaInstructions(coins, accountId, executer, request.recipient, request.coin, request.amount, swap)
            }))
            instructionsRes.forEach(res => instructions.push(...res))
            return res.json({
                data: instructions,
                destination: null
            });
        } else if (blockchain === "celo") {
            if (swap) {
                const data = await GenerateSwapData(swap)
                return res.json({
                    data,
                    destination: "0xE3D8bd6Aed4F159bc8000a9cD47CffDb95F96121"
                })
            }
            if (requests.length > 1) {
                const data = await BatchPay(requests, executer, coins)
                return res.json({
                    data: data,
                    destination: Contracts.BatchRequest.address
                })
            } else {
                const data = await GenerateTx(requests[0], executer, coins)
                const coin = coins[requests[0].coin]
                return res.json({
                    data: data,
                    destination: coin.address
                })
            }
        } else if(blockchain.includes("evm")){
            
        }
    } catch (error) {
        console.log(error)
        return res.status(400).json({ error: (error as any).message } as any)
    }
}


