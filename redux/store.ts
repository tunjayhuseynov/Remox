import { configureStore } from '@reduxjs/toolkit';
import Notification from './slices/notificationSlice';
import Storage from './slices/account/storage';
import Unlock from './slices/unlock';
import Currency from './slices/currencies';
import Transaction from './slices/account/transactions';
import SelectedAcount from './slices/account/selectedAccount';
import Multisig from './slices/account/multisig';
import Contributors from './slices/account/contributors';
import Requests from './slices/requests';
import Tags from './slices/tags';
import Moola from './slices/moola';
import Network from './slices/account/network';
import Masspay from './slices/masspay';
import Stats from './slices/account/accountstats';
import PayInputs from './slices/payinput';
import Budgets from './slices/account/budgets';
import RemoxData from './slices/account/remoxData';
import SubInputs from './slices/subinput';
import SplitInputs from './slices/split';
import { BlockScoutApi, RemoxApi } from './api';

const store = configureStore({
	reducer: {
		remoxData: RemoxData,
		tags: Tags,
		budgets: Budgets,
		currencyandbalance: Currency,
		notification: Notification,
		storage: Storage,
		unlock: Unlock,
		moola: Moola,
		transactionsStore: Transaction,
		selectedAccount: SelectedAcount,
		multisig: Multisig,
		contributors: Contributors,
		network: Network,
		requests: Requests,
		masspay: Masspay,
		accountstats: Stats,
		payInputs: PayInputs,
		subInputs:SubInputs,
		splitInputs:SplitInputs,
		[RemoxApi.reducerPath]: RemoxApi.reducer,
		[BlockScoutApi.reducerPath]: BlockScoutApi.reducer,
	},
	middleware: (getDefaultMiddleware) =>
		getDefaultMiddleware({ serializableCheck: false }).concat(BlockScoutApi.middleware, RemoxApi.middleware)
});

export type RootState = ReturnType<typeof store.getState>;

export type AppDispatch = typeof store.dispatch;

export default store;
