import { createSlice } from '@reduxjs/toolkit';
import { GetTransactions } from '../../types/sdk/blockscout';
import { RootState } from '../store';

interface InitialTransaction {
	transactions: GetTransactions | null;
}

const initialState: InitialTransaction = {
	transactions: null
};

export const TransactionAPI = createSlice({
	name: 'transactions',
	initialState: initialState,
	reducers: {
		setTransactions: (state, action) => {
			state.transactions = action.payload;
		},
		removeTransactions: (state) => {
			state.transactions = null;
		}
	}
});

export const { setTransactions, removeTransactions } = TransactionAPI.actions;
export const SelectTransactions = (state: RootState) => state.transactionsStore.transactions;
export default TransactionAPI.reducer;
