import { createSlice } from '@reduxjs/toolkit';
import { ITag } from 'pages/api/tags/index.api';
import { RootState } from '../store';

interface IContainer {
	tags: ITag[];
}

const initialState: IContainer = {
	tags: []
};

export const tagSlice = createSlice({
	name: 'tag',
	initialState: initialState,
	reducers: {
		setTags: (state, action: { payload: ITag[] }) => {
			state.tags = action.payload;
		}
	}
});

export const { setTags } = tagSlice.actions;

export const selectTags = (state: RootState) => state.tags.tags;

export default tagSlice.reducer;
