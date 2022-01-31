import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import type { RootState } from '../store'
import { IStorage } from './storage'


interface IContainer {
    address: string, 
}

const init = (): IContainer => {
    const val = localStorage.getItem("remoxUser")

    if (val) {
        const data: IStorage = JSON.parse(val)
        return { address: data.accountAddress }
    }
    return { address: '' };
}

export const SelectedAccountSlice = createSlice({
    name: 'selectedAccount',
    initialState: init(),
    reducers: {
        changeAccount: (state: IContainer, action: PayloadAction<string>) => {
            state.address = action.payload
        },
 
    },
})

export const { changeAccount } = SelectedAccountSlice.actions

export const SelectSelectedAccount = (state: RootState) => state.selectedAccount.address

export default SelectedAccountSlice.reducer