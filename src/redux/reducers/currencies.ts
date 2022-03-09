import { createSlice } from '@reduxjs/toolkit';
import { IuseCurrency } from '../../API/useCurrency';
import { AltCoins } from '../../types/coins';
import { RootState } from '../store';

export interface ICurrencyInternal {
	name?: string;
	price?: number;
	percent_24?: number;
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
	CELO: ICurrencyInternal | undefined;
	cUSD: ICurrencyInternal | undefined;
	cEUR: ICurrencyInternal | undefined;
	UBE: ICurrencyInternal | undefined;
	MOO: ICurrencyInternal | undefined;
	MOBI: ICurrencyInternal | undefined;
	POOF: ICurrencyInternal | undefined;
	cREAL: ICurrencyInternal | undefined;
	PACT: ICurrencyInternal | undefined;
	ARI: ICurrencyInternal | undefined;
}

const State: ICurrency = {
	celoCoins: {
		CELO: undefined,
		cUSD: undefined,
		cEUR: undefined,
		cREAL: undefined,
		UBE: undefined,
		MOO: undefined,
		MOBI: undefined,
		POOF: undefined,
		PACT: undefined,
		ARI: undefined,
	},
	balances: {	},
	totalBalance: undefined
};

export const CurrencySlice = createSlice({
	name: 'currencySlice',
	initialState: State,
	reducers: {
		updateAllCurrencies: (state: ICurrency, action: { payload: IuseCurrency[] | undefined }) => {
			if (!action.payload) return;
			const celo = action.payload.find((c) => c.name === 'CELO')!;
			const cusd = action.payload.find((c) => c.name === 'cUSD')!;
			const ceur = action.payload.find((c) => c.name === 'cEUR')!;
			const ube = action.payload.find((c) => c.name === 'UBE')!;
			const moo = action.payload.find((c) => c.name === 'MOO')!;
			const mobi = action.payload.find((c) => c.name === 'MOBI')!;
			const poof = action.payload.find((c) => c.name === 'POOF')!;
			const creal = action.payload.find((c) => c.name === 'cREAL')!;
			const pact = action.payload.find((c) => c.name === 'PACT')!;
			const ari = action.payload.find((c) => c.name === 'ARI')!;
			state.celoCoins = {
				CELO: { percent_24: celo.percent_24, price: celo.price },
				cUSD: { percent_24: cusd.percent_24, price: cusd.price },
				cEUR: { percent_24: ceur.percent_24, price: ceur.price },
				cREAL: { percent_24: creal.percent_24, price: creal.price },
				UBE: { percent_24: ube.percent_24, price: ube.price },
				MOO: { percent_24: moo.percent_24, price: moo.price },
				MOBI: { percent_24: mobi.percent_24, price: mobi.price },
				POOF: { percent_24: poof.percent_24, price: poof.price },
				PACT: { percent_24: pact.percent_24, price: pact.price },
				ARI: { percent_24: ari.percent_24, price: ari.price },
			};
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
				ARI: { ...state.celoCoins.ARI, current_balance: ari.current_balance },
			};
		},
		updateTotalBalance: (state: ICurrency, action: { payload: number | undefined }) => {
			state.totalBalance = action.payload;
		},
		deleteBalance: (state: ICurrency) => {
			state.celoCoins = {
				CELO: undefined,
				cUSD: undefined,
				cEUR: undefined,
				cREAL: undefined,
				UBE: undefined,
				MOO: undefined,
				MOBI: undefined,
				POOF: undefined,
				PACT: undefined,
				ARI: undefined,
			};
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
