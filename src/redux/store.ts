import { configureStore } from '@reduxjs/toolkit'
import Notification from './reducers/notificationSlice'
import Storage from './reducers/storage'
import Unlock from './reducers/unlock'
import Currency from './reducers/currencies'
import Toggle from './reducers/toggles'
import Transaction from './reducers/transactions'
import SelectedAcount from './reducers/selectedAccount'
import Multisig from './reducers/multisig'
import Contributors from './reducers/contributors'
import { accountAPI, customerAPI, teamAPI, transactionAPI, teamMemberAPI, BlockScoutApi, swapAPI, multisigAPI } from './api'

const store = configureStore({
    reducer: {
        currencyandbalance: Currency,
        notification: Notification,
        storage: Storage,
        unlock: Unlock,
        toggle: Toggle,
        transactionsStore: Transaction,
        selectedAccount: SelectedAcount,
        multisig: Multisig,
        contributors: Contributors,
        [accountAPI.reducerPath]: accountAPI.reducer,
        [customerAPI.reducerPath]: customerAPI.reducer,
        [swapAPI.reducerPath]: swapAPI.reducer,
        [teamAPI.reducerPath]: teamAPI.reducer,
        [teamMemberAPI.reducerPath]: teamMemberAPI.reducer,
        [transactionAPI.reducerPath]: transactionAPI.reducer,
        [BlockScoutApi.reducerPath]: BlockScoutApi.reducer,
        [multisigAPI.reducerPath]: multisigAPI.reducer,
    },
    middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware({ serializableCheck: false }).concat(accountAPI.middleware, customerAPI.middleware, transactionAPI.middleware, teamAPI.middleware, teamMemberAPI.middleware, BlockScoutApi.middleware, swapAPI.middleware, multisigAPI.middleware),
})

export type RootState = ReturnType<typeof store.getState>

export type AppDispatch = typeof store.dispatch

export default store;