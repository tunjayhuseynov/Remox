import { accountCollectionName } from "crud/account";
import { IAccount } from "firebaseConfig";
import { adminApp } from "firebaseConfig/admin";
import { NextApiRequest, NextApiResponse } from "next";
import axios from "axios";
import { IPriceCoin, IPriceResponse } from "../calculation/price.api";
import { BASE_URL, IPrice } from "utils/api";
import { IAccountMultisig } from "../multisig/index.api";
import axiosRetry from "axios-retry";

export interface IAccountORM extends IAccount {
    multidata: IAccountMultisig | null;
    totalValue: number;
    coins: IPrice[0][]
}

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse<IAccountORM>
) {
    try {
        const id = req.query.id;
        const accountId = req.query.accountId;
        if (typeof id !== "string") throw new Error("There should be an id parameter as string");

        axiosRetry(axios, { retries: 10 });
        const fs = adminApp.firestore()

        const doc = await fs.collection(accountCollectionName).doc(id).get();

        const accountData = doc.data();

        if (!accountData) throw new Error("User not found");

        const account = accountData as IAccount;

        let reqs = [];

        let priceReq = axios.get<IPriceResponse>(BASE_URL + "/api/calculation/price", {
            params: {
                addresses: [account.address],
                blockchain: account.blockchain
            }
        })

        reqs.push(priceReq);

        let multidata: IAccountORM["multidata"] = null;
       
        if (account.signerType === "multi") {
            const multisigReq = axios.get<IAccountMultisig>(BASE_URL + "/api/multisig", {
                params: {
                    id,
                    accountId: account.id,
                    blockchain: account.blockchain,
                    Skip: 0,
                    Take: 10
                }
            })
            reqs.push(multisigReq);
        }
        
        const [{ data: balanceRes }, multisigRes] = await Promise.all(reqs)
       
        const balance = balanceRes as IPriceResponse;

        if (multisigRes) {
            multidata = multisigRes.data as IAccountMultisig;
        }

        let orm: IAccountORM = {
            ...account,
            multidata,
            totalValue: balance.TotalBalance,
            coins: Object.entries(balance.AllPrices).reduce<(IPrice[0])[]>((a, [key, value]) => {
                a.push({
                    ...value,
                    name: key
                })
                return a;
            }, [])
        }

        res.status(200).json(orm);
    } catch (error) {
        throw error;
    }

}