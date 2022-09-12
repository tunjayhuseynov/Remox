import { BASE_URL, IPrice } from "utils/api";
import axios from "axios";
import { Balance } from "hooks/useCalculation";
import { NextApiRequest, NextApiResponse } from "next";
import { AltCoins, Coins, TokenType } from "types";
import { Blockchains, BlockchainType } from "types/blockchains";
import { adminApp } from "firebaseConfig/admin";
import axiosRetry from "axios-retry";

export interface IPriceCoin {
    coins: AltCoins;
    per_24: number;
    price: number;
    amount: number;
    percent: number;
    tokenPrice: number;

    name: string;
    coinUrl: string;
    type: TokenType;
    address: string;
    color: string;
    decimals: number;
    chainID: number;
    logoURI: string;
    priceUSD: number;
    symbol: string;
}

export interface IPriceResponse {
    AllPrices: IPrice,
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

        axiosRetry(axios, { retries: 10 });
   
        const balance = await axios.get<Balance>(BASE_URL + '/api/calculation/balance', {
            params: {
                addresses: parsedAddress,
                blockchain: blockchain.name,
            }
        })  

        const AllPrices = ParseAllPrices(fetchCurrenices, balance.data, blockchain)
        const totalPrice = Total(fetchCurrenices, balance.data)

        res.status(200).json({
            AllPrices: AllPrices,
            TotalBalance: totalPrice
        })
    } catch (error) {
        throw new Error((error as any).message)
    }
}

const Total = (fetchedCurrencies: AltCoins[], balance: Balance) => fetchedCurrencies.reduce((a, c) => a + (c.priceUSD * parseFloat((balance?.[c.symbol]) ?? "0")), 0)

const ParseAllPrices = (fetchedCurrencies: AltCoins[], balance: Balance, blockchain: BlockchainType) => {
    // const CoinsReq = await adminApp.firestore().collection(blockchain.currencyCollectionName).get();
    // const Coins = CoinsReq.docs.reduce((a, c) => {
    //     a[(c.data() as AltCoins).symbol] = c.data() as AltCoins;
    //     return a;
    // }, {} as { [name: string]: AltCoins })

    return fetchedCurrencies.sort((a, b) => {
        const aa = a
        const bb = b
        if (aa && bb) {
            if (aa.type !== bb.type && aa.type === TokenType.GoldToken) return -1
            if (aa.type !== bb.type && aa.type === TokenType.StableToken && bb.type === TokenType.Altcoin) return -1
            if (aa.type !== bb.type && aa.type === TokenType.Altcoin) return 1
        }
        return 0
    }).reduce<IPrice>((a, c) => {
        const amount = parseFloat((balance?.[c.symbol]) ?? "0");
        const price = c.priceUSD * amount;
        const obj : IPrice[0] = {
            coins: c,
            amountUSD: price,
            amount,
            percent: (price * 100) / Total(fetchedCurrencies, balance),
            tokenPrice: c.priceUSD,
            ...c
        };
        a[c.symbol] = obj;
        return a;
    }, {})
}