import { createDraftSafeSelector, createSlice, PayloadAction } from '@reduxjs/toolkit';
import { CoinsURL } from 'types';
import type { RootState } from '../store'

export interface IPayInput {
    index: string;
    name?: string;
    surname?: string;
    address?: string;
    amount?: number;
    wallet: { name: string, coinUrl: string };
    amount2?: number;
    wallet2?: { name: string, coinUrl: string };
}

interface IPayInputs {
    inputs: IPayInput[],
    inputAmount: number,
    isBasedOnDollar: boolean;
}

const PayInputs: IPayInputs = {
    inputs: [],
    inputAmount: 0,
    isBasedOnDollar: false,
}


const PayInputSlice = createSlice({
    name: "payinput",
    initialState: PayInputs,
    reducers: {
        changeBasedValue: (state: IPayInputs, action: PayloadAction<boolean>) => {
            state.isBasedOnDollar = action.payload
        },
        changePayInput: (state: IPayInputs, action: PayloadAction<IPayInput>) => {
            const { index } = action.payload;
            const input = state.inputs.find(i => i.index === index);
            if (input) {
                input.name = action.payload.name;
                input.surname = action.payload.surname;
                input.address = action.payload.address;
                input.amount = action.payload.amount;
                input.wallet = action.payload.wallet;
                input.amount2 = action.payload.amount2;
                input.wallet2 = action.payload.wallet2;
            }
        },
        changeWallet: (state: IPayInputs, action: { payload: { index: string, wallet: { name: string, coinUrl: CoinsURL } } }) => {
            const { index, wallet } = action.payload;
            const input = state.inputs.find(i => i.index === index);
            if (input) {
                input.wallet = wallet;
            }
        },
        changeSecondWallet: (state: IPayInputs, action: { payload: { index: string, wallet: { name: string, coinUrl: CoinsURL } } }) => {
            const { index, wallet } = action.payload;
            const input = state.inputs.find(i => i.index === index);
            if (input) {
                input.wallet2 = wallet;
            }
        },
        changeAmount: (state: IPayInputs, action: { payload: { index: string, amount: number } }) => {
            const { index, amount } = action.payload;
            const input = state.inputs.find(i => i.index === index);
            if (input) {
                input.amount = amount;
            }
        },
        changeSecondAmount: (state: IPayInputs, action: { payload: { index: string, amount: number } }) => {
            const { index, amount } = action.payload;
            const input = state.inputs.find(i => i.index === index);
            if (input) {
                input.amount2 = amount;
            }
        },
        changeAddress: (state: IPayInputs, action: { payload: { index: string, address: string } }) => {
            const { index, address } = action.payload;
            const input = state.inputs.find(i => i.index === index);
            if (input) {
                input.address = address;
            }
        },
        changeName: (state: IPayInputs, action: { payload: { index: string, name: string } }) => {
            const { index, name } = action.payload;
            const input = state.inputs.find(i => i.index === index);
            if (input) {
                input.name = name;
            }
        },
        addPayInput: (state: IPayInputs, action: { payload: IPayInput }) => {
            state.inputs.push(action.payload)
            state.inputAmount += 1
        },
        removePayInput: (state: IPayInputs, action: { payload: string }) => {
            state.inputs = state.inputs.filter(input => input.index !== action.payload)
            state.inputAmount -= 1
        },
        removeSeconField: (state: IPayInputs, action: { payload: string }) => {
            const input = state.inputs.find(i => i.index === action.payload);
            if (input) {
                input.amount2 = undefined;
                input.wallet2 = undefined;
            }
        },
        resetPayInput: (state: IPayInputs) => {
            state.inputs = [

            ]
            state.inputAmount = 0
            state.isBasedOnDollar = false
        }
    }
})

export const {
    addPayInput, removePayInput, changeName, changeSecondAmount, changeSecondWallet, changeWallet, removeSeconField,
    changePayInput, changeBasedValue, resetPayInput, changeAddress, changeAmount } = PayInputSlice.actions

export const SelectInputs = createDraftSafeSelector(
    (state: RootState) => state.payInputs.inputs,
    (inputs) => inputs
);
export const SelectIsBaseOnDollar = createDraftSafeSelector(
    (state: RootState) => state.payInputs.isBasedOnDollar,
    (isBasedOnDollar) => isBasedOnDollar
);
export const SelectInputAmount = createDraftSafeSelector(
    (state: RootState) => state.payInputs.inputAmount,
    (inputAmount) => inputAmount
);

export default PayInputSlice.reducer;