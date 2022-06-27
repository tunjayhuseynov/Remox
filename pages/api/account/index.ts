import { accountCollectionName } from "crud/account";
import { IAccount, IUser } from "firebaseConfig";
import { adminApp } from "firebaseConfig/admin";
import { NextApiRequest, NextApiResponse } from "next";
import { AltCoins } from "types";
import { BalanceAPI } from "../calculation/balance";
import axios from "axios";
import { IPriceCoin as IPriceCoin, IPriceResponse } from "../calculation/price";
import { BASE_URL } from "utils/api";

export interface IAccountORM extends IAccount {
    totalValue: number;
    coins: (IPriceCoin & { name: string })[]
}

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse<IAccountORM>
) {
    try {
        const id = req.query.id;
        if (typeof id !== "string") throw new Error("There should be an id parameter as string");


        const fs = adminApp.firestore()

        const doc = await fs.collection(accountCollectionName).doc(id).get();

        const accountData = doc.data();

        if (!accountData) throw new Error("User not found");

        const account = accountData as IAccount;

        const { data: balance } = await axios.get<IPriceResponse>(BASE_URL + "/api/calculation/price", {
            params: {
                addresses: [account.address],
                blockchain: account.blockchain
            }
        })

        let orm: IAccountORM = {
            ...account,
            totalValue: balance.TotalBalance,
            coins: Object.entries(balance.AllPrices).reduce<(IPriceCoin & { name: string })[]>((a, [key, value]) => {
                a.push({
                    ...value,
                    name: key
                })
                return a;
            }, [])
        }

        res.status(200).json(orm);
    } catch (error) {
        res.status(400).json({ error: (error as any).message } as any);
    }

}