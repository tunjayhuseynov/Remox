import axios from "axios";
import { createAsyncThunk } from "@reduxjs/toolkit";
import { IFormattedTransaction } from "hooks/useTransactionProcess";
import type { BlockchainType } from "hooks/walletSDK/useWalletKit";
import type { IRemoxAccountORM } from "pages/api/account/multiple";
import type { IBudgetExerciseORM } from "pages/api/budget";
import type { ISpendingResponse } from "pages/api/calculation/spending";
import type { IuseContributor } from "rpcHooks/useContributors";
import type { IAccountType } from "../remoxData";
import type { IStorage } from "../storage";
import { IAccountMultisig } from "pages/api/multisig";

type LaunchResponse = {
    RemoxAccount: IRemoxAccountORM,
    Budgets: IBudgetExerciseORM[],
    Spending: ISpendingResponse,
    Contributors: IuseContributor[],
    Blockchain: BlockchainType,
    Storage: IStorage,
    Transactions: IFormattedTransaction[]
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

    const contributors = axios.get<IuseContributor[]>("/api/contributors", {
        params: {
            id: id,
        }
    })


    const [spendingRes, budgetRes, accountRes, contributorsRes, transactionsRes] = await Promise.all([spending, budget, accountReq, contributors, transactions]);

    const accounts = accountRes.data;

    const promiseMultisigAccounts = accounts.accounts.filter(s => s.signerType === "multi").map(s => axios.get<IAccountMultisig>("/api/multisig", {
        params: {
            blockchain: blockchain,
            Skip: 0,
            Take: 100,
            address: s.address
        }
    }))

    const multisigAccounts = await Promise.all(promiseMultisigAccounts);

    let pendingRequests: IAccountMultisig;
    let approvedRequests: IAccountMultisig;
    let rejectedRequests: IAccountMultisig;
    let signingNeedRequests: IAccountMultisig;

    multisigAccounts.forEach(s => {
        const txs = s.data.txs;
        const Pendings = txs.filter(s => s.executed === false)
        const Approveds = txs.filter(s => s.executed === true)
        pendingRequests = {
            txs: [...pendingRequests.txs, ...Pendings],
            owners: s.data.owners,
            threshold: s.data.threshold
        };
        rejectedRequests = {
            txs: [...rejectedRequests.txs, ...Pendings.filter(s=>s.confirmations.length === 0)],
            owners: s.data.owners,
            threshold: s.data.threshold
        };
        approvedRequests = {
            txs: [...approvedRequests.txs, ...Approveds],
            owners: s.data.owners,
            threshold: s.data.threshold
        }
        signingNeedRequests = {
            txs: [...signingNeedRequests.txs, ...Pendings.filter(s => !s.confirmations.some(s => addresses.includes(s)))],
            owners: s.data.owners,
            threshold: s.data.threshold
        }
    })

    const res: LaunchResponse = {
        RemoxAccount: accountRes.data,
        Budgets: budgetRes.data,
        Spending: spendingRes.data,
        Contributors: contributorsRes.data,
        Blockchain: blockchain,
        Storage: storage,
        Transactions: transactionsRes.data
    }

    return res;
})