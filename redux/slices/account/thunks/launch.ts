import { createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";
import type { BlockchainType } from "hooks/walletSDK/useWalletKit";
import type { IRemoxAccountORM } from "pages/api/account/multiple";
import type { IBudgetExerciseORM } from "pages/api/budget";
import type { ISpendingResponse } from "pages/api/calculation/spending";
import type { IuseContributor } from "rpcHooks/useContributors";
import type { IAccountType } from "../remoxData";
import type { IStorage } from "../storage";

type LaunchResponse = {
    RemoxAccount: IRemoxAccountORM,
    Budgets: IBudgetExerciseORM[],
    Spending: ISpendingResponse,
    Contributors: IuseContributor[],
    Blockchain: BlockchainType,
    Storage: IStorage,
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

    const budget = axios.get<IBudgetExerciseORM[]>("/api/budget", {
        params: {
            id: id,
            addresses: addresses,
            blockchain: blockchain
        }
    });

    const account = axios.get<IRemoxAccountORM>("/api/account/multiple", {
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

    const [spendingRes, budgetRes, accountRes, contributorsRes] = await Promise.all([spending, budget, account, contributors]);

    const res: LaunchResponse = {
        RemoxAccount: accountRes.data,
        Budgets: budgetRes.data,
        Spending: spendingRes.data,
        Contributors: contributorsRes.data,
        Blockchain: blockchain,
        Storage: storage,
    }

    return res;
})