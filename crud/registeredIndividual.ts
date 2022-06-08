import { FirestoreRead, FirestoreWrite } from "rpcHooks/useFirebase";
import { IRegisteredIndividual } from "firebaseConfig";

export const registeredIndividualCollectionName = "registrationIndividuals"

export const Get_Registered_Individual = async (id: string) => {
    const individual = await FirestoreRead<IRegisteredIndividual>(registeredIndividualCollectionName, id)
    if (!individual) throw new Error("Individual not found");
    return individual;
}

export const Create_Registered_Individual = async (individual: IRegisteredIndividual) => {
    await FirestoreWrite<IRegisteredIndividual>().createDoc(registeredIndividualCollectionName, individual.id, individual);
    return individual;
}

export const Update_Registered_Individual = async (individual: IRegisteredIndividual) => {
    await FirestoreWrite<IRegisteredIndividual>().updateDoc(registeredIndividualCollectionName, individual.id, individual);
    return individual;
}

export const Delete_Registered_Individual = async (individual: IRegisteredIndividual) => {
    await FirestoreWrite<IRegisteredIndividual>().deleteDocument(registeredIndividualCollectionName, individual.id);
}
