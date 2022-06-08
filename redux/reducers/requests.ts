import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { IRequest, RequestStatus } from 'rpcHooks/useRequest'
import type { RootState } from '../store'


interface IContainer {
    pending: IRequest[],
    approved: IRequest[],
    rejected: IRequest[],
}

const init : IContainer = {
    pending: [],
    approved: [],
    rejected: [],
}

export const RequestSlice = createSlice({
    name: 'requests',
    initialState: init,
    reducers: {
        addRequests: (state: IContainer, action: PayloadAction<IRequest[]>) => {
            state.pending = action.payload.filter(r => r.status === RequestStatus.pending)
            state.approved = action.payload.filter(r => r.status === RequestStatus.approved)
            state.rejected = action.payload.filter(r => r.status === RequestStatus.rejected)
        },
 
    },
})

export const { addRequests } = RequestSlice.actions

export const SelectRequests = (state: RootState) : IContainer => state.requests

export default RequestSlice.reducer