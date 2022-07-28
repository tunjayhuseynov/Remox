import { newKit } from "@celo/contractkit";
import { PublicKey } from "@solana/web3.js";
import { GetCoins } from "utils/api";
import { NextApiRequest, NextApiResponse } from "next";
import { AltCoins, TokenType } from "types";
import { fromLamport, fromWei } from "utils/ray";
import * as solanaWeb3 from '@solana/web3.js';
import { SolanaEndpoint } from "components/Wallet";
import * as spl from 'easy-spl'
import { Blockchains, BlockchainType } from "types/blockchains";
import { Mainnet } from "@celo/react-celo";

const kit = newKit(Mainnet.rpcUrl)
const connection = new solanaWeb3.Connection(SolanaEndpoint)

export interface IBalanceAPI {
    [key: string]: string
}

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse<IBalanceAPI>
) {
    try {
        const addresses = req.query["addresses[]"];
        const blockchainName = req.query.blockchain as BlockchainType["name"];
        const blockchain = Blockchains.find(b => b.name === blockchainName);
        if(!blockchain) throw new Error("Blockchain not found");

        let parsedAddress = typeof addresses === "string" ? [addresses] : addresses;


        const balance = await GetAllBalance(parsedAddress, blockchain)
        if (balance) {
            return res.status(200).json(balance);
        }
        res.status(500).json({ error: "Something went wrong" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: (error as any).message });
    }
}



const GetAllBalance = async (addresses: string[], blockchain: BlockchainType) => {
    const Coins = GetCoins(blockchain.name)
    let balances: { [name: string]: string } = {};
    if (addresses.length > 1) {
        for (const addressItem of addresses) {
            for (const i of Object.values(Coins)) {
                const item = i as AltCoins

                let altcoinBalance = await GetBalance(item, addressItem, blockchain)

                if (!balances[item.name]) {
                    balances = Object.assign(balances, { [item.name]: altcoinBalance })
                } else {
                    balances[item.name] = `${Number(balances[item.name]) + Number(altcoinBalance)}`
                }
            }
        }

        return { ...balances };
    }

    const address = addresses[0];

    for (const i of Object.values(Coins)) {
        const item = i as AltCoins
        let altcoinBalance = await GetBalance(item, address, blockchain)

        balances = Object.assign(balances, { [item.name]: altcoinBalance });
    }
    return balances;
}

const GetBalance = async (item: AltCoins, addressParams: string, blockchain: BlockchainType) => {
    try {
        if (blockchain.name === 'celo') {
            const ethers = await kit.contracts.getErc20(item.contractAddress);
            let balance = await ethers.balanceOf(addressParams);
            return fromWei(balance)
        } else if (blockchain.name === 'solana') {
            let token;
            if (item.type === TokenType.GoldToken) {
                token = fromLamport(await connection.getBalance(new PublicKey(addressParams)))
            } else {
                const tok = await spl.mint.getBalance(connection, new PublicKey(item.contractAddress), new PublicKey(addressParams))
                // lamports = await connection.getTokenAccountsByOwner(publicKey, {programId: new PublicKey(item.contractAddress)})
                token = tok ?? 0
            }
            return token
        }
        return 0;
    } catch (error: any) {
        console.error(item?.name, error.message)
        throw new Error(error.message)
    }
} 