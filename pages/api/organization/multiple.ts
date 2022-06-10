import axios from "axios";
import { organizationCollectionName } from "crud/organization";
import { IOrganization } from "firebaseConfig";
import { adminApp } from "firebaseConfig/admin";
import { NextApiRequest, NextApiResponse } from "next";
import { IOrganizationORM } from "types/orm";

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse<IOrganizationORM[]>
) {
    const member = req.query.member;
    if (!member) throw new Error("No member param")

    const organizations = await adminApp.firestore().collection(organizationCollectionName).where("members", "array-contains", member as string).get()

    let response: IOrganizationORM[] = []

    for (const organization of organizations.docs) {
        const data = organization.data() as IOrganization | undefined

        if (data) {
            const { data: org } = await axios.get<IOrganizationORM>("/api/organization", {
                params: {
                    member: data.id
                }
            })

            response.push(org)
        }

    }


    res.status(200).json(response)
}