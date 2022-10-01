import { createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";
import { IPriceResponse } from "pages/api/calculation/price.api";
import { RootState } from "redux/store";
import { BlockchainType } from "types/blockchains";


export const Refresh_Balance_Thunk = createAsyncThunk<IPriceResponse, { blockchain: BlockchainType }>("remoxData/refresh_balance", async ({ blockchain }, api) => {
    const addresses = (api.getState() as RootState).remoxData.accounts;

    const { data } = await axios.get<IPriceResponse>("/api/calculation/price", {
        params: {
            addresses: addresses.map(s => s.address),
            blockchain: blockchain.name,
        },
    });

    return data;
})