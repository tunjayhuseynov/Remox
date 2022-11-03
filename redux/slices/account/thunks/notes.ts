import { createAsyncThunk } from "@reduxjs/toolkit";
import { Create_PayTx, Get_PayTx_Ref } from "crud/payTxs";
import { arrayUnion, DocumentReference } from "firebase/firestore";
import { INotes, IRemoxPayTransactions } from "firebaseConfig";
import { RootState } from "redux/store";
import { FirestoreWrite } from "rpcHooks/useFirebase";
import { addPayTransaction } from "../remoxData";

export const Add_Notes_Thunk = createAsyncThunk<INotes, { note: INotes }>("remoxData/add_notes", async ({ note }, api) => {
    const state = (api.getState() as RootState)
    const accountType = state.remoxData.accountType;
    const id = state.remoxData.storage?.organization?.id ?? state.remoxData.storage?.individual.id;
    if (!id) throw new Error("No Id Found")

    await FirestoreWrite().updateDoc(accountType === "organization" ? "organizations" : "individuals", id, {
        notes: arrayUnion(note)
    })

    return note;
})

export const Add_Pay_Transactions = createAsyncThunk("remoxData/add_pay_transactions", async (transactions: IRemoxPayTransactions[], api) => {
    const state = (api.getState() as RootState);
    const accountType = state.remoxData.accountType;
    const id = state.remoxData.storage?.organization?.id ?? state.remoxData.storage?.individual.id;
    if (!id) throw new Error("No Id Found")

    let txIds: DocumentReference[] = [];
    for (const tx of transactions) {
        await Create_PayTx(tx)
        txIds.push(Get_PayTx_Ref(tx.id))
    }

    await FirestoreWrite().updateDoc(accountType === "organization" ? "organizations" : "individuals", id, {
        payTransactions: arrayUnion(...txIds)
    })

    api.dispatch(addPayTransaction(transactions))
})