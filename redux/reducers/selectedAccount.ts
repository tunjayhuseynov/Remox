import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import type { RootState } from '../store'
import { IStorage } from './storage'


interface IAccountInfo {
    address: string,
    isExist: boolean,
    privateToken: string
}

const init = (): IAccountInfo => {
    if(typeof window === 'undefined') return { address: '', privateToken: '', isExist: false }
    const val = localStorage.getItem("remoxUser")

    if (val) {
        const data: IStorage = JSON.parse(val)
        return { address: data.lastSignedProviderAddress, privateToken: '', isExist: true }
    }
    return { address: '', privateToken: '', isExist: false };
}

export const SelectedAccountSlice = createSlice({
    name: 'selectedAccount',
    initialState: init(),
    reducers: {
        changeAccount: (state: IAccountInfo, action: PayloadAction<string>) => {
            state.address = action.payload
        },
        changePrivateToken: (state: IAccountInfo, action: PayloadAction<string>) => {
            state.privateToken = action.payload
        },
        changeExisting: (state: IAccountInfo, action: PayloadAction<boolean>) => {
            state.isExist = action.payload
        }
    },
})

export const { changeAccount, changePrivateToken, changeExisting } = SelectedAccountSlice.actions

export const SelectSelectedAccount = (state: RootState) => state.selectedAccount.address
export const SelectPrivateToken = (state: RootState) => state.selectedAccount.privateToken
export const SelectExisting = (state: RootState) => state.selectedAccount.isExist

export default SelectedAccountSlice.reducer