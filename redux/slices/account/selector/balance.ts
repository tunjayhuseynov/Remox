import { createDraftSafeSelector } from "@reduxjs/toolkit";
import { RootState } from "redux/store";
import { TokenType } from "types";
import { IPrice } from "utils/api";
import { generatePriceCalculation } from "utils/const";

export const SelectBalance = createDraftSafeSelector(
    (state: RootState) => state.remoxData.balances,
    (balances) => balances
);


export const SelectTotalBalance = createDraftSafeSelector(
    (state: RootState) => state.remoxData.coins,
    (state: RootState) => state.remoxData.accounts,
    (state: RootState) => state.remoxData.storage,
    (state: RootState) => state.remoxData.historyPriceList,
    (coins, accounts, storage, hp) => {

        let pc = storage?.organization?.priceCalculation ?? storage?.individual?.priceCalculation ?? "current";
        let fiat = storage?.organization?.fiatMoneyPreference ?? storage?.individual?.fiatMoneyPreference ?? "USD";

        let totalBalance = 0;
        const preference = storage?.organization?.fiatMoneyPreference ?? storage?.individual?.fiatMoneyPreference ?? "USD";
        accounts.forEach((account) => {
            account.coins.forEach((coin) => {
                totalBalance += generatePriceCalculation(coin, hp, pc, fiat);
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
    (state: RootState) => state.remoxData.historyPriceList,
    (balances, storage, hp) => {
        if (balances) {
            const fiat = storage?.organization?.fiatMoneyPreference ?? storage?.individual?.fiatMoneyPreference ?? "USD";
            let pc = storage?.organization?.priceCalculation ?? storage?.individual?.priceCalculation ?? "current";

            return Object.entries(balances).reduce<number>((a, c) => {
                if (c[1].coins.type !== TokenType.YieldToken) {
                    a += generatePriceCalculation(c[1], hp, pc, fiat);
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
    (state: RootState) => state.remoxData.historyPriceList,
    (balances, storage, hp) => {
        if (balances) {
            const fiat = storage?.organization?.fiatMoneyPreference ?? storage?.individual?.fiatMoneyPreference ?? "USD";
            let pc = storage?.organization?.priceCalculation ?? storage?.individual?.priceCalculation ?? "current";

            return Object.entries(balances).reduce<number>((a, c) => {
                if (c[1].coins.type === TokenType.YieldToken) {
                    a += generatePriceCalculation(c[1], hp, pc, fiat);
                }
                return a;
            }, 0);
        }
        return 0;
    }
);