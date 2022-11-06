import { newKit } from "@celo/contractkit";
import { PublicKey } from "@solana/web3.js";
import { NextApiRequest, NextApiResponse } from "next";
import { AltCoins, TokenType } from "types";
import * as solanaWeb3 from '@solana/web3.js';
import { SolanaEndpoint } from "components/Wallet";
import * as spl from 'easy-spl'
import { Blockchains, BlockchainType } from "types/blockchains";
import { Mainnet } from "@celo/react-celo";
import BigNumber from "bignumber.js";
import { adminApp } from "firebaseConfig/admin";
import Web3 from 'web3'
import erc20 from 'rpcHooks/ABI/ERC.json'
import { AbiItem } from "rpcHooks/ABI/AbiItem";
import { BASE_URL, DecimalConverter } from "utils/api";
import { toChecksumAddress } from "web3-utils";
import axios from "axios";

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
        if (!blockchain) throw new Error("Blockchain not found");

        let parsedAddress = typeof addresses === "string" ? [addresses] : addresses;
        if (!parsedAddress) throw new Error("Addresses not found");

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
    const CoinsReq = await adminApp.firestore().collection(blockchain.currencyCollectionName).get();
    const Coins = CoinsReq.docs.map(doc => doc.data() as AltCoins)
    const coinList = Object.values(Coins);
    let balances: { [name: string]: string } = {};
    const rpc = new Web3.providers.HttpProvider(blockchain.rpcUrl)
    const web3 = new Web3(rpc)

    for (const address of addresses) {
        if (blockchain.name === "solana") {
            const balanceRes = await Promise.allSettled(coinList.map(item => GetBalanceSolana(item, address, blockchain, web3)))
            balanceRes.forEach((altcoinBalance, index) => {
                if (altcoinBalance.status === "fulfilled") {
                    const item = altcoinBalance.value[1]
                    balances = Object.assign(balances, { [item.symbol]: balances[item.symbol] ? new BigNumber(altcoinBalance.value[0]).div(10 ** item.decimals).plus(balances[item.symbol]).toString() : new BigNumber(altcoinBalance.value[0]).div(10 ** item.decimals).toString() });
                }
            })
        } else {
            const { data } = await axios.get<{ result: { balance: string, contractAddress?: string }[] }>(blockchain.explorerAPIUrl + "?module=account&action=tokenlist&address=" + toChecksumAddress(address));
            const accountBalance = data.result;

            for (const coin of coinList) {
                const balance = accountBalance.find(b => b.contractAddress?.toLowerCase() === coin.address.toLowerCase());

                balances = Object.assign(balances, { [coin.symbol]: balances[coin.symbol] ? new BigNumber(balance?.balance ?? 0).div(10 ** coin.decimals).plus(balances[coin.symbol]).toString() : new BigNumber(balance?.balance ?? 0).div(10 ** coin.decimals).toString() });

            }
        }
    }





    // if (blockchain.name === "solana") {
    //     const balanceRes = await Promise.allSettled(coinList.map(item => GetBalanceSolana(item, address, blockchain, web3)))
    //     balanceRes.forEach((altcoinBalance, index) => {
    //         if (altcoinBalance.status === "fulfilled") {
    //             const item = altcoinBalance.value[1]
    //             balances = Object.assign(balances, { [item.symbol]: altcoinBalance.value[0] });
    //         }
    //     })
    // } else {
    //     const { data } = await axios.get<{ result: { balance: string, contractAdress: string }[] }>("https://explorer.celo.org/api?module=account&action=tokenlist&address=" + toChecksumAddress(address));
    //     const accountBalance = data.result;

    //     for (const coin of coinList) {
    //         const balance = accountBalance.find(b => b.contractAdress.toLowerCase() === coin.address.toLowerCase());
    //         if (balance) {
    //             balances = Object.assign(balances, { [coin.symbol]: balance.balance });
    //         } else {
    //             balances = Object.assign(balances, { [coin.symbol]: "0" });
    //         }
    //     }
    // }

    return balances;
}

const GetBalanceSolana = async (item: AltCoins, addressParams: string, blockchain: BlockchainType, web3: Web3): Promise<[number, AltCoins]> => {
    try {
        let token;
        if (item.type === TokenType.GoldToken) {
            token = new BigNumber(await connection.getBalance(new PublicKey(addressParams))).div(item.decimals).toNumber()
        } else {
            const tok = new BigNumber(await spl.mint.getBalance(connection, new PublicKey(item.address), new PublicKey(addressParams))).div(item.decimals).toNumber()
            // lamports = await connection.getTokenAccountsByOwner(publicKey, {programId: new PublicKey(item.contractAddress)})
            token = tok ?? 0
        }
        return [token, item]
    } catch (error: any) {
        console.error("Balance API: ", item?.name, error)
        // throw new Error("Balance API:", error)
        return [0, item];
    }
}

//https://explorer.celo.org/api?module=account&action=tokenlist&address=