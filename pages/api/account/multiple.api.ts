import axios from "axios";
import { individualCollectionName } from "crud/individual";
import { organizationCollectionName } from "crud/organization";
import { IIndividual, IOrganization } from "firebaseConfig";
import { adminApp } from "firebaseConfig/admin";
import { NextApiRequest, NextApiResponse } from "next";
import { BASE_URL } from "utils/api";
import { IAccountORM } from "./index.api";

export interface IRemoxAccountORM {
    accounts: IAccountORM[];
    totalBalance: number;
}

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse<IRemoxAccountORM>
) {
    try {
        const id = req.query.id;
        const type = req.query.type;
        if (typeof id !== "string") throw new Error("There should be an id parameter as string");
        if (typeof type !== "string" || type !== 'organization' && type !== 'individual') throw new Error("There should be a type parameter as [organization | individual]");


        const fs = adminApp.firestore()

        const doc = await fs.collection(type === "organization" ? organizationCollectionName : individualCollectionName).doc(id).get();

        const Data = doc.data();

        if (!Data) throw new Error(`${type} not found`);

        let result: IAccountORM[] = [];
        let totalBalance = 0;
        const organization = Data as IOrganization | IIndividual;

        const list = await Promise.all(organization.accounts.map(acc => axios.get<IAccountORM>(BASE_URL + "/api/account", {
            params: {
                id: acc.id
            }
        })
        ));

        for (const account of list) {
            totalBalance += account.data.totalValue;
            result.push(account.data);
        }

        res.status(200).json({
            totalBalance,
            accounts: result
        });
    } catch (error) {
        res.status(400).json({ error: (error as any).message } as any);
    }
}