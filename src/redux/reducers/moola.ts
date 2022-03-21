import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { MoolaUserComponentData } from 'API/useMoola'
import type { RootState } from '../store'


const initialState: { 
    data: MoolaUserComponentData[],
} = {
    data: [],
}

export const moolaSlice = createSlice({
    name: 'moola',
    initialState,
    reducers: {
        updateData: (state, action: PayloadAction<MoolaUserComponentData[]>) => {
            state.data = action.payload
        },
    },
})

export const { updateData } = moolaSlice.actions

export const selectMoolaData = (state: RootState) => state.moola.data


export default moolaSlice.reducer