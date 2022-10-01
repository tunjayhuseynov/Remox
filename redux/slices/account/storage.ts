import { createSlice } from "@reduxjs/toolkit";
import { IAccount, IBudgetExercise, IIndividual, IOrganization } from "firebaseConfig";
import { RootState } from "../../store";

export interface IStorage {
    uid: string,
    lastSignedProviderAddress: string,
    signType: "individual" | "organization",
    organization: IOrganization | null,
    individual: IIndividual,
}

interface IStorageContainer {
    user: IStorage | null,
}

const initialState = (): IStorageContainer => {
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
        addAccount: (state: IStorageContainer, action: { payload: IAccount }) => {
            if (state.user) {
                if (state.user.signType === "organization" && state.user.organization) {
                    (state.user.organization.accounts as IAccount[]).push(action.payload)
                } else {
                    (state.user.individual.accounts as IAccount[]).push(action.payload)
                }
            }
        },
        setOrganization: (state: IStorageContainer, action: { payload: IOrganization }) => {
            if (state.user) {
                state.user.organization = action.payload
                state.user.signType = "organization"
            }
        },
        setIndividual: (state: IStorageContainer, action: { payload: IIndividual }) => {
            if (state.user) {
                state.user.individual = action.payload
                state.user.signType = "individual"
            }
        },
        setStorage: (state: IStorageContainer, action: { payload: IStorage }) => {
            const data: IStorage = action.payload
            state.user = data
        },
        removeStorage: (state: IStorageContainer) => {
            state.user = null;
        }
    }
})

export const { setStorage, removeStorage, setOrganization, addAccount, setIndividual } = storageSlice.actions

export const selectStorage = (state: RootState) => state.storage.user

export default storageSlice.reducer