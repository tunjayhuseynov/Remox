import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { generate } from 'shortid';
import { DropDownItem } from "../../types/dropdown";
import type { RootState } from '../store'

export interface ISubInput {
    index: string;
    name?: string;
    amount?: number;
    wallet?: DropDownItem;
    amount2?: number;
    wallet2?: DropDownItem;
}

interface ISubInputs {
    inputs: ISubInput[],
    inputAmount: number,
}

const SubInputs: ISubInputs = {
    inputs: [
        { index: generate() }
    ],
    inputAmount: 0,
}


const SubInputSlice = createSlice({
    name: "subinput",
    initialState: SubInputs,
    reducers: {

        addSubInput: (state, action: { payload: ISubInput }) => {
            state.inputs.push(action.payload)
            state.inputAmount += 1
        },
        changeSubInput: (state: ISubInputs, action: PayloadAction<ISubInput>) => {
            const { index } = action.payload;
            const input = state.inputs.find(i => i.index === index);
            if (input) {
                input.name = action.payload.name;
                input.amount = action.payload.amount;
                input.wallet = action.payload.wallet;
                input.amount2 = action.payload.amount2;
                input.wallet2 = action.payload.wallet2;
            }
        },
        removeSubInput: (state, action: { payload: string }) => {
            state.inputs = state.inputs.filter(input => input.index !== action.payload)
            state.inputAmount -= 1
        },
        resetSubInput: (state) => {
            state.inputs = [
                {index: generate()}
            ]
            state.inputAmount = 0
        }
    }
})

export const {addSubInput,resetSubInput,removeSubInput,changeSubInput} = SubInputSlice.actions;
export const SelectInputs = (state: RootState) => state.subInputs.inputs;
export const SelectInputAmount = (state: RootState) => state.payInputs.inputAmount;

export default SubInputSlice.reducer;