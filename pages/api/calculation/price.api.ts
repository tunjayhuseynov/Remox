import { BASE_URL } from "utils/api";
import axios from "axios";
import { Balance } from "hooks/useCalculation";
import { NextApiRequest, NextApiResponse } from "next";
import { AltCoins, Coins, TokenType } from "types";
import { Blockchains, BlockchainType } from "types/blockchains";
import { adminApp } from "firebaseConfig/admin";

export interface IPriceCoin {
    coins: AltCoins;
    per_24: number;
    price: number;
    amount: number;
    percent: number;
    tokenPrice: number;
}

export interface IPriceResponse {
    AllPrices: {
        [name: string]: IPriceCoin;
    },
    TotalBalance: number
}

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse<IPriceResponse>
) {
    try {
        const blockchainName = req.query.blockchain as BlockchainType["name"];
        const blockchain = Blockchains.find(b => b.name === blockchainName);
        if (!blockchain) throw new Error("Blockchain not found");

        const addresses = req.query["addresses[]"];
        const parsedAddress = typeof addresses === "string" ? [addresses] : addresses;

        const fetchCurrenicesReq = await adminApp.firestore().collection(blockchain.currencyCollectionName).get();
        const fetchCurrenices = fetchCurrenicesReq.docs.map(s => s.data() as AltCoins)

        const balance = await axios.get<Balance>(BASE_URL + '/api/calculation/balance', {
            params: {
                addresses: parsedAddress,
                blockchain: blockchain.name,
            }
        })

        const AllPrices = await ParseAllPrices(fetchCurrenices, balance.data, blockchain)
        const totalPrice = Total(fetchCurrenices, balance.data)

        res.status(200).json({
            AllPrices: AllPrices,
            TotalBalance: totalPrice
        })
    } catch (error) {
        res.json(error as any)
        throw new Error((error as any).message)
    }
}

const Total = (fetchedCurrencies: AltCoins[], balance: Balance) => fetchedCurrencies.reduce((a, c) => a + (c.priceUSD * parseFloat((balance?.[c.name]) ?? "0")), 0)

const ParseAllPrices = async (fetchedCurrencies: AltCoins[], balance: Balance, blockchain: BlockchainType) => {
    const CoinsReq = await adminApp.firestore().collection(blockchain.currencyCollectionName).get();
    const Coins = CoinsReq.docs.reduce((a, c) => {
        a[(c.data() as AltCoins).symbol] = c.data() as AltCoins;
        return a;
    }, {} as { [name: string]: AltCoins })
    return fetchedCurrencies.filter(s => Coins[s.symbol as unknown as keyof Coins]).sort((a, b) => {
        const aa = Coins[a.symbol as unknown as keyof Coins]
        const bb = Coins[b.symbol as unknown as keyof Coins]
        if (aa && bb) {
            if (aa.type !== bb.type && aa.type === TokenType.GoldToken) return -1
            if (aa.type !== bb.type && aa.type === TokenType.StableToken && bb.type === TokenType.Altcoin) return -1
            if (aa.type !== bb.type && aa.type === TokenType.Altcoin) return 1
        }
        return 0
    }).reduce<{ [name: string]: { coins: AltCoins, per_24: number, price: number, amount: number, percent: number, tokenPrice: number } }>((a: any, c) => {
        const amount = parseFloat((balance?.[c.name]) ?? "0");
        const price = c.priceUSD * amount;
        a[c.name] = {
            coins: Coins[c.symbol as unknown as keyof Coins],
            price,
            amount,
            percent: (price * 100) / Total(fetchedCurrencies, balance),
            tokenPrice: c.priceUSD
        }
        return a;
    }, {})
}