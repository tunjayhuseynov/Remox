import { configureStore } from '@reduxjs/toolkit';
import Notification from './reducers/notificationSlice';
import Storage from './reducers/storage';
import Unlock from './reducers/unlock';
import Currency from './reducers/currencies';
import Toggle from './reducers/toggles';
import Transaction from './reducers/transactions';
import SelectedAcount from './reducers/selectedAccount';
import Multisig from './reducers/multisig';
import Contributors from './reducers/contributors';
import Requests from './reducers/requests';
import Tags from './reducers/tags';
import { BlockScoutApi } from './api';

const store = configureStore({
	reducer: {
		tags: Tags,
		currencyandbalance: Currency,
		notification: Notification,
		storage: Storage,
		unlock: Unlock,
		toggle: Toggle,
		transactionsStore: Transaction,
		selectedAccount: SelectedAcount,
		multisig: Multisig,
		contributors: Contributors,
		requests: Requests,
		[BlockScoutApi.reducerPath]: BlockScoutApi.reducer
	},
	middleware: (getDefaultMiddleware) =>
		getDefaultMiddleware({ serializableCheck: false }).concat(BlockScoutApi.middleware)
});

export type RootState = ReturnType<typeof store.getState>;

export type AppDispatch = typeof store.dispatch;

export default store;
