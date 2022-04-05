import { createSlice } from '@reduxjs/toolkit';
import { AltCoins } from 'types';
import { IuseCurrency } from '../../API/useCurrency';
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

interface IBalanceMembers {
	[name: string]: IBalanceItem;
}

interface ICurrency {
	celoCoins: ICoinMembers;
	balances: IBalanceMembers;
	totalBalance: number | undefined;
}

export interface ICoinMembers {
	[name: string]: ICurrencyInternal;
}

const State: ICurrency = {
	celoCoins: {},
	balances: {},
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
		updateBalance: (state: ICurrency, action) => {
			if (!action.payload) return;
			const [ celo, cusd, ceur, ube, moo, mobi, poof, creal, pact, ari ]: ICurrencyInternal[] = action.payload;
			state.celoCoins = {
				CELO: { ...state.celoCoins.CELO, current_balance: celo.current_balance },
				cUSD: { ...state.celoCoins.cUSD, current_balance: cusd.current_balance },
				cEUR: { ...state.celoCoins.cEUR, current_balance: ceur.current_balance },
				cREAL: { ...state.celoCoins.cREAL, current_balance: creal.current_balance },
				UBE: { ...state.celoCoins.UBE, current_balance: ube.current_balance },
				MOO: { ...state.celoCoins.MOO, current_balance: moo.current_balance },
				MOBI: { ...state.celoCoins.MOBI, current_balance: mobi.current_balance },
				POOF: { ...state.celoCoins.POOF, current_balance: poof.current_balance },
				PACT: { ...state.celoCoins.PACT, current_balance: pact.current_balance },
				ARI: { ...state.celoCoins.ARI, current_balance: ari.current_balance }
			};
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
		}
	}
});

export const { updateAllCurrencies, updateUserBalance, deleteBalance, updateTotalBalance } = CurrencySlice.actions;

export const SelectCurrencies = (state: RootState): ICoinMembers => state.currencyandbalance.celoCoins;
export const SelectBalances = (state: RootState): IBalanceMembers => state.currencyandbalance.balances;
export const SelectTotalBalance = (state: RootState) => state.currencyandbalance.totalBalance;
export const SelectCelo = (state: RootState) => state.currencyandbalance.celoCoins.CELO;
export const SelectCusd = (state: RootState) => state.currencyandbalance.celoCoins.cUSD;
export const SelectCeur = (state: RootState) => state.currencyandbalance.celoCoins.cEUR;

export default CurrencySlice.reducer;
