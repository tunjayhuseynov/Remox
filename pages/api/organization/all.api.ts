import axios from "axios";
import { organizationCollectionName } from "crud/organization";
import { IAccount, IBudgetExercise, IIndividual, IOrganization, IRemoxPayTransactions } from "firebaseConfig";
import { adminApp } from "firebaseConfig/admin";
import { NextApiRequest, NextApiResponse } from "next";
import { BASE_URL } from "utils/api";
import { toChecksumAddress } from "web3-utils";
import { payTxCollectionName } from "crud/payTxs";


const AllOrganizations = async (req: NextApiRequest, res: NextApiResponse<IOrganization[] | { message: string }>) => {
    try {
        const { address } = req.query;
        if (typeof address !== "string") throw new Error("Invalid address");

        const organizationDocs = await adminApp.firestore().collection(organizationCollectionName).where(
            "members", "array-contains", toChecksumAddress(address as string)
        ).get()

        const organizations = organizationDocs.docs.map(s => s.data()) as IOrganization[]

        // for (const organization of organizations) {
        //     if (!organization?.notes) {
        //         await adminApp.firestore().collection(organizationCollectionName).doc(organization.id).update({
        //             notes: []
        //         })
        //         organization["notes"] = [];
        //     }
        //     organization.accounts = await Promise.all(organization.accounts.map(async (accountId) => {
        //         const { data } = await axios.get(BASE_URL + '/api/account', {
        //             params: {
        //                 id: accountId.id,
        //                 accountId: organization.id
        //             }
        //         })
        //         // const accountRef = await adminApp.firestore().collection("accounts").doc(accountId.id).get()
        //         // const account = accountRef.data() as IAccount;
        //         return data;
        //     }))

        // }
        // process.setMaxListeners(20)
        let orgList = await Promise.all(organizations.map(async organization => {
            if (!organization?.notes) {
                await adminApp.firestore().collection(organizationCollectionName).doc(organization.id).update({
                    notes: []
                })
                organization["notes"] = [];
            }
            if (!organization?.payTransactions) {
                await adminApp.firestore().collection(organizationCollectionName).doc(organization.id).update({
                    payTransactions: []
                })
                organization["payTransactions"] = [];
            }

            organization.accounts = await Promise.all(organization.accounts.map(async (accountId) => {
                const { data } = await axios.get(BASE_URL + '/api/account', {
                    params: {
                        id: accountId.id,
                        accountId: organization.id,
                        txDisabled: false
                    }
                })
                // const accountRef = await adminApp.firestore().collection("accounts").doc(accountId.id).get()
                // const account = accountRef.data() as IAccount;
                return data;
            }))
            organization.budget_execrises = await Promise.all(organization.budget_execrises.map(async (budgetExecriseId) => {
                return (await adminApp.firestore().collection("budget_exercises").doc(budgetExecriseId.id).get()).data() as IBudgetExercise
            }));
            organization.payTransactions = await Promise.all(organization.payTransactions.map(async (pxId) => {
                return (await adminApp.firestore().collection(payTxCollectionName).doc(pxId.id).get()).data() as IRemoxPayTransactions
            }));
            return organization;
        }))

        return res.json(orgList);
    } catch (error) {
        return res.json({ message: (error as any).message })
    }
}

export default AllOrganizations;