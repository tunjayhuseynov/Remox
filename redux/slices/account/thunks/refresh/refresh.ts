import { createAsyncThunk } from "@reduxjs/toolkit";
import { auth } from "firebaseConfig";
import { RootState } from "redux/store";
import { launchApp } from "../launch";


export const Refresh_Data_Thunk = createAsyncThunk<boolean>("remoxData/refresh_data", async (_, api) => {
    const state = api.getState() as RootState

    const accountType = state.remoxData.accountType;
    if (!accountType) throw new Error("Account type not found")

    const accounts = state.remoxData.accounts;

    const blockchain = state.remoxData.blockchain;

    const id = state.remoxData.storage?.organization?.id ?? state.remoxData.storage?.individual.id
    if (!id) throw new Error("ID not found")

    const authId = auth.currentUser?.uid;
    if (!authId) throw new Error("Auth ID not found")

    const providerAddress = state.remoxData.providerAddress;
    if (!providerAddress) throw new Error("Provider address not found")

    const individual = state.remoxData.storage?.individual;
    if (!individual) throw new Error("Individual not found")

    const organization = state.remoxData.storage?.organization;

    await api.dispatch(launchApp({
        accountType: accountType,
        addresses: accounts,
        blockchain: blockchain,
        id: id,
        storage: {
            lastSignedProviderAddress: providerAddress,
            signType: accountType,
            uid: authId,
            individual: individual,
            organization: accountType === "organization" && organization ? organization : null,
        }
    }))

    return true
})