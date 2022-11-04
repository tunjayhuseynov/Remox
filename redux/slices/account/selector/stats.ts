import { createDraftSafeSelector } from "@reduxjs/toolkit";
import { IFlowDetail, IFlowDetailItem } from "pages/api/calculation/_spendingType";
import { RootState } from "redux/store";
import { DecimalConverter } from "utils/api";
import date from 'date-and-time';
import { GetFiatPrice } from "utils/const";

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
            const stringTime = (time: Date) => `${time.getFullYear()}/${time.getMonth() + 1 > 9 ? time.getMonth() + 1 : `0${time.getMonth() + 1}`}/${time.getDate() > 9 ? time.getDate() : `0${time.getDate()}`}`
            const timeCoins: { [time: string]: { [symbol: string]: number } } = {}
            const preference = storage?.organization?.fiatMoneyPreference ?? storage?.individual?.fiatMoneyPreference ?? "USD";
            let pc = storage?.organization?.priceCalculation ?? storage?.individual?.priceCalculation ?? "current";

            let response: { [time: string]: number } = {}
            let balance: typeof balances = accounts.reduce<typeof balances>((a, account) => {
                account.coins.forEach(coin => {
                    if (a[coin.symbol] === undefined) {
                        a[coin.symbol] = Object.assign({ amount: 0 }, coin);
                    } else {
                        a[coin.symbol].amount += coin.amount;
                    }
                })
                // a[c[0]] = { ...c[1] }
                return a;
            }, {});
            let newest = "1970/1/1";
            Object.entries(stats.Account).forEach(([flowKey, flowValue]) => {
                if (new Date(flowKey).getTime() > new Date(newest).getTime()) newest = flowKey
                flowValue.forEach((item: IFlowDetailItem) => {
                    if (!timeCoins[flowKey]) {
                        timeCoins[flowKey] = {};
                    }
                    if (balance[item.name.symbol]) {
                        balance[item.name.symbol].amount += ((item.type === "in" ? 1 : -1) * DecimalConverter(item.amount, item.name.decimals));
                    }
                    if (balance?.[item?.fee?.name?.symbol]) {
                        balance[item.fee.name.symbol].amount -= DecimalConverter(item.fee.amount, item.fee.name.decimals);
                    }

                    // if (!timeCoins[flowKey][item.name.symbol]) {
                    timeCoins[flowKey][item.name.symbol] = balance[item.name.symbol].amount

                    // }
                    // total += (item.type === "in" ? 1 : -1) * DecimalConverter(item.amount, item.name.decimals)
                })
                response[flowKey] = Object.entries(timeCoins[flowKey]).reduce((a, [key, val]) => {
                    a += ((hp[balance[key].symbol]?.[preference].find(s => new Date(flowKey).getTime() === new Date(s.date).getTime())?.price) ?? GetFiatPrice(balances[key], preference)) * val
                    return a;
                }, 0);
            })
            // console.log("TimeCoins: ", timeCoins)
            let totalBalance = 0;
            accounts.forEach((account) => {
                account.coins.forEach((coin) => {
                    totalBalance += (coin.amount * GetFiatPrice(coin, preference)) //generatePriceCalculation(coin, hp, pc, preference);
                })
            })

            if (response[stringTime(new Date())] === undefined && Object.keys(response).length > 0) response[stringTime(new Date())] = totalBalance
            response = Object.entries(response).sort(([key1], [key2]) => new Date(key1).getTime() > new Date(key2).getTime() ? 1 : -1).reduce<typeof response>((a, c) => { a[c[0]] = c[1]; return a }, {})

            const calendarList = Object.entries(response)
            if (calendarList.length > 0) {
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
            }
            response = Object.entries(response).sort(([key1], [key2]) => new Date(key1).getTime() > new Date(key2).getTime() ? 1 : -1).reduce<typeof response>((a, c) => { a[c[0]] = c[1]; return a }, {})
            return {
                week: Object.entries(response).filter(([time, amount]) => Math.abs(date.subtract(new Date(), new Date(time)).toDays()) <= 7).reduce<{ [name: string]: number }>((a, c) => { a[c[0]] = c[1]; return a; }, {}),
                month: Object.entries(response).filter(([time, amount]) => Math.abs(date.subtract(new Date(), new Date(time)).toDays()) <= 31).reduce<{ [name: string]: number }>((a, c) => { a[c[0]] = c[1]; return a; }, {}),
                quart: Object.entries(response).filter(([time, amount]) => Math.abs(date.subtract(new Date(), new Date(time)).toDays()) <= 90).reduce<{ [name: string]: number }>((a, c) => { a[c[0]] = c[1]; return a; }, {}),
                year: Object.entries(response).filter(([time, amount]) => Math.abs(date.subtract(new Date(), new Date(time)).toDays()) <= 365).reduce<{ [name: string]: number }>((a, c) => { a[c[0]] = c[1]; return a; }, {}),
            };
        }
        return null;
    }
);
