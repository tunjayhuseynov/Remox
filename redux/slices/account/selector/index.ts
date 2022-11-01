import { createDraftSafeSelector } from "@reduxjs/toolkit";
import { FiatMoneyList, IMemberORM } from "firebaseConfig";
import { RootState } from "redux/store";
import { GetFiatPrice } from "utils/const";
import { IPrice } from 'utils/api'
import { AltCoins } from "types";
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

export const SelectPriceCalculationFn = createDraftSafeSelector(
  (state: RootState) => state.remoxData.storage,
  (state: RootState) => state.remoxData.historyPriceList,
  (storage, hp) => {
    let pc = storage?.organization?.priceCalculation ?? storage?.individual?.priceCalculation ?? "current";
    let fiat = storage?.organization?.fiatMoneyPreference ?? storage?.individual?.fiatMoneyPreference ?? "USD";

    return (coin: IPrice[0] | null, { altcoin, amount, customPc, fiatMoney }: { altcoin?: AltCoins, amount?: number, customPc?: string, fiatMoney?: FiatMoneyList } = {}) => {
      if (fiatMoney) {
        fiat = fiatMoney;
      }
      if (altcoin && amount) {
        switch (customPc ?? pc) {
          case "current":
            return amount * GetFiatPrice(altcoin, fiat);
          case "5":
            return amount * (hp[altcoin.symbol]?.[fiat].slice(-5).reduce((a, b) => a + b.price, 0) / 5) ?? GetFiatPrice(altcoin, fiat);
          case "10":
            return amount * (hp[altcoin.symbol]?.[fiat].slice(-10).reduce((a, b) => a + b.price, 0) / 10) ?? GetFiatPrice(altcoin, fiat);
          case "15":
            return amount * (hp[altcoin.symbol]?.[fiat].slice(-15).reduce((a, b) => a + b.price, 0) / 15) ?? GetFiatPrice(altcoin, fiat);
          case "20":
            return amount * (hp[altcoin.symbol]?.[fiat].slice(-20).reduce((a, b) => a + b.price, 0) / 20) ?? GetFiatPrice(altcoin, fiat);
          case "30":
            return amount * (hp[altcoin.symbol]?.[fiat].slice(-30).reduce((a, b) => a + b.price, 0) / 30) ?? GetFiatPrice(altcoin, fiat);
          default:
            return amount * GetFiatPrice(altcoin, fiat);
        }
      } else if (coin) {
        switch (customPc ?? pc) {
          case "current":
            return coin.amount * GetFiatPrice(coin, fiat);
          case "5":
            return coin.amount * (hp[coin.symbol]?.[fiat].slice(-5).reduce((a, b) => a + b.price, 0) / 5) ?? GetFiatPrice(coin, fiat);
          case "10":
            return coin.amount * (hp[coin.symbol]?.[fiat].slice(-10).reduce((a, b) => a + b.price, 0) / 10) ?? GetFiatPrice(coin, fiat);
          case "15":
            return coin.amount * (hp[coin.symbol]?.[fiat].slice(-15).reduce((a, b) => a + b.price, 0) / 15) ?? GetFiatPrice(coin, fiat);
          case "20":
            return coin.amount * (hp[coin.symbol]?.[fiat].slice(-20).reduce((a, b) => a + b.price, 0) / 20) ?? GetFiatPrice(coin, fiat);
          case "30":
            return coin.amount * (hp[coin.symbol]?.[fiat].slice(-30).reduce((a, b) => a + b.price, 0) / 30) ?? GetFiatPrice(coin, fiat);
          default:
            return coin.amount * GetFiatPrice(coin, fiat);
        }
      }
      return 0;
    }
  }
)

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

export const SelectPriceCalculation = createDraftSafeSelector(
  (state: RootState) => state.remoxData.storage,
  (storage) => storage?.organization?.priceCalculation ?? storage?.individual?.priceCalculation ?? "current"
);

export const SelectFiatSymbol = createDraftSafeSelector(
  (state: RootState) => state.remoxData.storage,
  (storage) => {
    const fiat = storage?.organization?.fiatMoneyPreference ?? storage?.individual?.fiatMoneyPreference ?? "USD";
    switch (fiat) {
      case "USD":
        return "$";
      case "EUR":
        return "€";
      case "GBP":
        return "£";
      case "JPY":
        return "¥";
      case "TRY":
        return "₺";
      case "CAD":
        return "C$";
      case "AUD":
        return "A$";
      default:
        return "$";
    }
  }
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

// Select All Owners
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

export const SelectIsModerator = createDraftSafeSelector(
  (state: RootState) => state.remoxData.storage,
  (state: RootState) => state.remoxData.providerAddress,
  (storage, address) => {
    if (!address) return false;
    const moderators = storage?.organization?.moderators ?? storage?.individual.moderators ?? []
    return moderators.some(m => m.address.toString() === address.toString())
  }
)


export const SelectAddressBooks = createDraftSafeSelector(
  (state: RootState) => state.remoxData.addressBook,
  (addressBook) => addressBook
);

export const SelectNotes = createDraftSafeSelector(
  (state: RootState) => state.remoxData.storage,
  (storage) => {
    if (storage?.organization?.notes) {
      return storage.organization.notes;
    } else if (storage?.individual?.notes) {
      return storage.individual.notes
    }
    return [];
  }
)