import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'
import { GetMinimumAmount, GetMinimumAmountResponse, GetSwap, GetSwapResponse } from '../../types/sdk';
import { BaseUrl } from '../../utils/const'
import { RootState } from '../store';

export const swapAPI = createApi({
    keepUnusedDataFor: 0,
    reducerPath: 'swapApi',
    baseQuery: fetchBaseQuery({
        baseUrl: BaseUrl,
        prepareHeaders: (headers, { getState }) => {
            const token = (getState() as RootState).storage?.user?.token;
            if (token) {
                headers.set('Authorization', `Bearer ${token}`);
            }
            return headers;
        },
    }),
    endpoints: (builder) => ({
        getConvertableTokenAmount: builder.mutation<GetMinimumAmountResponse, GetMinimumAmount>({
            query: (data) => ({
                url: '/transaction/minimumAmountOut',
                method: 'POST',
                body: data
            }),
        }),
        swapCoins: builder.mutation<GetSwapResponse, GetSwap>({
            query: (data) =>({
                url: '/transaction/swap',
                method: 'POST',
                body: data
            })
        })    
    }),
})

export const {useGetConvertableTokenAmountMutation, useSwapCoinsMutation} = swapAPI


