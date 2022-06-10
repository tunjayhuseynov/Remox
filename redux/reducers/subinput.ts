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
        resetSubInput: (state) => {
            state.inputs = [
                {index: generate()}
            ]
            state.inputAmount = 0
        }
    }
})

export const {addSubInput,resetSubInput} = SubInputSlice.actions;
export const SelectInputs = (state: RootState) => state.subInputs.inputs;


export default SubInputSlice.reducer;