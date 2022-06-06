import { createSlice } from "@reduxjs/toolkit";
import { IBudgetExercise, IIndividual, IOrganization } from "firebaseConfig";
import { RootState } from "../store";

export interface IStorage {
    uid: string,
    lastSignedProviderAddress: string,
    signType: "individual" | "organization",
    organization: IOrganization | null,
    individual: IIndividual,
}

interface IContainer {
    user: IStorage | null,
}

const initialState = (): IContainer => {
    if (typeof window === 'undefined') return { user: null }
    const val = localStorage.getItem("remoxUser")

    if (val) {
        const data: IStorage = JSON.parse(val)
        return { user: data }
    }
    return { user: null };
}


export const storageSlice = createSlice({
    name: "storage",
    initialState: initialState(),
    reducers: {
        setStorage: (state: IContainer, action: { payload: IStorage }) => {
            localStorage.setItem("remoxUser", JSON.stringify(action.payload))
            const data: IStorage = action.payload
            state.user = data
        },
        removeStorage: (state: IContainer) => {
            localStorage.removeItem("remoxUser")
            state.user = null;
        }
    }
})

export const { setStorage, removeStorage } = storageSlice.actions

export const selectStorage = (state: RootState) => state.storage.user

export default storageSlice.reducer