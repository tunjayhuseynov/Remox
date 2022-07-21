import axios from "axios";
import { createAsyncThunk } from "@reduxjs/toolkit";
import { IFormattedTransaction } from "hooks/useTransactionProcess";
import type { BlockchainType } from "hooks/walletSDK/useWalletKit";
import type { IRemoxAccountORM } from "pages/api/account/multiple";
import type { IBudgetExerciseORM } from "pages/api/budget";
import type { ISpendingResponse } from "pages/api/calculation/_spendingType";
import type { IContributor } from "types/dashboard/contributors";
import type { IAccountType, IRemoxData } from "../remoxData";
import type { IStorage } from "../storage";
import { IAccountMultisig } from "pages/api/multisig";
import { IRequest } from "rpcHooks/useRequest";
import { IPriceResponse } from "pages/api/calculation/price";
import { ITag } from "pages/api/tags";
import { Multisig_Fetch_Thunk } from "./multisig";

type LaunchResponse = {
    Balance: IPriceResponse;
    RemoxAccount: IRemoxAccountORM,
    Budgets: IBudgetExerciseORM[],
    Spending: ISpendingResponse,
    Contributors: IContributor[],
    Blockchain: BlockchainType,
    Storage: IStorage,
    Transactions: IFormattedTransaction[],
    Requests: IRequest[],
    Tags: ITag[],
    multisigAccounts: {
        all: IAccountMultisig[],
        multisigTxs: IAccountMultisig["txs"],
        pendingTxs: IAccountMultisig["txs"],
        approvedTxs: IAccountMultisig["txs"],
        rejectedTxs: IAccountMultisig["txs"],
        signingNeedTxs: IAccountMultisig["txs"],
    },
    cumulativeTransactions: IRemoxData["cumulativeTransactions"],
}

interface LaunchParams {
    addresses: string[],
    blockchain: BlockchainType,
    accountType: IAccountType,
    id: string,
    storage: IStorage,
}

export const launchApp = createAsyncThunk<LaunchResponse, LaunchParams>("remoxData/launch", async ({ addresses, blockchain, id, accountType, storage }, api) => {
    const spending = axios.get<ISpendingResponse>("/api/calculation/spending", {
        params: {
            addresses: addresses,
            blockchain: blockchain,
            id: id,
        }
    });

    const balances = axios.get<IPriceResponse>("/api/calculation/price", {
        params: {
            addresses: addresses,
            blockchain: blockchain,
        }
    });

    const transactions = axios.get<IFormattedTransaction[]>("/api/transactions", {
        params: {
            addresses: addresses,
            blockchain: blockchain,
            id: id,
        }
    });

    const budget = axios.get<IBudgetExerciseORM[]>("/api/budget", {
        params: {
            id: id,
            addresses: addresses,
            blockchain: blockchain
        }
    });

    const accountReq = axios.get<IRemoxAccountORM>("/api/account/multiple", {
        params: {
            id: id,
            type: accountType
        }
    });

    const contributors = axios.get<IContributor[]>("/api/contributors", {
        params: {
            id: id,
        }
    })

    const requests = axios.get<IRequest[]>("/api/requests", {
        params: {
            id: id,
        }
    })

    const tags = axios.get<ITag[]>("/api/tags", {
        params: {
            id: id,
        }
    })


    const [spendingRes, budgetRes, accountRes, contributorsRes, transactionsRes, requestRes, tagsRes, balanceRes] = await Promise.all([spending, budget, accountReq, contributors, transactions, requests, tags, balances]);


    const accounts = accountRes.data;
    const multi = accounts.accounts.filter(s => s.signerType === "multi")
    
    const {
        approvedRequests,
        multisigRequests,
        pendingRequests,
        rejectedRequests,
        signingNeedRequests,
        multisigAccounts
    } = await api.dispatch(Multisig_Fetch_Thunk({
        accounts: multi,
        blockchain: blockchain,
        addresses: multi.map(s => s.address),
    })).unwrap()

    let allCumulativeTransactions = [...transactionsRes.data, ...multisigRequests].sort((a, b) => a.timestamp > b.timestamp ? -1 : 1);

    const res: LaunchResponse = {
        Balance: balanceRes.data,
        RemoxAccount: accountRes.data,
        Budgets: budgetRes.data,
        Spending: spendingRes.data,
        Contributors: contributorsRes.data,
        Blockchain: blockchain,
        Storage: storage,
        Transactions: transactionsRes.data,
        Requests: requestRes.data,
        Tags: tagsRes.data,
        multisigAccounts: {
            all: multisigAccounts,
            multisigTxs: multisigRequests,
            pendingTxs: pendingRequests,
            approvedTxs: approvedRequests,
            rejectedTxs: rejectedRequests,
            signingNeedTxs: signingNeedRequests,
        },
        cumulativeTransactions: allCumulativeTransactions
    }

    return res;
})