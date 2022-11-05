import { createDraftSafeSelector } from "@reduxjs/toolkit";
import { RootState } from "redux/store";
import { TokenType } from "types";
import { IPrice } from "utils/api";
import { GetFiatPrice } from "utils/const";

export const SelectBalance = createDraftSafeSelector(
    (state: RootState) => state.remoxData.accounts,
    (accounts) => {
        return [...accounts].reduce((accum, account) => {
            const acc = Object.assign({}, accum);
            for (const coin of [...account.coins]) {
                if (acc[coin.symbol]) {
                    Object.defineProperty(acc[coin.symbol], "amount", {
                        value: accum[coin.symbol].amount += coin.amount,
                        writable: true,
                    })
                } else {
                    acc[coin.symbol] = { ...coin }
                }
            }

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

        // let pc = storage?.organization?.priceCalculation ?? storage?.individual?.priceCalculation ?? "current";
        let fiat = storage?.organization?.fiatMoneyPreference ?? storage?.individual?.fiatMoneyPreference ?? "USD";

        let totalBalance = 0;
        accounts.forEach((account) => {
            account.coins.forEach((coin) => {
                totalBalance += (coin.amount * GetFiatPrice(coin, fiat)) //generatePriceCalculation(coin, hp, pc, fiat);
            })
        })
        return totalBalance;
    }
);

export const SelectYieldBalance = createDraftSafeSelector(
    (state: RootState) => state.remoxData.accounts,
    (accounts) => {
        return (selectedAccounts: string[]) => {
            if (accounts.filter(s => selectedAccounts.find(d => d === s.id)).length > 0) {
                return accounts.filter(s => selectedAccounts.find(d => d === s.id)).reduce<IPrice>(
                    (a, c) => {

                        c.coins.forEach((coin) => {

                            if (coin.type === "Yield") {
                                if (a?.[coin.symbol]) {
                                    a[coin.symbol].amount += coin.amount;
                                } else {
                                    a[coin.symbol] = { ...coin };
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
    }
);


export const SelectSpotBalance = createDraftSafeSelector(
    (state: RootState) => state.remoxData.accounts,
    (accounts) => {
        return (selectedAccounts: string[]) => {
            if (accounts.filter(s => selectedAccounts.find(d => d === s.id)).length > 0) {
                return accounts.filter(s => selectedAccounts.find(d => d === s.id)).reduce<IPrice>(
                    (a, c) => {

                        c.coins.forEach((coin) => {

                            if (coin.type === "Spot") {
                                if (a?.[coin.symbol]) {
                                    a[coin.symbol].amount += coin.amount;
                                } else {
                                    a[coin.symbol] = { ...coin };
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
    }
);

export const SelectSpotTotalBalance = createDraftSafeSelector(
    (state: RootState) => state.remoxData.accounts,
    (state: RootState) => state.remoxData.storage,
    (state: RootState) => state.remoxData.historyPriceList,
    (accounts, storage, hp) => {
        return (selectedAccounts: string[]) => {
            if (accounts.filter(s => selectedAccounts.find(d => d === s.id)).length > 0) {
                const fiat = storage?.organization?.fiatMoneyPreference ?? storage?.individual?.fiatMoneyPreference ?? "USD";
                // let pc = storage?.organization?.priceCalculation ?? storage?.individual?.priceCalculation ?? "current";

                return accounts.filter(s => selectedAccounts.find(d => d === s.id)).reduce<number>((a, c) => {
                    c.coins.forEach((s) => {
                        if (s.coin.type !== TokenType.YieldToken) {
                            a += (s.amount * GetFiatPrice(s, fiat)) //generatePriceCalculation(s, hp, pc, fiat);
                        }
                    })
                    return a;
                }, 0);
            }
            return 0;
        }
    }
);


export const SelectYieldTotalBalance = createDraftSafeSelector(
    (state: RootState) => state.remoxData.accounts,
    (state: RootState) => state.remoxData.storage,
    (state: RootState) => state.remoxData.historyPriceList,
    (accounts, storage, hp) => {
        return (selectedAccounts: string[]) => {
            if (accounts.filter(s => selectedAccounts.find(d => d === s.id)).length > 0) {
                const fiat = storage?.organization?.fiatMoneyPreference ?? storage?.individual?.fiatMoneyPreference ?? "USD";
                // let pc = storage?.organization?.priceCalculation ?? storage?.individual?.priceCalculation ?? "current";

                return accounts.filter(s => selectedAccounts.find(d => d === s.id)).reduce<number>((a, c) => {
                    c.coins.forEach((s) => {
                        if (s.coin.type === TokenType.YieldToken) {
                            a += (s.amount * GetFiatPrice(s, fiat)) //generatePriceCalculation(s, hp, pc, fiat);
                        }
                    })
                    return a;
                }, 0);
            }
            return 0;
        }
    }
);