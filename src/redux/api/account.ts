import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'
import { BaseUrl } from '../../utils/const'
import { AccountCreate, AccountCreateResponse, AccountExist, AccountExistResponse, AccountInfo, CreatePassword, CreatePasswordResponse, Signin, SigninResponse, Unlock, UnlockResponse } from '../../types/sdk'
import { RootState } from '../store';

export const accountAPI = createApi({
    reducerPath: 'accountAPI',
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
        signIn: builder.mutation<SigninResponse, Signin>({
            query: (data) => ({
                url: '/account/signin',
                method: 'POST',
                body: data
            }),
        }),

        accountCreate: builder.mutation<AccountCreateResponse, AccountCreate>({
            query: (data) => ({
                url: `/account/create`,
                method: 'POST',
                body: data
            })
        }),

        createPassword: builder.mutation<CreatePasswordResponse, CreatePassword>({
            query: (data) => ({
                url: `/account/createPassword`,
                method: 'POST',
                body: data
            })
        }),

        accountExist: builder.mutation<AccountExistResponse, AccountExist>({
            query: (data) => ({
                url: `/account/isExist`,
                method: 'POST',
                body: data
            })
        }),

        unlock: builder.mutation<UnlockResponse, Unlock>({
            query: (data) => ({
                url: `/account/reLogin`,
                method: 'POST',
                body: data
            })
        }),

        putAccountInfo: builder.mutation<void, AccountInfo>({
            query: (data) => ({
                url: `/account`,
                method: 'PUT',
                body: data
            })
        }),
        setTime: builder.mutation<void, { time: string }>({
            query: (data) => ({
                url: `/account/setTime`,
                method: 'PATCH',
                body: data
            })
        }),
        getTime: builder.query<{ date: string }, void>({
            query: () => ({
                url: `/account/time`,
            })
        }),
        getDetails: builder.query<{ result: { userName: string, surname: string, companyName: string } }, void>({
            query: () => ({
                url: `/account/details`,
            })
        })
    }),
})


export const { useLazyGetTimeQuery, useGetDetailsQuery, useLazyGetDetailsQuery, useSetTimeMutation, useSignInMutation, useAccountCreateMutation, useCreatePasswordMutation, useAccountExistMutation, useUnlockMutation, usePutAccountInfoMutation } = accountAPI