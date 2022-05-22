import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { LendingUserComponentData } from 'apiHooks/useLending'
import type { RootState } from '../store'


interface ILendingState {
    data: LendingUserComponentData[],
}

const initialState: ILendingState = {
    data: [],
}

export const moolaSlice = createSlice({
    name: 'moola',
    initialState,
    reducers: {
        updateData: (state: ILendingState, action: PayloadAction<LendingUserComponentData[]>) => {
            state.data = action.payload
        },
    },
})

export const { updateData } = moolaSlice.actions

export const selectMoolaData = (state: RootState) => state.moola.data


export default moolaSlice.reducer