import { FirestoreRead, FirestoreWrite } from "apiHooks/useFirebase"
import { IAccount, IBudgetExercise, IOrganization } from "firebaseConfig"
import { Create_Account, Get_Account, Get_Account_Ref } from "./account"
import { Get_Budget_Exercise, Get_Budget_Exercise_Ref } from "./budget_exercise"
import { Get_Individual } from "./individual"

export const organizationCollectionName = "organizations"

export const Get_Organization = async (id: string) => {
    const organization = await FirestoreRead<IOrganization>(organizationCollectionName, id)
    if (!organization) throw new Error("Organization not found");

    const accounts = organization.accounts.map(async (account) => {
        const accountData = await Get_Account(account.id)
        if (!accountData) throw new Error("Account not found");
        return accountData;
    })

    const budgetExercises = organization.budget_execrises.map(async (budget_execrise) => {
        const accountData = await Get_Budget_Exercise(budget_execrise.id)
        if (!accountData) throw new Error("Account not found");
        return accountData;
    })

    const individual = await Get_Individual(organization.creator.id)
    organization.creator = individual;
    organization.budget_execrises = await Promise.all(budgetExercises);
    organization.accounts = await Promise.all(accounts);
    return organization;
}

export const Create_Organization = async (organization: IOrganization) => {
    for (let account of organization.accounts) {
        await Create_Account(account as IAccount);
        account = Get_Account_Ref(account.id);
    }
    await FirestoreWrite<IOrganization>().createDoc(organizationCollectionName, organization.id, organization)
    return organization;
}


export const Update_Organization = async (organization: IOrganization) => {
    for (let account of organization.accounts) {
        await Create_Account(account as IAccount);
        account = Get_Account_Ref(account.id);
    }
    for (let exercise of organization.budget_execrises) {
        exercise = Get_Budget_Exercise_Ref(exercise.id);
    }
    await FirestoreWrite<IOrganization>().updateDoc(organizationCollectionName, organization.id, organization)
    return organization;
}
