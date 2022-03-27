import { createSlice } from "@reduxjs/toolkit";
import { RootState } from "../store";

export interface IStorage {
    accountAddress: string,
    allAccounts: string[],
    token: string,
    uid: string,
    encryptedMessageToken: string,
    contractAddress?: string,
    name?: string;
    surname?: string,
    companyName?: string,
}

interface IContainer {
    user: IStorage | null, 
}

const initialState = (): IContainer => {
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
        setStorage: (state, action: {payload: IStorage}) => {
            localStorage.setItem("remoxUser", JSON.stringify(action.payload))
            const data: IStorage = action.payload
            state.user = data
        },
        removeStorage: (state) => {
            localStorage.removeItem("remoxUser")
            state.user = null;
        }
    }
})

export const { setStorage, removeStorage } = storageSlice.actions

export const selectStorage = (state: RootState) => state.storage.user

export default storageSlice.reducer