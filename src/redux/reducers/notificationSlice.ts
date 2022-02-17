import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import type { RootState } from '../store'

interface NotificatinoState {
    onSuccess: boolean;
    onSuccessText: string | JSX.Element;
    onError: boolean;
    onErrorText: string;
    notificationSeen: number;
    darkMode: boolean;
}

const initialState: NotificatinoState = {
    onSuccess: false,
    onSuccessText: 'Successfully!',
    onError: false,
    onErrorText: '',
    notificationSeen: 0,
    darkMode: localStorage.getItem('darkMode') ? localStorage.getItem('darkMode') === 'true' ? true : false : true,
}

export const notificationSlice = createSlice({
    name: 'notification',
    initialState,
    reducers: {
        changeError: (state, action: PayloadAction<{ activate: boolean; text?: string }>) => {
            state.onErrorText = action.payload.text || "Something went wrong";
            state.onError = action.payload.activate;
        },
        changeSuccess: (state, action: PayloadAction<{ activate: boolean; text?: string | JSX.Element }>) => {
            state.onSuccess = action.payload.activate;
            state.onSuccessText = action.payload.text || "Successfully!"
        },
        changeNotificationSeen: (state, action: PayloadAction<number>) => {
            state.notificationSeen = action.payload;
        },
        changeDarkMode: (state, action: PayloadAction<boolean>) => {
            localStorage.setItem('darkMode', action.payload.toString());
            state.darkMode = action.payload;
        }
    },
})

export const { changeError, changeSuccess, changeNotificationSeen, changeDarkMode } = notificationSlice.actions

export const selectError = (state: RootState) => state.notification.onError
export const selectErrorText = (state: RootState) => state.notification.onErrorText
export const selectSuccessText = (state: RootState) => state.notification.onSuccessText
export const selectSuccess = (state: RootState) => state.notification.onSuccess
export const selectDarkMode = (state: RootState) => state.notification.darkMode

export default notificationSlice.reducer