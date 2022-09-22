import { createDraftSafeSelector } from "@reduxjs/toolkit";
import { RootState } from "redux/store";
import { TokenType } from "types";
import { IPrice } from "utils/api";
import { GetFiatPrice } from "utils/const";

export const SelectBalance = createDraftSafeSelector(
    (state: RootState) => state.remoxData.balances,
    (balances) => balances
);


export const SelectTotalBalance = createDraftSafeSelector(
    (state: RootState) => state.remoxData.coins,
    (state: RootState) => state.remoxData.accounts,
    (state: RootState) => state.remoxData.storage,
    (coins, accounts, storage) => {
        let totalBalance = 0;
        const preference = storage?.organization?.fiatMoneyPreference ?? storage?.individual?.fiatMoneyPreference ?? "USD";
        accounts.forEach((account) => {
            account.coins.forEach((coin) => {
                totalBalance += GetFiatPrice(coin, preference) * coin.amount;
            })
        })
        return totalBalance;
    }
);

export const SelectYieldBalance = createDraftSafeSelector(
    (state: RootState) => state.remoxData.balances,
    (balances) => {
        if (balances) {
            return Object.entries(balances).reduce<IPrice>(
                (a, c) => {
                    if (c[1].coins.type === TokenType.YieldToken) {
                        a[c[0]] = c[1];
                    }
                    return a;
                },
                {}
            );
        }
        return null;
    }
);


export const SelectSpotBalance = createDraftSafeSelector(
    (state: RootState) => state.remoxData.balances,
    (balances) => {
        if (balances) {
            return Object.entries(balances).reduce<IPrice>(
                (a, c) => {
                    if (c[1].coins.type !== TokenType.YieldToken) {
                        a[c[0]] = c[1];
                    }
                    return a;
                },
                {}
            );
        }
        return null;
    }
);

export const SelectSpotTotalBalance = createDraftSafeSelector(
    (state: RootState) => state.remoxData.balances,
    (state: RootState) => state.remoxData.storage,
    (balances, storage) => {
        if (balances) {
            const preference = storage?.organization?.fiatMoneyPreference ?? storage?.individual?.fiatMoneyPreference ?? "USD";
            return Object.entries(balances).reduce<number>((a, c) => {
                if (c[1].coins.type !== TokenType.YieldToken) {
                    a += GetFiatPrice(c[1], preference) * c[1].amount;
                }
                return a;
            }, 0);
        }
        return 0;
    }
);


export const SelectYieldTotalBalance = createDraftSafeSelector(
    (state: RootState) => state.remoxData.balances,
    (state: RootState) => state.remoxData.storage,
    (balances, storage) => {
        if (balances) {
            const preference = storage?.organization?.fiatMoneyPreference ?? storage?.individual?.fiatMoneyPreference ?? "USD";
            return Object.entries(balances).reduce<number>((a, c) => {
                if (c[1].coins.type === TokenType.YieldToken) {
                    a += GetFiatPrice(c[1], preference) * c[1].amount;
                }
                return a;
            }, 0);
        }
        return 0;
    }
);