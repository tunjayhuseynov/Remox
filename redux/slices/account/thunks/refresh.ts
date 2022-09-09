import { createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";
import { IFormattedTransaction } from "hooks/useTransactionProcess";
import { IRemoxAccountORM } from "pages/api/account/multiple.api";
import { IPriceResponse } from "pages/api/calculation/price.api";
import { ISpendingResponse } from "pages/api/calculation/_spendingType.api";
import { IAccountMultisig } from "pages/api/multisig/index.api";
import { RootState } from "redux/store";
import { IRemoxData } from "../remoxData";
import { Multisig_Fetch_Thunk } from "./multisig";

interface IReturnType {
    spending: ISpendingResponse,
    RemoxAccount: IRemoxAccountORM,
    transactions: IFormattedTransaction[],
    balance: IPriceResponse,
    cumulativeTransactions: IRemoxData["cumulativeTransactions"];
    multisigAccounts: {
        all: IAccountMultisig[];
        multisigTxs: IAccountMultisig["txs"];
        pendingTxs: IAccountMultisig["txs"];
        approvedTxs: IAccountMultisig["txs"];
        rejectedTxs: IAccountMultisig["txs"];
        signingNeedTxs: IAccountMultisig["txs"];
    };
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

    const accounts = accountRes.data;
    const multi = accounts.accounts.filter((s) => s.signerType === "multi");
    const d = multi[0].multidata

    const {
        approvedRequests,
        multisigRequests,
        pendingRequests,
        rejectedRequests,
        signingNeedRequests,
        multisigAccounts,
    } = await api
        .dispatch(
            Multisig_Fetch_Thunk({
                accounts: multi,
                blockchain: blockchain.name,
                addresses: multi.map((s) => s.address),
                fetchable: false
            })
        )
        .unwrap();

    let allCumulativeTransactions = [
        ...transactionRes.data,
        ...multisigRequests,
    ].sort((a, b) => (a.timestamp > b.timestamp ? -1 : 1));

    return {
        spending: spendingRes.data,
        RemoxAccount: accountRes.data,
        transactions: transactionRes.data,
        balance: balanceRes.data,
        cumulativeTransactions: allCumulativeTransactions,
        multisigAccounts: {
            all: multisigAccounts,
            multisigTxs: multisigRequests,
            pendingTxs: pendingRequests,
            approvedTxs: approvedRequests,
            rejectedTxs: rejectedRequests,
            signingNeedTxs: signingNeedRequests,
        },
    }

})