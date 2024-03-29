import type { TransactionInstruction } from "@solana/web3.js";
import { NextApiRequest, NextApiResponse } from "next";
import { BatchPay, GenerateCancelStreamingTx, GenerateStreamingTx, GenerateSwapData, GenerateTx } from "./_celo";
import { solanaInstructions } from "./_solana";
import { Contracts } from "rpcHooks/Contracts/Contracts";
import { AltCoins, Coins } from "types";
import { Blockchains, BlockchainType, MultisigProviders } from "types/blockchains";
import { adminApp } from "firebaseConfig/admin";
import { GenerateTxEvm, GenerateSwapDataEvm } from "./_evm";
import { CreateTransactionGnosis } from "./_gnosis";

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

export interface ISwapParam1inch {
    fromTokenAddress: string;
    toTokenAddress: string;
    amount: string;
    fromAddress: string;
    slippage: number;
    disableEstimate: boolean;
    allowPartialFill: boolean;
}

export interface IPaymentDataBody {
    walletAddress: string,
    blockchain: BlockchainType["name"],

    executer: string,
    requests: IPaymentInput[],

    swap: ISwap | null,

    createStreaming: boolean,
    startTime: number | null,
    endTime: number | null,

    cancelStreaming: boolean | null,
    streamId: string | null

    providerName: MultisigProviders | null
}

export interface ISendTx {
    data: string | TransactionInstruction[],
    destination: string | null,
    value: number | null
}

export default async function Send(
    req: NextApiRequest,
    res: NextApiResponse<ISendTx | ISendTx[]>
) {
    try {
        if (req.method !== 'POST') throw new Error('Only POST method is allowed')
        const { blockchain, requests, executer, createStreaming: isStreaming, endTime, startTime, swap, walletAddress: accountId, cancelStreaming, streamId, providerName } = req.body as IPaymentDataBody
        if (!blockchain) throw new Error("blockchain is required");

        if (requests.length === 0 && !swap && !isStreaming && !cancelStreaming) throw new Error("requests is required");
        // console.log(providerName)


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
                destination: null,
                value: 0
            });
        } else {
            if (cancelStreaming && streamId) {
                const data = await GenerateCancelStreamingTx(streamId)
                return res.json({
                    data: data,
                    destination: Blockchain.streamingProtocols[0].contractAddress,
                    value: 0
                })
            }
            if (isStreaming && startTime && endTime) {
                const data = await GenerateStreamingTx({
                    amount: requests[0].amount,
                    coin: requests[0].coin,
                    recipient: requests[0].recipient,
                }, startTime, endTime, coins)
                return res.json({
                    data: data,
                    destination: Blockchain.streamingProtocols[0].contractAddress,
                    value: 0
                })
            }
            if (swap) {
                if (Blockchain.name.includes("evm")) {
                    const data = await GenerateSwapDataEvm(swap, Blockchain.chainId!)
                    return res.json({
                        data: data,
                        destination: Blockchain.swapProtocols[0].contractAddress,
                        value: 0
                    })
                }
                const data = await GenerateSwapData(swap)
                return res.json({
                    data,
                    destination: Blockchain.swapProtocols[0].contractAddress,
                    value: 0
                })
            }
            if (providerName === "GnosisSafe") {
                const data = await CreateTransactionGnosis(requests, executer, coins)
                // console.log(data)
                return res.json(data)
            }
            if (requests.length > 1) {
                const data = await BatchPay(requests, executer, coins)
                return res.json({
                    data: data,
                    destination: Contracts.BatchRequest.address,
                    value: 0
                })
            } else {
                const data = await GenerateTx(requests[0], executer, coins)
                const coin = coins[requests[0].coin]
                if(coin.address === "0x0000000000000000000000000000000000000000") {
                    return res.json({
                        data: "0x",
                        destination: requests[0].recipient,
                        value: requests[0].amount
                    })
                }
                return res.json({
                    data: data,
                    destination: coin.address,
                    value: 0
                })
            }
        }
    } catch (error) {
        console.log(error)
        return res.status(400).json({ error: (error as any).message } as any)
    }
}


