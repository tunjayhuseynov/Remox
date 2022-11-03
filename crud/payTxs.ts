import { FirestoreRead, FirestoreWrite } from "rpcHooks/useFirebase"
import { arrayRemove, arrayUnion, doc, FieldValue } from "firebase/firestore";
import { db, IAccount, IMember, IRemoxPayTransactions } from "firebaseConfig"

export const payTxCollectionName = "payTransactions"

export const Get_PayTx_Ref = (id: string) => {
    return doc(db, payTxCollectionName, id);
}

export const Get_PayTx = async (id: string) => {
    
    const tx = await FirestoreRead<IRemoxPayTransactions>(payTxCollectionName, id)
    if (!tx) throw new Error("Remox Pay Tx not found");
    return tx;
}

export const Create_PayTx = async (PayTx: IRemoxPayTransactions) => {
    await FirestoreWrite<IRemoxPayTransactions>().createDoc(payTxCollectionName, PayTx.id, PayTx);
}

export const Update_PayTx = async (PayTx: IRemoxPayTransactions) => {
    await FirestoreWrite<IRemoxPayTransactions>().updateDoc(payTxCollectionName, PayTx.id, PayTx);
}