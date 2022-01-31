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
	CELO: IBalanceItem | undefined;
	cUSD: IBalanceItem | undefined;
	cEUR: IBalanceItem | undefined;
	UBE: IBalanceItem | undefined;
	MOO: IBalanceItem | undefined;
	MOBI: IBalanceItem | undefined;
	POOF: IBalanceItem | undefined;
	cREAL: IBalanceItem | undefined;
}

interface ICurrency {
	celoCoins: ICoinMembers;
	balances: IBalanceMembers;
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
}

const State: ICurrency = {
	celoCoins: {
		CELO: undefined,
		cUSD: undefined,
		cEUR: undefined,
		UBE: undefined,
		MOO: undefined,
		MOBI: undefined,
		POOF: undefined,
		cREAL: undefined
	},
	balances: {
		CELO: undefined,
		cUSD: undefined,
		cEUR: undefined,
		UBE: undefined,
		MOO: undefined,
		MOBI: undefined,
		POOF: undefined,
		cREAL: undefined
	}
};

export const CurrencySlice = createSlice({
	name: 'currencySlice',
	initialState: State,
	reducers: {
		updateAllCurrencies: (state: ICurrency, action: { payload: IuseCurrency[] | undefined }) => {
			if (!action.payload) return;
			console.log('updateAllCurrencies', action.payload);
			const celo = action.payload.find((c) => c.name === 'CELO')!;
			const cusd = action.payload.find((c) => c.name === 'cUSD')!;
			const ceur = action.payload.find((c) => c.name === 'cEUR')!;
			const ube = action.payload.find((c) => c.name === 'UBE')!;
			const moo = action.payload.find((c) => c.name === 'MOO')!;
			const mobi = action.payload.find((c) => c.name === 'MOBI')!;
			const poof = action.payload.find((c) => c.name === 'POOF')!;
			const creal = action.payload.find((c) => c.name === 'cREAL')!;
			state.celoCoins = {
				CELO: { percent_24: celo.percent_24, price: celo.price },
				cUSD: { percent_24: cusd.percent_24, price: cusd.price },
				cEUR: { percent_24: ceur.percent_24, price: ceur.price },
				UBE: { percent_24: ube.percent_24, price: ube.price },
				MOO: { percent_24: moo.percent_24, price: moo.price },
				MOBI: { percent_24: mobi.percent_24, price: mobi.price },
				POOF: { percent_24: poof.percent_24, price: poof.price },
				cREAL: { percent_24: creal.percent_24, price: creal.price }
			};
		},
		updateBalance: (state: ICurrency, action) => {
			if (!action.payload) return;
			const [ celo, cusd, ceur, ube, moo, mobi, poof, creal ]: ICurrencyInternal[] = action.payload;
			state.celoCoins = {
				CELO: { ...state.celoCoins.CELO, current_balance: celo.current_balance },
				cUSD: { ...state.celoCoins.cUSD, current_balance: cusd.current_balance },
				cEUR: { ...state.celoCoins.cEUR, current_balance: ceur.current_balance },
				UBE: { ...state.celoCoins.UBE, current_balance: ube.current_balance },
				MOO: { ...state.celoCoins.MOO, current_balance: moo.current_balance },
				MOBI: { ...state.celoCoins.MOBI, current_balance: mobi.current_balance },
				POOF: { ...state.celoCoins.POOF, current_balance: poof.current_balance },
				cREAL: { ...state.celoCoins.cREAL, current_balance: creal.current_balance }
			};
		},
		deleteBalance: (state: ICurrency) => {
			state.celoCoins = {
				CELO: undefined,
				cUSD: undefined,
				cEUR: undefined,
				UBE: undefined,
				MOO: undefined,
				MOBI: undefined,
				POOF: undefined,
				cREAL: undefined
			};
			state.balances = {
				CELO: undefined,
				cUSD: undefined,
				cEUR: undefined,
				UBE: undefined,
				MOO: undefined,
				MOBI: undefined,
				POOF: undefined,
				cREAL: undefined
			};
		},
		updateUserBalance: (state: ICurrency, action) => {
			if (!action.payload) return;
			const [ celo, cusd, ceur, ube, moo, mobi, poof, creal ]: IBalanceItem[] = action.payload;
			state.balances = {
				CELO: {
					amount: celo.amount,
					per_24: celo.per_24,
					percent: celo.percent,
					coins: celo.coins,
					tokenPrice: celo.tokenPrice
				},
				cUSD: {
					amount: cusd.amount,
					per_24: cusd.per_24,
					percent: cusd.percent,
					coins: cusd.coins,
					tokenPrice: cusd.tokenPrice
				},
				cEUR: {
					amount: ceur.amount,
					per_24: ceur.per_24,
					percent: ceur.percent,
					coins: ceur.coins,
					tokenPrice: ceur.tokenPrice
				},
				UBE: {
					amount: ube.amount,
					per_24: ube.per_24,
					percent: ube.percent,
					coins: ube.coins,
					tokenPrice: ube.tokenPrice
				},
				MOO: {
					amount: moo.amount,
					per_24: moo.per_24,
					percent: moo.percent,
					coins: moo.coins,
					tokenPrice: moo.tokenPrice
				},
				MOBI: {
					amount: mobi.amount,
					per_24: mobi.per_24,
					percent: mobi.percent,
					coins: mobi.coins,
					tokenPrice: mobi.tokenPrice
				},
				POOF: {
					amount: poof.amount,
					per_24: poof.per_24,
					percent: poof.percent,
					coins: poof.coins,
					tokenPrice: poof.tokenPrice
				},
				cREAL: {
					amount: creal.amount,
					per_24: creal.per_24,
					percent: creal.percent,
					coins: creal.coins,
					tokenPrice: creal.tokenPrice
				}
			};
		}
	}
});

export const { updateAllCurrencies, updateUserBalance, deleteBalance } = CurrencySlice.actions;

export const SelectCurrencies = (state: RootState): ICoinMembers => state.currencyandbalance.celoCoins;
export const SelectBalances = (state: RootState): IBalanceMembers => state.currencyandbalance.balances;
export const SelectCelo = (state: RootState) => state.currencyandbalance.celoCoins.CELO;
export const SelectCusd = (state: RootState) => state.currencyandbalance.celoCoins.cUSD;
export const SelectCeur = (state: RootState) => state.currencyandbalance.celoCoins.cEUR;

export default CurrencySlice.reducer;
