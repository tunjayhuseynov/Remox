import { createDraftSafeSelector, createSlice } from "@reduxjs/toolkit";
import { BlockchainType } from "hooks/walletSDK/useWalletKit";
import { ISpendingResponse } from "pages/api/calculation/spending";
import { IStorage } from "./storage";
import { RootState } from "redux/store";
import { IBudgetExerciseORM, IBudgetORM } from "pages/api/budget";
import { IContributor } from "rpcHooks/useContributors";
import { launchApp } from "./thunks/launch";
import type { IAccountMultisig } from 'pages/api/multisig'
import StatsReducers from './reducers/stats'
import BudgetsReducers from './reducers/budgets'
import ContributorsReducers from './reducers/contributors'
import BlockchainReducers from './reducers/blockchain'
import AccountsReducer from './reducers/accounts'
import StorageReducers from './reducers/storage'
import TagReducers from './reducers/tag'
import RequestReducers from './reducers/requests'
import { IAccountORM } from "pages/api/account";
import { Add_Member_To_Account_Thunk, Remove_Member_From_Account_Thunk } from "./thunks/account";
import { IAccount, IBudget, IMember, ISubBudget } from "firebaseConfig";
import { IFormattedTransaction } from "hooks/useTransactionProcess";
import { ITransactionMultisig } from "hooks/walletSDK/useMultisig";
import { IRequest, RequestStatus } from "rpcHooks/useRequest";
import { Tag } from "rpcHooks/useTags";

export type IAccountType = "individual" | "organization";


// Bizim ana sehfedeki multisig hesablarindaki umumi datalarimiz
export interface IMultisigStats {
    all: IAccountMultisig[],
    multisigTxs: IAccountMultisig["txs"],
    pendingTxs: IAccountMultisig["txs"],
    approvedTxs: IAccountMultisig["txs"],
    rejectedTxs: IAccountMultisig["txs"],
    signingNeedTxs: IAccountMultisig["txs"],
}


// Bizim webapp'in merkezi datalari
export interface IRemoxData {
    isFetching: boolean;
    tags: Tag[],
    stats: ISpendingResponse | null; // +
    budgetExercises: IBudgetExerciseORM[], // +
    contributors: IContributor[], // +
    requests: {
        pendingRequests: IRequest[],
        approvedRequests: IRequest[],
        rejectedRequests: IRequest[],
    }, // +
    blockchain: BlockchainType | null,
    accounts: IAccountORM[], // ++
    totalBalance: number, // +
    storage: IStorage | null,
    providerAddress: string | null,
    providerID: string | null,
    accountType: IAccountType | null,
    multisigStats: IMultisigStats | null,
    transactions: IFormattedTransaction[],
    cumulativeTransactions: (IFormattedTransaction | ITransactionMultisig)[],
    selectedAccountAndBudget: {
        account: IAccount | null,
        budget: IBudget | null,
        subbudget: ISubBudget | null,
    }
}

const init = (): IRemoxData => {
    return {
        isFetching: true,
        stats: null,
        tags: [],
        budgetExercises: [],
        contributors: [],
        requests: {
            pendingRequests: [],
            approvedRequests: [],
            rejectedRequests: [],
        },
        blockchain: null,
        accounts: [],
        totalBalance: 0,
        storage: null,
        providerAddress: null,
        accountType: null,
        multisigStats: null,
        providerID: null,
        transactions: [],
        cumulativeTransactions: [],
        selectedAccountAndBudget: {
            account: null,
            budget: null,
            subbudget: null,
        }
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
        ...TagReducers,
        ...RequestReducers,
        setProviderAddress: (state: IRemoxData, action: { payload: string }) => {
            state.providerAddress = action.payload;
        },
        setProviderID: (state: IRemoxData, action: { payload: string }) => {
            state.providerID = action.payload;
        },
        setAccountType: (state: IRemoxData, action: { payload: IAccountType }) => {
            state.accountType = action.payload;
        },
        setSelectedAccountAndBudget: (state: IRemoxData, action: { payload: { account: IAccount | null, budget: IBudget | null, subbudget: ISubBudget | null } }) => {
            state.selectedAccountAndBudget = action.payload;
        },
        deleteSelectedAccountAndBudget: (state: IRemoxData) => {
            state.selectedAccountAndBudget = {
                account: null,
                budget: null,
                subbudget: null,
            }
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
            state.requests = {
                pendingRequests: action.payload.Requests.filter(request => request.status === RequestStatus.pending),
                approvedRequests: action.payload.Requests.filter(request => request.status === RequestStatus.approved),
                rejectedRequests: action.payload.Requests.filter(request => request.status === RequestStatus.rejected),
            };
            state.blockchain = action.payload.Blockchain;
            state.accounts = action.payload.RemoxAccount.accounts;
            state.totalBalance = action.payload.RemoxAccount.totalBalance;
            state.storage = action.payload.Storage;
            state.transactions = action.payload.Transactions;
            state.tags = action.payload.Tags;

            state.multisigStats = {
                all: action.payload.multisigAccounts.all,
                multisigTxs: action.payload.multisigAccounts.multisigTxs,
                pendingTxs: action.payload.multisigAccounts.pendingTxs,
                approvedTxs: action.payload.multisigAccounts.approvedTxs,
                rejectedTxs: action.payload.multisigAccounts.rejectedTxs,
                signingNeedTxs: action.payload.multisigAccounts.signingNeedTxs
            }

            state.cumulativeTransactions = action.payload.cumulativeTransactions;

            state.accountType = action.payload.Storage.signType;
            if (action.payload.Storage.signType === "individual") {
                state.providerID = action.payload.Storage.individual.accounts[0].id;
            } else if (action.payload.Storage.signType === "organization" && action.payload.Storage.organization) {
                state.providerID = action.payload.Storage.organization.id
            }
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

export const SelectSelectedAccountAndBudget = createDraftSafeSelector(
    (state: RootState) => state.remoxData.selectedAccountAndBudget,
    (selectedAccountAndBudget) => selectedAccountAndBudget
)

export const SelectRequests = createDraftSafeSelector(
    (state: RootState) => state.remoxData.requests,
    (requests) => requests
)

export const SelectCumlativeTxs = createDraftSafeSelector(
    (state: RootState) => state.remoxData.cumulativeTransactions,
    (txs) => txs
)

export const SelectMultisig = createDraftSafeSelector(
    (state: RootState) => state.remoxData.multisigStats,
    (multiStats) => multiStats
)

export const SelectTransactions = createDraftSafeSelector(
    (state: RootState) => state.remoxData.transactions,
    (transactions) => transactions
)

export const SelectID = createDraftSafeSelector(
    (state: RootState) => state.remoxData.providerID,
    (Id) => Id
)

export const SelectAccounts = createDraftSafeSelector(
    (state: RootState) => state.remoxData.accounts,
    (accounts) => accounts
)

export const SelectSingleAccounts = createDraftSafeSelector(
    (state: RootState) => state.remoxData.accounts,
    (accounts) => accounts.filter(account => account.signerType === "single")
)

export const SelectBlockchain = createDraftSafeSelector(
    (state: RootState) => state.remoxData.blockchain,
    (blockchain) => blockchain
)

export const SelectContributors = createDraftSafeSelector(
    (state: RootState) => state.remoxData.contributors,
    (contributors) => contributors
)

export const SelectBudgetExercises = createDraftSafeSelector(
    (state: RootState) => state.remoxData.budgetExercises,
    (budgets) => budgets
)

export const SelectAllBudgets = createDraftSafeSelector(
    (state: RootState) => state.remoxData.budgetExercises,
    (budgets) => budgets.reduce<IBudgetORM[]>((a, c) => {
        a.push(...c.budgets);
        return a;
    }, [])
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

export const SelectTags = createDraftSafeSelector(
    (state: RootState) => state.remoxData.tags,
    (tags) => tags
)



export const {
    addApprovedRequest, addPendingRequest, addRejectedRequest, removeApprovedRequest, removePendingRequest, removeRejectedRequest,
    addTag, removeTag, updateTag, addTransactionHashToTag, removeTransactionHashFromTag, setTags,
    setAccountStats, setAccountType, addTxToBudget, addTxToSubbudget, updateMemberFromContributor,
    addBudget, addBudgetExercise, addSubBudget, deleteBudget, deleteBudgetExercise,
    deleteSubBudget, setBudgetExercises, updateBudget, updateBudgetExercise, updateSubBudget,
    addContributor, removeContributor, setContributors, setBlockchain,
    addAccount, addOwner, addTx, removeAccount, removeOwner, setThreshold,
    setAccounts, removeStorage, setIndividual, setOrganization, setStorage,
    addMemberToContributor, removeMemberFromContributor, setProviderAddress,
    setProviderID, updateContributor, deleteSelectedAccountAndBudget, setSelectedAccountAndBudget,

} = remoxDataSlice.actions;

export default remoxDataSlice.reducer;