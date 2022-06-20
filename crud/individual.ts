import { FirestoreRead, FirestoreWrite } from "rpcHooks/useFirebase";
import { db, IIndividual } from "firebaseConfig";
import { Get_Budget_Exercise, Get_Budget_Exercise_Ref } from "./budget_exercise";
import { doc, DocumentReference } from "firebase/firestore";

export const individualCollectionName = "individuals"

export const Get_Individual_Ref = (id: string)=> doc(db, individualCollectionName, id);

export const Get_Individual = async (id: string) => {
    const individual = await FirestoreRead<IIndividual>(individualCollectionName, id)
    if (!individual) return undefined;
    const budgetExercises = individual.budget_execrises.map(async (budget_execrise) => {
        return await Get_Budget_Exercise(budget_execrise.id)
    })
    individual.budget_execrises = await Promise.all(budgetExercises);
    return individual;
}

export const Create_Individual = async (individual: IIndividual) => {
    let exerciseRef: DocumentReference[] = []
    for (let exercise of individual.budget_execrises) {
        exerciseRef.push(Get_Budget_Exercise_Ref(exercise.id));
    }
    individual.budget_execrises = exerciseRef;
    await FirestoreWrite<IIndividual>().createDoc(individualCollectionName, individual.id, individual);
    return individual;
}

export const Update_Individual = async (individual: IIndividual) => {
    await FirestoreWrite<IIndividual>().updateDoc(individualCollectionName, individual.id, individual);
    return individual;
}

export const Delete_Individual = async (individual: IIndividual) => {
    await FirestoreWrite<IIndividual>().deleteDocument(individualCollectionName, individual.id);
}
