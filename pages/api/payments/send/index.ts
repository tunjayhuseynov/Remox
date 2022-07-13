import type { TransactionInstruction } from "@solana/web3.js";
import { NextApiRequest, NextApiResponse } from "next";
import { BlockchainType } from "hooks/walletSDK/useWalletKit";
import { BatchPay, GenerateTx } from "./_celo";
import { solanaInstructions } from "./_solana";

export interface IPaymentInput {
    coin: string,
    amount: number,
    recipient: string,
    comment?: string,
    from?: string
}

interface IBody {
    blockchain: BlockchainType,
    executer: string,
    requests: IPaymentInput[]
}

export default async function Send(
    req: NextApiRequest,
    res: NextApiResponse
) {
    try {
        if (req.method !== 'POST') throw new Error('Only POST method is allowed')
        const { blockchain, requests, executer } = req.body as IBody
        if (!blockchain) throw new Error("blockchain is required");
        if (requests.length === 0) throw new Error("requests is required");

        if (blockchain === "solana") {
            const instructions: TransactionInstruction[] = []
            const instructionsRes = await Promise.all(requests.map(request => solanaInstructions(request.from ?? executer, request.recipient, request.coin, request.amount)))
            instructionsRes.forEach(res => instructions.push(...res))
            return res.json(instructions);
        } else if (blockchain === "celo") {
            if (requests.length > 1) {
                const data = await BatchPay(requests, executer)
                return res.json(data)
            } else {
                const data = await GenerateTx(requests[0], executer)
                return res.json(data)
            }
        }
    } catch (error) {
        return res.status(400).json({ error: (error as any).message })
    }
}


