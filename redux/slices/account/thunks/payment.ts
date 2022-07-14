import { createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";
import { IPaymentDataBody, ISendTx } from "pages/api/payments/send";


export const FetchPaymentData = createAsyncThunk<ISendTx, IPaymentDataBody>("remoxData/fetchPayment", async ({ blockchain, executer, requests }) => {

    const req = await axios.post<ISendTx>("/api/payments/send", {
        blockchain,
        executer,
        requests
    })

    return req.data;
})