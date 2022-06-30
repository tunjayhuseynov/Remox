import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { generate } from 'shortid';
import { DropDownItem } from "types/dropdown";
import type { RootState } from '../store'

export interface IPayInput {
    index: string;
    name?: string;
    surname?: string;
    address?: string;
    amount?: number;
    wallet?: DropDownItem;
    amount2?: number;
    wallet2?: DropDownItem;
}

interface IPayInputs {
    inputs: IPayInput[],
    inputAmount: number,
    isBasedOnDollar: boolean;
}

const PayInputs: IPayInputs = {
    inputs: [
        { index: generate() }
    ],
    inputAmount: 1,
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
        addPayInput: (state, action: { payload: IPayInput }) => {
            state.inputs.push(action.payload)
            state.inputAmount += 1
        },
        removePayInput: (state, action: { payload: string }) => {
            state.inputs = state.inputs.filter(input => input.index !== action.payload)
            state.inputAmount -= 1
        },
        resetPayInput: (state) => {
            state.inputs = [
                {index: generate()}
            ]
            state.inputAmount = 1
            state.isBasedOnDollar = false
        }
    }
})

export const { addPayInput, removePayInput, changePayInput, changeBasedValue, resetPayInput } = PayInputSlice.actions

export const SelectInputs = (state: RootState) => state.payInputs.inputs;
export const SelectIsBaseOnDollar = (state: RootState) => state.payInputs.isBasedOnDollar;
export const SelectInputAmount = (state: RootState) => state.payInputs.inputAmount;

export default PayInputSlice.reducer;