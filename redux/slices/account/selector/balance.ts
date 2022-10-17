import { createDraftSafeSelector } from "@reduxjs/toolkit";
import { RootState } from "redux/store";
import { TokenType } from "types";
import { IPrice } from "utils/api";
import { generatePriceCalculation } from "utils/const";

export const SelectBalance = createDraftSafeSelector(
    (state: RootState) => state.remoxData.accounts,
    (accounts) => {
        return accounts.reduce((acc, account) => {

            account.coins.forEach(coin => {
                if (acc[coin.symbol]) {
                    acc[coin.symbol].amount += coin.amount
                } else {
                    acc[coin.symbol] = coin
                }
            })

            return acc;
        }, {} as IPrice);
    }
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
        accounts.forEach((account) => {
            account.coins.forEach((coin) => {
                totalBalance += generatePriceCalculation(coin, hp, pc, fiat);
            })
        })
        return totalBalance;
    }
);

export const SelectYieldBalance = createDraftSafeSelector(
    (state: RootState) => state.remoxData.accounts,
    (accounts) => {
        if (accounts.length > 0) {
            return accounts.reduce<IPrice>(
                (a, c) => {

                    c.coins.forEach((coin) => {

                        if (coin.type === "Yield") {
                            if (a?.[coin.symbol]) {
                                a[coin.symbol].amount += coin.amount;
                            } else {
                                a[coin.symbol] = coin;
                            }
                        }

                    })

                    return a;
                },
                {}
            );
        }
        return null;
    }
);


export const SelectSpotBalance = createDraftSafeSelector(
    (state: RootState) => state.remoxData.accounts,
    (accounts) => {
        if (accounts.length > 0) {
            return accounts.reduce<IPrice>(
                (a, c) => {

                    c.coins.forEach((coin) => {

                        if (coin.type === "Spot") {
                            if (a?.[coin.symbol]) {
                                a[coin.symbol].amount += coin.amount;
                            } else {
                                a[coin.symbol] = coin;
                            }
                        }

                    })

                    return a;
                },
                {}
            );
        }
        return null;
    }
);

export const SelectSpotTotalBalance = createDraftSafeSelector(
    (state: RootState) => state.remoxData.accounts,
    (state: RootState) => state.remoxData.storage,
    (state: RootState) => state.remoxData.historyPriceList,
    (accounts, storage, hp) => {
        if (accounts.length > 0) {
            const fiat = storage?.organization?.fiatMoneyPreference ?? storage?.individual?.fiatMoneyPreference ?? "USD";
            let pc = storage?.organization?.priceCalculation ?? storage?.individual?.priceCalculation ?? "current";

            return accounts.reduce<number>((a, c) => {
                c.coins.forEach((s) => {
                    if (s.coin.type !== TokenType.YieldToken) {
                        a += generatePriceCalculation(s, hp, pc, fiat);
                    }
                })
                return a;
            }, 0);
        }
        return 0;
    }
);


export const SelectYieldTotalBalance = createDraftSafeSelector(
    (state: RootState) => state.remoxData.accounts,
    (state: RootState) => state.remoxData.storage,
    (state: RootState) => state.remoxData.historyPriceList,
    (accounts, storage, hp) => {
        if (accounts.length > 0) {
            const fiat = storage?.organization?.fiatMoneyPreference ?? storage?.individual?.fiatMoneyPreference ?? "USD";
            let pc = storage?.organization?.priceCalculation ?? storage?.individual?.priceCalculation ?? "current";

            return accounts.reduce<number>((a, c) => {
                c.coins.forEach((s) => {
                    if (s.coin.type === TokenType.YieldToken) {
                        a += generatePriceCalculation(s, hp, pc, fiat);
                    }
                })
                return a;
            }, 0);
        }
        return 0;
    }
);