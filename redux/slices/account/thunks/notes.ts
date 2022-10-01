import { createAsyncThunk } from "@reduxjs/toolkit";
import { arrayUnion } from "firebase/firestore";
import { INotes } from "firebaseConfig";
import { RootState } from "redux/store";
import { FirestoreWrite } from "rpcHooks/useFirebase";

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