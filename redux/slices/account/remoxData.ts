import { createDraftSafeSelector, createSlice } from "@reduxjs/toolkit";
import { BlockchainType } from "hooks/walletSDK/useWalletKit";
import { ISpendingResponse } from "pages/api/calculation/spending";
import { IStorage } from "./storage";
import { RootState } from "redux/store";
import { IBudgetExerciseORM } from "pages/api/budget";
import { IuseContributor } from "rpcHooks/useContributors";
import { launchApp } from "./thunks/launch";
import type { IAccountMultisig } from 'pages/api/multisig'
import StatsReducers from './reducers/stats'
import BudgetsReducers from './reducers/budgets'
import ContributorsReducers from './reducers/contributors'
import BlockchainReducers from './reducers/blockchain'
import AccountsReducer from './reducers/accounts'
import StorageReducers from './reducers/storage'
import { IAccountORM } from "pages/api/account";
import { Add_Member_To_Account_Thunk, Remove_Member_From_Account_Thunk } from "./thunks/account";
import { IMember } from "firebaseConfig";

export type IAccountType = "individual" | "organization";


// Bizim ana sehfedeki multisig hesablarindaki umumi datalarimiz
export interface IMultisigStats {
    pendingRequests: IAccountMultisig[],
    approvedRequests: IAccountMultisig[],
    signingNeedRequests: IAccountMultisig[],
}


// Bizim webapp'in merkezi datalari
export interface IRemoxData {
    isFetching: boolean;
    stats: ISpendingResponse | null; // +
    budgetExercises: IBudgetExerciseORM[], // +
    contributors: IuseContributor[], // +
    blockchain: BlockchainType | null,
    accounts: IAccountORM[], // ++
    totalBalance: number, // +
    storage: IStorage | null,
    providerAddress: string | null,
    accountType: IAccountType | null,
    multisigStats: IMultisigStats | null,
}

const init = (): IRemoxData => {
    return {
        isFetching: true,
        stats: null,
        budgetExercises: [],
        contributors: [],
        blockchain: null,
        accounts: [],
        totalBalance: 0,
        storage: null,
        providerAddress: null,
        accountType: null,
        multisigStats: null,
    }
}

const remoxDataSlice = createSlice({
    name: "remoxData",
    initialState: init(),
    reducers: {
        ...StatsReducers,
        ...BudgetsReducers,
        ...ContributorsReducers,
        ...BlockchainReducers,
        ...AccountsReducer,
        ...StorageReducers,
        setProviderAddress: (state: IRemoxData, action: { payload: string }) => {
            state.providerAddress = action.payload;
        },
        setAccountType: (state: IRemoxData, action: { payload: IAccountType }) => {
            state.accountType = action.payload;
        }
    },
    extraReducers: builder => {
        builder.addCase(Remove_Member_From_Account_Thunk.fulfilled, (state, action) => {
            const index = state.accounts.findIndex(account => account.id === action.payload.accountAddress)
            if (index !== -1) {
                state.accounts[index].members = state.accounts[index].members.filter(s => s.address !== action.payload.memberAddress)
            }
        });
        builder.addCase(Add_Member_To_Account_Thunk.fulfilled, (state, action) => {
            const index = state.accounts.findIndex(account => account.id === action.payload.accountAddress)
            if (index !== -1) {
                const member: IMember = {
                    address: action.payload.memberAddress,
                    name: action.payload.name,
                    id: action.payload.id,
                    image: action.payload.image,
                    mail: action.payload.mail,
                }
                state.accounts[index].members = [...state.accounts[index].members, member]
            }
        });

        builder.addCase(launchApp.pending, (state, action) => {
            state.isFetching = true;
        });
        builder.addCase(launchApp.fulfilled, (state, action) => {
            state.stats = action.payload.Spending;
            state.budgetExercises = action.payload.Budgets;
            state.contributors = action.payload.Contributors;
            state.blockchain = action.payload.Blockchain;
            state.accounts = action.payload.RemoxAccount.accounts;
            state.totalBalance = action.payload.RemoxAccount.totalBalance;
            state.storage = action.payload.Storage;
            state.accountType = action.payload.Storage.signType;
            state.isFetching = false;
        });
        builder.addCase(launchApp.rejected, (state, action) => {
            state.isFetching = false;
        });
    }
})


export const SelectStorage = createDraftSafeSelector(
    (state: RootState) => state.remoxData.storage,
    (storage) => storage
)

export const SelectAccounts = createDraftSafeSelector(
    (state: RootState) => state.remoxData.accounts,
    (accounts) => accounts
)

export const SelectBlockchain = createDraftSafeSelector(
    (state: RootState) => state.remoxData.blockchain,
    (blockchain) => blockchain
)

export const SelectContributors = createDraftSafeSelector(
    (state: RootState) => state.remoxData.contributors,
    (contributors) => contributors
)

export const SelectBudgets = createDraftSafeSelector(
    (state: RootState) => state.remoxData.budgetExercises,
    (budgets) => budgets
)

export const SelectStats = createDraftSafeSelector(
    (state: RootState) => state.remoxData.stats,
    (stats) => stats
)

export const SelectAccountType = createDraftSafeSelector(
    (state: RootState) => state.remoxData.accountType,
    (type) => type
)

export const SelectProviderAddress = createDraftSafeSelector(
    (state: RootState) => state.remoxData.providerAddress,
    (providerAddress) => providerAddress
)

export const SelectIndividual = createDraftSafeSelector(
    (state: RootState) => state.remoxData.storage?.individual,
    (individual) => individual
)

export const SelectIsRemoxDataFetching = createDraftSafeSelector(
    (state: RootState) => state.remoxData.isFetching,
    (isFetching) => isFetching
)




export const {
    setAccountStats, setAccountType, addTxToBudget, addTxToSubbudget,
    addBudget, addBudgetExercise, addSubBudget, deleteBudget, deleteBudgetExercise,
    deleteSubBudget, setBudgetExercises, updateBudget, updateBudgetExercise, updateSubBudget,
    addContributor, removeContributor, setContributors, setBlockchain,
    addAccount, addOwner, addTx, removeAccount, removeOwner, setThreshold,
    setAccounts, removeStorage, setIndividual, setOrganization, setStorage,
    addMemberToContributor, removeMemberFromContributor, setProviderAddress
} = remoxDataSlice.actions;

export default remoxDataSlice.reducer;