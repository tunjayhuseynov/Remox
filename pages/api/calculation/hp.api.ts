import { FiatMoneyList, IHpPrice, IHpPriceData } from "firebaseConfig";
import { adminApp } from "firebaseConfig/admin";
import { NextApiRequest, NextApiResponse } from "next";
import { Blockchains } from "types/blockchains";
import { GetTime } from "utils";

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

    if (!coinList) throw new Error("Coin list is required");
    if (!lastTxDate) throw new Error("Last tx date is required");
    if (!blockchain) throw new Error("Blockchain is required");

    const bc = Blockchains.find(b => b.name === blockchain)
    if (!bc) throw new Error("Blockchain not found");

    const result = await Promise.all(coinList.map(async (coin) => {
        const data = await adminApp.firestore().collection(bc.hpCollection).doc(coin).get()
        const coins = data.data() as IHpPrice["coins"][0]["historicalPrices"]

        const response: IHpApiResponse[0] = {
            AUD: fiatMoney === "AUD" ? coins.aud.filter(c => GetTime(new Date(c.date)) > lastTxDate) : [],
            CAD: fiatMoney === "CAD" ? coins.cad.filter(c => GetTime(new Date(c.date)) > lastTxDate) : [],
            JPY: fiatMoney === "JPY" ? coins.jpy.filter(c => GetTime(new Date(c.date)) > lastTxDate) : [],
            EUR: fiatMoney === "EUR" ? coins.eur.filter(c => GetTime(new Date(c.date)) > lastTxDate) : [],
            GBP: fiatMoney === "GBP" ? coins.gbp.filter(c => GetTime(new Date(c.date)) > lastTxDate) : [],
            TRY: fiatMoney === "TRY" ? coins.try.filter(c => GetTime(new Date(c.date)) > lastTxDate) : [],
            USD: fiatMoney === "USD" ? coins.usd.filter(c => GetTime(new Date(c.date)) > lastTxDate) : [],
        }

        return {
            [coin]: response
        };
    }))

    res.status(200).json(result.reduce((a, b) => ({ ...a, ...b }), {}));
}