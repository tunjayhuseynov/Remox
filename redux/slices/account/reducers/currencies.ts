import { AltCoins } from "types";
import { IRemoxData } from "../remoxData";

export interface ICurrencyInternal {
  address: string;
  chainID: number;
  decimals: number;
  logoURI: string;
  name: string;
  priceUSD: number;
  symbol: string;
  current_balance?: number;
}


export default {
  updateAllCurrencies: (
    state: IRemoxData,
    action: { payload: AltCoins[] }
  ) => {
    if (!action.payload) return;

    state.coins = action.payload.reduce<{
      [name: string]: AltCoins;
    }>((a, c) => {
      a[c.name] = c;

      return a;
    }, {});
  },
  updateTotalBalance: (
    state: IRemoxData,
    action: { payload: number }
  ) => {
    state.totalBalance = action.payload;
  },
  updateUserBalance: (state: IRemoxData, action: any) => {
    if (!action.payload) return;

    state.balances = {
      ...action.payload,
    };
  },
};



