import { createDraftSafeSelector } from "@reduxjs/toolkit";
import { IMemberORM } from "firebaseConfig";
import { RootState } from "redux/store";
export * from "./balance";
export * from './darkmode';
export * from './reccuring';
export * from './contributor';
export * from './budget';
export * from './storage';
export * from './hp';
export * from './ab';
export * from './stats';
export * from './tag';



export const SelectNfts = createDraftSafeSelector(
  (state: RootState) => state.remoxData.nfts,
  (nfts) => nfts
);

export const SelectCredintials = createDraftSafeSelector(
  (state: RootState) => state.remoxData.credentials,
  (credentials) => credentials
);


export const SelectCurrencies = createDraftSafeSelector(
  (state: RootState) => state.remoxData.coins,
  (currencies) => currencies
);

export const SelectFiatPreference = createDraftSafeSelector(
  (state: RootState) => state.remoxData.storage,
  (storage) => storage?.organization?.fiatMoneyPreference ?? storage?.individual?.fiatMoneyPreference ?? "USD"
);




// This is for Request Page
export const SelectRequests = createDraftSafeSelector(
  (state: RootState) => state.remoxData.requests,
  (requests) => requests
);

// This is for Transaction Page
export const SelectCumlativeTxs = createDraftSafeSelector(
  (state: RootState) => state.remoxData.cumulativeTransactions,
  (txs) => txs
);

// This is for getting info about multisig account (owners, txs, signatures)
export const SelectMultisig = createDraftSafeSelector(
  (state: RootState) => state.remoxData.multisigStats,
  (multiStats) => multiStats
);

// This is txs of an individual account
export const SelectTransactions = createDraftSafeSelector(
  (state: RootState) => state.remoxData.transactions,
  (transactions) => transactions
);

// It gives current account ID
export const SelectID = createDraftSafeSelector(
  (state: RootState) => state.remoxData.providerID,
  (Id) => Id
);

export const SelectAccounts = createDraftSafeSelector(
  (state: RootState) => state.remoxData.accounts,
  (accounts) => accounts
);

export const SelectOwners = createDraftSafeSelector(
  (state: RootState) => state.remoxData.accounts,
  (accounts) => {
    if (accounts && accounts.length > 0) {
      return [
        ...accounts.reduce<IMemberORM[]>(
          (a, c) => [...a, ...c.members.map((s) => ({ ...s, parent: c }))],
          []
        ),
      ];
    }
    return [];
  }
);

export const SelectBlockchain = createDraftSafeSelector(
  (state: RootState) => state.remoxData.blockchain,
  (blockchain) => blockchain
);


export const SelectProviderAddress = createDraftSafeSelector(
  (state: RootState) => state.remoxData.providerAddress,
  (providerAddress) => providerAddress
);


export const SelectIsRemoxDataFetching = createDraftSafeSelector(
  (state: RootState) => state.remoxData.isFetching,
  (isFetching) => isFetching
);

export const SelectModerators = createDraftSafeSelector(
  (state: RootState) => state.remoxData.storage,
  (storage) => {
    return storage?.organization?.moderators ?? storage?.individual.moderators ?? []
  }
)


