import { createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";
import { IPaymentDataBody, ISendTx } from "pages/api/payments/send/index.api";


export const FetchPaymentData = createAsyncThunk<ISendTx | ISendTx[], IPaymentDataBody>("remoxData/fetchPayment", async ({ blockchain, executer, requests, createStreaming, endTime, startTime, cancelStreaming, streamId, swap, walletAddress }) => {
    try {
        const req = await axios.post<ISendTx>("/api/payments/send", {
            blockchain,
            executer,
            requests,
            createStreaming,
            startTime,
            endTime,
            cancelStreaming,
            streamId,
            swap,
            walletAddress
        })

        return req.data;
    } catch (error) {
        throw Error((error as any)?.response?.data?.error ?? (error as any).message);
    }
})