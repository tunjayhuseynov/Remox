import { createSlice } from '@reduxjs/toolkit';
import { NonExecTransactionItem } from '../../types/sdk';
import { RootState } from '../store';

interface State {
    transactions: NonExecTransactionItem[] | undefined;
    sign?: number;
    internalSign?: number;
}

const initialState: State = {
    transactions: [],
};

export const multisigSlice = createSlice({
    name: 'multisig',
    initialState: initialState,
    reducers: {
        setTransactions: (state, action) => {
            if(action.payload !== undefined && action.payload?.length !== 0){
                if(state.transactions) state.transactions = [...state.transactions, ...action.payload];
                else state.transactions = [...action.payload];
            }else state.transactions = action.payload
        },
        setInternalSign: (state, action)=>{
            state.internalSign = action.payload
        },
        setSign: (state, action)=>{
            state.sign = action.payload
        }
    }
});

export const { setTransactions, setInternalSign, setSign } = multisigSlice.actions;

export const selectMultisigTransactions = (state: RootState) => state.multisig.transactions;
export const selectMultisig = (state: RootState) => state.multisig;

export default multisigSlice.reducer;
