import { createSlice } from '@reduxjs/toolkit';
import { RootState } from '../store';

export interface MultisigTransactionItem {
    destination: string,
    data: string,
    executed: boolean,
    confirmations: string[],
    value: string,
    id?: number,
    requiredCount?: string,
    owner?: string,
    newOwner?: string,
    valueOfTransfer?: string,
    method?: string
}

interface State {
    transactions: MultisigTransactionItem[] | undefined;
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
