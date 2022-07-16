import { createDraftSafeSelector } from "@reduxjs/toolkit";
import { IBudgetORM } from "pages/api/budget";
import { IPriceCoin } from "pages/api/calculation/price";
import { RootState } from "redux/store";
import { TokenType } from "types";

export const SelectStorage = createDraftSafeSelector(
    (state: RootState) => state.remoxData.storage,
    (storage) => storage
)

export const SelectBalance = createDraftSafeSelector(
    (state: RootState) => state.remoxData.balances,
    (balances) => balances
)

export const SelectYieldBalance = createDraftSafeSelector(
    (state: RootState) => state.remoxData.balances,
    (balances) => {
        if (balances) {
            return Object.entries(balances).reduce<{ [name: string]: IPriceCoin }>((a, c) => {
                if (c[1].coins.type === TokenType.YieldToken) {
                    a[c[0]] = c[1];
                }
                return a;
            }, {})
        }
        return null;
    }
)

export const SelectSpotBalance = createDraftSafeSelector(
    (state: RootState) => state.remoxData.balances,
    (balances) => {
        if (balances) {
            return Object.entries(balances).reduce<{ [name: string]: IPriceCoin }>((a, c) => {
                if (c[1].coins.type !== TokenType.YieldToken) {
                    a[c[0]] = c[1];
                }
                return a;
            }, {})
        }
        return null;
    }
)

// This is for choose-budget Page
export const SelectSelectedAccountAndBudget = createDraftSafeSelector(
    (state: RootState) => state.remoxData.selectedAccountAndBudget,
    (selectedAccountAndBudget) => selectedAccountAndBudget
)

// This is for Request Page
export const SelectRequests = createDraftSafeSelector(
    (state: RootState) => state.remoxData.requests,
    (requests) => requests
)

// This is for Transaction Page
export const SelectCumlativeTxs = createDraftSafeSelector(
    (state: RootState) => state.remoxData.cumulativeTransactions,
    (txs) => txs
)

// This is for getting info about multisig account (owners, txs, signatures)
export const SelectMultisig = createDraftSafeSelector(
    (state: RootState) => state.remoxData.multisigStats,
    (multiStats) => multiStats
)

// This is txs of an individual account
export const SelectTransactions = createDraftSafeSelector(
    (state: RootState) => state.remoxData.transactions,
    (transactions) => transactions
)

// It gives current account ID
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

export const SelectOrganization = createDraftSafeSelector(
    (state: RootState) => state.remoxData.storage?.organization,
    (organization) => organization
)

export const SelectIsRemoxDataFetching = createDraftSafeSelector(
    (state: RootState) => state.remoxData.isFetching,
    (isFetching) => isFetching
)

export const SelectTags = createDraftSafeSelector(
    (state: RootState) => state.remoxData.tags,
    (tags) => tags
)

export const SelectRemoxAccount = createDraftSafeSelector(
    (state: RootState) => state.remoxData.storage,
    (storage) => {
        if (storage?.organization) {
            return storage.organization;
        }

        return storage?.individual;
    }
)