import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'
import { BaseUrl } from '../../utils/const'
import { AddOwner, AddOwnerResponse, ChangeRequiremnt, ChangeRequiremntResponse, CustomerCreate, CustomerCreateResponse, GetCustomer, GetRequiredSignatures, GetRequiredSignaturesResponse, MultisigBalance, MultisigBalanceResponse, NonExecTransaction, NonExecTransactionItem, NonExecTransactionResponse, RecTransaction, RecTransactionResponse, ReplaceOwner, SubmitTrasaction, SubmitTrasactionResponse } from '../../types/sdk'
import { RootState } from '../store';
import { method } from 'lodash';

export const multisigAPI = createApi({
    reducerPath: 'multisigAPI',
    keepUnusedDataFor: 0,
    baseQuery: fetchBaseQuery({
        baseUrl: BaseUrl,
        prepareHeaders: (headers, { getState }) => {
            const token = (getState() as RootState).storage?.user?.token;
            if (token) {
                headers.set('Authorization', `Bearer ${token}`);
            }
            return headers;
        },
        mode: 'cors',
    }),
    endpoints: (builder) => ({

        getMultisigBalance: builder.query<MultisigBalanceResponse, MultisigBalance>({
            query: (data) => ({
                url: '/multisig/balance/' + data.address,
            })
        }),

        //MULTISIG
        importAddress: builder.mutation<{ result: { address: string } }, { multisigAddress: string }>({
            query: (data) => ({
                url: '/multisig/importAddress',
                method: 'POST',
                body: data
            }),
        }),
        createAddress: builder.mutation<{ multiSigAddress: { address: string } }, { phrase: string, owners: string[], required: number, internalRequired: number }>({
            query: (data) => ({
                url: '/multisig/createMultisig',
                method: 'POST',
                body: data
            })
        }),
        getMultisigAddresses: builder.query<{ addresses: Array<{ address: string }> }, void>({
            query: () => ({
                url: '/multisig/addresses',
            })
        }),
        removeMultisigAddress: builder.mutation<{ message: string }, { address: string }>({
            query: (data) => ({
                url: '/multisig/removeAddress/' + data.address,
                method: 'DELETE',
            })
        }),


        //OWNERS
        getOwners: builder.query<string[], { address: string }>({
            query: (data) => ({
                url: '/multisig/owners/' + data.address,
            })
        }),
        addOwner: builder.mutation<AddOwnerResponse, AddOwner>({
            query: (data) => ({
                url: '/multisig/addOwner',
                method: 'POST',
                body: data
            })
        }),
        removeOwner: builder.mutation<AddOwnerResponse, AddOwner>({
            query: (data) => ({
                url: '/multisig/removeOwner',
                method: 'DELETE',
                body: data
            })
        }),
        replaceOwner: builder.mutation<AddOwnerResponse, ReplaceOwner>({
            query: (data) => ({
                url: '/multisig/replaceOwner',
                method: 'PATCH',
                body: data
            })
        }),



        // Settings
        getRequiredSignatures: builder.query<GetRequiredSignaturesResponse, GetRequiredSignatures>({
            query: (data) => ({
                url: '/multisig/required/' + data.address,
            })
        }),
        changeRequiredSignatures: builder.mutation<ChangeRequiremntResponse, ChangeRequiremnt>({
            query: (data) => ({
                url: '/multisig/changeRequirement',
                method: 'PATCH',
                body: data
            })
        }),
        chnageInternalRequiredSignatures: builder.mutation<ChangeRequiremntResponse, ChangeRequiremnt>({
            query: (data) => ({
                url: '/multisig/changeInternalRequirement',
                method: 'PATCH',
                body: data
            })
        }),


        //Transactions
        submitTransactions: builder.mutation<SubmitTrasactionResponse, SubmitTrasaction>({
            query: (data) => ({
                url: '/multisig/submitTransaction',
                method: 'POST',
                body: data
            })
        }),
        revokeTransactions: builder.mutation<RecTransactionResponse, RecTransaction>({
            query: (data) => ({
                url: '/multisig/revokeTransaction',
                method: 'PATCH',
                body: data
            })
        }),
        confirmTransactions: builder.mutation<RecTransactionResponse, RecTransaction>({
            query: (data) => ({
                url: '/multisig/confirmTransaction',
                method: 'PATCH',
                body: data
            })
        }),
        executeTransactions: builder.mutation<RecTransactionResponse, RecTransaction>({
            query: (data) => ({
                url: '/multisig/executeTransaction',
                method: 'PATCH',
                body: data
            })
        }),
        getMultisigTransaction: builder.query<{ txResult: NonExecTransactionItem }, NonExecTransaction & { id: string }>({
            query: (data) => ({
                url: '/multisig/transaction/' + data.address + `/${data.id}`,
            })
        }),
        getNotExecutedTransactions: builder.query<NonExecTransactionResponse, NonExecTransaction>({
            query: (data) => ({
                url: '/multisig/transactions/' + data.address,
            })
        }),
        getTransactionsByPagination: builder.query<NonExecTransactionResponse, NonExecTransaction & { skip: number, take: number }>({
            query: (data) => ({
                url: '/multisig/transactions/' + data.address + `/${data.skip}/${data.take}`,
            })
        }),
        getAllTransactions: builder.query<{ transactions: NonExecTransactionItem[] }, NonExecTransaction>({
            query: (data) => ({
                url: '/multisig/allTransactions/' + data.address,
                transformResponse: (response: { data: { transactions: NonExecTransactionItem[] } }) => {
                    response.data.transactions.forEach((item, index) => {
                        item.id = index;
                    })

                    return response;
                }
            })
        })
    }),
})


export const {
    useGetTransactionsByPaginationQuery, useLazyGetTransactionsByPaginationQuery,
    useGetAllTransactionsQuery, useLazyGetAllTransactionsQuery,
    useCreateAddressMutation, useGetMultisigTransactionQuery, useLazyGetMultisigTransactionQuery,
    useGetMultisigBalanceQuery, useLazyGetMultisigBalanceQuery,
    useImportAddressMutation, useAddOwnerMutation, useChangeRequiredSignaturesMutation,
    useChnageInternalRequiredSignaturesMutation, useConfirmTransactionsMutation,
    useExecuteTransactionsMutation, useGetMultisigAddressesQuery,
    useGetNotExecutedTransactionsQuery, useGetOwnersQuery, useGetRequiredSignaturesQuery,
    useLazyGetMultisigAddressesQuery, useLazyGetNotExecutedTransactionsQuery, useLazyGetOwnersQuery,
    useLazyGetRequiredSignaturesQuery, useRemoveMultisigAddressMutation, useRemoveOwnerMutation,
    useReplaceOwnerMutation, useRevokeTransactionsMutation, useSubmitTransactionsMutation } = multisigAPI