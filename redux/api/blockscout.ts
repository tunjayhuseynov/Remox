import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { GetTransactions } from '../../types/sdk';


export const BlockScoutApi = createApi({
	baseQuery: fetchBaseQuery({
		baseUrl: 'https://explorer.celo.org/api'
	}),
	endpoints: (builder) => ({
		getTransactions: builder.query<GetTransactions, string>({
			query: (data) => ({
				url: `?module=account&action=tokentx&address=`+data
			})
		}),
		getTransactionBuHash: builder.query<GetTransactions, string>({
			query: (data) => ({
				url: `?module=transaction&action=gettxinfo&txhash=`+data
			})
		})
	})
});

export const { useGetTransactionsQuery, useLazyGetTransactionsQuery, useLazyGetTransactionBuHashQuery, useGetTransactionBuHashQuery } = BlockScoutApi;
