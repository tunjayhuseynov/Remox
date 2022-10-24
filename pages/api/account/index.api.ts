import { accountCollectionName } from "crud/account";
import { IAccount } from "firebaseConfig";
import { adminApp } from "firebaseConfig/admin";
import { NextApiRequest, NextApiResponse } from "next";
import axios from "axios";
import { IPriceResponse } from "../calculation/price.api";
import { BASE_URL, IPrice } from "utils/api";
import { IAccountMultisig } from "../multisig/index.api";
import axiosRetry from "axios-retry";
import { nanoid } from "@reduxjs/toolkit";

export interface IAccountORM extends IAccount {
    multidata: IAccountMultisig | null;
    coins: IPrice[0][]
}

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse<IAccountORM>
) {
    try {
        const id = req.query.id;
        const accountId = req.query.accountId;
        const txDisabled = req.query.txDisabled;

        if (typeof id !== "string") throw new Error("There should be an id parameter as string");

        axiosRetry(axios, { retries: 10 });
        const fs = adminApp.firestore()

        const doc = await fs.collection(accountCollectionName).doc(id).get();

        const accountData = doc.data();

        if (!accountData) throw new Error("User not found");

        const account = accountData as IAccount;

        if (!account?.["pendingMembersObjects"]) {
            await fs.collection(accountCollectionName).doc(id).update({
                pendingMembersObjects: []
            })
        }

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
                    accountId: accountId,
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
            if (account.members.length !== multidata.owners.length) {
                for (const owner of multidata.owners) {
                    if (!account.members.find(s => s.address === owner)) {
                        account.members = [...account.members, {
                            address: owner,
                            name: owner,
                            id: nanoid(),
                            image: null,
                            mail: null,
                        }]
                    }
                }
            }
        }

        const members = account.members.filter(s => multidata?.owners.some(d => d.toLowerCase() === s.address.toLowerCase()));

        let orm: IAccountORM = {
            ...account,
            members: multidata ? members : account.members,
            multidata,
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