import { createSlice } from '@reduxjs/toolkit';
import { Tag } from 'apiHooks/useTags';
import { RootState } from '../store';

interface IContainer {
	tags: Tag[];
}

const initialState: IContainer = {
	tags: []
};

export const tagSlice = createSlice({
	name: 'tag',
	initialState: initialState,
	reducers: {
		setTags: (state, action: { payload: Tag[] }) => {
			state.tags = action.payload;
		}
	}
});

export const { setTags } = tagSlice.actions;

export const selectTags = (state: RootState) => state.tags.tags;

export default tagSlice.reducer;
