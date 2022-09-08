import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { ISpendingResponse } from "pages/api/calculation/_spendingType.api";
import { IStorage } from "./storage";
import { IBudgetExerciseORM, IBudgetORM, ISubbudgetORM } from "pages/api/budget/index.api";
import { IContributor } from "types/dashboard/contributors";
import { launchApp } from "./thunks/launch";
import type { IAccountMultisig } from 'pages/api/multisig/index.api'
import StatsReducers from './reducers/stats'
import BudgetsReducers from './reducers/budgets'
import ContributorsReducers from './reducers/contributors'
import BlockchainReducers from './reducers/blockchain'
import AccountsReducer from './reducers/accounts'
import StorageReducers from './reducers/storage'
import Currencies from './reducers/currencies'
import TagReducers from './reducers/tag'
import RecurringTaks from './reducers/tasks'
import RequestReducers from './reducers/requests'
import { IAccountORM } from "pages/api/account/index.api";
import { Create_Account_For_Individual, Create_Account_For_Organization, Add_Member_To_Account_Thunk, Remove_Account_From_Individual, Remove_Account_From_Organization, Remove_Member_From_Account_Thunk, Replace_Member_In_Account_Thunk, Update_Account_Name, Update_Account_Mail } from "./thunks/account";
import { IAccount, IBudget, IMember, ISubBudget } from "firebaseConfig";
import { IFormattedTransaction } from "hooks/useTransactionProcess";
import { ITransactionMultisig } from "hooks/walletSDK/useMultisig";
import { IRequest, RequestStatus } from "rpcHooks/useRequest";
import { AddTransactionToTag, CreateTag, DeleteTag, RemoveTransactionFromTag, UpdateTag } from "./thunks/tags";
import { ITag } from "pages/api/tags/index.api";
import { generate } from "shortid";
import { IOrganizationORM } from "types/orm";
import { Multisig_Fetch_Thunk } from "./thunks/multisig";
import { Refresh_Data_Thunk } from "./thunks/refresh";
import { BlockchainType } from "types/blockchains";
import { ITasking } from "rpcHooks/useTasking";
import { Coins } from "types";
import { IPrice } from "utils/api";

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
    coins: Coins,
    darkMode: boolean,
    organizations: IOrganizationORM[],
    isFetching: boolean;
    balances: IPrice;
    tags: ITag[],
    stats: ISpendingResponse | null; // +
    budgetExercises: IBudgetExerciseORM[], // +
    contributors: IContributor[], // +
    requests: {
        pendingRequests: IRequest[],
        approvedRequests: IRequest[],
        rejectedRequests: IRequest[],
    }, // +
    blockchain: BlockchainType,
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
        budget: IBudgetORM | null,
        subbudget: ISubbudgetORM | null,
    },
    recurringTasks: ITasking[]
}

const init = (): IRemoxData => {
    return {
        coins: {},
        darkMode: (
            () => {
                if (typeof window === 'undefined') return true
                return localStorage.getItem('darkMode') ? localStorage.getItem('darkMode') === 'true' : true
            }
        )(),
        isFetching: true,
        organizations: [],
        stats: null,
        tags: [],
        budgetExercises: [],
        contributors: [],
        balances: {},
        requests: {
            pendingRequests: [],
            approvedRequests: [],
            rejectedRequests: [],
        },
        blockchain: {
            multisigProviders: [],
            batchPaymentProtocols: [],
            currencyCollectionName: "",
            explorerUrl: "",
            displayName: "Solana",
            nativeToken: "SOL",
            lendingProtocols: [],
            name: "solana",
            logoUrl: "",
            recurringPaymentProtocols: [],
            rpcUrl: "",
            streamingProtocols: [],
            swapProtocols: [],
        },
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
        },
        recurringTasks: []
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
        ...RecurringTaks,
        ...Currencies,
        ...RequestReducers,
        setProviderAddress: (state: IRemoxData, action: { payload: string }) => {
            state.providerAddress = action.payload;
        },
        setProviderID: (state: IRemoxData, action: { payload: string }) => {
            state.providerID = action.payload;
        },
        setOrganizations: (state: IRemoxData, action: { payload: IOrganizationORM[] }) => {
            state.organizations = action.payload;
        },
        setAccountType: (state: IRemoxData, action: { payload: IAccountType }) => {
            state.accountType = action.payload;
        },
        setSelectedAccountAndBudget: (state: IRemoxData, action: { payload: { account: IAccount | null, budget: IBudgetORM | null, subbudget: ISubbudgetORM | null } }) => {
            state.selectedAccountAndBudget = action.payload;
        },
        deleteSelectedAccountAndBudget: (state: IRemoxData) => {
            state.selectedAccountAndBudget = {
                account: null,
                budget: null,
                subbudget: null,
            }
        },
        changeDarkMode: (state: IRemoxData, action: PayloadAction<boolean>) => {
            localStorage.setItem('darkMode', action.payload.toString());
            state.darkMode = action.payload;
        }
    },
    extraReducers: builder => {
        /* Tag */
        /* Tag */
        /* Tag */
        builder.addCase(CreateTag.fulfilled, (state, action) => {
            state.tags = [...state.tags, action.payload];
        })
        builder.addCase(UpdateTag.fulfilled, (state, action) => {
            state.tags = [...state.tags.filter(tag => tag.id !== action.payload.oldTag.id), action.payload.newTag];
        })
        builder.addCase(DeleteTag.fulfilled, (state, action) => {
            state.tags = [...state.tags.filter(tag => tag.id !== action.payload.id)];
        })
        builder.addCase(AddTransactionToTag.fulfilled, (state, action) => {
            state.tags = [...state.tags.map(tag => {
                if (tag.id === action.payload.tagId) {
                    tag.transactions = [...tag.transactions, action.payload.transactionId];
                }
                return tag;
            })];
        })
        builder.addCase(RemoveTransactionFromTag.fulfilled, (state, action) => {
            state.tags = [...state.tags.map(tag => {
                if (tag.id === action.payload.tagId) {
                    tag.transactions = [...tag.transactions.filter(transactionId => transactionId !== action.payload.transactionId)];
                }
                return tag;
            })];
        })

        /* Account */
        /* Account */
        /* Account */

        builder.addCase(Update_Account_Name.fulfilled, (state, action) => {
            state.accounts = [...state.accounts.map(account => {
                if (account.id === action.payload.id) {
                    account.name = action.payload.name;
                }
                return account;
            })]
        })

        builder.addCase(Update_Account_Mail.fulfilled, (state, action) => {
            state.accounts = [...state.accounts.map(account => {
                if (account.id === action.payload.id) {
                    account.mail = action.payload.mail;
                }
                return account;
            })]
        })

        builder.addCase(Create_Account_For_Individual.fulfilled, (state, action) => {
            state.accounts = [...state.accounts, action.payload];
        })

        builder.addCase(Create_Account_For_Organization.fulfilled, (state, action) => {
            state.accounts = [...state.accounts, action.payload];
        })

        builder.addCase(Remove_Account_From_Individual.fulfilled, (state, action) => {
            state.accounts = [...state.accounts.filter(account => account.id !== action.payload.id)];
        })

        builder.addCase(Remove_Account_From_Organization.fulfilled, (state, action) => {
            state.accounts = [...state.accounts.filter(account => account.id !== action.payload.id)];
        })

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

        builder.addCase(Replace_Member_In_Account_Thunk.fulfilled, (state, action) => {
            const index = state.accounts.findIndex(account => account.address === action.payload.accountAddress)
            if (index !== -1) {
                const oldMember = state.accounts[index].members.find(member => member.address === action.payload.oldMemberAddress)
                const member: IMember = {
                    address: action.payload.newMemberAdress,
                    name: oldMember?.name ?? "",
                    id: oldMember?.id ?? generate(),
                    image: oldMember?.image ?? null,
                    mail: oldMember?.mail ?? null,
                }
                state.accounts[index].members = [...state.accounts[index].members.filter(s => s.address !== action.payload.oldMemberAddress), member]
            }
        })

        builder.addCase(Multisig_Fetch_Thunk.fulfilled, (state, action) => {
            state.multisigStats = {
                all: action.payload.multisigAccounts,
                multisigTxs: action.payload.multisigRequests,
                pendingTxs: action.payload.pendingRequests,
                approvedTxs: action.payload.approvedRequests,
                rejectedTxs: action.payload.rejectedRequests,
                signingNeedTxs: action.payload.signingNeedRequests
            }
        })


        //*****************************************************************************************
        // REFRESH

        builder.addCase(Refresh_Data_Thunk.fulfilled, (state, action) => {
            state.stats = action.payload.spending;
            state.accounts = action.payload.RemoxAccount.accounts;
            state.totalBalance = action.payload.RemoxAccount.totalBalance;
            state.transactions = action.payload.transactions;
            state.balances = action.payload.balance.AllPrices;
        })



        //*****************************************************************************************

        /* Launch */
        /* Launch */
        /* Launch */

        builder.addCase(launchApp.pending, (state, action) => {
            state.isFetching = true;
        });
        builder.addCase(launchApp.fulfilled, (state, action) => {
            state.coins = action.payload.Coins.reduce<Coins>((acc, coin) => {
                acc[coin.symbol] = coin;
                return acc;
            }, {});
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
            state.balances = action.payload.Balance.AllPrices;
            state.recurringTasks = action.payload.RecurringTasks;

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
                // state.providerID = action.payload.Storage.individual.accounts[0].id;
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


export * from './selector'
export const {
    setOrganizations, changeDarkMode, addRecurringTask, removeRecurringTask,
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
    updateAllCurrencies, updateTotalBalance, updateUserBalance

} = remoxDataSlice.actions;

export default remoxDataSlice.reducer;