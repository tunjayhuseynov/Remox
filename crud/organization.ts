import { FirestoreRead, FirestoreWrite } from "apiHooks/useFirebase"
import { IAccount, IOrganization } from "firebaseConfig"
import { Create_Account, Get_Account, Get_Account_Ref } from "./account"
import { Get_Individual } from "./individual"

export const organizationCollectionName = "organizations"

export const Get_Organization = async (id: string) => {
    const organization = await FirestoreRead<IOrganization>(organizationCollectionName, id)
    if (!organization) throw new Error("Organization not found");

    const accounts = organization.organizationAccounts.map(async (account) => {
        const accountData = await Get_Account(account.id)
        if (!accountData) throw new Error("Account not found");
        return accountData;
    })

    const individual = await Get_Individual(organization.creator.id)
    organization.creator = individual;
    organization.organizationAccounts = await Promise.all(accounts);
    return organization;
}

export const Create_Organization = async (organization: IOrganization) => {
    for (let account of organization.organizationAccounts) {
        await Create_Account(account as IAccount);
        account = Get_Account_Ref(account.id);
    }
    await FirestoreWrite<IOrganization>().createDoc(organizationCollectionName, organization.id, organization)
    return organization;
}


export const Update_Organization = async (organization: IOrganization) => {
    for (let account of organization.organizationAccounts) {
        await Create_Account(account as IAccount);
        account = Get_Account_Ref(account.id);
    }
    await FirestoreWrite<IOrganization>().updateDoc(organizationCollectionName, organization.id, organization)
    return organization;
}
