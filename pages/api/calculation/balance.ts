import { newKit } from "@celo/contractkit";
import { PublicKey } from "@solana/web3.js";
import { GetCoins } from "utils/api";
import { NextApiRequest, NextApiResponse } from "next";
import { AltCoins, TokenType } from "types";
import { fromLamport, fromWei } from "utils/ray";
import * as solanaWeb3 from '@solana/web3.js';
import { SolanaEndpoint } from "components/Wallet";
import * as spl from 'easy-spl'
import { Mainnet } from "@celo-tools/use-contractkit";
import { BlockchainType } from "hooks/walletSDK/useWalletKit";

const kit = newKit(Mainnet.rpcUrl)
const connection = new solanaWeb3.Connection(SolanaEndpoint)

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse<any>
) {
    try {
        const addresses = req.query["addresses[]"];
        const blockchain = req.query.blockchain as BlockchainType;

        let parsedAddress = typeof addresses === "string" ? [addresses] : addresses;

        const balance = await GetAllBalance(parsedAddress, blockchain)
        if (balance) {
            return res.status(200).json(balance);
        }
        res.status(500).json({ error: "Something went wrong" });
    } catch (error) {
        throw new Error(error as any)
        res.status(405).end()
    }
}



const GetAllBalance = async (addresses: string[], blockchain: BlockchainType) => {
    const Coins = GetCoins(blockchain)
    let balances: { [name: string]: string } = {};
    if (addresses.length > 1) {
        for (const addressItem of addresses) {
            for (const i of Object.values(Coins)) {
                const item = i as AltCoins
                // const ethers = await kit.contracts.getErc20(item.contractAddress);
                // let balance = await ethers.balanceOf(addressItem);
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
    // if (walletType === "PrivateKey") {
    //     let cEUR_v2, cREAL_v2, CELO_v2, cUSD_v2, cEUR_v1, CELO_v1, cUSD_v1;
    //     await Promise.all([pastEvents("CELO_v2"), pastEvents("cUSD_v2"), pastEvents("cEUR_v2"), pastEvents("cREAL_v2"), pastEvents("CELO_v1"), pastEvents("cUSD_v1"), pastEvents("cEUR_v1")])
    //     const values = await Promise.all([balance("CELO_v2"), balance("cUSD_v2"), balance("cEUR_v2"), balance("cREAL_v2"), balance("CELO_v1"), balance("cUSD_v1"), balance("cEUR_v1")])
    //     CELO_v2 = values[0]
    //     cUSD_v2 = values[1]
    //     cEUR_v2 = values[2]
    //     cREAL_v2 = values[3]
    //     CELO_v1 = values[4]
    //     cUSD_v1 = values[5]
    //     cEUR_v1 = values[6]

    //     balances = { CELO_v2, cEUR_v2, cUSD_v2, cREAL_v2, cEUR_v1, cUSD_v1, CELO_v1 }
    // } else {
    for (const i of Object.values(Coins)) {
        const item = i as AltCoins
        // const ethers = await kit.contracts.getErc20(item.contractAddress);
        // let balance = await ethers.balanceOf(address);
        let altcoinBalance = await GetBalance(item, address, blockchain)

        balances = Object.assign(balances, { [item.name]: altcoinBalance });
    }
    // }
    return balances;
}

const GetBalance = async (item: AltCoins, addressParams: string, blockchain: BlockchainType) => {
    try {
        if (blockchain === 'celo') {
            const ethers = await kit.contracts.getErc20(item.contractAddress);
            let balance = await ethers.balanceOf(addressParams);
            return fromWei(balance)
        } else if (blockchain === 'solana') {
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