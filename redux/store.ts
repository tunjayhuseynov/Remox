import { configureStore } from '@reduxjs/toolkit';
import Notification from './slices/notificationSlice';
import Storage from './slices/account/storage';
import Unlock from './slices/unlock';
import Currency from './slices/account/reducers/currencies';
import Transaction from './slices/account/transactions';
import Requests from './slices/requests';
import Tags from './slices/tags';
import Moola from './slices/lending';
import Masspay from './slices/masspay';
import PayInputs from './slices/payinput';
import RemoxData from './slices/account/remoxData';
import SubInputs from './slices/subinput';
import SplitInputs from './slices/split';
import { BlockScoutApi, RemoxApi } from './api';

const store = configureStore({
	reducer: {
		remoxData: RemoxData,
		tags: Tags,
		notification: Notification,
		storage: Storage,
		unlock: Unlock,
		moola: Moola,
		transactionsStore: Transaction,
		requests: Requests,
		masspay: Masspay,
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
