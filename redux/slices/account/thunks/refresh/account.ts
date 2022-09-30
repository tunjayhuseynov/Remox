import { createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";
import { IRemoxAccountORM } from "pages/api/account/multiple.api";
import { RootState } from "redux/store";
import { IAccountType } from "../../remoxData";


export const Refresh_Accounts_Thunk = createAsyncThunk<IRemoxAccountORM, {}>("remoxData/refresh_accounts", async ({ }, api) => {
    const state = (api.getState() as RootState)
    const type = state.remoxData.accountType as IAccountType;
    const id = state.remoxData.storage?.organization?.id ?? state.remoxData.storage?.individual.id;
    if (!id) throw new Error("No id found in storage");

    const { data } = await axios.get<IRemoxAccountORM>("/api/account/multiple", {
        params: {
            id: id,
            type: type === "organization" ? "organization" : "individual",
        },
    });


    return data;
})