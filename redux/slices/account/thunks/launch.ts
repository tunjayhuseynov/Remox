import axios from "axios";
import { createAsyncThunk } from "@reduxjs/toolkit";
import { IFormattedTransaction } from "hooks/useTransactionProcess";
import type { BlockchainType } from "hooks/walletSDK/useWalletKit";
import type { IRemoxAccountORM } from "pages/api/account/multiple";
import type { IBudgetExerciseORM } from "pages/api/budget";
import type { ISpendingResponse } from "pages/api/calculation/spending";
import type { IContributor } from "rpcHooks/useContributors";
import type { IAccountType, IRemoxData } from "../remoxData";
import type { IStorage } from "../storage";
import { IAccountMultisig } from "pages/api/multisig";
import { IRequest } from "rpcHooks/useRequest";

type LaunchResponse = {
    RemoxAccount: IRemoxAccountORM,
    Budgets: IBudgetExerciseORM[],
    Spending: ISpendingResponse,
    Contributors: IContributor[],
    Blockchain: BlockchainType,
    Storage: IStorage,
    Transactions: IFormattedTransaction[],
    Requests: IRequest[],
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

export const launchApp = createAsyncThunk<LaunchResponse, LaunchParams>("remoxData/launch", async ({ addresses, blockchain, id, accountType, storage }) => {
    const spending = axios.get<ISpendingResponse>("/api/calculation/spending", {
        params: {
            addresses: addresses,
            blockchain: blockchain,
            id: id,
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


    const [spendingRes, budgetRes, accountRes, contributorsRes, transactionsRes, requestRes] = await Promise.all([spending, budget, accountReq, contributors, transactions, requests]);
    

    const accounts = accountRes.data;

    const promiseMultisigAccounts = accounts.accounts.filter(s => s.signerType === "multi").map(s => axios.get<IAccountMultisig>("/api/multisig", {
        params: {
            blockchain: blockchain,
            Skip: 0,
            Take: 100,
            address: s.address
        }
    }))

    const multisigAccountsRef = await Promise.all(promiseMultisigAccounts);
    const multisigAccounts = multisigAccountsRef.map(s => s.data);

    let multisigRequests: IAccountMultisig["txs"] = [];
    let pendingRequests: IAccountMultisig["txs"] = [];
    let approvedRequests: IAccountMultisig["txs"] = [];
    let rejectedRequests: IAccountMultisig["txs"] = [];
    let signingNeedRequests: IAccountMultisig["txs"] = [];

    multisigAccounts.forEach(s => {
        const txs = s.txs;
        const Pendings = txs.filter(s => s.executed === false)
        const Approveds = txs.filter(s => s.executed === true)

        pendingRequests = [...pendingRequests, ...Pendings];
        rejectedRequests = [...rejectedRequests, ...Pendings.filter(s => s.confirmations.length === 0)]
        approvedRequests = [...approvedRequests, ...Approveds];
        signingNeedRequests = [...signingNeedRequests, ...Pendings.filter(s => !s.confirmations.some(s => addresses.includes(s)))]
        multisigRequests = [...multisigRequests, ...txs]
    })

    let allCumulativeTransactions = [...transactionsRes.data, ...multisigRequests].sort((a, b) => a.timestamp > b.timestamp ? -1 : 1);

    const res: LaunchResponse = {
        RemoxAccount: accountRes.data,
        Budgets: budgetRes.data,
        Spending: spendingRes.data,
        Contributors: contributorsRes.data,
        Blockchain: blockchain,
        Storage: storage,
        Transactions: transactionsRes.data,
        Requests: requestRes.data,
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