import { ITag } from "pages/api/tags";
import { IRemoxData } from "../remoxData";

export default {
    setTags: (state: IRemoxData, action: { payload: ITag[] }) => {
        state.tags = action.payload;
    },
    addTag: (state: IRemoxData, action: { payload: ITag }) => {
        state.tags = [...state.tags, action.payload];
    },
    removeTag: (state: IRemoxData, action: { payload: string }) => {
        state.tags = state.tags.filter(tag => tag.id !== action.payload);
    },
    updateTag: (state: IRemoxData, action: { payload: ITag }) => {
        state.tags = state.tags.map(tag => {
            if (tag.id === action.payload.id) {
                return action.payload;
            }
            return tag;
        });
    },
    addTransactionHashToTag: (state: IRemoxData, action: { payload: { tagId: string; transactionId: string } }) => {
        const tagIndex = state.tags.findIndex(tag => tag.id === action.payload.tagId);
        if (tagIndex === -1) {
            state.tags[tagIndex].transactions = [...state.tags[tagIndex].transactions, action.payload.transactionId];
        }
    },
    removeTransactionHashFromTag: (state: IRemoxData, action: { payload: { tagId: string; transactionId: string } }) => {
        const tagIndex = state.tags.findIndex(tag => tag.id === action.payload.tagId);
        if (tagIndex === -1) {
            state.tags[tagIndex].transactions = state.tags[tagIndex].transactions.filter(
                transactionId => transactionId !== action.payload.transactionId
            );
        }
    }
}