import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/dist/query/react";
import { IBudgetExercise } from "firebaseConfig";
import { IFormattedTransaction } from "hooks/useTransactionProcess";
import { IPriceResponse } from "pages/api/calculation/price";
import { ISpendingResponse } from "pages/api/calculation/spending";
import { IOrganizationORM } from "types/orm";

interface Params { addresses: string[], blockchain: string, authId?: string }

export const RemoxApi = createApi({
    reducerPath: 'remoxapi',
    baseQuery: fetchBaseQuery({
        baseUrl: '/'
    }),
    endpoints: (builder) => ({
        getAccountTransactions: builder.query<IFormattedTransaction[], Params>({
            query: (data) => ({
                url: `api/transactions?addresses[]=${data.addresses.join('&addresses[]=')}&blockchain=${data.blockchain}&id=${data.authId}`,
            })
        }),
        getAccountBalancePrice: builder.query<IPriceResponse, Omit<Params, "authId">>({
            query: (data) => ({
                url: `api/calculation/price?addresses[]=${data.addresses.join('&addresses[]=')}&blockchain=${data.blockchain}`,
            })
        }),
        getAccountSpending: builder.query<ISpendingResponse, Params>({
            query: (data) => ({
                url: `api/calculation/spending?addresses[]=${data.addresses.join('&addresses[]=')}&blockchain=${data.blockchain}&id=${data.authId}`,
            })
        }),
        getAccountBudget: builder.query<IBudgetExercise[], Params>({
            query: (data) => ({
                url: `api/budget?addresses[]=${data.addresses.join('&addresses[]=')}&blockchain=${data.blockchain}&id=${data.authId}`,
            })
        }),
        getOrganization: builder.query<IOrganizationORM, { orgId: string }>({
            query: (data) => ({
                url: `api/organization?id=${data.orgId}`,
            })
        }),
        getOrganizations: builder.query<IOrganizationORM[], { member: string }>({
            query: (data) => ({
                url: `api/organization/multiple?member=${data.member}`,
            })
        }),
    })
})


export const { 
    useLazyGetAccountTransactionsQuery, 
    useLazyGetAccountBalancePriceQuery, 
    useLazyGetAccountSpendingQuery,
    useLazyGetAccountBudgetQuery,
    useLazyGetOrganizationQuery,
    useLazyGetOrganizationsQuery,
} = RemoxApi