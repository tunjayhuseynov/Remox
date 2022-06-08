import { createSlice } from '@reduxjs/toolkit';
import { IMember } from 'rpcHooks/useContributors';
import { IRequest } from 'rpcHooks/useRequest';
import { RootState } from '../store';

const initialState: { memberList: IMember[] | IRequest[], request?: boolean } = {
    memberList: [],
    request: false
};

export const masspaySlice = createSlice({
    name: 'masspays',
    initialState: initialState,
    reducers: {
        setMemberList: (state, action: { payload: { data: IMember[]; request?: boolean } }) => {
            if (action.payload.data !== undefined) {
                state.memberList = action.payload.data;
                if (action.payload.request !== undefined) {
                    state.request = action.payload.request;
                }
            }
        },

    }
});

export const { setMemberList } = masspaySlice.actions;

export const selectMasspay = (state: RootState) => state.masspay;

export default masspaySlice.reducer;
