import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import type { RootState } from '../store'
import { IStorage } from './storage'


interface IContainer {
    address: string, 
    privateToken: string
}

const init = (): IContainer => {
    const val = localStorage.getItem("remoxUser")

    if (val) {
        const data: IStorage = JSON.parse(val)
        return { address: data.accountAddress, privateToken: '' }
    }
    return { address: '', privateToken: '' };
}

export const SelectedAccountSlice = createSlice({
    name: 'selectedAccount',
    initialState: init(),
    reducers: {
        changeAccount: (state: IContainer, action: PayloadAction<string>) => {
            state.address = action.payload
        },
        changePrivateToken: (state: IContainer, action: PayloadAction<string>) => {
            state.privateToken = action.payload
        }
    },
})

export const { changeAccount, changePrivateToken } = SelectedAccountSlice.actions

export const SelectSelectedAccount = (state: RootState) => state.selectedAccount.address
export const SelectPrivateToken = (state: RootState) => state.selectedAccount.privateToken

export default SelectedAccountSlice.reducer