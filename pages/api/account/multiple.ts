import axios from "axios";
import { individualCollectionName } from "crud/individual";
import { organizationCollectionName } from "crud/organization";
import { IAccount, IIndividual, IOrganization, IUser } from "firebaseConfig";
import { adminApp } from "firebaseConfig/admin";
import { NextApiRequest, NextApiResponse } from "next";
import { BASE_URL } from "utils/api";
import { IAccountORM } from ".";

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


        for (const account of organization.accounts) {
            const { data: Accounts } = await axios.get<IAccountORM>(BASE_URL + "/api/account", {
                params: {
                    id: account.id
                }
            })
            totalBalance += Accounts.totalValue;
            result.push(Accounts);
        }

        res.status(200).json({
            totalBalance,
            accounts: result
        });
    } catch (error) {
        res.status(400).json({ error: (error as any).message } as any);
    }
}