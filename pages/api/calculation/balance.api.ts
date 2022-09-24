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
import erc20 from 'rpcHooks/ABI/erc20.json'
import { AbiItem } from "rpcHooks/ABI/AbiItem";
import { DecimalConverter } from "utils/api";
import { toChecksumAddress } from "web3-utils";

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
        if (!blockchain) throw new Error("Blockchain not found");

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
    const CoinsReq = await adminApp.firestore().collection(blockchain.currencyCollectionName).get();
    const Coins = CoinsReq.docs.map(doc => doc.data() as AltCoins)
    const coinList = Object.values(Coins);
    let balances: { [name: string]: string } = {};
    const rpc = new Web3.providers.HttpProvider(blockchain.rpcUrl)
    const web3 = new Web3(rpc)

    if (addresses.length > 1) {

        const balanceArray = await Promise.all(addresses.map(async (addressItem) => {
            let balances: { [name: string]: string } = {};

            const balancesRes = await Promise.all(coinList.map(item => GetBalance(item, addressItem, blockchain, web3)))

            balancesRes.forEach((v, index) => {
                const item = v[1];
                if (!balances[item.symbol]) {
                    balances = Object.assign(balances, { [item.symbol]: v[0]?.toString() })
                } else {
                    balances[item.symbol] = `${Number(balances[item.symbol]) + Number(v[0])}`
                }
            })

            return balances;
        }))

        const result = balanceArray.reduce<{ [name: string]: string; }>((a, c) => {
            Object.keys(c).forEach((key) => {
                if (!a[key]) {
                    a[key] = c[key]
                } else {
                    a[key] = `${Number(a[key]) + Number(c[key])}`
                }
            })
            return a;
        }, {})

        balances = result;

        return { ...balances };
    }

    const address = addresses[0];



    const balanceRes = await Promise.allSettled(coinList.map(item => GetBalance(item, address, blockchain, web3)))
    balanceRes.forEach((altcoinBalance, index) => {
        if (altcoinBalance.status === "fulfilled") {
            const item = altcoinBalance.value[1]
            balances = Object.assign(balances, { [item.symbol]: altcoinBalance.value[0] });
        }
    })

    return balances;
}

const GetBalance = async (item: AltCoins, addressParams: string, blockchain: BlockchainType, web3: Web3): Promise<[number, AltCoins]> => {
    try {
        if (blockchain.name === 'celo') {
            const ethers = new web3.eth.Contract(erc20 as AbiItem[], toChecksumAddress(item.address));
            if (item.address === '0x0000000000000000000000000000000000000000') {
                const balance = await web3.eth.getBalance(addressParams)
                return [DecimalConverter(balance, item.decimals), item]
            }
            let balance = await ethers.methods.balanceOf(toChecksumAddress(addressParams)).call();
            return [DecimalConverter(balance.toString(), item.decimals), item]
        } else if (blockchain.name === 'solana') {
            let token;
            if (item.type === TokenType.GoldToken) {
                token = new BigNumber(await connection.getBalance(new PublicKey(addressParams))).div(item.decimals).toNumber()
            } else {
                const tok = new BigNumber(await spl.mint.getBalance(connection, new PublicKey(item.address), new PublicKey(addressParams))).div(item.decimals).toNumber()
                // lamports = await connection.getTokenAccountsByOwner(publicKey, {programId: new PublicKey(item.contractAddress)})
                token = tok ?? 0
            }
            return [token, item]
        }
        return [0, item];
    } catch (error: any) {
        console.error("Balance API: ", item?.name, error)
        // throw new Error("Balance API:", error)
        return [0, item];
    }
} 