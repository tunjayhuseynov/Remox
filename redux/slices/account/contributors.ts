import { createSlice } from '@reduxjs/toolkit';
import { IuseContributor } from 'rpcHooks/useContributors';
import { decryptMessage } from 'utils/hashing';
import { RootState } from '../../store';

export interface IContributorState { contributors: IuseContributor[]; isFetched: boolean; }

const initialState: IContributorState = {
	contributors: [],
	isFetched: false,
};

export const contributorSlice = createSlice({
	name: 'contributors',
	initialState: initialState,
	reducers: {
		addContributor: (state: IContributorState, action: { payload: IuseContributor[] }) => {
			if (action.payload !== undefined) {
				state.contributors.push(...action.payload);
			}
		},
		setContributors: (state: IContributorState, action: { payload: { data: IuseContributor[]; secretKey?: string } }) => {
			if (action.payload.secretKey !== undefined) {
				const teams = action.payload.data.map((contributor) => ({
					...contributor
				}));
				state.contributors = teams;
				if (!state.isFetched) {
					state.isFetched = true;
				}
			}
		},
		removeContributor: (state: IContributorState, action: { payload: string }) => {
			if (action.payload !== undefined) {
				state.contributors = state.contributors.filter((contributor) => contributor.id !== action.payload);
			}
		}
	}
});

export const { addContributor, setContributors, removeContributor } = contributorSlice.actions;

export const selectContributors = (state: RootState) => state.contributors;

export default contributorSlice.reducer;
