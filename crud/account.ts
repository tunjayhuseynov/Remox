import { FirestoreRead, FirestoreWrite } from "rpcHooks/useFirebase"
import { arrayRemove, arrayUnion, doc, FieldValue } from "firebase/firestore";
import { db, IAccount, IMember } from "firebaseConfig"

export const accountCollectionName = "accounts"

export const Get_Account_Ref = (id: string) => {
    return doc(db, accountCollectionName, id);
}

export const Get_Account = async (id: string) => {
    return await FirestoreRead<IAccount>(accountCollectionName, id)
}

type AccountORM = Omit<IAccount, "id" | "created_date"> & { readonly id: string, readonly created_date: number }
export const Get_AccountORM = async (id: string) => {
    return await FirestoreRead<AccountORM>(accountCollectionName, id)
}

export const Create_Account = async (account: IAccount) => {
    await FirestoreWrite<IAccount>().createDoc(accountCollectionName, account.id, account);
}

export const Update_Account = async (account: IAccount) => {
    await FirestoreWrite<IAccount>().updateDoc(accountCollectionName, account.id, account);
}

export const Remove_Member_From_Account = async (account: IAccount, member: IMember) => {
    await FirestoreWrite<Pick<IAccount, "members">>().updateDoc(accountCollectionName, account.id, {
        members: account.members.filter(s => s.id !== member.id)
    })
}

export const Add_Member_To_Account = async (account: IAccount, member: IMember) => {
    await FirestoreWrite<{ members: FieldValue }>().updateDoc(accountCollectionName, account.id, {
        members: arrayUnion(member)
    })
}

export const Update_Members_In_Account = async (account: IAccount, members: IMember[]) => {
    await FirestoreWrite<Pick<IAccount, "members">>().updateDoc(accountCollectionName, account.id, {
        members: members
    })
}
