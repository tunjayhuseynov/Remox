import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { ISpendingResponse } from "pages/api/calculation/_spendingType";
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
import Transactions from './reducers/transaction'
import TagReducers from './reducers/tag'
import RecurringTaks from './reducers/tasks'
import Moderators from './reducers/moderators'
import RequestReducers from './reducers/requests'
import AccountMembers from './reducers/accountMembers'
import { IAccountORM } from "pages/api/account/index.api";
import { Create_Account_For_Individual, Create_Account_For_Organization, Add_Member_To_Account_Thunk, Remove_Account_From_Individual, Remove_Account_From_Organization, Remove_Member_From_Account_Thunk, Replace_Member_In_Account_Thunk, Update_Account_Name, Update_Account_Mail, Update_Account_Image } from "./thunks/account";
import { IAccount, IAddressBook, IBudget, Image, IMember, INotes, ISubBudget } from "firebaseConfig";
import { IFormattedTransaction } from "hooks/useTransactionProcess";
import { ITransactionMultisig } from "hooks/walletSDK/useMultisig";
import { IRequest, RequestStatus } from "rpcHooks/useRequest";
import { AddTransactionToTag, CreateTag, DeleteTag, RemoveTransactionFromTag, UpdateTag } from "./thunks/tags";
import { ITag } from "pages/api/tags/index.api";
import { generate } from "shortid";
import { IOrganizationORM } from "types/orm";
import { Multisig_Fetch_Thunk } from "./thunks/multisig";
import { Refresh_Data_Thunk } from "./thunks/refresh/refresh";
import { BlockchainType } from "types/blockchains";
import { AltCoins, Coins } from "types";
import { IPrice } from "utils/api";

import { IPaymentInput } from 'pages/api/payments/send/index.api';
import { UpdateFiatCurrencyThunk, UpdatePriceCalculationThunk, UpdateProfileNameThunk, UpdateSeemTimeThunk } from "./thunks/profile";
import { Tx_Refresh_Data_Thunk } from "./thunks/refresh/txRefresh";
import { IHpApiResponse } from "pages/api/calculation/hp.api";
import accountMembers from "./reducers/accountMembers";
import { DocumentData, DocumentReference } from "firebase/firestore";
import { Refresh_Balance_Thunk } from "./thunks/refresh/balance";
import { Add_Address_Book, Remove_Address_Book, Set_Address_Book } from "./thunks/addressbook";
import { Add_Notes_Thunk } from "./thunks/notes";

export interface ITasking {
    taskId: string,
    sender: string,
    blockchain: string,
    protocol: string,
    from: number,
    to: number,
    inputs: IPaymentInput[],
}

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
    fees: {
        [key: string]: { name: AltCoins, amount: string }[]
    },
    coins: Coins,
    darkMode: boolean,
    organizations: IOrganizationORM[],
    isFetching: boolean;
    IsInit: boolean;
    balances: IPrice;
    addressBook: IAddressBook[];
    tags: ITag[],
    nfts: IFormattedTransaction[],
    stats: ISpendingResponse | null; // +
    budgetExercises: IBudgetExerciseORM[], // +
    contributors: IContributor[], // +
    requests: {
        pendingRequests: IRequest[],
        approvedRequests: IRequest[],
        rejectedRequests: IRequest[],
    }, // +
    blockchain: BlockchainType,
    historyPriceList: IHpApiResponse,
    accounts: IAccountORM[], // ++
    storage: IStorage | null,
    providerAddress: string | null,
    providerID: string | null,
    accountType: IAccountType | null,
    multisigStats: IMultisigStats | null,
    transactions: IFormattedTransaction[],
    cumulativeTransactions: (IFormattedTransaction | ITransactionMultisig)[],
    selectedAccountAndBudget: {
        account: IAccountORM | null,
        budget: IBudgetORM | null,
        subbudget: ISubbudgetORM | null,
    },
    recurringTasks: (IFormattedTransaction | ITransactionMultisig)[],
    credentials: {
        address: string,
        password: string,
    }
}

export const init = (): IRemoxData => {
    return {
        coins: {},
        fees: {},
        IsInit: false,
        addressBook: [],
        credentials: {
            address: "",
            password: "",
        },
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
        nfts: [],
        historyPriceList: {},
        budgetExercises: [],
        contributors: [],
        balances: {},
        requests: {
            pendingRequests: [],
            approvedRequests: [],
            rejectedRequests: [],
        },
        blockchain: {
            explorerUrlAddress: "",
            multisigProviders: [],
            batchPaymentProtocols: [],
            currencyCollectionName: "",
            hpCollection: "",
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
        ...Transactions,
        ...accountMembers,
        ...Moderators,
        setResetRemoxData: (state: IRemoxData) => {
            state.accountType = null;
            state.contributors = [];
            state.budgetExercises = [];
            state.historyPriceList = {};
            state.organizations = [];
            state.darkMode = true;
            state.coins = {}
            state.fees = {}
            state.nfts = [];
            state.tags = [];
            state.stats = null
            state.providerAddress = null;
            state.requests = {
                pendingRequests: [],
                approvedRequests: [],
                rejectedRequests: [],
            };
            state.accounts = [];
            state.providerID = null;
            state.accounts = [];
            state.storage = null;
            state.transactions = [];
            state.cumulativeTransactions = [];
            state.multisigStats = null;
            state.selectedAccountAndBudget = {
                account: null,
                budget: null,
                subbudget: null,
            };
            state.recurringTasks = [];
            state.credentials = {
                address: "",
                password: "",
            }
            state.tags = [];
            state.isFetching = false;
            state.IsInit = false;
            state.balances = {};
            state.addressBook = [];
            state.blockchain = {
                explorerUrlAddress: "",
                multisigProviders: [],
                batchPaymentProtocols: [],
                currencyCollectionName: "",
                hpCollection: "",
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
            };

        },
        setProviderAddress: (state: IRemoxData, action: { payload: string }) => {
            state.providerAddress = action.payload;
        },
        setCredentials: (state: IRemoxData, action: { payload: { address: string, password: string } }) => {
            state.credentials = action.payload;
        },
        setProviderID: (state: IRemoxData, action: { payload: string }) => {
            state.providerID = action.payload;
        },
        setOrganizations: (state: IRemoxData, action: { payload: IOrganizationORM[] }) => {
            state.organizations = action.payload;
        },
        addOrganizationToList: (state: IRemoxData, action: { payload: IOrganizationORM }) => {
            state.organizations = [...state.organizations, action.payload];
        },
        setAccountType: (state: IRemoxData, action: { payload: IAccountType }) => {
            state.accountType = action.payload;
        },
        setSelectedAccountAndBudget: (state: IRemoxData, action: { payload: { account: IAccountORM | null, budget: IBudgetORM | null, subbudget: ISubbudgetORM | null } }) => {
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
        },
        changeImage: (state: IRemoxData, action: { payload: { image: Image, type: "organization" | "individual" } }) => {
            if (action.payload.type === "individual" && state.storage?.individual) {
                state.storage.individual.image = action.payload.image;
            } else if (action.payload.type === "organization" && state.storage?.organization) {
                state.storage.organization.image = action.payload.image;
            }
        },
    },
    extraReducers: builder => {
        /* Profile */
        /* Profile */
        /* Profile */
        /* Profile */
        builder.addCase(UpdateProfileNameThunk.fulfilled, (state, action) => {
            if (action.payload.accountType === "individual" && state.storage?.individual) {
                state.storage.individual.name = action.payload.name;
            }
            else if (action.payload.accountType === "organization" && state.storage?.organization) {
                state.storage.organization.name = action.payload.name;
            }
        })

        builder.addCase(UpdateSeemTimeThunk.fulfilled, (state, action) => {
            if (state.storage?.individual) {
                state.storage.individual.seenTime = action.payload.time;
            }
        })

        builder.addCase(UpdateFiatCurrencyThunk.fulfilled, (state, action) => {
            state.historyPriceList = action.payload[1];
            if (state.storage?.organization) {
                state.storage.organization.fiatMoneyPreference = action.payload[0];
            }
            else if (state.storage?.individual) {
                state.storage.individual.fiatMoneyPreference = action.payload[0];
            }
        })

        builder.addCase(UpdatePriceCalculationThunk.fulfilled, (state, action) => {
            if (state.storage?.organization) {
                state.storage.organization.priceCalculation = action.payload;
            }
            else if (state.storage?.individual) {
                state.storage.individual.priceCalculation = action.payload;
            }
        })

        /* Tag */
        /* Tag */
        /* Tag */
        builder.addCase(CreateTag.fulfilled, (state, action) => {
            state.tags = [...state.tags, action.payload];
        })
        builder.addCase(UpdateTag.fulfilled, (state, action) => {
            state.tags = [...state.tags.filter(tag => tag.id !== action.payload.oldTag.id), action.payload.newTag];
            state.cumulativeTransactions = state.cumulativeTransactions.map(transaction => {
                const tagIndex = transaction.tags.findIndex(s => s.id === action.payload.oldTag.id);
                if (tagIndex !== -1) {
                    transaction.tags[tagIndex] = action.payload.newTag;
                }
                return transaction;
            })
        })
        builder.addCase(DeleteTag.fulfilled, (state, action) => {
            state.tags = [...state.tags.filter(tag => tag.id !== action.payload.id)];
            state.cumulativeTransactions = state.cumulativeTransactions.map(transaction => {
                transaction.tags = transaction.tags.filter(tag => tag.id !== action.payload.id);
                return transaction;
            })
        })
        // builder.addCase(AddTransactionToTag.fulfilled, (state, action) => {
        //     state.tags = [...state.tags.map(tag => {
        //         if (tag.id === action.payload.tagId) {
        //             tag.transactions = [...tag.transactions, action.payload.transactionId];
        //         }
        //         return tag;
        //     })];
        // })
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
            state.accounts = state.accounts.map(account => {
                if (account.id === action.payload.id) {
                    account.name = action.payload.name;
                }
                return account;
            })
        })

        builder.addCase(Update_Account_Mail.fulfilled, (state, action) => {
            state.accounts = [...state.accounts.map(account => {
                if (account.id === action.payload.id) {
                    account.mail = action.payload.mail;
                }
                return account;
            })]
        })

        builder.addCase(Update_Account_Image.fulfilled, (state, action) => {
            state.accounts = state.accounts.map(account => {
                if (account.id === action.payload.id) {
                    account.image = action.payload.image;
                }
                return account;
            })
        })

        builder.addCase(Create_Account_For_Individual.fulfilled, (state, action) => {
            state.accounts = [...state.accounts, action.payload];
        })

        builder.addCase(Create_Account_For_Organization.fulfilled, (state, action) => {
            state.accounts = [...state.accounts, action.payload];
            if (state.storage?.organization) {
                state.storage.organization.accounts = [...state.storage.organization.accounts, (action.payload as IAccount | DocumentReference)] as any;
            }
        })

        builder.addCase(Remove_Account_From_Individual.fulfilled, (state, action) => {
            state.accounts = [...state.accounts.filter(account => account.id !== action.payload.id)];
            state.cumulativeTransactions = state.cumulativeTransactions.filter(transaction => ('tx' in transaction) ? transaction.tx.address !== action.payload.address : transaction.address !== action.payload.address);
        })

        builder.addCase(Remove_Account_From_Organization.fulfilled, (state, action) => {
            state.accounts = [...state.accounts.filter(account => account.id !== action.payload.id)];
            state.cumulativeTransactions = state.cumulativeTransactions.filter(transaction => ('tx' in transaction) ? transaction.tx.address !== action.payload.address : transaction.address !== action.payload.address);

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


        //******************************************* */

        builder.addCase(Refresh_Balance_Thunk.fulfilled, (state, action) => {
            state.balances = action.payload.AllPrices;
        })


        /************ */
        builder.addCase(Add_Address_Book.fulfilled, (state, action) => {
            state.addressBook = [...state.addressBook, action.payload];
        })

        builder.addCase(Remove_Address_Book.fulfilled, (state, action) => {
            state.addressBook = state.addressBook.filter(s => s.id !== action.payload.id);
        })

        builder.addCase(Set_Address_Book.fulfilled, (state, action) => {
            state.addressBook = action.payload
        })


        builder.addCase(Add_Notes_Thunk.fulfilled, (state, action) => {
            if (state.storage?.organization) {
                state.storage.organization.notes = [...state.storage.organization.notes, action.payload]
            } else if (state.storage?.individual) {
                state.storage.individual.notes = [...state.storage.individual.notes, action.payload]
            }
        })



        //*****************************************************************************************
        // REFRESH

        builder.addCase(Tx_Refresh_Data_Thunk.fulfilled, (state, action) => {
            state.accounts = action.payload.RemoxAccount.accounts;
            state.nfts = action.payload.NFTs;
            state.budgetExercises = action.payload.Budgets;
            state.cumulativeTransactions = action.payload.cumulativeTransactions;
            state.recurringTasks = action.payload.RecurringTasks;
            state.transactions = action.payload.Transactions;
            state.multisigStats = {
                all: action.payload.multisigAccounts.all,
                multisigTxs: action.payload.multisigAccounts.multisigTxs,
                pendingTxs: action.payload.multisigAccounts.pendingTxs,
                approvedTxs: action.payload.multisigAccounts.approvedTxs,
                rejectedTxs: action.payload.multisigAccounts.rejectedTxs,
                signingNeedTxs: action.payload.multisigAccounts.signingNeedTxs
            }
        })



        //*****************************************************************************************

        /* Launch */
        /* Launch */
        /* Launch */

        builder.addCase(launchApp.pending, (state, action) => {
            // if (!state.IsInit) {
            if (!action.meta.arg.isProgressivScreen) {
                state.isFetching = true;
            }
            // }
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
            state.fees = action.payload.Spending.Fee;
            state.blockchain = action.payload.Blockchain;
            state.accounts = action.payload.RemoxAccount.accounts;
            state.storage = action.payload.Storage;
            state.transactions = action.payload.Transactions;
            state.historyPriceList = action.payload.HistoryPriceList;
            state.tags = action.payload.Tags;
            state.balances = action.payload.Balance.AllPrices;
            state.recurringTasks = action.payload.RecurringTasks;
            state.nfts = action.payload.NFTs;
            state.IsInit = true;
            state.addressBook = action.payload.Storage?.individual?.addressBook ?? []
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
    addMemberToContributor, removeMemberFromContributor, setProviderAddress, addTxToList, changeImage,
    setProviderID, updateContributor, deleteSelectedAccountAndBudget, setSelectedAccountAndBudget, setCredentials,
    updateAllCurrencies, updateUserBalance, addConfirmation, changeToExecuted, removeTxFromBudget, removeTxFromSubbudget, removeConfirmation,
    AddModerator, RemoveModerator, UpdateModeratorEmail, UpdateModeratorImage, UpdateModeratorName,
    Update_Account_Member_Email, Update_Account_Member_Image, Update_Account_Member_Name, setResetRemoxData, addOrganizationToList, increaseNonce,
    chageTxToExecutedInBudget
} = remoxDataSlice.actions;

export default remoxDataSlice.reducer;