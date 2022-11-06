import { FiatMoneyList, IHpPrice, IHpPriceData } from "firebaseConfig";
import { adminApp } from "firebaseConfig/admin";
import { NextApiRequest, NextApiResponse } from "next";
import { Blockchains } from "types/blockchains";
import { GetTime } from "utils";
import dateTime from 'date-and-time'
import { AltCoins } from "types";

export interface IHpApiResponse {
    [name: string]: {
        USD: IHpPriceData[];
        EUR: IHpPriceData[];
        GBP: IHpPriceData[];
        TRY: IHpPriceData[];
        AUD: IHpPriceData[];
        CAD: IHpPriceData[];
        JPY: IHpPriceData[];
    }
}


export default async function handler(req: NextApiRequest, res: NextApiResponse<IHpApiResponse>) {
    if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" } as any);
    const { lastTxDate, blockchains, fiatMoney } = req.body as
        { lastTxDate: number | undefined, blockchains: string[] | undefined, fiatMoney: FiatMoneyList[] | undefined };

    let lastDate = lastTxDate;
    if (lastDate === undefined) {
        lastDate = new Date(`${new Date().getDay()}/${new Date().getMonth() + 1}/${new Date().getFullYear() - 1}`).getTime();
    }
    if (!blockchains) throw new Error("Blockchain is required");

    const bc = Blockchains.filter(b => blockchains.includes(b.name));
    if (!bc) throw new Error("Blockchain not found");

    let bcs = {};
    for (const blockchain of bc) {
        const collectionName = blockchain.currencyCollectionName;
        const { docs: coinList } = await adminApp.firestore().collection(collectionName).get();
        const result = await Promise.all((coinList.map(s => s.data()) as AltCoins[]).map(async (coin) => {
            const data = await adminApp.firestore().collection(blockchain.hpCollection).doc(coin.symbol.replace("/","")).get()
            const coins = data.data() as IHpPrice["coins"][0]["historicalPrices"]
            if (!coins) {
                return {
                    [coin.symbol]: {
                        AUD: [],
                        CAD: [],
                        EUR: [],
                        GBP: [],
                        JPY: [],
                        TRY: [],
                        USD: []
                    }
                }
            }
            const now = new Date()
            const diff = Math.abs(dateTime.subtract(new Date(lastDate! * 1000), now).toDays())
            let filterDate = diff > 30 ? lastDate! : 30;
            const response: IHpApiResponse[0] = {
                AUD: fiatMoney?.includes("AUD") && Array.isArray(coins?.aud) ? coins.aud.filter(c => GetTime(new Date(c.date)) >= filterDate!) : [],
                CAD: fiatMoney?.includes("CAD") && Array.isArray(coins?.cad) ? coins.cad.filter(c => GetTime(new Date(c.date)) >= filterDate!) : [],
                JPY: fiatMoney?.includes("JPY") && Array.isArray(coins?.jpy) ? coins.jpy.filter(c => GetTime(new Date(c.date)) >= filterDate!) : [],
                EUR: fiatMoney?.includes("EUR") && Array.isArray(coins?.eur) ? coins.eur.filter(c => GetTime(new Date(c.date)) >= filterDate!) : [],
                GBP: fiatMoney?.includes("GBP") && Array.isArray(coins?.gbp) ? coins.gbp.filter(c => GetTime(new Date(c.date)) >= filterDate!) : [],
                TRY: fiatMoney?.includes("TRY") && Array.isArray(coins?.try) ? coins.try.filter(c => GetTime(new Date(c.date)) >= filterDate!) : [],
                USD: fiatMoney?.includes("USD") && Array.isArray(coins?.usd) ? coins.usd.filter(c => GetTime(new Date(c.date)) >= filterDate!) : [],
            }

            return {
                [coin.symbol]: response
            };
        }))
        bcs = {
            ...bcs,
            ...result
        }
    }

    res.status(200).json(bcs);
}