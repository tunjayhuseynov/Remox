import { createDraftSafeSelector } from "@reduxjs/toolkit";
import { IFlowDetail, IFlowDetailItem } from "pages/api/calculation/_spendingType";
import { RootState } from "redux/store";
import { DecimalConverter } from "utils/api";
import { GetFiatPrice } from "utils/const";
import date from 'date-and-time';

export const SelectStats = createDraftSafeSelector(
    (state: RootState) => state.remoxData.stats,
    (stats) => stats
);

export const SelectDailyBalance = createDraftSafeSelector(
    (state: RootState) => state.remoxData.stats,
    (state: RootState) => state.remoxData.storage,
    (state: RootState) => state.remoxData.balances,
    (state: RootState) => state.remoxData.historyPriceList,
    (state: RootState) => state.remoxData.accounts,
    (state: RootState) => state.remoxData.coins,
    (stats, storage, balances, hp, accounts) => {
        if (stats) {
            const stringTime = (time: Date) => `${time.getFullYear()}/${time.getMonth() + 1}/${time.getDate()}`
            const timeCoins: { [time: string]: { [symbol: string]: number } } = {}
            const preference = storage?.organization?.fiatMoneyPreference ?? storage?.individual?.fiatMoneyPreference ?? "USD";
            let response: { [time: string]: number } = {}
            let balance: typeof balances = Object.entries(balances).reduce<typeof balances>((a, c) => {
                a[c[0]] = { ...c[1] }
                return a;
            }, {});
            let newest = "1970/1/1";
            Object.entries(stats.Account).reverse().forEach(([flowKey, flowValue]) => {
                if (new Date(flowKey).getTime() > new Date(newest).getTime()) newest = flowKey
                flowValue.forEach((item: IFlowDetailItem) => {
                    if (!timeCoins[flowKey]) {
                        timeCoins[flowKey] = {};
                    }
                    if (balance[item.name.symbol]) {
                        balance[item.name.symbol].amount += (item.type === "in" ? -1 : 1) * DecimalConverter(item.amount, item.name.decimals)
                    }

                    if (!timeCoins[flowKey][item.name.symbol]) {
                        timeCoins[flowKey][item.name.symbol] = balance[item.name.symbol].amount
                    }
                    // total += (item.type === "in" ? 1 : -1) * DecimalConverter(item.amount, item.name.decimals)
                })
                response[flowKey] = Object.entries(timeCoins[flowKey]).reduce((a, [key, val]) => {
                    a += (hp[balance[key].symbol]?.[preference].find(s => key === s.date)?.price ?? GetFiatPrice(balance[key], preference)) * val
                    return a;
                }, 0);
            })

            let totalBalance = 0;
            accounts.forEach((account) => {
                account.coins.forEach((coin) => {
                    totalBalance += GetFiatPrice(coin, preference) * coin.amount;
                })
            })

            if (response[stringTime(new Date())] === undefined) response[stringTime(new Date())] = totalBalance
            response = Object.entries(response).sort(([key1], [key2]) => new Date(key1).getTime() > new Date(key2).getTime() ? 1 : -1).reduce<typeof response>((a, c) => { a[c[0]] = c[1]; return a }, {})

            const calendarList = Object.entries(response)
            const last = calendarList.at(-1)
            const first = calendarList[0][0]
            let saved = response[calendarList[0][0]]
            if (last && calendarList.length > 0) {
                const difference = date.subtract(new Date(last[0]), new Date(first)).toDays()
                for (let index = 0; index < difference; index++) {
                    const time = stringTime(date.addDays(new Date(first), index + 1))
                    if (response[time]) {
                        saved = response[time]
                    } else {
                        response[time] = saved;
                    }
                }
            }
            response = Object.entries(response).sort(([key1], [key2]) => new Date(key1).getTime() > new Date(key2).getTime() ? 1 : -1).reduce<typeof response>((a, c) => { a[c[0]] = c[1]; return a }, {})
            return {
                week: Object.entries(response).filter(([time, amount]) => date.subtract(new Date(), new Date(time)).toDays() <= 7).reduce<{ [name: string]: number }>((a, c) => { a[c[0]] = c[1]; return a; }, {}),
                month: Object.entries(response).filter(([time, amount]) => date.subtract(new Date(), new Date(time)).toDays() <= 31).reduce<{ [name: string]: number }>((a, c) => { a[c[0]] = c[1]; return a; }, {}),
                quart: Object.entries(response).filter(([time, amount]) => date.subtract(new Date(), new Date(time)).toDays() <= 90).reduce<{ [name: string]: number }>((a, c) => { a[c[0]] = c[1]; return a; }, {}),
                year: Object.entries(response).filter(([time, amount]) => date.subtract(new Date(), new Date(time)).toDays() <= 365).reduce<{ [name: string]: number }>((a, c) => { a[c[0]] = c[1]; return a; }, {}),
            };
        }
        return null;
    }
);
