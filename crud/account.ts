import { FirestoreRead, FirestoreWrite } from "rpcHooks/useFirebase"
import { doc } from "firebase/firestore";
import { db, IAccount } from "firebaseConfig"

const collectionName = "accounts"

export const Get_Account_Ref = (id: string) => {
    return doc(db, collectionName, id);
}

export const Get_Account = async (id: string) => {
    return await FirestoreRead<IAccount>(collectionName, id)
}

type AccountORM = Omit<IAccount, "id" | "created_date"> & { readonly id: string, readonly created_date: number }
export const Get_AccountORM = async (id: string) => {
    return await FirestoreRead<AccountORM>(collectionName, id)
}

export const Create_Account = async (account: IAccount) => {
    await FirestoreWrite<IAccount>().createDoc(collectionName, account.id, account);
}

export const Update_Account = async (account: IAccount) => {
    await FirestoreWrite<IAccount>().updateDoc(collectionName, account.id, account);
}