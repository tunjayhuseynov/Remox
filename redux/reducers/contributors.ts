import { createSlice } from '@reduxjs/toolkit';
import { IuseContributor } from 'apiHooks/useContributors';
import { decryptMessage } from 'utils/hashing';
import { RootState } from '../store';

const initialState: { contributors: IuseContributor[]; isFetched: boolean;  } = {
	contributors: [],
	isFetched: false,
};

export const contributorSlice = createSlice({
	name: 'contributors',
	initialState: initialState,
	reducers: {
		addContributor: (state, action) => {
			if (action.payload !== undefined) {
				state.contributors.push(...action.payload);
			}
		},
		setContributors: (state, action: { payload: { data: IuseContributor[]; secretKey?: string } }) => {
			if (action.payload.secretKey !== undefined) {
				const teams = action.payload.data.map((contributor) => ({
					...contributor,
					members: contributor.members.map((member) => {
						return {
							...member,
							name: decryptMessage(member.name, action.payload.secretKey),
							amount: decryptMessage(member.amount, action.payload.secretKey),
							secondaryAmount: member.secondaryAmount
								? decryptMessage(member.secondaryAmount, action.payload.secretKey)
								: null,
							address: decryptMessage(member.address, action.payload.secretKey)
						};
					})
				}));
				state.contributors = teams;
				if (!state.isFetched) {
					state.isFetched = true;
				}
			}
		},
		removeContributor: (state, action) => {
			if (action.payload !== undefined) {
				state.contributors = state.contributors.filter((contributor) => contributor.id !== action.payload);
			}
		}
	}
});

export const { addContributor, setContributors, removeContributor } = contributorSlice.actions;

export const selectContributors = (state: RootState) => state.contributors;

export default contributorSlice.reducer;
