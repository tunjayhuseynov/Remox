import { createSlice } from '@reduxjs/toolkit';
import { AltCoins } from 'types';
import { IuseCurrency } from '../../apiHooks/useCurrency';
import { RootState } from '../store';

export interface ICurrencyInternal {
	name: string;
	price: number;
	percent_24: number;
	current_balance?: number;
}

export interface IBalanceItem {
	amount: number;
	per_24: number;
	percent: number;
	coins: AltCoins;
	tokenPrice: number;
}

export interface IBalanceMembers {
	[name: string]: IBalanceItem;
}

interface ICurrency {
	celoCoins: ICoinMembers;
	balances: IBalanceMembers;
	orderBalance: IBalanceItem[];
	totalBalance: number | undefined;
}

export interface ICoinMembers {
	[name: string]: ICurrencyInternal;
}

const State: ICurrency = {
	celoCoins: {},
	balances: {},
	orderBalance: [],
	totalBalance: undefined
};

export const CurrencySlice = createSlice({
	name: 'currencySlice',
	initialState: State,
	reducers: {
		updateAllCurrencies: (state: ICurrency, action: { payload: IuseCurrency[] }) => {
			if (!action.payload) return;

			state.celoCoins = action.payload.reduce<{ [name: string]: ICurrencyInternal }>((a, c) => {
				a[c.name] = c;

				return a;
			}, {});
		},
		updateTotalBalance: (state: ICurrency, action: { payload: number | undefined }) => {
			state.totalBalance = action.payload;
		},
		deleteBalance: (state: ICurrency) => {
			state.celoCoins = {};
			state.balances = {};
		},
		updateUserBalance: (state: ICurrency, action) => {
			if (!action.payload) return;

			state.balances = {
				...action.payload
			};
		},
		setOrderBalance: (state: ICurrency, action: { payload: IBalanceItem[] }) => {
			state.orderBalance = action.payload;
		}
	}
});

export const { updateAllCurrencies, updateUserBalance, deleteBalance, updateTotalBalance, setOrderBalance } = CurrencySlice.actions;

export const SelectCurrencies = (state: RootState): ICoinMembers => state.currencyandbalance.celoCoins;
export const SelectOrderBalance = (state: RootState): IBalanceItem[] => state.currencyandbalance.orderBalance;
export const SelectBalances = (state: RootState): IBalanceMembers => state.currencyandbalance.balances;
export const SelectTotalBalance = (state: RootState) => state.currencyandbalance.totalBalance;
export const SelectCelo = (state: RootState) => state.currencyandbalance.celoCoins.CELO;
export const SelectCusd = (state: RootState) => state.currencyandbalance.celoCoins.cUSD;
export const SelectCeur = (state: RootState) => state.currencyandbalance.celoCoins.cEUR;

export default CurrencySlice.reducer;
