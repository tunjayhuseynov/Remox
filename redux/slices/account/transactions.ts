import { createSlice } from '@reduxjs/toolkit';
import { IFormattedTransaction } from 'hooks/useTransactionProcess';
import { ITag } from 'pages/api/tags';
import { Transactions } from '../../../types/sdk/blockscout';
import { RootState } from '../../store';

interface InitialTransaction {
	transactions: Transactions[];
	parsedTransactoins: IFormattedTransaction[];
}

const initialState: InitialTransaction = {
	transactions: [],
	parsedTransactoins: [],
};

export const TransactionAPI = createSlice({
	name: 'transactions',
	initialState: initialState,
	reducers: {
		setParsedTransactions: (state: InitialTransaction, action: { payload: IFormattedTransaction[] }) => {
			state.parsedTransactoins = action.payload;
		},
		removeParsedTransactions: (state: InitialTransaction) => {
			state.parsedTransactoins = [];
		},
		setTransactions: (state: InitialTransaction, action: { payload: Transactions[] }) => {
			state.transactions = action.payload;
		},
		removeTransactions: (state: InitialTransaction) => {
			state.transactions = [];
		},
		addTag: (state: InitialTransaction, action: { payload: { transactionId: string, tag: ITag } }) => {
			const tx = state.parsedTransactoins.find(s => s.hash.toLowerCase() === action.payload.transactionId)
			if (tx && action.payload.tag && !tx.tags?.some(s => s.id === action.payload.tag.id)) {
				tx.tags?.push(action.payload.tag)
			}
		},
		removeTag: (state: InitialTransaction, action: { payload: { transactionId: string, tag: ITag } }) => {
			const tx = state.parsedTransactoins.find(s => s.hash.toLowerCase() === action.payload.transactionId)
			if (tx && action.payload.tag) {
				tx.tags = tx.tags?.filter(s => s.id !== action.payload.tag.id)
			}
		},
	}
});

export const { setTransactions, removeTransactions, setParsedTransactions, addTag, removeTag } = TransactionAPI.actions;
export const SelectTransactions = (state: RootState) => state.transactionsStore.transactions;
export const SelectParsedTransactions = (state: RootState) => state.transactionsStore.parsedTransactoins;
export default TransactionAPI.reducer;
