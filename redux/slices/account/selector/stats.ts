import { createDraftSafeSelector } from "@reduxjs/toolkit";
import { IFlowDetail, IFlowDetailItem } from "pages/api/calculation/_spendingType";
import { RootState } from "redux/store";
import { DecimalConverter, IPrice } from "utils/api";
import date from 'date-and-time';
import { GetFiatPrice } from "utils/const";

export const SelectStats = createDraftSafeSelector(
    (state: RootState) => state.remoxData.stats,
    (stats) => stats
);

// export const SelectDailyBalance = createDraftSafeSelector(
//     (state: RootState) => state.remoxData.stats,
//     (state: RootState) => state.remoxData.storage,
//     // (state: RootState) => state.remoxData.balances,
//     (state: RootState) => state.remoxData.historyPriceList,
//     (state: RootState) => state.remoxData.accounts,
//     (stats, storage, hp, accounts) => {
//         if (stats) {
//             const stringTime = (time: Date) => `${time.getFullYear()}/${time.getMonth() + 1 > 9 ? time.getMonth() + 1 : `0${time.getMonth() + 1}`}/${time.getDate() > 9 ? time.getDate() : `0${time.getDate()}`}`
//             const timeCoins: { [time: string]: IPrice } = {}
//             const preference = storage?.organization?.fiatMoneyPreference ?? storage?.individual?.fiatMoneyPreference ?? "USD";
//             // let pc = storage?.organization?.priceCalculation ?? storage?.individual?.priceCalculation ?? "current";

//             let response: { [time: string]: number } = {}
//             let balance = accounts.reduce<IPrice>((a, account) => {
//                 for (const coin of account.coins) {
//                     if (a[coin.symbol] === undefined) {
//                         a[coin.symbol] = Object.assign({}, coin) as any;
//                     } else {
//                         a[coin.symbol].amount += coin.amount;
//                     }
//                 }
//                 return a;
//             }, {});

//             let newest = "1970/01/01";
//             for (const [flowKey, flowValue] of Object.entries(stats.Account).reverse()) {
//                 if (new Date(flowKey).getTime() > new Date(newest).getTime()) newest = flowKey
//                 for (const item of flowValue) {
//                     if (!timeCoins[flowKey]) {
//                         timeCoins[flowKey] = {};
//                     }
//                     if (balance[item.name.symbol]) {
//                         balance[item.name.symbol].amount += ((item.type === "in" ? -1 : 1) * DecimalConverter(item.amount, item.name.decimals));
//                     }
//                     if (balance?.[item?.fee?.name?.symbol]) {
//                         balance[item.fee.name.symbol].amount -= DecimalConverter(item.fee.amount, item.fee.name.decimals);
//                     }
//                     timeCoins[flowKey] = balance


//                 }
//                 response[flowKey] = Object.entries(timeCoins[flowKey]).reduce((a, [key, val]) => {
//                     if (val.amount > 0 && flowKey === "2022/10/30") {
//                         console.log(flowKey, key, val.amount)
//                         console.log((hp[balance[key].symbol]?.[preference].find(s => new Date(flowKey).getTime() === new Date(s.date).getTime())?.price))
//                     }
//                     a += (hp[balance[key].symbol]?.[preference].find(s => new Date(flowKey).getTime() === new Date(s.date).getTime())?.price ?? GetFiatPrice(balances[key], preference)) * val.amount
//                     return a;
//                 }, 0);
//             }

//             let totalBalance = 0;
//             accounts.forEach((account) => {
//                 account.coins.forEach((coin) => {
//                     totalBalance += (coin.amount * GetFiatPrice(coin, preference)) //generatePriceCalculation(coin, hp, pc, preference);
//                 })
//             })

//             if (response[stringTime(new Date())] === undefined && Object.keys(response).length > 0) response[stringTime(new Date())] = totalBalance
//             response = Object.entries(response).sort(([key1], [key2]) => new Date(key1).getTime() > new Date(key2).getTime() ? 1 : -1).reduce<typeof response>((a, c) => { a[c[0]] = c[1]; return a }, {})

//             const calendarList = Object.entries(response).reverse()
//             if (calendarList.length > 0) {
//                 const last = calendarList.at(-1)
//                 const first = calendarList[0][0]
//                 if (last && calendarList.length > 0) {
//                     let saved = response[last[0]]
//                     let lastCheckedTime = last[0]
//                     const difference = date.subtract(new Date(last[0]), new Date(first)).toDays()
//                     for (let index = difference; index > 0; index--) {
//                         const time = stringTime(date.addDays(new Date(last[0]), -1 * (difference - index - 1)))
//                         if (response[time]) {
//                             saved = response[time]
//                             lastCheckedTime = time
//                         } else {
//                             if (timeCoins?.[lastCheckedTime]) {
//                                 response[time] = Object.entries(timeCoins[lastCheckedTime]).reduce((a, [key, val]) => {
//                                     a += (hp[balance[key].symbol]?.[preference].find(s => new Date(time).getTime() === new Date(s.date).getTime())?.price ?? GetFiatPrice(balances[key], preference)) * val.amount
//                                     return a;
//                                 }, 0);
//                             } else {
//                                 response[time] = saved
//                             }
//                         }
//                     }
//                 }
//             }
//             response = Object.entries(response).sort(([key1], [key2]) => new Date(key1).getTime() > new Date(key2).getTime() ? 1 : -1).reduce<typeof response>((a, c) => { a[c[0]] = c[1]; return a }, {})
//             console.log("Response2: ", response)
//             return {
//                 week: Object.entries(response).filter(([time, amount]) => Math.abs(date.subtract(new Date(), new Date(time)).toDays()) <= 7).reduce<{ [name: string]: number }>((a, c) => { a[c[0]] = c[1]; return a; }, {}),
//                 month: Object.entries(response).filter(([time, amount]) => Math.abs(date.subtract(new Date(), new Date(time)).toDays()) <= 31).reduce<{ [name: string]: number }>((a, c) => { a[c[0]] = c[1]; return a; }, {}),
//                 quart: Object.entries(response).filter(([time, amount]) => Math.abs(date.subtract(new Date(), new Date(time)).toDays()) <= 90).reduce<{ [name: string]: number }>((a, c) => { a[c[0]] = c[1]; return a; }, {}),
//                 year: Object.entries(response).filter(([time, amount]) => Math.abs(date.subtract(new Date(), new Date(time)).toDays()) <= 365).reduce<{ [name: string]: number }>((a, c) => { a[c[0]] = c[1]; return a; }, {}),
//             };
//         }
//         return null;
//     }
// );
