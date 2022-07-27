import { createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";
import { IFormattedTransaction } from "hooks/useTransactionProcess";
import { IRemoxAccountORM } from "pages/api/account/multiple.api";
import { IPriceResponse } from "pages/api/calculation/price.api";
import { ISpendingResponse } from "pages/api/calculation/_spendingType.api";
import { RootState } from "redux/store";

interface IReturnType {
    spending: ISpendingResponse,
    RemoxAccount: IRemoxAccountORM,
    transactions: IFormattedTransaction[],
    balance: IPriceResponse,
}

export const Refresh_Data_Thunk = createAsyncThunk<IReturnType>("remoxData/refresh_data", async (_, api) => {
    const addresses = (api.getState() as RootState).remoxData.accounts.map(account => account.address);
    const blockchain = (api.getState() as RootState).remoxData.blockchain;
    const id = (api.getState() as RootState).remoxData.providerID;
    const accountType = (api.getState() as RootState).remoxData.accountType;
    if (!blockchain) throw new Error("Blockchain is not set");

    const spending = axios.get<ISpendingResponse>("/api/calculation/spending", {
        params: {
            addresses: addresses,
            blockchain: blockchain.name,
            id: id,
        }
    });

    const balances = axios.get<IPriceResponse>("/api/calculation/price", {
        params: {
            addresses: addresses,
            blockchain: blockchain.name,
        }
    });

    const transactions = axios.get<IFormattedTransaction[]>("/api/transactions", {
        params: {
            addresses: addresses,
            blockchain: blockchain.name,
            id: id,
        }
    });

    const accountReq = axios.get<IRemoxAccountORM>("/api/account/multiple", {
        params: {
            id: id,
            type: accountType
        }
    });

    const [spendingRes, accountRes, transactionRes, balanceRes] = await Promise.all([spending, accountReq, transactions, balances]);

    return {
        spending: spendingRes.data,
        RemoxAccount: accountRes.data,
        transactions: transactionRes.data,
        balance: balanceRes.data,
    }

})