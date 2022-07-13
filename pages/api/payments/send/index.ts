import { Connection, PublicKey } from "@solana/web3.js";
import { NextApiRequest, NextApiResponse } from "next";
import { SolanaCoins } from "types";
import { token } from 'easy-spl'
import { SolanaEndpoint, SolanaSerumEndpoint } from "components/Wallet";


export default async function SendOne(
    req: NextApiRequest,
    res: NextApiResponse
) {
    const blockchain = req.query.blockchain as string;
    const coin = req.query.coin as string;
    const address = req.query.address as string;
    const amount = +(req.query.amount as string);
    const recipient = req.query.recipient as string;
    if (!blockchain) throw new Error("blockchain is required");
    if (!address) throw new Error("address is required");
    if (!amount) throw new Error("amount is required");
    if (!recipient) throw new Error("recipient is required");

    if (blockchain === "solana") {
        const instructions = await solanaInstructions(address, recipient, coin, amount);
        return res.json(instructions);
    }
}


const solanaInstructions = async (publicKey: string, recipient: string, coin: string, amount: number) => {
    const solanaCoin = SolanaCoins[coin]
  
    const from = new PublicKey(publicKey)
    const to = new PublicKey(recipient)
    const connection = new Connection(SolanaSerumEndpoint)

    return await token.transferTokenInstructions(connection, new PublicKey(solanaCoin.contractAddress), from, to, amount)
}

const celoInstructions = async ()=>{
    
}