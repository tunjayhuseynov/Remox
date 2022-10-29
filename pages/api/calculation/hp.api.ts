import { FiatMoneyList, IHpPrice, IHpPriceData } from "firebaseConfig";
import { adminApp } from "firebaseConfig/admin";
import { NextApiRequest, NextApiResponse } from "next";
import { Blockchains } from "types/blockchains";
import { GetTime } from "utils";
import dateTime from 'date-and-time'

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
    const { coinList, lastTxDate, blockchain, fiatMoney } = req.body as
        { coinList: string[] | undefined, lastTxDate: number | undefined, blockchain: string | undefined, fiatMoney: FiatMoneyList | undefined };
    let lastDate = lastTxDate;
    if (!coinList) throw new Error("Coin list is required");
    if (lastDate === undefined) {
        lastDate = new Date(`${new Date().getDay()}/${new Date().getMonth() + 1}/${new Date().getFullYear() - 1}`).getTime();
    }
    if (!blockchain) throw new Error("Blockchain is required");

    const bc = Blockchains.find(b => b.name === blockchain)
    if (!bc) throw new Error("Blockchain not found");

    const result = await Promise.all(coinList.map(async (coin) => {
        const data = await adminApp.firestore().collection(bc.hpCollection).doc(coin).get()
        const coins = data.data() as IHpPrice["coins"][0]["historicalPrices"]
        if (!coins) {
            return {
                [coin]: {
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
            AUD: fiatMoney === "AUD" ? coins.aud.filter(c => GetTime(new Date(c.date)) >= filterDate!) : [],
            CAD: fiatMoney === "CAD" ? coins.cad.filter(c => GetTime(new Date(c.date)) >= filterDate!) : [],
            JPY: fiatMoney === "JPY" ? coins.jpy.filter(c => GetTime(new Date(c.date)) >= filterDate!) : [],
            EUR: fiatMoney === "EUR" ? coins.eur.filter(c => GetTime(new Date(c.date)) >= filterDate!) : [],
            GBP: fiatMoney === "GBP" ? coins.gbp.filter(c => GetTime(new Date(c.date)) >= filterDate!) : [],
            TRY: fiatMoney === "TRY" ? coins.try.filter(c => GetTime(new Date(c.date)) >= filterDate!) : [],
            USD: fiatMoney === "USD" ? coins.usd.filter(c => GetTime(new Date(c.date)) >= filterDate!) : [],
        }

        return {
            [coin]: response
        };
    }))

    res.status(200).json(result.reduce((a, b) => ({ ...a, ...b }), {}));
}