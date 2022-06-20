import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { generate } from 'shortid';
import { DropDownItem } from "../../types/dropdown";
import type { RootState } from '../store'

export interface ISplitInput {
    index: string;
    budget?: string;
    amount?: number;
    wallet?: DropDownItem;

}

interface ISplitInputs {
    inputs: ISplitInput[],
    inputAmount: number,
}

const SplitInputs: ISplitInputs = {
    inputs: [
        { index: generate() }
    ],
    inputAmount: 0,
}


const SplitInputSlice = createSlice({
    name: "splitinput",
    initialState: SplitInputs,
    reducers: {

        addSplitInput: (state, action: { payload: ISplitInput }) => {
            state.inputs.push(action.payload)
            state.inputAmount += 1
        },
        changeSplitInput: (state: ISplitInputs, action: PayloadAction<ISplitInput>) => {
            const { index } = action.payload;
            const input = state.inputs.find(i => i.index === index);
            if (input) {
                input.budget = action.payload.budget;
                input.amount = action.payload.amount;
                input.wallet = action.payload.wallet;

            }
        },
        removeSplitInput: (state, action: { payload: string }) => {
            state.inputs = state.inputs.filter(input => input.index !== action.payload)
            state.inputAmount -= 1
        },
        resetSplitInput: (state) => {
            state.inputs = [
                {index: generate()}
            ]
            state.inputAmount = 0
        }
    }
})

export const {addSplitInput,resetSplitInput,removeSplitInput,changeSplitInput} = SplitInputSlice.actions;
export const SelectInputs = (state: RootState) => state.splitInputs.inputs;
export const SelectInputAmount = (state: RootState) => state.splitInputs.inputAmount;

export default SplitInputSlice.reducer;