import { createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";
import { IPaymentDataBody, ISendTx } from "pages/api/payments/send";


export const FetchPaymentData = createAsyncThunk<ISendTx, IPaymentDataBody>("remoxData/fetchPayment", async ({ blockchain, executer, requests, isStreaming, endTime, startTime }) => {

    const req = await axios.post<ISendTx>("/api/payments/send", {
        blockchain,
        executer,
        requests,
        isStreaming,
        startTime,
        endTime
    })

    return req.data;
})