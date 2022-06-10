import axios from "axios";
import { accountCollectionName } from "crud/account";
import { organizationCollectionName } from "crud/organization";
import { IAccount, IOrganization } from "firebaseConfig";
import { adminApp } from "firebaseConfig/admin";
import { NextApiRequest, NextApiResponse } from "next";
import { IOrganizationORM } from "types/orm";
import { IPriceResponse } from "../calculation/price";

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse<any>
) {
    const id = req.query.member;
    if (!id) throw new Error("No id param")

    const organizationRef = await adminApp.firestore().collection(organizationCollectionName).doc(id as string).get()
    const organization = organizationRef.data() as IOrganization | undefined;
    if (!organization) throw new Error("No organization")

    let totalBalance: number = 0;
    let accounts: IAccount[] = []

    for (const account of organization.accounts) {
        const resAcc = await adminApp.firestore().collection(accountCollectionName).doc(account.id).get()
        const data = resAcc.data()
        if (data) {
            let acc = data as IAccount;
            const { data: price } = await axios.get<IPriceResponse>("/api/calculation/price", {
                params: {
                    blockchain: acc.blockchain,
                    addresses: [acc.address],
                }
            })

            totalBalance += price.TotalBalance;
            accounts.push(acc)
        }
    }
    organization.accounts = accounts;

    let response: IOrganizationORM = {
        ...organization,
        totalBalance
    }

    res.status(200).json(response)

}