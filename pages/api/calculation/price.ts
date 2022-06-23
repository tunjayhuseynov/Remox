import { IuseCurrency } from "rpcHooks/useCurrency";
import { FirestoreRead, FirestoreReadMultiple } from "rpcHooks/useFirebase";
import { BASE_URL, Collection, GetCoins } from "utils/api";
import axios from "axios";
import { Balance } from "hooks/useCalculation";
import { NextApiRequest, NextApiResponse } from "next";
import { AltCoins, Coins, TokenType } from "types";
import { BlockchainType } from "hooks/walletSDK/useWalletKit";

export interface IPriceResponse {
    AllPrices: {
        [name: string]: {
            coins: AltCoins;
            per_24: number;
            price: number;
            amount: number;
            percent: number;
            tokenPrice: number;
        };
    },
    TotalBalance: number
}

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse<IPriceResponse>
) {
    try {
        const blockchain = req.query.blockchain as BlockchainType;
        const addresses = req.query["addresses[]"];
        const parsedAddress = typeof addresses === "string" ? [addresses] : addresses;

        const fetchCurrenices = await FirestoreReadMultiple<IuseCurrency>(Collection(blockchain), [
            { condition: ">", firstQuery: "price", secondQuery: 0 }
        ])

        const balance = await axios.get<Balance>(BASE_URL + '/api/calculation/balance', {
            params: {
                addresses: parsedAddress,
                blockchain
            }
        })

        const AllPrices = ParseAllPrices(fetchCurrenices, balance.data, blockchain)
        const totalPrice = Total(fetchCurrenices, balance.data)

        res.status(200).json({
            AllPrices: AllPrices,
            TotalBalance: totalPrice
        })
    } catch (error) {
        res.json(error as any)
        res.status(405).end()
    }
}

const Total = (fetchedCurrencies: IuseCurrency[], balance: Balance) => fetchedCurrencies.reduce((a, c) => a + (c.price * parseFloat((balance?.[c.name]) ?? "0")), 0)

const ParseAllPrices = (fetchedCurrencies: IuseCurrency[], balance: Balance, blockchain: BlockchainType) => {
    return fetchedCurrencies.filter(s => GetCoins(blockchain)[s.name as unknown as keyof Coins]).sort((a, b) => {
        const aa = GetCoins(blockchain)[a.name as unknown as keyof Coins]
        const bb = GetCoins(blockchain)[b.name as unknown as keyof Coins]
        if (aa && bb) {
            if (aa.type !== bb.type && aa.type === TokenType.GoldToken) return -1
            if (aa.type !== bb.type && aa.type === TokenType.StableToken && bb.type === TokenType.Altcoin) return -1
            if (aa.type !== bb.type && aa.type === TokenType.Altcoin) return 1
        }
        return 0
    }).reduce<{ [name: string]: { coins: AltCoins, per_24: number, price: number, amount: number, percent: number, tokenPrice: number } }>((a: any, c) => {
        const amount = parseFloat((balance?.[c.name]) ?? "0");
        const price = c.price * amount;
        a[c.name] = {
            coins: GetCoins(blockchain)[c.name as unknown as keyof Coins],
            per_24: c?.percent_24,
            price,
            amount,
            percent: (price * 100) / Total(fetchedCurrencies, balance),
            tokenPrice: c.price
        }
        return a;
    }, {})
}