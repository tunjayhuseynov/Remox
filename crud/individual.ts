import { FirestoreRead, FirestoreWrite } from "rpcHooks/useFirebase";
import { db, IAccount, IIndividual } from "firebaseConfig";
import { Get_Budget_Exercise, Get_Budget_Exercise_Ref } from "./budget_exercise";
import { arrayUnion, doc, DocumentReference, FieldValue } from "firebase/firestore";
import { Create_Account, Get_Account, Get_Account_Ref } from "./account";

export const individualCollectionName = "individuals"

export const Get_Individual_Ref = (id: string) => doc(db, individualCollectionName, id);

export const Get_Individual = async (id: string) => {
    const individual = await FirestoreRead<IIndividual>(individualCollectionName, id)
    if (!individual) return undefined;

    const accounts = individual.accounts.map(async (account) => {
        const accountData = await Get_Account(account.id)
        // if (!accountData) throw new Error("Account not found");
        return accountData;
    })

    const budgetExercises = individual.budget_execrises.map(async (budget_execrise) => {
        return await Get_Budget_Exercise(budget_execrise.id)
    })

    individual.budget_execrises = await Promise.all(budgetExercises);
    individual.accounts = (await Promise.all(accounts)).filter(s => s !== undefined) as IAccount[];

    return individual;
}

export const Create_Individual = async (individualFreeze: IIndividual) => {
    let individual = { ...individualFreeze }
    let exerciseRef: DocumentReference[] = []
    for (let exercise of individual.budget_execrises) {
        exerciseRef.push(Get_Budget_Exercise_Ref(exercise.id));
    }

    let accountRefs: DocumentReference[] = []
    for (let account of individual.accounts) {
        await Create_Account(account as IAccount)
        accountRefs.push(Get_Account_Ref(account.id));
    }

    individual.accounts = [...accountRefs];
    individual.budget_execrises = [...exerciseRef];
    await FirestoreWrite<IIndividual>().createDoc(individualCollectionName, individual.id, individual);
    return individual;
}

export const Update_Individual = async (individualFreeze: IIndividual) => {
    let individual = { ...individualFreeze }
    let exerciseRef: DocumentReference[] = []
    for (let exercise of individual.budget_execrises) {
        exerciseRef.push(Get_Budget_Exercise_Ref(exercise.id));
    }

    let accountRefs: DocumentReference[] = []
    for (let account of individual.accounts) {
        accountRefs.push(Get_Account_Ref(account.id));
    }
    individual.accounts = [...accountRefs];
    individual.budget_execrises = [...exerciseRef];
    await FirestoreWrite<IIndividual>().updateDoc(individualCollectionName, individual.id, individual);
    return individual;
}

export const Add_New_Individual_Account = async (individual: IIndividual, account: IAccount) => {
    await FirestoreWrite<{ accounts: FieldValue }>().updateDoc(individualCollectionName, individual.id, {
        accounts: arrayUnion(Get_Account_Ref(account.id))
    })
}

export const Delete_Individual = async (individual: IIndividual) => {
    await FirestoreWrite<IIndividual>().deleteDocument(individualCollectionName, individual.id);
}
