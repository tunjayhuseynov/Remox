import { createSlice } from '@reduxjs/toolkit';
import { Transactions } from '../../types/sdk/blockscout';
import { RootState } from '../store';

interface InitialTransaction {
	transactions: Transactions[];
}

const initialState: InitialTransaction = {
	transactions: []
};

export const TransactionAPI = createSlice({
	name: 'transactions',
	initialState: initialState,
	reducers: {
		setTransactions: (state, action) => {
			state.transactions = action.payload;
		},
		removeTransactions: (state) => {
			state.transactions = [];
		}
	}
});

export const { setTransactions, removeTransactions } = TransactionAPI.actions;
export const SelectTransactions = (state: RootState) => state.transactionsStore.transactions;
export default TransactionAPI.reducer;
