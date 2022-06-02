import { FirestoreRead, FirestoreWrite } from "apiHooks/useFirebase";
import { IIndividual } from "firebaseConfig";

export const individualCollectionName = "individuals"

export const Get_Individual = async (id: string) => {
    const individual = await FirestoreRead<IIndividual>(individualCollectionName, id)
    if (!individual) throw new Error("Individual not found");
    return individual;
}

export const Create_Individual = async (individual: IIndividual) => {
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
