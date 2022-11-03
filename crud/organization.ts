import { FirestoreRead, FirestoreReadMultiple, FirestoreWrite } from "rpcHooks/useFirebase"
import { IAccount, IBudgetExercise, IOrganization, IRemoxPayTransactions } from "firebaseConfig"
import { Create_Account, Get_Account, Get_Account_Ref } from "./account"
import { Get_Budget_Exercise, Get_Budget_Exercise_Ref } from "./budget_exercise"
import { Get_Individual } from "./individual"
import { arrayRemove, arrayUnion } from "firebase/firestore"
import type { DocumentReference, FieldValue } from "firebase/firestore"
import { log } from "console"
import { Create_PayTx, Get_PayTx, Get_PayTx_Ref } from "./payTxs"

export const organizationCollectionName = "organizations"

export const Get_Organization = async (id: string) => {
    const organization = await FirestoreRead<IOrganization>(organizationCollectionName, id)
    if (!organization) throw new Error("Organization not found");

    const accounts = organization.accounts.map(async (account) => {
        const accountData = await Get_Account(account.id)
        if (!accountData) throw new Error("Account not found");
        return accountData;
    })

    const payTxs = organization.payTransactions.map(async (tx) => {
        const txData = await Get_PayTx(tx.id)
        if (!txData) throw new Error("Account not found");
        return txData;
    })

    const budgetExercises = organization.budget_execrises.map(async (budget_execrise) => {
        const accountData = await Get_Budget_Exercise(budget_execrise.id)
        if (!accountData) throw new Error("Account not found");
        return accountData;
    })

    // const individual = await Get_Individual(organization.creator.id)
    // if (individual) organization.creator = individual;
    organization.budget_execrises = await Promise.all(budgetExercises);
    organization.accounts = await Promise.all(accounts);
    organization.payTransactions = await Promise.all(payTxs);
    return organization;
}

export const Get_Organizations = async (address: string) => {
    const organization = await FirestoreReadMultiple<IOrganization>(organizationCollectionName, [
        {
            firstQuery: "members",
            condition: "array-contains",
            secondQuery: address
        }
    ])

    return organization;
}

export const Create_Organization = async (organization: IOrganization) => {
    let accountRefs: DocumentReference[] = []
    for (let account of organization.accounts) {
        await Create_Account(account as IAccount);
        account = Get_Account_Ref(account.id);
        accountRefs.push(account)
    }
    organization.accounts = accountRefs;
    console.log("Accounts created")
    await FirestoreWrite<IOrganization>().createDoc(organizationCollectionName, organization.id, organization)
    return organization;
}


export const Update_Organization = async (org: IOrganization) => {
    let organization = Object.assign({}, org);
    let accountRefs: DocumentReference[] = []
    for (let account of organization.accounts) {
        if (!(await Get_Account(account.id))) {
            await Create_Account(account as IAccount);
        }
        accountRefs = [...accountRefs, Get_Account_Ref(account.id)];
    }
    let exec: DocumentReference[] = []
    for (let exercise of organization.budget_execrises) {
        exec = [...exec, Get_Budget_Exercise_Ref(exercise.id) ];
    }

    let txs : DocumentReference[] = []
    for (const tx of organization.payTransactions) {
        if (!(await Get_PayTx(tx.id))) {
            await Create_PayTx(tx as IRemoxPayTransactions);
        }
        txs = [...txs, Get_PayTx_Ref(tx.id)];
    }


    organization.payTransactions = txs;
    organization.budget_execrises = exec;
    organization.accounts = accountRefs;

    await FirestoreWrite<IOrganization>().updateDoc(organizationCollectionName, organization.id, organization)
    return organization;
}

export const Add_New_Organization_Account = async (organization: IOrganization, account: IAccount) => {
    await FirestoreWrite<{ accounts: FieldValue }>().updateDoc(organizationCollectionName, organization.id, {
        accounts: arrayUnion(Get_Account_Ref(account.id))
    })
}

export const Remove_Organization_Account = async (organization: IOrganization, account: IAccount) => {
    await FirestoreWrite<{ accounts: FieldValue }>().updateDoc(organizationCollectionName, organization.id, {
        accounts: arrayRemove(Get_Account_Ref(account.id))
    })
}
