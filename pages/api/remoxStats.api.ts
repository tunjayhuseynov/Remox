import { FirestoreRead, FirestoreReadMultiple } from "rpcHooks/useFirebase";
import axios from "axios";
import { IUser } from "firebaseConfig";
import { Balance } from "hooks/useCalculation";
import { NextApiRequest, NextApiResponse } from "next";
import { BASE_URL, Collection } from "utils/api";
import { IPriceResponse } from "./calculation/price.api";
import json2csv from "json2csv";

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse<any>
) {
    try {

        let allCeloAddresses: string[] = []

        const users = await FirestoreReadMultiple<IUser>("users", [
            { condition: ">", firstQuery: "timestamp", secondQuery: 0 }
        ])


        for (const user of users) {
            if (typeof user.address === "string" && (user.address as string).startsWith("0x")) {
                allCeloAddresses.push(user.address as string)
            } else if (typeof user.address === "object") {
                for (const address of user.address) {
                    if (address.startsWith("0x")) {
                        allCeloAddresses.push(address)
                    }
                }
            }
        }

        const prices = await axios.get<IPriceResponse>(BASE_URL + "/api/calculation/price", {
            params: {
                addresses: allCeloAddresses,
                blockchain: "celo"
            }
        })
        const coins = Object.values(prices.data.AllPrices).reduce<any>((a, c, i) => {
            a[c.coins.name] = c.amount * c.price;
            return a;
        }, {})
        const csv = json2csv.parse({
            TotalBalance: prices.data.TotalBalance,
            ...coins
        });

        res.setHeader('Content-disposition', 'attachment; filename=data.csv');
        res.setHeader('Content-Type', 'text/csv');
        res.status(200).send(csv);
        // res.status(200).json({
        //     TotalBalance: prices.data.TotalBalance
        // })
    } catch (error) {
        res.json(error as any)
        res.status(405).end()
    }
}