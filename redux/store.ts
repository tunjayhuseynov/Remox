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
import Moola from './reducers/moola';
import Network from './reducers/network';
import Masspay from './reducers/masspay';
import Stats from './reducers/accountstats';
import PayInputs from './reducers/payinput';
import Budgets from './reducers/budgets';
import { BlockScoutApi, RemoxApi } from './api';

const store = configureStore({
	reducer: {
		tags: Tags,
		budgets: Budgets,
		currencyandbalance: Currency,
		notification: Notification,
		storage: Storage,
		unlock: Unlock,
		moola: Moola,
		toggle: Toggle,
		transactionsStore: Transaction,
		selectedAccount: SelectedAcount,
		multisig: Multisig,
		contributors: Contributors,
		network: Network,
		requests: Requests,
		masspay: Masspay,
		accountstats: Stats,
		payInputs: PayInputs,
		[RemoxApi.reducerPath]: RemoxApi.reducer,
		[BlockScoutApi.reducerPath]: BlockScoutApi.reducer,
	},
	middleware: (getDefaultMiddleware) =>
		getDefaultMiddleware({ serializableCheck: false }).concat(BlockScoutApi.middleware, RemoxApi.middleware)
});

export type RootState = ReturnType<typeof store.getState>;

export type AppDispatch = typeof store.dispatch;

export default store;
